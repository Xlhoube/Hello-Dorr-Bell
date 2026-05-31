# 🔒 Logótipo Oficial - Hello (Design Lock)

Este documento oficializa o design do logótipo da aplicação **Hello**. Para garantir a consistência de marca e o posicionamento premium, este design está **BLOQUEADO** para alterações sem autorização prévia do utilizador.

## Design Especificado

O logótipo é composto por dois elementos de texto empilhados e centrados:

1.  **hello**:
    *   **Fonte**: Black (Peso máximo).
    *   **Estilo**: Italic (Itálico).
    *   **Cor**: `#4F46E5` (Indigo-600).
    *   **Tracking**: Tight (Apertado).

2.  **DOOR BELL**:
    *   **Posicionamento**: Logo abaixo de "hello".
    *   **Fonte**: Black (Peso máximo).
    *   **Estilo**: Italic (Itálico).
    *   **Cor**: Zinc-500 (Cinza médio).
    *   **Transformação**: UPPERCASE (Maiúsculas).
    *   **Tracking**: Widest (Espaçamento largo, entre 8px a 12px conforme o contexto).

## Implementação Técnica

O logótipo deve ser sempre instanciado através do componente centralizado:
`src/components/ui/Logo.tsx`

```tsx
import { Logo } from '@/components/ui/Logo';

// Exemplo de uso
<Logo size="lg" />
```

## Regras de Utilização
- **Não** alterar a paleta de cores indigo/zinc.
- **Não** remover o itálico; ele confere dinamismo à marca.
- **Não** alterar o empilhamento vertical.
- **Não** traduzir os termos "hello" ou "door bell", pois constituem o nome da marca.

---
**Data de Bloqueio**: 17 de Março de 2026
**Versão de Referência**: v1.0.10
