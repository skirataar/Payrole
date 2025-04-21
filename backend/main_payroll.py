from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import pandas as pd

from database import get_db, engine
from models import Base, PayrollEntry
from payroll_processor import process_excel_file

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Payroll Processing API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Payroll Processing API"}

@app.post("/upload-payroll")
async def upload_payroll(
    file: UploadFile = File(...),
    report_month: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload an Excel file with payroll data, process it, and save to database
    """
    # Validate file type
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only Excel files (.xlsx, .xls) are allowed")
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Parse report month if provided
        parsed_report_month = None
        if report_month:
            try:
                parsed_report_month = datetime.strptime(report_month, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid report_month format. Use YYYY-MM-DD")
        
        # Process Excel file
        payroll_entries = process_excel_file(file_content, parsed_report_month)
        
        if not payroll_entries:
            raise HTTPException(status_code=400, detail="No valid payroll entries found in the Excel file")
        
        # Save to database
        db_entries = []
        for entry in payroll_entries:
            db_entry = PayrollEntry(**entry)
            db.add(db_entry)
            db_entries.append(db_entry)
        
        # Commit all entries in a single transaction
        db.commit()
        
        # Refresh to get IDs
        for entry in db_entries:
            db.refresh(entry)
        
        # Return processed data
        return [entry.to_dict() for entry in db_entries]
    
    except Exception as e:
        db.rollback()  # Rollback transaction on error
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/payroll-entries")
def get_payroll_entries(
    month: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all payroll entries, optionally filtered by month
    """
    query = db.query(PayrollEntry)
    
    if month:
        try:
            parsed_month = datetime.strptime(month, "%Y-%m").date().replace(day=1)
            # Filter by month and year
            query = query.filter(
                PayrollEntry.report_month >= parsed_month,
                PayrollEntry.report_month < parsed_month.replace(month=parsed_month.month + 1)
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM")
    
    entries = query.all()
    return [entry.to_dict() for entry in entries]

@app.get("/payroll-entries/{entry_id}")
def get_payroll_entry(
    entry_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific payroll entry by ID
    """
    entry = db.query(PayrollEntry).filter(PayrollEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Payroll entry not found")
    
    return entry.to_dict()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_payroll:app", host="0.0.0.0", port=5000, reload=True)
