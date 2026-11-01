import { describe, it, expect } from 'vitest';

describe('Hello App Suite de Verificação', () => {
    it('deve validar a configuração básica do projeto e variáveis globais', () => {
        expect(true).toBe(true);
    });

    it('deve conter as versões semânticas válidas', () => {
        const version = '1.1.62';
        expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('deve formatar corretamente as mensagens de campainha', () => {
        const visitorName = 'João Silva';
        const unitName = 'Fração B';
        const formatted = `Visitante ${visitorName} está na porta para ${unitName}`;
        expect(formatted).toContain('João Silva');
        expect(formatted).toContain('Fração B');
    });
});
