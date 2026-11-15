import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

export const LIMITE_SENHA_BCRYPT_BYTES = 72;

export function senhaDentroDoLimiteBcrypt(senha: string): boolean {
  return Buffer.byteLength(senha, 'utf8') <= LIMITE_SENHA_BCRYPT_BYTES;
}

export function MaxUtf8Bytes(
  limite: number,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (objeto, propriedade) => {
    registerDecorator({
      name: 'maxUtf8Bytes',
      target: objeto.constructor,
      propertyName: String(propriedade),
      constraints: [limite],
      options: validationOptions,
      validator: {
        validate(valor: unknown, argumentos?: ValidationArguments) {
          const maximo = argumentos?.constraints?.[0];
          return (
            typeof valor === 'string' &&
            typeof maximo === 'number' &&
            Buffer.byteLength(valor, 'utf8') <= maximo
          );
        },
      },
    });
  };
}
