from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from typing import Optional
from datetime import datetime, timedelta
import os

from .database import get_db
from .updated_payroll_models import Company, Employee

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Token payload model
class TokenData:
    def __init__(self, user_id: str = None, company_id: str = None, role: str = None):
        self.user_id = user_id
        self.company_id = company_id
        self.role = role

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user_token(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        company_id: str = payload.get("company_id")
        role: str = payload.get("role", "user")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id, company_id=company_id, role=role)
        return token_data
    except JWTError:
        raise credentials_exception

async def get_current_company_id(token_data: TokenData = Depends(get_current_user_token)):
    if not token_data.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not associated with any company",
        )
    return token_data.company_id

async def get_company_filter(
    company_id: str = Depends(get_current_company_id),
    db: Session = Depends(get_db)
):
    """
    Returns a function that can be used to filter queries by company_id.
    
    Usage example:
    
    @app.get("/api/employees")
    async def get_employees(company_filter = Depends(get_company_filter)):
        employees = db.query(Employee).filter(company_filter(Employee)).all()
        return employees
    """
    # Check if company exists
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )
    
    # Return a filter function that can be applied to any model with company_id
    def filter_by_company(model):
        return model.company_id == company_id
    
    return filter_by_company

# Admin-only access control
async def admin_required(token_data: TokenData = Depends(get_current_user_token)):
    if token_data.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return token_data
