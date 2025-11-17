"""
Database connection and session management.

Supports SQLite for local/desktop mode and PostgreSQL for server mode.
"""

import os
from pathlib import Path
from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, Session, declarative_base

# Create base class for models
Base = declarative_base()


def _enable_sqlite_foreign_keys(dbapi_conn, connection_record):
    """Enable foreign key constraints for SQLite."""
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


class Database:
    """Database connection manager."""

    def __init__(self, database_url: str | None = None):
        """Initialize database connection.

        Args:
            database_url: Database URL (default: SQLite in ~/.sentinel/sentinel.db)
        """
        if database_url is None:
            # Default to SQLite in user's home directory
            sentinel_dir = Path.home() / ".sentinel"
            sentinel_dir.mkdir(exist_ok=True)
            db_path = sentinel_dir / "sentinel.db"
            database_url = f"sqlite:///{db_path}"

        self.database_url = database_url
        self.engine = create_engine(
            database_url,
            echo=False,  # Set to True for SQL debugging
            pool_pre_ping=True,  # Verify connections before using
            connect_args={"check_same_thread": False} if "sqlite" in database_url else {},
        )

        # Enable foreign keys for SQLite
        if "sqlite" in database_url:
            event.listen(self.engine, "connect", _enable_sqlite_foreign_keys)

        # Create session factory
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine,
        )

    def create_tables(self):
        """Create all database tables."""
        Base.metadata.create_all(bind=self.engine)

    def drop_tables(self):
        """Drop all database tables (use with caution!)."""
        Base.metadata.drop_all(bind=self.engine)

    def get_session(self) -> Generator[Session, None, None]:
        """Get database session with automatic cleanup.

        Yields:
            Database session

        Example:
            ```python
            db = Database()
            for session in db.get_session():
                # Use session
                result = session.query(TestDefinition).all()
            ```
        """
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()


# Global database instance
_db_instance: Database | None = None


def get_database(database_url: str | None = None) -> Database:
    """Get global database instance.

    Args:
        database_url: Optional database URL (only used on first call)

    Returns:
        Database instance
    """
    global _db_instance
    if _db_instance is None:
        _db_instance = Database(database_url)
        _db_instance.create_tables()
    return _db_instance


def reset_database():
    """Reset global database instance (for testing)."""
    global _db_instance
    _db_instance = None
