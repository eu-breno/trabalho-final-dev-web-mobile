import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:mobile/app_mobile/app_login/auth_api.dart';
import 'package:mobile/app_mobile/app_login/session_store.dart';
import 'package:mobile/app_mobile/app_register/register_form.dart';
import 'package:mobile/app_mobile/app_register/register_page.dart';
import 'package:mobile/app_mobile/auth/baralhos/baralhos_page.dart';
import 'package:mobile/app_mobile/auth/dashboard_page.dart';
import 'package:mobile/app_mobile/auth/dashboard/dashboard_drawer.dart';
import 'package:mobile/app_mobile/auth/estudo/estudo_page.dart';
import 'package:mobile/app_mobile/auth/usuarios/usuarios_page.dart';
import 'package:mobile/app_mobile/app_login/login_form.dart';
import 'package:mobile/app_mobile/notifications/study_reminder.dart';
import 'package:mobile/main.dart';
import 'support/fake_daily_reminder_notifications.dart';

void main() {
  testWidgets('menu da conta configura perfil, senha e encerra a sessão', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues({
      SessionStore.accessTokenKey: 'token-da-api',
    });
    final client = MockClient((request) async {
      expect(request.method, 'PATCH');
      expect(request.headers['authorization'], 'Bearer token-da-api');
      switch (request.url.path) {
        case '/auth/perfil':
          expect(
            request.body,
            '{"nome":"Ana Souza Atualizada","email":"ana.nova@example.com"}',
          );
          return http.Response(
            '{"id":"1","nome":"Ana Souza Atualizada","email":"ana.nova@example.com","perfil":"estudante"}',
            200,
          );
        case '/auth/senha':
          expect(
            request.body,
            '{"senhaAtual":"senha-atual","novaSenha":"senha-nova-segura"}',
          );
          return http.Response(
            '{"id":"1","nome":"Ana Souza Atualizada","email":"ana.nova@example.com","perfil":"estudante"}',
            200,
          );
        default:
          fail('Endpoint inesperado: ${request.url.path}');
      }
    });
    addTearDown(client.close);
    final scaffoldKey = GlobalKey<ScaffoldState>();
    final notifications = FakeDailyReminderNotifications();
    final reminderController = StudyReminderController(
      notifications: notifications,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          key: scaffoldKey,
          drawer: DashboardDrawer(
            accessToken: 'token-da-api',
            client: client,
            userName: 'Ana Souza',
            userEmail: 'ana@example.com',
            reminderController: reminderController,
          ),
          body: const SizedBox(),
        ),
      ),
    );

    scaffoldKey.currentState!.openDrawer();
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('Opções da conta'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Configurações'));
    await tester.pumpAndSettle();

    await tester.enterText(
      find.byType(TextField).at(0),
      'Ana Souza Atualizada',
    );
    await tester.enterText(
      find.byType(TextField).at(1),
      'ana.nova@example.com',
    );
    await tester.ensureVisible(find.text('Salvar perfil'));
    await tester.tap(find.text('Salvar perfil'));
    await tester.pumpAndSettle();
    expect(find.text('Dados atualizados com sucesso.'), findsOneWidget);

    await tester.enterText(find.byType(TextField).at(2), 'senha-atual');
    await tester.enterText(find.byType(TextField).at(3), 'senha-nova-segura');
    await tester.enterText(find.byType(TextField).at(4), 'senha-nova-segura');
    await tester.ensureVisible(find.text('Alterar senha'));
    await tester.tap(find.text('Alterar senha'));
    await tester.pumpAndSettle();
    expect(find.text('Senha alterada com sucesso.'), findsOneWidget);

    await tester.tap(find.text('Fechar'));
    await tester.pumpAndSettle();
    expect(find.text('Ana Souza Atualizada'), findsOneWidget);
    await tester.tap(find.byTooltip('Opções da conta'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Sair'));
    await tester.pumpAndSettle();

    expect(await SessionStore().readAccessToken(), isNull);
    expect(notifications.cancellations, 1);
    expect(find.byType(LoginForm), findsOneWidget);
  });

  testWidgets('mostra o formulário de login', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const MeuApp());
    await tester.pumpAndSettle();

    expect(find.text('Memora'), findsOneWidget);
    expect(find.byType(TextField), findsNWidgets(2));
    expect(find.text('Entrar'), findsOneWidget);
    await tester.ensureVisible(find.byKey(const ValueKey('open-register')));
    await tester.tap(find.byKey(const ValueKey('open-register')));
    await tester.pumpAndSettle();
    expect(find.text('Comece sua jornada'), findsOneWidget);
    expect(find.byType(TextFormField), findsNWidgets(4));
  });

  test('persiste e remove o token da sessão', () async {
    SharedPreferences.setMockInitialValues({});
    final sessionStore = SessionStore(
      reminderController: StudyReminderController(
        notifications: FakeDailyReminderNotifications(),
      ),
    );

    await sessionStore.saveAccessToken('token-da-api');
    expect(await sessionStore.readAccessToken(), 'token-da-api');

    await sessionStore.clearAccessToken();
    expect(await sessionStore.readAccessToken(), isNull);
  });

  testWidgets('restaura a dashboard quando existe uma sessão salva', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues({
      SessionStore.accessTokenKey: 'token-da-api',
    });
    final client = MockClient((request) async {
      switch (request.url.path) {
        case '/auth/perfil':
          return http.Response(
            '{"nome":"Ana Souza","email":"ana@example.com"}',
            200,
          );
        case '/estatisticas':
          return http.Response(
            '{"totalBaralhos":0,"totalCartoes":0,"cartoesEstudados":0,"sequenciaDiasAtual":0,"atividadeSemanal":[]}',
            200,
          );
        case '/baralhos':
          return http.Response('[]', 200);
        default:
          fail('Endpoint inesperado: ${request.url.path}');
      }
    });
    addTearDown(client.close);

    await tester.pumpWidget(MeuApp(client: client));
    await tester.pumpAndSettle();

    expect(find.byType(DashboardPage), findsOneWidget);
    final dashboard = tester.widget<DashboardPage>(find.byType(DashboardPage));
    expect(dashboard.accessToken, 'token-da-api');
    expect(find.text('Início'), findsOneWidget);
  });

  testWidgets('cadastro valida os campos e confirma as senhas', (tester) async {
    RegisterCredentials? submitted;
    await tester.pumpWidget(
      MaterialApp(
        home: RegisterForm(
          onSubmit: (credentials) => submitted = credentials,
          onLogin: () {},
          isLoading: false,
          errorMessage: null,
          successMessage: null,
        ),
      ),
    );

    await tester.enterText(find.byType(TextFormField).at(0), 'Ana Souza');
    await tester.enterText(find.byType(TextFormField).at(1), 'ana@example.com');
    await tester.enterText(find.byType(TextFormField).at(2), 'senha-segura');
    await tester.enterText(find.byType(TextFormField).at(3), 'senha-diferente');
    await tester.ensureVisible(find.text('Criar conta'));
    await tester.tap(find.text('Criar conta'));
    await tester.pumpAndSettle();

    expect(submitted, isNull);
    expect(find.text('As senhas não coincidem.'), findsOneWidget);

    await tester.enterText(find.byType(TextFormField).at(3), 'senha-segura');
    await tester.ensureVisible(find.text('Criar conta'));
    await tester.tap(find.text('Criar conta'));
    await tester.pumpAndSettle();

    expect(submitted?.name, 'Ana Souza');
    expect(submitted?.email, 'ana@example.com');
    expect(submitted?.password, 'senha-segura');
  });

  testWidgets('cadastro mostra sucesso após salvar na API', (tester) async {
    final client = MockClient((request) async {
      expect(request.method, 'POST');
      expect(request.url.path, '/auth/registro');
      expect(
        request.body,
        '{"nome":"Ana Souza","email":"ana@example.com","senha":"senha-segura"}',
      );
      return http.Response(
        '{"id":"usuario-1","nome":"Ana Souza","email":"ana@example.com","perfil":"estudante"}',
        201,
      );
    });
    addTearDown(client.close);

    await tester.pumpWidget(MaterialApp(home: RegisterPage(client: client)));
    await tester.enterText(find.byType(TextFormField).at(0), 'Ana Souza');
    await tester.enterText(find.byType(TextFormField).at(1), 'ana@example.com');
    await tester.enterText(find.byType(TextFormField).at(2), 'senha-segura');
    await tester.enterText(find.byType(TextFormField).at(3), 'senha-segura');
    await tester.ensureVisible(find.text('Criar conta'));
    await tester.tap(find.text('Criar conta'));
    await tester.pumpAndSettle();

    expect(
      find.text('Conta criada com sucesso. Agora você já pode entrar.'),
      findsOneWidget,
    );
    expect(find.text('Nome'), findsOneWidget);
  });

  test('login envia credenciais e recebe token da API', () async {
    final client = MockClient((request) async {
      expect(request.method, 'POST');
      expect(request.url.path, '/auth/login');
      expect(request.headers['content-type'], 'application/json');
      expect(
        request.body,
        '{"email":"ana@example.com","senha":"senha-segura"}',
      );
      return http.Response('{"accessToken":"token-da-api"}', 200);
    });
    addTearDown(client.close);
    final api = AuthApi(client: client);

    final token = await api.login(
      email: ' ana@example.com ',
      password: 'senha-segura',
    );

    expect(token, 'token-da-api');
    api.close();
  });

  test('cadastro envia os dados ao endpoint de registro', () async {
    final client = MockClient((request) async {
      expect(request.method, 'POST');
      expect(request.url.path, '/auth/registro');
      expect(request.headers['content-type'], 'application/json');
      expect(
        request.body,
        '{"nome":"Ana Souza","email":"ana@example.com","senha":"senha-segura"}',
      );
      return http.Response(
        '{"id":"usuario-1","nome":"Ana Souza","email":"ana@example.com","perfil":"estudante"}',
        201,
      );
    });
    addTearDown(client.close);
    final api = AuthApi(client: client);

    await expectLater(
      api.register(
        name: ' Ana Souza ',
        email: ' ana@example.com ',
        password: 'senha-segura',
      ),
      completes,
    );
    api.close();
  });

  testWidgets('admin lista, consulta e exclui usuários', (tester) async {
    var listRequests = 0;
    var userDeleted = false;
    final client = MockClient((request) async {
      expect(request.headers['authorization'], 'Bearer token-admin');
      if (request.method == 'GET' &&
          request.url.path == '/usuarios' &&
          request.url.queryParameters['page'] == '1') {
        expect(request.url.queryParameters['limit'], anyOf('10', '20'));
        listRequests++;
        return http.Response(
          userDeleted ? '{"dados":[],"total":0,"page":1,"limit":20}' : '{"dados":[{"id":"usuario-2","nome":"Conta de teste","email":"teste@example.com","perfil":"estudante","createdAt":"2026-10-31T12:00:00.000Z"}],"total":1,"page":1,"limit":20}',
          200,
        );
      }
      if (request.method == 'GET' &&
          request.url.path == '/usuarios/usuario-2') {
        return http.Response(
          '{"id":"usuario-2","nome":"Conta de teste","email":"teste@example.com","perfil":"estudante","createdAt":"2026-10-31T12:00:00.000Z","totalBaralhos":1,"totalCartoes":4,"cartoesPendentes":2}',
          200,
        );
      }
      if (request.method == 'GET' &&
          request.url.path == '/usuarios/usuario-2/estatisticas') {
        return http.Response(
          '{"totalBaralhos":1,"totalCartoes":4,"cartoesEstudados":3,"taxaAcertoPorcentagem":67,"sequenciaDiasAtual":2,"periodoFiltro":"semana","atividadeSemanal":[]}',
          200,
        );
      }
      if (request.method == 'GET' &&
          request.url.path == '/usuarios/usuario-2/estatisticas/atividade') {
        return http.Response(
          '[{"data":"2026-10-31","total":2,"acertos":1,"erros":1}]',
          200,
        );
      }
      if (request.method == 'GET' &&
          request.url.path == '/usuarios/usuario-2/baralhos') {
        return http.Response(
          '[{"id":"baralho-1","nome":"Biologia","totalCartoes":4,"cartoesRevisados":2,"retencaoPorcentagem":67}]',
          200,
        );
      }
      if (request.method == 'DELETE' &&
          request.url.path == '/usuarios/usuario-2') {
        expect(request.body, '{"senha":"senha-admin"}');
        userDeleted = true;
        return http.Response('', 204);
      }
      fail('Endpoint inesperado: ${request.method} ${request.url}');
    });
    addTearDown(client.close);

    await tester.pumpWidget(
      MaterialApp(
        home: UsuariosPage(
          accessToken: 'token-admin',
          userRole: 'administrador',
          currentUserId: 'admin-1',
          client: client,
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Usuários'), findsNWidgets(2));
    expect(find.text('Conta de teste'), findsOneWidget);
    expect(find.text('Nome · E-mail'), findsOneWidget);
    expect(find.text('Tipo'), findsOneWidget);
    expect(find.text('Ações'), findsOneWidget);
    expect(listRequests, 1);
    await tester.tap(find.byType(DropdownButton<int>));
    await tester.pumpAndSettle();
    await tester.tap(find.text('10').last);
    await tester.pumpAndSettle();
    expect(listRequests, 2);

    await tester.tap(find.text('Conta de teste'));
    await tester.pumpAndSettle();
    expect(find.text('Detalhes do usuário'), findsOneWidget);
    expect(find.text('Cartas pendentes'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('Atividade de revisão'),
      300,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    expect(find.text('Atividade de revisão'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('Biologia'),
      300,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    expect(find.text('Biologia'), findsOneWidget);

    await tester.tap(find.byTooltip('Voltar para usuários'));
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('Ações de Conta de teste'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Excluir usuário'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), 'senha-admin');
    await tester.pumpAndSettle();
    await tester.tap(find.text('Confirmar exclusão'));
    await tester.pumpAndSettle();

    expect(userDeleted, isTrue);
    expect(find.text('Nenhum usuário encontrado.'), findsOneWidget);
  });

  testWidgets('erro de autorização não aparece como lista vazia', (
    tester,
  ) async {
    final client = MockClient((request) async {
      expect(request.headers['authorization'], 'Bearer token-admin');
      return http.Response('{"statusCode":401,"message":"Unauthorized"}', 401);
    });
    addTearDown(client.close);

    await tester.pumpWidget(
      MaterialApp(
        home: UsuariosPage(
          accessToken: 'token-admin',
          userRole: 'administrador',
          currentUserId: 'admin-1',
          client: client,
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Unauthorized'), findsOneWidget);
    expect(find.text('Nenhum usuário encontrado.'), findsNothing);
  });

  testWidgets('dashboard mostra dados recebidos da API', (tester) async {
    var totalCards = 15;
    var biologyCards = 10;
    var requestCount = 0;
    final client = MockClient((request) async {
      requestCount++;
      expect(request.headers['authorization'], 'Bearer token-de-teste');
      switch (request.url.path) {
        case '/auth/perfil':
          return http.Response(
            '{"id":"1","nome":"Ana Souza","email":"ana@example.com","perfil":"estudante"}',
            200,
          );
        case '/baralhos':
          return http.Response(
            '[{"id":"baralho-1","nome":"Biologia","totalCartoes":$biologyCards,"cartoesPendentes":4},{"id":"baralho-2","nome":"História","totalCartoes":5,"cartoesPendentes":1}]',
            200,
          );
        case '/baralhos/estudo':
          expect(request.url.queryParameters['escopo'], 'pendentes');
          return http.Response(
            '[{"id":"card-pendente","frente":"Cartão pendente","verso":"Resposta do cartão","proximaRevisao":"2020-01-01T00:00:00.000Z"}]',
            200,
          );
        case '/estatisticas/atividade':
          expect(request.headers['authorization'], 'Bearer token-de-teste');
          expect(request.url.queryParameters['dias'], anyOf('7', '30', '90'));
          return http.Response(
            '[{"data":"2026-10-30","total":3,"acertos":2,"erros":1},{"data":"2026-10-31","total":2,"acertos":1,"erros":1}]',
            200,
          );
        case '/estatisticas/baralhos/baralho-1':
          expect(request.headers['authorization'], 'Bearer token-de-teste');
          return http.Response(
            '{"baralhoId":"baralho-1","totalCartoes":$biologyCards,"cartoesRevisados":7,"retencaoPorcentagem":80}',
            200,
          );
        case '/estatisticas/baralhos/baralho-2':
          expect(request.headers['authorization'], 'Bearer token-de-teste');
          return http.Response(
            '{"baralhoId":"baralho-2","totalCartoes":5,"cartoesRevisados":4,"retencaoPorcentagem":75}',
            200,
          );
        case '/estatisticas':
          expect(request.headers['authorization'], 'Bearer token-de-teste');
          expect(
            request.url.queryParameters['periodo'],
            anyOf('geral', 'semana'),
          );
          if (request.url.queryParameters['periodo'] == 'semana') {
            return http.Response(
              '{"totalBaralhos":2,"totalCartoes":15,"cartoesEstudados":8,"taxaAcertoPorcentagem":75,"sequenciaDiasAtual":3,"periodoFiltro":"semana","atividadeSemanal":[]}',
              200,
            );
          }
          return http.Response(
            '{"totalBaralhos":2,"totalCartoes":$totalCards,"cartoesEstudados":8,"taxaAcertoPorcentagem":75,"sequenciaDiasAtual":3,"periodoFiltro":"geral","atividadeSemanal":[{"dia":"Seg","total":2},{"dia":"Ter","total":1},{"dia":"Qua","total":0},{"dia":"Qui","total":0},{"dia":"Sex","total":0},{"dia":"Sáb","total":0},{"dia":"Dom","total":0}]}',
            200,
          );
        default:
          fail('Endpoint inesperado: ${request.url.path}');
      }
    });
    addTearDown(client.close);

    await tester.pumpWidget(
      MaterialApp(
        home: DashboardPage(accessToken: 'token-de-teste', client: client),
      ),
    );
    await tester.pumpAndSettle();

    expect(requestCount, 3);
    expect(find.text('Oi, Ana 👋'), findsOneWidget);
    expect(
      find.text(
        'Você tem 5 cartões esperando pela revisão de hoje. '
        'Revisões curtas ajudam a guardar o conteúdo por mais tempo.',
      ),
      findsOneWidget,
    );
    expect(find.text('15'), findsOneWidget);
    expect(find.text('8'), findsOneWidget);
    expect(find.text('Biologia'), findsOneWidget);
    expect(find.text('10 cartões · 4 para revisar'), findsOneWidget);
    expect(find.text('História'), findsOneWidget);

    totalCards = 16;
    biologyCards = 11;
    expect(find.byTooltip('Atualizar dados'), findsNothing);
    await tester.drag(find.byType(Scrollable).first, const Offset(0, 400));
    await tester.pumpAndSettle();

    expect(requestCount, 6);
    expect(find.text('16'), findsOneWidget);
    expect(find.text('11 cartões · 4 para revisar'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.menu));
    await tester.pumpAndSettle();
    expect(find.text('Memora'), findsOneWidget);
    expect(find.text('Começar a estudar'), findsOneWidget);
    expect(find.text('Ana Souza'), findsOneWidget);
    expect(find.text('ana@example.com'), findsOneWidget);
    expect(find.text('AS'), findsOneWidget);

    expect(find.text('Turmas'), findsNothing);
    expect(find.text('Usuários'), findsNothing);
    expect(requestCount, 6);

    await tester.tap(find.text('Estatísticas'));
    await tester.pumpAndSettle();

    expect(
      find.text('Acompanhe sua evolução com base nas revisões registradas.'),
      findsOneWidget,
    );
    await tester.scrollUntilVisible(
      find.text('Atividade de revisão'),
      300,
      scrollable: find
          .descendant(
            of: find.byType(ListView).last,
            matching: find.byType(Scrollable),
          )
          .first,
    );
    await tester.pumpAndSettle();
    expect(requestCount, 11);
    expect(find.text('Atividade de revisão'), findsOneWidget);
    expect(find.text('Taxa de acerto'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('7/11'),
      300,
      scrollable: find
          .descendant(
            of: find.byType(ListView).last,
            matching: find.byType(Scrollable),
          )
          .first,
    );
    await tester.pumpAndSettle();
    expect(find.text('75%'), findsOneWidget);
    expect(find.text('Biologia'), findsOneWidget);
    expect(find.text('7/11'), findsOneWidget);
    expect(find.text('História'), findsOneWidget);
    expect(find.text('4/5'), findsOneWidget);
    expect(requestCount, 11);

    await tester.tap(find.byTooltip('Abrir menu'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Baralhos'));
    await tester.pumpAndSettle();
    expect(find.text('Meus baralhos'), findsOneWidget);
    expect(find.text('Biologia'), findsOneWidget);
    expect(requestCount, 12);

    await tester.tap(find.byTooltip('Abrir menu'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Começar a estudar'));
    await tester.pumpAndSettle();
    expect(find.text('Cartão pendente'), findsOneWidget);
  });

  testWidgets('cria baralho e cartão na API', (tester) async {
    var cardCreated = false;
    var deckCreated = false;
    final client = MockClient((request) async {
      expect(request.headers['authorization'], 'Bearer token-de-teste');
      if (request.method == 'GET' && request.url.path == '/baralhos') {
        return http.Response(
          deckCreated
              ? '[{"id":"deck-1","nome":"Anatomia","descricao":"Estudo humano","totalCartoes":${cardCreated ? 1 : 0},"cartoesPendentes":${cardCreated ? 1 : 0},"createdAt":"2026-10-31T12:00:00.000Z"}]'
              : '[]',
          200,
        );
      }
      if (request.method == 'POST' && request.url.path == '/baralhos') {
        expect(request.body, '{"nome":"Anatomia","descricao":"Estudo humano"}');
        deckCreated = true;
        return http.Response(
          '{"id":"deck-1","nome":"Anatomia","descricao":"Estudo humano","totalCartoes":0,"cartoesPendentes":0,"createdAt":"2026-10-31T12:00:00.000Z"}',
          201,
        );
      }
      if (request.method == 'GET' && request.url.path == '/baralhos/deck-1') {
        return http.Response(
          '{"id":"deck-1","nome":"Anatomia","descricao":"Estudo humano","totalCartoes":${cardCreated ? 1 : 0},"cartoesPendentes":${cardCreated ? 1 : 0},"createdAt":"2026-10-31T12:00:00.000Z"}',
          200,
        );
      }
      if (request.method == 'GET' &&
          request.url.path == '/baralhos/deck-1/cartoes') {
        return http.Response(
          cardCreated
              ? '[{"id":"card-1","frente":"O que é uma célula?","verso":"A unidade básica da vida.","proximaRevisao":"2099-01-01T00:00:00.000Z"}]'
              : '[]',
          200,
        );
      }
      if (request.method == 'POST' &&
          request.url.path == '/baralhos/deck-1/cartoes') {
        expect(
          request.body,
          '{"frente":"O que é uma célula?","verso":"A unidade básica da vida."}',
        );
        cardCreated = true;
        return http.Response(
          '{"id":"card-1","frente":"O que é uma célula?","verso":"A unidade básica da vida.","proximaRevisao":"2099-01-01T00:00:00.000Z"}',
          201,
        );
      }
      if (request.method == 'GET' &&
          request.url.path == '/baralhos/deck-1/estudo') {
        expect(request.url.queryParameters['escopo'], 'todos');
        return http.Response(
          '[{"id":"card-1","frente":"O que é uma célula?","verso":"A unidade básica da vida.","proximaRevisao":"2099-01-01T00:00:00.000Z"}]',
          200,
        );
      }
      fail('Endpoint inesperado: ${request.method} ${request.url.path}');
    });
    addTearDown(client.close);

    await tester.pumpWidget(
      MaterialApp(
        home: BaralhosPage(accessToken: 'token-de-teste', client: client),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Sua biblioteca está vazia'), findsOneWidget);

    await tester.tap(
      find.widgetWithText(FloatingActionButton, 'Criar baralho'),
    );
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField).at(1), 'Anatomia');
    await tester.enterText(find.byType(TextField).at(2), 'Estudo humano');
    await tester.tap(find.widgetWithText(FilledButton, 'Criar baralho'));
    await tester.pumpAndSettle();

    expect(find.text('Anatomia'), findsOneWidget);
    await tester.tap(find.text('Anatomia'));
    await tester.pumpAndSettle();
    expect(find.text('Este baralho ainda não tem cartões'), findsOneWidget);

    await tester.tap(find.text('Adicionar cartão'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField).at(0), 'O que é uma célula?');
    await tester.enterText(
      find.byType(TextField).at(1),
      'A unidade básica da vida.',
    );
    await tester.tap(find.text('Salvar cartão'));
    await tester.pumpAndSettle();

    expect(find.text('O que é uma célula?'), findsOneWidget);
    expect(find.text('A unidade básica da vida.'), findsOneWidget);
    expect(find.text('1 cartão · 1 pendentes'), findsOneWidget);

    await tester.tap(find.byTooltip('Ações do baralho'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Estudar baralho inteiro'));
    await tester.pumpAndSettle();
    expect(find.text('O que é uma célula?'), findsOneWidget);
    expect(find.text('1 de 1 cartões'), findsOneWidget);
  });

  testWidgets('estuda cartões e registra as avaliações', (tester) async {
    final submittedRatings = <String>[];
    final requestedScopes = <String>[];
    final client = MockClient((request) async {
      expect(request.headers['authorization'], 'Bearer token-de-teste');
      if (request.method == 'GET' &&
          (request.url.path == '/baralhos/deck-1/estudo' ||
              request.url.path == '/baralhos/estudo')) {
        requestedScopes.add(request.url.queryParameters['escopo']!);
        return http.Response(
          request.url.path == '/baralhos/estudo'
              ? '[{"id":"card-pending","frente":"Pergunta pendente","verso":"Resposta pendente","proximaRevisao":"2020-01-01T00:00:00.000Z"}]'
              : '[{"id":"card-1","frente":"Pergunta 1","verso":"Resposta 1","proximaRevisao":"2099-01-01T00:00:00.000Z"},{"id":"card-2","frente":"Pergunta 2","verso":"Resposta 2","proximaRevisao":"2099-01-01T00:00:00.000Z"}]',
          200,
        );
      }
      if (request.method == 'POST' &&
          request.url.path.startsWith('/cartoes/') &&
          request.url.path.endsWith('/revisoes')) {
        final body = jsonDecode(request.body) as Map<String, dynamic>;
        submittedRatings.add(body['nota'] as String);
        return http.Response(
          '{"id":"${request.url.path.split('/')[2]}","frente":"Pergunta","verso":"Resposta","proximaRevisao":"2099-01-01T00:00:00.000Z"}',
          201,
        );
      }
      fail('Endpoint inesperado: ${request.method} ${request.url.path}');
    });
    addTearDown(client.close);

    await tester.pumpWidget(
      MaterialApp(
        home: EstudoPage(
          accessToken: 'token-de-teste',
          deckId: 'deck-1',
          deckName: 'Anatomia',
          scope: 'todos',
          client: client,
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(requestedScopes, ['todos']);
    expect(find.text('Pergunta 1'), findsOneWidget);

    await tester.tap(find.text('Virar cartão'));
    await tester.pumpAndSettle();
    expect(find.text('Resposta 1'), findsOneWidget);
    await tester.tap(find.text('Errei'));
    await tester.ensureVisible(find.text('Enviar avaliação'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Enviar avaliação'));
    await tester.pumpAndSettle();

    expect(find.text('Pergunta 2'), findsOneWidget);
    await tester.tap(find.text('Virar cartão'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Bom'));
    await tester.ensureVisible(find.text('Enviar avaliação'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Enviar avaliação'));
    await tester.pumpAndSettle();

    expect(find.text('Estudo concluído'), findsOneWidget);
    expect(find.text('Você revisou 2 cartões.'), findsOneWidget);
    expect(find.text('Revisar erros (1)'), findsOneWidget);
    expect(submittedRatings, ['errei', 'bom']);

    await tester.tap(find.text('Revisar erros (1)'));
    await tester.pumpAndSettle();
    expect(find.text('Pergunta 1'), findsOneWidget);
    expect(find.text('1 de 1 cartões'), findsOneWidget);

    await tester.pumpWidget(
      MaterialApp(
        home: EstudoPage(
          key: const ValueKey('fila-pendente'),
          accessToken: 'token-de-teste',
          client: client,
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(requestedScopes, ['todos', 'pendentes']);
    expect(find.text('Pergunta pendente'), findsOneWidget);
  });
}
