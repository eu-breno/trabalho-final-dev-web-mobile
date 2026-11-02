# Equipe — composição e registro de contribuições

---

## 1. Identificação

| Campo | Valor |
|---|---|
| **Projeto** | Memora |
| **Grupo** | Grupo H |
| **Tema escolhido** | Flashcards com repetição espaçada |
| **Repositório** | `https://github.com/eu-breno/trabalho-final-dev-web-mobile` |
| **Data de formação** | 20/08/2026 |
| **Última atualização** | 02/11/2026 |

---

## 2. Integrantes e papéis

**Grupo de 2** — cada um lidera um cliente; backend e contrato são conduzidos em conjunto:

| Integrante | Usuário GitHub | Identidades no Git | Responsabilidade principal | Parte do backend que conduz |
|---|---|---|---|---|
| Breno Olliari | eu-breno | `eu-breno <breno.olliari@gmail.com>`, `eu-breno <208485@upf.br>`, `Breno Olliari <breno.olliari@gmail.com>` | Cliente web | Baralhos, cartões, revisões, fila de estudo, estatísticas e perfil administrador |
| Matheus dos Santos Savegnagi | MATh3us46 | `MATh3us46 <matheussavegnago735@gmail.com>` | App mobile | Autenticação (registro, login e guards) e DTOs |

**Mudança em relação ao combinado inicial.** Na Etapa 0, os papéis foram definidos ao contrário: Matheus no cliente web e Breno no app mobile. Na prática, e conforme a disponibilidade de cada um, Breno conduziu o cliente web e Matheus iniciou o app mobile. A tabela acima reflete a situação atual; o registro da mudança está na seção 6.

**Componente secundário (regra dos dois componentes).** Breno: backend. Matheus: backend, além de um commit no cliente web.

---

## 3. Combinados do grupo

| Tema | Combinado |
|---|---|
| Frequência de reuniões | Reuniões semanais e reuniões adicionais quando necessário para integração ou resolução de problemas |
| Canal de comunicação | WhatsApp para comunicação rápida e GitHub para acompanhamento do código e tarefas |
| Prazo interno antes do prazo oficial do checkpoint | Concluir a maior parte da etapa pelo menos 3 dias antes do prazo oficial |
| Como a revisão de código acontece | Pull Requests no GitHub e revisão pelo outro integrante antes do merge na branch principal (ver seção 6: na prática, a revisão formal não aconteceu) |
| Como avisar mudança no contrato da API | Comunicar no WhatsApp e registrar a alteração no repositório/documentação antes de implementar nos clientes |
| O que fazer quando alguém trava por mais de um dia | Comunicar o outro integrante, explicar o problema e tentar resolver juntos antes de seguir com outra solução |
| Programação em par | Não houve programação em par até 01/11/2026. Se houver, o commit usará `Co-authored-by:` |

---

## 4. Registro por etapa

---

### Etapa 0 — Concepção

**Período:** de 29/08/2026 a 03/09/2026

| Integrante | O que fez | Commits / PRs de referência |
|---|---|---|
| Breno | Participou da escolha do tema, da definição inicial das funcionalidades e da divisão de responsabilidades. Papel inicial: app mobile e módulos de flashcards, revisões e repetição espaçada. Criou o repositório a partir do template e registrou a equipe e o relatório iniciais. | `9f97fb1` (30/08), `11ef27c` (30/08) |
| Matheus | Participou da escolha do tema, da definição inicial das funcionalidades e da divisão de responsabilidades. Papel inicial: cliente web e módulos de autenticação, usuários e baralhos. | - (trabalho sem commit) |
| Ambos | Definiram o funcionamento geral do sistema, a divisão inicial das responsabilidades, a estratégia de uso de branches e Pull Requests e os combinados de trabalho do grupo. | - |

**Dificuldades de coordenação:**

A principal dificuldade foi definir uma divisão de responsabilidades que permitisse a participação dos dois integrantes nos componentes web, mobile e backend sem duplicar trabalho. A solução adotada foi definir um responsável principal por cada cliente e dividir a condução do backend por módulos, mantendo as decisões de arquitetura e o contrato da API em conjunto.

**Ajustes combinados para a próxima etapa:**

Finalizar a modelagem inicial do banco de dados e definir o contrato básico da API antes do desenvolvimento dos clientes. Criar e organizar as branches do repositório e utilizar Pull Requests para revisão e integração das funcionalidades.

---

### Etapa 1 — Contrato e fundação

**Período:** de 04/09/2026 a 23/09/2026

| Integrante | O que fez | Componentes tocados | Commits / PRs de referência |
|---|---|---|---|
| Breno | Criou o projeto backend (NestJS) e configurou o Prisma 7 com o adaptador `pg` e as variáveis de ambiente (`.env.example`). Inicializou o cliente web com Next.js. Modelou o banco de dados (Usuario, Baralho, Cartao e Revisao). Escreveu o PRD e o contrato inicial da API. | Backend, web, docs | `a94dfe5`, `a46c7de`, `4fe9c9e`, `f1ad559`, `0ff3b0f`, `2a3c959`, `f1a53b3`; PR #1 (backend) e PR #2 (frontend), ambos de 12/09 |
| Matheus | Criou o módulo de cartões (controller, module e service) e os DTOs de criação, atualização e consulta, conforme o log de atividades. | Backend | `a0b1add` (22/09) |

**Como a revisão de código aconteceu nesta etapa:** os PRs #1 e #2 foram abertos e integrados por Breno, sem revisão registrada do outro integrante. Os merges de 07/09 e 23/09 foram feitos diretamente, sem PR.

**Dificuldades de coordenação:** o commit pela IDE (WebStorm) falhou em 07/09, e o procedimento foi concluído com o clone do repositório e o commit pelo Git Bash. Arquivos gerados do Next.js entraram no controle de versão por engano nesta etapa e só foram removidos em 18/10 (`9a41bea`).

**Ajustes combinados para a próxima etapa:** conectar o backend ao PostgreSQL e implementar os recursos do MVP (baralhos, cartões, fila de estudo e revisões), deixando a autenticação JWT para depois.

---

### Etapa 2 — Backend · Checkpoint 1

**Período:** de 24/09/2026 a 24/10/2026 (Checkpoint 1 entregue em 24/09/2026; a autenticação JWT, não cobrada naquela entrega, e demais recursos foram concluídos depois, em paralelo ao cliente web)

| Integrante | O que fez | Componentes tocados | Commits / PRs de referência |
|---|---|---|---|
| Breno | **24/09:** alinhou o schema Prisma aos recursos do MVP, conectou o `PrismaService` e fez baralhos, cartões, fila de estudo e revisões usarem PostgreSQL em vez de arrays locais; registrou a revisão em transação; configurou o PostgreSQL 18 no Docker (porta 5433). **11/10:** implementou os endpoints de estatísticas e conectou os módulos de baralhos, cartões e estatísticas ao usuário autenticado. **18/10:** ampliou a fila de estudo (cartões pendentes, todos os cartões do baralho ou um cartão específico). **23/10:** permitiu a revisão individual de cartões. **24/10:** estatísticas de atividade (7, 30 e 90 dias) e alteração de senha com a senha atual. **25/10:** perfil administrador, `GET /usuarios` restrito ao administrador e seed. Manteve o contrato da API atualizado. | Backend, docs | `f8c5be4`, `ebad340`, `a56aedb`, `520fd30`, `ae5e58f`, `886e4ee`, `9ffe29c`, `471b7d7`, `3d1cd16` |
| Matheus | **10/10:** implementou o registro e o login persistidos em banco (validação por DTOs, tratamento de e-mail duplicado, senhas com `bcryptjs`, emissão do `accessToken` com `@nestjs/jwt` e erro unificado para evitar enumeração de e-mails) e a autenticação/autorização com guards. | Backend | `c6eda1c`, `850dc1b` (ambos de 10/10) |

**Como a revisão de código aconteceu nesta etapa:** sem revisão formal. O fluxo adotado foi criar a branch, testar e fazer o merge.

**Dificuldades de coordenação:** até a autenticação ficar pronta em 10/10, o backend usou um usuário técnico temporário, o que atrasou a integração do cliente web com sessão real. A autenticação (Matheus) e as estatísticas e a integração do cliente (Breno) foram concluídas em dias seguidos (10 e 11/10).

**Ajustes combinados para a próxima etapa:** integrar o cliente web à API real, com sessão autenticada.

---

### Etapa 3 — Cliente web · Checkpoint 2

**Período:** de 12/09/2026 a 25/10/2026 (Checkpoint 2 entregue em 22/10/2026; ajustes e extensões até 25/10/2026)

| Integrante | O que fez | Componentes tocados | Commits / PRs de referência |
|---|---|---|---|
| Breno | Integrou o cliente web à API: login e cadastro com validação, sessão com token em cookie `httpOnly` via rotas do Next.js, listagem, busca e criação de baralhos, gerenciamento de cartões e sessão de estudo com avaliação (errei, difícil, bom, fácil). Conectou o dashboard e as estatísticas aos dados da API. **18/10:** página própria de revisão, com progresso, confirmação ao sair e resumo. **23/10:** baralhos em tabela (ordenação, paginação e menu de ações) e diálogo de configurações (nome, e-mail, senha e tema). **24/10:** fluxo de revisão de erros e navegação entre baralhos. **25/10:** página `/admin/usuarios`, visível só ao administrador. Removeu os arquivos gerados do Next.js do controle de versão. | Web | `da9c8cd`, `9a41bea`, `f197cf3`, `78cc80a`, `f9901dc`, `3d1cd16` |
| Matheus | **10/10:** telas de login e cadastro integradas à API (`POST /auth/login` e `POST /auth/registro`, com salvamento do token e redirecionamento) e inclusão no repositório do layout do dashboard e da barra lateral (shadcn/ui), com o menu do Memora (Baralhos, Estatísticas e Turmas). **25/10:** versão básica de turmas (backend, banco e página web), em branch separada e não integrada à `main`. | Web, backend | `6c6ed78` (10/10), `bd10155` (25/10, apenas em `origin/backend`) |

**Como a revisão de código aconteceu nesta etapa:** sem revisão formal. O fluxo adotado foi criar a branch, testar e fazer o merge.

**Dificuldades de coordenação:** o cliente web foi construído antes de a autenticação existir, com dados de demonstração, e depois reconectado à API real. O trabalho de turmas tomou direção própria e, por ter sido feito em paralelo, exigiria mudanças no contrato, na API e nos documentos. Em conversa entre os integrantes, decidiu-se manter as turmas fora do escopo atual (registrado em "Fora do escopo" no PRD) e a branch fica guardada para uma evolução futura. O mesmo critério levou o perfil administrador a ficar restrito à listagem de usuários, para não alterar o contrato e o restante do projeto.

**Ajustes combinados para a próxima etapa:** iniciar o app mobile e voltar a usar Pull Requests com revisão do outro integrante.

---

### Etapa 4 — App mobile · Checkpoint 3

**Período:** de 26/10/2026 a 02/11/2026 (em andamento; mobile não concluído)

| Integrante | O que fez | Componentes tocados | Commits / PRs de referência |
|---|---|---|---|
| Matheus | Inicializou o projeto Flutter do app mobile e criou a tela estática de login. Até esta revisão não implementou HTTP, sessão, baralhos, cartões ou revisão. | Mobile | `113cd46` (26/10, em `origin/back_admin`) |

**Como a revisão de código aconteceu nesta etapa:** sem revisão formal registrada; o commit do projeto mobile está em `origin/back_admin`.

**Dificuldades de coordenação:**

**Ajustes combinados para a próxima etapa:** conectar o login real à API, manter o token conforme o nível simplificado definido no contrato, implementar pelo menos um caso de uso de leitura/escrita e registrar ambiente, testes e URL usada.

---

### Etapa 5 — Integração e fechamento

**Período:** de ___ a ___

| Integrante | O que fez | Componentes tocados | Commits / PRs de referência |
|---|---|---|---|
| | | | |
| | | | |

**Como a revisão de código aconteceu nesta etapa** _(opcional)_**:**

**Dificuldades de coordenação:**

---

## 5. Cobertura por componente

| Integrante | Backend | Web | Mobile | Cumpre a regra dos dois componentes? |
|---|---|---|---|---|
| Breno | 7 | 6 | 0 | Sim (backend e web) |
| Matheus | 4 | 2 | 0 (1 commit de inicialização do projeto Flutter, ainda sem funcionalidade) | Sim (backend e web); o mobile reforça a cobertura na Etapa 4 |

Posição em 02/11/2026. Contagem aproximada de commits relevantes (que implementam ou corrigem comportamento) em todas as branches do projeto. Não entram merges, commits só de documentação, limpeza de arquivos gerados e inicialização de projeto. As três identidades de Breno estão somadas. Do total, `bd10155` (turmas, de Matheus) está só em `origin/feat-turmas`; o estado das branches de Breno deve ser conferido antes da integração final.

---

## 6. Ocorrências

| Data | Ocorrência | Encaminhamento | Professor comunicado? |
|---|---|---|---|
| 12/09/2026 | Os PRs #1 e #2 foram integrados sem revisão do outro integrante, e os merges seguintes foram feitos direto, descumprindo o combinado de revisão por PR. | Voltar a usar PR com revisão cruzada, começando pelo PR da branch `back_admin`. | Não |
| 26/10/2026 | Redistribuição de papéis: Matheus, que era responsável pelo cliente web, iniciou o app mobile, e Breno passou a conduzir o cliente web e a maior parte do backend, conforme a disponibilidade de cada um. | Papéis atualizados na seção 2. Matheus segue no app mobile e Breno no cliente web e no backend. | Não |

---

## 7. Autoavaliação do grupo

**O que funcionou na divisão de trabalho:**

**O que não funcionou:**

**Se recomeçassem, o que dividiriam de outro jeito:**