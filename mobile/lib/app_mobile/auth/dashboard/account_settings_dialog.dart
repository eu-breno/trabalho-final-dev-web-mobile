import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';

import 'account_api.dart';

class AccountSettingsDialog extends StatefulWidget {
  const AccountSettingsDialog({
    super.key,
    required this.accessToken,
    required this.name,
    required this.email,
    this.client,
  });

  final String accessToken;
  final String name;
  final String email;
  final http.Client? client;

  @override
  State<AccountSettingsDialog> createState() => _AccountSettingsDialogState();
}

class _AccountSettingsDialogState extends State<AccountSettingsDialog> {
  late final AccountApi _accountApi = AccountApi(client: widget.client);
  late final TextEditingController _nameController = TextEditingController(
    text: widget.name,
  );
  late final TextEditingController _emailController = TextEditingController(
    text: widget.email,
  );
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isSavingProfile = false;
  bool _isSavingPassword = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void dispose() {
    _accountApi.close();
    _nameController.dispose();
    _emailController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    if (name.length < 2 || email.isEmpty) {
      setState(() {
        _errorMessage = 'Informe um nome e um e-mail válidos.';
        _successMessage = null;
      });
      return;
    }

    setState(() {
      _isSavingProfile = true;
      _errorMessage = null;
      _successMessage = null;
    });
    try {
      final profile = await _accountApi.updateProfile(
        accessToken: widget.accessToken,
        name: name,
        email: email,
      );
      if (!mounted) return;
      _nameController.text = profile.name;
      _emailController.text = profile.email;
      setState(() => _successMessage = 'Dados atualizados com sucesso.');
    } catch (error) {
      if (mounted) setState(() => _errorMessage = _errorText(error));
    } finally {
      if (mounted) setState(() => _isSavingProfile = false);
    }
  }

  Future<void> _savePassword() async {
    final currentPassword = _currentPasswordController.text;
    final newPassword = _newPasswordController.text;
    if (currentPassword.isEmpty || newPassword.length < 8) {
      setState(() {
        _errorMessage = 'A nova senha precisa ter pelo menos 8 caracteres.';
        _successMessage = null;
      });
      return;
    }
    if (newPassword != _confirmPasswordController.text) {
      setState(() {
        _errorMessage = 'A nova senha e a confirmação não coincidem.';
        _successMessage = null;
      });
      return;
    }

    setState(() {
      _isSavingPassword = true;
      _errorMessage = null;
      _successMessage = null;
    });
    try {
      await _accountApi.updatePassword(
        accessToken: widget.accessToken,
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
      if (!mounted) return;
      _currentPasswordController.clear();
      _newPasswordController.clear();
      _confirmPasswordController.clear();
      setState(() => _successMessage = 'Senha alterada com sucesso.');
    } catch (error) {
      if (mounted) setState(() => _errorMessage = _errorText(error));
    } finally {
      if (mounted) setState(() => _isSavingPassword = false);
    }
  }

  String _errorText(Object error) {
    if (error is AccountApiException) return error.message;
    return 'Não foi possível atualizar sua conta: $error';
  }

  InputDecoration _decoration(String label) => InputDecoration(
    labelText: label,
    filled: true,
    fillColor: const Color(0xFF09090B),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
  );

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: const Color(0xFF18181B),
      title: const Text(
        'Configurações',
        style: TextStyle(color: Color(0xFFF4F4F5)),
      ),
      content: SizedBox(
        width: 420,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Atualize seus dados e senha.',
                style: TextStyle(color: Color(0xFFA1A1AA)),
              ),
              const SizedBox(height: 20),
              _sectionTitle(LucideIcons.user, 'Perfil'),
              const SizedBox(height: 12),
              TextField(
                controller: _nameController,
                maxLength: 120,
                decoration: _decoration('Nome'),
                style: const TextStyle(color: Color(0xFFF4F4F5)),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                maxLength: 180,
                decoration: _decoration('E-mail'),
                style: const TextStyle(color: Color(0xFFF4F4F5)),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: FilledButton(
                  onPressed: _isSavingProfile ? null : _saveProfile,
                  child: Text(
                    _isSavingProfile ? 'Salvando...' : 'Salvar perfil',
                  ),
                ),
              ),
              const SizedBox(height: 20),
              _sectionTitle(LucideIcons.shield, 'Segurança'),
              const SizedBox(height: 12),
              TextField(
                controller: _currentPasswordController,
                obscureText: true,
                decoration: _decoration('Senha atual'),
                style: const TextStyle(color: Color(0xFFF4F4F5)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _newPasswordController,
                obscureText: true,
                decoration: _decoration('Nova senha'),
                style: const TextStyle(color: Color(0xFFF4F4F5)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _confirmPasswordController,
                obscureText: true,
                decoration: _decoration('Confirmar nova senha'),
                style: const TextStyle(color: Color(0xFFF4F4F5)),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: FilledButton(
                  onPressed: _isSavingPassword ? null : _savePassword,
                  child: Text(
                    _isSavingPassword ? 'Salvando...' : 'Alterar senha',
                  ),
                ),
              ),
              if (_errorMessage != null) ...[
                const SizedBox(height: 12),
                Text(
                  _errorMessage!,
                  style: const TextStyle(color: Color(0xFFF87171)),
                ),
              ],
              if (_successMessage != null) ...[
                const SizedBox(height: 12),
                Text(
                  _successMessage!,
                  style: const TextStyle(color: Color(0xFF86EFAC)),
                ),
              ],
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(
            context,
            AccountProfile(
              name: _nameController.text.trim(),
              email: _emailController.text.trim(),
            ),
          ),
          child: const Text('Fechar'),
        ),
      ],
    );
  }

  Widget _sectionTitle(IconData icon, String title) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFFA1A1AA)),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            color: Color(0xFFF4F4F5),
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
