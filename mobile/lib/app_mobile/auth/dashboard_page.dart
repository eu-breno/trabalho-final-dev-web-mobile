import 'dart:async';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../api_config.dart';
import 'dashboard/dashboard_drawer.dart';
import 'dashboard/dashboard_models.dart';
import 'dashboard/dashboard_repository.dart';
import 'dashboard/dashboard_sections.dart';
import 'baralhos/baralhos_page.dart';
import 'estudo/estudo_page.dart';
import 'estatisticas/estatisticas_page.dart';
import 'turmas/turmas_page.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key, required this.accessToken, this.client});

  final String accessToken;
  final http.Client? client;

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage>
    with WidgetsBindingObserver {
  late final DashboardRepository _repository = DashboardRepository(
    client: widget.client,
  );
  DashboardData? _data;
  String? _errorMessage;
  bool _isLoading = false;
  bool _refreshAfterLoad = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    unawaited(_loadDashboard());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _repository.close();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      if (_isLoading) {
        _refreshAfterLoad = true;
      } else {
        unawaited(_loadDashboard());
      }
    }
  }

  Future<void> _loadDashboard() async {
    if (_isLoading) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final data = await _repository.load(widget.accessToken);
      if (!mounted) return;
      setState(() => _data = data);
    } on TimeoutException {
      _setLoadError(
        'A API demorou para responder. Verifique sua conexão e tente novamente.',
      );
    } on http.ClientException {
      _setLoadError(
        'Não foi possível conectar à API (${apiBaseUrl()}). Confira o endereço e se o servidor está ativo.',
      );
    } catch (error) {
      _setLoadError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
        if (_refreshAfterLoad) {
          _refreshAfterLoad = false;
          unawaited(_loadDashboard());
        }
      }
    }
  }

  void _setLoadError(String message) {
    if (!mounted) return;
    setState(() => _errorMessage = message);
  }

  @override
  Widget build(BuildContext context) {
    final data = _data;
    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      drawer: DashboardDrawer(
        accessToken: widget.accessToken,
        client: widget.client,
        userName: data?.fullName,
        userEmail: data?.email,
        onTapStudy: () {
          Navigator.pop(context);
          _startStudy();
        },
        onTapDecks: () {
          Navigator.pop(context);
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => BaralhosPage(
                accessToken: widget.accessToken,
                client: widget.client,
                userName: data?.fullName,
                userEmail: data?.email,
              ),
            ),
          );
        },
        onTapTurmas: () {
          Navigator.pop(context);
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => TurmasPage(
                accessToken: widget.accessToken,
                client: widget.client,
                userName: data?.fullName,
                userEmail: data?.email,
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
                userName: data?.fullName,
                userEmail: data?.email,
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
            icon: const Icon(Icons.menu, color: Color(0xFFF4F4F5)),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: const Text(
          'Início',
          style: TextStyle(
            color: Color(0xFFF4F4F5),
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      body: _isLoading && data == null
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFF4F4F5)),
            )
          : RefreshIndicator(
              onRefresh: _loadDashboard,
              color: const Color(0xFF09090B),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_errorMessage != null) ...[
                      _buildErrorBanner(),
                      const SizedBox(height: 20),
                    ],
                    const Text(
                      'SEU ESPAÇO DE ESTUDOS',
                      style: TextStyle(
                        color: Color(0xFFA1A1AA),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Oi, ${data?.firstName ?? '—'} 👋',
                      style: const TextStyle(
                        color: Color(0xFFF4F4F5),
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Um pouquinho por dia faz uma grande diferença. Vamos estudar?',
                      style: TextStyle(color: Color(0xFFA1A1AA), fontSize: 14),
                    ),
                    const SizedBox(height: 24),
                    DashboardFocusCard(
                      pendingCards: data?.pendingCards,
                      onStartStudy: () => _startStudy(),
                    ),
                    const SizedBox(height: 24),
                    DashboardStatsGrid(stats: data?.stats),
                    const SizedBox(height: 24),
                    DashboardWeeklyActivity(
                      activity: data?.stats.weeklyActivity,
                      isLoading: _isLoading,
                    ),
                    const SizedBox(height: 24),
                    DashboardDecks(decks: data?.decks, isLoading: _isLoading),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildErrorBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF450A0A).withValues(alpha: 0.4),
        border: Border.all(color: Colors.red.shade900),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _errorMessage!,
            style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 13),
          ),
          TextButton(
            onPressed: _isLoading ? null : _loadDashboard,
            child: const Text('Tentar novamente'),
          ),
        ],
      ),
    );
  }

  Future<void> _startStudy() async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) =>
            EstudoPage(accessToken: widget.accessToken, client: widget.client),
      ),
    );
    if (mounted) await _loadDashboard();
  }
}
