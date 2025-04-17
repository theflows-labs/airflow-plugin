from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from ..models.base import Base

# Get database URL from environment variable or use default
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./flows.db')

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith('sqlite') else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 