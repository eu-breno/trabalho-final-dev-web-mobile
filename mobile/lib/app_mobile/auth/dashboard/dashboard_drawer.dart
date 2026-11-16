import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../app_login/login.dart';
import '../../app_login/session_store.dart';
import 'account_api.dart';
import 'account_settings_dialog.dart';

class DashboardDrawer extends StatefulWidget {
  const DashboardDrawer({
    super.key,
    required this.accessToken,
    this.client,
    this.userName,
    this.userEmail,
    this.userRole,
    this.selectedSection = 'Início',
    this.onTapHome,
    this.onTapStudy,
    this.onTapDecks,
    this.onTapUsers,
    this.onTapStatistics,
  });

  final String accessToken;
  final http.Client? client;
  final String? userName;
  final String? userEmail;
  final String? userRole;
  final String selectedSection;
  final VoidCallback? onTapHome;
  final VoidCallback? onTapStudy;
  final VoidCallback? onTapDecks;
  final VoidCallback? onTapUsers;
  final VoidCallback? onTapStatistics;

  @override
  State<DashboardDrawer> createState() => _DashboardDrawerState();
}

class _DashboardDrawerState extends State<DashboardDrawer> {
  late String? _userName = widget.userName;
  late String? _userEmail = widget.userEmail;
  bool _isLoggingOut = false;

  @override
  void didUpdateWidget(covariant DashboardDrawer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.userName != widget.userName ||
        oldWidget.userEmail != widget.userEmail) {
      _userName = widget.userName;
      _userEmail = widget.userEmail;
    }
  }

  Future<void> _openSettings() async {
    final profile = await showDialog<AccountProfile>(
      context: context,
      builder: (_) => AccountSettingsDialog(
        accessToken: widget.accessToken,
        name: _userName ?? '',
        email: _userEmail ?? '',
        client: widget.client,
      ),
    );
    if (!mounted || profile == null) return;
    setState(() {
      _userName = profile.name;
      _userEmail = profile.email;
    });
  }

  Future<void> _logout() async {
    setState(() => _isLoggingOut = true);
    try {
      await SessionStore().clearAccessToken();
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil<void>(
        MaterialPageRoute<void>(builder: (_) => const LoginPage()),
        (route) => false,
      );
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Não foi possível sair da conta: $error')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoggingOut = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: const Color(0xFF18181B),
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
              child: Row(
                children: [
                  const Icon(
                    LucideIcons.brain,
                    color: Color(0xFFF4F4F5),
                    size: 28,
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Memora',
                    style: TextStyle(
                      color: Color(0xFFF4F4F5),
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: Color(0xFF3F3F46)),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 12),
                children: [
                  _DrawerItem(
                    icon: LucideIcons.play,
                    label: 'Começar a estudar',
                    onTap: widget.onTapStudy ?? () => Navigator.pop(context),
                    primary: true,
                  ),
                  _DrawerItem(
                    icon: LucideIcons.house,
                    label: 'Início',
                    onTap: widget.onTapHome ?? () => Navigator.pop(context),
                    highlighted: widget.selectedSection == 'Início',
                  ),
                  _DrawerItem(
                    icon: LucideIcons.bookCopy,
                    label: 'Baralhos',
                    onTap: widget.onTapDecks ?? () => Navigator.pop(context),
                    muted: widget.selectedSection != 'Baralhos',
                    highlighted: widget.selectedSection == 'Baralhos',
                  ),
                  _DrawerItem(
                    icon: LucideIcons.chartBar,
                    label: 'Estatísticas',
                    onTap:
                        widget.onTapStatistics ?? () => Navigator.pop(context),
                    muted: widget.selectedSection != 'Estatísticas',
                    highlighted: widget.selectedSection == 'Estatísticas',
                  ),
                  if (widget.userRole == 'administrador')
                    _DrawerItem(
                      icon: LucideIcons.users,
                      label: 'Usuários',
                      onTap: widget.onTapUsers ?? () => Navigator.pop(context),
                      muted: widget.selectedSection != 'Usuários',
                      highlighted: widget.selectedSection == 'Usuários',
                    ),
                ],
              ),
            ),
            const Divider(height: 1, color: Color(0xFF3F3F46)),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
              child: Row(
                children: [
                  _UserAvatar(name: _userName),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _userName?.trim().isNotEmpty == true
                              ? _userName!.trim()
                              : 'Conta',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Color(0xFFF4F4F5),
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        if (_userEmail?.trim().isNotEmpty == true)
                          Text(
                            _userEmail!.trim(),
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
                  PopupMenuButton<String>(
                    tooltip: 'Opções da conta',
                    enabled: !_isLoggingOut,
                    color: const Color(0xFF27272A),
                    onSelected: (action) {
                      if (action == 'settings') _openSettings();
                      if (action == 'logout') _logout();
                    },
                    itemBuilder: (_) => [
                      const PopupMenuItem(
                        value: 'settings',
                        child: Row(
                          children: [
                            Icon(
                              LucideIcons.settings,
                              size: 18,
                              color: Color(0xFFF4F4F5),
                            ),
                            SizedBox(width: 10),
                            Text(
                              'Configurações',
                              style: TextStyle(color: Color(0xFFF4F4F5)),
                            ),
                          ],
                        ),
                      ),
                      PopupMenuItem(
                        value: 'logout',
                        child: Row(
                          children: [
                            const Icon(
                              LucideIcons.logOut,
                              size: 18,
                              color: Color(0xFFF87171),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              _isLoggingOut ? 'Saindo...' : 'Sair',
                              style: const TextStyle(color: Color(0xFFF87171)),
                            ),
                          ],
                        ),
                      ),
                    ],
                    icon: const Icon(
                      LucideIcons.ellipsisVertical,
                      color: Color(0xFFA1A1AA),
                      size: 16,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _UserAvatar extends StatelessWidget {
  const _UserAvatar({this.name});

  final String? name;

  @override
  Widget build(BuildContext context) {
    final initials = (name ?? '')
        .trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .take(2)
        .map((part) => part[0])
        .join()
        .toUpperCase();

    return Container(
      width: 36,
      height: 36,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: const Color(0xFF27272A),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        initials.isEmpty ? 'U' : initials,
        style: const TextStyle(
          color: Color(0xFFF4F4F5),
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  const _DrawerItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.muted = false,
    this.highlighted = false,
    this.primary = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool muted;
  final bool highlighted;
  final bool primary;

  @override
  Widget build(BuildContext context) {
    final color = muted ? const Color(0xFFA1A1AA) : const Color(0xFFF4F4F5);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: ListTile(
        leading: Icon(icon, color: primary ? Colors.white : color, size: 18),
        title: Text(
          label,
          style: TextStyle(
            color: primary ? Colors.white : color,
            fontSize: 14,
            fontWeight: primary || highlighted
                ? FontWeight.w500
                : FontWeight.normal,
          ),
        ),
        onTap: onTap,
        minTileHeight: 40,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        tileColor: primary
            ? const Color(0xFF6D28D9)
            : highlighted
            ? const Color(0xFF27272A)
            : null,
      ),
    );
  }
}
