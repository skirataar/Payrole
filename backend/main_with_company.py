from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import os
from datetime import timedelta

from .database import get_db, engine
from .updated_payroll_models import Base, Company, Employee, AttendanceRecord, PayrollEntry
from .company_api import router as company_router
from .company_auth import create_access_token, get_current_user_token, ACCESS_TOKEN_EXPIRE_MINUTES
from .company_context import CompanyContextMiddleware, register_company_model

# Initialize database
Base.metadata.create_all(bind=engine)

# Register models for automatic company_id attachment
register_company_model(Employee)
register_company_model(AttendanceRecord)
register_company_model(PayrollEntry)

# Create FastAPI app
app = FastAPI(title="Payroll Pro API", version="2.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add company context middleware
app.add_middleware(CompanyContextMiddleware)

# Include company API router
app.include_router(company_router, prefix="/api", tags=["company"])

# Authentication endpoint
@app.post("/api/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # In a real implementation, you would validate the user credentials
    # against your database and retrieve the user's company_id
    
    # For this example, we'll use a simplified approach
    # Assume the username is the email and we look up the user in the database
    
    # Check if it's an admin login
    if form_data.username == "admin@payrollpro.com" and form_data.password == "admin123":
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": "admin", "role": "admin"},
            expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    
    # For regular users, find their company
    # This is a simplified example - in a real app, you would have a users table
    # and look up the user's company_id from there
    company = db.query(Company).filter(Company.name == form_data.username).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token with company_id
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username, "company_id": company.id, "role": "user"},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# User info endpoint
@app.get("/api/users/me")
async def read_users_me(token_data = Depends(get_current_user_token)):
    return {
        "username": token_data.user_id,
        "company_id": token_data.company_id,
        "role": token_data.role
    }

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment variable for Render.com compatibility
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
