from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, create_engine, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class Company(Base):
    __tablename__ = "companies"

    id = Column(String(36), primary_key=True)
    name = Column(String, unique=True, index=True)
    subscription_plan = Column(String, default="basic")
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    employees = relationship("Employee", back_populates="company", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "subscription_plan": self.subscription_plan,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    employee_id = Column(String, index=True)
    name = Column(String)
    basic_rate = Column(Float, default=0.0)  # Daily wage rate
    
    # Relationships
    company = relationship("Company", back_populates="employees")
    attendance_records = relationship("AttendanceRecord", back_populates="employee", cascade="all, delete-orphan")
    payroll_entries = relationship("PayrollEntry", back_populates="employee", cascade="all, delete-orphan")
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Create a unique constraint for employee_id within a company
    __table_args__ = (
        Index('ix_employees_company_id_employee_id', company_id, employee_id, unique=True),
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "company_id": self.company_id,
            "employee_id": self.employee_id,
            "name": self.name,
            "basic_rate": self.basic_rate,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    employee_id = Column(String, ForeignKey("employees.employee_id"))
    month = Column(Date)  # First day of the month
    days_worked = Column(Integer, default=0)
    ot_hours = Column(Float, default=0.0)
    
    # Relationships
    employee = relationship("Employee", back_populates="attendance_records")
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Create a compound index for efficient querying
    __table_args__ = (
        Index('ix_attendance_records_company_id_employee_id_month', company_id, employee_id, month),
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "company_id": self.company_id,
            "employee_id": self.employee_id,
            "month": self.month.isoformat() if self.month else None,
            "days_worked": self.days_worked,
            "ot_hours": self.ot_hours,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class PayrollEntry(Base):
    __tablename__ = "payroll_entries"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    employee_id = Column(String, ForeignKey("employees.employee_id"))
    name = Column(String)  # Copied from employee
    report_month = Column(Date)  # First day of the month
    
    # Attendance data
    days_worked = Column(Integer, default=0)
    ot_hours = Column(Float, default=0.0)
    
    # Salary components
    basic = Column(Float, default=0.0)  # basic_rate * days_worked
    vda = Column(Float, default=0.0)    # days_worked * vda_rate
    allowance = Column(Float, default=0.0)
    ot_wages = Column(Float, default=0.0)  # ot_hours * ot_rate
    bonus = Column(Float, default=0.0)
    ppe_cost = Column(Float, default=0.0)
    gross_salary = Column(Float, default=0.0)  # Sum of all above
    
    # Deductions
    esi_employee = Column(Float, default=0.0)  # gross_salary * 0.0075
    pf_employee = Column(Float, default=0.0)   # basic * 0.12
    pt = Column(Float, default=0.0)
    uniform = Column(Float, default=0.0)
    lwf_40_flag = Column(Boolean, default=True)  # 1 if LWF applies
    lwf_40 = Column(Float, default=0.0)  # 40 if lwf_40_flag else 0
    deduction_total = Column(Float, default=0.0)  # Sum of all deductions
    
    # Net and CTC
    net_salary = Column(Float, default=0.0)  # gross_salary - deduction_total
    esi_employer = Column(Float, default=0.0)  # gross_salary * 0.0325
    pf_employer = Column(Float, default=0.0)  # basic * 0.13
    lwf_60_flag = Column(Boolean, default=True)  # 1 if employer LWF applies
    lwf_60 = Column(Float, default=0.0)  # 60 if lwf_60_flag else 0
    ctc = Column(Float, default=0.0)  # net_salary + esi_employer + pf_employer + lwf_60
    
    # Relationship
    employee = relationship("Employee", back_populates="payroll_entries")
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Create a compound index for efficient querying
    __table_args__ = (
        Index('ix_payroll_entries_company_id_employee_id_report_month', company_id, employee_id, report_month),
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "company_id": self.company_id,
            "employee_id": self.employee_id,
            "name": self.name,
            "report_month": self.report_month.isoformat() if self.report_month else None,
            "days_worked": self.days_worked,
            "ot_hours": self.ot_hours,
            "basic": self.basic,
            "vda": self.vda,
            "allowance": self.allowance,
            "ot_wages": self.ot_wages,
            "bonus": self.bonus,
            "ppe_cost": self.ppe_cost,
            "gross_salary": self.gross_salary,
            "esi_employee": self.esi_employee,
            "pf_employee": self.pf_employee,
            "pt": self.pt,
            "uniform": self.uniform,
            "lwf_40_flag": self.lwf_40_flag,
            "lwf_40": self.lwf_40,
            "deduction_total": self.deduction_total,
            "net_salary": self.net_salary,
            "esi_employer": self.esi_employer,
            "pf_employer": self.pf_employer,
            "lwf_60_flag": self.lwf_60_flag,
            "lwf_60": self.lwf_60,
            "ctc": self.ctc,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


# Create database engine and tables
def init_db(db_url="postgresql://user:password@localhost/payroll_db"):
    engine = create_engine(db_url)
    Base.metadata.create_all(bind=engine)
    return engine
