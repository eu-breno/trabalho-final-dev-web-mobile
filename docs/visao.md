# Documento de Visão

---

## Identificação

| Campo | Valor |
|---|---|
| **Nome do projeto** | Memora |
| **Grupo** | Grupo H |
| **Integrantes** | Breno Olliari e Matheus dos Santos Savegnagi (detalhamento em `docs/equipe.md`) |
| **Disciplina** | Programação Web e Mobile |
| **Data de criação** | 30/08/2026 |
| **Última atualização** | 02/11/2026 |
| **Versão** | 1.2 |

---

## 1. Introdução

### 1.1 Propósito do documento

Este documento descreve a visão do Memora, um sistema de flashcards com repetição espaçada: o problema que ele resolve, quem o usa, o escopo de alto nível e por que o domínio justifica um cliente web e um aplicativo mobile. Destina-se ao professor da disciplina e serve como base para o PRD (`docs/prd.md`) e para o contrato da API (`docs/contrato-api.md`).

### 1.2 Escopo do produto

**O sistema irá:**
- Permitir que estudantes criem contas, entrem no sistema e organizem o conteúdo em baralhos de cartões (frente e verso).
- Oferecer uma sessão de estudo em que o estudante vê a frente do cartão, revela o verso e avalia a própria resposta (errei, difícil, bom ou fácil); o sistema reagenda o cartão conforme a avaliação.
- Indicar, a cada dia, quais cartões estão pendentes de revisão.
- Mostrar o progresso do estudante: revisões feitas, cartões pendentes, taxa de acerto e sequência de dias estudados.
- Ter dois perfis de acesso, estudante e administrador; o administrador consulta a lista de usuários cadastrados.
- Servir os dois clientes, web e mobile, por uma única API REST, que concentra as regras de negócio e os dados.

**O sistema não irá (fora do escopo):**
- Refresh token e recuperação de senha por e-mail.
- Baralhos compartilhados ou públicos entre usuários, incluindo o conceito de turmas.
- Importação e exportação de cartões (CSV, Anki).
- Imagens e áudio nos cartões.
- Modo offline e sincronização no aplicativo mobile.
- Notificações push de lembrete.
- Tags, categorias e mover cartões entre baralhos.
- Algoritmos de repetição espaçada mais avançados, como o FSRS.

### 1.3 Definições e siglas

| Termo | Definição |
|---|---|
| Flashcard (cartão) | Cartão de estudo com uma pergunta ou termo na frente e a resposta no verso. |
| Baralho | Conjunto de cartões de um mesmo assunto, pertencente a um usuário. |
| Repetição espaçada | Técnica de estudo em que o intervalo até a próxima revisão de um conteúdo é ajustado conforme o desempenho do estudante. |
| Cartão pendente | Cartão cuja data de próxima revisão já chegou. |
| Avaliação | Nota que o estudante dá a si mesmo ao revisar um cartão: errei, difícil, bom ou fácil. |
| Sessão de estudo | Sequência de cartões pendentes apresentados ao estudante para revisão. |
| Estudante | Perfil de usuário que cria baralhos e cartões e estuda. |
| Administrador | Perfil de usuário que consulta os usuários cadastrados no sistema. |
| API REST | Serviço que expõe os dados e as regras do sistema por HTTP, consumido pelos dois clientes. |
| JWT | Token usado para autenticar as requisições feitas à API. |

---

## 2. Posicionamento

### 2.1 Declaração do problema

| Campo | Descrição |
|---|---|
| **O problema de** | não saber o que revisar nem quando, ao estudar grandes volumes de conteúdo para memorizar |
| **Afeta** | estudantes de graduação e de concursos, que estudam relendo cadernos, apostilas ou planilhas |
| **Cujo impacto é** | tempo gasto relendo o que já se sabe, esquecimento do que não foi revisado a tempo e falta de visão sobre quais assuntos estão mais fracos |
| **Uma solução adequada seria** | um sistema que organiza o conteúdo em baralhos, decide quando cada cartão volta a aparecer com base na avaliação do estudante e mostra o progresso |

### 2.2 Declaração de posição do produto

- **Para** estudantes que precisam memorizar muito conteúdo, como universitários e concurseiros
- **Que** querem revisar no momento certo, sem planejar manualmente o que estudar a cada dia
- **O** Memora
- **É** um sistema de flashcards com repetição espaçada, com cliente web e aplicativo mobile
- **Que** mostra todo dia quais cartões revisar, reagenda cada um conforme o desempenho e acompanha o progresso
- **Diferente de** reler cadernos e apostilas ou de usar papel e planilhas, que não avisam quando revisar cada assunto
- **Nosso produto** oferece uma interface simples e enxuta, centrada no fluxo diário (ver o que está pendente, revisar e acompanhar o progresso), com a mesma conta e os mesmos dados no computador e no celular

---

## 3. Partes interessadas

| Parte interessada | Papel | Interesse no sistema |
|---|---|---|
| Estudante | Usuário direto | Organizar o material e revisar no momento certo para memorizar com menos tempo de estudo |
| Administrador | Usuário direto, com perfil próprio | Saber quem tem conta cadastrada no sistema |
| Equipe de desenvolvimento (Breno e Matheus) | Projeto, implementação e manutenção | Entregar um sistema funcional, com os três componentes integrados |
| Professor da disciplina | Avaliador e orientador | Verificar a arquitetura, o contrato compartilhado entre os clientes e o domínio dos integrantes sobre o sistema |

---

## 4. Descrição dos usuários

No sistema há dois perfis de acesso (estudante e administrador). Os dois primeiros perfis abaixo têm o mesmo perfil de acesso, estudante, e se diferenciam pelo contexto de uso, que é o que justifica ter dois clientes. Eles são detalhados como as personas Marina e Rafael no PRD.

### 4.1 Perfil: Estudante em pequenos intervalos (persona Marina)

| Campo | Descrição |
|---|---|
| **Descrição** | Estudante de graduação, com muita matéria para decorar (artigos, conceitos, prazos) |
| **Responsabilidades** | Revisar os cartões pendentes todos os dias; registrar uma dúvida em um cartão quando ela aparece |
| **Contexto de uso** | Em movimento, com o celular na mão: no ônibus, entre aulas, na fila. Tem poucos minutos por vez |
| **Nível técnico** | Básico |
| **Frequência de uso** | Diário |
| **Principal necessidade** | Abrir o app, ver quantos cartões estão pendentes e terminar a revisão em poucos minutos, sem decidir o que estudar |

### 4.2 Perfil: Estudante em estudo concentrado (persona Rafael)

| Campo | Descrição |
|---|---|
| **Descrição** | Concurseiro que transforma apostilas e resumos em perguntas e respostas |
| **Responsabilidades** | Criar e organizar baralhos por matéria, cadastrar muitos cartões de uma vez, editar o conteúdo e acompanhar o próprio progresso |
| **Contexto de uso** | Sentado em casa, no computador, com teclado e tela grande |
| **Nível técnico** | Intermediário |
| **Frequência de uso** | Diário |
| **Principal necessidade** | Organizar o material por assunto e ver, ao fim da semana, quantas revisões fez e onde está mais fraco |

### 4.3 Perfil: Administrador

| Campo | Descrição |
|---|---|
| **Descrição** | Responsável por acompanhar quem utiliza o sistema |
| **Responsabilidades** | Consultar a lista de usuários cadastrados |
| **Contexto de uso** | No computador; tarefa administrativa, feita de vez em quando |
| **Nível técnico** | Intermediário |
| **Frequência de uso** | Eventual |
| **Principal necessidade** | Ver os usuários cadastrados, sem acesso aos baralhos e cartões de ninguém |

---

## 5. Visão geral do produto

### 5.1 Perspectiva do produto

O Memora é um sistema independente, sem integração com sistemas externos. Ele substitui processos manuais de estudo (reler cadernos, usar papel ou planilhas) por um sistema que controla quando cada conteúdo deve ser revisado. Uma única API REST concentra as regras de negócio e o acesso ao banco de dados; o cliente web e o aplicativo mobile são duas formas de usar os mesmos dados, e nenhum dos dois acessa o banco diretamente.

### 5.2 Por que dois clientes

O Memora tem dois contextos de uso diferentes, e cada cliente atende ao seu.

**O que acontece na tela grande, e por quê:** é onde o conteúdo é construído e analisado. Criar e organizar baralhos, cadastrar muitos cartões de uma vez, editar e remover cartões e consultar as estatísticas de progresso exigem teclado e espaço de tela. A administração de usuários também é uma tarefa de mesa.

**O que acontece no celular, e por quê:** é onde a maior parte do estudo acontece. A revisão de cartões cabe em intervalos curtos e imprevisíveis do dia (ônibus, intervalo entre aulas, fila), e o celular é o que o estudante tem à mão nesses momentos. O app também permite registrar um cartão novo na hora em que uma dúvida aparece, sem esperar o momento de sentar ao computador.

**O que faz sentido existir nos dois:** o login, a lista de baralhos com a quantidade de cartões pendentes e a sessão de estudo. Como os dois clientes usam a mesma API, um cartão criado no computador aparece no celular, e uma revisão feita no celular atualiza o que o computador mostra.

### 5.3 Capacidades principais

| # | Capacidade | Descrição resumida | Cliente principal |
|---|---|---|---|
| C01 | Conta e acesso | Cadastro, login, logout e perfis de acesso (estudante e administrador) | ambos (cadastro no web) |
| C02 | Gestão de baralhos | Criar, listar, editar e remover baralhos, com total de cartões e pendentes | web (listagem também no mobile) |
| C03 | Gestão de cartões | Criar, buscar, editar e remover cartões de um baralho | web (criação também no mobile) |
| C04 | Estudo com repetição espaçada | Sessão de revisão com avaliação em quatro níveis e reagendamento automático | ambos |
| C05 | Acompanhamento do progresso | Revisões, cartões pendentes, taxa de acerto, sequência de dias e atividade por período | web |
| C06 | Administração de usuários | Listagem dos usuários cadastrados, restrita ao administrador | web |

### 5.4 Suposições e dependências

**Suposições:**
- O estudante cria o próprio conteúdo; o sistema não traz baralhos prontos.
- O estudante tem conexão com a internet ao usar os clientes, já que não há modo offline.
- A repetição espaçada só traz benefício se o estudante revisar com regularidade, nos dias indicados pelo sistema.
- O administrador é criado por uma carga inicial (seed) no banco; o cadastro público cria sempre estudantes.

**Dependências:**
- A API e o banco de dados PostgreSQL precisam estar no ar para qualquer cliente funcionar.
- O aplicativo mobile depende de emulador ou dispositivo com Flutter configurado para ser executado e demonstrado.
- As chaves e credenciais (segredo do JWT, acesso ao banco, dados do administrador) são fornecidas por variáveis de ambiente.

---

## 6. Restrições

| Tipo | Restrição |
|---|---|
| Backend | NestJS + Prisma 7 (com `@prisma/adapter-pg`) + PostgreSQL 18 |
| Cliente web | React 19 + Next.js com App Router |
| Cliente mobile | Flutter e Dart configurados pelo projeto; versões do SDK do Matheus ainda não registradas |
| Versões | NestJS 12, Next.js 16, React 19 e Prisma 7 são os valores efetivamente adotados; o mobile ainda não possui stack HTTP/estado implementada |
| Autenticação | JWT com guards no backend; sessão completa no cliente web; no app mobile, sessão simplificada (login real contra a API, token mantido em memória) |
| Arquitetura | Regra de negócio no backend; clientes não acessam o banco |
| Controle de versão | Repositório único do grupo no GitHub, criado a partir do repositório-modelo da disciplina |
| Prazo | Etapas 0 a 5 conforme o calendário da turma, mais apresentação |
| Documentação | Markdown, versionada no mesmo repositório |
| Equipe | Grupo de 2 integrantes, com os três componentes (backend, web e mobile) a cargo dos dois |
| Escopo do mobile | Recorte mínimo de dois casos de uso: estudar um baralho e criar um cartão rápido |
| Escopo geral | Itens da seção 1.2 (fora do escopo) não serão implementados |

---

## 7. Qualidade

| Atributo | Relevância para este sistema |
|---|---|
| Usabilidade | O estudo é diário e feito em poucos minutos; avaliar um cartão deve exigir poucas interações (revelar o verso e escolher a nota, em no máximo dois toques) |
| Segurança | O sistema guarda contas e conteúdo pessoal: senhas armazenadas com hash, acesso por token com validade de 1 hora, rotas protegidas e cada usuário acessando somente os próprios baralhos e cartões |
| Integridade dos dados | Cada avaliação grava a revisão e atualiza o cartão na mesma operação; o histórico de revisões não pode ficar inconsistente com o estado do cartão |
| Desempenho | A fila de estudo precisa abrir rápido mesmo em baralhos grandes; a meta é responder em menos de 500 ms com 5.000 cartões no baralho |
| Comportamento em rede instável _(mobile)_ | O app é usado em deslocamento, onde a conexão oscila; ele deve tratar a falha de rede sem travar, mostrar uma mensagem clara com opção de tentar de novo e manter na tela o cartão que está sendo avaliado |

---

## 8. Histórico de revisões

| Versão | Data | Autor | Descrição da alteração |
|---|---|---|---|
| 1.0 | 30/08/2026 | Breno | Versão inicial: tema e repositório definidos (Etapa 0) |
| 1.1 | 01/11/2026 | Breno | Preenchimento completo do documento, alinhado ao estado conhecido do projeto |
| 1.2 | 02/11/2026 | Breno | Versões do backend, web e mobile e estado real da implementação atualizados |