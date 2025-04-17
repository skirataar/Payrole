# Attendance-Based Payroll System

This system processes employee attendance data, calculates salary components based on days worked and overtime hours, and provides a structured API for the frontend.

## Features

- Manage employees with daily wage rates
- Record attendance (days worked and overtime hours)
- Calculate salary components based on attendance
- Store data in a relational database
- Provide structured JSON API for frontend use

## Database Schema

The system uses SQLAlchemy ORM with three main models:

1. **Employee**
   - `id`: Primary key
   - `employee_id`: Unique identifier
   - `name`: Employee name
   - `basic_rate`: Daily wage rate

2. **AttendanceRecord**
   - `id`: Primary key
   - `employee_id`: Foreign key to Employee
   - `month`: Month of attendance
   - `days_worked`: Number of days worked
   - `ot_hours`: Overtime hours

3. **PayrollEntry**
   - `id`: Primary key
   - `employee_id`: Foreign key to Employee
   - `name`: Employee name (copied from Employee)
   - `report_month`: Month of payroll
   - `days_worked`: Number of days worked
   - `ot_hours`: Overtime hours
   - Salary components: `basic`, `vda`, `allowance`, `ot_wages`, `bonus`, `ppe_cost`, `gross_salary`
   - Deductions: `esi_employee`, `pf_employee`, `pt`, `uniform`, `lwf_40_flag`, `lwf_40`, `deduction_total`
   - Net and CTC: `net_salary`, `esi_employer`, `pf_employer`, `lwf_60_flag`, `lwf_60`, `ctc`

## Calculation Logic

The system implements the following formulas:

- `basic = basic_rate * days_worked`
- `vda = days_worked * vda_rate`
- `ot_wages = ot_hours * (basic_rate / 8) * 2`
- `gross_salary = basic + vda + allowance + ot_wages + bonus + ppe_cost`
- `esi_employee = gross_salary * 0.0075` (if gross_salary <= 21000)
- `pf_employee = basic * 0.12`
- `lwf_40 = 40.0` (if lwf_40_flag is true)
- `deduction_total = esi_employee + pf_employee + pt + uniform + lwf_40`
- `net_salary = gross_salary - deduction_total`
- `esi_employer = gross_salary * 0.0325` (if gross_salary <= 21000)
- `pf_employer = basic * 0.13`
- `lwf_60 = 60.0` (if lwf_60_flag is true)
- `ctc = net_salary + esi_employer + pf_employer + lwf_60`

## Backend Setup

1. Install dependencies:
   ```
   pip install -r requirements_payroll.txt
   ```

2. Run the FastAPI server:
   ```
   uvicorn payroll_api:app --reload
   ```

3. Access the API documentation:
   ```
   http://localhost:5000/docs
   ```

## API Endpoints

### Employee Endpoints
- `POST /employees/`: Create a new employee
- `GET /employees/`: Get all employees
- `GET /employees/{employee_id}`: Get a specific employee
- `PUT /employees/{employee_id}`: Update an employee

### Attendance Endpoints
- `POST /attendance/`: Create/update an attendance record
- `GET /attendance/`: Get attendance records, optionally filtered by employee and month

### Payroll Endpoints
- `POST /payroll/calculate`: Calculate payroll for a single employee
- `POST /payroll/calculate-bulk`: Calculate payroll for multiple employees
- `POST /payroll/upload-excel`: Upload Excel file with attendance data
- `GET /payroll/entries`: Get payroll entries, optionally filtered by employee and month
- `GET /payroll/entries/{entry_id}`: Get a specific payroll entry

## Frontend Integration

The frontend includes:

1. **EmployeeManagement**: For managing employees and their basic rates
2. **AttendanceManagement**: For recording attendance and uploading Excel files
3. **AttendancePayrollReport**: For viewing and filtering payroll data

## Excel File Format

The system expects an Excel file with columns including:

- `employee_id`: Employee identifier
- `days_worked`: Number of days worked
- `ot_hours`: Overtime hours

Optional columns:
- `allowance`: Additional allowance
- `bonus`: Bonus amount
- `ppe_cost`: PPE cost
- `uniform`: Uniform deduction
- `lwf_40_flag`: Whether to apply LWF employee contribution
- `lwf_60_flag`: Whether to apply LWF employer contribution
