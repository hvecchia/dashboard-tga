# PRD — The Game Awards Explorer
**Data:** 2026-06-08
**Tipo:** Projeto de portfólio pessoal
**Status:** Aprovado para implementação

---

## 1. Visão Geral

Aplicação web full-stack para exploração e análise histórica dos dados do **The Game Awards (TGA)**, cobrindo edições de 2014 em diante. O objetivo é transformar o dataset `the_game_awards.csv` em uma experiência visual rica e interativa, servindo como peça de portfólio técnico que demonstra domínio de back-end Python e front-end React.

**Não inclui:** autenticação, contas de usuário, deploy em produção, dados em tempo real.

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Back-end | FastAPI (Python) |
| Banco de dados | SQLite (populado via CSV no startup) |
| Front-end | React + TypeScript (Vite) |
| Gráficos | Recharts |
| Tipografia | Inter (Google Fonts) |

**Arquitetura:** Monorepo com dois processos independentes em desenvolvimento local.
- Back-end: `http://localhost:8000`
- Front-end: `http://localhost:5173`
- CORS configurado para permitir comunicação entre as portas.

---

## 3. Estrutura de Pastas

```
/TGA
├── backend/
│   ├── main.py          # entrypoint FastAPI, registro de rotas
│   ├── database.py      # carga do CSV → SQLite, queries
│   ├── models.py        # schemas Pydantic para responses
│   └── data/
│       └── the_game_awards.csv
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Explorer.tsx
│   │   │   ├── Compare.tsx
│   │   │   └── Trends.tsx
│   │   ├── components/
│   │   │   ├── WinnerBadge.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── CompareCard.tsx
│   │   │   └── TrendChart.tsx
│   │   └── api/
│   │       └── index.ts  # funções de chamada à API
│   └── vite.config.ts
└── PRD.md
```

---

## 4. Dataset

**Arquivo:** `data/the_game_awards.csv`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `year` | int | Ano da cerimônia |
| `category` | string | Nome da categoria |
| `nominee` | string | Nome do jogo/pessoa/time indicado |
| `company` | string | Desenvolvedora ou publicadora |
| `winner` | int (0/1) | 1 = vencedor, 0 = indicado |
| `voted` | string | `jury` = júri, `fan` = voto popular |

**Carga:** No startup do back-end, `pandas.read_csv()` carrega o CSV e `df.to_sql()` popula uma tabela SQLite. Queries feitas com `sqlite3` ou `aiosqlite` diretamente — sem ORM.

---

## 5. API — Endpoints

### Estatísticas Gerais
```
GET /api/stats
Response: { years: int, categories: int, games: int, companies: int, winners: int }
```

### Vencedores
```
GET /api/winners?year=&category=&voted=
Response: [{ year, category, nominee, company, voted }]
```

### Indicados
```
GET /api/nominees?year=&category=&search=
Response: [{ year, category, nominee, company, winner, voted }]
```

### Metadados
```
GET /api/categories      → lista de categorias únicas
GET /api/years           → lista de anos disponíveis
```

### Histórico por Entidade
```
GET /api/companies/{name}
Response: { name, total_nominations, total_wins, history: [{ year, category, winner }] }

GET /api/games/{name}
Response: { name, total_nominations, total_wins, history: [{ year, category, winner }] }
```

### Tendências (para gráficos)
```
GET /api/trends/companies?top=5
Response: [{ company, year, wins }]   # top N empresas por vitórias ao longo dos anos

GET /api/trends/categories
Response: [{ category, year, nominees_count }]

GET /api/trends/voted
Response: [{ year, jury_count, fan_count }]
```

---

## 6. Funcionalidades e Telas

### 6.1 Home (`/`)
- Hero com título e tagline do projeto
- 4 `StatCard`s com métricas rápidas: anos cobertos, total de categorias, empresa com mais vitórias, jogo mais indicado
- Estética visual dark com dourado, remetendo ao tapete vermelho do TGA
- Link de navegação para as demais seções

### 6.2 Explorer (`/explorer`)
- `FilterBar` com dropdowns de: Ano, Categoria, Tipo de Voto (jury/fan)
- Campo de busca livre por nome de jogo ou empresa
- Tabela com colunas: Ano, Categoria, Indicado, Empresa, Tipo de Voto
- Vencedores destacados com `WinnerBadge` (ícone de troféu dourado) e borda colorida na linha
- Paginação simples (25 itens por página)

### 6.3 Comparar (`/compare`)
- Campo de busca com autocomplete para selecionar até 3 jogos **ou** 3 empresas
- `CompareCard` lado a lado para cada entidade selecionada, exibindo:
  - Total de indicações
  - Total de vitórias
  - Taxa de vitória (%)
  - Categorias ganhas (lista)
  - Anos de participação
- Botão para limpar seleção

### 6.4 Tendências (`/trends`)
- Três gráficos independentes via Recharts, com tema dark:
  1. **Vitórias por empresa ao longo dos anos** — gráfico de linhas, filtrável pelo Top N empresas
  2. **Indicados por categoria por ano** — gráfico de barras agrupadas
  3. **Jury vs. Fan ao longo dos anos** — gráfico de área empilhada

---

## 7. Design Visual

### Paleta de Cores
| Token | Valor | Uso |
|-------|-------|-----|
| `bg-primary` | `#0a0a0f` | Fundo principal |
| `bg-surface` | `#13131a` | Cards e painéis |
| `gold` | `#c9a84c` | Destaque, troféus, bordas de vencedor |
| `purple` | `#7b4fd4` | Acento secundário, hover states |
| `text-primary` | `#f0f0f0` | Texto principal |
| `text-muted` | `#888899` | Labels, metadados |

### Componentes-chave
- **`WinnerBadge`** — ícone de troféu `#c9a84c` + label "Vencedor"
- **`StatCard`** — card `bg-surface` com número grande em dourado e label em `text-muted`
- **`FilterBar`** — dropdowns com fundo `bg-surface` e borda sutil
- **`CompareCard`** — card com cabeçalho colorido por entidade e stats em grid
- **`TrendChart`** — wrapper Recharts com cores `gold`/`purple` e grid `#1e1e2e`

### Responsividade
Layout otimizado para desktop (1280px+). Breakpoints básicos para tablet (768px) e mobile (375px): colunas colapsam para vertical, tabelas tornam-se roláveis horizontalmente.

---

## 8. Critérios de Sucesso

- [ ] Back-end inicia e carrega o CSV sem erros
- [ ] Todos os endpoints retornam dados corretos e filtros funcionam
- [ ] As 4 páginas navegam sem erros
- [ ] Explorer filtra e busca corretamente, vencedores destacados visualmente
- [ ] Compare exibe até 3 entidades lado a lado com dados corretos
- [ ] Trends exibe os 3 gráficos com dados reais do dataset
- [ ] Visual dark com paleta dourada/roxa aplicada consistentemente
- [ ] CORS funciona em desenvolvimento local sem erros de rede

---

## 9. Fora do Escopo

- Autenticação ou contas de usuário
- Deploy em produção (Heroku, Vercel, etc.)
- Atualização dinâmica do dataset (CSV é estático)
- Internacionalização (i18n)
- Testes automatizados (e2e ou unitários)
- PWA ou funcionalidades offline
