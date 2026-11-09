import 'dart:async';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../api_config.dart';
import '../app_register/register_page.dart';
import '../auth/dashboard_page.dart';
import 'auth_api.dart';
import 'login_form.dart';
import 'session_store.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key, this.sessionStore, this.client});

  final SessionStore? sessionStore;
  final http.Client? client;

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  late final AuthApi _authApi = AuthApi(client: widget.client);
  late final SessionStore _sessionStore = widget.sessionStore ?? SessionStore();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _authApi.close();
    super.dispose();
  }

  Future<void> _login(LoginCredentials credentials) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final accessToken = await _authApi.login(
        email: credentials.email,
        password: credentials.password,
      );
      await _sessionStore.saveAccessToken(accessToken);
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) =>
              DashboardPage(accessToken: accessToken, client: widget.client),
        ),
      );
    } on TimeoutException {
      _showError(
        'A API demorou para responder. Verifique sua conexão e tente novamente.',
      );
    } on http.ClientException {
      _showError(
        'Não foi possível conectar à API (${apiBaseUrl()}). Confira o endereço e se o servidor está ativo.',
      );
    } on AuthApiException catch (error) {
      _showError(error.message);
    } catch (error) {
      _showError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    if (!mounted) return;
    setState(() => _errorMessage = message);
  }

  @override
  Widget build(BuildContext context) {
    return LoginForm(
      onSubmit: _login,
      onRegister: () {
        Navigator.of(
          context,
        ).push(MaterialPageRoute<void>(builder: (_) => const RegisterPage()));
      },
      isLoading: _isLoading,
      errorMessage: _errorMessage,
    );
  }
}
