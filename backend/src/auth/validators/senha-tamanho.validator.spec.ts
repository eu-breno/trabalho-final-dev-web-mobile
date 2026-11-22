import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import {
  MaxUtf8Bytes,
  senhaDentroDoLimiteBcrypt,
} from './senha-tamanho.validator.js';

class SenhaTestavel {
  @MaxUtf8Bytes(72)
  senha!: string;
}

describe('validador de senha por bytes UTF-8', () => {
  it('aceita o limite de 72 bytes e rejeita 73 bytes, inclusive com caracteres multibyte', async () => {
    expect(senhaDentroDoLimiteBcrypt('a'.repeat(72))).toBe(true);
    expect(senhaDentroDoLimiteBcrypt('😀'.repeat(18))).toBe(true);
    expect(senhaDentroDoLimiteBcrypt('😀'.repeat(18) + 'a')).toBe(false);

    const aceita = Object.assign(new SenhaTestavel(), {
      senha: '😀'.repeat(18),
    });
    const rejeita = Object.assign(new SenhaTestavel(), {
      senha: '😀'.repeat(18) + 'a',
    });
    await expect(validate(aceita)).resolves.toHaveLength(0);
    await expect(validate(rejeita)).resolves.not.toHaveLength(0);
  });
});
