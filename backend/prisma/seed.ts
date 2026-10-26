import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma/client.js';
import { Perfil } from '../generated/prisma/enums.js';

function valorObrigatorio(nome: string): string {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(
      `A variável de ambiente ${nome} é obrigatória para executar a seed.`,
    );
  }
  return valor;
}

const email = valorObrigatorio('ADMIN_EMAIL');
const senha = valorObrigatorio('ADMIN_SENHA');
const nome = valorObrigatorio('ADMIN_NOME');
const connectionString = valorObrigatorio('DATABASE_URL');
if (senha.length < 8) {
  throw new Error('A variável ADMIN_SENHA deve ter pelo menos 8 caracteres.');
}
if (Buffer.byteLength(senha, 'utf8') > 72) {
  throw new Error(
    'A variável ADMIN_SENHA deve ter no máximo 72 bytes em UTF-8.',
  );
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

try {
  const senhaHash = await bcrypt.hash(senha, 10);
  await prisma.usuario.upsert({
    where: { email },
    update: {
      nome,
      senhaHash,
      perfil: Perfil.administrador,
    },
    create: {
      nome,
      email,
      senhaHash,
      perfil: Perfil.administrador,
    },
  });
  console.info(`Administrador ${email} garantido no banco de dados.`);
} finally {
  await prisma.$disconnect();
}
