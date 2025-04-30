from sqlalchemy import event
from sqlalchemy.orm import Session
from contextvars import ContextVar
from typing import Optional

# Context variable to store the current company ID
current_company_id: ContextVar[Optional[str]] = ContextVar('current_company_id', default=None)

def set_current_company_id(company_id: str):
    """Set the current company ID in the context"""
    current_company_id.set(company_id)

def get_current_company_id_from_context() -> Optional[str]:
    """Get the current company ID from the context"""
    return current_company_id.get()

def clear_current_company_id():
    """Clear the current company ID from the context"""
    current_company_id.set(None)

# Models that should have company_id automatically set
company_models = []

def register_company_model(model_class):
    """Register a model to have company_id automatically set"""
    company_models.append(model_class)
    return model_class

# SQLAlchemy event listeners to automatically set company_id
@event.listens_for(Session, 'before_flush')
def set_company_id_before_flush(session, flush_context, instances):
    company_id = get_current_company_id_from_context()
    if company_id is None:
        return
    
    # Set company_id on all new objects of registered models
    for obj in session.new:
        if any(isinstance(obj, model) for model in company_models):
            if hasattr(obj, 'company_id') and obj.company_id is None:
                obj.company_id = company_id

# FastAPI middleware to set and clear company_id
class CompanyContextMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        # Extract company_id from request (e.g., from JWT token)
        # This is a simplified example - in a real app, you would extract it from the token
        company_id = None
        if scope["type"] == "http":
            # In a real implementation, you would extract the token from headers
            # and decode it to get the company_id
            # For now, we'll just use a placeholder
            company_id = "placeholder_company_id"
        
        # Set company_id in context if available
        if company_id:
            set_current_company_id(company_id)
        
        try:
            # Process the request
            await self.app(scope, receive, send)
        finally:
            # Clear company_id from context
            clear_current_company_id()

# Example usage in FastAPI app:
"""
from fastapi import FastAPI
from .company_context import CompanyContextMiddleware, register_company_model
from .updated_payroll_models import Employee, AttendanceRecord, PayrollEntry

app = FastAPI()

# Add middleware
app.add_middleware(CompanyContextMiddleware)

# Register models
register_company_model(Employee)
register_company_model(AttendanceRecord)
register_company_model(PayrollEntry)
"""
