# Payroll Pro

## Overview
Payroll Pro is a comprehensive payroll management solution designed for companies to efficiently handle employee salary calculations, attendance tracking, and payroll reporting. The application supports multiple company accounts with secure data isolation, automated salary calculations based on attendance, and detailed reporting capabilities. Built with modern web technologies and a focus on accuracy and user experience.

---

## 🚀 Latest Features (v1.1.0)

### ✨ Enhanced Employee Management System
- **Comprehensive Employee Profiles**: Complete employee information with personal, job, and attendance details
- **Card-Based Display**: Beautiful, responsive employee cards showing all information at a glance
- **Organized Sections**: 
  - **Personal Information**: ID, Name, DOB, Gender, Email, Phone, Work Location
  - **Job Details**: Position, Department, Join Date, Employment Type, Supervisor, Salary
  - **Attendance & Leave**: Leave Balance, Overtime Hours, Shift Details
- **Collapsible Form Sections**: Organized form with expandable/collapsible sections for better UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### 🎨 Improved User Interface
- **Modern Card Layout**: Replaced table view with beautiful employee cards
- **Color-Coded Sections**: Visual organization with icons and color themes
- **Enhanced Search**: Search across all employee fields including email
- **Better Visual Hierarchy**: Clear information organization and readability

---

## Features

### Core Functionality
- **Excel Data Import**: Upload employee attendance data via Excel files with automatic data processing
- **Automated Salary Calculations**: Calculate salaries based on daily rates, attendance (including float values), and statutory components
- **Enhanced Employee Management**: Comprehensive employee profiles with personal, job, and attendance information
- **Salary Reports**: Generate detailed salary reports with filtering, sorting, and export capabilities
- **Payment Tracking**: Mark employees as paid/unpaid with toggle functionality

### User Experience
- **Multi-Account System**:
  - **Company Accounts**: Manage employees, upload data, generate reports
  - **Employee Accounts**: View personal salary details, attendance, and CTC breakdown
  - **Admin Accounts**: Oversee all companies, manage subscriptions, and system administration
- **Interactive Dashboards**: Real-time insights and metrics for companies and employees
- **Dark Mode**: Toggle between light and dark themes for better accessibility
- **Activity Logging**: Track user actions with detailed activity history for each company
- **Responsive Design**: Optimized for all device sizes with mobile-first approach

### Advanced Features
- **Multi-Company Support**: Complete data isolation between different company accounts
- **Subscription Management**: Multiple plans with renewal tracking and feature restrictions
- **Employee Login System**: Employees can log in with company ID and view their salary details
- **Admin Console**:
  - Monitor company subscriptions
  - Remove existing saved employees
  - Manage system-wide settings
- **Data Export**: Download processed payroll data to Excel format
- **Secure Authentication**: Role-based login system with password management
- **Comprehensive Employee Profiles**: Detailed employee information management

---

## Tech Stack

- **Frontend**: React 18 with Vite for fast development builds
- **UI Framework**: Tailwind CSS for responsive design
- **State Management**: React Context API with custom hooks
- **Routing**: React Router for navigation
- **Icons**: Lucide React for consistent iconography
- **Data Processing**: Client-side Excel processing with XLSX library
- **Storage**: LocalStorage for data persistence
- **Authentication**: Custom JWT-like authentication system
- **Deployment**: Optimized for Vercel (frontend) and cloud services (backend)

---

## Salary Calculation Logic

The application uses precise salary calculations that match industry standards and preserve float values for accuracy.

### Core Calculation Formula
- **Monthly Salary**: `Daily Rate × Attendance (float)`
- **VDA (Variable Dearness Allowance)**: Fixed at ₹135.32
- **PL (Paid Leave)**: `((Daily Rate + VDA) / 30) × 1.5`
- **Bonus**: `(Daily Rate + VDA) × Bonus %` (typically 8.33%)

### Statutory Deductions
- **ESI (Employee State Insurance)**:
  - Employee Contribution: 0.75% of gross earnings
  - Employer Contribution: 3.25% of gross earnings
- **PF (Provident Fund)**:
  - Employee Contribution: 12% of monthly salary
  - Employer Contribution: 13% of monthly salary
- **Professional Tax**: Fixed at ₹200

### CTC Calculation
- **Cost to Company (CTC)**: Gross Earnings + Employer PF + Employer ESI
- **Net Salary**: Gross Earnings - Total Deductions

### Key Features
- **Float Precision**: Attendance values like `23.38` are preserved throughout all calculations
- **Accurate Billing**: Decimal attendance ensures precise salary calculations for billing purposes
- **Consistent Logic**: Same calculations used in both salary reports and employee dashboards

---

## Getting Started

### Quick Start (TL;DR)

```bash
# Clone the repository
git clone https://github.com/skirataar/Payrole.git
cd Payrole

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

**Note**: This is a frontend-only application that uses localStorage for data persistence.

### Prerequisites

- Node.js (v18+)
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/skirataar/Payrole.git
   cd Payrole
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

### Deployment Options

#### Option 1: Vercel (Recommended)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect it's a Vite project
   - Deploy with default settings

#### Option 2: Netlify

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `dist` folder to Netlify
   - Or connect your GitHub repository for automatic deployments

#### Option 3: Static Hosting

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Serve the dist folder**
   - Upload the contents of the `dist` folder to any static hosting service
   - Configure the server to serve `index.html` for all routes (SPA routing)

### Git Setup (Optional)

```bash
# Check current branch
git branch

# Create a new feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Your commit message"

# Push to remote
git push origin feature/your-feature-name
```

### Troubleshooting Common Issues

#### Development Issues

1. **Port already in use**
   ```bash
   # Error: Port 5173 is already in use
   # Solution: Kill the process or use a different port
   lsof -i :5173  # Find the process ID (macOS/Linux)
   kill -9 <PID>  # Kill the process

   # Or start on a different port
   npm run dev -- --port 3000
   ```

2. **Node modules issues**
   ```bash
   # Remove node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build errors**
   ```bash
   # Clear Vite cache and rebuild
   rm -rf node_modules/.vite
   npm run build
   ```

#### Data Issues

1. **Lost data after browser refresh**
   - Data is stored in localStorage and persists across sessions
   - Check browser developer tools > Application > Local Storage

2. **Excel upload not working**
   - Ensure the Excel file has the correct column structure
   - Check browser console for error messages
   - Verify file size is reasonable (< 10MB recommended)

3. **Calculations not matching**
   - Verify attendance values are preserved as floats
   - Check that daily rates are entered correctly
   - Review the salary calculation logic in the documentation

---

## Usage Guide

### Getting Started

1. **Homepage**: Choose between Company Login or Employee Login
2. **Registration**: Create a new company account with subscription plan selection
3. **Login**: Access your account with email and password

### For Company Accounts

#### Dashboard
- View real-time metrics and statistics
- Monitor recent activity logs
- Access quick navigation to all features

#### Enhanced Employee Management
- **Add New Employees**: Comprehensive form with organized sections
  - Personal Information (ID, Name, DOB, Gender, Contact, Location)
  - Job Details (Position, Department, Join Date, Employment Type, Supervisor, Salary)
  - Attendance & Leave (Leave Balance, Overtime, Shift Details)
- **Employee Cards**: Beautiful card-based display showing all employee information
- **Search & Filter**: Search across all employee fields including email
- **Edit & Delete**: Easy management of employee information
- **Responsive Design**: Works perfectly on all devices

#### Excel Upload
- Upload attendance data via Excel files
- Select the month for data processing
- Automatic employee extraction and salary calculation
- Support for float attendance values (e.g., 23.5 days)

#### Salary Reports
- Generate detailed salary reports with all calculations
- Filter employees by paid/unpaid status
- Mark employees as paid with toggle functionality
- Export reports to Excel format
- View detailed breakdown of earnings and deductions

#### Settings
- Toggle between light and dark mode
- Change account password securely
- Clear activity logs
- Remove salary data without affecting the account

### For Employee Accounts

#### Login Process
- Use Company ID and Employee ID to log in
- Default password: "PayPro1245" (can be changed)

#### Employee Dashboard
- View personal salary breakdown with detailed calculations
- See daily wage rate and how monthly salary is calculated
- Review attendance data (preserved as float values)
- View CTC (Cost to Company) with employer contributions
- Access earnings and deductions breakdown with formulas

#### Settings
- Change password from default
- View personal information
- Toggle dark mode

### For Admin Accounts

#### Admin Dashboard
- Monitor all registered companies
- View subscription statuses and expiration dates
- Manage company accounts

#### Company Management
- Edit subscription plans and expiration dates
- Remove all employees for a specific company
- Monitor system usage and activity

#### System Administration
- Oversee all user accounts
- Manage subscription enforcement
- Monitor application usage

---

## Key Features Explained

### Enhanced Employee Management
- **Comprehensive Profiles**: Complete employee information in organized sections
- **Card-Based Display**: Beautiful, responsive cards showing all employee details
- **Collapsible Forms**: Organized form sections for better user experience
- **Search Functionality**: Search across all employee fields
- **Mobile Responsive**: Optimized for all device sizes

### Multi-Account System
- **Company Accounts**: Full payroll management capabilities
- **Employee Accounts**: Personal salary and attendance viewing
- **Admin Accounts**: System-wide management and oversight
- **Data Isolation**: Each company's data is completely separate

### Excel Integration
- **Smart Upload**: Automatically extracts employee data from Excel files
- **Float Precision**: Preserves decimal attendance values (e.g., 23.38 days)
- **Column Mapping**: Flexible mapping of Excel columns to system fields
- **Batch Processing**: Handles multiple employees in a single upload

### Salary Calculations
- **Industry Standard**: Follows standard payroll calculation methods
- **Transparent Formulas**: All calculations are visible to users
- **Accurate Deductions**: Proper ESI, PF, and tax calculations
- **CTC Breakdown**: Clear display of employer contributions

### Data Management
- **LocalStorage**: Client-side data persistence
- **Activity Logging**: Track all user actions with timestamps
- **Export Capabilities**: Download reports in Excel format
- **Secure Authentication**: Role-based access control

---

## Changelog

### v1.1.0 (Latest) - Enhanced Employee Management
- **✨ Comprehensive Employee Profiles**: Complete employee information with personal, job, and attendance details
- **🎨 Card-Based Display**: Beautiful, responsive employee cards replacing table view
- **📱 Mobile Responsive**: Optimized design for all device sizes
- **🔍 Enhanced Search**: Search across all employee fields including email
- **📋 Organized Form Sections**: Collapsible sections for Personal Info, Job Details, and Attendance & Leave
- **🎯 Better UX**: Improved visual hierarchy and information organization
- **🔄 Responsive Grid**: 1-3 column layout based on screen size
- **🎨 Color-Coded Sections**: Visual organization with icons and themes

### v1.0.0 (Previous)
- **Employee Login System**: Employees can now log in and view their salary details
- **Enhanced Employee Management**: Add, edit, and manage employees with float salary support
- **Improved Calculations**: Exact match with salary report calculations in employee dashboard
- **Admin Employee Management**: Remove all employees for specific companies
- **Better Data Isolation**: Proper separation of employee data by company
- **Float Attendance Support**: Preserve decimal attendance values throughout the system
- **Enhanced UI/UX**: Improved user interface with better navigation and feedback

---

## Contributing

This project is actively maintained. If you encounter any issues or have suggestions for improvements:

1. Check the troubleshooting section above
2. Review the changelog for recent updates
3. Ensure you're using the latest version
4. Create an issue or pull request on GitHub

## License

This is proprietary software developed for payroll management. All rights reserved.

---

**Payroll Pro** - Simplifying payroll management with precision and ease.

*Built with ❤️ using React, Vite, and Tailwind CSS*

