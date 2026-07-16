## 🌐 Overview

O **Timelens** é uma plataforma web dedicada à preservação de memórias institucionais, comunitárias e coletivas, usando localização geográfica e cronologia como pilares de navegação: cada memória é um post ancorado a um local do campus e a uma linha do tempo.

Este repositório contém o **frontend** da aplicação, desenvolvido no escopo da disciplina de **Tópicos Especiais em Engenharia de Software**, sob o tema norteador *"Rede Social para Minorias"*, e consome a [API do Timelens](https://github.com/Onlyatsug/timelens-website).

> O layout original foi prototipado no Figma Make e depois evoluído em código.

---

## ✨ Features

| Feature | Description |
|---|---|
|🐦**Criação de memórias** | (Posts) com foto, data do evento, local e tags |
|💖**Curtidas e comentários** |em cada memória|
|🗺️**Mapa do campus** | Tela inicial, com locais navegáveis (Leaflet). |
|⏱️**Linha do tempo** | Memórias por local, com filtros por tag, tipo, autor e busca. |
|👤**Perfil de usuário** | Biografia e memórias postadas. |
|🔔**Notificações**| Curtidas/comentários. |
|🔐 **Autenticação** | E-mail institucional, sincronizado com o backend. |
|🗽**Painel administrativo** | Gestão e moderação de conteúdo. |

---

## 🛠️ Tech Stack

| Tech | Description |
|---|---|
| **React 18** + **TypeScript** | Library & linguagem. |
| **Vite** | bundler |
| **Tailwind CSS 4** + **shadcn/ui** | Componentes de interface. |
| **Firebase Auth** | Autenticação. |
| **Leaflet / React Leaflet** | Mapa do campus. |
| **Motion**, **Recharts**, **Embla Carousel** | Essas e outras libs de suporte. |

---

## 📁 Structure

```
src/
├── main.tsx                         # ponto de entrada da aplicação
│   ├── app/
│   ├── app.tsx                      # componente raiz
│   └── routes.ts                    # definição das rotas
│
├── pages/
│   └── auth/page.tsx                # página de auth
│
├── components/                      # tranformar em pages e separa em features
│   ├── Root.tsx                     # layout comum das telas autenticadas (/app)
│   ├── AppContext.tsx               # contexto global: usuário atual, logout, bloqueios
│   ├── HomeMap.tsx / CampusMap.tsx  # mapa do campus
│   ├── Timeline.tsx                 # linha do tempo de memórias por local
│   ├── PostExpanded.tsx             # detalhe de uma memória (com comentários)
│   ├── NewMemory.tsx                # criação de uma nova memória
│   ├── SearchPage.tsx               # busca e filtros
│   ├── ProfilePage.tsx              # perfil do usuário
│   ├── NotificationsPage.tsx        # notificações
│   ├── AdminPanel.tsx               # painel administrativo
│   ├── Header.tsx / 
│   ├── BottomNav.tsx / 
│   ├── Breadcrumb.tsx               # navegação
│   └── ui/                          # componentes shadcn/ui reutilizáveis
│
├── features/
│   └── auth/                        # feat responsável por autenticação
│
├── services/
│   └── api.ts                       # tipos + todas as chamadas para o backend
│
└── lib/
    ├── firebase.ts                  # inicialização do Firebase
    └── authService.ts               # login, cadastro, logout, observação de sessão

```
## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/onlyatsug/timelens-website
cd timelens-website

# 2. Install all dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Start the development 
npm run dev
```
> A aplicação sobe por padrão em `http://localhost:5173`.

## 🔐 Environment Variables

A partir do arquivo `.env.example` Crie um arquivo `.env` na raiz com as credenciais do Firebase usadas em `src/lib/firebase.ts`:

```bash
# ─── Firebase ───────────────────────────────────────────────
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_fire_auth"
VITE_FIREBASE_PROJECT_ID="your_fire_id_project"
VITE_FIREBASE_STORAGE_BUCKET="a bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_id"
VITE_FIREBASE_APP_ID="your_app_id"

```
Observação:
> Por padrão, `src/services/api.ts` aponta para a API em produção (`https://timelens-server-psi.vercel.app/api`). Para rodar contra o [backend](../timelens-backend) localmente, altere a constante `API_URL` desse arquivo para `http://localhost:4000/api`.

## Roadmap / débitos técnicos conhecidos

- [ ] Refatorar para a arquitetura feature-based. <-- working on
- [ ] Criar e aplicar Testes (não tem nenhum).
- [ ] Implementar variáveis para cores (design system).
- [ ] Tornar a `API_URL` configurável via variável de ambiente (`VITE_API_URL`) em vez de hardcoded.
- [ ] Mover o bloqueio de usuários (hoje só em memória no `AppContext`) para o backend.
- [ ] Revisar acessibilidade e responsividade das telas principais.
