# Mobile

## Login e endereço da API

Inicie o backend na porta `3000` antes de abrir o app. Por padrão, o login usa
`10.0.2.2:3000` no emulador Android e `localhost:3000` no iOS Simulator e Web.

Em um celular Android físico, `localhost` aponta para o próprio celular.
Configure o IP do computador que está executando o backend, na mesma rede Wi-Fi:

```powershell
flutter run --dart-define=API_BASE_URL=http://192.168.1.10:3000
```

Substitua `192.168.1.10` pelo IP local do computador. Para um servidor publicado
ou para iOS em dispositivo físico, use a URL HTTPS da API. Login e dashboard
usam esse mesmo endereço.

O cadastro envia nome, e-mail e senha para `POST /auth/registro`. Após a criação,
o app confirma o sucesso e permite voltar ao login.

O dashboard recarrega os dados ao abrir ou voltar ao app. Também é possível
atualizar pelo botão no topo ou puxando a tela para baixo. Cada baralho mostra
seu total de cartões e quantos estão pendentes de revisão.

O menu lateral também abre **Baralhos**, onde é possível criar, editar, excluir
e buscar baralhos. Ao abrir um baralho, o app lista seus cartões e permite
adicionar, editar ou excluir cartões. Essas operações usam os endpoints
autenticados `baralhos` e `baralhos/:id/cartoes` da API.

O botão **Começar revisão** do dashboard e a opção de estudo do menu iniciam a
fila de cartões pendentes. Em cada baralho, as ações permitem estudar somente
os cartões pendentes ou todos os cartões. Durante o estudo, é possível virar o
cartão, registrar uma avaliação (errei, difícil, bom ou fácil) e revisar os
cartões marcados como errados.

## Administração de usuários

Após entrar com uma conta cujo perfil seja `administrador`, o menu lateral
mostra **Usuários**. A tela consulta as contas cadastradas na API, permite
paginar (10, 20 ou 50 por página) e abrir os detalhes de cada usuário, com
resumo, estatísticas de estudo, atividade de revisão e baralhos. No menu de
ações de uma conta é possível excluí-la após confirmar a senha do administrador;
não é permitido excluir a própria conta.

Essas operações usam as rotas administrativas autenticadas `GET /usuarios`,
`GET /usuarios/:id`, `GET /usuarios/:id/estatisticas`,
`GET /usuarios/:id/estatisticas/atividade`,
`GET /usuarios/:id/baralhos` e `DELETE /usuarios/:id`. O app envia o token da
sessão no cabeçalho `Authorization: Bearer <accessToken>`. O backend valida o
token e exige o perfil de administrador; esconder o item no menu é apenas uma
medida de interface, não substitui essa validação.

A lista, os detalhes, a paginação, a exclusão e a apresentação de erros de
autorização têm cobertura com respostas HTTP simuladas em `flutter test`.
Também foi confirmada manualmente a abertura da lista com uma conta
administradora no app. Essa confirmação não substitui a validação de cada
operação administrativa contra o backend real.
