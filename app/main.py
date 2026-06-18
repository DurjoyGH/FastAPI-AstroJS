from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import db
from app.routes.auth import router as auth_router
from app.routes.chat import router as chat_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4321",
        "http://127.0.0.1:4321",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    auth_router
)

app.include_router(
    chat_router
)


@app.get("/")
def root():
    return {
        "message": "Football Chatbot API Running"
    }


@app.get("/db-test")
def db_test():
    db.command("ping")

    return {
        "status": "connected"
    }
