from http.server import BaseHTTPRequestHandler
from flask import Flask, request, jsonify
import json
import pandas as pd
import io
import os

app = Flask(__name__)

def process_excel_file(file_content, column_mappings, month=None):
    """
    Process the uploaded Excel file and return the extracted data.
    
    This is a simplified version - you should adapt your actual processing logic here.
    """
    try:
        # Read the Excel file
        df = pd.read_excel(io.BytesIO(file_content))
        
        # Get the column mappings
        mappings = column_mappings.get('default', {})
        
        # Extract data based on column mappings
        employees = []
        for _, row in df.iterrows():
            # Skip rows with NaN in critical columns
            if pd.isna(row.iloc[mappings.get('employee_id', 0)]) or pd.isna(row.iloc[mappings.get('name', 1)]):
                continue
                
            employee = {
                'employee_id': str(row.iloc[mappings.get('employee_id', 0)]),
                'name': str(row.iloc[mappings.get('name', 1)]),
                'attendance_days': float(row.iloc[mappings.get('attendance', 2)] if not pd.isna(row.iloc[mappings.get('attendance', 2)]) else 0),
                'daily_salary': float(row.iloc[mappings.get('net_salary', 3)] if not pd.isna(row.iloc[mappings.get('net_salary', 3)]) else 0),
                'daily_allowance': float(row.iloc[mappings.get('daily_allowance', 4)] if not pd.isna(row.iloc[mappings.get('daily_allowance', 4)]) else 0),
                'nh_fh_days': float(row.iloc[mappings.get('nh_fh_days', 5)] if not pd.isna(row.iloc[mappings.get('nh_fh_days', 5)]) else 0),
                'ot_days': float(row.iloc[mappings.get('ot_days', 6)] if not pd.isna(row.iloc[mappings.get('ot_days', 6)]) else 0),
                'uniform_deduction': float(row.iloc[mappings.get('uniform_deduction', 7)] if not pd.isna(row.iloc[mappings.get('uniform_deduction', 7)]) else 0),
                'pt': float(row.iloc[mappings.get('pt', 8)] if not pd.isna(row.iloc[mappings.get('pt', 8)]) else 0),
                'lwf_employee_bool': bool(row.iloc[mappings.get('lwf_employee_bool', 9)] if not pd.isna(row.iloc[mappings.get('lwf_employee_bool', 9)]) else 0),
                'lwf_employer_bool': bool(row.iloc[mappings.get('lwf_employer_bool', 10)] if not pd.isna(row.iloc[mappings.get('lwf_employer_bool', 10)]) else 0),
            }
            
            # Calculate monthly salary
            employee['monthly_salary'] = employee['attendance_days'] * employee['daily_salary']
            
            # Add month if provided
            if month:
                employee['month'] = month
                
            employees.append(employee)
        
        # Create company data structure
        company_name = "Default Company"
        total_salary = sum(emp['monthly_salary'] for emp in employees)
        
        company_data = {
            'name': company_name,
            'employees': employees,
            'summary': {
                'total_salary': total_salary
            }
        }
        
        # Create final response
        result = {
            'companies': [company_data],
            'month': month
        }
        
        return result, None
        
    except Exception as e:
        return None, str(e)

@app.route('/api/upload_excel_by_position', methods=['POST'])
def upload_excel():
    try:
        # Check if file is present in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
            
        file = request.files['file']
        
        # Check if file is empty
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        # Read column mappings from request
        column_mappings = json.loads(request.form.get('column_mappings', '{}'))
        
        # Get month from request if provided
        month = request.form.get('month')
        
        # Read file content
        file_content = file.read()
        
        # Process the Excel file
        result, error = process_excel_file(file_content, column_mappings, month)
        
        if error:
            return jsonify({'error': error}), 400
            
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# This handler is for Vercel serverless function
class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # This is a simplified handler - in a real implementation,
        # you would need to parse the request body and headers properly
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        # In a real implementation, you would process the multipart form data here
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        response = {
            "message": "This is a placeholder. In a real implementation, you would process the Excel file here.",
            "status": "success"
        }
        
        self.wfile.write(json.dumps(response).encode())
        return
