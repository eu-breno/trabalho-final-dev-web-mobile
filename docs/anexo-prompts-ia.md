# Anexo — Prompts de IA (texto exato)

Este anexo reúne o texto dos prompts citados na seção 2.3 de `docs/relatorio.md`, organizados por dia de uso da IA.

| Dia | Assunto | Seções |
|---|---|---|
| 10/10/2026 | Frontend: telas de revisão, baralhos e detalhe do baralho | A1, B |
| 25/10/2026 | Administrador/professor: análise, implementação e diagnóstico do projeto | A2, C1, C2, D, E, F |

---

## Dia 10/10/2026 — Frontend

### A1. Pedido de Breno ao Claude (telas de revisão, baralhos e detalhe do baralho)

- **Quem conduziu:** Breno · **Ferramenta:** Claude · **Data:** 10/10/2026
- **Resultado:** o Claude melhorou a descrição e devolveu o prompt da seção B.

````text
Alterações que devem ser feitas.

Para todas as açterações, é necessário conferir a documentação em "docs/" para saber como esta o projeto, e também olhar o "backend/" (obrigatório)

Antes de fazer as alterações, utilize os elementos que já estão na tela, e para uma melhor experiencia de usuário, pode utilizar os elementos em componentes/ instalados do shadcn

quando for para clicar em "iniciar revisao" ou coisa assim, ele vai abrir uma a tela como da mesma forma que se abre o frontend/app/estatísticas, frontend/app/baralhos, e etc, deixei pronto a pasta em frontend/app/revisão, ai no caso também,adicione um x em um canto caso o aluno queira sair da revisão, e coloque um poppup do tipo allert dialog que já esta baixado o componente nos elementos UI para se ele tem certeza de sair da revisao. Também nessa pagina da revisão, deve mostrar uma barra de porcentagem de como esta o progresso dos cartões pendentes como o duolinguo, (barra também esta nos elementos UI). a pagina em questão deve conter apenas o bloco da pergunta, abaixo um botão para virar o cartão, e o usuário pode virar e desvirar como quiser e logo abaixo os botões para o usuário dizer como foi, e logo abaxo um botão "enviar" pra confirmar a escolha dele. Ao final da revisão, devera mostrar um dialog de revisão concluída e mostrando como foi o resultado da revisão, e se caso como dito anteriormente o usuário for sair sem completar tudo, devera mostrar o dialog também de resultados. no caso ela vai mostrar em sequencia todos os cartões pendentes.

na parte dos baralhos, tem algumas coisas que quero que altere. mantenha a barra de busca, e na parte da direita mantenha aquela opção que diz a quantidade de baralhos, tem um botão de filtro, pode substituir por um ícone de ordenar e adicionar, e ao lado disso pode colocar o botão de criar o baralho. 

além também, quero que mude a forma de visualizar os baralhos, deixe como se fosse blocos lista, mostrando o nome, quantidade de cartas, quantidade de cartas pendentes, e no final 3 pontinhos que ao clicar ele aparece uma janelinha (componente também tem disso, dropdoenmenu tlgd) onde eu posso deletar o baralho, ou editar ele, caso exluir, mostrar dialog de confirmação, caso editar, mostra dialog para editar o nome, e no botão de criar baralho anteriormente, pode manter o dialog. Outro detalhe também, é que notei que ao criar os baralhos ele cria um ícone, quero que substitua esse ícone para o que esta em anexo (código do lucide) ok? ele também poderá aparecer na visualização em lista dos baralhos. modo de visualização em questão é parecido com o template do dashboard 1 que eu instalei

Ao abrir um baralho, a forma de visualização deve igual a forma que é visualizado o baralho, com algumas diferenças. O ícone que remeta um cartão (em anexo code lucide), a frente do cartão, obviamente se for muito extensa deve ter "..." no final, um valor dd/mm/aa mostrando a próxima revisão, um botão de "play" (para caso o usuário queira fazer aquele cartão especifico) e ao lado 3 pontinho caso o usuário queria deletar ou editar.

Tem como dar uma melhorada para eu passar esse prompt para uma IA? to achando que eu nao soube explicar direto. No caso mandarei para o copilot do vscode, é uma aplicacao de flashcards com revisao espaçada ok?
````

---

### B. Prompt para o Copilot: telas de revisão, baralhos e detalhe do baralho

- **Quem conduziu:** Breno · **Ferramenta:** GitHub Copilot (Agent, VS Code), com o prompt escrito pelo Claude · **Data:** 10/10/2026
- **Resultado:** as telas foram para o repositório no commit `f197cf3` (data do commit: 18/10/2026).

````text
Contexto

Este projeto é uma aplicação de flashcards com repetição espaçada. Antes de qualquer alteração, é obrigatório:

Ler a documentação em docs/ para entender o estado atual do projeto.

Ler o código em backend/ (rotas, modelos, schemas, serviços) para saber quais endpoints e campos já existem (cartões pendentes, próxima revisão, ordenação, etc.).

Reutilizar os componentes de UI já instalados (AlertDialog, Dialog, DropdownMenu, Select, Progress, Button, Input etc.) em vez de criar novos.

Seguir o padrão visual e estrutural das páginas existentes (frontend/app/estatisticas, frontend/app/baralhos).

Se algum endpoint necessário não existir no backend (ex.: listar cartões pendentes de um baralho, enviar resultado de uma revisão, ordenação), liste o que falta, seguindo o padrão do backend atual.

1. Tela de revisão (frontend/app/revisao)

A pasta já foi criada. A revisão deve abrir como uma página própria, no mesmo padrão de estatisticas e baralhos, ao clicar em “Iniciar revisão” (ou equivalente).

Layout e comportamento:

Ao entrar na revisão, a navegação lateral (sidebar) deve ficar recolhida.

Adicionar um botão “X” em um canto da tela para sair da revisão.

Ao clicar no X, abrir um AlertDialog pedindo confirmação (“Tem certeza que deseja sair da revisão?”).

Exibir no topo uma barra de progresso (componente Progress), estilo Duolingo, mostrando a porcentagem de cartões já respondidos em relação ao total de cartões pendentes da sessão.

A página deve conter apenas:

O bloco com a pergunta (frente do cartão).

Abaixo, um botão “Virar cartão”. O usuário pode virar e desvirar quantas vezes quiser.

Abaixo, os botões de avaliação (como o usuário se saiu, conforme a escala usada pelo algoritmo de repetição espaçada do backend, ex.: Errei / Difícil / Bom / Fácil).

Abaixo, um botão “Enviar” para confirmar a escolha e avançar para o próximo cartão (o botão só habilita depois de selecionar uma avaliação).

Os cartões pendentes são exibidos em sequência, um por vez.

Finalização:

Ao terminar todos os cartões, abrir um Dialog de “Revisão concluída” com um resumo breve do resultado (ex.: total revisado, acertos/erros ou distribuição por avaliação).

Se o usuário sair antes de completar (confirmando no AlertDialog), mostrar o mesmo Dialog de resultados com o que foi revisado até ali.

Cada avaliação enviada deve ser persistida no backend (atualizando a próxima data de revisão do cartão).

2. Página de baralhos (frontend/app/baralhos)

Manter e ajustar:

A barra de busca.

À direita, manter a informação com a quantidade de baralhos.

Substituir o botão de filtro atual por um ícone de ordenar, com DropdownMenu e funcionalidade real de ordenação (por nome e por data, crescente/decrescente).

Ao lado do ícone de ordenar, colocar o botão “Criar baralho”, mantendo o Dialog de criação que já existe.

Nova visualização em lista:

Cada baralho deve ser um bloco em formato de lista (uma linha por baralho) contendo:

Ícone de baralho (ver abaixo)

Nome do baralho

Quantidade de cartas

Quantidade de cartas pendentes

No final, um botão de três pontinhos que abre um DropdownMenu com:

Editar: abre Dialog para editar o nome.

Excluir: abre AlertDialog de confirmação antes de excluir.

Ícone:

O ícone atual gerado ao criar baralhos deve ser substituído por um ícone que remeta a um baralho/cartas (ex.: Layers ou GalleryVerticalEnd do lucide-react, ou equivalente já usado no projeto). Esse ícone também aparece na visualização em lista.

3. Página de um baralho (detalhe)

Cabeçalho da seção “Cartões deste baralho”:

Ao lado do título “Cartões deste baralho”, posicionar (da esquerda para a direita):

Ícone de ordenação com DropdownMenu (ordenar por data ou nome).

Botão “Começar revisão” .

Botão “Adicionar cartão” .

Começar revisão:

Ao clicar, abrir um Dialog com um Select para o usuário escolher: “Todo o baralho” ou “Apenas os pendentes”. Ao confirmar, navegar para /revisao com a opção escolhida.

Lista de cartões (mesmo estilo de lista dos baralhos, com estas diferenças):

Ícone que remeta a um cartão.

Frente do cartão como texto principal, truncada com “...” se for longa.

Data da próxima revisão no formato dd/mm/aa.

Botão “play” para revisar apenas aquele cartão (abre /revisao com somente esse cartão).

Botão de três pontinhos com DropdownMenu: Editar (Dialog de edição) e Excluir (AlertDialog de confirmação).

Requisitos gerais

Usar os componentes de UI já presentes no projeto (AlertDialog, Dialog, DropdownMenu, Select, Progress).

Manter consistência de estilo, tipagem e padrões de chamada à API do código existente.

Tratar estados de carregamento, erro e lista vazia.

Ao final, resumir: arquivos criados/alterados, endpoints novos no backend (se houver) e qualquer decisão tomada onde a descrição estava ambígua.
````

---

## Dia 25/10/2026 — Administrador/professor

### A2. Pedido de Breno ao Claude (análise da área de administrador/professor)

- **Quem conduziu:** Breno · **Ferramenta:** Claude · **Data:** 25/10/2026
- **Resultado:** o Claude devolveu o rascunho do prompt de análise da seção C1.

````text
quero que faca sugestoes a IA para criar a sessão de administrador/professor, atualmente a aplicacao esta apenas para estudanes/usuarios, e nao sei como eu posso fazer a parte do administrador, importante: nao se deve alterar o codigo, e sim fazer uma analise do que temos, e o que podemos fazer sem fazer coisas gigantes ok? então de sugestoes a Ia do que um professor pode fazer e etc, inclusive temos no nav uma pagina "turmas" onde podemos trabalhar nela. Então com base na sugestao a Ia analise a fala para nos o que podemos trabalhar em cima. Digo isso porque temos um contrato e prd e mvp, então dependendo da mudança vamos ter que altera-los.
````

---

### C1. Rascunho do prompt de análise do administrador e das turmas (escrito pelo Claude)

- **Quem conduziu:** Breno · **Ferramenta:** Claude · **Data:** 25/10/2026

````text
# Tarefa de ANÁLISE (não escreva nem altere código)

## Contexto

Aplicação de flashcards com repetição espaçada. Hoje ela atende apenas **estudantes/usuários**. Existe uma página **"Turmas"** na navegação lateral, e o projeto tem **contrato, PRD e MVP** documentados. Quero avaliar como criar a visão de **administrador/professor** sem grandes mudanças.

**Esta tarefa é só de análise e proposta. Não modifique nenhum arquivo de código.** O único artefato permitido é um relatório em Markdown (ex.: `docs/analise-professor-turmas.md`), e só crie o arquivo depois de me apresentar o resumo no chat.

## Passo 1: Diagnóstico do que existe

Leia `docs/` (contrato, PRD, MVP e demais) e `backend/` (modelos, rotas, autenticação, permissões) e responda:

- O que os documentos dizem sobre professor/administrador e turmas? Está no escopo do MVP, fora dele ou não é mencionado?

- O backend tem conceito de **papéis/roles**, **turma**, **vínculo aluno–turma**, **compartilhamento de baralhos** ou **permissões**?

- O que a página "Turmas" do frontend faz hoje (é só placeholder ou tem dados reais)?

- Quais dados de estudo já são registrados (revisões, acertos, datas) e poderiam alimentar um painel do professor?

## Passo 2: Sugestões de funcionalidades para o professor

Proponha funcionalidades, **classificadas por esforço**, priorizando coisas pequenas que reaproveitem o que já existe. Considere, por exemplo (avalie se fazem sentido, não são obrigatórias):

- Criar e gerenciar **turmas**, com **código de convite** para o aluno entrar.

- **Compartilhar baralhos** do professor com a turma (aluno recebe uma cópia ou acesso somente leitura).

- **Acompanhar o progresso** da turma e de cada aluno (cartões revisados, taxa de acerto, cartões atrasados, última atividade).

- Identificar alunos **sem estudar** há X dias.

- Papéis (aluno/professor) e **proteção de rotas** no front e no back.

- O que a página "Turmas" mostraria para aluno versus para professor.

Para cada sugestão, informe: **valor para o usuário, esforço (baixo/médio/alto), o que já existe no backend que ajuda e o que teria de ser criado** (modelos, endpoints, telas).

## Passo 3: Recomendação de escopo enxuto

- Proponha **um recorte mínimo viável** (1 a 3 funcionalidades) que entregue valor sem mudanças gigantes.

- Descreva a **ordem de implementação** sugerida em etapas pequenas.

- Aponte **riscos**: privacidade dos dados dos alunos, permissões, migração de banco, conflito com o que já está implementado.

## Passo 4: Impacto nos documentos

Indique, para cada recorte proposto, **o que precisaria mudar** no **contrato, PRD e MVP** (seções afetadas, o que adicionar, o que ficaria como fora de escopo ou fase futura). Não edite os documentos; apenas liste as alterações necessárias.

## Formato da resposta

1. Resumo do diagnóstico (curto).

2. Tabela de sugestões (funcionalidade | valor | esforço | já existe | falta criar).

3. Recomendação de escopo mínimo e etapas.

4. Impacto em contrato/PRD/MVP.

5. Perguntas que preciso responder para decidir.
````

---

### C2. Prompt de análise entregue ao Copilot (somente leitura)

- **Quem conduziu:** Breno · **Ferramenta:** GitHub Copilot (Agent, VS Code) · **Data:** 25/10/2026
- **Resultado:** análise sem código, que recomendou uma área administrativa enxuta (página de usuários e controle de acesso por papel) e deixar professores e turmas para uma evolução futura.

````text
# Tarefa de ANÁLISE: levantamento para criar a área de administrador/professor

## Regras

- **Não altere nenhum arquivo de código nem de documentação.** Esta tarefa é só de leitura, análise e proposta.

- Responda **tudo no chat, em um único relatório**, no formato do final deste prompt, para eu copiar e colar em outra conversa. Não crie arquivos.

- **Separe fatos de sugestões.** Em "O que existe hoje", só escreva o que você **confirmou no código ou nos documentos**, citando o caminho do arquivo. Se não encontrar algo, escreva "não encontrei". Não suponha nem invente.

- Escreva em português, com linguagem simples. Quem vai ler não é especialista e precisa entender os trade-offs.

- Faça tudo em uma rodada, sem perguntar se pode continuar.

## Contexto

Memora é uma aplicação de **flashcards com repetição espaçada**. Hoje ela só tem a visão de **estudante/usuário**. Não há nada definido para **administrador/professor**, e não sei como começar. Existe uma página **"Turmas"** na navegação lateral e o projeto possui **contrato, PRD e MVP** em `docs/`, que podem precisar de ajuste dependendo do que for decidido. Quero uma área de admin/professor **simples**, sem mudanças gigantes.

## O que investigar

1. **Documentação (`docs/`)**: o que contrato, PRD e MVP dizem sobre professor, administrador, turmas, compartilhamento de baralhos e acompanhamento de alunos. Está no escopo, fora do escopo ou não é mencionado? Cite os trechos relevantes de forma resumida.

2. **Stack e arquitetura**: tecnologias do backend e do frontend, banco de dados, ORM e como o frontend se comunica com o backend.

3. **Backend (`backend/`)**:

  - Modelos/entidades e seus campos (usuário, baralho, cartão, revisão e outros).

  - Existe conceito de **papel (role)**, turma, vínculo aluno–turma, compartilhamento de baralho ou permissões? Se sim, onde.

  - Autenticação: como funciona login e JWT, o que o token carrega, e se há guards/middlewares de autorização.

  - **Lista completa de endpoints** (método, rota, o que faz, se exige autenticação).

  - Que dados de estudo são registrados (revisões, avaliações, datas, acertos) e se bastam para calcular progresso e desempenho por aluno.

4. **Frontend (`frontend/`)**:

  - Rotas/páginas existentes e a navegação lateral.

  - O que a página **"Turmas"** faz hoje: placeholder ou dados reais?

  - Como o frontend sabe quem é o usuário logado e como protege rotas.

5. **Pontos de atrito**: o que no código atual dificultaria adicionar papéis e turmas (ex.: tudo assume que o dono do baralho é o usuário, ausência de campo de papel, falta de migrations).

## O que propor

6. **Três cenários de escopo** para a área do professor, do menor ao maior. Para cada um: o que o professor consegue fazer, o que o aluno percebe, o que precisa ser criado (modelos, endpoints, telas), estimativa de esforço (baixo/médio/alto) e riscos. Sugestão de partida:

  - **Cenário A (mínimo):** papéis aluno/professor, criar turma com código de convite, aluno entra na turma, professor vê a lista de alunos.

  - **Cenário B (intermediário):** A + professor compartilha baralhos com a turma + painel simples de progresso (cartões revisados, taxa de acerto, última atividade).

  - **Cenário C (completo):** B + alertas de alunos sem estudar, relatórios e gestão de usuários por um administrador geral.

  Se você enxergar cenários melhores para este código, proponha e justifique.

7. **Diferença entre "professor" e "administrador"**: são o mesmo papel ou papéis distintos neste projeto? Dê uma recomendação com justificativa.

8. **Página "Turmas"**: como ela deveria ser para o aluno e como para o professor, em cada cenário.

9. **Recomendação final**: qual cenário você escolheria, por quê, e a **ordem de implementação em etapas pequenas** (cada etapa entregável e testável sozinha).

10. **Impacto nos documentos**: para o cenário recomendado, o que mudaria em contrato, PRD e MVP (seções afetadas, o que entra, o que vira fase futura). Não edite, apenas liste.

11. **Riscos**: privacidade dos dados dos alunos, permissões, migração de banco e conflitos com o que já existe.

## Formato obrigatório do relatório

```

# RELATÓRIO: CONTEXTO PARA ÁREA DE ADMIN/PROFESSOR

## 1. Resumo em 5 linhas

## 2. O que existe hoje (somente fatos confirmados, com caminhos de arquivo)

### 2.1 Documentação (contrato/PRD/MVP)

### 2.2 Stack e arquitetura

### 2.3 Modelos de dados

### 2.4 Autenticação e permissões

### 2.5 Endpoints (tabela: método | rota | função | autenticado?)

### 2.6 Frontend: rotas e página Turmas

### 2.7 Dados de estudo disponíveis

## 3. O que NÃO existe (lacunas)

## 4. Pontos de atrito no código atual

## 5. Cenários propostos (tabela comparativa + detalhe de cada um)

## 6. Professor x administrador: recomendação

## 7. Página Turmas: proposta por perfil

## 8. Recomendação final e etapas de implementação

## 9. Impacto em contrato/PRD/MVP

## 10. Riscos

## 11. Perguntas que preciso responder para decidir

```

Na seção 11, liste de 5 a 10 perguntas objetivas e, para cada uma, a sua sugestão de resposta padrão.
````

---

### D. Prompt do perfil administrador (25/10/2026)

- **Quem conduziu:** Breno · **Ferramenta:** GitHub Copilot (Agent, VS Code), com o prompt escrito pelo Claude · **Data:** 25/10/2026
- **Resultado:** commit `3d1cd16`.
- **Observação:** o Claude forneceu duas versões deste prompt (a primeira pedia também um teste unitário do `PapeisGuard`). O texto abaixo é a versão final. 
````text
Contexto: projeto NestJS (backend) + Next.js (frontend). Crie uma branch nova a partir da main: `git checkout main && git checkout -b feature/admin`. NÃO traga o commit de turmas (bd10155).

Objetivo: implementar o perfil administrador da forma MAIS SIMPLES possível, seguindo o que já está no docs/contrato-api.md (seção de GET /usuarios) e no PRD. Não altere baralhos, cartões, estatísticas nem o schema do Prisma (o enum Perfil e o campo Usuario.perfil já existem).

Regras do projeto: identificadores (arquivos, pastas, campos, rotas) em português SEM acento; nomes de padrões em inglês (Controller, Service, Guard, Dto). Textos de interface e mensagens de erro em português do Brasil com acento. O contrato muda antes do código: antes de implementar, confira se docs/contrato-api.md descreve GET /usuarios com o erro 403 e o formato de resposta; se faltar algo, ajuste o contrato primeiro e me diga o que mudou. NÃO faça commit; deixe tudo no working tree para eu revisar.

Tarefas:
1. Corrigir backend/src/auth/decorators/roles.decorator.ts para gravar os papéis recebidos (`SetMetadata(ROLES_KEY, roles)`), e conferir se o PapeisGuard lê esse metadata e compara com o `perfil` do usuário do JWT.
2. Criar o módulo `usuarios` com `GET /usuarios`, protegido por JwtAuthGuard + PapeisGuard + @Roles('administrador') (JwtAuthGuard primeiro), retornando os usuários SEM senhaHash, no formato do contrato. Registrar o módulo no app.module.
3. Garantir que POST /auth/registro SEMPRE cria `estudante` e que o DTO não aceita o campo `perfil`.
4. Criar uma seed (backend/prisma/seed.ts) que cria um administrador com as variáveis de ambiente ADMIN_EMAIL, ADMIN_SENHA e ADMIN_NOME (senha com bcryptjs, como no registro). Idempotente (upsert por email). Stack é Prisma 7: o PrismaClient deve vir do caminho gerado (generated/prisma/client) e ser criado com o adaptador @prisma/adapter-pg, como no PrismaService; o comando de seed vai em prisma.config.ts (migrations.seed). Documente as variáveis no .env.example com valores FICTÍCIOS e confirme que nenhum .env real está versionado.
5. Frontend: criar a página `/admin/usuarios` (dentro de (authenticated)) com uma tabela simples (nome, email, perfil, data de criação), usando a rota intermediária de API que já existe. Mostrar o link "Usuários" no cabeçalho SOMENTE se o perfil do usuário logado for administrador (use GET /auth/perfil). Se um estudante abrir a URL, mostrar "acesso negado".
6. Rodar `npm run build` no backend e no frontend e me dizer o resultado.

Ao final, liste os arquivos criados/alterados, explique em linguagem simples o que cada um faz, e diga como testar manualmente (rodar a seed, logar como admin e como estudante).
````

---

### E. Verificação de versões (25/10/2026)

- **Quem conduziu:** Breno · **Ferramenta:** GitHub Copilot (Agent, VS Code), com o prompt escrito pelo Claude · **Data:** 25/10/2026

````text
Sem alterar nada, mostre as versões EXATAS instaladas (package.json e lockfile) de: @nestjs/core, next, react, prisma, @prisma/client, @prisma/adapter-pg. Diga também se o frontend usa App Router (pasta app/) e se existe alguma pasta pages/ ou uso de getServerSideProps. Cite arquivo e linha.
````

---

### F. Diagnóstico geral do projeto (25/10/2026)

- **Quem conduziu:** Breno · **Ferramenta:** GitHub Copilot (Agent, VS Code), com o prompt escrito pelo Claude · **Data:** 25/10/2026

````text
Preciso que você faça um diagnóstico completo deste projeto, SOMENTE com base no que existe nos arquivos e no histórico do git. Não invente nada: se não encontrar uma informação, escreva "NÃO ENCONTRADO". Para cada afirmação, cite o arquivo (e linha, se possível) onde viu isso.

Responda nas seções abaixo:

1. VISÃO GERAL
- Qual o objetivo do sistema?
- Estrutura de pastas (resumida) e o que cada módulo faz (api, web, mobile, etc.).
- Stack: linguagens, frameworks, banco de dados, bibliotecas principais.

2. PLATAFORMAS E PERFIS DE USUÁRIO
- Existe aplicação web? Existe mobile? Quem usa cada uma (usuário comum, administrador, outros)?
- Existe o conceito de "administrador" / papéis (role, isAdmin, perfil, etc.) no código, no banco, na API, no front? Onde exatamente?
- Como funciona a autenticação e a autorização? Algum endpoint ou tela é restrito a admin?

3. DOCUMENTOS
- Leia o contrato da API (OpenAPI/Swagger/arquivo de contrato), o README e qualquer documento de requisitos/enunciado que esteja no repositório.
- O que cada um diz sobre administrador, usuários e plataformas (web/mobile)?
- Liste as INCONSISTÊNCIAS entre contrato x README x código real.

4. API
- Liste todos os endpoints (método, rota, quem pode acessar, o que faz).
- Quais estão no contrato mas NÃO implementados? Quais estão implementados mas NÃO estão no contrato?

5. BANCO DE DADOS / MODELOS
- Liste as entidades/tabelas, campos principais e relacionamentos.

6. ALTERAÇÃO "TURMAS" (feita por um colega)
- Use git log, git branch -a, git diff e git status para achar tudo relacionado a "turmas" / "turma" / "class".
- Quais arquivos foram criados/alterados? Em qual branch/commit? Já foi para a main ou está solto?
- O que essa alteração adiciona (modelos, endpoints, telas)?
- O que ela QUEBRA ou exige mudar em: API, contrato, banco, front web, mobile, testes e README?
- Está funcionando, incompleta ou quebrada?

7. ESTADO DO PROJETO
- O que está pronto e funcionando?
- O que está pela metade?
- O que está faltando?
- Existem erros de build, testes falhando, TODOs/FIXMEs ou código morto?


Formato: use títulos e listas curtas, em português.
````