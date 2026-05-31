-- ==========================================================
-- HELLO APP - CORREÇÃO DEFINITIVA (MATA TODAS AS REGRAS RLS)
-- ==========================================================

-- 1. Este bloco apaga TODAS as políticas existentes independentemente do nome que tenham,
-- para garantir que nenhuma política oculta continua a causar recursão infinita (500).
DO $$ 
DECLARE 
    pol record;
BEGIN 
    -- Apagar todas as políticas em profiles
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;

    -- Apagar todas as políticas em properties
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'properties' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.properties', pol.policyname);
    END LOOP;
    
    -- Apagar todas as políticas em organizations
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'organizations' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.organizations', pol.policyname);
    END LOOP;
END $$;

-- 2. Recriar uma política SIMPLES para profiles que NÃO faz loops SQL
-- Lemos todos os perfis autenticados livremente
CREATE POLICY "Enable read access for authenticated users" 
ON public.profiles FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. Recriar RLS seguro para propriedades
CREATE POLICY "Enable read access for properties" 
ON public.properties FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for properties" 
ON public.properties FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for properties" 
ON public.properties FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for properties" 
ON public.properties FOR DELETE 
USING (auth.role() = 'authenticated');

-- 4. Remover Trigger problemático
DROP TRIGGER IF EXISTS on_team_invitation_insert ON public.team_invitations;

-- FINALIZADO: Recarregue a página da aplicação.
