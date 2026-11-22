import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Perfil } from '../generated/prisma/enums.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { AppModule } from '../src/app.module.js';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('API autenticada (e2e)', () => {
  let app: INestApplication<App>;
  let usuario:
    | {
        id: string;
        nome: string;
        email: string;
        senhaHash: string;
        perfil: Perfil;
      }
    | undefined;
  let baralho: {
    id: string;
    usuarioId: string;
    nome: string;
    descricao: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | undefined;
  let cartao: {
    id: string;
    baralhoId: string;
    frente: string;
    verso: string;
    facilidade: number;
    repeticoes: number;
    intervaloDias: number;
    proximaRevisao: Date;
    ultimaRevisao: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | undefined;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'segredo-exclusivo-dos-testes-e2e';
    const prisma = {
      usuario: {
        create: vi.fn(async ({ data }) => {
          usuario = {
            id: '00000000-0000-4000-8000-000000000001',
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return usuario;
        }),
        findUnique: vi.fn(async ({ where, select }) => {
          if (!usuario) return null;
          if (where.id === usuario.id || where.email === usuario.email) {
            if (!select) return usuario;
            return Object.fromEntries(
              Object.keys(select).map((field) => [
                field,
                usuario[field as keyof typeof usuario],
              ]),
            );
          }
          return null;
        }),
      },
      baralho: {
        create: vi.fn(async ({ data }) => {
          baralho = {
            id: '10000000-0000-4000-8000-000000000001',
            usuarioId: usuario!.id,
            descricao: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
          };
          return baralho;
        }),
        findFirst: vi.fn(async ({ where }) => {
          if (!baralho || where.id !== baralho.id || where.usuarioId !== baralho.usuarioId) {
            return null;
          }
          return { ...baralho, cartoes: cartao ? [cartao] : [] };
        }),
        findMany: vi.fn(async () => (baralho ? [{ ...baralho, cartoes: cartao ? [cartao] : [] }] : [])),
      },
      cartao: {
        create: vi.fn(async ({ data }) => {
          const agora = new Date();
          cartao = {
            id: '20000000-0000-4000-8000-000000000001',
            frente: data.frente,
            verso: data.verso,
            baralhoId: data.baralhoId,
            facilidade: 2.5,
            repeticoes: 0,
            intervaloDias: 0,
            proximaRevisao: agora,
            ultimaRevisao: null,
            createdAt: agora,
            updatedAt: agora,
          } as typeof cartao;
          return cartao;
        }),
        findFirst: vi.fn(async ({ where }) =>
          cartao && where.id === cartao.id && where.baralho?.usuarioId === usuario?.id
            ? cartao
            : null,
        ),
        update: vi.fn(async ({ data }) => {
          cartao = { ...cartao!, ...data, updatedAt: new Date() };
          return cartao;
        }),
      },
      revisao: {
        create: vi.fn(async ({ data }) => ({ id: '30000000-0000-4000-8000-000000000001', ...data })),
      },
      $transaction: vi.fn(async (callback) => callback(prisma)),
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /usuarios sem token retorna 401', async () => {
    await request(app.getHttpServer()).get('/usuarios').expect(401);
  });

  it('login com credenciais inválidas retorna 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ausente@example.com', senha: 'senha-incorreta' })
      .expect(401);
  });

  it('registra, autentica e consulta o perfil com o token emitido', async () => {
    await request(app.getHttpServer())
      .post('/auth/registro')
      .send({
        nome: 'Ana Teste',
        email: 'ana@example.com',
        senha: 'senha-segura-123',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: '00000000-0000-4000-8000-000000000001',
          nome: 'Ana Teste',
          email: 'ana@example.com',
          perfil: Perfil.estudante,
        });
        expect(body).not.toHaveProperty('senhaHash');
      });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ana@example.com', senha: 'senha-segura-123' })
      .expect(201);
    expect(login.body.accessToken).toEqual(expect.any(String));

    await request(app.getHttpServer())
      .get('/auth/perfil')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: '00000000-0000-4000-8000-000000000001',
          nome: 'Ana Teste',
          email: 'ana@example.com',
          perfil: Perfil.estudante,
        });
        expect(body).not.toHaveProperty('senhaHash');
      });
  });

  it('executa o fluxo cadastro, login, baralho, cartão e revisão', async () => {
    await request(app.getHttpServer())
      .post('/auth/registro')
      .send({
        nome: 'Fluxo Completo',
        email: 'fluxo@example.com',
        senha: 'senha-segura-123',
      })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'fluxo@example.com', senha: 'senha-segura-123' })
      .expect(201);
    const authorization = `Bearer ${login.body.accessToken}`;

    await request(app.getHttpServer())
      .post('/baralhos')
      .set('Authorization', authorization)
      .send({ nome: 'Português', descricao: 'Estudo completo' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/baralhos/10000000-0000-4000-8000-000000000001/cartoes')
      .set('Authorization', authorization)
      .send({ frente: 'Olá', verso: 'Hello' })
      .expect(201);

    const revisao = await request(app.getHttpServer())
      .post('/cartoes/20000000-0000-4000-8000-000000000001/revisoes')
      .set('Authorization', authorization)
      .send({ nota: 'bom' })
      .expect(201);

    expect(revisao.body).toMatchObject({
      id: '20000000-0000-4000-8000-000000000001',
      intervaloDias: 3,
    });
    expect(revisao.body.proximaRevisao).toEqual(expect.any(String));
  });
});
