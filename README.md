# 🔔 HELLO - Manual de Utilizador e Guia Completo

Bem-vindo ao **HELLO**, o seu Sistema de Portaria Inteligente de próxima geração.  
Este guia detalhado explica passo a passo todas as funcionalidades da plataforma, desde a configuração inicial até à interação avançada com visitantes via videochamada e telemóvel.

---

## 📋 Índice
1. [Conceitos Base e Configuração Inicial](#1-conceitos-base-e-configuração-inicial)
2. [Gestão de Locais (Propriedades e Frações)](#2-gestão-de-locais)
3. [Residentes e Convites](#3-residentes-e-convites)
4. [A Experiência do Visitante (Na Porta)](#4-a-experiência-do-visitante-na-porta)
5. [O Painel de Controlo (Dashboard do Rececionista)](#5-o-painel-de-controlo-do-residente)
6. [Chamadas de Vídeo e Chat ao Vivo](#6-chamadas-de-vídeo-e-chat-ao-vivo)
7. [App de Telemóvel e Notificações (PWA)](#7-app-de-telemóvel-e-notificações-pwa)
8. [Cartões de Porta (Impressão de QR Codes)](#8-cartões-de-porta-impressão-de-qr-codes)

---

## 1. Primeiros Passos e Configurações Gerais

O sistema centraliza todo o seu controlo de acessos a partir de uma única conta. Pode gerir vários condomínios, ginásios, escritórios ou a sua própria habitação num único painel altamente intuitivo.

### O seu Perfil (Settings)
No menu esquerdo, vá a **Definições**:
- Pode alterar os detalhes da sua conta (Email/Password).
- **Aparência e Idioma**: A HELLO suporta PT, EN, ES, FR. O sistema arranca por defeito em Inglês mas pode forçar a tradução na sua conta. Também é possível forçar o Tema Escuro (Dark Mode) ou Claro (Light Mode).
- **Templates de QR Code**: É aqui que seleciona o estilo do Cartão Físico que vai imprimir para colar na porta (Ex: *Dark*, *Classic*, *Minimal*, *Corporate*).

---

## 2. Gestão de Locais

Antes de receber visitantes, tem de dizer ao sistema que "Portas" existem.
Vá à aba **Locais** no menu.

1. **Adicionar Propriedade**: Refere-se a um Edifício, Moradia, ou Complexo inteiro (Ex: "Office Park Central" ou "Moradia de Férias").
2. **Adicionar Unidade/Sala**: Após criar a Propriedade, pode adicionar-lhe dezenas de Frações (Ex: "Sala de Reuniões A", "Apartamento 4 Esq", ou "Porta Principal").
3. É para esta *Unidade* que será gerado um **QR Code único**. Se tiver 4 escritórios, imprime 4 QR Codes diferentes. O visitante que lê o QR Code do escritório 2 só vai tocar à campainha do escritório 2.

---

## 3. Residentes e Convites

Qualquer Unidade pode ser partilhada com múltiplas pessoas (família, marido, mulher, equipa de apoio, etc).
Vá à aba **Residentes** no menu.

1. Escolha a Propriedade e clique em **Partilhar Convite**.
2. O sistema gera uma mensagem automática com um Link Mágico (perfeito para partilhar no WhatsApp).
3. A pessoa que clica nesse Link só tem de meter o próprio nome e password. A partir desse momento, ela tem acesso ao Painel dessa mesma Unidade e **também passa a receber notificações** quando tocarem a essa campainha!

---

## 4. A Experiência do Visitante (Na Porta)

Isto é o que acontece quando alguém chega à sua porta.
1. O Visitante **não precisa de ter qualquer App instalada**. Ao apontar a câmara do telemóvel para o código impresso na porta, o Safari/Chrome abre imediatamente.
2. O ecrã mostra a marca do alojamento e um botão gigante a pedir para capturar o rosto.
3. A Câmara abre "em modo retrovisor/selfie". O visitante clica num botão e a Selfie é capturada.
4. O visitante é colocado numa Sala de Espera digital animada, dizendo que "O Residente foi avisado!".

**Múltiplos Toques:** 
Para evitar que o visitante desista se o residente estiver distraído, o visitante tem um botão iluminado no ecrã do seu telemóvel: **[ 🔔 Tocar Novamente ]**. Clicar ali dispara novamente a campanha nos aparelhos dos residentes. Um "cooldown" de 10 segundos previne abusos/spam.

---

## 5. O Painel de Controlo do Residente

Enquanto o visitante está na porta, o que acontece do lado de dentro?
1. O **Dashboard** lista todas as visitas recentes através de métricas de controlo modernas. Pode ver instantaneamente quem esteve na porta por todo o histórico.
2. Na aba **Visitantes**, pode visualizar os cartões com as fotografias de todos os que tocaram à campainha no passado.
3. Se o visitante tocar à campainha *agora mesmo*, o cartão salta para as primeiras linhas a dizer **A aguardar Resposta**.

Em vez de ir à porta, tem dois botões simples no painel:
- **Aprovar**: O visitante vê o seu telemóvel acender a verde a dizer "Pode Entrar".
- **Rejeitar**: O visitante vê o ecrã a vermelho a dizer "Acesso Negado".

---

## 6. Chamadas de Vídeo e Chat ao Vivo

Se não quiser assumir nada, basta clicar em cima do visitante pendente!
Vai abrir-se uma **Janela de Chat Gigante (Estilo iMessage/WhatsApp)**.

- **Texto em Direto**: O que você escreve aparece no telemóvel da rua no mesmo instante, e vice-versa.
- **Auto-scroll**: A janela de texto rola automaticamente para acompanhar a conversa viva.
- **VIDEOCHAMADA (A Magia Absoluta)**: Clicar no botão lateral "INICIAR VÍDEO" envia um convite luxuoso dinâmico para o telemóvel do visitante. Se ele aceitar, um ecrã pop-up de Vídeo Criptografado Ponta-A-Ponta (Powered by Daily.co/Jitsi Hub) vai abrir sem necessidade de softwares pesados! Vão poder conversar cara-a-cara de forma incrivelmente rápida e clara.

---

## 7. App de Telemóvel e Notificações (PWA)

O problema clássico: *E se eu não estiver ao computador?*
A **HELLO** é uma App de Nível Nativo (PWA - Progressive Web App).

**Como instalar no seu próprio telemóvel:**
1. Abra o link da portaria fornecido no seu telemóvel (ex: painel do Hostinger).
2. O sistema vai perguntar ou sugerir "Adicionar ao Ecrã Principal". Aceite.
3. A Hello vira um ícone no seu telemóvel. Ao abrir, o Chrome/Safari desaparece e a App corre de forma independente e profissional.
4. **Notificações Milagrosas**: Na página principal, a App vai pedir permissões. Quando aprova as notificações, pode colocar o telemóvel no bolso bloqueado. Sempre que um visitante tocar à porta, o servidor da Hello vai enviar um comando nativo que faz o telemóvel acender o ecrã, lançar o balão Push da App no bloqueio, **vibrar e tocar áudio automaticamente**.

---

## 8. Cartões de Porta (Impressão de QR Codes)

Para as pessoas poderem tocar à campainha mentalmente e fisicamente, precisa dos papéis mágicos.
- Vá à aba **Locais (Properties)**.
- Escolha a Propriedade desejada.
- Clique em **Detalhes da Unidade** e escolha a Unidade em concreto.
- Pressione o botão **[ Imprimir QR Code ]**.

**A Página Físil:**
A folha gerada usa o formato WebKit-Exato nativo para as impressoras para não desconfigurar esquemas escuros e azuis brilhantes. Nos cartões vão estar impressos:
1. O Logotipo (Logo Oficial da sua empresa/aplicação).
2. O Quadrado Enorme Secundário do QR Code onde toda a Magia da porta se desencadeia.
3. Um minúsculo e promocional QR Code inferior apontando sempre para **hellodoorbell.com**, para que o mundo possa conhecer a tecnologia por trás do vosso alojamento luxuoso de forma limpa.

---

A **HELLO** foi meticulosamente construída para escalabilidade, operando em milissegundos através dos websockets Realtime do Supabase. Seja num pequeno ginásio local ou num arranha-céus, a Hello é o futuro da comunicação recetiva sem fricção.
