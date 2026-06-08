from pydantic import BaseModel


class StatsResponse(BaseModel):
    years: int
    categories: int
    games: int
    companies: int
    winners: int
    top_company: str
    top_company_wins: int


class NomineeRow(BaseModel):
    year: int
    category: str
    nominee: str
    company: str
    winner: int
    voted: str


class EntityHistory(BaseModel):
    name: str
    total_nominations: int
    total_wins: int
    win_rate: float
    categories_won: list[str]
    history: list[dict]


class TrendCompanyPoint(BaseModel):
    company: str
    year: int
    wins: int


class TrendCategoryPoint(BaseModel):
    category: str
    year: int
    nominees_count: int


class TrendVotedPoint(BaseModel):
    year: int
    jury_count: int
    fan_count: int
