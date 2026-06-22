"""
database.py – Database Connection (Supabase PostgreSQL)
Esports Team Management System
Author: Ilhamuddin | f2024408176

Setup:
  1. Create a Supabase project at https://supabase.com
  2. Go to Settings → Database → Connection String
  3. Copy the connection string and set it in your .env file
  4. Or replace DATABASE_URL below directly (not recommended for production)
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# -------------------------------------------------------
# DATABASE URL
# Priority: Environment variable → fallback SQLite (for local dev)
# -------------------------------------------------------
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    # Fallback: local SQLite for development/testing without Supabase
    "sqlite:///./esportsms.db"
)

# Supabase PostgreSQL URL format:
# postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres

# Fix for Railway + Supabase: replace postgres:// with postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# -------------------------------------------------------
# SQLAlchemy Engine
# -------------------------------------------------------
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,   # Reconnect on dropped connections
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# -------------------------------------------------------
# Dependency: get DB session
# -------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
