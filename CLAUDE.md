# TGA Explorer — CLAUDE.md

Projeto de portfólio full-stack para exploração histórica dos dados do The Game Awards (2014+).

## Como rodar

```bash
# Back-end (porta 8000)
cd backend
py -3 -m uvicorn main:app --reload --port 8000

# Front-end (porta 5173)
cd frontend
npm run dev
```

Instalar dependências na primeira vez:
```bash
py -3 -m pip install -r backend/requirements.txt
cd frontend && npm install
```

## Stack

| Camada | Tecnologia |
|--------|------------|
| Back-end | FastAPI + SQLite (via pandas, sem ORM) |
| Front-end | React + TypeScript + Vite |
| Gráficos | Recharts |
| Python | `py -3` (Windows launcher) — não `python` nem `python3` |

## Arquitetura

```
/TGA
├── backend/
│   ├── main.py       # entrypoint FastAPI + todas as rotas
│   ├── database.py   # carrega CSV → SQLite na memória no startup
│   ├── models.py     # schemas Pydantic
│   └── data/the_game_awards.csv  # ← fonte única de dados (estático)
├── frontend/src/
│   ├── api/index.ts        # todas as chamadas HTTP ao back-end
│   ├── components/         # WinnerBadge, StatCard, FilterBar, CompareCard
│   └── pages/              # Home, Explorer, Compare, Trends
└── data/the_game_awards.csv
```

## Dataset

Colunas: `year`, `category`, `nominee`, `company`, `winner` (0/1), `voted` (jury/fan).
Anos disponíveis: 2014–2019. O CSV é estático — não há atualização em tempo real.

O banco SQLite é criado **em memória** a cada startup do back-end (`database.py:init_db()`). Não persiste entre restarts.

## Convenções do back-end

- Queries SQL diretas com `sqlite3` — sem SQLAlchemy ou outro ORM
- Todos os endpoints ficam em `backend/main.py`
- Novos endpoints seguem o padrão `/api/<recurso>`
- CORS liberado apenas para `http://localhost:5173`

## Convenções do front-end

- Toda comunicação com a API passa por `frontend/src/api/index.ts` — não fazer `fetch` direto nos componentes
- Interfaces TypeScript exportadas de `api/index.ts` devem ser importadas com `import type` nos componentes (não `import { MinhaInterface }` — isso quebra o Vite em runtime)
- Estilos via inline `style={{}}` — não há arquivo CSS de componente nem CSS Modules
- Sem biblioteca de UI externa (sem MUI, Chakra, etc.)

## Paleta de cores

| Token | Valor | Uso |
|-------|-------|-----|
| bg-primary | `#0a0a0f` | Fundo da página |
| bg-surface | `#13131a` | Cards e painéis |
| gold | `#c9a84c` | Destaque principal, vencedores |
| purple | `#7b4fd4` | Acento secundário |
| text-primary | `#f0f0f0` | Texto normal |
| text-muted | `#888899` | Labels, metadados |

## Fora do escopo

Não implementar: autenticação, contas de usuário, deploy, i18n, testes automatizados, atualização do dataset, PWA.
