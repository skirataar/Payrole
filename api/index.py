from flask import Flask, request, jsonify
from http.server import BaseHTTPRequestHandler
import json
import os

# Simple mock data for Vercel deployment
class MockDataGenerator:
    @staticmethod
    def generate_sample_data(month=None):
        # Create sample data structure
        sample_data = {
            "companies": [
                {
                    "name": "Sample Company",
                    "employees": [
                        {
                            "employee_id": "EMP001",
                            "name": "John Doe",
                            "net_salary": 50000,
                            "attendance_days": 22,
                            "company": "Sample Company"
                        },
                        {
                            "employee_id": "EMP002",
                            "name": "Jane Smith",
                            "net_salary": 60000,
                            "attendance_days": 21,
                            "company": "Sample Company"
                        }
                    ],
                    "summary": {
                        "employee_count": 2,
                        "total_salary": 110000,
                        "total_overtime_hours": 0
                    }
                }
            ],
            "summary": {
                "total_companies": 1,
                "total_employees": 2,
                "total_salary": 110000,
                "total_overtime_hours": 0
            }
        }

        # Add month if provided
        if month:
            sample_data["month"] = month
            for company in sample_data["companies"]:
                for employee in company["employees"]:
                    employee["month"] = month

        return sample_data

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
