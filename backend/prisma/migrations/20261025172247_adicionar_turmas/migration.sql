-- AlterTable
ALTER TABLE "Baralho" ADD COLUMN     "turmaId" TEXT;

-- CreateTable
CREATE TABLE "Turma" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "codigo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Turma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurmaUsuario" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "entrouEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TurmaUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Turma_codigo_key" ON "Turma"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "TurmaUsuario_usuarioId_turmaId_key" ON "TurmaUsuario"("usuarioId", "turmaId");

-- AddForeignKey
ALTER TABLE "TurmaUsuario" ADD CONSTRAINT "TurmaUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurmaUsuario" ADD CONSTRAINT "TurmaUsuario_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Baralho" ADD CONSTRAINT "Baralho_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE SET NULL ON UPDATE CASCADE;
