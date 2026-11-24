import 'dart:async';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../api_config.dart';
import '../dashboard/dashboard_drawer.dart';
import '../estudo/estudo_page.dart';
import '../estatisticas/estatisticas_page.dart';
import 'baralhos_repository.dart';

class BaralhosPage extends StatefulWidget {
  const BaralhosPage({
    super.key,
    required this.accessToken,
    this.client,
    this.userName,
    this.userEmail,
  });

  final String accessToken;
  final http.Client? client;
  final String? userName;
  final String? userEmail;

  @override
  State<BaralhosPage> createState() => _BaralhosPageState();
}

class _BaralhosPageState extends State<BaralhosPage> {
  late final DecksRepository _repository = DecksRepository(
    client: widget.client,
  );
  List<StudyDeck> _decks = const [];
  String? _error;
  bool _isLoading = true;
  bool _isSaving = false;
  String _query = '';

  @override
  void initState() {
    super.initState();
    unawaited(_loadDecks());
  }

  @override
  void dispose() {
    _repository.close();
    super.dispose();
  }

  Future<void> _loadDecks() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final decks = await _repository.listDecks(widget.accessToken);
      if (mounted) setState(() => _decks = decks);
    } on TimeoutException {
      _setError(
        'A API demorou para responder. Verifique sua conexão e tente novamente.',
      );
    } on http.ClientException {
      _setError(
        'Não foi possível conectar à API (${apiBaseUrl()}). Confira o endereço e se o servidor está ativo.',
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

  List<StudyDeck> get _visibleDecks {
    final query = _query.trim().toLowerCase();
    if (query.isEmpty) return _decks;
    return _decks
        .where(
          (deck) =>
              deck.name.toLowerCase().contains(query) ||
              (deck.description?.toLowerCase().contains(query) ?? false),
        )
        .toList();
  }

  Future<void> _createDeck() async {
    final draft = await showDialog<_DeckDraft>(
      context: context,
      builder: (_) => const _DeckFormDialog(),
    );
    if (draft == null || !mounted) return;
    setState(() => _isSaving = true);
    try {
      await _repository.createDeck(
        widget.accessToken,
        name: draft.name,
        description: draft.description,
      );
      if (!mounted) return;
      _showMessage('Baralho criado com sucesso.');
      await _loadDecks();
    } catch (error) {
      _setError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _openDeck(StudyDeck deck) async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => DeckDetailPage(
          accessToken: widget.accessToken,
          deckId: deck.id,
          client: widget.client,
          userName: widget.userName,
          userEmail: widget.userEmail,
        ),
      ),
    );
    if (mounted) unawaited(_loadDecks());
  }

  Future<void> _editDeck(StudyDeck deck) async {
    final draft = await showDialog<_DeckDraft>(
      context: context,
      builder: (_) => _DeckFormDialog(deck: deck),
    );
    if (draft == null || !mounted) return;
    setState(() => _isSaving = true);
    try {
      await _repository.updateDeck(
        widget.accessToken,
        deck.id,
        name: draft.name,
        description: draft.description,
      );
      if (!mounted) return;
      _showMessage('Baralho atualizado com sucesso.');
      await _loadDecks();
    } catch (error) {
      _setError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _deleteDeck(StudyDeck deck) async {
    final confirmed = await _confirmDelete(
      title: 'Excluir baralho?',
      message:
          '“${deck.name}” e todos os cartões dele serão excluídos permanentemente.',
    );
    if (confirmed != true || !mounted) return;
    setState(() => _isSaving = true);
    try {
      await _repository.deleteDeck(widget.accessToken, deck.id);
      if (!mounted) return;
      _showMessage('Baralho excluído com sucesso.');
      await _loadDecks();
    } catch (error) {
      _setError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<bool?> _confirmDelete({
    required String title,
    required String message,
  }) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF18181B),
        title: Text(title, style: const TextStyle(color: Color(0xFFF4F4F5))),
        content: Text(
          message,
          style: const TextStyle(color: Color(0xFFA1A1AA)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text(
              'Excluir',
              style: TextStyle(color: Color(0xFFF87171)),
            ),
          ),
        ],
      ),
    );
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  void _openStatistics() {
    Navigator.pop(context);
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => EstatisticasPage(
          accessToken: widget.accessToken,
          client: widget.client,
          userName: widget.userName,
          userEmail: widget.userEmail,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      drawer: DashboardDrawer(
        accessToken: widget.accessToken,
        client: widget.client,
        userName: widget.userName,
        userEmail: widget.userEmail,
        selectedSection: 'Baralhos',
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
        onTapHome: () =>
            Navigator.of(context).popUntil((route) => route.isFirst),
        onTapStatistics: _openStatistics,
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
          'Baralhos',
          style: TextStyle(
            color: Color(0xFFF4F4F5),
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _isSaving ? null : _createDeck,
        backgroundColor: const Color(0xFFF4F4F5),
        foregroundColor: const Color(0xFF09090B),
        icon: const Icon(Icons.add),
        label: const Text('Criar baralho'),
      ),
      body: RefreshIndicator(
        onRefresh: _loadDecks,
        color: const Color(0xFF09090B),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
          children: [
            const Text(
              'Meus baralhos',
              style: TextStyle(
                color: Color(0xFFF4F4F5),
                fontSize: 28,
                fontWeight: FontWeight.w600,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Organize seus estudos e revise no seu próprio ritmo.',
              style: TextStyle(
                color: Color(0xFFA1A1AA),
                fontSize: 14,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              onChanged: (value) => setState(() => _query = value),
              style: const TextStyle(color: Color(0xFFF4F4F5)),
              decoration: InputDecoration(
                hintText: 'Buscar nos meus baralhos',
                hintStyle: const TextStyle(color: Color(0xFF71717A)),
                prefixIcon: const Icon(
                  LucideIcons.search,
                  color: Color(0xFFA1A1AA),
                  size: 19,
                ),
                filled: true,
                fillColor: const Color(0xFF18181B),
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF27272A)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF27272A)),
                ),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              '${_decks.length} ${_decks.length == 1 ? 'baralho' : 'baralhos'}',
              style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              _ErrorPanel(message: _error!, onRetry: _loadDecks),
            ],
            if (_isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 60),
                child: Center(
                  child: CircularProgressIndicator(color: Color(0xFFF4F4F5)),
                ),
              )
            else if (_visibleDecks.isEmpty)
              _EmptyDecks(hasQuery: _query.trim().isNotEmpty)
            else ...[
              const SizedBox(height: 12),
              for (final deck in _visibleDecks) ...[
                _DeckListCard(
                  deck: deck,
                  onTap: () => _openDeck(deck),
                  onEdit: () => _editDeck(deck),
                  onDelete: () => _deleteDeck(deck),
                ),
                const SizedBox(height: 12),
              ],
            ],
          ],
        ),
      ),
    );
  }
}

class DeckDetailPage extends StatefulWidget {
  const DeckDetailPage({
    super.key,
    required this.accessToken,
    required this.deckId,
    this.client,
    this.userName,
    this.userEmail,
  });

  final String accessToken;
  final String deckId;
  final http.Client? client;
  final String? userName;
  final String? userEmail;

  @override
  State<DeckDetailPage> createState() => _DeckDetailPageState();
}

class _DeckDetailPageState extends State<DeckDetailPage> {
  late final DecksRepository _repository = DecksRepository(
    client: widget.client,
  );
  StudyDeck? _deck;
  List<StudyCard> _cards = const [];
  String? _error;
  bool _isLoading = true;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    unawaited(_loadDeck());
  }

  @override
  void dispose() {
    _repository.close();
    super.dispose();
  }

  Future<void> _loadDeck() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        _repository.getDeck(widget.accessToken, widget.deckId),
        _repository.listCards(widget.accessToken, widget.deckId),
      ]);
      if (!mounted) return;
      setState(() {
        _deck = results[0] as StudyDeck;
        _cards = results[1] as List<StudyCard>;
      });
    } on TimeoutException {
      _setError(
        'A API demorou para responder. Verifique sua conexão e tente novamente.',
      );
    } on http.ClientException {
      _setError(
        'Não foi possível conectar à API (${apiBaseUrl()}). Confira o endereço e se o servidor está ativo.',
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

  Future<void> _saveCard({StudyCard? card}) async {
    final draft = await showDialog<_CardDraft>(
      context: context,
      builder: (_) => _CardFormDialog(card: card),
    );
    if (draft == null || !mounted) return;
    setState(() => _isSaving = true);
    try {
      if (card == null) {
        await _repository.createCard(
          widget.accessToken,
          widget.deckId,
          front: draft.front,
          back: draft.back,
        );
      } else {
        await _repository.updateCard(
          widget.accessToken,
          card.id,
          front: draft.front,
          back: draft.back,
        );
      }
      if (!mounted) return;
      _showMessage(
        card == null
            ? 'Cartão criado com sucesso.'
            : 'Cartão atualizado com sucesso.',
      );
      await _loadDeck();
    } catch (error) {
      _setError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _deleteCard(StudyCard card) async {
    final confirmed = await _confirmDelete(
      title: 'Excluir cartão?',
      message: 'O cartão “${card.front}” será excluído permanentemente.',
    );
    if (confirmed != true || !mounted) return;
    setState(() => _isSaving = true);
    try {
      await _repository.deleteCard(widget.accessToken, card.id);
      if (!mounted) return;
      _showMessage('Cartão excluído com sucesso.');
      await _loadDeck();
    } catch (error) {
      _setError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _editDeck() async {
    final deck = _deck;
    if (deck == null) return;
    final draft = await showDialog<_DeckDraft>(
      context: context,
      builder: (_) => _DeckFormDialog(deck: deck),
    );
    if (draft == null || !mounted) return;
    setState(() => _isSaving = true);
    try {
      final updated = await _repository.updateDeck(
        widget.accessToken,
        deck.id,
        name: draft.name,
        description: draft.description,
      );
      if (!mounted) return;
      setState(() => _deck = updated);
      _showMessage('Baralho atualizado com sucesso.');
    } catch (error) {
      _setError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _deleteDeck() async {
    final deck = _deck;
    if (deck == null) return;
    final confirmed = await _confirmDelete(
      title: 'Excluir baralho?',
      message:
          '“${deck.name}” e todos os cartões dele serão excluídos permanentemente.',
    );
    if (confirmed != true || !mounted) return;
    setState(() => _isSaving = true);
    try {
      await _repository.deleteDeck(widget.accessToken, deck.id);
      if (!mounted) return;
      _showMessage('Baralho excluído com sucesso.');
      Navigator.of(context).pop();
    } catch (error) {
      _setError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<bool?> _confirmDelete({
    required String title,
    required String message,
  }) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF18181B),
        title: Text(title, style: const TextStyle(color: Color(0xFFF4F4F5))),
        content: Text(
          message,
          style: const TextStyle(color: Color(0xFFA1A1AA)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text(
              'Excluir',
              style: TextStyle(color: Color(0xFFF87171)),
            ),
          ),
        ],
      ),
    );
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _startDeckStudy(String scope) async {
    final deck = _deck;
    if (deck == null) return;
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => EstudoPage(
          accessToken: widget.accessToken,
          deckId: deck.id,
          deckName: deck.name,
          scope: scope,
          client: widget.client,
        ),
      ),
    );
    if (mounted) unawaited(_loadDeck());
  }

  @override
  Widget build(BuildContext context) {
    final deck = _deck;
    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      drawer: DashboardDrawer(
        accessToken: widget.accessToken,
        client: widget.client,
        userName: widget.userName,
        userEmail: widget.userEmail,
        selectedSection: 'Baralhos',
        onTapStudy: () {
          Navigator.pop(context);
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => EstudoPage(
                accessToken: widget.accessToken,
                deckId: widget.deckId,
                deckName: _deck?.name,
                scope: 'pendentes',
                client: widget.client,
              ),
            ),
          );
        },
        onTapDecks: () {
          Navigator.pop(context);
          Navigator.of(context).pop();
        },
        onTapHome: () =>
            Navigator.of(context).popUntil((route) => route.isFirst),
        onTapStatistics: () {
          Navigator.pop(context);
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => EstatisticasPage(
                accessToken: widget.accessToken,
                client: widget.client,
                userName: widget.userName,
                userEmail: widget.userEmail,
              ),
            ),
          );
        },
      ),
      appBar: AppBar(
        backgroundColor: const Color(0xFF09090B),
        elevation: 0,
        leading: IconButton(
          tooltip: 'Voltar aos baralhos',
          icon: const Icon(LucideIcons.arrowLeft, color: Color(0xFFF4F4F5)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          deck?.name ?? 'Baralho',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Color(0xFFF4F4F5),
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
        actions: [
          PopupMenuButton<String>(
            tooltip: 'Ações do baralho',
            color: const Color(0xFF27272A),
            onSelected: (action) {
              if (action == 'edit') unawaited(_editDeck());
              if (action == 'delete') unawaited(_deleteDeck());
              if (action == 'study-pending') {
                unawaited(_startDeckStudy('pendentes'));
              }
              if (action == 'study-all') {
                unawaited(_startDeckStudy('todos'));
              }
            },
            itemBuilder: (_) => const [
              PopupMenuItem(
                value: 'study-pending',
                child: Text(
                  'Estudar cartões pendentes',
                  style: TextStyle(color: Color(0xFFF4F4F5)),
                ),
              ),
              PopupMenuItem(
                value: 'study-all',
                child: Text(
                  'Estudar baralho inteiro',
                  style: TextStyle(color: Color(0xFFF4F4F5)),
                ),
              ),
              PopupMenuDivider(),
              PopupMenuItem(
                value: 'edit',
                child: Text(
                  'Editar baralho',
                  style: TextStyle(color: Color(0xFFF4F4F5)),
                ),
              ),
              PopupMenuItem(
                value: 'delete',
                child: Text(
                  'Excluir baralho',
                  style: TextStyle(color: Color(0xFFF87171)),
                ),
              ),
            ],
          ),
        ],
      ),
      floatingActionButton: deck == null
          ? null
          : FloatingActionButton.extended(
              onPressed: _isSaving ? null : () => _saveCard(),
              backgroundColor: const Color(0xFFF4F4F5),
              foregroundColor: const Color(0xFF09090B),
              icon: const Icon(Icons.add),
              label: const Text('Adicionar cartão'),
            ),
      body: _isLoading && deck == null
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFF4F4F5)),
            )
          : RefreshIndicator(
              onRefresh: _loadDeck,
              color: const Color(0xFF09090B),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
                children: [
                  if (_error != null) ...[
                    _ErrorPanel(message: _error!, onRetry: _loadDeck),
                    const SizedBox(height: 12),
                  ],
                  if (deck != null) ...[
                    _DeckSummary(deck: deck),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        const Icon(
                          LucideIcons.bookCopy,
                          color: Color(0xFFA1A1AA),
                          size: 19,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Cartões deste baralho (${_cards.length})',
                            style: const TextStyle(
                              color: Color(0xFFF4F4F5),
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (_isLoading)
                      const Padding(
                        padding: EdgeInsets.all(24),
                        child: Center(
                          child: CircularProgressIndicator(
                            color: Color(0xFFF4F4F5),
                          ),
                        ),
                      )
                    else if (_cards.isEmpty)
                      const _EmptyCards()
                    else
                      for (final card in _cards) ...[
                        _StudyCardTile(
                          card: card,
                          onEdit: () => _saveCard(card: card),
                          onDelete: () => _deleteCard(card),
                        ),
                        const SizedBox(height: 10),
                      ],
                  ],
                ],
              ),
            ),
    );
  }
}

class _DeckSummary extends StatelessWidget {
  const _DeckSummary({required this.deck});

  final StudyDeck deck;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFF27272A),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  LucideIcons.bookCopy,
                  color: Color(0xFFF4F4F5),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'SEU BARALHO',
                style: TextStyle(
                  color: Color(0xFFA1A1AA),
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.8,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            deck.name,
            style: const TextStyle(
              color: Color(0xFFF4F4F5),
              fontSize: 24,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            deck.description?.isNotEmpty == true
                ? deck.description!
                : 'Sem descrição',
            style: const TextStyle(
              color: Color(0xFFA1A1AA),
              fontSize: 14,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '${deck.totalCards} ${deck.totalCards == 1 ? 'cartão' : 'cartões'} · ${deck.pendingCards} pendentes',
            style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _StudyCardTile extends StatelessWidget {
  const _StudyCardTile({
    required this.card,
    required this.onEdit,
    required this.onDelete,
  });

  final StudyCard card;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final due = card.isDue;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: const Color(0xFF27272A),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  LucideIcons.file,
                  color: Color(0xFFA1A1AA),
                  size: 16,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  card.front,
                  style: const TextStyle(
                    color: Color(0xFFF4F4F5),
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              PopupMenuButton<String>(
                tooltip: 'Ações do cartão',
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 42, minHeight: 42),
                color: const Color(0xFF27272A),
                onSelected: (action) {
                  if (action == 'edit') onEdit();
                  if (action == 'delete') onDelete();
                },
                itemBuilder: (_) => const [
                  PopupMenuItem(
                    value: 'edit',
                    child: Text(
                      'Editar',
                      style: TextStyle(color: Color(0xFFF4F4F5)),
                    ),
                  ),
                  PopupMenuItem(
                    value: 'delete',
                    child: Text(
                      'Excluir',
                      style: TextStyle(color: Color(0xFFF87171)),
                    ),
                  ),
                ],
                child: const Icon(
                  LucideIcons.ellipsisVertical,
                  color: Color(0xFFA1A1AA),
                  size: 18,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            card.back,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Color(0xFFA1A1AA),
              fontSize: 13,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(
                due ? LucideIcons.circleAlert : LucideIcons.circleCheck,
                color: due ? const Color(0xFFF87171) : const Color(0xFF4ADE80),
                size: 15,
              ),
              const SizedBox(width: 6),
              Text(
                due ? 'Pendente' : 'Em dia',
                style: TextStyle(
                  color: due
                      ? const Color(0xFFF87171)
                      : const Color(0xFF4ADE80),
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _EmptyDecks extends StatelessWidget {
  const _EmptyDecks({required this.hasQuery});

  final bool hasQuery;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 52),
      child: Column(
        children: [
          const Icon(LucideIcons.bookCopy, color: Color(0xFF71717A), size: 32),
          const SizedBox(height: 12),
          Text(
            hasQuery
                ? 'Nenhum baralho encontrado'
                : 'Sua biblioteca está vazia',
            style: const TextStyle(
              color: Color(0xFFF4F4F5),
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            hasQuery
                ? 'Tente outro termo ou palavra-chave.'
                : 'Crie um baralho para organizar seus estudos.',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 13),
          ),
        ],
      ),
    );
  }
}

class _EmptyCards extends StatelessWidget {
  const _EmptyCards();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF3F3F46)),
      ),
      child: const Column(
        children: [
          Icon(LucideIcons.file, color: Color(0xFF71717A), size: 28),
          SizedBox(height: 10),
          Text(
            'Este baralho ainda não tem cartões',
            style: TextStyle(
              color: Color(0xFFF4F4F5),
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: 5),
          Text(
            'Adicione o primeiro cartão para começar a estudar.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _DeckListCard extends StatelessWidget {
  const _DeckListCard({
    required this.deck,
    required this.onTap,
    required this.onEdit,
    required this.onDelete,
  });

  final StudyDeck deck;
  final VoidCallback onTap;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFF18181B),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF27272A)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: const Color(0xFF27272A),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  LucideIcons.bookCopy,
                  color: Color(0xFFF4F4F5),
                  size: 18,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      deck.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFFF4F4F5),
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      deck.description?.isNotEmpty == true
                          ? deck.description!
                          : 'Sem descrição',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFFA1A1AA),
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      '${deck.totalCards} cartões · ${deck.pendingCards} pendentes',
                      style: const TextStyle(
                        color: Color(0xFFA1A1AA),
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                tooltip: 'Ações de ${deck.name}',
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 42, minHeight: 42),
                color: const Color(0xFF27272A),
                onSelected: (action) {
                  if (action == 'edit') onEdit();
                  if (action == 'delete') onDelete();
                },
                itemBuilder: (_) => const [
                  PopupMenuItem(
                    value: 'edit',
                    child: Text(
                      'Editar',
                      style: TextStyle(color: Color(0xFFF4F4F5)),
                    ),
                  ),
                  PopupMenuItem(
                    value: 'delete',
                    child: Text(
                      'Excluir',
                      style: TextStyle(color: Color(0xFFF87171)),
                    ),
                  ),
                ],
                child: const Padding(
                  padding: EdgeInsets.all(8),
                  child: Icon(
                    LucideIcons.ellipsisVertical,
                    color: Color(0xFFA1A1AA),
                    size: 18,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DeckDraft {
  const _DeckDraft({required this.name, required this.description});

  final String name;
  final String description;
}

class _DeckFormDialog extends StatefulWidget {
  const _DeckFormDialog({this.deck});

  final StudyDeck? deck;

  @override
  State<_DeckFormDialog> createState() => _DeckFormDialogState();
}

class _DeckFormDialogState extends State<_DeckFormDialog> {
  late final TextEditingController _nameController = TextEditingController(
    text: widget.deck?.name ?? '',
  );
  late final TextEditingController _descriptionController =
      TextEditingController(text: widget.deck?.description ?? '');

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final editing = widget.deck != null;
    return AlertDialog(
      backgroundColor: const Color(0xFF18181B),
      title: Text(
        editing ? 'Editar baralho' : 'Criar baralho',
        style: const TextStyle(color: Color(0xFFF4F4F5)),
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _nameController,
              autofocus: true,
              maxLength: 80,
              style: const TextStyle(color: Color(0xFFF4F4F5)),
              decoration: _fieldDecoration('Nome'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _descriptionController,
              maxLength: 300,
              maxLines: 3,
              style: const TextStyle(color: Color(0xFFF4F4F5)),
              decoration: _fieldDecoration('Descrição (opcional)'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancelar'),
        ),
        FilledButton(
          onPressed: () {
            final name = _nameController.text.trim();
            if (name.isEmpty) return;
            Navigator.pop(
              context,
              _DeckDraft(
                name: name,
                description: _descriptionController.text.trim(),
              ),
            );
          },
          child: Text(editing ? 'Salvar' : 'Criar baralho'),
        ),
      ],
    );
  }
}

class _CardDraft {
  const _CardDraft({required this.front, required this.back});

  final String front;
  final String back;
}

class _CardFormDialog extends StatefulWidget {
  const _CardFormDialog({this.card});

  final StudyCard? card;

  @override
  State<_CardFormDialog> createState() => _CardFormDialogState();
}

class _CardFormDialogState extends State<_CardFormDialog> {
  late final TextEditingController _frontController = TextEditingController(
    text: widget.card?.front ?? '',
  );
  late final TextEditingController _backController = TextEditingController(
    text: widget.card?.back ?? '',
  );

  @override
  void dispose() {
    _frontController.dispose();
    _backController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: const Color(0xFF18181B),
      title: Text(
        widget.card == null ? 'Adicionar cartão' : 'Editar cartão',
        style: const TextStyle(color: Color(0xFFF4F4F5)),
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _frontController,
              autofocus: true,
              maxLength: 500,
              maxLines: 3,
              style: const TextStyle(color: Color(0xFFF4F4F5)),
              decoration: _fieldDecoration('Frente'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _backController,
              maxLength: 1000,
              maxLines: 3,
              style: const TextStyle(color: Color(0xFFF4F4F5)),
              decoration: _fieldDecoration('Verso'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancelar'),
        ),
        FilledButton(
          onPressed: () {
            final front = _frontController.text.trim();
            final back = _backController.text.trim();
            if (front.isEmpty || back.isEmpty) return;
            Navigator.pop(context, _CardDraft(front: front, back: back));
          },
          child: const Text('Salvar cartão'),
        ),
      ],
    );
  }
}

InputDecoration _fieldDecoration(String label) {
  return InputDecoration(
    labelText: label,
    labelStyle: const TextStyle(color: Color(0xFFA1A1AA)),
    counterStyle: const TextStyle(color: Color(0xFF71717A)),
    enabledBorder: const UnderlineInputBorder(
      borderSide: BorderSide(color: Color(0xFF3F3F46)),
    ),
    focusedBorder: const UnderlineInputBorder(
      borderSide: BorderSide(color: Color(0xFFF4F4F5)),
    ),
  );
}

class _ErrorPanel extends StatelessWidget {
  const _ErrorPanel({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
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
            message,
            style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 13),
          ),
          TextButton(onPressed: onRetry, child: const Text('Tentar novamente')),
        ],
      ),
    );
  }
}
