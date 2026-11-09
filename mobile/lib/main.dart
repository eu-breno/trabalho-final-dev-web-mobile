import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'app_mobile/app_login/session_store.dart';
import 'app_mobile/app_login/login.dart';
import 'app_mobile/auth/dashboard_page.dart';

void main() {
  runApp(const MeuApp());
}

class MeuApp extends StatefulWidget {
  const MeuApp({super.key, this.sessionStore, this.client});

  final SessionStore? sessionStore;
  final http.Client? client;

  @override
  State<MeuApp> createState() => _MeuAppState();
}

class _MeuAppState extends State<MeuApp> {
  late final SessionStore _sessionStore = widget.sessionStore ?? SessionStore();
  late Future<String?> _sessionFuture = _sessionStore.readAccessToken();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Memora Mobile',
      debugShowCheckedModeBanner: false,
      home: FutureBuilder<String?>(
        future: _sessionFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }

          if (snapshot.hasError) {
            return Scaffold(
              body: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('Não foi possível restaurar sua sessão.'),
                    const SizedBox(height: 12),
                    FilledButton(
                      onPressed: () {
                        setState(
                          () =>
                              _sessionFuture = _sessionStore.readAccessToken(),
                        );
                      },
                      child: const Text('Tentar novamente'),
                    ),
                  ],
                ),
              ),
            );
          }

          final accessToken = snapshot.data;
          if (accessToken != null) {
            return DashboardPage(
              accessToken: accessToken,
              client: widget.client,
            );
          }

          return LoginPage(sessionStore: _sessionStore, client: widget.client);
        },
      ),
    );
  }
}
