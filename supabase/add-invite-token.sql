-- ==========================================================
-- HELLO APP - CONVITES VIA TOKEN (v0.0.98)
-- Executar este SQL no Dashboard do Supabase (SQL Editor)
-- ==========================================================

-- 1. Adicionar coluna "token" para permitir convites genéricos
ALTER TABLE public.team_invitations 
ADD COLUMN IF NOT EXISTS token UUID DEFAULT gen_random_uuid();

-- 2. Tornar a coluna "email" opcional (pode ser nula se usarmos apenas token)
ALTER TABLE public.team_invitations 
ALTER COLUMN email DROP NOT NULL;

-- 3. Criar índice para buscas rápidas por token
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON public.team_invitations(token);

-- ADIÇÃO DE ROLE (v0.0.98)
-- Garante que o registo via token herda a role correta (resident por defeito)
ALTER TABLE public.team_invitations 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'resident';

-- NOTA: Os convites antigos continuarão a funcionar via email.
-- Os novos convites podem ser criados apenas com organization_id e gerarão um token automaticamente.
