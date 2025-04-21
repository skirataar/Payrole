from sqlalchemy import Column, Integer, String, Float, Date, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class PayrollEntry(Base):
    __tablename__ = "payroll_entries"

    id = Column(Integer, primary_key=True, index=True)

    # Employee identifiers
    card_no = Column(String, index=True)
    name = Column(String)
    esi = Column(String, nullable=True)
    uan = Column(String, nullable=True)

    # Salary components
    basic = Column(Float, default=0.0)
    vda = Column(Float, default=0.0)
    allowance = Column(Float, default=0.0)
    bonus = Column(Float, default=0.0)
    ot_wages = Column(Float, default=0.0)
    ppe_cost = Column(Float, default=0.0)

    # Attendance-based calculation
    daily_salary = Column(Float, default=0.0)  # Daily salary rate
    attendance_days = Column(Integer, default=26)  # Attendance days

    # Fixed wages calculations
    vda_rate = Column(Float, default=0.0)  # VDA Rate: 32% of daily salary
    pl = Column(Float, default=0.0)  # PL: [(Daily salary + VDA rate)/1.5*30]
    bonus_rate = Column(Float, default=0.0)  # Bonus rate: (Daily salary + VDA rate)*8.33%

    # Monthly calculations
    monthly_salary = Column(Float, default=0.0)  # Monthly salary: Daily salary * Attendance
    vda = Column(Float, default=0.0)  # VDA: VDA Rate * Attendance
    daily_allowance = Column(Float, default=0.0)  # Daily allowance if any
    allowance = Column(Float, default=0.0)  # Allowance: Daily allowance * Attendance
    bonus = Column(Float, default=0.0)  # Bonus: Bonus rate * Attendance
    pl_daily_rate = Column(Float, default=0.0)  # PL daily rate: ((Monthly salary+VDA)*1.3)/26

    # Holiday and overtime
    nh_fh_days = Column(Integer, default=0)  # National Holiday/Festival Holiday days
    nh_fh_amt = Column(Float, default=0.0)  # NH/FH Amount
    ot_days = Column(Integer, default=0)  # Overtime days
    ot_wages = Column(Float, default=0.0)  # Overtime wages

    # PPE cost
    ppe_cost = Column(Float, default=0.0)  # PPE's cost: Attendance*3

    # Total-B
    total_b = Column(Float, default=0.0)  # Total of all earnings

    # Additional deductions
    uniform_deduction = Column(Float, default=0.0)  # Uniform deduction if any

    # Bank transfer
    bank_transfer = Column(Float, default=0.0)  # Net amount transferred to bank

    # Employer contributions
    commission = Column(Float, default=0.0)  # Commission: 25*Attendance

    # For compatibility with existing code
    basic_rate = Column(Float, default=0.0)  # Same as daily_salary
    earned_wage = Column(Float, default=0.0)  # Same as monthly_salary

    # Calculated fields
    gross_salary = Column(Float, default=0.0)

    # Deductions
    esi_employee = Column(Float, default=0.0)  # ESI 0.75%
    pf_employee = Column(Float, default=0.0)   # PF 12%
    uniform_deduction = Column(Float, default=0.0)
    pt = Column(Float, default=0.0)            # Professional Tax
    lwf_employee = Column(Float, default=0.0)  # LWF 40rs
    deduction_total = Column(Float, default=0.0)

    # Employer contributions
    esi_employer = Column(Float, default=0.0)  # ESI 3.25%
    pf_employer = Column(Float, default=0.0)   # PF 13%
    lwf_employer = Column(Float, default=0.0)  # LWF 60rs

    # Final amounts
    net_salary = Column(Float, default=0.0)
    ctc = Column(Float, default=0.0)

    # Metadata
    report_month = Column(Date, default=datetime.today().date())
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "card_no": self.card_no,
            "name": self.name,
            "esi": self.esi,
            "uan": self.uan,
            "basic": self.basic,
            "vda": self.vda,
            "allowance": self.allowance,
            "bonus": self.bonus,
            "ot_wages": self.ot_wages,
            "ppe_cost": self.ppe_cost,
            # Attendance-based calculation fields
            "daily_salary": self.daily_salary,
            "attendance_days": self.attendance_days,

            # Fixed wages calculations
            "vda_rate": self.vda_rate,
            "pl": self.pl,
            "bonus_rate": self.bonus_rate,

            # Monthly calculations
            "monthly_salary": self.monthly_salary,
            "vda": self.vda,
            "daily_allowance": self.daily_allowance,
            "allowance": self.allowance,
            "bonus": self.bonus,
            "pl_daily_rate": self.pl_daily_rate,

            # Holiday and overtime
            "nh_fh_days": self.nh_fh_days,
            "nh_fh_amt": self.nh_fh_amt,
            "ot_days": self.ot_days,
            "ot_wages": self.ot_wages,

            # PPE cost
            "ppe_cost": self.ppe_cost,

            # Total-B
            "total_b": self.total_b,

            # Additional deductions
            "uniform_deduction": self.uniform_deduction,

            # Bank transfer
            "bank_transfer": self.bank_transfer,

            # Employer contributions
            "commission": self.commission,

            # For compatibility with existing code
            "basic_rate": self.basic_rate,
            "earned_wage": self.earned_wage,
            "gross_salary": self.gross_salary,
            "esi_employee": self.esi_employee,
            "pf_employee": self.pf_employee,
            "uniform_deduction": self.uniform_deduction,
            "pt": self.pt,
            "lwf_employee": self.lwf_employee,
            "deduction_total": self.deduction_total,
            "esi_employer": self.esi_employer,
            "pf_employer": self.pf_employer,
            "lwf_employer": self.lwf_employer,
            "net_salary": self.net_salary,
            "ctc": self.ctc,
            "report_month": self.report_month.isoformat() if self.report_month else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# Create database engine and tables
def init_db(db_url="sqlite:///./payroll.db"):
    engine = create_engine(db_url)
    Base.metadata.create_all(bind=engine)
    return engine
