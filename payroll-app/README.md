# Payroll Pro

## Overview

Payroll Pro is a comprehensive solution designed to streamline and automate the payroll process for multiple companies. This application allows HR administrators to upload employee attendance data from Excel files, process salary calculations, and generate detailed payroll reports. With multi-company support and subscription-based access, Payroll Pro provides a secure and scalable solution for all your payroll management needs.


## Features

- **Excel Data Import**: Upload employee attendance data directly from Excel files
- **Automated Salary Calculations**: Process salary calculations based on attendance, daily rates, and various allowances
- **Interactive Dashboard**: View key metrics and recent employee data at a glance
- **Detailed Salary Reports**: Generate comprehensive salary reports with filtering and sorting capabilities
- **Payment Tracking**: Mark employees as paid and track payment status
- **Excel Export**: Export salary reports to Excel files for offline use
- **Multi-Company Support**: Separate accounts for different companies with isolated data
- **User Authentication**: Secure login and registration system with role-based access control
- **Subscription Management**: Different subscription plans with expiration tracking
- **Admin Dashboard**: Manage company accounts, view analytics, and monitor subscriptions
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

### Company Users

1. **Login/Register**: Create a new company account or log in with existing credentials
2. **Choose Subscription**: Select a subscription plan during registration (Basic, Standard, or Premium)
3. **Dashboard**: View key metrics and recent employee data with interactive charts
4. **Upload Excel**: Upload employee attendance data from Excel files with month selection
5. **Salary Report**: View detailed salary reports with filtering, sorting, and export options
   - Mark employees as paid individually or in bulk
   - Export salary data to Excel files for offline use
   - Filter by payment status (Paid/Unpaid)
6. **Settings**: Configure application settings and manage data
   - Toggle dark mode for comfortable viewing in low-light environments
   - Reset salary payment status without affecting account data
   - Clear uploaded data while preserving account information

### Admin Users

1. **Admin Dashboard**: View all registered companies and their subscription status
2. **Subscription Management**: Monitor and update company subscription plans
3. **Analytics**: View system-wide usage statistics and metrics
4. **Admin Settings**: Configure global system parameters

## Recent Updates

<<<<<<< HEAD
### Version 1.2.0 (May 2024)

- **Multi-Company Support**: Added support for multiple company accounts with separate data storage
- **User Authentication**: Implemented user registration and login system with role-based access control
- **Subscription Management**: Added subscription plans with expiration dates and renewal prompts
- **Excel Export**: Added ability to export salary reports to Excel files
- **Data Isolation**: Ensured each company can only access their own data
- **Subscription Enforcement**: Restricted application access for users with expired subscriptions
- **Admin Dashboard**: Added admin interface to manage company accounts and subscriptions

### Version 1.1.0 (June 2023)
=======
### Version 1.1.0 (April 2025)
>>>>>>> a83234903a5f47dc89a777c9cff7405f2094f5c3

- **Dark Mode Implementation**: Added support for dark mode across all pages for better viewing in low-light environments
- **Single Company Focus**: Streamlined the interface to focus on a single company's payroll management
- **UI Improvements**: Enhanced spacing and alignment in the filter sections
- **Persistence Enhancements**: Added localStorage support for "Mark as Paid" status to persist across page refreshes
- **Minor Bug Fixes**: Fixed a few technical glitches.

## License

This project is proprietary software developed for internal company use.
