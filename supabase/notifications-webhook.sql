-- ==========================================
-- HELLO APP - SISTEMA DE ALERTAS (WEBHOOK)
-- Executar este SQL no Dashboard do Supabase
-- ==========================================

-- 1. Certifique-se que o schema e as extensões corretas para requests HTTP estão ativas
create extension if not exists pg_net with schema extensions;

-- 2. Criar a Função PostgreSQL que fará o trigger HTTP
create or replace function public.trigger_notify_resident()
returns trigger as $$
declare
  edge_function_url text := 'https://wmskixxrxqnbwrsryrtu.supabase.co/functions/v1/notify-resident';
  request_body jsonb;
begin
  -- Preparar o corpo do pedido (enviamos o registo do visitor acabado de inserir)
  request_body := json_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', row_to_json(NEW)
  )::jsonb;

  -- Efetuar POST para a Edge Function de forma ASSÍNCRONA usando pg_net
  perform net.http_post(
    url := edge_function_url,
    body := request_body,
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' -- O MODELO IRÁ ADICIONAR O SERVICE_ROLE_KEY NO CHAT
    )::jsonb
  );

  return NEW;
end;
$$ language plpgsql security definer;

-- 3. Criar o Trigger que ouve a tabela "visitors"
drop trigger if exists visitor_notification_trigger on public.visitors;

create trigger visitor_notification_trigger
  after insert or update of status on public.visitors
  for each row
  when (NEW.status = 'pending')
  execute function public.trigger_notify_resident();
