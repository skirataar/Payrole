from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import pandas as pd
from pydantic import BaseModel, Field

from payroll_database import get_db, engine
from payroll_models import Base, Employee, AttendanceRecord, PayrollEntry
from payroll_calculator import calculate_payroll, calculate_bulk_payroll, process_excel_attendance

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Attendance-Based Payroll System")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class EmployeeCreate(BaseModel):
    employee_id: str
    name: str
    basic_rate: float

class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    name: str
    basic_rate: float
    created_at: str
    updated_at: str

class AttendanceCreate(BaseModel):
    employee_id: str
    month: date
    days_worked: int
    ot_hours: float = 0.0

class AttendanceResponse(BaseModel):
    id: int
    employee_id: str
    month: str
    days_worked: int
    ot_hours: float
    created_at: str
    updated_at: str

class PayrollCalculateRequest(BaseModel):
    employee_id: str
    month: date
    days_worked: int
    ot_hours: float = 0.0
    allowance: float = 0.0
    bonus: float = 0.0
    ppe_cost: float = 0.0
    uniform: float = 0.0
    lwf_40_flag: bool = True
    lwf_60_flag: bool = True

class PayrollResponse(BaseModel):
    id: Optional[int] = None
    employee_id: str
    name: str
    report_month: str
    days_worked: int
    ot_hours: float
    basic: float
    vda: float
    allowance: float
    ot_wages: float
    bonus: float
    ppe_cost: float
    gross_salary: float
    esi_employee: float
    pf_employee: float
    pt: float
    uniform: float
    lwf_40_flag: bool
    lwf_40: float
    deduction_total: float
    net_salary: float
    esi_employer: float
    pf_employer: float
    lwf_60_flag: bool
    lwf_60: float
    ctc: float
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to Attendance-Based Payroll System API"}

# Employee endpoints
@app.post("/employees/", response_model=EmployeeResponse)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    # Check if employee already exists
    db_employee = db.query(Employee).filter(Employee.employee_id == employee.employee_id).first()
    if db_employee:
        raise HTTPException(status_code=400, detail="Employee ID already registered")
    
    # Create new employee
    db_employee = Employee(
        employee_id=employee.employee_id,
        name=employee.name,
        basic_rate=employee.basic_rate
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    
    return db_employee.to_dict()

@app.get("/employees/", response_model=List[EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).all()
    return [employee.to_dict() for employee in employees]

@app.get("/employees/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return employee.to_dict()

@app.put("/employees/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: str, employee: EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Update employee
    db_employee.name = employee.name
    db_employee.basic_rate = employee.basic_rate
    
    db.commit()
    db.refresh(db_employee)
    
    return db_employee.to_dict()

# Attendance endpoints
@app.post("/attendance/", response_model=AttendanceResponse)
def create_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    # Check if employee exists
    employee = db.query(Employee).filter(Employee.employee_id == attendance.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Check if attendance record already exists for this month
    existing_record = db.query(AttendanceRecord).filter(
        AttendanceRecord.employee_id == attendance.employee_id,
        AttendanceRecord.month == attendance.month
    ).first()
    
    if existing_record:
        # Update existing record
        existing_record.days_worked = attendance.days_worked
        existing_record.ot_hours = attendance.ot_hours
        db.commit()
        db.refresh(existing_record)
        return existing_record.to_dict()
    
    # Create new attendance record
    db_attendance = AttendanceRecord(
        employee_id=attendance.employee_id,
        month=attendance.month,
        days_worked=attendance.days_worked,
        ot_hours=attendance.ot_hours
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    
    return db_attendance.to_dict()

@app.get("/attendance/", response_model=List[AttendanceResponse])
def get_attendance_records(
    employee_id: Optional[str] = None,
    month: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(AttendanceRecord)
    
    if employee_id:
        query = query.filter(AttendanceRecord.employee_id == employee_id)
    
    if month:
        try:
            month_date = datetime.strptime(month, "%Y-%m").date().replace(day=1)
            query = query.filter(AttendanceRecord.month == month_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM")
    
    attendance_records = query.all()
    return [record.to_dict() for record in attendance_records]

# Payroll endpoints
@app.post("/payroll/calculate", response_model=PayrollResponse)
def calculate_single_payroll(
    request: PayrollCalculateRequest,
    db: Session = Depends(get_db)
):
    # Calculate payroll
    payroll = calculate_payroll(
        db=db,
        employee_id=request.employee_id,
        month=request.month,
        days_worked=request.days_worked,
        ot_hours=request.ot_hours,
        allowance=request.allowance,
        bonus=request.bonus,
        ppe_cost=request.ppe_cost,
        uniform=request.uniform,
        lwf_40_flag=request.lwf_40_flag,
        lwf_60_flag=request.lwf_60_flag
    )
    
    if not payroll:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Save to database
    db.add(payroll)
    db.commit()
    db.refresh(payroll)
    
    return payroll.to_dict()

@app.post("/payroll/calculate-bulk", response_model=List[PayrollResponse])
def calculate_bulk_payroll_endpoint(
    attendance_data: List[Dict[str, Any]] = Body(...),
    db: Session = Depends(get_db)
):
    # Calculate payroll for all attendance records
    payroll_entries = calculate_bulk_payroll(db, attendance_data)
    
    # Save to database
    for entry in payroll_entries:
        db.add(entry)
    
    db.commit()
    
    # Refresh to get IDs
    for entry in payroll_entries:
        db.refresh(entry)
    
    return [entry.to_dict() for entry in payroll_entries]

@app.post("/payroll/upload-excel", response_model=List[PayrollResponse])
async def upload_excel_attendance(
    file: UploadFile = File(...),
    month: str = Form(...),
    db: Session = Depends(get_db)
):
    # Validate file type
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only Excel files (.xlsx, .xls) are allowed")
    
    try:
        # Parse month
        try:
            month_date = datetime.strptime(month, "%Y-%m").date().replace(day=1)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM")
        
        # Read file content
        file_content = await file.read()
        
        # Process Excel file
        payroll_entries = process_excel_attendance(db, file_content, month_date)
        
        if not payroll_entries:
            raise HTTPException(status_code=400, detail="No valid attendance records found in the Excel file")
        
        # Save to database
        for entry in payroll_entries:
            db.add(entry)
        
        db.commit()
        
        # Refresh to get IDs
        for entry in payroll_entries:
            db.refresh(entry)
        
        return [entry.to_dict() for entry in payroll_entries]
    
    except Exception as e:
        db.rollback()  # Rollback transaction on error
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/payroll/entries", response_model=List[PayrollResponse])
def get_payroll_entries(
    employee_id: Optional[str] = None,
    month: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PayrollEntry)
    
    if employee_id:
        query = query.filter(PayrollEntry.employee_id == employee_id)
    
    if month:
        try:
            month_date = datetime.strptime(month, "%Y-%m").date().replace(day=1)
            query = query.filter(PayrollEntry.report_month == month_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM")
    
    payroll_entries = query.all()
    return [entry.to_dict() for entry in payroll_entries]

@app.get("/payroll/entries/{entry_id}", response_model=PayrollResponse)
def get_payroll_entry(
    entry_id: int,
    db: Session = Depends(get_db)
):
    entry = db.query(PayrollEntry).filter(PayrollEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Payroll entry not found")
    
    return entry.to_dict()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("payroll_api:app", host="0.0.0.0", port=5000, reload=True)
