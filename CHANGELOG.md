# Changelog

## [1.1.41] - 2026-03-22
### Corrigido
- **Segurança (RLS):** Restauradas as políticas de acesso à tabela `organizations` que impediam novos registos.
- **Estabilidade:** Resolvido erro de coerção JSON no Dashboard quando o perfil do utilizador não é encontrado, utilizando `maybeSingle()`.
- **Feedback:** Melhoradas as mensagens de erro em caso de falha na base de dados.


## [1.1.38] - 2026-03-22
### Corrigido
- **Service Worker:** Corrigido erro `Silent notifications must not specify vibration patterns`. Agora a vibração e o som são removidos dinamicamente se a app estiver em foco, permitindo que a notificação seja exibida sem crashar o SW.

## [1.0.78] - 2026-03-22
### Corrigido
- [x] Resolver Erro CORS na Edge Function
- [x] Corrigir Erro 400 no Upsert da Subscrição
- [x] Corrigir Erro de Vibração no SW (v1.1.38)
- [x] Atualizar para versão 1.1.38 e rodar build


## [1.0.77] - 2026-03-22
### Adicionado
- **Botão de Teste:** Adicionado um botão "Testar Notificações" nas Definições. Este botão dispara um alerta diretamente no telemóvel, ajudando a diagnosticar se o problema é do dispositivo ou da base de dados.


## [1.0.76] - 2026-03-22
### Corrigido
- **Segurança Webhook:** Atualizado o script do trigger SQL para suportar a `SERVICE_ROLE_KEY`. Isto corrige potenciais erros de autorização (401) quando o Supabase tenta avisar a Edge Function de um novo visitante.
- **Logs de Diagnóstico:** Adicionado rastreio detalhado na Edge Function para monitorizar o ciclo de vida de cada notificação.


## [1.0.75] - 2026-03-21
### Corrigido
- **Auto-Sync Push:** Otimização do sistema de subscrição para detetar se as chaves VAPID do servidor mudaram. Se houver desfasamento, a aplicação renova a subscrição automaticamente, garantindo que as notificações não se percam.


## [1.0.74] - 2026-03-21
### Alterado
- **Performance de Som:** Todos os ficheiros de som (Ring01, Ring02, Ring03) são agora pré-carregados (precached) na PWA. Isto garante que o som toca mesmo sem internet ou com o ecrã desligado.
- **Diagnóstico:** Adicionado log de erro à Função Edge para detetar se as chaves VAPID estão em falta nos segredos do Supabase.


## [1.0.73] - 2026-03-21
### Alterado
- **Fluxo de Chat:** A conversa agora fecha-se automaticamente assim que um visitante é **recusado** ou a visita é **concluída**. Isto torna a gestão de fila mais rápida.


## [1.0.72] - 2026-03-21
### Adicionado
- **Sincronização de Som Realtime:** Agora, quando mudas o som nas Definições, o Dashboard (Monitor de Visitantes) atualiza o som instantaneamente sem precisares de atualizar a página.
- **Deteção Automática:** Adicionado listener para a tabela `profiles`.


## [1.0.71] - 2026-03-21
### Corrigido
- **Fiabilidade Background:** Revertida a lógica que bloqueava notificações quando a App estava aberta, pois impedia o funcionamento com o ecrã bloqueado.
- **Som Inteligente:** A notificação push agora é silenciosa apenas se a Janela estiver focada, permitindo que o Dashboard toque o som. Se o ecrã estiver desligado ou a App em background, a notificação toca com som total.


## [1.0.70] - 2026-03-21
### Corrigido
- **Som Duplicado:** Otimização do Service Worker para não disparar notificações push quando a aplicação já está aberta e em foco, evitando que toquem dois sons em simultâneo.
- **Sincronização:** Melhorada a deteção de janelas ativas para priorizar o som do Dashboard.


## [1.0.68] - 2026-03-21
### Alterado
- **Push Notifications:** Unificação das chaves VAPID em todo o projeto para garantir a entrega de notificações em todos os dispositivos.
- **Segurança:** Removidas chaves inconsistentes e gerado um novo par seguro.


## [1.0.67] - 2026-03-21
### Corrigido
- **Layout Mobile:** Otimização de todo o dashboard para telemóveis.
  - Correção de elementos sobrepostos no chat de visitantes.
  - Ajuste de alturas fixas que causavam cortes no ecrã.
  - Redução de margens e paddings excessivos em ecrãs pequenos.
  - Melhoria da responsividade no menu de definições e seletor de línguas.


## [1.0.66] - 2026-03-21
### Corrigido
- **Som em Background:** Melhorada a fiabilidade das notificações e sons quando o ecrã está desligado.
- **Sincronização de Som:** Resolvido problema de fecho (closure) que impedia o dashboard de tocar o som correto logo após a alteração nas definições.


## [1.0.65] - 2026-03-21
### Corrigido
- **Som da Campainha:** Corrigido o problema onde a escolha do som da campainha não era respeitada. O som agora é guardado na conta do utilizador (base de dados) e sincronizado entre dispositivos.


## [1.0.64] - 2026-03-21
### Segurança
- **Correção de Vulnerabilidades DB:** Reforço do Row Level Security (RLS) nas tabelas `messages`, `visitors` e `organizations`.
- **Segurança de Funções:** Proteção da função `update_visitor_status` contra manipulação de `search_path`.
- **Privacidade de Dados:** Restrição de acesso a mensagens e dados de visitantes apenas a utilizadores autorizados da mesma organização.


## [1.0.36] - 2026-03-19
### Melhorado & Corrigido
- **Modal QR (Design Compacto e Botões Visíveis):** A modal do QR Code Permanente foi polida de ponta a ponta. Resolvido o botão de "Imprimir Cartaz" invisível por referenciar variáveis de cor CSS inexistentes (`--primary-color` em vez de `--primary`). Adicionalmente todos os elementos foram comprimidos (redução de gaps, padding e da área do próprio QR Code) para que o cartão inteiro caiba confortavelmente na ecrã sem invocar qualquer "Scroll".

## [1.0.35] - 2026-03-19
### Corrigido
- **Lista de Membros (Bug 400 Bad Request):** Removida a coluna `email` do pedido ao Supabase que estava a quebrar o carregamento dos membros e ocultar os convites.
- **Modal QR:** Revertida a miniatura do cartaz da interface de geração de código QR. A versão de impressão estilizada aparece agora, corretamente, apenas após pressionar "Imprimir Cartaz Agora".

## [1.0.34] - 2026-03-19
### Melhorado & Corrigido
- **Gestão de Membros:** O menu e ecrã de "Gestão de Colaboradores" passou a chamar-se oficialmente "Gestão de Membros" a pedido do utilizador.
- **Visualização de Convites:** Identificada a causa base para a tabela de convites (`team_invitations`) parecer vazia mesmo quando existiam convites. Requer execução de script SQL para relaxar as regras de RLS (Row Level Security).

## [1.0.33] - 2026-03-19
### Corrigido & Adicionado
- **Tema Claro e Escuro (Corrigido):** Resolvido o problema de alternância de temas. O modo noturno não ativava corretamente devido a uma incompatibilidade com a estratégia da classe `dark` do Tailwind CSS. 
- **Preview de Impressão de Código QR:** A modal de geração de QR Code agora exibe a miniatura real e interativa do *template* de Cartaz A4 de impressão escolhido nas Definições, permitindo visualizar com precisão como será impresso. Adicionado ou relocalizado o botão final e estilos.

## [1.0.32] - 2026-03-19
### Melhorado
- **Campainha do Visitante:** Substituição da imagem do logótipo antiga pelo novo `<Logo />` interativo e dinâmico que se adapta ao modo escuro ou claro. A mensagem "Acesso Permitido" (que era confusa para quando alguém apenas atendia a porta) foi reescrita para "Chamada Atendida" acompanhada da indicação "A ligação está ativa, escreva agora" e de um ícone de microfone/áudio ativo.

## [1.0.31] - 2026-03-19
### Corrigido
- **Consistência de Títulos:** O título da página de "Locais" (`Properties.tsx`) estava em tamanho 4XL e itálico. Foi alterado para o padrão (`3XL font-bold`) para manter o design igual a todas as outras páginas do dashboard.

## [1.0.30] - 2026-03-19
### Melhorado
- **Redesign da Página do Visitante (Leitor QR):** A página que o visitante vê quando lê o código QR foi totalmente reescrita visualmente para utilizar o design semântico "Glassmorphism" (Light/Dark Mode). O antigo fundo `bg-slate-950` escuro foi substituído por painéis em vidro translúcido, o teclado do chat foi estilizado e o botão central "Tocar Campainha" assemelha-se agora a um widget tátil avançado.

## [1.0.29] - 2026-03-19
### Corrigido
- **Contraste Modo Claro (Modal):** Corrigido o painel (modal) de adicionar um "Novo Local" (`Properties.tsx`). Tal como os cartões anteriores, este modal tinha cores escuras forçadas (`bg-zinc-950`) que tornavam os inputs pretos e os títulos invisíveis no Tema Claro. Agora utiliza o estilo limpo `glass-card` com inputs e botões semânticos.

## [1.0.28] - 2026-03-19
### Melhorado
- **Redesign da Página de Unidades (Pontos de Acesso):** O layout da página de gestão de Pontos de Acesso foi reconstruído. Em vez de uma lista fechada num painel gigante, agora utiliza a mesma grelha elegante de cartões compactos (`glass-card`) introduzida na versão 1.0.25, harmonizando a interface. O botão de "Gerar QR" foi padronizado com animações.

## [1.0.27] - 2026-03-19
### Melhorado
- **Terminologia:** Na página de Gestão de Locais, atualizadas as etiquetas de "Unidade(s)" para "Ponto(s) de Acesso" e "Gerir Unidades" para "Gerir Pontos de Acesso" para melhor refletir o contexto do sistema de portas/acessos.

## [1.0.26] - 2026-03-19
### Corrigido
- **Contraste Modo Claro (Locais):** Removidos hardcodes de Dark Mode (`bg-zinc`) nos novos cartões que causavam caixas cinzentas no Modo Claro. Os cartões usam agora variáveis semânticas de sistema (`glass-card`, `var(--bg-main)`) para refletirem a UI perfeita tanto e Light Mode como Dark Mode. As ações de Editar/Eliminar também mantêm-se visíveis.

## [1.0.25] - 2026-03-19
### Melhorado
- **Redesign da Página de Locais:** Os cartões de propriedades foram totalmente redesenhados para um formato mais compacto, moderno e elegante (`rounded-2xl`, botões em linha, ícones menores). Removida a sensação de cartões "desajeitados" mantendo a estética Glassmorphism premium.

## [1.0.24] - 2026-03-19
### Corrigido
- **Criação de Locais (Falha Silenciosa):** Adicionada captura de erro explícita (`alert`) durante a criação de propriedades. Anteriormente, se o Supabase devolvesse erro 500 (devido a RLS Recursion), a interface não dava qualquer feedback ao utilizador.
- **SQL de Correção RLS:** Disponibilizado script definitivo `fix-rls-500.sql` para garantir que as políticas RLS não causam loops de "infinite recursion".

## [1.0.23] - 2026-03-19
### Alterado
- **Limpeza Total de "Organização":** Removidas as últimas referências a "Organização" em tutoriais, logs de sistema e definições.
- **Melhoria UX:** Refinada a terminologia para focar em "Sistema de Acesso" e "Gestão de Espaços".
- **Preparação de Correção RLS:** Identificadas causas de erro 500 (recursão RLS) e trigger de convites; preparado SQL de correção.

## [1.0.22] - 2026-03-19
### Alterado
- **Simplificação de Arquitetura:** Removido o conceito de "Organização" da interface do utilizador para tornar o sistema mais direto e focado na "Capainha Digital".
- **Registo Automático:** Removido o campo de nome da organização no registo. Agora o sistema cria um acesso padrão automaticamente e de forma silenciosa.
- **Remoção de Bloqueios:** Eliminados alertas e mensagens que mencionavam a preparação da organização, garantindo uma experiência de utilização sem interrupções.
- **Traduções:** Atualizados todos os idiomas (PT, EN, ES, FR) para remover referências a organizações e usar termos mais simples como "Acesso" ou "Sistema".

## [1.0.21] - 2026-03-19
### Corrigido
- **Criação de Locais:** Resolvido o problema onde a criação de novos locais falhava silenciosamente devido à ausência de `organization_id` ou erros de base de dados.
- **Feedback visual:** Adicionados alertas de erro traduzidos (PT, EN, ES, FR) para falhas na criação de locais.
- **Robustez:** Melhorada a verificação de integridade da organização antes de permitir a criação de propriedades.

## [1.0.20] - 2026-03-19
### Adicionado
- **Reformulação da Página de Locais:** Nova interface moderna e premium baseada em cartões (grid) com efeitos de vidro e ícones melhorados.
- **Automação de Organização:** O processo de criação de organização agora é totalmente automático e invisível para o utilizador, removendo a necessidade de configuração manual e os alertas de "Organização não encontrada".

### Corrigido
- **Segurança (RLS):** Fornecida correção para erro de recursão infinita na tabela de perfis através de uma função SQL segura.


## [1.0.19] - 2026-03-19
### Corrigido
- **Sincronização de Perfil (Google):** Resolvido o problema onde o nome e a foto do Google não eram carregados ou atualizados corretamente. Agora a aplicação verifica múltiplas chaves de metadados (`picture`, `avatar_url`, `name`, `full_name`) e mantém os perfis existentes atualizados em cada login.


## [1.0.18] - 2026-03-19
### Alterado
- **Interface de Login:** Alinhamento do logótipo alterado para a esquerda (`items-start`), seguindo o padrão visual da barra lateral do dashboard.


## [1.0.17] - 2026-03-19
### Adicionado
- **Interface de Login:** Adicionado ícone de cadeado (`Lock`) ao campo de palavra-passe para consistência visual com o campo de email.


## [1.0.16] - 2026-03-19
### Corrigido
- **Interface de Login:** Resolvida a sobreposição do ícone de email com o texto/placeholder dentro do campo de entrada, garantindo o preenchimento correto (`padding-left`).


## [0.1.8] - 2026-03-13
### Adicionado
- Tradução integral para ES (Espanhol) e FR (Francês).
- Sistema de i18n em todos os ecrãs públicos (Landing, Login, Register).

### Corrigido
- Revisão global de PT-PT (correção de termos brasileiros e mistura de inglês).
- Localização integral das páginas de Gestão de Equipa (Residents) e Fila de Acessos (Visitors).
- Polimento do Footer: logo aumentado e alinhamento de elementos corrigido.
- Dashboard: removida a designação "Staff Hello" e corrigida a lógica visual de colaboradores.

## [0.1.7] - 2026-03-13
### Corrigido
- **Auto-Join de Membros:** Corrigida a falha onde membros convidados não apareciam na lista ao usar Google Login ou se já existissem na plataforma. O sistema agora processa convites pendentes automaticamente no primeiro acesso ao Dashboard.
 
## [0.1.6] - 2026-03-13
### Refinado
- **Footer Global:** Layout centrado, inclusão do logótipo da marca e simplificação textual (remoção de "aparelhagem").
 
## [0.1.5] - 2026-03-13
### Corrigido
- **Convites por Link:** Melhorado o feedback de erro na geração de links para ajudar a diagnosticar problemas de sincronização com a base de dados (SQL v0.0.98).
 
## [0.1.4] - 2026-03-13
### Brand Update
- **Renomeação Global:** A plataforma foi oficialmente renomeada para **Hello DOOR BELL** em todos os ecrãs, metadados e componentes de vídeo.
 
## [0.1.3] - 2026-03-13
### Atualizado
- **Tutorial & Ajuda:** Atualizado o conteúdo do tutorial para refletir os convites via link (WhatsApp) e a nova interface de vídeo minimalista.
 
## [0.1.2] - 2026-03-13
### Personalizado
- **Interface de Vídeo Limpa:** Removidos todos os logótipos e marcas de água do Jitsi.
- **Simplificação de Controlos:** Removidos botões secundários da videochamada, mantendo apenas o botão de desligar conforme solicitado.
- **Entrada Direta:** Desativada a página de pré-adesão para início imediato da comunicação.

## [0.1.1] - 2026-03-13
### Refatorado
- **Limpeza de Dashboard:** Removido o cartão de sistema do Bento Grid para libertar espaço visual.
- **Footer Global:** Implementado um rodapé em todas as páginas do dashboard contendo a versão, identidade do sistema e indicador de estabilidade.

## [0.1.0] - 2026-03-13
### Otimizado
- **Widgets Instantâneos:** Implementação de cache (`localStorage`) para localização e meteorologia. Os dados agora aparecem instantaneamente ao entrar no dashboard.
- **Background Refresh:** Meteorologia e geolocalização atualizam silenciosamente em fundo a cada 15 minutos.
- **Performance Relógio:** Otimização do loop do relógio para maior precisão e menor consumo de recursos.

## [0.0.99] - 2026-03-13
### Corrigido
- **Visitors Flicker:** Resolvido o problema de "flickering" na fila de visitantes. As atualizações agora são suaves via Realtime (INSERT/UPDATE/DELETE) sem recarregar o ecrã inteiro.
- **Estabilização de Chat:** Fim das re-renderizações cíclicas ao selecionar um visitante.

## [0.0.98] - 2026-03-13
### Adicionado
- **Convites via Token:** Agora os administradores podem gerar links de convite únicos sem precisar de introduzir o e-mail do colaborador.
- **Registo Simplificado:** Novo fluxo de registo que deteta convites via parâmetro de URL (`invite`).
- **SQL v0.0.98:** Adicionada coluna `token` à tabela `team_invitations`.

## [0.0.97] - 2026-03-13
### Adicionado
- **Partilha de Convites Direta:** Novo sistema de partilha manual via WhatsApp, Email e Cópia de Link, eliminando falhas de servidores de email.
- **Botões Sociais:** Integração com `wa.me` para envio instantâneo de convites de membros.
- **Gestão de Pendentes:** Agora podes reenviar o link de convite a qualquer momento através da tabela de residentes.

## [0.0.96] - 2026-03-13
### Adicionado
- **Sistema de Gatilho de Convites:** Criado script SQL `activate-invitation-emails.sql` para automatizar o envio de emails via Edge Function.
- **Melhoria UI Residentes:** Feedback visual mais claro quando o sistema de convites requer intervenção manual na base de dados.

## [0.0.95] - 2026-03-13
### Adicionado
- **Favicon Ativo:** O ícone do browser (separador) agora mostra o logótipo oficial `logo.png`.
- **Identidade Dominante:** Aumento massivo da escala do logótipo no Dashboard (max-w-240px) e Visitor Page (max-w-320px).
- **SEO Título:** Título da página atualizado para "Hello Access | Dynamic Door Bell".

## [0.0.94] - 2026-03-13
### Adicionado
- **Escala de Logo "WAU":** Aumento massivo das dimensões do logótipo original em toda a aplicação (Visitor Page, Sidebar e Impressão).
- **Identidade Hello nas Videochamadas:** Removido o branding do Jitsi (água, logo) e renomeada a aplicação para "Hello Access" dentro das chamadas.
- **Entrada Direta em Vídeo:** O sistema agora entra automaticamente na chamada sem pedir o nome de novo (aproveita a identificação prévia).

### Corrigido
- **Fluxo de Chat do Visitante:** Corrigido o problema onde o visitante ficava preso no estado de espera após ser autorizado pelo residente. Agora o chat abre instantaneamente.

## [0.0.93] - 2026-03-13
### Adicionado
- **Restauro do Logótipo Original:** Revertida a alteração do logótipo "V" para o logótipo original do utilizador (`/logo.png`).
- **Escala Gigante Master:** O logótipo original agora tem dimensões massivas na Sidebar e portal do visitante para máximo branding.
- **Templates de Impressão Corrigidos:** Todos os templates usam agora o logótipo real do utilizador em tamanho dominante.

## [0.0.92] - 2026-03-13
### Adicionado
- **Logótipo Premium Integrado:** Substituído o branding de texto pela imagem premium "Thunderbolt V" em todo o ecossistema.
- **Escala de Branding Aumentada:** O logótipo tem agora dimensões muito superiores na Sidebar (w-44), Visitor Page (h-32) e Cartazes de Impressão.
- **Branding Consistente na Impressão:** O novo logótipo é agora a peça central em todos os templates de cartaz (Classic, Dark, Corporate).

### Corrigido
- **Limpeza de Lints:** Remoção de imports não utilizados no motor de impressão.

## [0.0.91] - 2026-03-13
### Adicionado
- **Fluxo de Chat Direto:** Ao aceitar uma chamada no dashboard, o residente é levado instantaneamente para o chat do visitante.
- **Botões de Ação Rápida:** Notificação de visita simplificada com botões "Aceitar Chamada" e "Recusar".

### Corrigido
- **Scroll em Modais:** Corrigido o problema que impedia o scroll e o fecho do modal de QR em ecrãs pequenos ou com zoom.

## [0.0.90] - 2026-03-13
### Adicionado
- **Previews Visuais de Templates:** Mini-mockups reais no ecrã de Definições para facilitar a escolha do design.
- **HI-RES Branding:** Logótipo "Hello" aumentado significativamente na Sidebar e na Página do Visitante.
- **Fluxo de Impressão Direto:** Botão de impressão agora é o destaque principal no modal do QR.

### Alterado
- **Simplificação total de QR:** Removido o sistema de convites manuais (Gerar Convite QR) para focar no "QR do Local" (Fixo) conforme solicitado.
- **Correção de Expiração:** Removida lógica de expiração que afetava os QR Codes permanentes.

## [0.0.89] - 2026-03-13
### Adicionado
- **Templates de Impressão QR:** Implementados 4 designs de cartazes (Classic, Dark, Minimal, Corporate).
- **Personalização:** Nova secção "Impressão QR" nas Definições para escolher o estilo do cartaz.
- **Impressão Inteligente:** Integração via CSS `@media print` para gerar cartazes profissionais com logo e dados do local automaticamente.

## [0.0.88] - 2026-03-12
### Refatoração de Gestão de QR Codes
- **QR Permanente por Local:** Adicionada capacidade de gerar QR Codes fixos para cada Unidade (ex: Porta da Frente), eliminando a necessidade de convites pré-nomeados.
- **Identificação Dinâmica:** Nova interface para o visitante inserir o seu nome no momento do scan.
- **Fluxo Simplificado:** Criação automática de registo na fila de espera após a identificação, mantendo a campainha e o chat em tempo real.
- **Nova Rota de Acesso:** Implementada a rota `/visitor/access/:unitId` para suportar os links permanentes.

## [0.0.87] - 2026-03-12
### Corrigido
- **Controlo Total de Vídeo:** Implementada a API Jitsi Meet External para garantir que o ecrã de pré-entrada é saltado. Adicionado fecho automático do modal assim que o utilizador desliga a chamada, evitando a visualização do ecrã de marketing/encunhamento do Jitsi.

## [0.0.86] - 2026-03-12
### Melhorado
- **Experiência de Entrada em Vídeo:** Removido o ecrã de "Entrar na Reunião" (prejoin page) do Jitsi. O utilizador agora entra diretamente na conversa com o seu nome de perfil automaticamente configurado.

## [0.0.85] - 2026-03-12
### Adicionado
- **Vídeo Automático (Jitsi Meet):** Substituído o Daily.co pelo Jitsi Meet. Agora as salas são criadas instantaneamente no momento da chamada, sem necessidade de configuração manual ou chaves de API por parte do utilizador.
### Removido
- **Configuração de Link Manual:** Removida a necessidade de colar links de vídeo nas definições. O sistema agora é "Plug & Play".
### Corrigido
- **Tratamento de Exceções de Vídeo:** Melhorada a captura de erros no bloco `catch` do `VideoCall`, garantindo que erros de "sala não encontrada" são exibidos visualmente ao utilizador mesmo quando ocorrem durante a inicialização assíncrona.

## [0.0.83] - 2026-03-12
### Adicionado
- **Avisos de Configuração:** Adicionado alerta visual no Dashboard de Visitantes quando o link de vídeo não está configurado.
### Corrigido
- **Resiliência de Vídeo:** Implementado tratamento de erro 404 (sala não encontrada) no componente `VideoCall`. Agora o sistema informa o utilizador em vez de falhar silenciosamente.
- **Bloqueio de Instâncias (Fix Final):** Introduzida uma guarda global para evitar a criação concorrente de instâncias do DailyIframe, resolvendo definitivamente o erro de duplicação.

## [0.0.82] - 2026-03-12
### Adicionado
- **Configuração de Vídeo Dinâmica:** Adicionado campo nas Definições (Marca) para configurar o link do Daily.co. Isto resolve o erro 404 ao permitir que o utilizador use a sua própria sala de reunião.
### Corrigido
- **Estado de Visitantes:** Sincronizado o perfil do utilizador no dashboard de visitantes para garantir acesso às definições de integração.

## [0.0.81] - 2026-03-12
### Corrigido
- **Estabilidade de Vídeo (Fix Definitivo):** Implementada inicialização assíncrona com "grace period" para limpeza de hardware. Isto elimina colisões de instâncias do DailyIframe que ocorrem durante re-renderizações rápidas do React.

## [0.0.80] - 2026-03-12
### Corrigido
- **Estabilidade de Vídeo:** Resolvido o erro "Duplicate DailyIframe instances are not allowed". O sistema agora garante que apenas uma instância de vídeo está ativa, limpando sessões órfãs automaticamente ao iniciar ou fechar uma chamada.

## [0.0.79] - 2026-03-12
### Corrigido
- **Visibilidade de Visitantes:** Resolvido o problema onde os visitantes não apareciam na lista "Em Direto". O sistema agora utiliza um Trigger no Supabase para garantir que o registo pertence sempre à organização correta, mesmo que o telemóvel falhe o envio do ID.
- **Realtime Otimizado:** A lista de visitantes agora atualiza-se instantaneamente perante novas entradas globais da organização.

## [0.0.78] - 2026-03-12
### Corrigido
- **Sincronização Realtime (Org Mismatch):** Corrigido o erro onde o Dashboard ignorava o alerta porque o ID da organização chegava como `null`. O sistema agora é mais tolerante e permite o alerta mesmo com ID em falta para segurança.
- **Debug de Visitante:** Adicionados logs detalhados na `VisitorPage` para diagnosticar falhas de extração de metadados.

## [0.0.77] - 2026-03-12
### Adicionado
- **Responsividade Global:** A aplicação agora adapta-se fluidamente a qualquer tamanho de monitor.
- **Fluid Layout:** Aumentada a largura máxima do Dashboard para 1600px, permitindo melhor aproveitamento de espaço em ecrãs Grandes/Ultra-Wide.
- **Design Adaptativo:** Paddings e tipografia (títulos) agora ajustam-se automaticamente ao tamanho do ecrã usando `clamp()` e unidades relativas.
- **Bento Grid Inteligente:** O layout do Dashboard reorganiza-se de forma mais eficiente entre tablets e desktops.

## [0.0.76] - 2026-03-12
### Corrigido
- **Estabilidade Realtime:** Otimizada a subscrição de eventos para evitar desconexões durante atualizações de perfil.
- **Restauração de Alertas:** Recuperada a funcionalidade de Som, Alerta Visual e Push Notifications que tinha regredido.
- **Segurança de IDs:** Implementada comparação rigorosa de UUIDs como Strings para garantir que os alertas tocam apenas para os residentes da organização correta.

## [0.0.75] - 2026-03-12
### Corrigido
- **Alerta Visual (Balão Azul):** Corrigido o problema onde o alerta visual não aparecia apesar do som tocar. Movi o componente para a raiz do layout (evitando cortes de containers pai) e reforcei o `z-index: 100000` e a vibrância das bordas.

## [0.0.74] - 2026-03-11
### Corrigido
- **Organização de Visitantes Realtime:** Corrigido problema onde a inserção de novos visitantes falhava ou retornava `organization_id` nulo devido ao aninhamento do JSON na query `properties`. A página de visitante (QR form) conta agora com extração defensiva para Arrays ou Objetos, o qual assegura que a App em tempo real não ignora desnecessariamente a Campainha na recepção. O sistema prevê também tolerância para colunas em falta com a partilha de script SQL dedicado para corrigir a Realtime DB via Backend.
- **Resiliência do Dashboard:** As páginas de "Pessoas à Porta" e "Minha Equipa" agora são tolerantes a erros de banco de dados (400 Bad Request). Se uma tabela ou coluna estiver em falta no Supabase, o sistema continua a funcionar graciosamente e comunica o erro na consola.
- **Debug de Sincronização:** Adicionados logs avançados (`🔍 [Visitors]`) na consola do programador para diagnosticar falhas de filtragem por organização em tempo real.
- **Robustez de Fetch:** Melhorado o tratamento de estados de carregamento para garantir que a lista de visitantes reflete sempre a realidade após o alerta da campainha.

## [0.0.72] - 2026-03-11
### Adicionado
- **Persistência de Definições:** Configurados os botões de notificação (WhatsApp, Push, Email) para gravarem diretamente no perfil do utilizador na base de dados.
- **Notificações Globais:** Centralizado o sistema de alerta "Balão Azul" no Layout. Agora os alertas aparecem em qualquer secção do Dashboard.
- **Respeito às Preferências:** O som e o alerta visual agora respeitam o estado (ON/OFF) definido pelo utilizador.

## [0.0.71] - 2026-03-11
### Corrigido
- **Alerta Visual (Estabilidade):** Substituídas as classes de animação Tailwind por estilos Vanilla CSS personalizados no `index.css`. Isto garante que o alerta de "Nova Visita" apareça corretamente em todos os ambientes de produção, com animações fluidas e sobreposição garantida (`z-index: 9999`).

## [0.0.70] - 2026-03-11
### Adicionado
- **Alerta Visual de Visitas:** Adicionado um pop-up azul flutuante ("Alguém à Porta!") que aparece mal um visitante toca à campainha. Isto resolve a falta de feedback visual reportada.
- **Refresh Silencioso:** O Dashboard agora atualiza as estatísticas em segundo plano durante eventos Realtime, sem mostrar o spinner de carregamento (ecrã azul), para uma experiência mais fluida.

## [0.0.69] - 2026-03-11
### Corrigido
- **Ecrã Branco no Telemóvel:** Revertido o uso de caminhos relativos no Vite. O uso de `./` causava erros ao carregar recursos em rotas diretas de visitantes (ex: `/visitor/ID`). Agora utiliza caminhos absolutos (`/`) que são compatíveis com o ficheiro `.htaccess` em produção.

## [0.0.68] - 2026-03-11
### Adicionado
- **Logs de Depuração (Realtime):** Adicionadas mensagens detalhadas na consola do browser para rastrear o estado da ligação WebSocket ao Supabase e identificar falhas de permissão ou rede.

## [0.0.67] - 2026-03-11
### Adicionado
- **Realtime Dashboard:** Implementada a subscrição WebSocket (Supabase Realtime) no Dashboard principal. Agora as estatísticas e a lista de visitantes atualizam-se automaticamente sem carregar no F5.
- **Auto-Play Campainha:** O som da campainha selecionado nas definições toca automaticamente no Dashboard assim que um visitante preenche o formulário.

## [0.0.66] - 2026-03-11
### Corrigido
- **Hostinger Fix:** Alterados os caminhos de carregamento de recursos para relativos (`./`) no Vite. Isto resolve o problema da página em branco ou "não abre" após o upload para o servidor.

## [0.0.65] - 2026-03-11
### Alterado
- **Áudios Locais:** Removidos links externos (Pixabay/Mixkit) e configurados ficheiros locais (`Ring01.mp3`, `Ring02.mp3`, `Ring03.mp3`) da pasta `public` para garantir 100% de disponibilidade e evitar erros 403.
- Atualização da Edge Function para maior detalhe nas notificações (Nome da Propriedade e Unidade).

## [0.0.64] - 2026-03-11
### Melhorado
- **Edge Function (WhatsApp/Email):** Agora a notificação inclui o nome da Propriedade e da Unidade (ex: "Alguém tocou à campainha para Unidade 101 em Edifício Atlântico").
- A função agora consulta a base de dados em tempo real para obter os detalhes do local do visitante.

## [0.0.63] - 2026-03-11
### Corrigido
- Ajuste nos links de áudio em `Settings.tsx` (substituição de Pixabay por Mixkit) para evitar erros 403 (Forbidden).
- Garantia de carregamento de áudio em ambientes de produção.

## [0.0.62] - 2026-03-11
### Adicionado
- **Integração WhatsApp (Twilio):** Ativada a capacidade de receber alertas de campainha diretamente no telemóvel via WhatsApp.
- **Gestão de Perfil:** Novo campo "Telemóvel / WhatsApp" no ecrã de Definições para configurar o destino das notificações.
- **Push & WhatsApp Toggles:** Adicionado controlo individual de notificações no Dashboard para maior flexibilidade do residente.

## [0.0.61] - 2026-03-11
### Corrigido
- **Extensão de Rede (Erro 42883):** Resolvida a falha de ativação da `pg_net` e corrigido o caminho da função `http_post`. A campainha (QR Code) volta a disparar alertas instantâneos sem erros de sistema.
- **Trigger de Campainha:** Reconfigurado o gatilho SQL para utilizar o esquema `net` oficial da extensão, garantindo a estabilidade das notificações em tempo real.
- **Sistema de Emails de Convite:** Desenvolvida a Edge Function `send-invite-email` e preparado o ambiente para envios via Resend API.
- **Segurança (RLS):** Garantida a abertura de permissões nas tabelas `visitors` e `team_invitations` para fluxos anónimos e de convite.

## [0.0.60] - 2026-03-11
### Corrigido
- **Som de Alerta (Erro 403):** Substituído o recurso de áudio da Pixabay (bloqueado) por uma fonte estável da Mixkit. O Dashboard volta a tocar o som de campainha quando um visitante chega.
- **Debugging de Campainha:** Adicionado reporte detalhado de códigos de erro (`PGRST`, `42501`, etc.) no alerta do visitante para identificar bloqueios de RLS instantaneamente.
### Melhorado
- **Cache de Áudio:** Implementado fallback para garantir que o som padrão é carregado caso as definições do utilizador falhem.

## [0.0.59] - 2026-03-11
### Corrigido
- **Conflito de Tabelas (Equipa vs Visitantes):** Renomeada a tabela de convites de colaboradores para `team_invitations`. Isto resolve o erro `PGRST204` que ocorria porque o sistema estava a tentar injetar emails numa tabela destinada a tokens de visitantes QR Code.
- **Preparação de Campainha:** Otimização dos tipos de dados para garantir que a inserção de `visitors` flui sem bloqueios de cache.
### Alterado
- **Fluxo de Login:** Atualizada a lógica de interceção de convites para ler a nova localização `team_invitations`.

## [0.0.58] - 2026-03-11
### Adicionado
- **Sistema de Inclusão de Equipas (Convites Pendentes):** Foi implementada a capacidade de adicionar utilizadores que *não existam* nativamente no ecossistema Supabase. Os Administradores podem agora submeter qualquer endereço de Email ao abrigo de uma Organização em `Dashboard -> Minha Equipa` e a aplicação gerará um Registo Pendente. Aquando do futuro Registo do Empregado (via Google SSO ou Formulário) o sistema deteta e consome a credenciais do convite ligando automaticamente as pontes estruturais sem exigir criação de sub-empresas.
### Melhorado
- **Layout Responsivo (Monitores Curtos):** Reduziram-se pro-ativamente os paddings verticais da *Sidebar* à esquerda para garantir que, em monitores com baixa amplitude, a totalidade das hiperligações fique visível sem obrigar a deslizar o scroll da página.

## [0.0.57] - 2026-03-11
### Melhorado
- **Upload Automático de Fotos (Sync da Google):** Implementado um sincronizador impercetível, alojado no carregamento do *Dashboard*, que verifica a existência da fotografia do utilizador na Base de Dados e a compara com o metadado originário do fornecedor OAuth (Google). Caso a fotografia esteja em falta, o sistema encarrega-se instantaneamente de atualizar a conta, extraindo o link da Cloud da Google, eliminando inteiramente a necessidade do utilizador executar ações manuais de Upload de Foto.

## [0.0.56] - 2026-03-11
### Adicionado
- **Avatares Google:** A foto de perfil associada à conta Google passa a ser guardada automaticamente na base de dados (`avatar_url` na tabela `profiles`) no momento do registo. Permite que o Dashboard e a Sidebar renderizem fotografias de perfis reais no futuro.
### Melhorado
- **Onboarding Inclusivo:** Alterado o "copy" do ecrã de boas-vindas para incluir expressamente clientes Particulares. A antiga label técnica "Nome do seu Edifício / Empresa" foi suavizada para "Nome da sua Casa / Edifício / Empresa".

## [0.0.55] - 2026-03-11
### Corrigido
- **Schema Cache Error no Onboarding:** Removida a coluna inexistente `avatar_url` do payload do Supabase Upsert aquando do registo de Organização em novas contas Google OAuth (PGRST116 fallback), curando um bug nativo de constraint de "column not found". O painel processa contas novas com 100% de performance.

## [0.0.54] - 2026-03-11
### Corrigido
- **Onboarding Interrompido (Google OAuth):** Contas novas criadas via Google SSO sofriam de um bloqueio onde a ausência silenciosa de um Perfil (erro 406 Not Acceptable / PGRST116 na query `single`) impedia que o pop-up de criação de Organização fosse despoletado. Passou a adotar-se uma escuta explícita de erro e substituiu-se o DB Update por um DB Upsert na constituição do super admin de forma a colmatar esta falha e restaurar o onboarding fluido a 100%.
- **Proteção Criar Propriedade:** Revertida a tentativa experimental na v0.0.53 que registava Propriedades com ID do utilizador caso não houvesse organização. Protegeu-se contra Erros Fatais de Constraints de Base de Dados (Foreign Key `properties_organization_id_fkey`) avisando graciosamente o utilizador no ecrã.
## [0.0.53] - 2026-03-11
### Corrigido
- **Criação de Propriedades:** Removida a limitação de exigência estrita de preenchimento prévio na tabela Profile. Se o utilizador tentar criar uma Propriedade antes de possuir uma `organization_id`, a Propriedade será gravada sob o seu próprio ID numérico, prevenindo o erro silencioso no front-end.
- **Label do Dashboard:** Adicionada a chave de tradução em falta `active_properties` ao ficheiro pt.json que estava a quebrar visualmente o cartão de propriedades com a variável i18n ("DASHBOARD.STATS.ACTIVE_PROPERTIES").

## [0.0.52] - 2026-03-11
### Adicionado
- **Login com Google (OAuth):** Integração visual e funcional do "Entrar com Google" nas páginas de Login e de Registo (Glassmorphism UI).
- **Onboarding de Organização:** Novo fluxo de interceção no Dashboard que obriga utilizadores oriundos da Google (sem associação prévia a um edifício) a criar ou nomear o seu espaço antes de libertar o acesso à navegação da plataforma.

### Corrigido
- **Campainha Realtime (Dashboard Surdo):** Removido o filtro rígido de `organization_id` no frontend (nos alertas do Sidebar e na Tabela de Visitantes) que rejeitava as visitas vindas do webhook se a BD ainda não tivesse tido tempo de anexar a organização. O sistema de som e tabela agora reage com zero delay a todos os toques.
- **UI:** Aumentado o tamanho do logótipo principal na sidebar lateral do Dashboard para maior destaque da marca.
## [0.0.50] - 2026-03-09
### Melhorado
- **Identidade Visual (Logo):** O logótipo da plataforma em modo texto e variados ícones espalhados pela UI foi globalmente unificado pelo novo logótipo premium. O Logo foi integrado de modo fluido na **Landing Page**, **Ecrã de Login** e **Sidebar de Navegação Principal**.

## [0.0.49] - 2026-03-09

### Melhorado
- **Dashboard Layout:** A disposição dos cartões na página principal foi otimizada para um formato de "Bento Grid" mais equilibrado. Relógio, visitas pendentes e propriedades ficam agora na primeira linha.
### Adicionado
- **Cartão de Sistema:** Novo cartão no dashboard que exibe dinamicamente o número da versão da aplicação (Hello OS).

## [0.0.48] - 2026-03-08
### Removido
- **Dashboard:** Removida a secção de métricas rápidas (Total Visits, Success Rate, System Stable) para simplificar e tornar o ecrã inicial mais limpo.

## [0.0.47] - 2026-03-08
### Melhorado
- **UI de Histórico:** Redesenho completo do banner de retenção de dados e botão de exportação na página de Visitantes. Novo layout com gradientes, ícones Lucide (Clock, Download) e tipografia refinada para uma experiência mais premium.

## [0.0.46] - 2026-03-08
### Adicionado
- **Suporte Total a 4 Idiomas:** O idioma Espanhol (ES) foi totalmente implementado, garantindo paridade total com Português, Inglês e Francês em todas as páginas, modais e cartões.
- **Sincronização de Locales:** Auditadas e sincronizadas as chaves de tradução em todos os ficheiros JSON para evitar textos em falta ou chaves visíveis.

## [0.0.45] - 2026-03-08
### Corrigido
- **Traduções de Residentes:** Corrigido o erro onde apareciam as chaves de tradução (ex: `RESIDENTS.MODAL.TITLE`) em vez do texto real. As chaves foram reorganizadas para o nível correto em PT, EN e FR.
- **Definições:** Restauradas as traduções da página de definições que tinham sido afetadas durante a migração de chaves.

## [0.0.44] - 2026-03-08
### Adicionado
- **Meteorologia Real:** Integração com a API Open-Meteo para exibir temperatura e ícones meteorológicos (Sol, Chuva, Nuvens) em tempo real no Dashboard.
- **Ícones Dinâmicos:** Os ícones do widget de meteorologia agora mudam automaticamente conforme o estado do tempo na tua localização.

## [0.0.43] - 2026-03-08
### Corrigido
- **Login UI:** Aumentado o padding lateral no campo de email para evitar sobreposição definitiva do ícone com o texto.

## [0.0.42] - 2026-03-08
### Adicionado
- **Histórico de Visitas:** Adicionado aviso sobre a política de retenção de dados (eliminação após 3 meses).
- **Exportação de Dados:** Nova funcionalidade para exportar o histórico de visitas para CSV no separador de Histórico.
- **Limpeza Automática:** Fornecido script SQL para automatizar a eliminação de registos antigos.

## [0.0.41] - 2026-03-08
### Adicionado
- **Gestão de Residentes:** Implementado modal funcional de "Adicionar Membro" por email em `Residents.tsx`.
- **Internacionalização total:** Página de Residentes agora 100% traduzida (PT, EN, FR).
- **Sons Premium:** Atualizadas as opções de som da campainha para áudio de alta qualidade e profissional.

### Corrigido
- **Fila de Acessos:** Visitantes com estado `completed` agora movem-se corretamente para o separador Histórico.
- **Login UI:** Resolvida sobreposição do ícone de email com o texto.
- **Landing Page:** Removido badge indesejado e corrigido caminho da imagem do mockup.
- **Settings:** Corrigida funcionalidade de upload de avatar e logo da organização usando `label htmlFor`.
- **Dashboard Widget:** Widget de meteorologia e relógio agora é mais compacto, elegante e usa a geolocalização exata do browser (ex: Gaia).
- **Dados Reais:** Removidos dados mockados ("Staff Hello") e substituídos pela contagem real de residentes.

### Melhorado
- **Mockup 3D:** Gerado novo mockup premium para a Landing Page.
- **Performance:** Limpeza de imports não utilizados e otimização de build.

## [0.0.37] - 2026-03-08
### Adicionado: Seleção de Toques de Campainha
- **Definições**: Nova secção na aba de Notificações que permite escolher entre diferentes tipos de som de campainha (Classic, Modern, Digital, Premium).
- **Preview de Som**: Botão para ouvir cada som antes de o selecionar.
- **Sincronização Global**: O Dashboard agora utiliza automaticamente o toque escolhido para avisar sobre novos visitantes.

## [0.0.36] - 2026-03-08
### Melhorado: Interface do Visitante Autorizado
- **Voltar ao Chat**: Adicionado um botão no ecrã de "Acesso Permitido" para o visitante poder regressar ao chat e continuar a comunicar com o residente.

## [0.0.35] - 2026-03-08
### Melhorado: Fluxo de Acesso a Visitantes
- **Dashboard**: Agora os visitantes autorizados permanecem acessíveis na lista (clicáveis), permitindo continuar conversas ou videochamadas.
- **Concluir Visita**: Adicionado um botão para marcar a visita como "Concluída", removendo-a da fila ativa e movendo-a para o histórico definitivo.
- **UI/UX**: O botão de chat está agora sempre visível na tabela para facilitar o acesso rápido.

## [0.0.34] - 2026-03-08
### Corrigido: Sincronização de Status Realtime (Master Fix)
- **Admin App**: Corrigida a função `updateStatus` para garantir que o `organization_id` é sempre enviado corretamente, permitindo que as políticas RLS validem a operação.
- **SQL Master Script**: Criado um script consolidado que resolve:
  - Cache de esquema (PostgREST).
  - Ativação de Realtime para a tabela `visitors`.
  - Permissões de Leitura (`SELECT`) para visitantes anónimos.
  - Políticas de RLS para aprovação/rejeição.

## [0.0.33] - 2026-03-08
### Adicionado: Refatoração Semântica & Light Mode (WOW Factor)
- **Tema Claro Premium**: Implementação completa do Light Mode em todo o Dashboard (Visão Geral, Visitantes, Convites, Propriedades, Unidades, Equipa e Ajuda).
- **Variáveis Semânticas**: Substituição de centenas de cores hardcoded (ex: `text-white`, `bg-slate-900`) por variáveis CSS semânticas (`--bg-main`, `--text-primary`, `--border-dim`) definidas no `index.css`.
- **Efeitos Visuais Adaptativos**: Refinados os efeitos de `blur` (Glaasmorphism), sombras (`glow`) e gradientes para garantir legibilidade e estética premium em fundos claros e escuros.
- **Componentes**: Botões, inputs e cards agora adaptam-se dinamicamente sem necessidade de classes Tailwind redundantes em cada componente.

### Corrigido: Erro Crítico de Check-in (Visto à Porta)
- **Base de Dados**: Resolvido o erro "Could not find column organization_id" na tabela `visitors` que impedia o anúncio de chegada.
- **Segurança (RLS)**: Garantidas permissões de `INSERT` para utilizadores anónimos e autenticados de forma a permitir o fluxo de campainha fluído.
- **Cache de Esquema**: Implementada lógica de recarregamento automático do PostgREST para reconhecer novas colunas instantaneamente.

### UX/UI
- **Tipografia**: Melhorado o contraste em todos os estados de hover e labels de formulário.
- **Performance**: Otimização do peso visual nos painéis flutuantes (Floating Island).
- **Consistência**: Alinhamento visual de todos os botões de ação e modais de edição.



## [0.0.26] - 2026-03-08
### Corrigido: Roteamento SPA em Produção (Hostinger)
- **Routing**: Adicionado ficheiro `.htaccess` para garantir que rotas como `/visitor/:token` funcionem corretamente em servidores Apache (Hostinger).
- **UX**: Melhorado o suporte para navegação direta em sub-paginas.

### Corrigido: Dados Reais e QR Code Access
- **Dados Reais**: Removidos todos os dados fictícios do dashboard. Agora novas contas iniciam com contadores a zero.
- **QR Code**: Adicionado suporte para `VITE_APP_URL` e lógica de limpeza de trailing slashes para evitar erros de rota.
- **UX**: Adicionado aviso em ambiente de desenvolvimento sobre a necessidade de URL público para testes em dispositivos móveis.
- **Build**: Corrigidos erros de linting (imports não utilizados).

### Removido: Acesso de Teste Automatizado
- **Segurança**: Remoção do botão "Pular Login" e conta de teste por solicitação do utilizador.

## [0.0.23] - 2026-03-08
### Adicionado: Suporte Funcional a Temas e Espanhol
- **Switch de Temas**: Lógica real de troca entre Tema Claro e Escuro (index.css + localStorage).
- **Internacionalização**: Adicionado idioma Espanhol e garantido que a app inicia sempre em Inglês.
- **Persistência**: As preferências de tema e idioma agora são salvas no navegador.

## [0.0.22] - 2026-03-08
### Redesign: Landing Page Wow Factor
- **Hero v2**: Tipografia imersiva e mockup 3D premium.
- **Grelha Bento**: Features organizadas em layout modular moderno.
- **Branding**: Remoção completa de referências ao nome antigo (PortaVi).

## [0.0.21] - 2026-03-08
### Adicionado: Sidebar "Floating Island" (Fator WoW)
- **Design Flutuante**: A sidebar e o main content agora são "ilhas" suspensas com margens.
- **Glassmorphism v2**: Blur aumentado (30px) e transparência otimizada para maior profundidade.
- **Indicador Líquido**: Animação fluida e orgânica do menu ativo (v0.0.20).
- **Glow Dinâmico**: Efeito de iluminação que segue o rato na sidebar.
- **Layout Bento**: Organização de menus em blocos independentes e modernos.

## [0.0.19] - 2026-03-08
### Alterado: Ajuste Fino de Tipografia
- **Sidebar**: Aumentado o tamanho de fonte dos links de navegação para `text-base` (16px) e ícones para `w-6 h-6`.
- **Header**: Aumentado o título da página e o nome do utilizador para `text-base`.
- **Labels**: Ajustado o tamanho das labels de secção para facilitar a leitura.

## [0.0.18] - 2026-03-08
### Adicionado: Upgrade UI/UX (Organic Scale)
- **Escala Visual**: Incremento global no tamanho das fontes e espaçamentos (paddings/gaps).
- **Página de Definições**: Nova área para gestão de Perfil, Aparência, Notificações e Branding.
- **Design Orgânico**: Cantos arredondados (32px) e sombras suaves para uma experiência mais moderna.
- **Internacionalização**: Estrutura preparada para PT, EN e FR nas definições.
- **Navegação**: Sidebar ampliada para 320px para melhor legibilidade.

## [0.0.17] - 2026-03-08
### Revertido: UI Original (Fase 13)
- **Design System**: Restauração total das cores Slate-900 e Glassmorphism v0.0.12.
- **Identidade**: Remoção da estética "Thunder AI" e regresso aos gradientes azuis translúcidos.
- **Localização**: Reposição integral do idioma Português (PT-PT) em todos os painéis de gestão.
- **Correções**: 
  - Resolvido erro de "Página não encontrada" nos QR Codes (correção de protocolo no URL).
  - Corrigido erro de sintaxe TypeScript no dashboard principal.
  - Ajustada a responsividade dos cards de vidro.

## [0.0.16] - 2026-03-08
### Fixed
- **True Black Aesthetic**: Alteração do fundo de `#0B0E14` para `#000000` (Preto Absoluto) para maior contraste.
- **Sidebar Minimalista**: Remoção de pílulas roxas sólidas na navegação; utilização de indicadores laterais finos e texto branco para estados ativos.
- **Glow Removal**: Eliminação total de gradientes azuis radiais e sombras neon que persistiam do design anterior.
- **Header Cleanup**: Redução da complexidade visual do cabeçalho and breadcrumbs.

## [0.0.15] - 2026-03-08
### Changed
- **Thunder AI Design Transition**: Substituição completa do estilo Vision UI pelo design profissional "Thunder AI".
  - **Paleta de Cores**: Novo esquema Indigo (`#635BFF`) sobre fundos escuros sólidos (`#0B0E14`).
  - **UI Professional Flat**: Remoção de glassmorphism e desfoques pesados; adoção de superfícies sólidas com sombras suaves (`thunder-panel`).
  - **Layout Corporativo**: Sidebar e Header integrados, abandonando o look flutuante.
  - **Tipografia & Icons**: Limpeza visual e uso de ícones de traço fino em caixas coloridas discretas.
  - **Localization**: Tradução de termos técnicos do dashboard para Inglês (mantendo suporte PT-PT/FR).

## [0.0.14] - 2026-03-08
### Changed
- **Visual Intensity Adjustment**: Resposta ao feedback de design insuficiente.
  - **Glassmorphism Reforçado**: Aumento do desfoque de 14px para 20px e saturação de 180% em todos os painéis.
  - **Contrastes de Cor**: Escurecimento do fundo principal (`--bg-dark`) para realçar os cartões de vidro.
  - **Header Glass Explicit**: O cabeçalho agora é um elemento de vidro independente para maior consistência estética.
  - **Mobile Ready**: Implementação de Menu Hamburguer na Sidebar (escondida por padrão em ecrãs pequenos).

## [0.0.13] - 2026-03-08
### Added
- **Vision UI Redesign**: Transformação estética profunda baseada no template "Vision UI Dashboard Pro".
  - **Global Architecture**: Novo fundo azul/púrpura profundo com imagem de textura premium.
  - **Glassmorphism 2.0**: Refatoração das classes `.glass-panel` e `.glass-card` com gradientes translúcidos complexos e bordas ultra-finas de 0.5px.
  - **Visual Icons**: Introdução das `icon-box` com gradientes azuis/ciano/verde vibrantes para as estatísticas.
  - **Sidebar Flutuante**: Novo menu lateral em painel de vidro com estados ativos destacados em gradiente.
  - **Refinamento de Tabelas**: Todas as tabelas de Visitantes, Membros e Propriedades ganharam um aspeto mais limpo, com tipografia em caixa alta (uppercase) e sombras dinâmicas.

## [0.0.12] - 2026-03-08
### Changed
- **Dashboard Overview (UI)**: Os 4 cartões de estatísticas no topo da página Inicial (`Visão Geral`) foram transformados em Atalhos Diretos (Clicáveis). Ao carregar em "Total de Visitas", "Acessos Permitidos" ou "A Aguardar na Porta", o Admin viaja diretamente para o Quadro de Registos. Clicar em "Espaços" navega agora para as Propriedades. Adicionou-se Glow Effects dinâmicos no Mouse Hover para guiar os olhos do utilizador.
## [0.0.11] - 2026-03-08
### Added
- **Convites Permanentes**: Instalada a funcionalidade de "Passe Permanente" no formulário de Criação de QR Codes. Ao invés de o código expirar no final do dia ou de exigir preenchimento manual de calendário, o utilizador pode flegar a checkbox para permitir que o Visitante use este QR Ad Eternum (validade virtual projetada para 2099).
## [0.0.10] - 2026-03-08
### Added
- **Global Realtime Notifications (Fase 8)**: Integração do sistema nativo de Push Notifications do Browser (API). No `DashboardLayout` passa a existir um listener silencioso do Supabase; quando alguém toca à campainha (Status: `pending`), o sistema despoleta uma alerta sonoro (Audio API - Mp3 de Campainha) contínua e apresenta uma popup flutuante nativa do Sistema Operativo com o nome de quem está à porta, redicionando para o Painel de Pessoas caso se clique na popup.
## [0.0.09] - 2026-03-08
### Added
- **Tutorial de Primeiro Login (Fase 10)**: Adicionado mecanismo de interceção no `DashboardLayout`. Quando um utilizador autenticado entra pela primeira vez na aplicação (ou num novo dispositivo limpo), é automaticamente encaminhado para a janela de "Ajuda & Tutorial" (`/dashboard/help`). Usa tags persistentes (`localStorage`) por `user_id` para evitar spam nas sessões seguintes.
## [0.0.08] - 2026-03-08
### Added
- **Help Desk (Fase 10)**: Adicionado ecrã de "Ajuda & Tutorial" internamente no Dashboard (`/dashboard/help`). Disponibiliza quatro cards visuais interativos que guiam novos utilizadores através da criação de unidades, convites de QR Code, comunicação bidirecional e gestão de residentes.
### Fixed
- Pequenas correções na renderização UI e parsing de template string no Dashboard Layout.
## [0.0.07] - 2026-03-08
### Added
- **Videochamadas em Tempo Real (Fase 8)**: Integração com o SDK da Daily.co. Permite aos administradores enviar um convite de vídeo P2P direto no chat, que abre uma sala temporária diretamente no telemóvel do visitante.
- **Gestão de Residentes (Fase 6)**: Novo painel de administração que lista os membros da organização, com capacidade de os remover/desassociar dinamicamente.
- **Proteção de Rotas (Fase 5)**: Implementado Guard Routing para impedir que utilizadores não autenticados acedam aleatoriamente ao Dashboard.
- **Master Script SQL (Fase 2)**: Fornecido script completo para replicação rápida das tabelas vitais e políticas de Row Level Security flexíveis.
## [0.0.06] - 2026-03-08
### Added
- **Chat em Tempo Real (Fase 8)**: Integração via WebSockets (Supabase Realtime) permitindo conversação bidirecional instantânea entre:
  - Painel de Administrador (`Visitors.tsx`) – expansível ao clicar num visitante ativo/em espera.
  - Web App do Visitante (`VisitorPage.tsx`) – micro-chat injetado assim que o visitante toca à campainha e entra no estado de triagem.
- **Novas Políticas de DB**: Lógica integrada de queries SQL para gestão e alojamento persistido das `messages`.


## [0.0.05] - 2026-03-08
### Added
- **Histórico de Visitas (Fase 7 concluída)**: Refatoração do painel `Visitors.tsx` com separadores (Tabs) para gestão limpa entre "Fila de Acessos Ativos" e "Histórico Completo".
- **Integração TailwindCSS v3**: Resolvido bug de renderização CSS com reposição da biblioteca para Tailwind v3.4 nativo.

## Versão 0.0.04 (08-03-2026)
- **Gestão de Espaços (Unidades)**: Crias sub-espaços na propriedade para maior contexto de acessos (ex. Garagem, Porta Principal).
- **Convites por QR Code**: Administradores podem agora gerar links QR temporários (passes) para visitantes diretamente a partir do portal.
- **WebApp Visitante Pública**: Criada interface móvel inovadora que o convidado acede através do seu leitor QR. Permite "Tocar à Campainha".
- **Realtime Sockets**: A página do visitante reflete a ação do Adm (Aprovado / Rejeitado) imediatamente via WebHooks.

## Versão 0.0.03 (08-03-2026)
- **Refinamento Premium UI**: Design do Painel de Admin totalmente renovado (Glassmorphism avançado, tabelas interativas, badges sombreados).
- **Auto-Login**: Adicionado botão "Pular Login (Conta Teste)" na página de autenticação para permitir entrada direta e aliviar testes.
- Novo cabeçalho na aplicação principal para saudar o utilizador ativo.

## Versão 0.0.02 (08-03-2026)
- **Rebranding Principal**: Toda a aplicação foi renomeada de "PortaVi" para "Hello".
- **Apoio a Consumidor (Residencial)**: O fluxo de Registo e Login foi relaxado. Removemos obrigações de "Emails Corporativos" e "Nome de Organização" puro para permitir que qualquer pessoa registe a sua rpopriedade individual/casa sem fricção.
- O texto e os labels base foram revistos para serem de uso misto (Pessoal e Empresarial).
- Corrigidos pequenos warnings de TypeScript nas listagens do Dashboard.
- Landing Page com textos mais "B2C" amigáveis.

## Versão 0.0.01 (08-03-2026)
- Setup inicial do projeto (React, Vite, TypeScript, Tailwind/CSS Customizado, i18next).
- Implementação dos idiomas base: Português (PT-PT), Inglês (EN), Francês (FR) e Espanhol (ES).
- Integração e ligação ao Supabase (Tabelas de Organizações, Propriedades, Unidades, Perfis e Acessos RLS).
- Criação do Design System premium (Glassmorphism e Dark Mode).
- Criação das Páginas Públicas: Landing Page (Hero, Features, Pricing).
- Integração do Login e Auth de Registo (com criação lógica de organizações via Supabase API).
- Criação do esqueleto da primeira página do Painel de Admin (Visão Geral/Métricas).
