import pandas as pd
from typing import Dict, List, Any
import sys
import json

# Fix for LogCapture issue
class LogCapture:
    def __init__(self):
        self.original_stdout = sys.stdout

    def write(self, message, end=''):
        self.original_stdout.write(message)
        if end:
            self.original_stdout.write(end)

    def flush(self):
        self.original_stdout.flush()


def get_column_index(column_identifier) -> int:
    """Get column index from either a letter or a number.

    Args:
        column_identifier: Either a column letter (e.g., 'A', 'BC') or a column number (0-based index)

    Returns:
        Column index (0-based)
    """
    if isinstance(column_identifier, int):
        return column_identifier  # Already a number, use as is
    elif isinstance(column_identifier, str):
        # Convert Excel column letter to index
        result = 0
        for char in column_identifier:
            result = result * 26 + (ord(char.upper()) - ord('A') + 1)
        return result - 1  # Convert to 0-based index
    else:
        raise ValueError(f"Unsupported column identifier type: {type(column_identifier)}")

def parse_excel_by_position(
    df: pd.DataFrame,
    company_name: str,
    column_mappings: Dict[str, Dict[str, str]]
) -> List[Dict]:
    """
    Parse Excel sheet using column positions instead of column names.

    Args:
        df: DataFrame containing the Excel sheet data
        company_name: Name of the company (sheet name)
        column_mappings: Dictionary mapping company names to column positions
            e.g. {'Company1': {'employee_id': 'B', 'name': 'E', 'net_salary': 'AH'}}

    Returns:
        List of employee dictionaries
    """
    try:
        print(f"\nProcessing sheet by position: {company_name}")

        # Get column mapping for this company
        company_mapping = column_mappings.get(company_name)

        # If no specific mapping found, try to use the default mapping
        if not company_mapping and 'default' in column_mappings:
            print(f"No specific mapping found for sheet: {company_name}, using default mapping")
            company_mapping = column_mappings['default']

        # If still no mapping found, raise an error
        if not company_mapping:
            raise ValueError(f"No column mapping found for sheet: {company_name} and no default mapping available")

        # Convert column identifiers to indices
        column_indices = {}
        for field, column_identifier in company_mapping.items():
            try:
                column_indices[field] = get_column_index(column_identifier)
                print(f"Mapped field '{field}' to column index {column_indices[field]}")
            except Exception as e:
                print(f"Error mapping field '{field}': {str(e)}")
                raise ValueError(f"Error converting column identifier for {field}: {str(e)}")

        print(f"Using column indices: {column_indices}")

        # Extract data
        employees = []

        # Debug: Print the first 10 rows of the dataframe to understand its structure
        print(f"\nDEBUG - First 10 rows of dataframe:")
        for i in range(min(10, len(df))):
            row_values = []
            for j in range(min(10, len(df.columns))):
                try:
                    value = df.iloc[i, j]
                    row_values.append(f"Col {j+1}: {value} (Type: {type(value).__name__})")
                except Exception as e:
                    row_values.append(f"Col {j+1}: ERROR - {str(e)}")
            print(f"Row {i+1}: {', '.join(row_values)}")
        for idx, row in df.iterrows():
            # Process all rows, including headers
            print(f"Processing row {idx+1} (0-based index: {idx}) - NOT SKIPPING ANY ROWS")

            print(f"\n===========================================")
            print(f"Processing row {idx+1} (0-based index: {idx})")
            # Print the first 10 values of the row for debugging
            row_values = []
            for i in range(min(10, len(row))):
                try:
                    value = row.iloc[i]
                    row_values.append(f"Col {i+1}: {value} (Type: {type(value).__name__})")
                except Exception as e:
                    row_values.append(f"Col {i+1}: ERROR - {str(e)}")
            print("Row data: " + ", ".join(row_values))
            try:
                # Skip completely empty rows
                if row.isna().all():
                    continue

                # Process all rows, including headers
                print(f"Processing row {idx+1} in the inner loop (not skipping)")

                # Check if this is the last row (total row)
                # We can identify it by checking if it contains words like "Total" or "Sum"
                row_as_string = ' '.join(str(val).lower() for val in row if pd.notna(val))
                if any(keyword in row_as_string for keyword in ['total', 'sum', 'grand total']):
                    print(f"Skipping total row: {row_as_string[:50]}...")
                    continue

                # Get values by column index with better error handling
                try:
                    # For employee_id, try to get the value and handle any errors
                    try:
                        if column_indices['employee_id'] < len(row):
                            employee_id_value = row.iloc[column_indices['employee_id']]
                            if pd.notna(employee_id_value):
                                employee_id = str(employee_id_value).strip()
                                print(f"Found employee_id: '{employee_id}' at column index {column_indices['employee_id']} (Column {column_indices['employee_id']+1})")

                                # Special debug for specific employee IDs
                                if employee_id in ['EMP1492', 'EMP1510', 'EMP1511', 'EMP1515', 'EMP1520']:
                                    print(f"SPECIAL DEBUG - Found target employee ID: {employee_id}")
                                    print(f"SPECIAL DEBUG - Row data: {row.iloc[:5].tolist()}")
                                    print(f"SPECIAL DEBUG - Row index: {idx}")

                                # Check if this is a total row by looking at the employee ID
                                if any(keyword in employee_id.lower() for keyword in ['total', 'sum', 'grand', 'subtotal']):
                                    print(f"Skipping total row with ID: {employee_id}")
                                    continue
                            else:
                                print(f"Employee ID is NaN or None at column index {column_indices['employee_id']} (Column {column_indices['employee_id']+1})")
                                employee_id = ""
                        else:
                            print(f"Employee ID column index {column_indices['employee_id']} is out of bounds for row with {len(row)} columns")
                            employee_id = ""
                    except (IndexError, KeyError) as e:
                        print(f"Error accessing employee_id column: {str(e)}")
                        employee_id = ""

                    # For name, try to get the value and handle any errors
                    try:
                        if column_indices['name'] < len(row):
                            name_value = row.iloc[column_indices['name']]
                            if pd.notna(name_value):
                                name = str(name_value).strip()
                                # Print the name for debugging
                                print(f"Found name: '{name}' at column index {column_indices['name']} (Column {column_indices['name']+1})")

                                # Check if this is a total row by looking at the name
                                if any(keyword in name.lower() for keyword in ['total', 'sum', 'grand', 'subtotal']):
                                    print(f"Skipping total row with name: {name}")
                                    continue
                            else:
                                print(f"Name is NaN or None at column index {column_indices['name']} (Column {column_indices['name']+1})")
                                name = ""
                        else:
                            print(f"Name column index {column_indices['name']} is out of bounds for row with {len(row)} columns")
                            name = ""
                    except (IndexError, KeyError) as e:
                        print(f"Error accessing name column: {str(e)}")
                        name = ""
                except Exception as e:
                    print(f"Unexpected error getting employee data: {str(e)}")
                    employee_id = ""
                    name = ""

                # Handle salary - convert to float with more flexible parsing
                try:
                    # Check if the salary column index is valid
                    if column_indices['net_salary'] < len(row):
                        salary_value = row.iloc[column_indices['net_salary']]
                        if pd.isna(salary_value):
                            salary = 0
                        else:
                            # Print the raw salary value for debugging
                            print(f"Raw salary value: '{salary_value}' at column index {column_indices['net_salary']}")

                            # Check if this is a total row by looking at the salary value
                            # If the salary is much larger than typical values, it might be a total
                            salary_str = str(salary_value)
                            if any(keyword in salary_str.lower() for keyword in ['total', 'sum']):
                                print(f"Skipping total row with salary description: {salary_str}")
                                continue

                            # More flexible salary parsing
                            # Remove any non-numeric characters except decimal point
                            salary_str = ''.join(c for c in salary_str if c.isdigit() or c == '.' or c == '-')
                            # Handle case where there might be multiple decimal points
                            if salary_str.count('.') > 1:
                                parts = salary_str.split('.')
                                salary_str = parts[0] + '.' + ''.join(parts[1:])

                            try:
                                salary = float(salary_str) if salary_str else 0
                                print(f"Parsed salary: {salary} (This is the basic rate)")

                                # If this is the last row and the salary is significantly higher than previous rows,
                                # it might be a total row
                                if idx == len(df) - 1 and len(employees) > 0:
                                    avg_salary = sum(emp['net_salary'] for emp in employees) / len(employees)
                                    if salary > avg_salary * 5:  # If salary is 5x the average, likely a total
                                        print(f"Skipping likely total row with unusually high salary: {salary}")
                                        continue

                                # If salary is negative or unreasonably large, set to 0
                                if salary < 0 or salary > 10000000:  # 1 crore limit
                                    print(f"Warning: Unreasonable salary value in row {idx+1}: {salary}")
                                    salary = 0
                                else:
                                    print(f"Parsed salary: {salary}")
                            except ValueError:
                                print(f"Warning: Invalid salary value in row {idx+1}: {salary_str}")
                                salary = 0  # Set default instead of skipping
                    else:
                        print(f"Salary column index {column_indices['net_salary']} is out of bounds for row with {len(row)} columns")
                        salary = 0
                except Exception as e:
                    print(f"Error processing salary in row {idx+1}: {str(e)}")
                    salary = 0  # Set default instead of skipping

                # Get attendance days from the Excel file if available
                attendance_days = 26.0  # Default value as float
                try:
                    if 'attendance' in column_indices and column_indices['attendance'] < len(row):
                        attendance_value = row.iloc[column_indices['attendance']]
                        if pd.notna(attendance_value):
                            try:
                                # CRITICAL: Ensure attendance is treated as a float with decimal precision
                                # First, convert to string to handle any format
                                attendance_str = str(attendance_value).replace(',', '').strip()

                                # Then convert to float - this is the critical step
                                # We need to ensure we're using the exact float value for all calculations
                                attendance_days = float(attendance_str)

                                # Debug the decimal part to ensure it's preserved
                                if '.' in attendance_str and attendance_str.split('.')[-1] != '0':
                                    print(f"DECIMAL PRESERVATION - Value has decimal part: {attendance_str} -> {attendance_days}")
                                else:
                                    print(f"DECIMAL PRESERVATION - Value is whole number or .0: {attendance_str} -> {attendance_days}")

                                print(f"Found attendance days: {attendance_days} (Type: {type(attendance_days).__name__})"
                                      f" - Original value: {attendance_value} (Type: {type(attendance_value).__name__})")

                                # Special debug for specific employee IDs
                                if employee_id in ['EMP1492', 'EMP1510', 'EMP1511', 'EMP1515', 'EMP1520']:
                                    print(f"\n==== CRITICAL DEBUG FOR {employee_id} =====")
                                    print(f"1. Raw attendance value: {attendance_value} (Type: {type(attendance_value).__name__})")
                                    print(f"2. Converted to string: '{attendance_str}'")
                                    print(f"3. Final float value: {attendance_days} (Type: {type(attendance_days).__name__})")
                                    print(f"4. Verification - float('{attendance_str}') = {float(attendance_str)}")
                                    print(f"5. String representation: str({attendance_days}) = '{str(attendance_days)}'")
                                    print(f"6. Format with 2 decimal places: {attendance_days:.2f}")
                                    print(f"==== END DEBUG FOR {employee_id} =====")
                                # Validate attendance days (should be between 0 and 31)
                                if attendance_days < 0 or attendance_days > 31:
                                    print(f"Invalid attendance days: {attendance_days}, using default 26")
                                    attendance_days = 26.0
                            except (ValueError, TypeError) as e:
                                print(f"Error converting attendance value to float: {attendance_value}, error: {str(e)}")
                                # Try to continue with default value
                except Exception as e:
                    print(f"Error processing attendance days: {str(e)}")
                    # Continue with default value

                # Get the basic parameters
                daily_salary = salary  # Basic daily rate
                print(f"Using daily_salary: {daily_salary}, attendance_days: {attendance_days}")

                # Fixed wages calculations
                vda_rate = 135.32  # Fixed VDA Rate
                print(f"VDA Rate: {vda_rate}")

                pl = (daily_salary + vda_rate) / 30 * 1.5  # PL: (Daily salary + VDA rate)/30 * 1.5
                print(f"PL: {pl}")

                bonus_rate = (daily_salary + vda_rate) * 0.0833  # Bonus rate: (Daily salary + VDA rate)*8.33%
                print(f"Bonus rate: {bonus_rate}")

                # Monthly calculations based on attendance
                # CRITICAL: Ensure we're using the float value of attendance_days
                print(f"\nCALCULATION DEBUG - Before monthly salary calculation:")
                print(f"Daily salary: {daily_salary} (Type: {type(daily_salary).__name__})")
                print(f"Attendance days: {attendance_days} (Type: {type(attendance_days).__name__})")

                monthly_salary = daily_salary * attendance_days  # Monthly salary: Daily salary * Attendance
                print(f"Monthly salary: {monthly_salary} = {daily_salary} * {attendance_days} (Type: {type(monthly_salary).__name__})")

                # Special debug for specific employee IDs
                if employee_id in ['EMP1492', 'EMP1510', 'EMP1511', 'EMP1515', 'EMP1520']:
                    print(f"\n==== CALCULATION DEBUG FOR {employee_id} =====")
                    print(f"1. Daily salary: {daily_salary} (Type: {type(daily_salary).__name__})")
                    print(f"2. Attendance days: {attendance_days} (Type: {type(attendance_days).__name__})")
                    print(f"3. Calculation: {daily_salary} * {attendance_days} = {daily_salary * attendance_days}")
                    print(f"4. Monthly salary result: {monthly_salary} (Type: {type(monthly_salary).__name__})")
                    print(f"5. Verification - {daily_salary:.2f} * {attendance_days:.2f} = {(daily_salary * attendance_days):.2f}")
                    print(f"==== END CALCULATION DEBUG FOR {employee_id} =====")

                vda = vda_rate * attendance_days  # VDA: VDA Rate * Attendance
                print(f"VDA: {vda}")

                # Get daily allowance from Excel if available
                daily_allowance = 0  # Default value
                try:
                    if 'daily_allowance' in column_indices and column_indices['daily_allowance'] < len(row):
                        daily_allowance_value = row.iloc[column_indices['daily_allowance']]
                        # If cell is empty or NaN, consider it as 0
                        if pd.notna(daily_allowance_value) and daily_allowance_value != '':
                            try:
                                daily_allowance = float(str(daily_allowance_value).replace(',', ''))
                                print(f"Found daily allowance: {daily_allowance}")
                            except (ValueError, TypeError) as e:
                                print(f"Error converting daily allowance to float: {daily_allowance_value}, error: {str(e)}")
                        else:
                            print("Daily allowance cell is empty, using default value 0")
                except Exception as e:
                    print(f"Error processing daily allowance: {str(e)}")

                allowance = daily_allowance * attendance_days  # Allowance: Daily allowance(if any) * Attendance
                print(f"Allowance: {allowance}")

                bonus = bonus_rate * attendance_days  # Bonus: Bonus rate * Attendance
                print(f"Bonus: {bonus}")

                pl_daily_rate = ((monthly_salary + vda) * 1.3) / 26  # PL daily rate: ((Monthly salary+VDA)*1.3)/26
                print(f"PL daily rate: {pl_daily_rate}")

                # Get NH/FH days from Excel if available
                nh_fh_days = 0.0  # Default value as float
                try:
                    if 'nh_fh_days' in column_indices and column_indices['nh_fh_days'] < len(row):
                        nh_fh_days_value = row.iloc[column_indices['nh_fh_days']]
                        # If cell is empty or NaN, consider it as 0
                        if pd.notna(nh_fh_days_value) and nh_fh_days_value != '':
                            try:
                                nh_fh_days = float(str(nh_fh_days_value).replace(',', ''))
                                print(f"Found NH/FH days: {nh_fh_days}")
                            except (ValueError, TypeError) as e:
                                print(f"Error converting NH/FH days to float: {nh_fh_days_value}, error: {str(e)}")
                        else:
                            print("NH/FH days cell is empty, using default value 0")
                except Exception as e:
                    print(f"Error processing NH/FH days: {str(e)}")

                nh_fh_amt = (daily_salary + vda_rate + pl + bonus_rate) * nh_fh_days  # NH/FH Amt: (Daily Salary+VDA Rate+PL+Bonus rate)*NH/FH days
                print(f"NH/FH Amt: {nh_fh_amt}")

                # Get OT days from Excel if available
                ot_days = 0.0  # Default value as float
                try:
                    if 'ot_days' in column_indices and column_indices['ot_days'] < len(row):
                        ot_days_value = row.iloc[column_indices['ot_days']]
                        # If cell is empty or NaN, consider it as 0
                        if pd.notna(ot_days_value) and ot_days_value != '':
                            try:
                                ot_days = float(str(ot_days_value).replace(',', ''))
                                print(f"Found OT days: {ot_days}")
                            except (ValueError, TypeError) as e:
                                print(f"Error converting OT days to float: {ot_days_value}, error: {str(e)}")
                        else:
                            print("OT days cell is empty, using default value 0")
                except Exception as e:
                    print(f"Error processing OT days: {str(e)}")

                ot_wages = ((daily_salary + vda_rate + daily_allowance) * ot_days) * 2  # OT wages: ((Daily rate+VDA Rate+Daily allowance)* OT days)*2
                print(f"OT wages: {ot_wages}")

                # PPE cost
                ppe_cost = attendance_days * 3  # PPE's cost: Attendance*3
                print(f"PPE's cost: {ppe_cost}")

                # Calculate Total-B
                total_b = monthly_salary + vda + allowance + pl_daily_rate + bonus + nh_fh_amt + ot_wages + ppe_cost
                print(f"Total-B: {total_b}")

                # Deductions
                # Calculate ESI base amount first
                esi_base = ((attendance_days + nh_fh_days) * (daily_salary + vda_rate + daily_allowance + pl + 3) + ot_wages)
                print(f"ESI base amount: {esi_base}")

                # Then calculate ESI employee contribution (0.75%)
                esi_employee = esi_base * 0.0075  # ESI 0.75% (0.0075 as decimal)
                print(f"ESI 0.75%: {esi_employee}")

                pf_employee = ((attendance_days + nh_fh_days) * (daily_salary + vda_rate + daily_allowance) * 0.12)  # PF 12%
                print(f"PF 12%: {pf_employee}")

                # Get Uniform Deduction from Excel if available
                uniform_deduction = 0  # Default value
                try:
                    if 'uniform_deduction' in column_indices and column_indices['uniform_deduction'] < len(row):
                        uniform_deduction_value = row.iloc[column_indices['uniform_deduction']]
                        # If cell is empty or NaN, consider it as 0
                        if pd.notna(uniform_deduction_value) and uniform_deduction_value != '':
                            try:
                                uniform_deduction = float(str(uniform_deduction_value).replace(',', ''))
                                print(f"Found Uniform Deduction: {uniform_deduction}")
                            except (ValueError, TypeError) as e:
                                print(f"Error converting Uniform Deduction to float: {uniform_deduction_value}, error: {str(e)}")
                        else:
                            print("Uniform Deduction cell is empty, using default value 0")
                except Exception as e:
                    print(f"Error processing Uniform Deduction: {str(e)}")

                # Get Professional Tax (PT) from Excel if available
                pt = 0  # Default value
                try:
                    if 'pt' in column_indices and column_indices['pt'] < len(row):
                        pt_value = row.iloc[column_indices['pt']]
                        # If cell is empty or NaN, consider it as 0
                        if pd.notna(pt_value) and pt_value != '':
                            try:
                                pt = float(str(pt_value).replace(',', ''))
                                print(f"Found Professional Tax (PT): {pt}")
                            except (ValueError, TypeError) as e:
                                print(f"Error converting Professional Tax to float: {pt_value}, error: {str(e)}")
                        else:
                            print("Professional Tax cell is empty, using default value 0")
                except Exception as e:
                    print(f"Error processing Professional Tax: {str(e)}")

                # Get LWF employee boolean from Excel if available
                lwf_employee = 0  # Default value
                try:
                    if 'lwf_employee_bool' in column_indices and column_indices['lwf_employee_bool'] < len(row):
                        lwf_employee_bool_value = row.iloc[column_indices['lwf_employee_bool']]
                        # If cell is empty or NaN, consider it as 0
                        if pd.notna(lwf_employee_bool_value) and lwf_employee_bool_value != '':
                            try:
                                lwf_employee_bool = int(float(str(lwf_employee_bool_value).replace(',', '')))
                                print(f"Found LWF employee bool: {lwf_employee_bool}")
                                # If LWF40 is 1, set lwf_employee to 40, otherwise 0
                                lwf_employee = 40 if lwf_employee_bool == 1 else 0
                                print(f"LWF employee contribution: {lwf_employee}")
                            except (ValueError, TypeError) as e:
                                print(f"Error converting LWF employee bool to int: {lwf_employee_bool_value}, error: {str(e)}")
                        else:
                            print("LWF employee bool cell is empty, using default value 0")
                except Exception as e:
                    print(f"Error processing LWF employee bool: {str(e)}")

                # Calculate total deductions
                deduction_total = esi_employee + pf_employee + uniform_deduction + pt + lwf_employee
                print(f"Total Deduction: {deduction_total}")

                # Calculate Bank Transfer (Net Salary)
                bank_transfer = round(total_b - deduction_total, 0)
                print(f"Bank Transfer: {bank_transfer}")

                # Employer contributions
                # Use the same ESI base amount for employer contribution (3.25%)
                esi_employer = esi_base * 0.0325  # ESI 3.25% (0.0325 as decimal)
                print(f"ESI 3.25%: {esi_employer}")

                pf_employer = ((attendance_days + nh_fh_days) * (daily_salary + vda_rate + daily_allowance) * 0.13)  # PF 13%
                print(f"PF 13%: {pf_employer}")

                commission = 25 * attendance_days  # Commission: 25*Attendance
                print(f"Commission: {commission}")

                # Get LWF employer boolean from Excel if available
                lwf_employer = 0  # Default value
                try:
                    if 'lwf_employer_bool' in column_indices and column_indices['lwf_employer_bool'] < len(row):
                        lwf_employer_bool_value = row.iloc[column_indices['lwf_employer_bool']]
                        # If cell is empty or NaN, consider it as 0
                        if pd.notna(lwf_employer_bool_value) and lwf_employer_bool_value != '':
                            try:
                                lwf_employer_bool = int(float(str(lwf_employer_bool_value).replace(',', '')))
                                print(f"Found LWF employer bool: {lwf_employer_bool}")
                                # If LWF60 is 1, set lwf_employer to 60, otherwise 0
                                lwf_employer = 60 if lwf_employer_bool == 1 else 0
                                print(f"LWF employer contribution: {lwf_employer}")
                            except (ValueError, TypeError) as e:
                                print(f"Error converting LWF employer bool to int: {lwf_employer_bool_value}, error: {str(e)}")
                        else:
                            print("LWF employer bool cell is empty, using default value 0")
                except Exception as e:
                    print(f"Error processing LWF employer bool: {str(e)}")

                # Calculate CTC
                ctc = commission + pf_employer + esi_employer + total_b + lwf_employer
                print(f"CTC: {ctc}")

                # For compatibility with existing code
                basic = monthly_salary
                gross_salary = total_b
                net_salary = bank_transfer
                earned_wage = monthly_salary

                # CRITICAL: Store attendance_days as a float to ensure it's used correctly in calculations
                # This is the key change - we're storing it as a float, not a string

                # Special debug for specific employee IDs
                if employee_id in ['GO1492', 'GO1510', 'GO1511', 'GO1515', 'GO1520']:
                    print(f"\n==== ATTENDANCE DEBUG FOR {employee_id} =====")
                    print(f"1. Original attendance_days: {attendance_days} (Type: {type(attendance_days).__name__})")
                    print(f"2. Float representation: {float(attendance_days)}")
                    print(f"3. Will be stored in employee object as float: {attendance_days}")
                    print(f"==== END ATTENDANCE DEBUG FOR {employee_id} =====")

                employee = {
                    'employee_id': employee_id.strip(),
                    'name': name.strip(),
                    'daily_salary': daily_salary,
                    'attendance_days': attendance_days,  # Store as float for calculations
                    'vda_rate': vda_rate,
                    'pl': pl,
                    'bonus_rate': bonus_rate,
                    'monthly_salary': monthly_salary,
                    'vda': vda,
                    'daily_allowance': daily_allowance,
                    'allowance': allowance,
                    'bonus': bonus,
                    'pl_daily_rate': pl_daily_rate,
                    'nh_fh_days': nh_fh_days,
                    'nh_fh_amt': nh_fh_amt,
                    'ot_days': ot_days,
                    'ot_wages': ot_wages,
                    'ppe_cost': ppe_cost,
                    'total_b': total_b,
                    'esi_employee': esi_employee,
                    'pf_employee': pf_employee,
                    'uniform_deduction': uniform_deduction,
                    'pt': pt,
                    'lwf_employee': lwf_employee,
                    'deduction_total': deduction_total,
                    'bank_transfer': bank_transfer,
                    'esi_employer': esi_employer,
                    'pf_employer': pf_employer,
                    'commission': commission,
                    'lwf_employer': lwf_employer,
                    'ctc': ctc,
                    # For compatibility with existing code
                    'basic_rate': daily_salary,
                    'earned_wage': monthly_salary,
                    'basic': basic,
                    'gross_salary': gross_salary,
                    'net_salary': net_salary,
                    'hours_worked': 0,  # Default values
                    'overtime_hours': ot_days,
                    'bank_account': '',
                    'company': company_name
                }

                # Skip rows with empty names
                if not employee['name']:
                    print(f"Skipping row with empty name, ID: {employee['employee_id']}")
                    continue

                # Only process employees with IDs starting with GO
                # Convert to string and strip any whitespace
                emp_id = str(employee['employee_id']).strip()
                print(f"Checking employee ID: '{emp_id}'")

                # No longer requiring IDs to start with GO
                print(f"Processing employee with ID: {emp_id} - {employee['name']}")

                # Check if the employee has a name
                if not employee['name'] or employee['name'] == '':
                    print(f"Skipping employee with empty name: {emp_id}")
                    continue

                # Update the employee_id with the cleaned version
                employee['employee_id'] = emp_id
                print(f"Processing employee: {emp_id} - {employee['name']}")

                # Add the employee if we have a name and either an ID or salary
                # Special debug for specific employee IDs
                if employee['employee_id'] in ['EMP1492', 'EMP1510', 'EMP1511', 'EMP1515', 'EMP1520']:
                    print(f"\n==== FINAL EMPLOYEE OBJECT DEBUG FOR {employee['employee_id']} =====")
                    print(f"1. Employee ID: {employee['employee_id']}")
                    print(f"2. Name: {employee['name']}")
                    print(f"3. Attendance days: {employee['attendance_days']} (Type: {type(employee['attendance_days']).__name__})")
                    print(f"4. Daily salary: {employee['daily_salary']}")
                    print(f"5. Monthly salary: {employee['monthly_salary']} = {employee['daily_salary']} * {employee['attendance_days']}")
                    print(f"6. Verification - {employee['daily_salary']:.2f} * {employee['attendance_days']:.2f} = {(employee['daily_salary'] * employee['attendance_days']):.2f}")
                    print(f"7. Will be added: {bool(employee['name'] and (employee['employee_id'] or employee['net_salary'] > 0))}")
                    print(f"8. JSON representation: {json.dumps({'attendance': employee['attendance_days']}, default=float)}")
                    print(f"==== END FINAL DEBUG FOR {employee['employee_id']} =====")

                if employee['name'] and (employee['employee_id'] or employee['net_salary'] > 0):
                    # If we don't have a valid salary, set a default
                    if employee['net_salary'] <= 0:
                        employee['net_salary'] = 10000  # Default salary
                        print(f"Setting default salary for employee: {employee['name']}")

                    # If we don't have a valid ID, generate one
                    if not employee['employee_id']:
                        employee['employee_id'] = f"EMP-{company_name[:3].upper()}-{len(employees) + 1}"
                        print(f"Generated ID {employee['employee_id']} for employee: {employee['name']}")

                    # Add the employee to the list
                    print(f"Adding employee: {employee['name']} (ID: {employee['employee_id']}, Salary: {employee['net_salary']})")
                    employees.append(employee)

            except Exception as e:
                print(f"Warning: Error processing row {idx+1}: {str(e)}")
                continue

        # Don't raise an error if no employees are found, just return an empty list
        if not employees:
            print(f"Warning: No valid employee data found in sheet {company_name}")
            # Return an empty list instead of creating dummy employees
            print(f"No dummy employees will be created for {company_name}")

        return employees

    except Exception as e:
        raise ValueError(f"Error parsing sheet {company_name} by position: {str(e)}")

def process_excel_file_by_position(
    excel_file: pd.ExcelFile,
    column_mappings: Dict[str, Dict[str, str]]
) -> Dict[str, Any]:
    """
    Process Excel file with multiple sheets using column positions.

    Args:
        excel_file: pandas ExcelFile object
        column_mappings: Dictionary mapping company names to column positions

    Returns:
        Dictionary with processed data and log file path if create_log is True
    """
    processed_data = {
        "companies": [],
        "summary": {
            "total_companies": 0,
            "total_employees": 0,
            "total_salary": 0,
            "total_overtime_hours": 0
        }
    }

    # Print debug info
    print(f"Processing Excel file with {len(excel_file.sheet_names)} sheets")
    print(f"Sheet names: {excel_file.sheet_names}")

    for sheet_name in excel_file.sheet_names:
        try:
            # Skip empty sheet names or those with only spaces
            if not sheet_name.strip():
                continue

            print(f"\nProcessing sheet: {sheet_name}")
            # Read Excel file with explicit options to preserve decimal places
            # Set converters for column 3 (index 2) to force float conversion with decimal preservation
            # This is critical for attendance values like 23.38
            converters = {2: lambda x: float(str(x).replace(',', ''))}  # Column 3 (index 2) is attendance

            # Use pandas options to ensure float precision is preserved
            with pd.option_context('display.precision', 10):
                df = pd.read_excel(excel_file, sheet_name=sheet_name, converters=converters, dtype={2: float})

            # Print raw data for debugging
            print("\nRAW DATA DEBUG - First 10 rows with attendance values:")
            for i in range(min(10, len(df))):
                try:
                    raw_value = df.iloc[i, 2]  # Column 3 (index 2) is attendance
                    print(f"Row {i+1} - Raw attendance: {raw_value} (Type: {type(raw_value).__name__})")
                except Exception as e:
                    print(f"Row {i+1} - Error reading attendance: {str(e)}")

            # Skip empty sheets
            if df.empty:
                print(f"Sheet appears empty: {sheet_name}, skipping")
                continue

            # Debug: Print the first 10 rows of the sheet to understand its structure
            print(f"\nDEBUG - First 10 rows of sheet {sheet_name}:")
            for i in range(min(10, len(df))):
                row_values = []
                for j in range(min(5, len(df.columns))):
                    try:
                        row_values.append(f"Col {j+1}: {df.iloc[i, j]}")
                    except:
                        row_values.append(f"Col {j+1}: ERROR")
                print(f"Row {i+1}: {', '.join(row_values)}")

            # Process sheet using column positions
            employees = parse_excel_by_position(df, sheet_name, column_mappings)

            if employees:
                company_data = {
                    "name": sheet_name,
                    "employees": employees,
                    "summary": {
                        "employee_count": len(employees),
                        "total_salary": sum(emp["net_salary"] for emp in employees),
                        "total_overtime_hours": sum(emp["overtime_hours"] for emp in employees)
                    }
                }
                processed_data["companies"].append(company_data)

                # Update overall summary
                processed_data["summary"]["total_companies"] += 1
                processed_data["summary"]["total_employees"] += len(employees)
                processed_data["summary"]["total_salary"] += company_data["summary"]["total_salary"]
                processed_data["summary"]["total_overtime_hours"] += company_data["summary"]["total_overtime_hours"]

        except Exception as e:
            print(f"Error processing sheet {sheet_name}: {str(e)}")
            continue

    # Just log a warning if no data was found
    if not processed_data["companies"]:
        print("Warning: No valid data was found in any sheet")

    print(f"Processed data summary: {processed_data['summary']}")
    return processed_data






