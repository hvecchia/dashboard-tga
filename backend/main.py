from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import init_db, query
from models import (
    StatsResponse, NomineeRow, EntityHistory,
    TrendCompanyPoint, TrendCategoryPoint, TrendVotedPoint,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="TGA Explorer API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://dashboard-tga-hailton.netlify.app"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/stats", response_model=StatsResponse)
def get_stats():
    rows = query("""
        SELECT
            COUNT(DISTINCT year)     AS years,
            COUNT(DISTINCT category) AS categories,
            COUNT(DISTINCT nominee)  AS games,
            COUNT(DISTINCT company)  AS companies,
            SUM(winner)              AS winners
        FROM awards
    """)
    r = rows[0]

    top = query("""
        SELECT company, COUNT(*) AS wins
        FROM awards
        WHERE winner = 1 AND company != ''
        GROUP BY company ORDER BY wins DESC LIMIT 1
    """)
    top_row = top[0] if top else {"company": "N/A", "wins": 0}

    return StatsResponse(
        years=r["years"],
        categories=r["categories"],
        games=r["games"],
        companies=r["companies"],
        winners=r["winners"],
        top_company=top_row["company"],
        top_company_wins=top_row["wins"],
    )


@app.get("/api/years")
def get_years():
    rows = query("SELECT DISTINCT year FROM awards ORDER BY year")
    return [r["year"] for r in rows]


@app.get("/api/categories")
def get_categories():
    rows = query("SELECT DISTINCT category FROM awards ORDER BY category")
    return [r["category"] for r in rows]


@app.get("/api/winners", response_model=list[NomineeRow])
def get_winners(
    year: int | None = Query(None),
    category: str | None = Query(None),
    voted: str | None = Query(None),
):
    conditions = ["winner = 1"]
    params: list = []
    if year:
        conditions.append("year = ?")
        params.append(year)
    if category:
        conditions.append("category = ?")
        params.append(category)
    if voted:
        conditions.append("voted = ?")
        params.append(voted)

    sql = f"SELECT * FROM awards WHERE {' AND '.join(conditions)} ORDER BY year DESC"
    return query(sql, tuple(params))


@app.get("/api/nominees", response_model=list[NomineeRow])
def get_nominees(
    year: int | None = Query(None),
    category: str | None = Query(None),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
):
    conditions = []
    params: list = []
    if year:
        conditions.append("year = ?")
        params.append(year)
    if category:
        conditions.append("category = ?")
        params.append(category)
    if search:
        conditions.append("(nominee LIKE ? OR company LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%"])

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    offset = (page - 1) * page_size
    sql = f"SELECT * FROM awards {where} ORDER BY year DESC, category LIMIT ? OFFSET ?"
    params.extend([page_size, offset])
    return query(sql, tuple(params))


@app.get("/api/nominees/count")
def get_nominees_count(
    year: int | None = Query(None),
    category: str | None = Query(None),
    search: str | None = Query(None),
):
    conditions = []
    params: list = []
    if year:
        conditions.append("year = ?")
        params.append(year)
    if category:
        conditions.append("category = ?")
        params.append(category)
    if search:
        conditions.append("(nominee LIKE ? OR company LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%"])

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    rows = query(f"SELECT COUNT(*) AS total FROM awards {where}", tuple(params))
    return {"total": rows[0]["total"]}


@app.get("/api/companies/search")
def search_companies(q: str = Query("")):
    rows = query(
        "SELECT DISTINCT company FROM awards WHERE company LIKE ? AND company != '' ORDER BY company LIMIT 20",
        (f"%{q}%",),
    )
    return [r["company"] for r in rows]


@app.get("/api/games/search")
def search_games(q: str = Query("")):
    rows = query(
        "SELECT DISTINCT nominee FROM awards WHERE nominee LIKE ? ORDER BY nominee LIMIT 20",
        (f"%{q}%",),
    )
    return [r["nominee"] for r in rows]


@app.get("/api/companies/{name}", response_model=EntityHistory)
def get_company(name: str):
    rows = query("SELECT * FROM awards WHERE company = ? ORDER BY year", (name,))
    wins = [r for r in rows if r["winner"] == 1]
    categories_won = list({r["category"] for r in wins})
    win_rate = round(len(wins) / len(rows) * 100, 1) if rows else 0.0
    return EntityHistory(
        name=name,
        total_nominations=len(rows),
        total_wins=len(wins),
        win_rate=win_rate,
        categories_won=sorted(categories_won),
        history=rows,
    )


@app.get("/api/games/{name}", response_model=EntityHistory)
def get_game(name: str):
    rows = query("SELECT * FROM awards WHERE nominee = ? ORDER BY year", (name,))
    wins = [r for r in rows if r["winner"] == 1]
    categories_won = list({r["category"] for r in wins})
    win_rate = round(len(wins) / len(rows) * 100, 1) if rows else 0.0
    return EntityHistory(
        name=name,
        total_nominations=len(rows),
        total_wins=len(wins),
        win_rate=win_rate,
        categories_won=sorted(categories_won),
        history=rows,
    )


@app.get("/api/trends/companies")
def trends_companies(top: int = Query(5, ge=1, le=20)):
    top_companies = query(
        """
        SELECT company FROM awards WHERE winner = 1 AND company != ''
        GROUP BY company ORDER BY COUNT(*) DESC LIMIT ?
        """,
        (top,),
    )
    names = [r["company"] for r in top_companies]
    placeholders = ",".join("?" * len(names))
    rows = query(
        f"""
        SELECT company, year, COUNT(*) AS wins FROM awards
        WHERE winner = 1 AND company IN ({placeholders})
        GROUP BY company, year ORDER BY year, wins DESC
        """,
        tuple(names),
    )
    return rows


@app.get("/api/trends/categories")
def trends_categories():
    rows = query(
        """
        SELECT category, year, COUNT(*) AS nominees_count FROM awards
        GROUP BY category, year ORDER BY year, category
        """
    )
    return rows


@app.get("/api/trends/voted")
def trends_voted():
    rows = query(
        """
        SELECT year,
            SUM(CASE WHEN voted = 'jury' THEN 1 ELSE 0 END) AS jury_count,
            SUM(CASE WHEN voted = 'fan'  THEN 1 ELSE 0 END) AS fan_count
        FROM awards GROUP BY year ORDER BY year
        """
    )
    return rows
