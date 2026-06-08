const BASE = "http://localhost:8000/api";

async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface Stats {
  years: number;
  categories: number;
  games: number;
  companies: number;
  winners: number;
  top_company: string;
  top_company_wins: number;
}

export interface Nominee {
  year: number;
  category: string;
  nominee: string;
  company: string;
  winner: number;
  voted: string;
}

export interface EntityHistory {
  name: string;
  total_nominations: number;
  total_wins: number;
  win_rate: number;
  categories_won: string[];
  history: Nominee[];
}

export const api = {
  stats: () => get<Stats>("/stats"),
  years: () => get<number[]>("/years"),
  categories: () => get<string[]>("/categories"),

  winners: (params?: { year?: number; category?: string; voted?: string }) =>
    get<Nominee[]>("/winners", params),

  nominees: (params?: { year?: number; category?: string; search?: string; page?: number; page_size?: number }) =>
    get<Nominee[]>("/nominees", params),

  nomineesCount: (params?: { year?: number; category?: string; search?: string }) =>
    get<{ total: number }>("/nominees/count", params),

  searchCompanies: (q: string) => get<string[]>("/companies/search", { q }),
  searchGames: (q: string) => get<string[]>("/games/search", { q }),

  company: (name: string) => get<EntityHistory>(`/companies/${encodeURIComponent(name)}`),
  game: (name: string) => get<EntityHistory>(`/games/${encodeURIComponent(name)}`),

  trendsCompanies: (top = 5) => get<{ company: string; year: number; wins: number }[]>("/trends/companies", { top }),
  trendsCategories: () => get<{ category: string; year: number; nominees_count: number }[]>("/trends/categories"),
  trendsVoted: () => get<{ year: number; jury_count: number; fan_count: number }[]>("/trends/voted"),
};
