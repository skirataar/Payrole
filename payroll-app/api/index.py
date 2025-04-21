from flask import Flask, request, jsonify
from http.server import BaseHTTPRequestHandler
import json
import pandas as pd
import io

# Simple excel processor for Vercel deployment
class excel_processor:
    @staticmethod
    def process_excel_file_by_position(excel_file, mappings):
        try:
            # Process the Excel file
            processed_data = {
                "companies": [],
                "summary": {
                    "total_companies": 0,
                    "total_employees": 0,
                    "total_salary": 0,
                    "total_overtime_hours": 0
                }
            }

            # Process each sheet
            for sheet_name in excel_file.sheet_names:
                try:
                    # Read the sheet
                    df = pd.read_excel(excel_file, sheet_name=sheet_name)

                    # Skip empty sheets
                    if df.empty:
                        continue

                    # Extract employee data
                    employees = []
                    for idx, row in df.iterrows():
                        # Skip header rows and empty rows
                        if idx < 2 or row.isna().all():
                            continue

                        # Get column mappings
                        company_mapping = mappings.get(sheet_name, mappings.get('default', {}))

                        # Extract employee data
                        try:
                            # Get employee ID and name
                            emp_id_col = company_mapping.get('employee_id', 0)
                            name_col = company_mapping.get('name', 1)
                            salary_col = company_mapping.get('net_salary', 3)
                            attendance_col = company_mapping.get('attendance', 2)

                            # Get values
                            emp_id = str(row.iloc[emp_id_col]) if emp_id_col < len(row) else ''
                            name = str(row.iloc[name_col]) if name_col < len(row) else ''

                            # Skip rows with empty names or IDs
                            if not name.strip() or 'total' in name.lower():
                                continue

                            # Get salary and attendance
                            try:
                                salary = float(row.iloc[salary_col]) if salary_col < len(row) else 0
                                attendance = float(row.iloc[attendance_col]) if attendance_col < len(row) else 26
                            except (ValueError, TypeError):
                                salary = 0
                                attendance = 26

                            # Create employee object
                            employee = {
                                'employee_id': emp_id.strip(),
                                'name': name.strip(),
                                'net_salary': salary,
                                'attendance_days': attendance,
                                'company': sheet_name
                            }

                            employees.append(employee)
                        except Exception as e:
                            continue

                    # Add company data
                    if employees:
                        company_data = {
                            "name": sheet_name,
                            "employees": employees,
                            "summary": {
                                "employee_count": len(employees),
                                "total_salary": sum(emp["net_salary"] for emp in employees),
                                "total_overtime_hours": 0
                            }
                        }
                        processed_data["companies"].append(company_data)

                        # Update summary
                        processed_data["summary"]["total_companies"] += 1
                        processed_data["summary"]["total_employees"] += len(employees)
                        processed_data["summary"]["total_salary"] += company_data["summary"]["total_salary"]
                except Exception as e:
                    continue

            return processed_data
        except Exception as e:
            return {"error": str(e), "companies": [], "summary": {"total_companies": 0, "total_employees": 0}}

app = Flask(__name__)

# In-memory storage
class DataStore:
    def __init__(self):
        self.companies = {}

data_store = DataStore()

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        response = {
            "message": "Payroll Pro API is running",
            "status": "success"
        }

        self.wfile.write(json.dumps(response).encode())
        return

# Define your API routes
@app.route('/api/upload_excel_by_position', methods=['POST'])
def upload_excel_by_position():
    try:
        # Get the file from the request
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if not file.filename.endswith(('.xlsx', '.xls')):
            return jsonify({"error": "Only Excel files (.xlsx, .xls) are allowed"}), 400

        # Get column mappings and month from form data
        column_mappings = request.form.get('column_mappings')
        month = request.form.get('month')

        # Parse column mappings
        mappings = {}
        if column_mappings:
            try:
                mappings = json.loads(column_mappings)
            except json.JSONDecodeError:
                return jsonify({"error": "Invalid column mappings format"}), 400

        # Read the file
        file_content = file.read()

        # Process the Excel file
        with pd.option_context('display.float_format', '{:.10f}'.format):
            excel_file = pd.ExcelFile(io.BytesIO(file_content))

        if not excel_file.sheet_names:
            return jsonify({"error": "The Excel file contains no sheets"}), 400

        # Process the Excel file using column positions
        processed_data = excel_processor.process_excel_file_by_position(excel_file, mappings)

        # Add month information if provided
        if month:
            processed_data["month"] = month

            # Add month to each employee record
            for company in processed_data["companies"]:
                for employee in company["employees"]:
                    employee["month"] = month

        return jsonify(processed_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/employees', methods=['GET'])
def get_employees():
    try:
        company_id = request.args.get('company_id')

        if company_id:
            if company_id not in data_store.companies:
                return jsonify({"error": "Company not found"}), 404
            return jsonify(data_store.companies[company_id])

        # If no company_id specified, return all employees
        all_employees = []
        for employees in data_store.companies.values():
            all_employees.extend(employees)
        return jsonify(all_employees)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/companies', methods=['GET'])
def get_companies():
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
        return jsonify(companies)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/clear-data', methods=['DELETE'])
def clear_data():
    try:
        # Clear the companies dictionary
        data_store.companies.clear()
        return jsonify({"message": "All data has been cleared successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add more routes as needed

# This is important for Vercel
if __name__ == '__main__':
    app.run(debug=True)
