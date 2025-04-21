# Payroll Pro

## Overview
Payroll Pro is an all-in-one payroll management solution designed for HR teams handling multiple companies. It automates salary calculations, manages attendance data, and generates detailed reports—all from a clean, user-friendly interface. Built with scalability, security, and precision in mind, Payroll Pro simplifies complex payroll operations.

---

## Features

- **Excel Data Import**: Seamlessly upload employee attendance data via Excel files
- **Automated Salary Processing**: Calculate salaries based on attendance, daily rates, and configurable allowances
- **Interactive Dashboard**: Get real-time insights and metrics at a glance
- **Detailed Salary Reports**: Filter, sort, and export salary breakdowns
- **Payment Tracking**: Mark employees as paid and monitor payment statuses
- **Excel Export**: Download processed payroll data for offline use
- **Multi-Company Support**: Each company has its own isolated account and data
- **Secure Authentication**: Role-based login and registration system
- **Subscription Plans**: Multiple plans with renewal tracking and feature restrictions
- **Admin Panel**: View usage analytics, manage companies, and oversee subscriptions
- **Custom Settings**: Tweak rates for VDA, ESI, PF, and more
- **Dark Mode**: Toggle between light and dark UI themes for better accessibility

---

## Tech Stack

- **Frontend**: React (Vite for fast dev builds)
- **UI**: Tailwind CSS
- **State Management**: React Hooks
- **Backend**: FastAPI (Python)
- **Data Handling**: Pandas for Excel and salary calculations
- **Database**: SQLAlchemy ORM (SQL)
- **Deployment**: Docker containerization for consistent environments

---

## Salary Calculation Logic

All attendance is treated as float values to ensure accurate payroll, including partial days.

- **Monthly Salary**: `Daily Rate × Attendance (float)`
- **VDA**: Fixed at 135.32
- **PL (Paid Leave)**: `((Daily Salary + VDA) / 30) × 1.5`
- **Bonus**: `(Daily Salary + VDA) × Bonus %`
- **ESI**:
  - Employee: 0.75%
  - Employer: 3.25%
- **PF**:
  - Employee: 12%
  - Employer: 13%
- **Deductions**: Includes Professional Tax and other fixed deductions

> **Note**: Attendance values like `23.38` are preserved and used throughout all calculations for accuracy.

---

## Getting Started

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- pip (Python package manager)

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/payroll-pro.git
   ```

2. **Frontend Setup**
   ```bash
   cd payroll-app
   npm install
   ```

3. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Running the App

1. **Start Backend**
   ```bash
   cd backend
   python main.py
   ```

2. **Start Frontend**
   ```bash
   cd payroll-app
   npm run dev
   ```

3. **Access**: Open [http://localhost:5173](http://localhost:5173) in your browser

---

## Usage

### For Company Users

1. **Register/Login**: Create a company account or log in
2. **Subscription**: Pick a plan (Basic, Standard, Premium)
3. **Dashboard**: Visualize attendance and salary metrics
4. **Upload Excel**: Import attendance data with month selection
5. **Salary Report**:
   - View, filter, and export salary reports
   - Mark employees as paid
   - Download reports to Excel
6. **Settings**:
   - Customize salary parameters
   - Toggle dark mode
   - Reset or clear uploaded data without affecting the account

### For Admins

1. **Admin Dashboard**: Manage companies and view usage
2. **Subscriptions**: Update or monitor subscription statuses
3. **Analytics**: View overall system stats
4. **System Settings**: Configure default values and thresholds

---

## Changelog

### v1.2.0 (April 2025)
- Multi-company support
- Role-based authentication
- Subscription plan enforcement
- Excel export feature
- Admin panel integration
- Codebase cleanup and optimization
- Docker deployment support

### v1.1.0 (April 2025)
- Dark mode support
- Single company UI streamlining
- UI spacing and alignment fixes
- Persistent payment status with localStorage
- Minor bug fixes

---

## License
This is proprietary software developed for internal company use. All rights reserved.

