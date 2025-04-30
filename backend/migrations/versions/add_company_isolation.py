"""Add company isolation

Revision ID: add_company_isolation
Revises: previous_revision_id
Create Date: 2023-07-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import uuid


# revision identifiers, used by Alembic.
revision = 'add_company_isolation'
down_revision = 'previous_revision_id'  # Replace with your actual previous revision ID
branch_labels = None
depends_on = None


def upgrade():
    # Create companies table
    op.create_table(
        'companies',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('subscription_plan', sa.String(), nullable=False, server_default='basic'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.UniqueConstraint('name', name='uq_companies_name')
    )
    op.create_index(op.f('ix_companies_name'), 'companies', ['name'], unique=True)
    
    # Create a default company for existing data
    default_company_id = str(uuid.uuid4())
    op.execute(f"INSERT INTO companies (id, name, subscription_plan) VALUES ('{default_company_id}', 'Default Company', 'basic')")
    
    # Add company_id column to employees table
    op.add_column('employees', sa.Column('company_id', sa.String(36), nullable=True))
    op.create_foreign_key('fk_employees_company_id', 'employees', 'companies', ['company_id'], ['id'])
    
    # Backfill company_id in employees table
    op.execute(f"UPDATE employees SET company_id = '{default_company_id}'")
    
    # Make company_id not nullable
    op.alter_column('employees', 'company_id', nullable=False)
    
    # Create a unique index for employee_id within a company
    op.create_index('ix_employees_company_id_employee_id', 'employees', ['company_id', 'employee_id'], unique=True)
    
    # Add company_id column to attendance_records table
    op.add_column('attendance_records', sa.Column('company_id', sa.String(36), nullable=True))
    op.create_foreign_key('fk_attendance_records_company_id', 'attendance_records', 'companies', ['company_id'], ['id'])
    
    # Backfill company_id in attendance_records table
    op.execute(f"UPDATE attendance_records SET company_id = '{default_company_id}'")
    
    # Make company_id not nullable
    op.alter_column('attendance_records', 'company_id', nullable=False)
    
    # Create a compound index for attendance_records
    op.create_index('ix_attendance_records_company_id_employee_id_month', 'attendance_records', ['company_id', 'employee_id', 'month'])
    
    # Add company_id column to payroll_entries table
    op.add_column('payroll_entries', sa.Column('company_id', sa.String(36), nullable=True))
    op.create_foreign_key('fk_payroll_entries_company_id', 'payroll_entries', 'companies', ['company_id'], ['id'])
    
    # Backfill company_id in payroll_entries table
    op.execute(f"UPDATE payroll_entries SET company_id = '{default_company_id}'")
    
    # Make company_id not nullable
    op.alter_column('payroll_entries', 'company_id', nullable=False)
    
    # Create a compound index for payroll_entries
    op.create_index('ix_payroll_entries_company_id_employee_id_report_month', 'payroll_entries', ['company_id', 'employee_id', 'report_month'])


def downgrade():
    # Drop foreign keys
    op.drop_constraint('fk_payroll_entries_company_id', 'payroll_entries', type_='foreignkey')
    op.drop_constraint('fk_attendance_records_company_id', 'attendance_records', type_='foreignkey')
    op.drop_constraint('fk_employees_company_id', 'employees', type_='foreignkey')
    
    # Drop indexes
    op.drop_index('ix_payroll_entries_company_id_employee_id_report_month', table_name='payroll_entries')
    op.drop_index('ix_attendance_records_company_id_employee_id_month', table_name='attendance_records')
    op.drop_index('ix_employees_company_id_employee_id', table_name='employees')
    
    # Drop company_id columns
    op.drop_column('payroll_entries', 'company_id')
    op.drop_column('attendance_records', 'company_id')
    op.drop_column('employees', 'company_id')
    
    # Drop companies table
    op.drop_index(op.f('ix_companies_name'), table_name='companies')
    op.drop_table('companies')
