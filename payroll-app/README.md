# Payroll Pro

## Overview

Payroll Pro is a comprehensive solution designed to streamline and automate the payroll process for your company. This application allows HR administrators to upload employee attendance data from Excel files, process salary calculations, and generate detailed payroll reports.
=======
# Payroll Management System

## Overview

The Payroll Management System is a comprehensive solution designed to streamline and automate the payroll process for employees. This application allows HR administrators to upload employee attendance data from Excel files, process salary calculations, and generate detailed payroll reports.


## Features

- **Excel Data Import**: Upload employee attendance data directly from Excel files
- **Automated Salary Calculations**: Process salary calculations based on attendance, daily rates, and various allowances
- **Interactive Dashboard**: View key metrics and recent employee data at a glance
- **Detailed Salary Reports**: Generate comprehensive salary reports with filtering and sorting capabilities
- **Payment Tracking**: Mark employees as paid and track payment status
- **Configurable Settings**: Customize calculation parameters such as VDA rates, ESI percentages, and PF contributions
- **Dark Mode Support**: Toggle between light and dark themes for comfortable viewing in any environment

## Technology Stack

- **Frontend**: React with Vite for fast development and hot module replacement
- **UI Framework**: Tailwind CSS for responsive and modern UI design
- **State Management**: React Hooks for local state management
- **Backend**: Python with Flask for API endpoints
- **Data Processing**: Pandas for Excel data manipulation and calculations
- **Database**: SQLAlchemy ORM for database operations

## Salary Calculation Logic

The system implements the following calculation logic:

- **Attendance**: Stored and processed as float values to maintain decimal precision (e.g., 23.5 days)
- **Monthly Salary**: Daily rate × Attendance days (using float attendance values)
- **VDA**: Fixed rate (currently 135.32)
- **PL**: (Daily salary + VDA rate)/30 × 1.5
- **Bonus**: (Daily salary + VDA rate) × Bonus percentage/100
- **ESI**: Employee contribution (0.75%) and Employer contribution (3.25%)
- **PF**: Employee contribution (12%) and Employer contribution (13%)
- **Deductions**: Uniform deduction, Professional Tax, etc.

> **Important**: Attendance values are maintained as floats throughout all calculations to ensure accurate billing and payroll processing. Decimal places in attendance (e.g., 23.38 days) are preserved and used in all salary calculations.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```
   cd payroll-app
   npm install
   ```
3. Install backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   python main.py
   ```
2. Start the frontend development server:
   ```
   cd payroll-app
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Dashboard**: View key metrics and recent employee data
2. **Upload Excel**: Upload employee attendance data from Excel files
3. **Salary Report**: View detailed salary reports with filtering and sorting options
4. **Settings**: Configure calculation parameters and system settings
   - Toggle dark mode using the switch in the settings page for comfortable viewing in low-light environments

## Recent Updates

### Version 1.1.0 (June 2023)

- **Dark Mode Implementation**: Added support for dark mode across all pages for better viewing in low-light environments
- **Single Company Focus**: Streamlined the interface to focus on a single company's payroll management
- **UI Improvements**: Enhanced spacing and alignment in the filter sections
- **Persistence Enhancements**: Added localStorage support for "Mark as Paid" status to persist across page refreshes

## License

This project is proprietary software developed for internal company use.
