from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
import pandas as pd
import uuid

from .database import get_db
from .updated_payroll_models import Company, Employee, AttendanceRecord, PayrollEntry
from .company_auth import get_current_company_id, get_company_filter, admin_required, TokenData

router = APIRouter()

# Company management endpoints (admin only)
@router.get("/companies", response_model=List[dict])
async def get_all_companies(
    db: Session = Depends(get_db),
    token_data: TokenData = Depends(admin_required)
):
    """Get all companies (admin only)"""
    companies = db.query(Company).all()
    return [company.to_dict() for company in companies]

@router.post("/companies", response_model=dict)
async def create_company(
    name: str,
    subscription_plan: str = "basic",
    db: Session = Depends(get_db),
    token_data: TokenData = Depends(admin_required)
):
    """Create a new company (admin only)"""
    # Check if company with this name already exists
    existing = db.query(Company).filter(Company.name == name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company with this name already exists"
        )
    
    # Create new company
    company = Company(
        id=str(uuid.uuid4()),
        name=name,
        subscription_plan=subscription_plan
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company.to_dict()

# Employee endpoints with company isolation
@router.get("/employees", response_model=List[dict])
async def get_employees(
    db: Session = Depends(get_db),
    company_filter = Depends(get_company_filter)
):
    """Get all employees for the current company"""
    employees = db.query(Employee).filter(company_filter(Employee)).all()
    return [employee.to_dict() for employee in employees]

@router.post("/employees", response_model=dict)
async def create_employee(
    employee_id: str,
    name: str,
    basic_rate: float,
    db: Session = Depends(get_db),
    company_id: str = Depends(get_current_company_id)
):
    """Create a new employee for the current company"""
    # Check if employee with this ID already exists in this company
    existing = db.query(Employee).filter(
        Employee.company_id == company_id,
        Employee.employee_id == employee_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee with this ID already exists in this company"
        )
    
    # Create new employee
    employee = Employee(
        company_id=company_id,
        employee_id=employee_id,
        name=name,
        basic_rate=basic_rate
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee.to_dict()

# Attendance record endpoints with company isolation
@router.get("/attendance", response_model=List[dict])
async def get_attendance_records(
    month: Optional[date] = None,
    employee_id: Optional[str] = None,
    db: Session = Depends(get_db),
    company_filter = Depends(get_company_filter)
):
    """Get attendance records for the current company, optionally filtered by month and employee"""
    query = db.query(AttendanceRecord).filter(company_filter(AttendanceRecord))
    
    if month:
        query = query.filter(AttendanceRecord.month == month)
    
    if employee_id:
        query = query.filter(AttendanceRecord.employee_id == employee_id)
    
    records = query.all()
    return [record.to_dict() for record in records]

@router.post("/attendance", response_model=dict)
async def create_attendance_record(
    employee_id: str,
    month: date,
    days_worked: int,
    ot_hours: float = 0.0,
    db: Session = Depends(get_db),
    company_id: str = Depends(get_current_company_id)
):
    """Create a new attendance record for the current company"""
    # Check if employee exists in this company
    employee = db.query(Employee).filter(
        Employee.company_id == company_id,
        Employee.employee_id == employee_id
    ).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found in this company"
        )
    
    # Check if record for this month already exists
    existing = db.query(AttendanceRecord).filter(
        AttendanceRecord.company_id == company_id,
        AttendanceRecord.employee_id == employee_id,
        AttendanceRecord.month == month
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance record for this employee and month already exists"
        )
    
    # Create new attendance record
    record = AttendanceRecord(
        company_id=company_id,
        employee_id=employee_id,
        month=month,
        days_worked=days_worked,
        ot_hours=ot_hours
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record.to_dict()

# Payroll entry endpoints with company isolation
@router.get("/payroll", response_model=List[dict])
async def get_payroll_entries(
    month: Optional[date] = None,
    employee_id: Optional[str] = None,
    db: Session = Depends(get_db),
    company_filter = Depends(get_company_filter)
):
    """Get payroll entries for the current company, optionally filtered by month and employee"""
    query = db.query(PayrollEntry).filter(company_filter(PayrollEntry))
    
    if month:
        query = query.filter(PayrollEntry.report_month == month)
    
    if employee_id:
        query = query.filter(PayrollEntry.employee_id == employee_id)
    
    entries = query.all()
    return [entry.to_dict() for entry in entries]

# Excel upload endpoint with company isolation
@router.post("/upload-excel", response_model=dict)
async def upload_excel(
    file: UploadFile = File(...),
    report_month: str = Form(...),
    db: Session = Depends(get_db),
    company_id: str = Depends(get_current_company_id)
):
    """Upload and process an Excel file for the current company"""
    try:
        # Parse report month
        month_date = datetime.strptime(report_month, "%Y-%m-%d").date()
        
        # Read Excel file
        df = pd.read_excel(file.file)
        
        # Process the data (simplified example)
        # In a real implementation, you would have more complex logic here
        
        # Create payroll entries for each row
        entries_created = 0
        for _, row in df.iterrows():
            # Extract employee data
            employee_id = str(row.get('employee_id', ''))
            name = str(row.get('name', ''))
            days_worked = float(row.get('days_worked', 0))
            
            # Check if employee exists, create if not
            employee = db.query(Employee).filter(
                Employee.company_id == company_id,
                Employee.employee_id == employee_id
            ).first()
            
            if not employee and employee_id and name:
                employee = Employee(
                    company_id=company_id,
                    employee_id=employee_id,
                    name=name,
                    basic_rate=0.0  # Default value, update as needed
                )
                db.add(employee)
                db.commit()
            
            if employee:
                # Create payroll entry
                entry = PayrollEntry(
                    company_id=company_id,
                    employee_id=employee_id,
                    name=name,
                    report_month=month_date,
                    days_worked=days_worked,
                    # Add other fields as needed
                )
                db.add(entry)
                entries_created += 1
        
        db.commit()
        
        return {
            "message": "Excel file processed successfully",
            "entries_created": entries_created
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing Excel file: {str(e)}"
        )
