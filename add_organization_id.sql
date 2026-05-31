-- Adicionar coluna organization_id à tabela visitors caso não exista
ALTER TABLE public.visitors 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Criar um index para perfomance (visto que o Dashboard filtra muito por esta coluna)
CREATE INDEX IF NOT EXISTS visitors_organization_id_idx ON public.visitors(organization_id);

-- Opcional: Para garantir que as notificações de Real-time enviam todos os dados corretamente (incluindo em UPDATE)
ALTER TABLE public.visitors REPLICA IDENTITY FULL;
