"""
Database engine and session management for NanoPrompt.
Uses async SQLAlchemy with SQLite (aiosqlite driver).
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./nanoprompt.db")
SYNC_DATABASE_URL = DATABASE_URL.replace("sqlite+aiosqlite", "sqlite")

engine = create_async_engine(DATABASE_URL, echo=False)
sync_engine = create_engine(SYNC_DATABASE_URL, echo=False)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
sync_session_maker = sessionmaker(
    sync_engine,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


async def init_db():
    """Create all tables if they don't exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncSession:
    """Dependency: yields an async database session."""
    async with async_session() as session:
        yield session

def get_sync_db():
    """Dependency: yields a sync database session."""
    with sync_session_maker() as session:
        yield session
