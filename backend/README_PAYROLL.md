# Payroll Processing System

This system processes Excel payroll sheets, calculates salary components, stores the data in a database, and provides a structured API for the frontend.

## Features

- Upload Excel payroll sheets
- Process salary components with formulas
- Store data in a relational database
- Provide structured JSON API for frontend use

## Backend Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the FastAPI server:
   ```
   uvicorn main_payroll:app --reload
   ```

3. Access the API documentation:
   ```
   http://localhost:5000/docs
   ```

## API Endpoints

- `POST /upload-payroll`: Upload and process an Excel payroll file
- `GET /payroll-entries`: Get all payroll entries, optionally filtered by month
- `GET /payroll-entries/{entry_id}`: Get a specific payroll entry by ID

## Database Schema

The system uses SQLAlchemy ORM with the following model:

- `PayrollEntry`: Stores employee payroll data
  - Employee identifiers: card_no, name, esi, uan
  - Salary components: basic, vda, allowance, bonus, ot_wages, ppe_cost
  - Calculated fields: gross_salary, deduction_total, net_salary, ctc
  - Deductions: esi_employee, pf_employee, uniform_deduction, pt, lwf_employee
  - Employer contributions: esi_employer, pf_employer, lwf_employer
  - Metadata: report_month, created_at, updated_at

## Calculation Logic

The system implements the following formulas:

- `gross_salary = basic + vda + allowance + bonus + ot_wages + ppe_cost`
- `esi_employee = gross_salary * 0.0075` (if gross_salary <= 21000)
- `pf_employee = basic * 0.12`
- `lwf_employee = 40.0`
- `deduction_total = esi_employee + pf_employee + uniform_deduction + pt + lwf_employee`
- `net_salary = gross_salary - deduction_total`
- `esi_employer = gross_salary * 0.0325` (if gross_salary <= 21000)
- `pf_employer = basic * 0.13`
- `lwf_employer = 60.0`
- `ctc = net_salary + esi_employer + pf_employer + lwf_employer`

## Frontend Integration

The frontend includes:

1. PayrollUpload component: For uploading Excel files
2. PayrollReport component: For viewing and filtering payroll data

## Excel File Format

The system expects an Excel file with columns including:

- Employee identifiers: Card No, NAME, ESI, UAN
- Salary components: BASIC, VDA, Allowance, Bonus, OT WAGES, PPE's Cost
- Deductions: E.S.I 0.75%, P.F 12%, Uniform Deduction, P.T, LWF (40rs)
- Employer contributions: E.S.I 3.25%, P.F 13%, LWF (60rs)
- Total fields: NET SALARY PAYABLE, CTC
