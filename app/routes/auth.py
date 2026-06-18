from fastapi import APIRouter, HTTPException

from datetime import datetime

from app.models.user import (
    UserCreate,
    UserLogin
)

from app.database import users_collection

from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(
    user: UserCreate
):

    existing_user = users_collection.find_one(
        {"email": user.email}
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(
            user.password
        ),
        "created_at": datetime.utcnow()
    }

    result = users_collection.insert_one(
        new_user
    )

    return {
        "message": "User created successfully",
        "user_id": str(
            result.inserted_id
        )
    }


@router.post("/login")
def login(
    user: UserLogin
):

    db_user = users_collection.find_one(
        {"email": user.email}
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not verify_password(
        user.password,
        db_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(
        {
            "sub": str(
                db_user["_id"]
            ),
            "email": db_user["email"]
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }