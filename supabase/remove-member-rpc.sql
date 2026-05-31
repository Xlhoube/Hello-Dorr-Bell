-- ==========================================
-- HELLO APP - REMOVE ORGANIZATION MEMBER RPC (FIXED)
-- ==========================================

-- Remover a função antiga para evitar ambiguidades
DROP FUNCTION IF EXISTS public.remove_organization_member(uuid);

CREATE OR REPLACE FUNCTION public.remove_organization_member(p_member_id uuid)
RETURNS void AS $$
DECLARE
    caller_org_id uuid;
    caller_role text;
    target_org_id uuid;
BEGIN
    -- Obter a org_id e role de quem está a chamar
    SELECT organization_id, role INTO caller_org_id, caller_role
    FROM public.profiles
    WHERE id = auth.uid();

    -- Obter a org_id do membro alvo
    SELECT organization_id INTO target_org_id
    FROM public.profiles
    WHERE id = p_member_id;

    -- Verificar permissões (deve ser super_admin e da mesma organização)
    IF caller_role != 'super_admin' OR caller_org_id IS NULL OR caller_org_id != target_org_id THEN
        RAISE EXCEPTION 'Ação bloqueada: Não tem permissões de super_admin para remover membros ou as organizações não coincidem.';
    END IF;

    -- Remover o membro da organização
    UPDATE public.profiles
    SET organization_id = NULL, role = 'user'
    WHERE id = p_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Forçar atualização da cache do PostgREST
NOTIFY pgrst, 'reload schema';
