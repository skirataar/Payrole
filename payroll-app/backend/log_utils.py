import os
import sys
import datetime
from contextlib import contextmanager

def create_log_file():
    """Create a log file with a timestamp."""
    # Create a timestamp for the log file name
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    log_filename = f"excel_processing_log_{timestamp}.txt"
    
    # Create logs directory if it doesn't exist
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    log_filepath = os.path.join(log_dir, log_filename)
    
    return log_filepath

@contextmanager
def capture_stdout(output_file):
    """Capture stdout to a file."""
    # Save the original stdout
    original_stdout = sys.stdout
    
    try:
        # Open the output file
        with open(output_file, 'w') as f:
            # Redirect stdout to the file
            sys.stdout = f
            yield
    finally:
        # Restore the original stdout
        sys.stdout = original_stdout

def process_excel_with_log(excel_file_path, process_func, *args, **kwargs):
    """Process an Excel file and save the console output to a log file."""
    # Create a log file
    log_file_path = create_log_file()
    
    # Capture stdout to the log file
    with capture_stdout(log_file_path):
        print(f"Processing Excel file: {excel_file_path}")
        print(f"Log created at: {datetime.datetime.now()}")
        print()
        
        # Process the Excel file
        result = process_func(*args, **kwargs)
        
        print()
        print(f"Processing completed at: {datetime.datetime.now()}")
    
    # Add the log file path to the result
    if isinstance(result, dict):
        result['log_file_path'] = log_file_path
    
    return result
