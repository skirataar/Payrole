import pandas as pd
import numpy as np
from datetime import datetime
from typing import List, Dict, Any, Optional
import io

def clean_column_name(col_name: str) -> str:
    """Clean column names by removing spaces and special characters"""
    if not isinstance(col_name, str):
        return str(col_name)
    
    # Replace spaces and special characters
    clean_name = col_name.strip().lower().replace(' ', '_')
    clean_name = ''.join(c if c.isalnum() or c == '_' else '' for c in clean_name)
    return clean_name

def map_excel_columns(df: pd.DataFrame) -> Dict[str, str]:
    """Map Excel columns to our model fields"""
    # Define possible column names for each field
    column_mappings = {
        'card_no': ['card_no', 'card no', 'cardno', 'employee_id', 'emp_id', 'id'],
        'name': ['name', 'employee_name', 'emp_name'],
        'esi': ['esi', 'esi_no', 'esi no'],
        'uan': ['uan', 'uan_no', 'uan no', 'pf_no', 'pf no'],
        'basic': ['basic', 'basic_salary', 'basic salary'],
        'vda': ['vda', 'variable_dearness_allowance'],
        'allowance': ['allowance', 'allow_ance', 'allow ance', 'other_allowance'],
        'bonus': ['bonus', 'incentive'],
        'ot_wages': ['ot_wages', 'ot wages', 'overtime', 'ot'],
        'ppe_cost': ['ppe_cost', 'ppe cost', 'ppe', 'ppe\'s_cost', 'ppe\'s cost'],
        'uniform_deduction': ['uniform_deduction', 'uniform dedca tion', 'uniform'],
        'pt': ['pt', 'professional_tax', 'professional tax']
    }
    
    # Create a mapping from Excel column names to our model fields
    mapping = {}
    
    # Clean column names in the DataFrame
    df.columns = [clean_column_name(col) for col in df.columns]
    
    # For each model field, find the corresponding Excel column
    for field, possible_names in column_mappings.items():
        for name in possible_names:
            clean_name = clean_column_name(name)
            if clean_name in df.columns:
                mapping[field] = clean_name
                break
    
    return mapping

def process_excel_file(file_content: bytes, report_month: Optional[datetime] = None) -> List[Dict[str, Any]]:
    """Process Excel file and return a list of payroll entries"""
    try:
        # Read Excel file
        df = pd.read_excel(io.BytesIO(file_content), engine='openpyxl')
        
        # Skip header rows (usually first 5-6 rows)
        # Look for a row that contains common column headers
        header_row = None
        for i in range(min(10, len(df))):
            row = df.iloc[i]
            # Check if this row contains common headers like 'NAME', 'CARD NO', 'BASIC', etc.
            if any(col in str(row).upper() for col in ['NAME', 'CARD NO', 'BASIC']):
                header_row = i
                break
        
        if header_row is not None:
            # Use this row as the header
            df.columns = df.iloc[header_row]
            df = df.iloc[header_row+1:].reset_index(drop=True)
        
        # Map Excel columns to our model fields
        column_mapping = map_excel_columns(df)
        
        # Process each row
        payroll_entries = []
        
        for _, row in df.iterrows():
            # Skip rows with no name or card number
            if pd.isna(row.get(column_mapping.get('name', ''))) and pd.isna(row.get(column_mapping.get('card_no', ''))):
                continue
                
            # Skip rows that might be totals or headers
            if any(keyword in str(row).lower() for keyword in ['total', 'grand total', 'sum']):
                continue
            
            # Extract basic fields
            entry = {}
            for field, excel_col in column_mapping.items():
                value = row.get(excel_col)
                # Convert to appropriate type
                if field in ['basic', 'vda', 'allowance', 'bonus', 'ot_wages', 'ppe_cost', 'uniform_deduction', 'pt']:
                    # Convert to float, handling NaN and non-numeric values
                    try:
                        if pd.isna(value):
                            entry[field] = 0.0
                        else:
                            # Try to extract numeric value from string if needed
                            if isinstance(value, str):
                                # Remove non-numeric characters except decimal point
                                numeric_str = ''.join(c for c in value if c.isdigit() or c == '.')
                                entry[field] = float(numeric_str) if numeric_str else 0.0
                            else:
                                entry[field] = float(value)
                    except (ValueError, TypeError):
                        entry[field] = 0.0
                else:
                    # For string fields
                    entry[field] = str(value) if not pd.isna(value) else ""
            
            # Calculate derived fields
            
            # 1. Gross Salary
            basic = entry.get('basic', 0.0)
            vda = entry.get('vda', 0.0)
            allowance = entry.get('allowance', 0.0)
            bonus = entry.get('bonus', 0.0)
            ot_wages = entry.get('ot_wages', 0.0)
            ppe_cost = entry.get('ppe_cost', 0.0)
            
            gross_salary = basic + vda + allowance + bonus + ot_wages + ppe_cost
            entry['gross_salary'] = gross_salary
            
            # 2. Deductions
            # ESI Employee contribution (0.75%)
            esi_employee = round(gross_salary * 0.0075, 2) if gross_salary <= 21000 else 0.0
            entry['esi_employee'] = esi_employee
            
            # PF Employee contribution (12%)
            pf_employee = round(basic * 0.12, 2)
            entry['pf_employee'] = pf_employee
            
            # LWF Employee (40rs)
            lwf_employee = 40.0
            entry['lwf_employee'] = lwf_employee
            
            # Uniform deduction (from Excel)
            uniform_deduction = entry.get('uniform_deduction', 0.0)
            
            # PT (from Excel)
            pt = entry.get('pt', 0.0)
            
            # Total deductions
            deduction_total = esi_employee + pf_employee + uniform_deduction + pt + lwf_employee
            entry['deduction_total'] = deduction_total
            
            # 3. Net Salary
            net_salary = gross_salary - deduction_total
            entry['net_salary'] = net_salary
            
            # 4. Employer Contributions
            # ESI Employer contribution (3.25%)
            esi_employer = round(gross_salary * 0.0325, 2) if gross_salary <= 21000 else 0.0
            entry['esi_employer'] = esi_employer
            
            # PF Employer contribution (13%)
            pf_employer = round(basic * 0.13, 2)
            entry['pf_employer'] = pf_employer
            
            # LWF Employer (60rs)
            lwf_employer = 60.0
            entry['lwf_employer'] = lwf_employer
            
            # 5. CTC
            ctc = net_salary + esi_employer + pf_employer + lwf_employer
            entry['ctc'] = ctc
            
            # 6. Report Month
            if report_month:
                entry['report_month'] = report_month
            else:
                entry['report_month'] = datetime.today().date()
            
            payroll_entries.append(entry)
        
        return payroll_entries
    
    except Exception as e:
        print(f"Error processing Excel file: {str(e)}")
        raise Exception(f"Error processing Excel file: {str(e)}")
