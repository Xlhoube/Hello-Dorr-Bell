-- ==========================================================
-- HELLO APP - ATIVAÇÃO DE CONVITES DE EQUIPA (WEBHOOK)
-- Executar este SQL no Dashboard do Supabase (SQL Editor)
-- ==========================================================

-- 1. Certifique-se que o schema e as extensões corretas para requests HTTP estão ativas
create extension if not exists pg_net with schema extensions;

-- 2. Criar a Função PostgreSQL que disparará o envio de email
create or replace function public.trigger_send_team_invite()
returns trigger as $$
declare
  edge_function_url text := 'https://wmskixxrxqnbwrsryrtu.supabase.co/functions/v1/send-invite-email';
  request_body jsonb;
begin
  -- Preparar o corpo do pedido com os dados do convite
  request_body := json_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', row_to_json(NEW)
  )::jsonb;

  -- Efetuar POST para a Edge Function de forma ASSÍNCRONA usando pg_net
  perform net.http_post(
    url := edge_function_url,
    body := request_body,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );

  return NEW;
end;
$$ language plpgsql security definer;

-- 3. Criar o Trigger que ouve a tabela "team_invitations"
drop trigger if exists on_team_invitation_insert on public.team_invitations;

create trigger on_team_invitation_insert
  after insert on public.team_invitations
  for each row
  execute function public.trigger_send_team_invite();
