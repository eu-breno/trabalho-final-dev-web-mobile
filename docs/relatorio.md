# Relatório Técnico de Desenvolvimento

---

## Identificação

| Campo | Valor |
|---|---|
| **Nome do projeto** | Memora |
| **Grupo** | Grupo H |
| **Integrantes** | Breno Olliari e Matheus dos Santos Savegnagi |
| **Repositório** | `https://github.com/eu-breno/trabalho-final-dev-web-mobile` |
| **Vídeo de apresentação** | Ainda não registrado neste relatório |

---

## 1. Ambiente de desenvolvimento

### 1.1 Ferramentas e versões

| Ferramenta | Versão | Quem |
|---|---|---|
| Node.js | 24.18.0 na máquina de Breno (o enunciado indica Node.js 22 LTS) | Breno; Matheus: não registrado |
| npm | 11.16.0 | Breno |
| Git | 2.51.0 (Windows) | Breno |
| NestJS CLI | 12.0.0 | Breno |
| NestJS, Next.js, React, Prisma | 12.0.1, 16.3.5, 19.2.8 e 7.10.0 (conforme `package-lock.json`) | Ambos |
| Flutter SDK | Não instalado de Breno; Matheus: não registrado | Matheus |
| PostgreSQL | 18 (imagem Docker, usada por Breno) | Breno; Matheus: não registrado |
| Docker | 29.8.0 na máquina de Breno | Breno; Matheus: não registrado |
| Emulador ou dispositivo usado no mobile | Não utilizado até 01/11/2026; a interface mobile não foi executada em dispositivo nesta etapa | Matheus |
| Sistema operacional | Windows 11 Pro (10.0.26200) na máquina de Breno | Breno; Matheus: não registrado |
| Editor | WebStorm e VS Code (com GitHub Copilot) | Breno |

**Como o banco foi provisionado:** (x) Docker Compose · ( ) PostgreSQL instalado na máquina · ( ) serviço hospedado

### 1.2 Divergências em relação ao README

| Componente | O que divergiu | Como foi resolvido |
|---|---|---|
| Banco | Caminho do volume do PostgreSQL 18 no Docker e conflito de porta com outro PostgreSQL da máquina (24/09) | Volume corrigido e porta externa 5433 |
| Git | O commit pelo WebStorm falhou (07/09) | Clone do repositório e commit pelo Git Bash |
| Backend | Os scripts de instalação do Prisma 7 precisaram de aprovação | `npm approve-scripts` para `prisma` e `@prisma/engines` |
| Backend | O arquivo de configuração estava como `prisma7.config.ts`, e o Prisma 7 espera `prisma.config.ts` (25/10) | Arquivo renomeado |
| Backend | A seed falhou com `ERR_MODULE_NOT_FOUND`: o comando `node --experimental-strip-types` não resolve a importação do cliente Prisma gerado em TypeScript (25/10) | Executor trocado para `tsx` |
| Ambiente | O Docker não estava instalado na máquina de Breno no início, o que impedia subir o PostgreSQL | Instalação do Docker e uso do `docker-compose.yml` do repositório |
| Web | A API e o frontend usam a porta 3000 por padrão | Subir a API primeiro; o Next.js passa para a 3001 quando a 3000 está ocupada, e o README também sugere `-p 3001`. Na prática, o frontend roda na 3001 |

### 1.3 Endereços de rede entre os componentes

| Origem | URL da API usada | Observação |
|---|---|---|
| Web (navegador) | `http://localhost:3000` (variável `NEXT_PUBLIC_API_URL`, lida em `frontend/lib/backend-url.ts`) | As chamadas passam pelas rotas do Next.js, que repassam ao backend |
| Mobile (emulador) | Não aplicável até 01/11/2026 | O app ainda não chama a API; quando chamar, `localhost` apontará para o próprio emulador, não para o computador |
| Mobile (dispositivo físico) | Não usado | Nenhuma integração HTTP ou teste em dispositivo físico foi feito nesta etapa |

---

## 2. Uso de Inteligência Artificial

### 2.1 Ferramentas utilizadas

| Ferramenta | Versão / Plano | Quem usou | Em que componente |
|---|---|---|---|
| GitHub Copilot (Chat, modo Agent, no VS Code) | Plano gratuito | Breno | Backend, web e documentação |
| Claude (claude.ai) | Plano gratuito | Breno | Decisões de projeto, diagnóstico, elaboração de prompts para o Copilot (inclusive o do visual do frontend) e revisão da documentação |
| Nenhuma outra ferramenta de IA adicional | Não registrada pela equipe até 02/11/2026 | Matheus | — |

### 2.2 Atenção específica desta stack

| Situação | Ocorreu? | Onde e como foi corrigido |
|---|---|---|
| Código gerado com Next.js Pages Router (`getServerSideProps`, `pages/api/`) | Não | Verificado em 25/10: o frontend usa App Router e não há pasta `pages/` nem `getServerSideProps` |
| Prisma sem o adaptador `@prisma/adapter-pg`, ou importando de `@prisma/client` em vez do caminho gerado | Não | A seed gerada usou `PrismaPg` e o cliente gerado, como pedido no prompt |
| Decorators ou módulos de versão antiga do NestJS | Não identificado | |
| Pacotes Flutter descontinuados ou incompatíveis com Flutter 3 | Não aplicável até agora | O app está no início (Etapa 4) |
| Outro | Sim | O comando de execução da seed sugerido pela IA não funcionava no ambiente (ver 1.2); foi trocado por `tsx` |

### 2.3 Evidências de uso

Até 24/10/2026 os prompts não foram guardados de forma sistemática. Os usos desse período estão reconstruídos de memória e aparecem assim identificados, exceto os prompts das telas e da análise do administrador, recuperados de um arquivo de anotações. A partir de 25/10/2026 o texto exato dos prompts passou a ser guardado. Os textos estão em `docs/anexo-prompts-ia.md`.

---

#### Etapa 2 — Backend (perfil administrador)

- **Quem conduziu:** Breno
- **Ferramenta e data:** GitHub Copilot (Agent, VS Code), 25/10/2026. O planejamento e o prompt foram elaborados com Claude.
- **Objetivo da tarefa:** implementar o perfil administrador na versão mínima: `GET /usuarios` restrito ao administrador, seed do administrador e página `/admin/usuarios`, sem alterar baralhos, cartões, estatísticas nem o schema.
- **Prompt utilizado:** texto no Anexo (`docs/anexo-prompts-ia.md`), seção D.
- **Trecho aproveitado** (commit `3d1cd16`; `-` é o código anterior e `+` o novo):
```
  // backend/src/auth/decorators/roles.decorator.ts
  - export const Roles = (...roles: Perfil[]) => SetMetadata(ROLES_KEY, Perfil);
  + export const Roles = (...roles: Perfil[]) => SetMetadata(ROLES_KEY, roles);

  // backend/src/auth/guards/papeis.guard.ts
  - return !!usuario && papeisNecessarios.includes(usuario.papel);
  + return !!usuario && papeisNecessarios.includes(usuario.perfil);
```
- **Análise crítica:** o que estava correto: a correção do decorator de papéis (que gravava o enum `Perfil` em vez dos papéis recebidos), a correção do guard (que comparava um campo `usuario.papel`, em vez do `usuario.perfil` que vai no JWT), o módulo `usuarios` com `JwtAuthGuard` antes do `PapeisGuard`, a resposta sem `senhaHash` e o registro criando sempre `estudante`; os builds do backend e do frontend passaram. O que estava errado: o comando da seed não executava no ambiente (ver 1.2); a IA também não executou a seed nem o fluxo completo, só os builds. Riscos identificados: a senha do administrador vem de variável de ambiente (nunca pode ser versionada); a interface esconde o link para estudantes, mas a proteção real está na API (resposta 403).
- **A resposta usava versão desatualizada da stack?** Não identificado no código gerado.
- **Correções feitas manualmente e por quê:** troca do executor da seed para `tsx` (instalado como dependência de desenvolvimento), porque o comando original não resolve o import do cliente Prisma gerado. Commit: `3d1cd16` (a troca foi feita antes do commit e ficou nele).
- **Evidência no repositório** (commit ou PR): `3d1cd16` (25/10/2026)
- **Como validou:** build do backend e do frontend e teste manual: a seed criou o administrador, o login como administrador mostrou o link e a página de usuários, e o login como estudante mostrou "Acesso negado" (a API responde 403). Tudo funcionou.
---

#### Etapa 2 — Backend (usos anteriores a 25/10, reconstruídos de memória)

- **Quem conduziu:** Breno
- **Ferramenta e data:** GitHub Copilot (Agent, VS Code), por volta de 24/09/2026 (primeiro uso) e 11/10/2026 (segundo uso)
- **Objetivo da tarefa:** (1) revisar o código de cartões e DTOs feito por Matheus e indicar o que mudar sem perder o que ele havia feito; (2) ligar os módulos de baralhos e cartões ao usuário autenticado (JWT) enquanto Breno trabalhava no frontend.
- **Prompt utilizado:** sem registro do texto exato. Resumo: (1) o que pode ser alterado mantendo o que o Matheus fez; (2) pedido de ajuda com a autenticação nos módulos de baralhos e cartões.
- **Trecho aproveitado:** (1) os serviços passaram de dados em memória para consultas e escritas no PostgreSQL, principalmente em `backend/src/baralhos/baralhos.service.ts`, `backend/src/cartoes/cartoes.service.ts` e `backend/src/prisma/prisma.service.ts`; (2) os controllers e serviços passaram a receber o usuário autenticado e a filtrar baralhos, cartões e estatísticas pelo usuário do token.
- **Análise crítica:** (1) a IA apontou corretamente que os dados ficavam em arrays locais, em memória, e organizou a migração para o PostgreSQL via Prisma. Breno já havia identificado o problema, então o uso serviu para conferir as mudanças e não como decisão automática. (2) no uso de 11/10, a orientação para ligar os recursos ao usuário autenticado manteve o isolamento dos dados como responsabilidade do backend. Nenhum erro da IA foi percebido nesses dois usos; o risco é aceitar código sem revisar linha a linha.
- **A resposta usava versão desatualizada da stack?** Não.
- **Correções feitas manualmente e por quê:** nenhuma correção adicional foi registrada; o código gerado ou sugerido foi revisto, compilado e integrado pelos integrantes.
- **Evidência no repositório** (commit ou PR): `f8c5be4` (24/09) e `ebad340` (11/10)
- **Como validou:** criação de baralho, cartão e revisão testada pela API e build em 24/09; em 11/10, o backend foi compilado com os módulos autenticados, estatísticas testadas pelo código e o cliente web integrado aos endpoints.
---

#### Etapa 3 — Cliente web

- **Quem conduziu:** Breno
- **Ferramenta e data:** Claude (melhorar a descrição do pedido e escrever o prompt) e GitHub Copilot (Agent, VS Code, para implementar), em 18/10/2026
- **Objetivo da tarefa:** criar a página de revisão (barra de progresso, botão de sair com confirmação, virar o cartão, avaliação e resumo final) e remodelar as páginas de baralhos e de detalhe do baralho (lista com busca, ordenação, menu de três pontinhos e diálogos). Breno baixou os componentes do shadcn/ui, montou um esqueleto das telas e descreveu o que queria ao Claude, que escreveu o prompt para o Copilot. O prompt mandava ler antes `docs/` e `backend/`, reutilizar os componentes já instalados e listar os endpoints que faltassem, em vez de inventá-los.
- **Prompt utilizado:** texto no Anexo (`docs/anexo-prompts-ia.md`), seção A (pedido de Breno ao Claude) e seção B (prompt entregue ao Copilot).
- **Trecho aproveitado:**
```
  frontend/app/(authenticated)/revisao/page.tsx
  frontend/app/(authenticated)/baralhos/page.tsx
  frontend/app/(authenticated)/baralhos/[id]/page.tsx
  frontend/components/study/deck-browser.tsx
  frontend/components/study/review-session.tsx
  frontend/components/ui/dialog.tsx
  frontend/components/ui/alert-dialog.tsx
```
- **Análise crítica:** o esqueleto feito por Breno serviu de contexto, e a IA manteve o layout pretendido e apenas o refinou. O pedido original tinha ambiguidades, e o próprio Breno pediu ao Claude que melhorasse a descrição antes de entregá-la ao Copilot; o prompt final também pediu que a IA registrasse as decisões tomadas nos pontos ambíguos. Erro identificado: o Copilot criou ícones temáticos automaticamente a partir dos nomes dos baralhos e substituiu ações simples por componentes adicionais. A implementação foi simplificada depois para uma tabela com ações consistentes; ícones decorativos não eram necessários para o comportamento correto.
- **A resposta usava versão desatualizada da stack?** Não identificado (verificado em 25/10: App Router, sem Pages Router).
- **Correções feitas manualmente e por quê:** a listagem foi revista e os ícones temáticos foram removidos da experiência principal; ela passou a usar ícones neutros e ações explícitas em menus, evitando que o texto ou conteúdo do baralho determinasse arbitrariamente sua aparência. Ajustes posteriores de interface: em 23/10 a listagem de baralhos virou uma tabela com ordenação nos cabeçalhos e paginação.
- **Evidência no repositório** (commit ou PR): `f197cf3` (18/10); ajustes em `78cc80a` (23/10) e `f9901dc` (24/10)
- **Como validou:** o frontend foi iniciado, o código foi compilado e as telas de revisão, baralhos e detalhe foram usadas no navegador; menus, diálogos, ordenação, navegação e ações foram conferidos manualmente.
---

#### Análise da área de administrador/professor (antes de 25/10)

- **Quem conduziu:** Breno
- **Ferramenta e data:** Claude (elaboração do prompt) e GitHub Copilot (análise), por volta de 25/10/2026
- **Objetivo da tarefa:** sem escrever código, levantar o que existia e propor uma área de administrador/professor simples, avaliando o impacto no contrato, no PRD e no MVP.
- **Prompt utilizado:** texto no Anexo (`docs/anexo-prompts-ia.md`), seção C1 (rascunho do Claude) e seção C2 (prompt entregue ao Copilot).
- **Análise crítica:** o Copilot recomendou começar por uma área administrativa enxuta (página de usuários e controle de acesso por papel) e deixar professores, turmas e compartilhamento de baralhos como evolução futura, e essa recomendação foi adotada em 25/10. A resposta, porém, veio genérica: não seguiu o formato pedido, com os fatos confirmados em arquivos e a lista de endpoints. Por isso a decisão final também se apoiou no enunciado e no diagnóstico de 25/10.
- **Evidência no repositório:** `3d1cd16` (implementação do administrador mínimo)
---

#### Etapa 4 — App mobile

- Não utilizado nesta etapa até 01/11/2026; Matheus confirmou pelo estado da pasta `mobile/` que o trabalho realizado até a data foi apenas a inicialização do projeto e a tela estática de login.
---

#### Diagnóstico do projeto e da documentação (prompts de leitura)

- **Quem conduziu:** Breno
- **Ferramenta e data:** GitHub Copilot (Agent, VS Code), com planejamento no Claude. Diagnóstico geral e verificação de versões em 25/10/2026; auditoria dos documentos, levantamento do Git e inspeção do commit `6c6ed78` entre 25/10 e 01/11/2026.
- **Objetivo da tarefa:** descobrir o estado real do código e dos documentos antes de atualizar a documentação (somente leitura, sem alterar arquivos).
- **Prompt utilizado:** os resumos dos prompts estão registrados neste relatório; os textos completos deveriam ficar em `docs/anexo-prompts-ia.md`, mas esse arquivo não existia em 01/11/2026. Por isso, os prompts de auditoria do Git, inspeção do commit `6c6ed78` e levantamento de ambiente não puderam ser reproduzidos literalmente.
- **Análise crítica:** as respostas foram conferidas contra os arquivos. Pontos que exigiram cuidado: a contagem de commits por autor veio inflada por 21 commits de sessões do próprio agente (referências `refs/agents/`), que não são do projeto e foram descartados; o Copilot classificou commits como "frontend" mesmo quando continham só arquivos gerados do Next.js, e por isso a autoria do commit `6c6ed78` foi checada arquivo a arquivo; algumas divergências entre o contrato e o código só ficaram claras ao comparar os controllers com o texto do contrato.
- **Evidência no repositório:** este relatório, `docs/equipe.md` e `docs/visao.md` foram atualizados a partir desse levantamento.
---

### 2.4 Reflexão sobre o uso de IA

A IA acelerou principalmente duas tarefas: revisar o código de cartões e DTOs feito por Matheus, apontando a necessidade de substituir dados em memória por persistência PostgreSQL/Prisma, e transformar um esqueleto manual do frontend em telas mais completas com os componentes do shadcn/ui. No segundo caso, fornecer à IA o layout inicial, os componentes já instalados e um prompt detalhado sobre comportamentos funcionou melhor do que pedir uma tela inteira do zero. Os erros percebidos foram poucos e ficaram mais visíveis na interface: ícones temáticos gerados automaticamente não eram a melhor representação para todos os baralhos. Aprendemos que IA é útil para explorar alternativas, identificar problemas e produzir código inicial, mas não deve substituir a revisão humana. A equipe passou a registrar os prompts, analisar o resultado, corrigir decisões incorretas e validar builds e fluxos antes dos commits.

---

## 3. Diário por etapa

---

### Etapa 0 — Concepção

**Período:** de 29/08/2026 a 03/09/2026 · **Redigido por:** Breno

**O que foi feito:** formação do grupo (20/08), escolha do tema 7 (flashcards com repetição espaçada), criação do repositório a partir do template (30/08) e registro inicial de equipe e relatório (`9f97fb1` e `11ef27c`). Definição inicial das funcionalidades, da divisão de responsabilidades e dos combinados de trabalho (ver `docs/equipe.md`). O Documento de Visão foi entregue com o tema e o repositório definidos e foi preenchido por completo em 01/11/2026.

**Como o tema foi escolhido, e o que foi descartado no caminho:** os dois integrantes sugeriram flashcards e concordaram. Breno já havia tentado estudar com aplicativos de flashcards e não gostou da experiência, o que pesou na escolha. Os outros temas da lista não foram analisados com profundidade.

**Dificuldades:** definir uma divisão de responsabilidades em que os dois integrantes atuassem nos três componentes sem duplicar trabalho. Adotou-se um responsável principal por cliente, com o backend dividido por módulos e as decisões de arquitetura e contrato tomadas em conjunto.

---

### Etapa 1 — Contrato e fundação

**Período:** de 04/09/2026 a 23/09/2026 · **Redigido por:** Breno

**O que foi feito:**

| Frente | O que foi feito | Por quem |
|---|---|---|
| Modelo de dados | Modelagem inicial no `schema.prisma` em 19/09 (Usuario, Baralho, Flashcard, depois chamado Cartao, e Revisao), alinhada ao MVP em 24/09 | Breno |
| Contrato da API | PRD e contrato na versão 1.0 (21 a 23/09) | Breno |
| Projeto do backend | NestJS (CLI 12.0.0) e Prisma 7 com adaptador `pg` (07 a 12/09); módulo de cartões e DTOs de criação, atualização e consulta (20 a 22/09) | Breno (projeto e Prisma); Matheus (módulo de cartões e DTOs) |
| Projeto do cliente web | Next.js criado em 12/09 | Breno |

**Decisões técnicas:**

| Decisão | Alternativas consideradas | Justificativa | Risco ou consequência |
|---|---|---|---|
| Registrar cada avaliação como uma entidade `Revisao` (histórico) | Só atualizar os campos do cartão | Permite calcular estatísticas (taxa de acerto, sequência de dias, atividade) e preservar o histórico | A tabela cresce com o uso |

**Dificuldades:** o commit pelo WebStorm falhou (07/09). Arquivos gerados do Next.js (`.next`) entraram no controle de versão por engano e só foram removidos em 18/10 (`9a41bea`).

**O que ficou para a próxima etapa:** conectar o backend ao PostgreSQL, implementar os recursos do MVP e a autenticação JWT.

---

### Etapa 2 — Backend · Checkpoint 1

**Período:** de 24/09/2026 a 24/10/2026 (Checkpoint 1 entregue em 24/09; a autenticação JWT, não cobrada naquela entrega, e demais recursos foram concluídos depois, em paralelo ao cliente web) · **Redigido por:** Breno

**O que foi implementado:**

- **24/09:** o schema Prisma foi alinhado aos recursos do MVP e o `PrismaService` foi conectado ao NestJS. Baralhos, cartões, fila de estudo e revisões passaram a usar o PostgreSQL em vez de arrays locais. O registro da revisão passou a ser feito em transação. A migration foi aplicada e a criação de baralho, cartão e revisão foi testada pela API.
- **10/10 (Matheus):** registro e login persistidos em banco, com validação por DTOs, tratamento de e-mail duplicado, senhas com `bcryptjs` e emissão do `accessToken` com `@nestjs/jwt`. O login devolve o mesmo erro para e-mail inexistente e senha errada, para impedir a descoberta de e-mails cadastrados. Em seguida, os guards de autenticação e autorização.
- **11/10:** autenticação JWT nos módulos de baralhos, cartões e estatísticas, ligando os dados ao usuário logado. Contagem de cartões e tratamento de nomes duplicados de baralho. Estatísticas calculadas a partir do banco, em vez de valores fixos.
- **18/10:** fila de estudo ampliada para buscar cartões pendentes, todos os cartões de um baralho ou um cartão específico.
- **23/10:** revisão individual de cartões e endpoints de atualização de perfil e de senha.
- **24/10:** estatísticas de atividade (7, 30 ou 90 dias, incluindo dias sem atividade); a alteração de senha passou a exigir a senha atual; correção das regras de revisão para permitir rever todos os cartões e rever no mesmo dia os marcados como errados.
- **25/10:** perfil administrador: decorator e guard de papéis corrigidos, `GET /usuarios` paginado e restrito ao administrador, registro sempre como estudante e seed do administrador.
**Decisões técnicas:**

| Decisão | Alternativas consideradas | Justificativa | Risco ou consequência |
|---|---|---|---|
| Usuário técnico temporário no lugar da autenticação (24/09) | Implementar o JWT antes dos recursos do MVP | O checkpoint 1 não cobrava o JWT, e o usuário técnico permitiu avançar nos recursos | O cliente web só passou a usar sessão real depois que o JWT ficou pronto (10 a 11/10) |
| Mesmo erro de login para e-mail inexistente e senha errada | Mensagens distintas para cada caso | Não revelar quais e-mails têm conta | Menos detalhe para o usuário em caso de erro |
| Intervalos fixos de revisão por nota (errei 0, difícil 1, bom 3 e fácil 7 dias) | Algoritmo SM-2 completo, como descrito no PRD | O cartão errado volta no mesmo dia (0 dia), para o estudante fixar o erro na hora; também é mais simples para o MVP | A facilidade do cartão não é atualizada, e o PRD precisa ser alinhado ao comportamento real |
| Perfil administrador mínimo (25/10) | Professores e turmas, com baralhos compartilhados; administrador com gestão completa de usuários; não ter administrador | O enunciado exige autorização por perfil, a análise feita com o Copilot recomendou uma área administrativa enxuta (página de usuários e acesso por papel), e a versão mínima não altera o contrato nem os outros módulos | O administrador só lista usuários |
| Turmas fora do escopo (25/10) | Integrar turmas, com baralhos compartilhados e cópia de baralhos entre usuários | Não faz parte do tema e exigiria mudar contrato, API e telas | A funcionalidade colaborativa fica para uma evolução futura; o trabalho está guardado na branch `backend` |

**Mudanças no contrato da API:**

| Endpoint | O que mudou | Quem foi avisado | Contrato atualizado? |
|---|---|---|---|
| `GET /estatisticas`, `GET /estatisticas/baralhos/:baralhoId` | `GET /estatisticas/resumo` passou a `GET /estatisticas`, e foi acrescentado `GET /estatisticas/baralhos/:baralhoId` (11/10) | Matheus (aviso informal) | Sim (`a56aedb`) |
| `GET /baralhos/:id/estudo` | Parâmetros `escopo` (`pendentes` ou `todos`) e `cartaoId`; o limite fixo foi removido (18/10) | Matheus (aviso informal) | Sim (`ae5e58f`) |
| `GET /auth/perfil`, `PATCH /auth/perfil`, `PATCH /auth/senha` | `GET /auth/me` passou a `GET /auth/perfil`; acrescentados `PATCH /auth/perfil` e `PATCH /auth/senha` (24/10) | Matheus (aviso informal) | Sim (`471b7d7`, versão 1.2) |
| `POST /cartoes/:id/revisoes` | A resposta passou a devolver o cartão atualizado (24/10) | Matheus (aviso informal) | Sim (`471b7d7`) |
| `GET /estatisticas/atividade` | Novo endpoint, com períodos de 7, 30 ou 90 dias (24/10) | Matheus (aviso informal) | Sim (`471b7d7`) |
| `GET /usuarios` | Implementado em 25/10; já estava descrito no contrato | Matheus (aviso informal) | Sem mudança necessária |

**Dificuldades:** conflito de porta e volume do PostgreSQL no Docker; falha da seed em 25/10 (ver 1.2). As divergências entre contrato e código (respostas de autenticação, paginação das listagens e rotas extras) foram corrigidas em 02/11/2026 nos documentos, conforme o estado real da API.

**O que ficou para a próxima etapa:** integração do cliente web com a sessão real (feita em 11/10) e, depois, o app mobile.

---

### Etapa 3 — Cliente web · Checkpoint 2

**Período:** de 12/09/2026 a 25/10/2026 (Checkpoint 2 entregue em 22/10; ajustes até 25/10) · **Redigido por:** Breno

**O que foi implementado:**

- **12/09:** projeto Next.js criado.
- **04/10 a 10/10:** instalação dos blocos do shadcn/ui (dashboard-01 e login-03) por Breno. O commit `6c6ed78` (Matheus, 10/10) incluiu no repositório o layout do dashboard e as telas de login e cadastro, já integradas à API de autenticação. As telas de baralhos, busca, estatísticas e turmas tinham conteúdo de demonstração.
- **11/10:** integração do cliente com a API: validação e mensagens de erro nas telas de login e cadastro; sessão com o token em cookie `httpOnly`, com rotas do Next.js intermediando as chamadas ao backend; perfil do usuário no menu e botão de sair; listagem, busca e criação de baralhos com dados reais; cartões (adicionar, editar e excluir); sessão de estudo com avaliação (errei, difícil, bom e fácil); dashboard e estatísticas com dados da API. A tela de turmas continuou só como demonstração.
- **18/10:** página própria de revisão (progresso, confirmação ao sair e resumo), e baralhos e detalhes com lista, ordenação e busca.
- **23/10:** baralhos em tabela (nome, cartões, pendentes, data de modificação e ações, com ordenação, paginação e menu para renomear e excluir); botão de revisar todo o baralho ou só os pendentes; diálogo de configurações (nome, e-mail, senha e tema claro, escuro ou do sistema); tratamento de token e sessão expirada no proxy; botão "Revisar erros".
- **24/10:** páginas autenticadas reunidas em um grupo de rotas com layout, barra lateral e provedores compartilhados, sem alterar as URLs; ajustes de hidratação e de espaçamento; links com o componente `Link` do Next.js.
- **25/10:** página `/admin/usuarios`, com o link "Usuários" visível só para o administrador.
**Decisões técnicas:**

| Decisão | Alternativas consideradas | Justificativa | Risco ou consequência |
|---|---|---|---|
| Token em cookie `httpOnly`, com rotas do Next.js intermediando as chamadas à API | Guardar o token no próprio cliente, como na primeira versão do login (`6c6ed78`) | O JavaScript da página não consegue ler o cookie, o que reduz o risco de roubo do token | Mais um nível (as rotas do Next.js) entre o cliente e a API |
| Grupo de rotas `(authenticated)` com layout compartilhado (24/10) | Repetir o layout em cada página | Menos duplicação e provedores num só lugar | Nenhum nas URLs, que não mudaram |

**Mudanças no contrato da API:** as mesmas listadas na Etapa 2: `GET /estatisticas/atividade`, `PATCH /auth/perfil` e `PATCH /auth/senha`, todas pedidas pelo cliente web.

**Dificuldades:** o cliente foi construído antes de a autenticação existir, com dados de demonstração, e depois reconectado à API real; erros de hidratação e de propagação de eventos nos menus de ações das tabelas; erro de `GroupLabel` fora de um grupo no menu (23/10); arquivos de build do Next.js versionados por engano. Pendências conhecidas: três erros de lint no frontend e um teste e2e do backend que ainda espera a rota `GET /`.

**O que ficou para a próxima etapa:** o app mobile, a integração da branch `back_admin` na `main`, e a atualização do PRD e do contrato.

---

### Etapa 4 — App mobile · Checkpoint 3

**Período:** de 26/10/2026 a 01/11/2026 (etapa iniciada, sem integração concluída) · **Redigido por:** Matheus

**O que foi implementado:** projeto Flutter inicializado em 26/10/2026 por Matheus (`113cd46`), na pasta `mobile/` da branch `back_admin`. Até 01/11/2026 existe uma tela estática de login inspirada na identidade visual do cliente web, com campos de e-mail e senha e o botão "Entrar". O projeto usa o SDK do Dart definido em `mobile/pubspec.yaml`; não possui pacote HTTP, não envia credenciais à API, não possui navegação autenticada nem telas de baralhos, cartões ou revisão.

**Decisões técnicas:**

| Decisão | Alternativas consideradas | Justificativa | Risco ou consequência |
|---|---|---|---|
| Autenticação simplificada no app (login real contra a API, token em memória) | Completa (token persistido, expiração e logout) ou simulada | Prazo e equipe de 2 pessoas, conforme o PRD | O app não trata expiração nem refresh; a API continua protegida |
| Recorte do app: estudar um baralho e criar cartão rápido | Mais telas e casos de uso | O enunciado pede de 1 a 3 casos de uso completos, ao menos um alterando dados | O app cobre só o essencial |

**Mudanças no contrato da API:** nenhuma. O contrato não mudou nesta etapa porque o mobile ainda não implementa chamadas HTTP nem novo comportamento da API.

**Dificuldades:** iniciar o ambiente Flutter/Dart, estruturar o projeto e confirmar o ambiente de execução em cada máquina. Além disso, a tela foi implementada sem integração, portanto não foi possível validar autenticação nem consumo real dos endpoints.

**O que ficou para a próxima etapa:** conectar o app à API, definir a URL de base de acordo com emulador ou dispositivo físico, implementar login real, manter o token em memória, apresentar baralhos e implementar pelo menos um caso de uso completo que altere dados, como criar um cartão ou concluir uma revisão.

---

### Etapa 5 — Integração e fechamento

**Período:** não concluído até 02/11/2026 · **Redigido por:** Breno e Matheus

**O que foi ajustado para os três componentes conversarem:** até a data do relatório, não houve integração concluída dos três componentes. O backend continua acessível em `http://localhost:3000` e o cliente web usa `frontend/app/api/backend/[...path]/route.ts`; o app mobile não possui código HTTP nem URL configurada.

**Inconsistências encontradas entre os clientes, e como foram resolvidas:** não foram encontrados erros de integração entre mobile e backend porque essa integração ainda não existe. Web e backend têm divergências pontuais já documentadas no diário, principalmente em formatos de respostas, paginação e rotas que ainda precisam ser alinhadas ao contrato.

**Dificuldades:** conciliar prazos e responsabilidades entre os integrantes, confirmar ambientes individuais de Flutter e completar o app além da tela inicial. Também faltava validar backend, proxy web e mobile com endereços de rede adequados para emulador ou dispositivo físico.

---

## 4. Arquitetura — decisões e evolução

### 4.1 Estrutura final

| Componente | Desvio em relação ao README | Motivo |
|---|---|---|
| Web | A pasta se chama `frontend/` em vez de `web/` | Nome dado na criação do projeto com `create-next-app` (12/09) |
| Backend e web | NestJS 12 e Next.js 16 em vez de NestJS 11 e Next.js 15 | Versões atuais na criação dos projetos; App Router, Prisma 7 e adaptador `pg` mantidos |
| Backend | `prisma.config.ts` em vez de `prisma7.config.ts` | Nome esperado pelo Prisma 7 |

### 4.2 Fronteira entre backend e clientes

A regra de negócio fica no backend: o cliente envia apenas a nota (errei, difícil, bom ou fácil), e o cálculo do próximo intervalo e da próxima revisão é feito no serviço de cartões e gravado em transação, junto com o registro da revisão. As estatísticas são calculadas pela API a partir do banco. O isolamento dos dados por usuário é feito no backend a partir do usuário do token. Para o administrador, a interface esconde o link, mas a recusa de acesso (403) vem da API. Não identificamos uma decisão de negócio que precisasse ser reaplicada fora do backend; manter a autorização na API foi importante mesmo quando a interface também esconde a área.

### 4.3 Nível de autenticação adotado no app mobile

| Aspecto | Registro |
|---|---|
| Nível adotado | Simplificada (declarado no PRD) |
| Como o app obtém o token | Ainda não implementado. A tela atual não envia credenciais nem recebe `accessToken` da API |
| O que deixou de ser tratado (expiração, refresh, logout) | Persistência de sessão, refresh, detecção de expiração, renovação automática e logout não foram implementados |
| Rotas da API afetadas pela escolha | Nenhuma |

### 4.4 O que os dois clientes compartilham e o que não

Web e mobile são dois clientes da mesma API REST, mas usam mecanismos de sessão diferentes na implementação planejada. O web guarda o token em cookie `httpOnly` e envia chamadas por rotas intermediárias do Next.js; o mobile terá, conforme o nível simplificado do PRD, o token em memória. Ambos deverão respeitar o mesmo contrato sem acesso direto ao banco ou duplicação das regras de revisão. Até 01/11/2026, essa equivalência só existia entre web e backend; o mobile ainda não a implementou.

---

## 5. Resposta ao RFC _(seção condicional)_

**Houve RFC neste projeto?** ( ) Sim — preencher abaixo · (x) Não — seção não aplicável. Até 01/11/2026 nenhum RFC foi publicado pelo professor.

---

## 6. Reflexão final

Fechamento parcial em 02/11/2026; a Etapa 5 ainda não havia sido concluída.

### 6.1 O que funcionou bem

O backend, a autenticação, a persistência, as páginas principais do web e a documentação avançaram com dados reais. A API concentrou regras e dados, enquanto o cliente web passou a validar sessão, estudar cartões, criar conteúdo e mostrar estatísticas. O registro de prompts e decisões também começou a trazer rastreabilidade ao uso de IA.

### 6.2 O que faria diferente

O anexo de prompts seria criado desde o início da Etapa 0, com os ambientes de Breno e Matheus registrados por etapa. A integração do mobile seria iniciada antes, em vez de concentrada no fechamento. Também seriam usadas revisões por Pull Request de forma mais consistente, não apenas integração direta em algumas branches.

### 6.3 Principais aprendizados

| Componente | Aprendizado |
|---|---|
| Backend | NestJS, Prisma 7, guards, DTOs, transações e isolamento por usuário exigem testar não só o retorno feliz, mas também autorização, propriedade dos dados e divergências do contrato |
| Web | App Router, proxy HTTP, cookie `httpOnly`, hidratação e estados de sessão exigem cuidados além da implementação visual |
| Mobile | Inicializar o projeto é apenas o começo: ambiente, endereço de rede, HTTP, estado e navegação precisam ser planejados antes da tela final |
| Integração e processo | Contrato, decisões, versões e commits precisam ser verificados contra o código; IA acelera, mas não substitui revisão humana |

### 6.4 Autoavaliação

**Nota:** ___/10

**Justificativa:**

---

## 7. Vídeo de apresentação

| Campo | Valor |
|---|---|
| **Link** | |
| **Duração** | |
| **Quem fala em cada parte** | |

---

## 8. Histórico de revisões

| Versão | Data | Descrição | Quem atualizou |
|---|---|---|---|
| 1.0 | 30/08/2026 | Criação do documento | Breno |
| 1.1 | 01/11/2026 | Diário das etapas 0 a 3, arquitetura, ambiente e uso de IA até a data | Breno |
| 1. | | Versão final | |
