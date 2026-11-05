import os

from fastapi import Request
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from argon2 import PasswordHasher
from argon2.exceptions import (
    VerifyMismatchError,
    VerificationError,
    InvalidHashError,
)

from database import Base, engine, SessionLocal
from models import User, Conversation, Message
from agent import chat_with_agent

app = FastAPI(title="Agentic Chat API")
load_dotenv()

app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ["SESSION_SECRET"],
    same_site="lax",
    https_only=False,  # Local HTTP development only
)
# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

password_hasher = PasswordHasher()


# Provide a database session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Request model for registration
class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


# Request model for login
class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=1, max_length=128)


@app.get("/")
def home():
    return {"message": "Agentic Chat API is running"}


# Register a new user
@app.post("/register", status_code=201)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(
            (User.username == data.username)
            | (User.email == data.email)
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Username or email already registered",
        )

    user = User(
        username=data.username,
        email=str(data.email),
        password_hash=password_hasher.hash(data.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        },
    }


# Log in an existing user
@app.post("/login")
def login(
    data: LoginRequest,
    request:Request,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.username == data.username)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    try:
        password_hasher.verify(
            user.password_hash,
            data.password,
        )
    except (
        VerifyMismatchError,
        VerificationError,
        InvalidHashError,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )
    request.session["user_id"] = user.id
    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "username": user.username,
        },
    }

@app.get("/me")
def get_current_user(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Not logged in",
        )

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        request.session.clear()
        raise HTTPException(
            status_code=401,
            detail="User no longer exists",
        )

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }

@app.post("/logout")
def logout(request: Request):
    request.session.clear()

    return {
        "message": "Logout successful"
    }

@app.post("/conversations", status_code=201)
def create_conversation(
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = request.session.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Not logged in",
        )

    conversation = Conversation(
        title="New chat",
        user_id=user_id,
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return {
        "id": conversation.id,
        "title": conversation.title,
        "created_at": conversation.created_at,
    }

@app.get("/conversations")
def list_conversations(
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = request.session.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Not logged in",
        )

    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id)
        .order_by(Conversation.created_at.desc())
        .all()
    )

    return [
        {
            "id": conversation.id,
            "title": conversation.title,
            "created_at": conversation.created_at,
        }
        for conversation in conversations
    ]


@app.get("/conversations/{conversation_id}/messages")
def list_messages(
    conversation_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = request.session.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Not logged in",
        )

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
        .first()
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc(), Message.id.asc())
        .all()
    )

    return [
        {
            "id": message.id,
            "role": message.role,
            "content": message.content,
            "created_at": message.created_at,
        }
        for message in messages
    ]

class CreateMessageRequest(BaseModel):
    content: str = Field(min_length=1, max_length=10000)
@app.post("/conversations/{conversation_id}/messages", status_code=201)
def create_message(
    conversation_id: int,
    data: CreateMessageRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = request.session.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Not logged in",
        )

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
        .first()
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    # 1. Save the user's message
    user_message = Message(
        conversation_id=conversation_id,
        role="user",
        content=data.content,
    )

    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    
    try:
        # 2. Run the Travel Planner agent
        assistant_content = chat_with_agent(
            message=data.content,
            conversation_id=conversation_id,
        )

        # 3. Save the agent's response
        assistant_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=assistant_content,
        )

        db.add(assistant_message)
        db.commit()
        db.refresh(assistant_message)

    except Exception as exc:
        print(f"AI agent error: {exc!r}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="The AI agent failed to generate a response.",
        ) from exc

    # 4. Return both messages to the frontend
    return {
        "user_message": {
            "id": user_message.id,
            "role": user_message.role,
            "content": user_message.content,
            "created_at": user_message.created_at,
        },
        "assistant_message": {
            "id": assistant_message.id,
            "role": assistant_message.role,
            "content": assistant_message.content,
            "created_at": assistant_message.created_at,
        },
    }
