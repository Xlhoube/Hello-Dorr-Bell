# MEMORY.md - HELLO Project

## Informação Geral
- **Nome do Projeto:** HELLO - Sistema de Portaria Inteligente
- **Versão Atual:** v1.1.62
- **Data de Atualização:** 2026-11-01
- **Ambiente:** Local-First / PWA (Web, Telemóvel)
- **Nível de Risco:** 3 (Acesso e segurança de residentes e visitantes)

## Stack Tecnológica
- **Frontend:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3
- **PWA & Offline:** vite-plugin-pwa, Workbox, Service Worker (`src/sw.ts`), Web Push / VAPID
- **Comunicação Vídeo:** Daily.co WebRTC
- **Base de Dados & Backend:** Supabase (PostgreSQL, Row Level Security, Realtime, Edge Functions Deno)
- **Qualidade & Testes:** ESLint (Flat Config com typescript-eslint v7), Vitest 1.6

## Histórico de Decisões e Aprendizagens (ADR / Log)
- `[2026-11-01]` | Reforço de Segurança e Qualidade de Código | Desvinculação do `.env` do Git, adição de `.env*` ao `.gitignore`, migração do lint para Flat Config com zero erros, introdução do Vitest para testes automatizados e higienização de chaves no trigger SQL | Cobertura de testes em componentes React ainda a expandir | A Flat Config no ESLint v8 requer typescript-eslint v7 para interoperabilidade com Vite 5.

## Estado das Funcionalidades
- [x] PWA com toques e áudio pré-carregado
- [x] Videochamadas via Daily.co
- [x] Chat em tempo real e notificações push
- [x] Blindagem do `.env` e `.gitignore`
- [x] Pipeline de Lint sem erros (`npm run lint`)
- [x] Suite de testes unitários funcional (`npm test`)
- [ ] Expandir testes unitários a hooks (`useVisitors`) e componentes de UI
