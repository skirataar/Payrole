import pandas as pd
import numpy as np
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from payroll_models import Employee, AttendanceRecord, PayrollEntry

# Constants for calculations
VDA_RATE = 100.0  # VDA rate per day
OT_RATE_MULTIPLIER = 2.0  # Overtime rate multiplier (2x of basic hourly rate)
ESI_THRESHOLD = 21000.0  # ESI applies only if gross salary <= 21000
PT_SLABS = {
    10000: 0,      # No PT if salary <= 10000
    15000: 150,    # PT = 150 if 10000 < salary <= 15000
    20000: 200,    # PT = 200 if 15000 < salary <= 20000
    float('inf'): 300  # PT = 300 if salary > 20000
}

def calculate_payroll(
    db: Session,
    employee_id: str,
    month: datetime,
    days_worked: int,
    ot_hours: float,
    allowance: float = 0.0,
    bonus: float = 0.0,
    ppe_cost: float = 0.0,
    uniform: float = 0.0,
    lwf_40_flag: bool = True,
    lwf_60_flag: bool = True
) -> Optional[PayrollEntry]:
    """
    Calculate payroll for an employee based on attendance and other inputs
    """
    # Get employee details
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        return None
    
    # Create a new payroll entry
    payroll = PayrollEntry(
        employee_id=employee_id,
        name=employee.name,
        report_month=month,
        days_worked=days_worked,
        ot_hours=ot_hours,
        allowance=allowance,
        bonus=bonus,
        ppe_cost=ppe_cost,
        uniform=uniform,
        lwf_40_flag=lwf_40_flag,
        lwf_60_flag=lwf_60_flag
    )
    
    # Calculate basic salary
    payroll.basic = round(employee.basic_rate * days_worked, 2)
    
    # Calculate VDA
    payroll.vda = round(days_worked * VDA_RATE, 2)
    
    # Calculate overtime wages
    hourly_rate = employee.basic_rate / 8  # Assuming 8 hours per day
    payroll.ot_wages = round(ot_hours * hourly_rate * OT_RATE_MULTIPLIER, 2)
    
    # Calculate gross salary
    payroll.gross_salary = round(
        payroll.basic + payroll.vda + payroll.allowance + 
        payroll.ot_wages + payroll.bonus + payroll.ppe_cost, 
        2
    )
    
    # Calculate ESI employee contribution (0.75%)
    if payroll.gross_salary <= ESI_THRESHOLD:
        payroll.esi_employee = round(payroll.gross_salary * 0.0075, 2)
    else:
        payroll.esi_employee = 0.0
    
    # Calculate PF employee contribution (12%)
    payroll.pf_employee = round(payroll.basic * 0.12, 2)
    
    # Calculate PT based on slabs
    for threshold, amount in sorted(PT_SLABS.items()):
        if payroll.gross_salary <= threshold:
            payroll.pt = amount
            break
    
    # Calculate LWF employee contribution
    payroll.lwf_40 = 40.0 if payroll.lwf_40_flag else 0.0
    
    # Calculate total deductions
    payroll.deduction_total = round(
        payroll.esi_employee + payroll.pf_employee + 
        payroll.pt + payroll.uniform + payroll.lwf_40,
        2
    )
    
    # Calculate net salary
    payroll.net_salary = round(payroll.gross_salary - payroll.deduction_total, 2)
    
    # Calculate ESI employer contribution (3.25%)
    if payroll.gross_salary <= ESI_THRESHOLD:
        payroll.esi_employer = round(payroll.gross_salary * 0.0325, 2)
    else:
        payroll.esi_employer = 0.0
    
    # Calculate PF employer contribution (13%)
    payroll.pf_employer = round(payroll.basic * 0.13, 2)
    
    # Calculate LWF employer contribution
    payroll.lwf_60 = 60.0 if payroll.lwf_60_flag else 0.0
    
    # Calculate CTC
    payroll.ctc = round(
        payroll.net_salary + payroll.esi_employer + 
        payroll.pf_employer + payroll.lwf_60,
        2
    )
    
    return payroll

def calculate_bulk_payroll(
    db: Session,
    attendance_data: List[Dict[str, Any]]
) -> List[PayrollEntry]:
    """
    Calculate payroll for multiple employees based on attendance data
    """
    payroll_entries = []
    
    # Convert to pandas DataFrame for vectorized calculations
    df = pd.DataFrame(attendance_data)
    
    # Process each row
    for _, row in df.iterrows():
        payroll = calculate_payroll(
            db=db,
            employee_id=row['employee_id'],
            month=row['month'],
            days_worked=row['days_worked'],
            ot_hours=row['ot_hours'],
            allowance=row.get('allowance', 0.0),
            bonus=row.get('bonus', 0.0),
            ppe_cost=row.get('ppe_cost', 0.0),
            uniform=row.get('uniform', 0.0),
            lwf_40_flag=row.get('lwf_40_flag', True),
            lwf_60_flag=row.get('lwf_60_flag', True)
        )
        
        if payroll:
            payroll_entries.append(payroll)
    
    return payroll_entries

def process_excel_attendance(
    db: Session,
    file_content: bytes,
    month: datetime
) -> List[PayrollEntry]:
    """
    Process Excel file with attendance data and calculate payroll
    """
    try:
        # Read Excel file
        df = pd.read_excel(file_content)
        
        # Clean column names
        df.columns = [col.lower().strip().replace(' ', '_') for col in df.columns]
        
        # Ensure required columns exist
        required_columns = ['employee_id', 'days_worked', 'ot_hours']
        for col in required_columns:
            if col not in df.columns:
                raise ValueError(f"Required column '{col}' not found in Excel file")
        
        # Convert to list of dictionaries
        attendance_data = []
        for _, row in df.iterrows():
            # Skip rows with no employee_id
            if pd.isna(row['employee_id']):
                continue
                
            # Create attendance record
            attendance = {
                'employee_id': str(row['employee_id']),
                'month': month,
                'days_worked': int(row['days_worked']) if not pd.isna(row['days_worked']) else 0,
                'ot_hours': float(row['ot_hours']) if not pd.isna(row['ot_hours']) else 0.0
            }
            
            # Add optional fields if present
            optional_fields = ['allowance', 'bonus', 'ppe_cost', 'uniform', 'lwf_40_flag', 'lwf_60_flag']
            for field in optional_fields:
                if field in df.columns and not pd.isna(row[field]):
                    if field.endswith('_flag'):
                        # Convert to boolean
                        attendance[field] = bool(row[field])
                    else:
                        # Convert to float
                        attendance[field] = float(row[field])
            
            attendance_data.append(attendance)
        
        # Calculate payroll for all attendance records
        payroll_entries = calculate_bulk_payroll(db, attendance_data)
        
        return payroll_entries
    
    except Exception as e:
        raise Exception(f"Error processing Excel file: {str(e)}")
