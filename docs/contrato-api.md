# Contrato da API

> Este documento descreve manualmente a interface REST implementada pelo backend e consumida pelos clientes. Não há geração automática de OpenAPI ou de clientes.

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
| **Versão do contrato** | 1.4 |
| **Última atualização** | 15/11/2026 |
| **URL base do backend** | `http://localhost:3000` |
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

Este é o formato padrão de erro do NestJS utilizado pelo backend.

`message` é sempre um array quando a causa é validação de campos (`400`) e uma string nos demais casos:

```json
{
  "statusCode": 409,
  "message": "Ja existe um baralho com esse nome",
  "error": "Conflict"
}
```

### 1.4 Paginação

O modelo abaixo vale somente para listagens que o implementam. `GET /usuarios` aceita `page` e `limit` (padrão: `1` e `20`, máximo: `100`) e retorna este objeto. `GET /baralhos` e `GET /baralhos/:baralhoId/cartoes` retornam listas completas, sem objeto paginado.

Exemplo de objeto paginado:

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

- O token é um **JWT** assinado com segredo do servidor (variável de ambiente `JWT_SECRET`).
- Duração: **1 hora**. Não há refresh token. Token expirado resulta em `401`, e o cliente leva o usuário de volta ao login.
- O token contém `sub` (id do usuário) e `perfil`.
- A cada requisição autenticada, `JwtStrategy.validate` consulta o usuário pelo `sub` no banco e usa o `perfil` atual do registro. Token de usuário removido é recusado com `401`; alterações de perfil passam a valer sem esperar o token expirar.
- O backend não expõe endpoint de logout. No cliente web, `POST /api/auth/logout` é tratado pela rota intermediária do Next.js, que apaga o cookie `accessToken`; nos demais clientes, a sessão é descartada localmente.

Requisições autenticadas enviam o token no cabeçalho:

```
Authorization: Bearer <accessToken>
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

**Resposta `200`** — somente o token; os dados do usuário podem ser obtidos em `GET /auth/perfil`.

```json
{
  "accessToken": "token-jwt-assinado"
}
```

**Erros**

| Status | Quando |
|---|---|
| `400` | Corpo inválido |
| `401` | E-mail ou senha incorretos (mesma mensagem nos dois casos, para não revelar qual falhou) |

#### `POST /auth/registro`

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
| `nome` | string, obrigatório, máximo 120 caracteres |
| `email` | e-mail válido, máximo 180 caracteres, obrigatório, único no sistema |
| `senha` | string, mínimo 8 caracteres; máximo de 72 bytes em UTF-8 |

**Resposta `201`** — devolve o usuário público criado, sem token. O cliente chama `POST /auth/login` para obter o JWT.

```json
{
  "id": "5b0e1c7a-2f44-4d0b-9f3e-6a1d8c2b9e10",
  "nome": "Marina Souza",
  "email": "marina@exemplo.com",
  "perfil": "estudante",
  "createdAt": "2026-09-21T14:30:00.000Z",
  "updatedAt": "2026-09-21T14:30:00.000Z"
}
```

| Status | Quando |
|---|---|
| `400` | Campo obrigatório ausente, e-mail inválido, senha fora da faixa |
| `409` | Já existe usuário com esse e-mail |

#### `GET /auth/perfil`

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

#### `PATCH /auth/perfil`

Atualiza nome e/ou e-mail. Envie somente os campos que deseja alterar; a resposta retorna o perfil público atualizado.

```json
{
  "nome": "Marina Souza",
  "email": "marina@exemplo.com"
}
```

| Campo | Regra |
|---|---|
| `nome` | opcional; texto de 2 a 120 caracteres |
| `email` | opcional; e-mail válido de até 180 caracteres |

Retorna `409` se o e-mail já pertencer a outra conta.

#### `PATCH /auth/senha`

Altera a senha somente após validar a senha atual. O servidor armazena apenas o hash.

```json
{
  "senhaAtual": "senhaAtual123",
  "novaSenha": "novaSenhaForte123"
}
```

Ambos os campos são obrigatórios; a nova senha deve ter ao menos 8 caracteres e no máximo 72 bytes em UTF-8. Senha atual incorreta retorna `401`.

### 2.3 Perfis e permissões

| Perfil | Pode | Não pode |
|---|---|---|
| `estudante` | Criar, ver, editar e remover os **próprios** baralhos e cartões; estudar e avaliar cartões próprios; ver as próprias estatísticas | Acessar dados de outros usuários (recebe `404`); listar usuários (recebe `403`) |
| `administrador` | Operações de estudante nos próprios dados; listar usuários; consultar o detalhe, estatísticas, atividade e baralhos de um usuário pelas rotas administrativas; excluir outra conta depois de confirmar a própria senha | Acessar ou alterar baralhos e cartões alheios pelas rotas pessoais; excluir a própria conta |

### 2.4 Armazenamento do token em cada cliente

| Cliente | Onde o token fica | Nível de autenticação | Observação |
|---|---|---|---|
| Web (Next.js) | Cookie `httpOnly`, gravado pelo próprio Next.js após o login | completa | Expiração tratada: `401` leva ao login |
| Mobile (Flutter) | `SharedPreferences` (`memora.accessToken`) | persistida | Login real; a sessão é restaurada ao abrir o app e o logout remove a chave local |

> **Regra inegociável:** sessão simplificada ou simulada no app mobile nunca significa afrouxar a API. Os endpoints continuam protegidos pelo mesmo guard, e o app continua apresentando um token válido em toda requisição autenticada — o que muda é apenas **como** esse token é obtido, não se ele é exigido. Criar uma rota desprotegida só para o app funcionar sem login é falha de segurança, não simplificação aceitável.

---

## 3. Recursos

As subseções a seguir descrevem os recursos e endpoints implementados.

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

**Resposta `200`** — lista completa de baralhos, sem envelope `dados`, `total`, `page` ou `limit`.

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

**Resposta `200`** — lista completa de cartões.

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

#### `POST /cartoes`

Cria um cartão informando `baralhoId` diretamente no corpo.

```json
{
  "baralhoId": "c7d2a1f0-8e35-4b6a-a1c9-0f3e5d7b2a48",
  "frente": "Passado simples de \"to go\"",
  "verso": "went"
}
```

Campos somente leitura não são aceitos. O baralho deve pertencer ao usuário autenticado.

| Status | Quando |
|---|---|
| `201` | Cartão criado |
| `400` | Campo inválido ou ausente |
| `401` | Token ausente ou inválido |
| `404` | Baralho inexistente ou de outro usuário |

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
  "intervaloNovoDias": 3,
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

### 3.4 `Usuario`

**Descrição:** conta de acesso. Criada por `POST /auth/registro` (estudante) ou por seed (administrador).

**Consumido por:** web

#### `GET /usuarios`

Somente perfil `administrador`. Lista os usuários, paginado (seção 1.4), com `id`, `nome`, `email`, `perfil`, `createdAt`. Nunca devolve a senha nem o hash.

| Status | Quando |
|---|---|
| `200` | Sucesso |
| `401` | Token ausente ou inválido |
| `403` | Perfil `estudante` |

#### `GET /usuarios/:id`

Somente perfil `administrador`. Retorna o perfil público do usuário-alvo e as contagens dos seus dados. `:id` deve ser um UUID v4.

**Resposta `200`**

```json
{
  "id": "5b0e1c7a-2f44-4d0b-9f3e-6a1d8c2b9e10",
  "nome": "Marina Souza",
  "email": "marina@exemplo.com",
  "perfil": "estudante",
  "createdAt": "2026-09-21T14:30:00.000Z",
  "totalBaralhos": 3,
  "totalCartoes": 42,
  "cartoesPendentes": 7
}
```

`totalBaralhos` conta os baralhos do usuário; `totalCartoes` conta seus cartões; `cartoesPendentes` conta cartões de todos os seus baralhos cuja `proximaRevisao` seja menor ou igual ao momento da consulta. A resposta nunca inclui senha ou hash.

| Status | Quando |
|---|---|
| `400` | `:id` não é um UUID v4 válido |
| `401` | Token ausente ou inválido |
| `403` | Perfil diferente de `administrador` |
| `404` | Usuário inexistente |

#### `GET /usuarios/:id/estatisticas`

Somente perfil `administrador`. Devolve as mesmas estatísticas de `GET /estatisticas`, mas para o usuário identificado por `:id`. Aceita `periodo=hoje|semana|mes|geral` (padrão: `geral`). `:id` deve ser um UUID v4. A resposta tem o mesmo formato e as mesmas definições de campos documentadas em `GET /estatisticas`.

| Status | Quando |
|---|---|
| `400` | `:id` não é um UUID v4 válido ou `periodo` é inválido |
| `401` | Token ausente ou inválido |
| `403` | Perfil diferente de `administrador` |
| `404` | Usuário inexistente |

#### `GET /usuarios/:id/estatisticas/atividade`

Somente perfil `administrador`. Devolve a mesma série diária de `GET /estatisticas/atividade`, mas para o usuário identificado por `:id`. Aceita `dias=7|30|90` (padrão: `7`). `:id` deve ser um UUID v4.

| Status | Quando |
|---|---|
| `400` | `:id` não é um UUID v4 válido ou `dias` não é 7, 30 ou 90 |
| `401` | Token ausente ou inválido |
| `403` | Perfil diferente de `administrador` |
| `404` | Usuário inexistente |

#### `GET /usuarios/:id/baralhos`

Somente perfil `administrador`. Retorna a lista completa dos baralhos do usuário identificado por `:id`, ordenada por nome, sem envelope de paginação. Cada item inclui os campos de `GET /baralhos` (`id`, `nome`, `descricao`, `totalCartoes`, `cartoesPendentes`, `createdAt`, `updatedAt`) e as métricas por baralho consumidas pela tela de Estatísticas: `cartoesRevisados` e `retencaoPorcentagem`, conforme `GET /estatisticas/baralhos/:baralhoId`. `:id` deve ser um UUID v4.

| Status | Quando |
|---|---|
| `400` | `:id` não é um UUID v4 válido |
| `401` | Token ausente ou inválido |
| `403` | Perfil diferente de `administrador` |
| `404` | Usuário inexistente |

#### `DELETE /usuarios/:id`

Somente perfil `administrador`. Exclui o usuário identificado por `:id` após validar a senha do administrador autenticado. `:id` deve ser um UUID v4.

**Requisição**

```json
{
  "senha": "senhaAtual123"
}
```

`senha` é obrigatória, deve ser uma string não vazia e pode ter no máximo 72 bytes em UTF-8. A senha é verificada no servidor; nunca é devolvida nem armazenada em texto puro.

**Resposta `204`** — sem corpo. A exclusão do usuário remove em cascata seus baralhos, cartões e revisões.

| Status | Quando |
|---|---|
| `400` | Corpo inválido, senha ausente/vazia, senha maior que 72 bytes em UTF-8 ou `:id` não é um UUID v4 válido |
| `401` | Token ausente ou inválido |
| `403` | Perfil diferente de `administrador` ou senha de confirmação incorreta |
| `404` | Usuário-alvo inexistente |
| `409` | O administrador tentou excluir a própria conta |

Senha incorreta retorna `403`, e não `401`, para não acionar no cliente o fluxo de sessão expirada. Autoexclusão retorna `409 Conflict`: a requisição está autenticada e autorizada por perfil, mas conflita com a regra de integridade da operação.

A senha do administrador é comparada antes de verificar a existência do usuário-alvo, para que uma senha inválida não permita usar a rota para enumerar contas. Não há uma regra que impeça a exclusão concorrente do último administrador remanescente.

**Inconsistências e pontos a alinhar com a implementação atual**

- Os controllers preexistentes de baralhos e cartões não usam `ParseUUIDPipe`; as novas rotas administrativas aplicam `ParseUUIDPipe` para UUID v4, conforme documentado.
- O contrato atual descreve limites de tamanho para nomes/descrições de baralhos e frente/verso de cartões que os DTOs existentes não validam integralmente.
- O contrato é mantido em documentação manual e também disponibilizado pelo Swagger/OpenAPI gerado pelo NestJS em `/docs` e `/api`; o JSON pode ser exportado em `/docs-json`.

---

## 4. Endpoints de regra de negócio

> Nem tudo é CRUD. Documente aqui os endpoints que executam a lógica própria do domínio — cálculo, transição de estado, geração. São eles que dão substância ao sistema.

### 4.1 `GET /baralhos/:id/estudo`

**O que faz:** devolve os cartões de uma sessão em sequência. Por padrão, retorna todos os cartões pendentes (`proximaRevisao` menor ou igual a agora), do mais atrasado para o menos atrasado. Também pode retornar todos os cartões do baralho ou um cartão específico.

**Pré-condições:** o baralho existe e pertence ao usuário.

| Parâmetro de consulta | Tipo | Descrição |
|---|---|---|
| `escopo` | `pendentes` \| `todos` | Padrão `pendentes`; `todos` inclui cartões ainda não vencidos |
| `cartaoId` | UUID | Opcional; limita a fila a esse cartão do baralho. Permite revisão individual mesmo antes da data programada |

`cartaoId`, quando informado, seleciona o cartão independentemente de sua data de revisão. O resultado é sempre uma lista JSON de cartões, ordenada por `proximaRevisao` crescente e depois por `id`. A lista não é limitada a 20 cartões. Quando não há cartões correspondentes, a resposta é `200` com `[]`.

**Exemplo de requisição:** `GET /baralhos/:id/estudo?escopo=todos`

**Resposta `200`**

```json
[
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
]
```

**Erros específicos**

| Status | Quando |
|---|---|
| `400` | `escopo` fora de `pendentes`/`todos`, ou `cartaoId` não é um UUID válido |
| `401` | Token ausente ou inválido |
| `404` | Baralho inexistente ou de outro usuário |

### 4.1.1 `GET /baralhos/estudo`

Devolve a fila global de estudos de todos os baralhos do usuário autenticado. Aceita os mesmos parâmetros `escopo` e `cartaoId` definidos em `GET /baralhos/:id/estudo`.

| Status | Quando |
|---|---|
| `200` | Lista encontrada, inclusive `[]` quando não há cartões correspondentes |
| `400` | `escopo` ou `cartaoId` inválido |
| `401` | Token ausente ou inválido |

### 4.2 `POST /cartoes/:id/revisoes`

**O que faz:** registra a avaliação que o usuário deu ao cartão e **reagenda o cartão**. A criação da revisão e a atualização do cartão acontecem na mesma transação; a resposta é o cartão atualizado.

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

**Resposta `201`** — cartão atualizado.

```json
{
  "id": "e41b9d3c-6a72-4f18-b5d0-9c8a2e7f1b63",
  "baralhoId": "c7d2a1f0-8e35-4b6a-a1c9-0f3e5d7b2a48",
  "frente": "Passado simples de \"to go\"",
  "verso": "went",
  "facilidade": 2.5,
  "repeticoes": 1,
  "intervaloDias": 3,
  "proximaRevisao": "2026-09-24T14:35:00.000Z",
  "ultimaRevisao": "2026-09-21T14:35:00.000Z",
  "createdAt": "2026-09-21T14:30:00.000Z",
  "updatedAt": "2026-09-21T14:35:00.000Z"
}
```

**Erros específicos**

| Status | Quando |
|---|---|
| `400` | `nota` ausente ou fora do enum |
| `401` | Token ausente ou inválido |
| `404` | Cartão inexistente ou de outro usuário |

**Regra atualmente implementada.** O backend incrementa `repeticoes`, mantém `facilidade` e escolhe um intervalo fixo:

| `nota` | `repeticoes` | `facilidade` | `intervaloDias` |
|---|---|---|---|
| `errei` | `r + 1` | `f` (não muda) | `0` |
| `dificil` | `r + 1` | `f` (não muda) | `1` |
| `bom` | `r + 1` | `f` (não muda) | `3` |
| `facil` | `r + 1` | `f` (não muda) | `7` |

Em todos os casos, `proximaRevisao` é calculada a partir do instante da revisão e `ultimaRevisao` recebe esse instante. Para `errei`, o intervalo `0` deixa a data vencida imediatamente; a fila de pendentes compara `proximaRevisao <= agora`, então o cartão permanece pendente e pode ser revisado novamente no mesmo dia. **O cálculo é feito no servidor** — o cliente exibe o que recebe e nunca o recalcula.

### 4.3 Estatísticas

#### `GET /estatisticas`

Devolve o resumo do usuário autenticado. Aceita `periodo=hoje|semana|mes|geral`; o padrão é `geral`. A contagem de acertos considera as notas `bom` e `facil`. O dia e a sequência são calculados no fuso `America/Sao_Paulo`.

**Resposta `200`**

```json
{
  "totalBaralhos": 3,
  "totalCartoes": 42,
  "cartoesEstudados": 25,
  "taxaAcertoPorcentagem": 82,
  "sequenciaDiasAtual": 5,
  "periodoFiltro": "semana",
  "atividadeSemanal": [
    { "dia": "Seg", "total": 4 },
    { "dia": "Ter", "total": 3 },
    { "dia": "Qua", "total": 0 },
    { "dia": "Qui", "total": 6 },
    { "dia": "Sex", "total": 2 },
    { "dia": "Sáb", "total": 5 },
    { "dia": "Dom", "total": 5 }
  ]
}
```

| Campo | Definição |
|---|---|
| `totalBaralhos`, `totalCartoes` | Totais do usuário autenticado |
| `cartoesEstudados` | Revisões registradas no período solicitado |
| `taxaAcertoPorcentagem` | Percentual de revisões com nota `bom` ou `facil`; `0` se não houve revisão no período |
| `sequenciaDiasAtual` | Dias consecutivos, terminando hoje (ou ontem, se hoje ainda não houve revisão), com ao menos uma revisão |
| `atividadeSemanal` | Total de revisões em cada dia da semana corrente, de segunda a domingo |

#### `GET /estatisticas/baralhos/:baralhoId`

Retorna `baralhoId`, `totalCartoes`, `cartoesRevisados` (cartões que têm ao menos uma revisão) e `retencaoPorcentagem` (percentual de revisões avaliadas como `bom` ou `facil`). O baralho precisa pertencer ao usuário autenticado.

| Status | Quando |
|---|---|
| `401` | Token ausente ou inválido |
| `404` | Baralho inexistente ou de outro usuário |

#### `GET /estatisticas/atividade`

Retorna uma série diária de revisões para o usuário autenticado. Aceita `dias=7`, `dias=30` ou `dias=90` (padrão: `7`), sempre incluindo os dias sem atividade. `bom` e `facil` contam como acertos; `errei` e `dificil` como erros/não acertados, em linha com a taxa de acerto.

**Resposta `200`**

```json
[
  { "data": "2026-10-18", "total": 3, "acertos": 2, "erros": 1 },
  { "data": "2026-10-19", "total": 0, "acertos": 0, "erros": 0 }
]
```

| Status | Quando |
|---|---|
| `400` | `dias` não é 7, 30 ou 90 |
| `401` | Token ausente ou inválido |

---

## 5. Diferenças de consumo entre os clientes

> Se algum endpoint aceita parâmetros pensados para um cliente específico — um formato reduzido para a lista do mobile, por exemplo — registre aqui. O objetivo é deixar explícito que a API é uma só, com variações declaradas.

| Endpoint | Diferença | Cliente | Motivo |
|---|---|---|---|
| `GET /baralhos/:id/estudo` | Mobile e web usam apenas `escopo`; não há limite fixo implementado nesta rota | mobile | Estudo em pequenos intervalos, com a tela pequena |
| `GET /baralhos` | Nenhum dos dois clientes implementa paginação nesta rota; o backend retorna lista completa | ambos | Poucos baralhos por usuário; a lista cabe em uma tela rolável |
| `GET /estatisticas` | Consumido só pelo web no MVP | web | Recorte do mobile (PRD, seção 7) |
| `GET /usuarios` e demais rotas `/usuarios/:id...` | Consumidas só pelo web | web | Lista administrativa, detalhe e estatísticas |

---

## 6. Como verificar o contrato

- [ ] Coleção de requisições versionada no repositório _(arquivo `.http`, Insomnia, Postman)_; não obrigatório pelo material fornecido
- [x] Swagger habilitado no backend com `@nestjs/swagger`, disponível em `/docs` e `/api`, com JSON em `/docs-json`
- [x] Tipos usados pelo cliente web derivados da implementação e conferidos com o contrato atual
- [x] O mobile contém modelos e repositórios HTTP em `mobile/lib/app_mobile/`; testes usam respostas simuladas e a integração com backend real ainda precisa ser validada
- [ ] PENDENTE: cenário completo de ponta a ponta em PostgreSQL real: registro → login → baralho → cartão → revisão → próxima data. O teste automatizado em contrato foi acrescentado; a execução contra Docker/ambiente real depende do comando documentado no README.

Swagger/OpenAPI é a referência gerada da implementação. A coleção externa continua opcional.

---

## 7. Histórico de revisões

| Versão | Data | Alteração | Impacto nos clientes |
|---|---|---|---|
| 1.0 | 21/09/2026 | Versão inicial | — |
| 1.1 | 18/10/2026 | `GET /baralhos/:id/estudo` aceita `escopo` e `cartaoId`, retornando a fila sem limite fixo | Web pode revisar todos, somente pendentes ou um cartão |
| 1.2 | 24/10/2026 | `PATCH /auth/senha` valida senha atual e recebe `senhaAtual`/`novaSenha`; adicionado `GET /estatisticas/atividade` com períodos de 7, 30 ou 90 dias | Web pode alterar a senha com segurança e exibir atividade diária no gráfico |
| 1.3 | 02/11/2026 | Login, registro, rotas de criação/listagem e estado real do mobile alinhados ao código | Remove divergências documentais; nenhum endpoint novo foi criado nesta revisão |
| 1.4 | 14/11/2026 | Incluídas e implementadas exclusão, detalhe, estatísticas, atividade e baralhos de usuários para administração | Backend e web implementam as operações administrativas; o comportamento e as validações estão descritos nas seções 2 e 3 |
