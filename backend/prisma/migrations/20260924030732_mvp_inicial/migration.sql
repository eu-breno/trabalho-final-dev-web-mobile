-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('estudante', 'administrador');

-- CreateEnum
CREATE TYPE "Nota" AS ENUM ('errei', 'dificil', 'bom', 'facil');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL DEFAULT 'estudante',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Baralho" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Baralho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cartao" (
    "id" TEXT NOT NULL,
    "frente" TEXT NOT NULL,
    "verso" TEXT NOT NULL,
    "baralhoId" TEXT NOT NULL,
    "facilidade" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "repeticoes" INTEGER NOT NULL DEFAULT 0,
    "intervaloDias" INTEGER NOT NULL DEFAULT 0,
    "proximaRevisao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaRevisao" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cartao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revisao" (
    "id" TEXT NOT NULL,
    "cartaoId" TEXT NOT NULL,
    "nota" "Nota" NOT NULL,
    "intervaloAnteriorDias" INTEGER NOT NULL,
    "intervaloNovoDias" INTEGER NOT NULL,
    "revisadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Revisao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Baralho_usuarioId_nome_key" ON "Baralho"("usuarioId", "nome");

-- CreateIndex
CREATE INDEX "Cartao_baralhoId_proximaRevisao_idx" ON "Cartao"("baralhoId", "proximaRevisao");

-- AddForeignKey
ALTER TABLE "Baralho" ADD CONSTRAINT "Baralho_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cartao" ADD CONSTRAINT "Cartao_baralhoId_fkey" FOREIGN KEY ("baralhoId") REFERENCES "Baralho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revisao" ADD CONSTRAINT "Revisao_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "Cartao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
