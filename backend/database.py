import sqlite3
import pandas as pd
from pathlib import Path

DB_PATH = ":memory:"
_conn: sqlite3.Connection | None = None

CSV_PATH = Path(__file__).parent.parent / "data" / "the_game_awards.csv"


def get_conn() -> sqlite3.Connection:
    return _conn


def init_db():
    global _conn
    _conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    _conn.row_factory = sqlite3.Row

    df = pd.read_csv(CSV_PATH)
    df.columns = [c.strip().lower() for c in df.columns]
    df["winner"] = df["winner"].fillna(0).astype(int)
    df["company"] = df["company"].fillna("").astype(str).str.strip()
    df["nominee"] = df["nominee"].astype(str).str.strip()
    df["category"] = df["category"].astype(str).str.strip()
    df["voted"] = df["voted"].astype(str).str.strip()
    df.to_sql("awards", _conn, if_exists="replace", index=False)

    _conn.execute("CREATE INDEX IF NOT EXISTS idx_year ON awards(year)")
    _conn.execute("CREATE INDEX IF NOT EXISTS idx_category ON awards(category)")
    _conn.execute("CREATE INDEX IF NOT EXISTS idx_winner ON awards(winner)")
    _conn.commit()


def query(sql: str, params: tuple = ()) -> list[dict]:
    cur = _conn.execute(sql, params)
    return [dict(row) for row in cur.fetchall()]
