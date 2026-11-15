import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { ExcluirUsuarioDto } from './excluir-usuario.dto.js';

describe('ExcluirUsuarioDto', () => {
  it('aceita senhas de até 72 bytes UTF-8 e rejeita as maiores', async () => {
    const senhaValida = Object.assign(new ExcluirUsuarioDto(), {
      senha: '😀'.repeat(18),
    });
    const senhaLonga = Object.assign(new ExcluirUsuarioDto(), {
      senha: '😀'.repeat(19),
    });

    await expect(validate(senhaValida)).resolves.toHaveLength(0);
    await expect(validate(senhaLonga)).resolves.not.toHaveLength(0);
  });

  it('exige uma senha não vazia', async () => {
    const dto = Object.assign(new ExcluirUsuarioDto(), { senha: '' });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
