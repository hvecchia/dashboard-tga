# TGA Explorer

Aplicação full-stack para exploração histórica dos dados do The Game Awards (2014+).

## Pré-requisitos

- Python 3.10+ (com `py` no PATH)
- Node.js 18+

## Como rodar

### Back-end (FastAPI)

```bash
cd backend
py -3 -m pip install -r requirements.txt
py -3 -m uvicorn main:app --reload --port 8000
```

API disponível em: http://localhost:8000

### Front-end (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Aplicação disponível em: http://localhost:5173

## Stack

- **Back-end:** FastAPI + SQLite (pandas para carga do CSV)
- **Front-end:** React + TypeScript + Vite
- **Gráficos:** Recharts
- **Roteamento:** React Router DOM

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Home com estatísticas gerais |
| `/explorer` | Tabela filtrável de todos os indicados |
| `/compare` | Comparação lado a lado de jogos ou empresas |
| `/trends` | Gráficos de tendências históricas |
