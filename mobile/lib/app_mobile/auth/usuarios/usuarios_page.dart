import 'dart:async';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../baralhos/baralhos_page.dart';
import '../dashboard/dashboard_drawer.dart';
import '../estatisticas/estatisticas_page.dart';
import '../estudo/estudo_page.dart';
import 'usuario_detalhe_page.dart';
import 'usuarios_repository.dart';

class UsuariosPage extends StatefulWidget {
  const UsuariosPage({
    super.key,
    required this.accessToken,
    required this.userRole,
    required this.currentUserId,
    this.client,
    this.userName,
    this.userEmail,
  });

  final String accessToken;
  final String? userRole;
  final String? currentUserId;
  final http.Client? client;
  final String? userName;
  final String? userEmail;

  @override
  State<UsuariosPage> createState() => _UsuariosPageState();
}

class _UsuariosPageState extends State<UsuariosPage> {
  late final AdminUsersRepository _repository = AdminUsersRepository(
    client: widget.client,
  );
  AdminUserPageData? _result;
  String? _error;
  bool _isLoading = true;
  bool _isDeleting = false;
  int _page = 1;
  int _pageSize = 20;

  @override
  void initState() {
    super.initState();
    if (widget.userRole == 'administrador') {
      unawaited(_loadUsers());
    } else {
      _isLoading = false;
    }
  }

  @override
  void dispose() {
    _repository.close();
    super.dispose();
  }

  Future<void> _loadUsers() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final result = await _repository.listUsers(
        widget.accessToken,
        page: _page,
        limit: _pageSize,
      );
      if (mounted) setState(() => _result = result);
    } on TimeoutException {
      _setError(
        'A API demorou para responder. Verifique sua conexão e tente novamente.',
      );
    } on http.ClientException {
      _setError(
        'Não foi possível conectar à API. Confira o endereço e se o servidor está ativo.',
      );
    } catch (error) {
      _setError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _setError(String message) {
    if (mounted) setState(() => _error = message);
  }

  void _changePage(int page) {
    setState(() => _page = page);
    unawaited(_loadUsers());
  }

  void _changePageSize(int pageSize) {
    if (pageSize == _pageSize) return;
    setState(() {
      _pageSize = pageSize;
      _page = 1;
      _result = null;
    });
    unawaited(_loadUsers());
  }

  Future<void> _openUser(AdminUser user) async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => UsuarioDetalhePage(
          accessToken: widget.accessToken,
          userId: user.id,
          userRole: widget.userRole,
          currentUserId: widget.currentUserId,
          client: widget.client,
          userName: widget.userName,
          userEmail: widget.userEmail,
        ),
      ),
    );
    if (mounted) unawaited(_loadUsers());
  }

  Future<void> _deleteUser(AdminUser user) async {
    final password = await showDialog<String>(
      context: context,
      builder: (context) => _DeleteUserDialog(user: user),
    );
    if (password == null || password.isEmpty || !mounted) return;

    setState(() {
      _isDeleting = true;
      _error = null;
    });
    try {
      await _repository.deleteUser(
        widget.accessToken,
        user.id,
        password: password,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Usuário excluído com sucesso.')),
      );
      if ((_result?.users.length ?? 0) == 1 && _page > 1) _page -= 1;
      await _loadUsers();
    } on TimeoutException {
      _setError(
        'A API demorou para responder. Verifique sua conexão e tente novamente.',
      );
    } on http.ClientException {
      _setError(
        'Não foi possível conectar à API. Confira o endereço e se o servidor está ativo.',
      );
    } catch (error) {
      _setError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isDeleting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.userRole != 'administrador') {
      return const Scaffold(
        backgroundColor: Color(0xFF09090B),
        body: Center(
          child: Text(
            'Acesso negado.',
            style: TextStyle(color: Color(0xFFF4F4F5)),
          ),
        ),
      );
    }

    final result = _result;
    final totalPages = result == null || result.total == 0
        ? 1
        : (result.total / _pageSize).ceil();
    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      drawer: DashboardDrawer(
        accessToken: widget.accessToken,
        client: widget.client,
        userName: widget.userName,
        userEmail: widget.userEmail,
        userRole: widget.userRole,
        selectedSection: 'Usuários',
        onTapHome: () =>
            Navigator.of(context).popUntil((route) => route.isFirst),
        onTapStudy: () {
          Navigator.pop(context);
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => EstudoPage(
                accessToken: widget.accessToken,
                client: widget.client,
              ),
            ),
          );
        },
        onTapDecks: () {
          Navigator.pop(context);
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => BaralhosPage(
                accessToken: widget.accessToken,
                client: widget.client,
                userName: widget.userName,
                userEmail: widget.userEmail,
                userRole: widget.userRole,
                currentUserId: widget.currentUserId,
              ),
            ),
          );
        },
        onTapStatistics: () {
          Navigator.pop(context);
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => EstatisticasPage(
                accessToken: widget.accessToken,
                client: widget.client,
                userName: widget.userName,
                userEmail: widget.userEmail,
                userRole: widget.userRole,
                currentUserId: widget.currentUserId,
              ),
            ),
          );
        },
      ),
      appBar: AppBar(
        backgroundColor: const Color(0xFF09090B),
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            tooltip: 'Abrir menu',
            icon: const Icon(LucideIcons.menu, color: Color(0xFFF4F4F5)),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: const Text(
          'Usuários',
          style: TextStyle(
            color: Color(0xFFF4F4F5),
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadUsers,
        color: const Color(0xFF09090B),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
          children: [
            const Text(
              'ADMINISTRAÇÃO',
              style: TextStyle(
                color: Color(0xFFA1A1AA),
                fontSize: 12,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Usuários',
              style: TextStyle(
                color: Color(0xFFF4F4F5),
                fontSize: 28,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Contas cadastradas no sistema.',
              style: TextStyle(color: Color(0xFFA1A1AA), fontSize: 14),
            ),
            if (_error != null) ...[
              const SizedBox(height: 16),
              _UsersErrorBanner(message: _error!, onRetry: _loadUsers),
            ],
            const SizedBox(height: 16),
            if (_isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 48),
                child: Center(
                  child: CircularProgressIndicator(color: Color(0xFFF4F4F5)),
                ),
              )
            else if (_error != null)
              const SizedBox.shrink()
            else if (result == null || result.users.isEmpty)
              const _UsersEmptyState()
            else ...[
              Container(
                clipBehavior: Clip.antiAlias,
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF3F3F46)),
                ),
                child: Column(
                  children: [
                    const _UsersTableHeader(),
                    for (var index = 0; index < result.users.length; index++)
                      _UserTile(
                        user: result.users[index],
                        isCurrentUser:
                            result.users[index].id == widget.currentUserId,
                        isDeleting: _isDeleting,
                        showDivider: index < result.users.length - 1,
                        onTap: () => _openUser(result.users[index]),
                        onDelete: () => _deleteUser(result.users[index]),
                      ),
                    const Divider(height: 1, color: Color(0xFF3F3F46)),
                    _UsersPagination(
                      page: _page,
                      pageSize: _pageSize,
                      total: result.total,
                      totalPages: totalPages,
                      isLoading: _isLoading,
                      onPageChange: _changePage,
                      onPageSizeChange: _changePageSize,
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _DeleteUserDialog extends StatefulWidget {
  const _DeleteUserDialog({required this.user});

  final AdminUser user;

  @override
  State<_DeleteUserDialog> createState() => _DeleteUserDialogState();
}

class _DeleteUserDialogState extends State<_DeleteUserDialog> {
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
    backgroundColor: const Color(0xFF18181B),
    title: const Text(
      'Excluir usuário?',
      style: TextStyle(color: Color(0xFFF4F4F5)),
    ),
    content: Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Tem certeza de que deseja excluir ${widget.user.name} (${widget.user.email})? '
          'Os baralhos, cartões e revisões serão apagados permanentemente.',
          style: const TextStyle(color: Color(0xFFA1A1AA)),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _passwordController,
          obscureText: true,
          autofocus: true,
          decoration: const InputDecoration(
            labelText: 'Sua senha de administrador',
            labelStyle: TextStyle(color: Color(0xFFA1A1AA)),
          ),
          style: const TextStyle(color: Color(0xFFF4F4F5)),
          onChanged: (_) => setState(() {}),
        ),
      ],
    ),
    actions: [
      TextButton(
        onPressed: () => Navigator.pop(context),
        child: const Text('Cancelar'),
      ),
      TextButton(
        onPressed: _passwordController.text.isEmpty
            ? null
            : () => Navigator.pop(context, _passwordController.text),
        child: const Text(
          'Confirmar exclusão',
          style: TextStyle(color: Color(0xFFF87171)),
        ),
      ),
    ],
  );
}

class _UsersTableHeader extends StatelessWidget {
  const _UsersTableHeader();

  @override
  Widget build(BuildContext context) => const Padding(
    padding: EdgeInsets.fromLTRB(16, 13, 8, 13),
    child: Row(
      children: [
        Expanded(
          child: Text(
            'Nome · E-mail',
            style: TextStyle(
              color: Color(0xFFA1A1AA),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        SizedBox(
          width: 102,
          child: Text(
            'Tipo',
            style: TextStyle(
              color: Color(0xFFA1A1AA),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        SizedBox(
          width: 44,
          child: Text(
            'Ações',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Color(0xFFA1A1AA),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    ),
  );
}

class _UserTile extends StatelessWidget {
  const _UserTile({
    required this.user,
    required this.isCurrentUser,
    required this.isDeleting,
    required this.showDivider,
    required this.onTap,
    required this.onDelete,
  });

  final AdminUser user;
  final bool isCurrentUser;
  final bool isDeleting;
  final bool showDivider;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) => Column(
    children: [
      InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 8, 12),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFFF4F4F5),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user.email,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFFA1A1AA),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(
                width: 102,
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: _UserRoleBadge(role: user.role),
                ),
              ),
              SizedBox(
                width: 44,
                child: PopupMenuButton<String>(
                  tooltip: 'Ações de ${user.name}',
                  enabled: !isDeleting,
                  padding: EdgeInsets.zero,
                  iconSize: 20,
                  color: const Color(0xFF27272A),
                  onSelected: (action) {
                    if (action == 'delete') onDelete();
                  },
                  itemBuilder: (_) => [
                    PopupMenuItem(
                      value: 'delete',
                      enabled: !isCurrentUser,
                      child: const Row(
                        children: [
                          Icon(
                            LucideIcons.trash2,
                            color: Color(0xFFF87171),
                            size: 18,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Excluir usuário',
                            style: TextStyle(color: Color(0xFFF87171)),
                          ),
                        ],
                      ),
                    ),
                  ],
                  child: const Icon(
                    LucideIcons.ellipsis,
                    color: Color(0xFFA1A1AA),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      if (showDivider)
        const Divider(height: 1, indent: 16, color: Color(0xFF3F3F46)),
    ],
  );
}

class _UserRoleBadge extends StatelessWidget {
  const _UserRoleBadge({required this.role});

  final String role;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(
      color: role == 'administrador'
          ? const Color(0xFF3F3F46)
          : const Color(0xFF27272A),
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text(
      role == 'administrador' ? 'Administrador' : 'Usuário',
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
      style: const TextStyle(color: Color(0xFFD4D4D8), fontSize: 11),
    ),
  );
}

class _UsersPagination extends StatelessWidget {
  const _UsersPagination({
    required this.page,
    required this.pageSize,
    required this.total,
    required this.totalPages,
    required this.isLoading,
    required this.onPageChange,
    required this.onPageSizeChange,
  });

  final int page;
  final int pageSize;
  final int total;
  final int totalPages;
  final bool isLoading;
  final ValueChanged<int> onPageChange;
  final ValueChanged<int> onPageSizeChange;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(12, 8, 8, 8),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            const Expanded(
              child: Text(
                'Linhas por página',
                style: TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
              ),
            ),
            DropdownButton<int>(
              value: pageSize,
              dropdownColor: const Color(0xFF27272A),
              style: const TextStyle(color: Color(0xFFF4F4F5)),
              underline: const SizedBox.shrink(),
              items: const [10, 20, 50]
                  .map(
                    (size) => DropdownMenuItem<int>(
                      value: size,
                      child: Text('$size'),
                    ),
                  )
                  .toList(),
              onChanged: isLoading
                  ? null
                  : (size) {
                      if (size != null) onPageSizeChange(size);
                    },
            ),
          ],
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            IconButton(
              tooltip: 'Primeira página',
              onPressed: page > 1 && total > 0 && !isLoading
                  ? () => onPageChange(1)
                  : null,
              visualDensity: VisualDensity.compact,
              icon: const Icon(LucideIcons.chevronsLeft),
            ),
            IconButton(
              tooltip: 'Página anterior',
              onPressed: page > 1 && total > 0 && !isLoading
                  ? () => onPageChange(page - 1)
                  : null,
              visualDensity: VisualDensity.compact,
              icon: const Icon(LucideIcons.chevronLeft),
            ),
            SizedBox(
              width: 90,
              child: Text(
                'Página ${total == 0 ? 0 : page} de $totalPages',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
              ),
            ),
            IconButton(
              tooltip: 'Próxima página',
              onPressed: page < totalPages && total > 0 && !isLoading
                  ? () => onPageChange(page + 1)
                  : null,
              visualDensity: VisualDensity.compact,
              icon: const Icon(LucideIcons.chevronRight),
            ),
            IconButton(
              tooltip: 'Última página',
              onPressed: page < totalPages && total > 0 && !isLoading
                  ? () => onPageChange(totalPages)
                  : null,
              visualDensity: VisualDensity.compact,
              icon: const Icon(LucideIcons.chevronsRight),
            ),
          ],
        ),
      ],
    ),
  );
}

class _UsersEmptyState extends StatelessWidget {
  const _UsersEmptyState();

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 48),
    decoration: BoxDecoration(
      color: const Color(0xFF18181B),
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: const Color(0xFF3F3F46)),
    ),
    child: const Text(
      'Nenhum usuário encontrado.',
      textAlign: TextAlign.center,
      style: TextStyle(color: Color(0xFFA1A1AA)),
    ),
  );
}

class _UsersErrorBanner extends StatelessWidget {
  const _UsersErrorBanner({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: const Color(0xFF2A1010),
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: const Color(0xFF7F1D1D)),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(message, style: const TextStyle(color: Color(0xFFFCA5A5))),
        TextButton(onPressed: onRetry, child: const Text('Tentar novamente')),
      ],
    ),
  );
}
