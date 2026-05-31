-- ==========================================================
-- HELLO APP - CORREÇÃO RLS TEAM INVITATIONS
-- ==========================================================

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Limpar possíveis políticas antigas
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.team_invitations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.team_invitations;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.team_invitations;

-- 1. Permitir leitura a todos os utilizadores autenticados
CREATE POLICY "Enable read access for authenticated users" 
ON public.team_invitations FOR SELECT 
USING (auth.role() = 'authenticated');

-- 2. Permitir inserção (criar convites)
CREATE POLICY "Enable insert for authenticated users" 
ON public.team_invitations FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 3. Permitir eliminação (cancelar convites)
CREATE POLICY "Enable delete for authenticated users" 
ON public.team_invitations FOR DELETE 
USING (auth.role() = 'authenticated');

-- FINALIZADO: Recarregue a página da aplicação.
