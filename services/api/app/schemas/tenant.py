from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    tenant_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TenantResponse(BaseModel):
    id: str
    name: str
    subdomain: Optional[str]
    is_active: bool

class UserResponse(BaseModel):
    id: str
    tenant_id: str
    email: EmailStr
    is_active: bool
