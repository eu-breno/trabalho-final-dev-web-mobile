import 'dart:async';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../app_login/auth_api.dart';
import 'register_form.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key, this.client});

  final http.Client? client;

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  late final AuthApi _authApi = AuthApi(client: widget.client);
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void dispose() {
    _authApi.close();
    super.dispose();
  }

  Future<void> _register(RegisterCredentials credentials) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      await _authApi.register(
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      );
      if (!mounted) return;
      setState(() {
        _successMessage =
            'Conta criada com sucesso. Agora você já pode entrar.';
      });
    } on TimeoutException {
      _setError(
        'A API demorou para responder. Verifique sua conexão e tente novamente.',
      );
    } on http.ClientException {
      _setError(
        'Não foi possível conectar à API. Confira o endereço e se o servidor está ativo.',
      );
    } on AuthApiException catch (error) {
      _setError(error.message);
    } catch (error) {
      _setError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _setError(String message) {
    if (!mounted) return;
    setState(() => _errorMessage = message);
  }

  void _goToLogin() {
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return RegisterForm(
      onSubmit: _register,
      onLogin: _goToLogin,
      isLoading: _isLoading,
      errorMessage: _errorMessage,
      successMessage: _successMessage,
    );
  }
}
