# Contrato da API

> **Instruções:** Este documento especifica a interface REST que o backend expõe e que os dois clientes consomem. Deve ser entregue ao final da **Etapa 1** e mantido atualizado a cada mudança de endpoint. Remova os blocos `> instrução` após preenchê-los.

---

## Por que este documento existe

O grupo trabalha em paralelo em três componentes, com menos gente do que frentes. O que impede que um trave o outro é este arquivo: com o contrato fechado, o responsável pelo cliente web pode construir a tela de listagem antes de o endpoint existir, e o responsável pelo mobile pode modelar suas classes de dados sem esperar a primeira migration.

> **Escopo do Checkpoint 1 (24/09/2026):** nesta entrega, a implementação validada é o núcleo da API NestJS com Prisma/PostgreSQL: baralhos, cartões, fila de estudo e revisões. JWT, clientes web/mobile, estatísticas e permissões administrativas estão planejados para etapas posteriores. Até a autenticação ser implementada, os endpoints do MVP usam um usuário técnico fixo apenas no ambiente de desenvolvimento.

Duas regras práticas decorrem disso:

1. **O contrato muda antes do código, nunca depois.** Quem precisa alterar um endpoint atualiza este documento e avisa o grupo no mesmo dia. Descobrir a mudança quando a tela quebra custa o dobro.
2. **O contrato é a especificação, não a documentação.** Se ele descreve um comportamento e a API faz outro, o defeito está na API — a menos que o grupo decida conscientemente mudar o contrato.

A régua de qualidade é esta: na entrega final, o contrato precisa ser suficiente para que um quarto cliente seja escrito **sem nenhuma pergunta ao grupo**.

---

## Identificação

| Campo | Valor |
|---|---|
| **Projeto** | Memora — flashcards com repetição espaçada |
| **Versão do contrato** | 1.0 |
| **Última atualização** | 21/09/2026 |
| **URL base (desenvolvimento)** | `http://localhost:3000` |
| **Formato** | JSON (`Content-Type: application/json`) |

> **Nota para o app mobile:** `localhost` dentro do emulador Android aponta para o próprio emulador, não para a máquina do desenvolvedor. Use `http://10.0.2.2:3000` no emulador Android, ou o IP da máquina na rede local para dispositivo físico. Registre a URL usada por cada ambiente na configuração do app, nunca fixa no meio do código.

---

## 1. Convenções gerais

### 1.1 Nomenclatura

- Recursos no plural e em português, sem acento: `/baralhos`, `/cartoes`, `/revisoes`
- Campos em `camelCase`, sem acento: `proximaRevisao`, `intervaloDias`, `totalCartoes`
- Identificadores técnicos em inglês: `id`, `createdAt`, `updatedAt`, `page`, `limit`, `accessToken`
- Valores de enum em minúsculas, sem acento: `estudante`, `administrador`, `errei`, `dificil`, `bom`, `facil`
- Identificadores são `uuid` (v4), gerados pelo servidor.

### 1.2 Métodos e status esperados

| Operação | Método e caminho | Sucesso | Erros comuns |
|---|---|---|---|
| Listar | `GET /recursos` | `200` | `401` |
| Obter um | `GET /recursos/:id` | `200` | `401`, `404` |
| Criar | `POST /recursos` | `201` | `400`, `401`, `404`, `409` |
| Atualizar | `PATCH /recursos/:id` | `200` | `400`, `401`, `404`, `409` |
| Remover | `DELETE /recursos/:id` | `204` | `401`, `404` |

> Ajuste conforme o domínio. Operações de transição de estado costumam ficar melhor como sub-recurso (`POST /chamados/:id/resolucao`) do que como campo em um `PATCH` genérico — decida e registre a escolha.

**Decisão:** ações do domínio não são `PATCH` genéricos. Avaliar um cartão é `POST /cartoes/:id/revisoes` (cria uma revisão) e a fila de estudo é `GET /baralhos/:id/estudo`. O cliente **nunca** envia `proximaRevisao`, `intervaloDias`, `repeticoes` ou `facilidade` — quem calcula é o servidor.

**Decisão:** o servidor rejeita campos desconhecidos no corpo (`400`). Enviar um campo que o contrato marca como somente leitura também resulta em `400`.

**Decisão sobre acesso a recursos de outro usuário:** um estudante que acessa baralho, cartão ou revisão de outro usuário recebe `404` (e não `403`), para não revelar que o recurso existe.

### 1.3 Formato de erro

Toda resposta de erro segue o mesmo formato, em qualquer endpoint:

```json
{
  "statusCode": 400,
  "message": ["nome nao pode ser vazio", "frente deve ter no maximo 500 caracteres"],
  "error": "Bad Request"
}
```

> Este é o formato padrão do NestJS. Se o grupo adotar um formato próprio, descreva-o aqui — e implemente-o com um filtro de exceção, não repetindo a estrutura em cada controller.

`message` é sempre um array quando a causa é validação de campos (`400`) e uma string nos demais casos:

```json
{
  "statusCode": 409,
  "message": "Ja existe um baralho com esse nome",
  "error": "Conflict"
}
```

### 1.4 Paginação

> Descreva a estratégia adotada nas listagens. Exemplo:

`GET /recursos?page=1&limit=20` (padrão `page=1`, `limit=20`, máximo `limit=100`)

```json
{
  "dados": [],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

`total` é a quantidade de registros que atendem ao filtro, somando todas as páginas. Lista vazia devolve `200` com `dados: []`.

### 1.5 Datas

Todas as datas trafegam em ISO 8601, em UTC: `2026-09-21T14:30:00.000Z`. A conversão para o fuso do usuário é responsabilidade de cada cliente.

---

## 2. Autenticação

### 2.1 Estratégia

> Descreva o fluxo: como o token é obtido, quanto tempo dura, se existe refresh, como é enviado.

- O token é um **JWT** assinado com segredo do servidor (variável de ambiente `JWT_SECRET`).
- Duração: **1 hora**. Não há refresh token. Token expirado resulta em `401`, e o cliente leva o usuário de volta ao login.
- O token contém `sub` (id do usuário) e `perfil`.
- Não existe endpoint de logout: o cliente descarta o token.

Requisições autenticadas enviam o token no cabeçalho:

```
Authorization: Bearer <token>
```

Todas as rotas exigem token, exceto `POST /auth/registro` e `POST /auth/login`.

### 2.2 Endpoints de autenticação

#### `POST /auth/login`

Autentica o usuário e devolve o token de acesso.

**Requisição**

```json
{
  "email": "marina@exemplo.com",
  "senha": "senhaSegura123"
}
```

**Resposta `200`** — mesmo corpo do registro (ver `POST /auth/registro`).

```json
{
  "accessToken": "eyJhbGciOi...",
  "usuario": {
    "id": "5b0e1c7a-2f44-4d0b-9f3e-6a1d8c2b9e10",
    "nome": "Marina Souza",
    "email": "marina@exemplo.com",
    "perfil": "estudante"
  }
}
```

**Erros**

| Status | Quando |
|---|---|
| `400` | Corpo inválido |
| `401` | E-mail ou senha incorretos (mesma mensagem nos dois casos, para não revelar qual falhou) |

#### `POST /auth/registro`

> Descreva, se houver auto-cadastro. Caso contrário, remova e explique como os usuários são criados.

Auto-cadastro. Sempre cria um usuário de perfil `estudante`; o perfil não pode ser escolhido pelo cliente. O `administrador` é criado por seed.

**Requisição**

```json
{
  "nome": "Marina Souza",
  "email": "marina@exemplo.com",
  "senha": "senhaSegura123"
}
```

| Campo | Regra |
|---|---|
| `nome` | string, 1–80, obrigatório |
| `email` | e-mail válido, até 120, obrigatório, único no sistema (sem diferenciar maiúsculas) |
| `senha` | string, 8–72, obrigatório |

**Resposta `201`** — já devolve o token, para o cliente entrar direto (mesmo formato do login).

```json
{
  "accessToken": "eyJhbGciOi...",
  "usuario": {
    "id": "5b0e1c7a-2f44-4d0b-9f3e-6a1d8c2b9e10",
    "nome": "Marina Souza",
    "email": "marina@exemplo.com",
    "perfil": "estudante"
  }
}
```

| Status | Quando |
|---|---|
| `400` | Campo obrigatório ausente, e-mail inválido, senha fora da faixa |
| `409` | Já existe usuário com esse e-mail |

#### `GET /auth/me`

Devolve o usuário dono do token. Serve para o cliente restaurar a sessão.

**Resposta `200`**

```json
{
  "id": "5b0e1c7a-2f44-4d0b-9f3e-6a1d8c2b9e10",
  "nome": "Marina Souza",
  "email": "marina@exemplo.com",
  "perfil": "estudante"
}
```

| Status | Quando |
|---|---|
| `401` | Token ausente, inválido ou expirado |

### 2.3 Perfis e permissões

> Liste os perfis do sistema e o que cada um pode fazer. Esta tabela é o que o guard de autorização implementa.

| Perfil | Pode | Não pode |
|---|---|---|
| `estudante` | Criar, ver, editar e remover os **próprios** baralhos e cartões; estudar e avaliar cartões próprios; ver as próprias estatísticas | Acessar dados de outros usuários (recebe `404`); listar usuários (recebe `403`) |
| `administrador` | Tudo o que o estudante pode nos próprios dados; listar usuários (`GET /usuarios`) | Ver ou alterar baralhos e cartões de outros usuários |

Cada linha da coluna "Não pode" vira um teste (`403` ou `404`) e um caso no guard de autorização.

### 2.4 Armazenamento do token em cada cliente

| Cliente | Onde o token fica | Nível de autenticação | Observação |
|---|---|---|---|
| Web (Next.js) | Cookie `httpOnly`, gravado pelo próprio Next.js após o login | completa | Expiração tratada: `401` leva ao login |
| Mobile (Flutter) | Em memória (variável no serviço de autenticação) | simplificada | Login real contra a API; o token se perde ao fechar o app e o usuário entra de novo |

> **Regra inegociável:** sessão simplificada ou simulada no app mobile nunca significa afrouxar a API. Os endpoints continuam protegidos pelo mesmo guard, e o app continua apresentando um token válido em toda requisição autenticada — o que muda é apenas **como** esse token é obtido, não se ele é exigido. Criar uma rota desprotegida só para o app funcionar sem login é falha de segurança, não simplificação aceitável.

---

## 3. Recursos

> Repita o bloco abaixo para cada recurso do domínio. Documente **todos** os endpoints do MVP; endpoints de prioridade Média ou Baixa podem ficar como esboço, desde que marcados como tal.
>
> **Antes de preencher, leia o [Anexo A](#anexo-a--exemplo-preenchido-domínio-de-biblioteca)**, no final deste documento: ele traz o mesmo bloco preenchido de ponta a ponta, com um recurso simples e um endpoint de regra de negócio.

---

### 3.1 `Baralho`

**Descrição:** coleção de cartões sobre um assunto (ex.: "Inglês — verbos irregulares"). Pertence a um único usuário.

**Consumido por:** ambos (web faz o CRUD completo; mobile lista e escolhe o baralho para estudar)

#### Representação

```json
{
  "id": "c7d2a1f0-8e35-4b6a-a1c9-0f3e5d7b2a48",
  "nome": "Inglês — verbos irregulares",
  "descricao": "Lista das provas do semestre",
  "totalCartoes": 42,
  "cartoesPendentes": 7,
  "createdAt": "2026-09-21T14:30:00.000Z",
  "updatedAt": "2026-09-21T14:30:00.000Z"
}
```

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `id` | uuid | — | Gerado pelo servidor |
| `nome` | string (1–80) | sim | Único por usuário (sem diferenciar maiúsculas) |
| `descricao` | string (0–300) | não | Padrão: `null` |
| `totalCartoes` | inteiro | — | Calculado pelo servidor; somente leitura |
| `cartoesPendentes` | inteiro | — | Cartões com `proximaRevisao` menor ou igual a agora; calculado pelo servidor; somente leitura |
| `createdAt`, `updatedAt` | ISO 8601 | — | Gerados pelo servidor |

#### `GET /baralhos`

Lista os baralhos do usuário autenticado, ordenados por nome (A–Z).

| Parâmetro de consulta | Tipo | Descrição |
|---|---|---|
| `page` | número | Página, padrão 1 |
| `limit` | número | Itens por página, padrão 20, máximo 100 |
| `busca` | string | Filtra por nome, sem diferenciar maiúsculas |

**Resposta `200`** — objeto paginado conforme a seção 1.4, com `dados` contendo baralhos.

| Status | Quando |
|---|---|
| `200` | Sucesso, mesmo que a lista venha vazia |
| `401` | Token ausente ou inválido |

#### `GET /baralhos/:id`

**Resposta `200`** — a representação acima.

| Status | Quando |
|---|---|
| `401` | Token ausente ou inválido |
| `404` | Baralho inexistente ou de outro usuário |

#### `POST /baralhos`

**Requisição**

```json
{
  "nome": "Inglês — verbos irregulares",
  "descricao": "Lista das provas do semestre"
}
```

**Resposta `201`** — a representação criada, com `totalCartoes` e `cartoesPendentes` iguais a `0`.

| Status | Quando |
|---|---|
| `400` | `nome` ausente ou fora de 1–80; `descricao` maior que 300; campo desconhecido |
| `401` | Token ausente ou inválido |
| `409` | O usuário já tem um baralho com esse nome |

#### `PATCH /baralhos/:id`

**Requisição** — `nome` e/ou `descricao`.
**Resposta `200`** — a representação atualizada.

| Status | Quando |
|---|---|
| `400` | Valor fora das regras de validação acima |
| `401` | Token ausente ou inválido |
| `404` | Baralho inexistente ou de outro usuário |
| `409` | Novo nome já usado por outro baralho do usuário |

#### `DELETE /baralhos/:id`

Remove o baralho **e todos os seus cartões e revisões** (remoção em cascata). Não há `409` neste recurso: a confirmação ao usuário é feita na interface.

**Resposta `204`** — sem corpo.
**Resposta `404`** — baralho inexistente ou de outro usuário.

---

### 3.2 `Cartao`

**Descrição:** um flashcard com frente (pergunta) e verso (resposta), mais o estado de repetição espaçada que o servidor mantém para decidir quando o cartão volta a aparecer.

**Consumido por:** ambos

#### Representação

```json
{
  "id": "e41b9d3c-6a72-4f18-b5d0-9c8a2e7f1b63",
  "baralhoId": "c7d2a1f0-8e35-4b6a-a1c9-0f3e5d7b2a48",
  "frente": "Passado simples de \"to go\"",
  "verso": "went",
  "facilidade": 2.5,
  "repeticoes": 0,
  "intervaloDias": 0,
  "proximaRevisao": "2026-09-21T14:30:00.000Z",
  "ultimaRevisao": null,
  "createdAt": "2026-09-21T14:30:00.000Z",
  "updatedAt": "2026-09-21T14:30:00.000Z"
}
```

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `id` | uuid | — | Gerado pelo servidor |
| `baralhoId` | uuid | — | Vem do caminho da requisição; não se altera depois de criado |
| `frente` | string (1–500) | sim | Texto da pergunta |
| `verso` | string (1–1000) | sim | Texto da resposta |
| `facilidade` | número decimal | — | Fator de facilidade; começa em `2.5`, mínimo `1.3`; somente leitura |
| `repeticoes` | inteiro | — | Acertos consecutivos; começa em `0`; somente leitura |
| `intervaloDias` | inteiro | — | Intervalo atual entre revisões; começa em `0`; somente leitura |
| `proximaRevisao` | ISO 8601 | — | Cartão novo já nasce pendente (`proximaRevisao` = `createdAt`); somente leitura |
| `ultimaRevisao` | ISO 8601 ou `null` | — | `null` enquanto nunca foi revisado; somente leitura |
| `createdAt`, `updatedAt` | ISO 8601 | — | Gerados pelo servidor |

#### `GET /baralhos/:baralhoId/cartoes`

Lista os cartões de um baralho, ordenados do mais recente para o mais antigo.

| Parâmetro de consulta | Tipo | Descrição |
|---|---|---|
| `page` | número | Página, padrão 1 |
| `limit` | número | Itens por página, padrão 20, máximo 100 |
| `busca` | string | Filtra por texto da frente ou do verso, sem diferenciar maiúsculas |
| `pendentes` | booleano | `true` devolve apenas cartões com `proximaRevisao` menor ou igual a agora |

**Resposta `200`** — objeto paginado conforme a seção 1.4.

| Status | Quando |
|---|---|
| `401` | Token ausente ou inválido |
| `404` | Baralho inexistente ou de outro usuário |

#### `POST /baralhos/:baralhoId/cartoes`

**Requisição**

```json
{
  "frente": "Passado simples de \"to go\"",
  "verso": "went"
}
```

**Resposta `201`** — a representação criada, com o estado inicial descrito acima.

| Status | Quando |
|---|---|
| `400` | `frente` ou `verso` ausente ou fora do tamanho; envio de campo somente leitura |
| `401` | Token ausente ou inválido |
| `404` | Baralho inexistente ou de outro usuário |

#### `GET /cartoes/:id`

**Resposta `200`** — a representação acima.
**Resposta `404`** — cartão inexistente ou de outro usuário.

#### `PATCH /cartoes/:id`

Edita apenas `frente` e/ou `verso`. **Editar o texto não reinicia o progresso** do cartão.

**Resposta `200`** — a representação atualizada.

| Status | Quando |
|---|---|
| `400` | Valor fora das regras de validação; envio de campo somente leitura |
| `401` | Token ausente ou inválido |
| `404` | Cartão inexistente ou de outro usuário |

#### `DELETE /cartoes/:id`

Remove o cartão e o histórico de revisões dele.

**Resposta `204`** — sem corpo.
**Resposta `404`** — cartão inexistente ou de outro usuário.

---

### 3.3 `Revisao`

**Descrição:** registro imutável de uma avaliação feita pelo usuário durante o estudo. Não pode ser editada nem removida diretamente; é criada por `POST /cartoes/:id/revisoes` (seção 4.2) e removida apenas junto com o cartão.

**Consumido por:** ambos (só criação; o histórico alimenta as estatísticas)

#### Representação

```json
{
  "id": "0a9f6d2e-31c8-4e57-8b14-7d5c3a9e0f21",
  "cartaoId": "e41b9d3c-6a72-4f18-b5d0-9c8a2e7f1b63",
  "nota": "bom",
  "intervaloAnteriorDias": 0,
  "intervaloNovoDias": 1,
  "revisadoEm": "2026-09-21T14:35:00.000Z"
}
```

| Campo | Tipo | Observação |
|---|---|---|
| `id` | uuid | Gerado pelo servidor |
| `cartaoId` | uuid | Cartão avaliado |
| `nota` | enum | `errei` \| `dificil` \| `bom` \| `facil` |
| `intervaloAnteriorDias` | inteiro | Intervalo do cartão antes da avaliação |
| `intervaloNovoDias` | inteiro | Intervalo do cartão depois da avaliação |
| `revisadoEm` | ISO 8601 | Momento em que o servidor registrou a avaliação |

---

### 3.4 `Usuario` _(esboço — prioridade Baixa)_

**Descrição:** conta de acesso. Criada por `POST /auth/registro` (estudante) ou por seed (administrador).

**Consumido por:** web

#### `GET /usuarios`

Somente perfil `administrador`. Lista os usuários, paginado (seção 1.4), com `id`, `nome`, `email`, `perfil`, `createdAt`. Nunca devolve a senha nem o hash.

| Status | Quando |
|---|---|
| `200` | Sucesso |
| `401` | Token ausente ou inválido |
| `403` | Perfil `estudante` |

---

## 4. Endpoints de regra de negócio

> Nem tudo é CRUD. Documente aqui os endpoints que executam a lógica própria do domínio — cálculo, transição de estado, geração. São eles que dão substância ao sistema.

### 4.1 `GET /baralhos/:id/estudo`

**O que faz:** devolve a fila de estudo do baralho: os cartões pendentes (`proximaRevisao` menor ou igual a agora), do mais atrasado para o menos atrasado.

**Pré-condições:** o baralho existe e pertence ao usuário.

| Parâmetro de consulta | Tipo | Descrição |
|---|---|---|
| `limite` | número | Máximo de cartões devolvidos, padrão 20, máximo 50 |

**Requisição:** sem corpo.

**Resposta `200`**

```json
{
  "baralhoId": "c7d2a1f0-8e35-4b6a-a1c9-0f3e5d7b2a48",
  "dados": [
    {
      "id": "e41b9d3c-6a72-4f18-b5d0-9c8a2e7f1b63",
      "baralhoId": "c7d2a1f0-8e35-4b6a-a1c9-0f3e5d7b2a48",
      "frente": "Passado simples de \"to go\"",
      "verso": "went",
      "facilidade": 2.5,
      "repeticoes": 0,
      "intervaloDias": 0,
      "proximaRevisao": "2026-09-21T14:30:00.000Z",
      "ultimaRevisao": null,
      "createdAt": "2026-09-21T14:30:00.000Z",
      "updatedAt": "2026-09-21T14:30:00.000Z"
    }
  ],
  "totalPendentes": 7,
  "limite": 20
}
```

`totalPendentes` conta **todos** os cartões pendentes do baralho, mesmo que `dados` traga só `limite` deles. Quando não há nada para estudar, a resposta é `200` com `dados: []` e `totalPendentes: 0` — não é erro.

**Erros específicos**

| Status | Quando |
|---|---|
| `400` | `limite` fora de 1–50 |
| `401` | Token ausente ou inválido |
| `404` | Baralho inexistente ou de outro usuário |

### 4.2 `POST /cartoes/:id/revisoes`

**O que faz:** registra a avaliação que o usuário deu ao cartão e **reagenda o cartão** pelo algoritmo de repetição espaçada (variante do SM-2). A criação da revisão e a atualização do cartão acontecem na mesma transação.

**Pré-condições:** o cartão existe e pertence ao usuário. O cartão **não** precisa estar pendente: revisar antes da hora é aceito e reagenda normalmente.

**Requisição**

```json
{
  "nota": "bom"
}
```

| Campo | Regra |
|---|---|
| `nota` | obrigatório; enum `errei` \| `dificil` \| `bom` \| `facil` |

**Resposta `201`**

```json
{
  "id": "0a9f6d2e-31c8-4e57-8b14-7d5c3a9e0f21",
  "cartaoId": "e41b9d3c-6a72-4f18-b5d0-9c8a2e7f1b63",
  "nota": "bom",
  "intervaloAnteriorDias": 0,
  "intervaloNovoDias": 1,
  "revisadoEm": "2026-09-21T14:35:00.000Z",
  "cartao": {
    "id": "e41b9d3c-6a72-4f18-b5d0-9c8a2e7f1b63",
    "baralhoId": "c7d2a1f0-8e35-4b6a-a1c9-0f3e5d7b2a48",
    "frente": "Passado simples de \"to go\"",
    "verso": "went",
    "facilidade": 2.5,
    "repeticoes": 1,
    "intervaloDias": 1,
    "proximaRevisao": "2026-09-22T14:35:00.000Z",
    "ultimaRevisao": "2026-09-21T14:35:00.000Z",
    "createdAt": "2026-09-21T14:30:00.000Z",
    "updatedAt": "2026-09-21T14:35:00.000Z"
  }
}
```

**Erros específicos**

| Status | Quando |
|---|---|
| `400` | `nota` ausente ou fora do enum |
| `401` | Token ausente ou inválido |
| `404` | Cartão inexistente ou de outro usuário |

**Regra do cálculo.** Sejam `f`, `r` e `i` a `facilidade`, as `repeticoes` e o `intervaloDias` do cartão **antes** da avaliação. Depois dela:

| `nota` | `repeticoes` | `facilidade` | `intervaloDias` |
|---|---|---|---|
| `errei` | `0` | `max(1.3, f − 0.20)` | `1` |
| `dificil` | `r + 1` | `max(1.3, f − 0.15)` | `max(1, round(i × 1.2))` |
| `bom` | `r + 1` | `f` (não muda) | se `r = 0`: `1`; se `r = 1`: `6`; senão `round(i × f)` |
| `facil` | `r + 1` | `f + 0.15` | se `r = 0`: `4`; se `r = 1`: `10`; senão `round(i × f × 1.3)` |

Em todos os casos, `proximaRevisao = revisadoEm + intervaloDias dias` e `ultimaRevisao = revisadoEm`. Onde a fórmula usa `f`, é o valor **antes** da atualização. **O cálculo é feito no servidor** — o cliente exibe o que recebe e nunca o recalcula. O cliente pode mostrar "volta em N dias" usando `cartao.intervaloDias` da resposta.

### 4.3 `GET /estatisticas/resumo` _(prioridade Média)_

**O que faz:** devolve o resumo de progresso do usuário autenticado.

**Requisição:** sem corpo.

**Resposta `200`**

```json
{
  "totalBaralhos": 3,
  "totalCartoes": 120,
  "cartoesPendentes": 18,
  "revisoesHoje": 25,
  "taxaAcertoSemana": 0.82,
  "sequenciaDias": 5
}
```

| Campo | Definição |
|---|---|
| `revisoesHoje` | Revisões registradas no dia atual |
| `taxaAcertoSemana` | Proporção de revisões com nota `bom` ou `facil` nos últimos 7 dias (número entre 0 e 1); `null` se não houve revisão no período |
| `sequenciaDias` | Dias consecutivos, terminando hoje (ou ontem, se hoje ainda não houve revisão), com ao menos uma revisão |

**Decisão:** "dia" nas estatísticas é sempre contado no fuso `America/Sao_Paulo`, independente do cliente.

| Status | Quando |
|---|---|
| `401` | Token ausente ou inválido |

---

## 5. Diferenças de consumo entre os clientes

> Se algum endpoint aceita parâmetros pensados para um cliente específico — um formato reduzido para a lista do mobile, por exemplo — registre aqui. O objetivo é deixar explícito que a API é uma só, com variações declaradas.

| Endpoint | Diferença | Cliente | Motivo |
|---|---|---|---|
| `GET /baralhos/:id/estudo` | Mobile usa `limite=10` (sessões curtas); web usa o padrão (20) | mobile | Estudo em pequenos intervalos, com a tela pequena |
| `GET /baralhos` | Mobile usa `limit=50` e sem paginação visível; web pagina | ambos | Poucos baralhos por usuário; a lista cabe em uma tela rolável |
| `GET /estatisticas/resumo` | Consumido só pelo web no MVP | web | Recorte do mobile (PRD, seção 7) |
| `GET /usuarios` | Consumido só pelo web | web | Tela administrativa |

---

## 6. Como verificar o contrato

> Registre como o grupo confere que a API implementada corresponde a este documento.

- [ ] Coleção de requisições versionada no repositório _(arquivo `.http`, Insomnia, Postman)_
- [ ] Swagger habilitado no backend _(`@nestjs/swagger`)_ — URL: `http://localhost:3000/api`
- [ ] Tipos do cliente web derivados do contrato, em `web/src/types/`
- [ ] Modelos do mobile derivados do contrato, em `mobile/lib/models/`
- [ ] Um cenário de ponta a ponta executado na coleção: registro → login → criar baralho → criar cartão → `GET /estudo` → `POST /revisoes` → conferir `proximaRevisao`

> Se o grupo habilitar o Swagger, este documento continua sendo necessário: o Swagger descreve a API que **existe**, e o contrato descreve a que foi **acordada**. Os dois convergem na entrega final, mas cumprem papéis diferentes durante o projeto.

---

## 7. Histórico de revisões

> Toda mudança de endpoint entra aqui, com a data e quem foi avisado. É este histórico que explica, depois, por que um cliente parou de funcionar.

| Versão | Data | Alteração | Impacto nos clientes |
|---|---|---|---|
| 1.0 | 21/09/2026 | Versão inicial | — |
| | | | |


---

## Anexo A — exemplo preenchido (domínio de biblioteca)

> Este anexo existe para mostrar **a forma**, não o conteúdo. Ele usa o domínio de biblioteca justamente porque ele é o das aulas práticas e **não pode ser o tema do trabalho** — não há como copiar daqui para o seu projeto, só como se orientar pelo nível de detalhe.
>
> Repare no que faz este exemplo funcionar: todo campo tem tipo, toda operação tem os códigos de status que devolve, e as regras que impedem uma operação estão escritas como resposta de erro, não como texto solto. É esse nível que permite alguém implementar o cliente sem perguntar nada.
>
> Apague este anexo do seu contrato depois de preencher o documento.

### A.1 `Livro`

**Descrição:** obra disponível no acervo. Um livro pode ter vários exemplares emprestados ao longo do tempo, mas só um empréstimo ativo por vez.

**Consumido por:** web (cadastro e acervo completo) e mobile (busca e consulta)

#### Representação

```json
{
  "id": "9f1c2b6e-4a7d-4b28-9a4e-2d5f8c1e7b30",
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "isbn": "9788525406958",
  "anoPublicacao": 1899,
  "situacao": "disponivel",
  "createdAt": "2026-03-10T13:02:41.000Z",
  "updatedAt": "2026-03-10T13:02:41.000Z"
}
```

| Campo | Tipo | Obrigatório na criação | Observação |
|---|---|---|---|
| `id` | uuid | — | Gerado pelo servidor |
| `titulo` | string (1–200) | sim | |
| `autor` | string (1–120) | sim | |
| `isbn` | string (13) | sim | Único no acervo |
| `anoPublicacao` | número inteiro | não | Entre 1450 e o ano corrente |
| `situacao` | enum | — | `disponivel` \| `emprestado`; calculada pelo servidor, nunca enviada pelo cliente |
| `createdAt`, `updatedAt` | ISO 8601 | — | Gerados pelo servidor |

#### `GET /livros`

Lista o acervo. Rota autenticada — qualquer perfil.

| Parâmetro de consulta | Tipo | Descrição |
|---|---|---|
| `page` | número | Página, padrão 1 |
| `limit` | número | Itens por página, padrão 20, máximo 100 |
| `busca` | string | Filtra por título ou autor, sem diferenciar maiúsculas |
| `situacao` | enum | `disponivel` ou `emprestado` |

**Resposta `200`**

```json
{
  "dados": [ { "id": "...", "titulo": "Dom Casmurro", "autor": "Machado de Assis", "isbn": "9788525406958", "anoPublicacao": 1899, "situacao": "disponivel", "createdAt": "...", "updatedAt": "..." } ],
  "total": 143,
  "page": 1,
  "limit": 20
}
```

| Status | Quando |
|---|---|
| `200` | Sucesso, mesmo que a lista venha vazia |
| `401` | Token ausente ou inválido |

#### `GET /livros/:id`

**Resposta `200`** — a representação acima.

| Status | Quando |
|---|---|
| `404` | Não existe livro com esse `id` |

#### `POST /livros`

Cadastra um livro. Rota autenticada — **somente perfil `bibliotecario`**.

**Requisição**

```json
{
  "titulo": "Memórias Póstumas de Brás Cubas",
  "autor": "Machado de Assis",
  "isbn": "9788535911503",
  "anoPublicacao": 1881
}
```

**Resposta `201`** — a representação criada, com `situacao` em `disponivel`.

| Status | Quando |
|---|---|
| `400` | Campo obrigatório ausente, ISBN fora do formato, ano fora da faixa |
| `403` | Perfil `leitor` tentando cadastrar |
| `409` | Já existe livro com esse ISBN |

#### `DELETE /livros/:id`

**Resposta `204`** — sem corpo.

| Status | Quando |
|---|---|
| `403` | Perfil `leitor` |
| `404` | Livro inexistente |
| `409` | Livro com empréstimo ativo — devolva antes de remover |

---

### A.2 Endpoint de regra de negócio — devolução

> Este é o tipo de endpoint que sustenta o "lógica além do CRUD". Repare que ele **não** é um `PATCH` genérico: a devolução é uma operação do domínio, com pré-condições próprias, e por isso vira um sub-recurso.

#### `POST /emprestimos/:id/devolucao`

**O que faz:** encerra um empréstimo ativo, devolve o livro ao acervo e calcula a multa por atraso.

**Pré-condições:** o empréstimo existe e está com `situacao` em `ativo`.

**Requisição:** sem corpo.

**Resposta `200`**

```json
{
  "id": "3c8a1f04-77b2-4c19-8e55-a1d9b6f2c084",
  "livroId": "9f1c2b6e-4a7d-4b28-9a4e-2d5f8c1e7b30",
  "dataEmprestimo": "2026-03-01T14:00:00.000Z",
  "dataPrevistaDevolucao": "2026-03-15T14:00:00.000Z",
  "dataDevolucao": "2026-03-18T09:12:00.000Z",
  "diasAtraso": 3,
  "multa": 4.5,
  "situacao": "devolvido"
}
```

| Status | Quando |
|---|---|
| `401` | Token ausente ou inválido |
| `404` | Não existe empréstimo com esse `id` |
| `409` | O empréstimo já foi devolvido |

**Regra do cálculo:** `multa = diasAtraso × 1,50`, com `diasAtraso` contado em dias corridos a partir de `dataPrevistaDevolucao`. Sem atraso, `diasAtraso` é `0` e `multa` é `0`. **O cálculo é feito no servidor** — o cliente exibe o valor que recebe, nunca o recalcula.

---

### A.3 Perfis e permissões do exemplo

| Perfil | Pode | Não pode |
|---|---|---|
| `bibliotecario` | Cadastrar, editar e remover livros; registrar empréstimos e devoluções de qualquer leitor | — |
| `leitor` | Consultar o acervo; ver e devolver os próprios empréstimos | Cadastrar livros; ver empréstimos de outros leitores |

> A coluna "Não pode" não é decorativa: cada linha dela vira um teste de `403` e um caso no guard de autorização.
