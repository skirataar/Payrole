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
- **Activity Logging**: Track user actions with a detailed activity history for each company
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

### Quick Start (TL;DR)

```bash
# Frontend setup
npm install
npm run dev

# Backend setup (in a separate terminal)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd backend
python main.py
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- PostgreSQL (optional, for production database)

### Development Setup (Recommended)

This method is the simplest and most reliable way to get started with development.

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/payroll-pro.git
   cd payroll-pro
   ```

2. **Frontend Setup**
   ```bash
   # Install Node.js dependencies
   npm install

   # Start the development server
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   # Create a Python virtual environment (recommended)
   python -m venv venv

   # Activate the virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt

   # Start the backend server
   cd backend
   python main.py
   ```

4. **Access the Application**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:8000](http://localhost:8000)

### Alternative Setup: Using Conda

If you prefer using Conda for Python environment management:

1. **Create and activate Conda environment**
   ```bash
   conda env create -f environment.yml
   conda activate payroll-env
   ```

2. **Start the backend server**
   ```bash
   cd backend
   python main.py
   ```

3. **In a separate terminal, start the frontend**
   ```bash
   npm install
   npm run dev
   ```

### Production Deployment Options

#### Option 1: Manual Deployment (Recommended)

This approach is more reliable and gives you better control:

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Set up a PostgreSQL database** (if needed)
   - Install PostgreSQL
   - Create a database for the application
   - Update your environment variables with the database connection string

3. **Start the production server**
   ```bash
   cd backend

   # Set environment variables
   export DATABASE_URL=postgresql://username:password@localhost:5432/payroll_db
   export SECRET_KEY=your_secret_key

   # Start the server
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
   ```

4. **Access**: Open [http://localhost:8000](http://localhost:8000) in your browser

#### Option 2: Docker Deployment (Advanced)

Note: The Docker setup may require troubleshooting depending on your environment.

1. **Prerequisites**
   - Docker and Docker Compose installed
   - Basic knowledge of Docker

2. **Fix common Docker issues**
   - Ensure Docker has sufficient resources (memory, CPU)
   - Check if ports 8000 and 5432 are available
   - Verify that the environment.yml file exists in the project root

3. **Build and start the containers**
   ```bash
   # Build the images first
   docker-compose build

   # Start the containers
   docker-compose up -d
   ```

4. **Troubleshooting Docker issues**
   ```bash
   # Check container logs
   docker-compose logs app

   # Check if containers are running
   docker-compose ps

   # Restart containers
   docker-compose restart
   ```

5. **Access**: Open [http://localhost:8000](http://localhost:8000) in your browser

#### Option 3: Cloud Deployment

For detailed instructions on deploying to cloud platforms:

1. **Render.com Deployment**
   - Frontend: Deploy as a Static Site
   - Backend: Deploy as a Web Service
   - Database: Use Render PostgreSQL or external database

2. **Vercel + Railway Deployment**
   - Frontend: Deploy to Vercel
   - Backend: Deploy to Railway
   - Database: Use Railway PostgreSQL

For detailed cloud deployment instructions, see [CLOUD_DEPLOYMENT.md](CLOUD_DEPLOYMENT.md)

### Troubleshooting Common Issues

#### Backend Issues

1. **Port already in use**
   ```bash
   # Error: Address already in use
   # Solution: Kill the process using the port
   lsof -i :8000  # Find the process ID
   kill -9 <PID>  # Kill the process
   ```

2. **Database connection issues**
   ```bash
   # Check if PostgreSQL is running
   sudo service postgresql status

   # Start PostgreSQL if it's not running
   sudo service postgresql start
   ```

3. **Missing dependencies**
   ```bash
   # Reinstall all dependencies
   pip install -r requirements.txt --force-reinstall
   ```

#### Frontend Issues

1. **Node modules issues**
   ```bash
   # Remove node_modules and reinstall
   rm -rf node_modules
   npm install
   ```

2. **Vite build errors**
   ```bash
   # Clear cache and rebuild
   npm run clean  # If available
   npm run build
   ```

#### Docker Issues

1. **Container fails to start**
   ```bash
   # Check logs for detailed error messages
   docker-compose logs app

   # Common fixes:
   # 1. Increase Docker memory allocation in Docker Desktop settings
   # 2. Make sure all required files exist (environment.yml, etc.)
   # 3. Check if ports are available
   ```

2. **Database connection issues in Docker**
   ```bash
   # Check if the database container is running
   docker-compose ps

   # Restart the database container
   docker-compose restart db

   # Check database logs
   docker-compose logs db
   ```

3. **Volume permission issues**
   ```bash
   # Fix permissions on volumes
   docker-compose down -v  # Remove volumes
   docker-compose up -d    # Recreate volumes with proper permissions
   ```

---

## Usage

### For Company Users

1. **Register/Login**: Create a company account or log in
2. **Subscription**: Pick a plan (Basic, Standard, Premium)
3. **Dashboard**:
   - Visualize attendance and salary metrics
   - View recent activity logs for your account
4. **Upload Excel**: Import attendance data with month selection
5. **Salary Report**:
   - View, filter, and export salary reports
   - Mark employees as paid
   - Download reports to Excel
6. **Settings**:
   - Customize salary parameters
   - Toggle dark mode
   - Reset or clear uploaded data without affecting the account
   - Change account password securely

### For Admins

1. **Admin Dashboard**: Manage companies and view usage
2. **Subscriptions**: Update or monitor subscription statuses
3. **Analytics**: View overall system stats
4. **System Settings**: Configure default values and thresholds

---

## Changelog

### v1.3.0 (May 2025)
- Activity logging system for tracking user actions
- Company-specific activity history
- Password change functionality in settings
- Enhanced dashboard with activity display
- Improved data isolation between companies
- Performance optimizations
- Bug fixes and UI improvements

### v1.2.0 (April 2025)
- Multi-company support
- Role-based authentication
- Subscription plan enforcement
- Excel export feature
- Admin panel integration
- Codebase cleanup and optimization
- Docker deployment support

### v1.1.0 (March 2025)
- Dark mode support
- Single company UI streamlining
- UI spacing and alignment fixes
- Persistent payment status with localStorage
- Minor bug fixes

---

## License
This is proprietary software developed for internal company use. All rights reserved.

