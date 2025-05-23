from fastapi import FastAPI, UploadFile, HTTPException, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from typing import List, Dict, Optional
import pandas as pd
import io
import os
import json
import datetime
import logging
from dotenv import load_dotenv
from prometheus_fastapi_instrumentator import Instrumentator

# Import the excel processor module
import excel_processor
from logging_config import setup_logging

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logging()

# Create FastAPI app
app = FastAPI(
    title="Payroll Pro API",
    description="API for managing payroll data and Excel file processing",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Enable CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Prometheus monitoring
Instrumentator().instrument(app).expose(app, endpoint="/api/metrics", include_in_schema=False)

# In-memory storage
class DataStore:
    def __init__(self):
        self.companies: Dict[str, List[Dict]] = {}

data_store = DataStore()

# Mount static files
try:
    # Check if the dist directory exists (for production)
    if os.path.exists('../dist'):
        app.mount("/", StaticFiles(directory="../dist", html=True), name="static")
    # For local development, check if the dist directory exists in the current directory
    elif os.path.exists('./dist'):
        app.mount("/", StaticFiles(directory="./dist", html=True), name="static")
    logger.info("Static files mounted successfully")
except Exception as e:
    logger.error(f"Error mounting static files: {str(e)}")

@app.get("/api")
async def api_root():
    """Root endpoint providing API information"""
    return JSONResponse({
        "message": "Welcome to Payroll Pro API",
        "version": "1.0.0",
        "endpoints": {
            "POST /api/upload_excel": "Upload Excel file with payroll data",
            "POST /api/upload_excel_by_position": "Upload Excel file using column positions",
            "GET /api/employees": "Get all employees or filter by company",
            "GET /api/companies": "Get list of all companies",
            "GET /api/health": "Health check endpoint",
        },
        "documentation": "/api/docs",
        "redoc": "/api/redoc"
    })

@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "version": "1.0.0"
    }

def clean_column_name(col):
    """Clean column names by removing special characters and converting to lowercase."""
    if pd.isna(col):
        return ''
    return str(col).strip().lower().replace(' ', '_').replace('/', '_').replace('-', '_')

def find_header_row(df: pd.DataFrame) -> int:
    """Find the actual header row containing column names."""
    # Common variations of required column names
    column_patterns = {
        'employee_id': ['card no', 'emp id', 'employee id', 'id', 'emp. id', 'emp_id', 'employee number'],
        'name': ['name', 'employee name', 'emp name', 'emp. name', 'full name'],
        'total': ['total', 'total hours', 'hours', 'working hours', 'hrs', 'total hrs'],
        'overtime': ['ot', 'overtime', 'ot hours', 'extra hours', 'additional hours'],
        'net_salary': ['net salary', 'salary', 'net pay', 'take home', 'net amount', 'net'],
        'bank_account': ['bank account', 'account', 'account no', 'bank ac', 'bank a/c', 'a/c no']
    }

    for idx, row in enumerate(df.iloc[0:15].values):  # Check first 15 rows
        row_values = [str(cell).strip().lower() for cell in row if pd.notna(cell)]
        matches = 0

        for patterns in column_patterns.values():
            if any(pattern in row_values for pattern in patterns):
                matches += 1

        if matches >= 3:  # Reduced required matches from 4 to 3
            return idx

    return 0  # Default to first row if no header found

def get_company_specific_columns(company_name: str) -> Dict[str, str]:
    """Get company-specific column mappings."""
    mappings = {
        'Company1': {
            'employee_id': 'Card No',
            'name': 'NAME',
            'net_salary': 'Bank Transfer'
        },
        'Naps': {
            'employee_id': 'INTER ID',
            'name': 'NAME',
            'net_salary': 'Total Amount'
        },
        'Nayana': {
            'employee_id': 'Employee Code',
            'name': 'Name of the employee',
            'net_salary': 'Net Payable'
        },
        'SG': {
            'employee_id': 'card no',
            'name': 'NAME',
            'net_salary': 'Bank Transfer'
        },
        'Ink': {
            'employee_id': 'Employee Code',
            'name': 'Name of the employee',
            'net_salary': 'Bank Transfer'
        },
        'golden eye': {
            'employee_id': 'Emp Code',
            'name': 'Names',
            'net_salary': 'CTC'
        },
        'Genius': {
            'employee_id': 'Card No',
            'name': 'NAME',
            'net_salary': 'BANK Transfer'
        },
        'Amigo': {
            'employee_id': 'Emp Code',
            'name': 'Names',
            'net_salary': 'Bank Statement'
        }
    }
    return mappings.get(company_name, {})

def parse_excel_sheet(df: pd.DataFrame, company_name: str) -> List[Dict]:
    """Parse a single Excel sheet and extract employee data."""
    try:
        # Print all columns from the DataFrame for debugging
        logger.debug(f"Sheet: {company_name}")
        logger.debug(f"Available columns: {df.columns.tolist()}")

        # Clean column names in DataFrame
        df.columns = df.columns.str.strip()
        logger.debug(f"Cleaned columns: {df.columns.tolist()}")

        # Get mapping for current company
        column_mapping = get_company_specific_columns(company_name)
        if not column_mapping:
            raise ValueError(f"No column mapping found for company: {company_name}")

        logger.info(f"Looking for columns: {list(column_mapping.values())}")

        # Extract data
        employees = []
        for idx, row in df.iterrows():
            try:
                # Skip completely empty rows
                if row.isna().all():
                    continue

                # Convert salary to float, handling common formats
                salary_str = str(row[column_mapping['net_salary']])
                # Remove common currency symbols and commas
                salary_str = salary_str.replace('₹', '').replace(',', '').strip()
                try:
                    salary = float(salary_str) if salary_str else 0
                except ValueError:
                    logger.warning(f"Invalid salary value in row {idx+1}: {salary_str}")
                    continue

                employee = {
                    'employee_id': str(row[column_mapping['employee_id']]).strip(),
                    'name': str(row[column_mapping['name']]).strip(),
                    'net_salary': salary,
                    'hours_worked': 0,
                    'overtime_hours': 0,
                    'bank_account': '',
                    'company': company_name
                }

                # Only add if we have at least an ID/name and valid salary
                if (employee['employee_id'] or employee['name']) and employee['net_salary'] > 0:
                    employees.append(employee)

            except Exception as e:
                logger.warning(f"Error processing row {idx+1}: {str(e)}")
                continue

        if not employees:
            raise ValueError("No valid employee data found in sheet")

        return employees

    except Exception as e:
        logger.error(f"Error parsing sheet {company_name}: {str(e)}")
        raise ValueError(f"Error parsing sheet {company_name}: {str(e)}")

@app.post("/api/upload_excel")
async def upload_excel(file: UploadFile, column_mappings: Optional[str] = None):
    """Upload and process Excel file with multiple company sheets."""
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=400,
            detail="Only Excel files (.xlsx, .xls) are allowed"
        )

    try:
        logger.info(f"Processing Excel file: {file.filename}")
        contents = await file.read()
        # Use pandas options to preserve float precision
        with pd.option_context('display.float_format', '{:.10f}'.format):
            excel_file = pd.ExcelFile(io.BytesIO(contents))

        if not excel_file.sheet_names:
            raise HTTPException(
                status_code=400,
                detail="The Excel file contains no sheets"
            )

        # ALWAYS use column mappings if provided
        mappings = {}
        if column_mappings:
            try:
                mappings = json.loads(column_mappings)
                logger.info(f"Using column mappings: {mappings}")
                # Use the excel_processor to process the file with column positions
                return excel_processor.process_excel_file_by_position(excel_file, mappings)
            except json.JSONDecodeError:
                logger.warning("Invalid column mappings format")
                # Continue with standard processing
                pass
        else:
            # If no column mappings provided, use default mappings
            mappings = {
                # Default mapping for all sheets based on actual Excel structure
                'default': {
                    'employee_id': 0,     # Column 1 (0-based: 0) - Card No (GO1529)
                    'name': 1,            # Column 2 (0-based: 1) - Name (ASHOK KUMAR N V)
                    'attendance': 2,      # Column 3 (0-based: 2) - Total days attended (22.0)
                    'net_salary': 3,      # Column 4 (0-based: 3) - Basic Rate (daily salary)
                    'daily_allowance': 4, # Column 5 (0-based: 4) - Daily Allowance
                    'nh_fh_days': 5,     # Column 6 (0-based: 5) - NH/FH days
                    'ot_days': 6,        # Column 7 (0-based: 6) - OT days
                    'uniform_deduction': 7, # Column 8 (0-based: 7) - Uniform Deduction
                    'pt': 8,             # Column 9 (0-based: 8) - Professional Tax (PT)
                    'lwf_employee_bool': 9, # Column 10 (0-based: 9) - LWF40 (boolean)
                    'lwf_employer_bool': 10  # Column 11 (0-based: 10) - LWF60 (boolean)
                }
            }
            logger.info(f"Using default column mappings: {mappings}")
            # Use the excel_processor to process the file with column positions
            return excel_processor.process_excel_file_by_position(excel_file, mappings)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing Excel file: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=400,
            detail=f"Error processing Excel file: {str(e)}"
        )

@app.post("/api/upload_excel_by_position")
async def upload_excel_by_position(file: UploadFile, column_mappings: Optional[str] = Form(None), month: Optional[str] = Form(None)):
    """Upload and process Excel file using column positions instead of column names."""
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=400,
            detail="Only Excel files (.xlsx, .xls) are allowed"
        )

    try:
        logger.info(f"Processing Excel file by position: {file.filename}")
        # Parse column mappings from JSON string
        mappings = {}
        if column_mappings:
            try:
                mappings = json.loads(column_mappings)
                logger.info(f"Using column mappings: {mappings}")
            except json.JSONDecodeError:
                logger.error("Invalid column mappings format")
                raise HTTPException(
                    status_code=400,
                    detail="Invalid column mappings format"
                )

        contents = await file.read()
        # Use pandas options to preserve float precision
        with pd.option_context('display.float_format', '{:.10f}'.format):
            excel_file = pd.ExcelFile(io.BytesIO(contents))

        if not excel_file.sheet_names:
            raise HTTPException(
                status_code=400,
                detail="The Excel file contains no sheets"
            )

        # Process the Excel file using column positions
        processed_data = excel_processor.process_excel_file_by_position(excel_file, mappings)

        # Add month information if provided
        if month:
            logger.info(f"Adding month information: {month}")
            processed_data["month"] = month

            # Add month to each employee record
            for company in processed_data["companies"]:
                for employee in company["employees"]:
                    employee["month"] = month

        return processed_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing Excel file: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=400,
            detail=f"Error processing Excel file: {str(e)}"
        )

@app.get("/api/employees")
async def get_employees(company_id: Optional[str] = None):
    try:
        if company_id:
            if company_id not in data_store.companies:
                logger.warning(f"Company not found: {company_id}")
                raise HTTPException(status_code=404, detail="Company not found")
            return data_store.companies[company_id]

        # If no company_id specified, return all employees
        all_employees = []
        for employees in data_store.companies.values():
            all_employees.extend(employees)
        return all_employees

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving employees: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/companies")
async def get_companies():
    try:
        companies = []
        for company_name, employees in data_store.companies.items():
            companies.append({
                "id": company_name,
                "name": company_name,
                "employee_count": len(employees),
                "total_salary": sum(emp['net_salary'] for emp in employees),
                "total_overtime": sum(emp['overtime_hours'] for emp in employees)
            })
        return companies

    except Exception as e:
        logger.error(f"Error retrieving companies: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/clear-data")
async def clear_data():
    """Clear all data from the in-memory database"""
    try:
        # Clear the companies dictionary
        data_store.companies.clear()
        logger.info("All data has been cleared successfully")
        return {"message": "All data has been cleared successfully"}
    except Exception as e:
        logger.error(f"Error clearing data: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error clearing data: {str(e)}")

@app.get('/favicon.ico', include_in_schema=False)
async def favicon():
    """Serve favicon"""
    return FileResponse(os.path.join('static', 'favicon.ico'))

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment variable
    port = int(os.getenv("PORT", 8000))
    
    # Get debug mode from environment variable
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    logger.info(f"Starting server on port {port}, debug mode: {debug}")
    
    uvicorn.run(
        "main_production:app", 
        host="0.0.0.0", 
        port=port,
        reload=debug,
        log_level=os.getenv("LOG_LEVEL", "info").lower()
    )
