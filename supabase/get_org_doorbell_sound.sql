-- ==========================================
-- HELLO APP - GET ORGANIZATION DOORBELL SOUND RPC
-- ==========================================

DROP FUNCTION IF EXISTS public.get_org_doorbell_sound(uuid);

CREATE OR REPLACE FUNCTION public.get_org_doorbell_sound(p_org_id uuid)
RETURNS text AS $$
DECLARE
    v_sound text;
BEGIN
    -- Obter o toque de campainha do "super_admin" da organização
    -- Se não houver, pega o do membro mais antigo
    SELECT doorbell_sound INTO v_sound
    FROM public.profiles
    WHERE organization_id = p_org_id AND doorbell_sound IS NOT NULL
    ORDER BY role = 'super_admin' DESC, created_at ASC
    LIMIT 1;
    
    RETURN COALESCE(v_sound, '/Ring01.mp3');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Forçar atualização da cache do PostgREST
NOTIFY pgrst, 'reload schema';
