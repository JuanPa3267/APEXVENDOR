import os
from typing import Any, Optional

import dotenv
import psycopg2
from psycopg2 import Error as Psycopg2Error
from psycopg2.extras import RealDictCursor

# Load environment variables
dotenv.load_dotenv()

# --- CONNECTION CONFIGURATION ---
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
SCHEMA: str = os.getenv("SCHEMA", "ApexVendor")


def get_db_connection() -> psycopg2.extensions.connection:
    """Establishes and returns a psycopg2 connection with Azure SSL config."""
    if not all([DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]):
        raise EnvironmentError(
            "Missing environment variables (DB_HOST, DB_NAME, etc.) for DB connection. "
            "Check your .env file."
        )

    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        sslmode="require",
        cursor_factory=RealDictCursor,
    )
    return conn


def execute_query(
    sql: str, params: tuple = None, fetch_one: bool = False
) -> Optional[Any]:
    """
    Utility function to execute SQL queries with connection management
    and safe transactions.
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, params or ())

                if cur.description:
                    if fetch_one:
                        return cur.fetchone()
                    return cur.fetchall()

                conn.commit()
                return True

    except Psycopg2Error as e:
        print(f"Database error executing query: {e}")
        return None
    except EnvironmentError as e:
        print(f"Configuration error: {e}")
        return None
