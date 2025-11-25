"""
Database connection and session management.

Supports SQLite for local/desktop mode and PostgreSQL for server mode.
"""

from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine, event, inspect, text
from sqlalchemy.orm import Session, declarative_base, sessionmaker

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

    def run_migrations(self):
        """Run schema migrations for existing databases.

        This handles adding new columns to existing tables that were
        created before schema updates.
        """
        inspector = inspect(self.engine)

        # Check test_definitions table for new columns
        if "test_definitions" in inspector.get_table_names():
            columns = {col["name"] for col in inspector.get_columns("test_definitions")}

            with self.engine.connect() as conn:
                # Add filename column if missing (added in v0.32.0)
                if "filename" not in columns:
                    conn.execute(
                        text("ALTER TABLE test_definitions ADD COLUMN filename VARCHAR(255)")
                    )
                    conn.commit()

                # Add last_run_at column if missing (added in v0.32.0)
                if "last_run_at" not in columns:
                    conn.execute(text("ALTER TABLE test_definitions ADD COLUMN last_run_at DATETIME"))
                    conn.commit()

        # Check for recording_sessions table columns
        if "recording_sessions" in inspector.get_table_names():
            columns = {col["name"] for col in inspector.get_columns("recording_sessions")}

            with self.engine.connect() as conn:
                # Add any missing columns here for future migrations
                pass

    def drop_tables(self):
        """Drop all database tables (use with caution!)."""
        Base.metadata.drop_all(bind=self.engine)

    def get_session(self) -> Generator[Session]:
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
        _db_instance.run_migrations()
    return _db_instance


def reset_database():
    """Reset global database instance (for testing)."""
    global _db_instance
    _db_instance = None
