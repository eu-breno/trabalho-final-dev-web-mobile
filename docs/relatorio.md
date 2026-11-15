# Relatório Técnico de Desenvolvimento

---

## Identificação

| Campo | Valor |
|---|---|
| **Nome do projeto** | Memora |
| **Grupo** | Grupo H |
| **Integrantes** | Breno Olliari e Matheus dos Santos Savegnagi |
| **Repositório** | `https://github.com/eu-breno/trabalho-final-dev-web-mobile` |
| **Última atualização** | 15/11/2026 |
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
| Flutter SDK / Dart | Flutter 3.47.8 / Dart 3.13.7, verificados no ambiente mobile em 09/11/2026 | Matheus |
| PostgreSQL | 18 (imagem Docker, usada por Breno) | Breno; Matheus: não registrado |
| Docker | 29.8.0 na máquina de Breno | Breno; Matheus: não registrado |
| SDK mínimo do app | Dart `^3.13.7` em `mobile/pubspec.yaml` (mínimo 3.13.7; não é a versão mínima do Android) | Mobile |
| Emulador ou dispositivo usado no mobile | Nenhum Android/iOS detectado ou validado; `flutter devices` encontrou Windows, Chrome e Edge | Mobile |
| Sistema operacional | Windows 10 Pro (10.0.19045.7807), observado no ambiente mobile em 09/11/2026 | Matheus |
| Editor ou IDE | VS Code | Matheus |

**Como o banco foi provisionado:** (x) Docker Compose · ( ) PostgreSQL instalado na máquina · ( ) serviço hospedado

**Comandos do mobile:** executar a partir de `mobile/`: `flutter pub get`, `flutter run` (emulador Android padrão) ou `flutter run --dart-define=API_BASE_URL=http://<IP-DA-MAQUINA>:3000` (dispositivo físico), `flutter test` e `dart analyze`. Nesta atualização, `flutter test` passou (11 testes) e `dart analyze` não encontrou problemas; `flutter analyze` foi tentado, mas o servidor de análise Dart encerrou com erro interno. Nenhum desses testes foi executado em aparelho nem contra uma API real.

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

### 1.3 Endereços de rede configurados e usados entre os componentes

| Origem | Endereço configurado ou usado | Observação |
|---|---|---|
| Web (navegador) | `http://localhost:3000` (variável `NEXT_PUBLIC_API_URL`, lida em `frontend/lib/backend-url.ts`) | As chamadas passam pelas rotas do Next.js, que repassam ao backend |
| Mobile (emulador Android) | `http://10.0.2.2:3000` por padrão | Configurado em `mobile/lib/app_mobile/api_config.dart`; `10.0.2.2` encaminha ao computador host do emulador Android. Não há evidência de execução nesse emulador |
| Mobile (iOS Simulator, Windows, web e demais destinos) | `http://localhost:3000` por padrão | É o fallback do app; `localhost` aponta para a máquina/dispositivo que executa o cliente |
| Mobile (dispositivo físico) | `http://<IP-LOCAL-DA-MAQUINA>:3000` via `API_BASE_URL` | O IP precisa ser obtido na máquina do backend (por exemplo, `ipconfig` no Windows) e ambos precisam estar na mesma rede; nenhum IP/dispositivo de teste foi registrado |

O app também aceita uma URL completa com `--dart-define=API_BASE_URL=...`; a URL usada em execução real não foi comprovada. CORS não é configurado/tratado no cliente Flutter nativo e não foi testado; é uma política do navegador, relevante para Flutter Web.

---

## 2. Uso de Inteligência Artificial

### 2.1 Ferramentas utilizadas

| Ferramenta | Versão / Plano | Quem usou | Em que componente |
|---|---|---|---|
| GitHub Copilot (Chat, modo Agent, no VS Code) | Plano gratuito | Breno | Backend, web e documentação |
| Claude (claude.ai) | Plano gratuito | Breno | Decisões de projeto, diagnóstico, elaboração de prompts para o Copilot (inclusive o do visual do frontend) e revisão da documentação |
| GitHub Copilot (VS Code) | Versão/plano não registrados | Matheus | App mobile: apoio à criação e revisão de telas e fluxos |

### 2.2 Atenção específica desta stack

| Situação | Ocorreu? | Onde e como foi corrigido |
|---|---|---|
| Código gerado com Next.js Pages Router (`getServerSideProps`, `pages/api/`) | Não | Verificado em 25/10: o frontend usa App Router e não há pasta `pages/` nem `getServerSideProps` |
| Prisma sem o adaptador `@prisma/adapter-pg`, ou importando de `@prisma/client` em vez do caminho gerado | Não | A seed gerada usou `PrismaPg` e o cliente gerado, como pedido no prompt |
| Decorators ou módulos de versão antiga do NestJS | Não identificado | |
| Pacotes Flutter descontinuados ou incompatíveis com Flutter 3 | Não identificado pelo `dart analyze`; não foi feita auditoria de compatibilidade completa | `flutter test` e `dart analyze` passaram; testes contra dispositivos/backend continuam pendentes |
| Outro | Sim | O comando de execução da seed sugerido pela IA não funcionava no ambiente (ver 1.2); foi trocado por `tsx` |

### 2.3 Evidências de uso

Até 24/10/2026 os prompts não foram guardados de forma sistemática. Os usos desse período estão reconstruídos de memória e aparecem assim identificados. Alguns prompts foram recuperados de anotações; o uso mobile permanece como resumo, pois o texto exato não foi registrado. Os registros encontrados estão em [docs/anexo-prompts-ia.md](anexo-prompts-ia.md), com um [índice cronológico](prompts/README.md). Os arquivos separados de cada etapa que deveriam compor `docs/prompts/` não estavam disponíveis neste checkout.

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
- **Análise crítica:** a resposta do Copilot foi considerada como apoio e veio genérica: não seguiu o formato pedido, com fatos confirmados em arquivos e lista de endpoints. Breno definiu o recorte administrativo com base nos requisitos, no contrato e no diagnóstico do projeto; a discussão sobre professores e compartilhamento continuou fora do escopo atual.
- **Evidência no repositório:** `3d1cd16` (implementação do administrador mínimo)
---

#### Etapa 4 — App mobile

- Matheus confirmou a autoria das funcionalidades mobile presentes no worktree; o estado, os testes e o histórico estão descritos na seção Etapa 4 deste relatório. O commit das funcionalidades estava previsto para 09/11/2026 e ainda não constava no histórico quando esta revisão foi feita.
---

#### Diagnóstico do projeto e da documentação (prompts de leitura)

- **Quem conduziu:** Breno
- **Ferramenta e data:** GitHub Copilot (Agent, VS Code), com planejamento no Claude. Diagnóstico geral e verificação de versões em 25/10/2026; auditoria dos documentos, levantamento do Git e inspeção do commit `6c6ed78` entre 25/10 e 01/11/2026.
- **Objetivo da tarefa:** descobrir o estado real do código e dos documentos antes de atualizar a documentação (somente leitura, sem alterar arquivos).
- **Prompt utilizado:** os resumos estão registrados neste relatório. Na revisão de 01/11/2026, o anexo ainda não continha esses registros; por isso, os prompts de auditoria do Git, inspeção do commit `6c6ed78` e levantamento do ambiente não podem ser reproduzidos literalmente.
- **Análise crítica:** as respostas foram conferidas contra os arquivos. Pontos que exigiram cuidado: a contagem de commits por autor veio inflada por 21 commits de sessões do próprio agente (referências `refs/agents/`), que não são do projeto e foram descartados; o Copilot classificou commits como "frontend" mesmo quando continham só arquivos gerados do Next.js, e por isso a autoria do commit `6c6ed78` foi checada arquivo a arquivo; algumas divergências entre o contrato e o código só ficaram claras ao comparar os controllers com o texto do contrato.
- **Evidência no repositório:** este relatório, `docs/equipe.md` e `docs/visao.md` foram atualizados a partir desse levantamento.
---

### 2.4 Reflexão sobre o uso de IA

Breno conduziu o trabalho etapa por etapa: definiu escopo, requisitos, arquitetura e decisões, leu os relatórios das etapas e validou os resultados com build, lint, testes automatizados do backend e validação manual das telas. Claude apoiou o planejamento, o refinamento dos prompts e a análise de segurança, contrato e casos de borda; GitHub Copilot apoiou a implementação do contrato, backend, frontend, ajustes e documentação. As ferramentas reduziram o esforço de digitação e implementação. A responsabilidade pelas decisões, pela revisão do trabalho e pelo resultado final permaneceu com o autor. Os testes mobile usam respostas HTTP simuladas e não substituem a validação contra backend real.

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
| Perfil administrador mínimo (25/10) | Professores e compartilhamento de conteúdo, com gestão completa de usuários; não ter administrador | O enunciado exige autorização por perfil. Após analisar as alternativas com apoio de IA, Breno definiu um perfil administrador mínimo para manter o escopo viável; a decisão inicial foi ampliada posteriormente no contrato v1.4 | Naquele momento, o administrador só listava usuários; a área foi ampliada posteriormente |
| Colaboração fora do escopo (25/10) | Integrar compartilhamento de baralhos e funcionalidades colaborativas entre usuários | Não faz parte do tema e exigiria mudar contrato, API e telas | A funcionalidade colaborativa fica para uma evolução futura |

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
- **04/10 a 10/10:** instalação dos blocos do shadcn/ui (dashboard-01 e login-03) por Breno. O commit `6c6ed78` (Matheus, 10/10) incluiu no repositório o layout do dashboard e as telas de login e cadastro, já integradas à API de autenticação. As telas de baralhos, busca e estatísticas tinham conteúdo de demonstração.
- **11/10:** integração do cliente com a API: validação e mensagens de erro nas telas de login e cadastro; sessão com o token em cookie `httpOnly`, com rotas do Next.js intermediando as chamadas ao backend; perfil do usuário no menu e botão de sair; listagem, busca e criação de baralhos com dados reais; cartões (adicionar, editar e excluir); sessão de estudo com avaliação (errei, difícil, bom e fácil); dashboard e estatísticas com dados da API.
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

**Período:** iniciada em 26/10/2026; estado conferido em 09/11/2026 · **Responsável:** Matheus

**O que foi implementado:** Matheus inicializou o projeto Flutter em `113cd46` (26/10, branch `back_admin`) e implementou login e cadastro, restauração de sessão, dashboard, baralhos e cartões, estudo, estatísticas e configurações de conta. O commit dessas funcionalidades estava previsto para 09/11/2026; o histórico ainda não continha esse commit no momento da conferência.

**Ambiente e execução:** Flutter 3.47.8, Dart 3.13.7 e Windows 10 Pro 10.0.19045.7807 foram verificados no ambiente de desenvolvimento mobile; o VS Code é o editor usado. O `pubspec.yaml` restringe o Dart a `^3.13.7`. `flutter devices` não encontrou Android/iOS, apenas Windows, Chrome e Edge; portanto, não há modelo de aparelho nem versão Android/iOS efetivamente usada a registrar. Os comandos são `flutter pub get`, `flutter run`, `flutter run --dart-define=API_BASE_URL=http://<IP-DA-MAQUINA>:3000` para dispositivo físico, `flutter test` e `dart analyze`. Os 11 testes widget/HTTP mock passaram; eles não validam conectividade com o backend real. `dart analyze` não encontrou problemas; `flutter analyze` encerrou com erro interno do servidor de análise.

**Telas e navegação:** login, cadastro, dashboard, lista/gestão de baralhos, detalhe/lista de cartões, estudo, estatísticas e diálogo de configurações. A navegação usa rotas Flutter, menu lateral e páginas de detalhe. O cadastro volta ao login após o sucesso; o login abre o dashboard. Há atualização/reload e botão "Tentar novamente" em telas de dados.

**Sessão e autenticação:** o app envia `POST /auth/login`, lê `accessToken` e persiste-o em `SharedPreferences` (`memora.accessToken`). Ao iniciar, tenta restaurar a sessão e abre login ou dashboard; portanto, fechar e reabrir mantém a sessão salva. O logout remove a chave e limpa a pilha de navegação. As chamadas protegidas enviam o token da sessão no cabeçalho `Authorization` com esquema Bearer. Não há renovação/refresh nem tratamento dedicado de token expirado; a autenticação no backend real ainda precisa ser validada.

**Funcionalidades e endpoints no código:** login `POST /auth/login`; cadastro `POST /auth/registro`; perfil `GET/PATCH /auth/perfil`; senha `PATCH /auth/senha`; dashboard `GET /estatisticas?periodo=geral`; estatísticas `GET /estatisticas?periodo=semana`, `GET /estatisticas/baralhos/:id` e `GET /estatisticas/atividade?dias=7|30|90`; baralhos `GET/POST /baralhos`, `GET/PATCH/DELETE /baralhos/:id`; cartões `GET/POST /baralhos/:id/cartoes`, `PATCH/DELETE /cartoes/:id`; fila `GET /baralhos/estudo?escopo=...` ou `GET /baralhos/:id/estudo?escopo=...`; revisão `POST /cartoes/:id/revisoes`. Os formulários permitem criar cartão dentro do detalhe do baralho; não foi identificada uma criação rápida fora desse contexto. O estudo envia uma das notas `errei`, `dificil`, `bom`, `facil`, avança a fila localmente após resposta de sucesso e tem opção de rever cartões errados. Não há confirmação de que a próxima revisão foi atualizada no backend real nem de que a fila seja recarregada após cada revisão.

| Requisição / fluxo | Resultado verificado |
|---|---|
| `POST /auth/login` e leitura do token | Teste automatizado com HTTP simulado passou; backend real não testado |
| `POST /auth/registro` | Teste automatizado com HTTP simulado passou; backend real não testado |
| `GET /auth/perfil`, `GET /estatisticas?periodo=geral`, `GET /baralhos` | Teste de carregamento do dashboard com HTTP simulado passou |
| `PATCH /auth/perfil` e `PATCH /auth/senha` | Testes de configurações com HTTP simulado passaram |
| `POST /baralhos` e `POST /baralhos/:id/cartoes` | Teste de criação com HTTP simulado passou |
| Fila de estudo e `POST /cartoes/:id/revisoes` | Teste de carregamento de fila e envio de avaliações com HTTP simulado passou; resposta não comprova persistência real ou próxima revisão no backend |
| `GET/PATCH/DELETE /baralhos/:id`; `GET /baralhos/:id/cartoes`; `PATCH/DELETE /cartoes/:id` | Implementados no código; teste individual e chamada contra backend real não comprovados |
| Estatísticas semanais, por baralho e atividade | Implementadas no código; teste individual e chamada contra backend real não comprovados |
| Sem conexão, token expirado, usuário ou recurso inexistente | Não há resultado de teste registrado; a UI apresenta erros recebidos, mas sem validação real |

**Resultados e tratamento de erros:** os testes com HTTP simulado cobrem login/token, cadastro, dados do dashboard, criação de baralho/cartão e envio de avaliações; também cobrem configurações/sessão. Não cobrem chamadas reais. As chamadas HTTP aplicam timeout de 15 segundos; a UI mostra mensagens para timeout, falha de conexão e erros HTTP devolvidos pela API, e telas de carregamento/retentativa. Token expirado, usuário/recurso inexistente e modo sem conexão não foram validados contra backend; erros retornados são exibidos, mas não há logout automático em 401/403. CORS não se aplica ao cliente nativo e não foi testado.

**Decisões técnicas:**

| Decisão | Alternativas consideradas | Justificativa | Risco ou consequência |
|---|---|---|---|
| Persistir o token localmente e oferecer logout | Manter token só em memória | Implementação em `SessionStore` com `SharedPreferences` | A sessão continua ao fechar o app; não há refresh nem tratamento dedicado de expiração |
| Organizar o app em telas de autenticação, dashboard, baralhos, estudo e estatísticas | Manter apenas a tela inicial estática | Implementação de Matheus para cobrir os fluxos principais do cliente mobile | Navegação funcional, sem integração adicional fora do escopo atual |

**Mudanças no contrato da API:** nenhuma alteração de contrato foi registrada para viabilizar o mobile; o app consome rotas já existentes no backend.

**Dificuldades e pendências:** não há evidência de emulador/dispositivo Android ou iOS configurado nem de teste contra o servidor real. Também não foram comprovados tratamento de token expirado, uso offline, CORS ou resultados para usuário/recurso inexistente. É necessário executar os casos contra backend e registrar dispositivo, URL e resultados.

**Casos de uso validados:** os testes automatizados com respostas HTTP simuladas cobrem envio de credenciais e leitura do token, cadastro, dashboard, criação de baralho/cartão e avaliação de cartão. Não comprovam login, baralho, revisão ou persistência em backend real. Sem conexão, token expirado e usuário/recurso inexistente não têm teste de integração registrado. O POST de revisão é seguido pelo avanço da fila no estado local; atualização da próxima revisão no backend e reconsulta da fila precisam de validação real.

---

### Etapa 5 — Integração e fechamento

**Período:** não concluído em 09/11/2026 · **Redigido por:** pendente

**Integração web, mobile e backend:** não preencher como integração concluída. Há código mobile apontando para a API e código web integrado ao backend, mas não há comprovação de fluxo real compartilhado entre os três. Não há evidência dos testes de criação web→mobile, mobile→web, login nos dois clientes, conta/dados compartilhados, logout ou testes simultâneos dos três componentes.

**Condição para concluir:** validar o envio do token, rodar o backend, web e mobile juntos, validar os casos de uso cruzados solicitados e registrar os resultados, conflitos e resolução. Até lá, a Etapa 5 permanece pendente; não há resultado final de integração a declarar.

**Histórico e revisão do mobile:** o commit mobile de Matheus identificado no histórico é `113cd46`; a branch de trabalho é `back_admin`. Não foi identificado PR mobile, revisão de Breno ou merge das funcionalidades recentes. O commit das alterações de Matheus estava previsto para 09/11/2026, mas ainda não aparecia no histórico no momento desta conferência.

---

## 4. Arquitetura — decisões e evolução

### 4.1 Estrutura final

| Componente | Estrutura |
|---|---|
| Backend | `backend/src/` por módulos NestJS; `backend/prisma/` para schema, migrations e seed |
| Web | `frontend/app/` (App Router), `frontend/components/` e `frontend/lib/` |
| Mobile | `mobile/lib/app_mobile/` |

### 4.2 Fronteira entre backend e clientes

A regra de negócio fica no backend: o cliente envia apenas a nota (errei, difícil, bom ou fácil), e o cálculo do próximo intervalo e da próxima revisão é feito no serviço de cartões e gravado em transação, junto com o registro da revisão. As estatísticas são calculadas pela API a partir do banco. O isolamento dos dados por usuário é feito no backend a partir do usuário do token. Para o administrador, a interface esconde o link, mas a recusa de acesso (403) vem da API. Não identificamos uma decisão de negócio que precisasse ser reaplicada fora do backend; manter a autorização na API foi importante mesmo quando a interface também esconde a área.

### 4.3 Nível de autenticação adotado no app mobile

| Aspecto | Registro |
|---|---|
| Nível adotado | Persistida |
| Como o app obtém e armazena o token | `POST /auth/login` lê `accessToken`; `SessionStore` persiste em `SharedPreferences` (`memora.accessToken`) |
| Restauração e logout | Sessão lida ao iniciar; logout remove o token e redireciona ao login |
| Limitações | Sem refresh ou detecção/logout automático em expiração. O código envia o token no cabeçalho Authorization; autenticação ainda sem validação contra backend real |
| Rotas da API afetadas pela escolha | Login e rotas autenticadas de perfil, baralhos, cartões, estudo e estatísticas |

### 4.4 O que os dois clientes compartilham e o que não

Web e mobile são clientes da mesma API REST. O web guarda o token em cookie `httpOnly` e encaminha chamadas por rotas do Next.js; o mobile persiste o token em `SharedPreferences` e envia o token no cabeçalho Authorization com esquema Bearer. O código contém chamadas às rotas existentes, mas não há teste contra o backend real. A equivalência dos clientes e o compartilhamento real de dados continuam sem validação integrada.

---

## 5. Resposta ao RFC _(seção condicional)_

**Houve RFC neste projeto?** ( ) Sim — preencher abaixo · (x) Não — seção não aplicável. Até 01/11/2026 nenhum RFC foi publicado pelo professor.

---

## 6. Reflexão final

Fechamento parcial atualizado em 09/11/2026; a Etapa 5 continua pendente.

### 6.1 O que funcionou bem

O backend, a autenticação, a persistência, as páginas principais do web e a documentação avançaram com dados reais. A API concentrou regras e dados, enquanto o cliente web passou a validar sessão, estudar cartões, criar conteúdo e mostrar estatísticas. O registro de prompts e decisões também começou a trazer rastreabilidade ao uso de IA.

### 6.2 O que faria diferente

O anexo de prompts seria criado desde o início da Etapa 0, com os ambientes de Breno e Matheus registrados por etapa. A integração do mobile seria iniciada antes, em vez de concentrada no fechamento. Também seriam usadas revisões por Pull Request de forma mais consistente, não apenas integração direta em algumas branches.

### 6.3 Principais aprendizados

| Componente | Aprendizado |
|---|---|
| Backend | NestJS, Prisma 7, guards, DTOs, transações e isolamento por usuário exigem testar não só o retorno feliz, mas também autorização, propriedade dos dados e divergências do contrato |
| Web | App Router, proxy HTTP, cookie `httpOnly`, hidratação e estados de sessão exigem cuidados além da implementação visual |
| Mobile | Além de telas e estado local, a integração só é comprovada quando o token correto chega ao backend e os fluxos são executados com API e clientes reais |
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
| 1.2 | 09/11/2026 | Estado do mobile, ambiente observado, testes e pendências da integração | Matheus |
| 1.3 | 15/11/2026 | Uso de IA, administração, alterações web e documentação alinhados ao estado atual; integração mobile permanece pendente | Breno |
