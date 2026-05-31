-- Script compatível com todas as versões de Postgres (Supabase)
-- Ativar Realtime nas tabelas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'visitors'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE visitors;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;
END $$;

-- Criar as Políticas de Inserção e Leitura para Anónimos (usado no Chat do Visitante)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' AND policyname = 'Allow anonymous to insert messages'
    ) THEN
        CREATE POLICY "Allow anonymous to insert messages" ON public.messages FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' AND policyname = 'Allow anonymous to select messages'
    ) THEN
        CREATE POLICY "Allow anonymous to select messages" ON public.messages FOR SELECT USING (true);
    END IF;
END $$;
