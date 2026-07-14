## 🌐 Overview

O **Timelens** é uma plataforma web dedicada à preservação de memórias institucionais, comunitárias e coletivas, usando localização geográfica e cronologia como pilares de navegação: cada memória é um post ancorado a um local do campus e a uma linha do tempo.

Este repositório contém o **frontend** da aplicação, desenvolvido no escopo da disciplina de **Tópicos Especiais em Engenharia de Software**, sob o tema norteador *"Rede Social para Minorias"*, e consome a [API do Timelens](https://github.com/Onlyatsug/timelens-website).

> O layout original foi prototipado no Figma Make e depois evoluído em código.

---

## ✨ Features

| Feature | Description |
|---|---|
|**Mapa do campus** |como tela inicial, com locais navegáveis (Leaflet)|
|**Linha do tempo** |de memórias por local, com filtros por tag, tipo, autor e busca|
|🐦**Criação de memórias** |(posts) com foto, data do evento, local e tags|
|**Curtidas e comentários** |em cada memória|
|🔔**Notificações**| de curtidas/comentários|
|👤**Perfil de usuário** |com as memórias postadas|
|🔐 **Autenticação** |via Firebase, sincronizada com o backend|
| **Painel administrativo** |para gestão de conteúdo|

---

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** como bundler
- **Tailwind CSS 4** + **shadcn/ui** (Radix UI) para os componentes de interface
- **Firebase Auth** para autenticação
- **Leaflet / React Leaflet** para o mapa do campus
- **Motion**, **Recharts**, **Embla Carousel**, entre outras libs de suporte

## Como rodar

```bash
npm install
npm run dev
```

A aplicação sobe por padrão em `http://localhost:5173`.

### Variáveis de ambiente

A partir do arquivo `.env.example` Crie um arquivo `.env` na raiz com as credenciais do Firebase usadas em `src/lib/firebase.ts`:

Por padrão, `src/services/api.ts` aponta para a API em produção (`https://timelens-server-psi.vercel.app/api`). Para rodar contra o [backend](../timelens-backend) localmente, altere a constante `API_URL` desse arquivo para `http://localhost:4000/api`.

## Estrutura

```
src/
  main.tsx                         ponto de entrada da aplicação
  app/
    app.tsx                        componente raiz
    routes.ts                      definição das rotas
    pages/
      auth/page.tsx                página de auth
    components/                    #tranformar em pages e separa em features
      Root.tsx                     layout comum das telas autenticadas (/app)
      AppContext.tsx               contexto global: usuário atual, logout, bloqueios
      HomeMap.tsx / CampusMap.tsx  mapa do campus
      Timeline.tsx                 linha do tempo de memórias por local
      PostExpanded.tsx             detalhe de uma memória (com comentários)
      NewMemory.tsx                criação de uma nova memória
      SearchPage.tsx               busca e filtros
      ProfilePage.tsx              perfil do usuário
      NotificationsPage.tsx        notificações
      AdminPanel.tsx               painel administrativo
      Header.tsx / 
      BottomNav.tsx / 
      Breadcrumb.tsx               navegação
      ui/                          componentes shadcn/ui reutilizáveis
  features/
    auth/                          feat responsável por autenticação
  services/
    api.ts                         tipos + todas as chamadas para o backend
  lib/
    firebase.ts                    inicialização do Firebase
    authService.ts                 login, cadastro, logout, observação de sessão
```

## Rotas

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `Auth` | Login / cadastro |
| `/app` | `HomeMap` | Mapa do campus (home) |
| `/app/timeline` | `Timeline` | Linha do tempo geral |
| `/app/timeline/:locationId` | `Timeline` | Linha do tempo de um local específico |
| `/app/post/:postId` | `PostExpanded` | Detalhe de uma memória |
| `/app/new-memory` | `NewMemory` | Criar uma nova memória |
| `/app/search` | `SearchPage` | Busca e filtros |
| `/app/profile/:userId` | `ProfilePage` | Perfil do usuário |
| `/app/notifications` | `NotificationsPage` | Notificações |
| `/app/admin` | `AdminPanel` | Painel administrativo |

## Integração com o backend

Todas as chamadas HTTP passam por `src/services/api.ts`, que expõe as funções e tipos usados pelos componentes (`getPosts`, `createPost`, `toggleLikePost`, `getNotifications`, `syncUser`, etc.), refletindo 1:1 os endpoints descritos no README do [backend](../timelens-backend).

A autenticação funciona em duas camadas:
1. **Firebase** cuida do login/cadastro e emite o `idToken`.
2. O `AppContext` observa o estado de autenticação do Firebase e chama `syncUser` (`POST /auth/sync`) para espelhar/recuperar o usuário correspondente no backend.

## Roadmap / débitos técnicos conhecidos

- [ ] Refatorar para a arquitetura feature-based <-- working on
- [ ] Criar e aplicar Testes (não tem nenhum)
- [ ] Implementar React Router
- [ ] Corrigir gambiarras de Tipagem do TS
- [ ] Implementar variáveis para cores (design system)
- [ ] Tornar a `API_URL` configurável via variável de ambiente (`VITE_API_URL`) em vez de hardcoded
- [ ] Mover o bloqueio de usuários (hoje só em memória no `AppContext`) para o backend
- [ ] Revisar acessibilidade e responsividade das telas principais
