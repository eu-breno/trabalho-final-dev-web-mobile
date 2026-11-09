import 'dart:async';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../api_config.dart';
import '../baralhos/baralhos_repository.dart';

class EstudoPage extends StatefulWidget {
  const EstudoPage({
    super.key,
    required this.accessToken,
    this.deckId,
    this.deckName,
    this.scope = 'pendentes',
    this.client,
  });

  final String accessToken;
  final String? deckId;
  final String? deckName;
  final String scope;
  final http.Client? client;

  @override
  State<EstudoPage> createState() => _EstudoPageState();
}

class _EstudoPageState extends State<EstudoPage> {
  late final DecksRepository _repository = DecksRepository(
    client: widget.client,
  );
  List<StudyCard> _cards = const [];
  final List<String> _wrongCardIds = [];
  final Map<String, int> _ratings = {
    'errei': 0,
    'dificil': 0,
    'bom': 0,
    'facil': 0,
  };
  bool _isLoading = true;
  bool _isSending = false;
  bool _showAnswer = false;
  bool _isReviewingErrors = false;
  int _index = 0;
  int _reviewed = 0;
  String? _error;
  String? _selectedRating;

  StudyCard? get _currentCard => _index < _cards.length ? _cards[_index] : null;

  bool get _isComplete =>
      !_isLoading && _cards.isNotEmpty && _index >= _cards.length;

  @override
  void initState() {
    super.initState();
    unawaited(_loadQueue());
  }

  @override
  void dispose() {
    _repository.close();
    super.dispose();
  }

  Future<void> _loadQueue() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final cards = await _repository.loadStudyQueue(
        widget.accessToken,
        deckId: widget.deckId,
        scope: widget.scope,
      );
      if (!mounted) return;
      setState(() {
        _cards = cards;
        _index = 0;
        _reviewed = 0;
        _wrongCardIds.clear();
        _ratings.updateAll((_, _) => 0);
        _showAnswer = false;
        _selectedRating = null;
        _isReviewingErrors = false;
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

  Future<void> _submitRating() async {
    final card = _currentCard;
    final rating = _selectedRating;
    if (card == null || rating == null || _isSending) return;
    setState(() {
      _isSending = true;
      _error = null;
    });
    try {
      await _repository.submitRating(widget.accessToken, card.id, rating);
      if (!mounted) return;
      setState(() {
        _ratings[rating] = _ratings[rating]! + 1;
        if (rating == 'errei') _wrongCardIds.add(card.id);
        _reviewed++;
        _index++;
        _showAnswer = false;
        _selectedRating = null;
      });
    } on TimeoutException {
      _setError(
        'A API demorou para responder. Tente enviar sua avaliação novamente.',
      );
    } on http.ClientException {
      _setError(
        'Não foi possível conectar à API (${apiBaseUrl()}). Confira o endereço e se o servidor está ativo.',
      );
    } catch (error) {
      _setError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  Future<void> _confirmExit() async {
    final shouldExit = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF18181B),
        title: const Text(
          'Sair do estudo?',
          style: TextStyle(color: Color(0xFFF4F4F5)),
        ),
        content: const Text(
          'As avaliações enviadas até agora já foram salvas.',
          style: TextStyle(color: Color(0xFFA1A1AA)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Continuar estudando'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Sair'),
          ),
        ],
      ),
    );
    if (shouldExit == true && mounted) Navigator.pop(context);
  }

  void _reviewErrors() {
    final cards = _cards
        .where((card) => _wrongCardIds.contains(card.id))
        .toList();
    if (cards.isEmpty) return;
    setState(() {
      _cards = cards;
      _index = 0;
      _reviewed = 0;
      _wrongCardIds.clear();
      _ratings.updateAll((_, _) => 0);
      _showAnswer = false;
      _selectedRating = null;
      _isReviewingErrors = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final card = _currentCard;
    final progress = _cards.isEmpty
        ? 0.0
        : (_index / _cards.length).clamp(0.0, 1.0);
    final title = widget.deckName ?? 'Estudo';

    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF09090B),
        elevation: 0,
        leading: IconButton(
          tooltip: 'Sair do estudo',
          onPressed: _confirmExit,
          icon: const Icon(LucideIcons.x, color: Color(0xFFF4F4F5)),
        ),
        title: Text(
          title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Color(0xFFF4F4F5),
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      body: SafeArea(
        top: false,
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(color: Color(0xFFF4F4F5)),
              )
            : _error != null && _cards.isEmpty
            ? _StudyMessage(
                title: 'Não foi possível iniciar o estudo',
                message: _error!,
                actionLabel: 'Tentar novamente',
                onAction: _loadQueue,
              )
            : _cards.isEmpty
            ? _StudyMessage(
                title: 'Sem cartões para estudar',
                message: widget.deckId != null
                    ? widget.scope == 'todos'
                          ? 'Este baralho ainda não tem cartões.'
                          : 'Este baralho não tem cartões pendentes agora.'
                    : widget.scope == 'todos'
                    ? 'Você ainda não tem cartões para estudar.'
                    : 'Você não tem cartões pendentes para estudar agora.',
                actionLabel: 'Voltar',
                onAction: () => Navigator.pop(context),
              )
            : _isComplete
            ? _buildResults()
            : card == null
            ? const SizedBox.shrink()
            : _buildStudy(card, progress),
      ),
    );
  }

  Widget _buildStudy(StudyCard card, double progress) {
    final percent = (progress * 100).round();
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
      children: [
        Row(
          children: [
            const Text(
              'Progresso',
              style: TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
            ),
            const Spacer(),
            Text(
              '$percent%',
              style: const TextStyle(
                color: Color(0xFFA1A1AA),
                fontSize: 12,
                fontFeatures: [FontFeature.tabularFigures()],
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 6,
            color: const Color(0xFFF4F4F5),
            backgroundColor: const Color(0xFF27272A),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '${_index + 1} de ${_cards.length} cartões',
          textAlign: TextAlign.right,
          style: const TextStyle(color: Color(0xFF71717A), fontSize: 11),
        ),
        const SizedBox(height: 18),
        Container(
          constraints: const BoxConstraints(minHeight: 280),
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFF18181B),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFF27272A)),
            boxShadow: const [
              BoxShadow(
                color: Color(0x18000000),
                blurRadius: 16,
                offset: Offset(0, 6),
              ),
            ],
          ),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _showAnswer ? 'RESPOSTA' : 'PERGUNTA',
                  style: const TextStyle(
                    color: Color(0xFFA1A1AA),
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 20),
                SelectableText(
                  _showAnswer ? card.back : card.front,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFFF4F4F5),
                    fontSize: 23,
                    fontWeight: FontWeight.w500,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        OutlinedButton(
          onPressed: () => setState(() {
            _showAnswer = !_showAnswer;
            _selectedRating = null;
          }),
          style: OutlinedButton.styleFrom(
            foregroundColor: const Color(0xFFF4F4F5),
            side: const BorderSide(color: Color(0xFF3F3F46)),
            minimumSize: const Size.fromHeight(48),
          ),
          child: Text(_showAnswer ? 'Desvirar cartão' : 'Virar cartão'),
        ),
        const SizedBox(height: 16),
        const Text(
          'Como você se saiu?',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Color(0xFFA1A1AA),
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 10),
        Wrap(
          alignment: WrapAlignment.center,
          spacing: 8,
          runSpacing: 8,
          children: [
            _RatingButton(
              label: 'Errei',
              value: 'errei',
              selected: _selectedRating == 'errei',
              enabled: _showAnswer && !_isSending,
              color: const Color(0xFFF87171),
              onTap: _selectRating,
            ),
            _RatingButton(
              label: 'Difícil',
              value: 'dificil',
              selected: _selectedRating == 'dificil',
              enabled: _showAnswer && !_isSending,
              color: const Color(0xFFFBBF24),
              onTap: _selectRating,
            ),
            _RatingButton(
              label: 'Bom',
              value: 'bom',
              selected: _selectedRating == 'bom',
              enabled: _showAnswer && !_isSending,
              color: const Color(0xFF38BDF8),
              onTap: _selectRating,
            ),
            _RatingButton(
              label: 'Fácil',
              value: 'facil',
              selected: _selectedRating == 'facil',
              enabled: _showAnswer && !_isSending,
              color: const Color(0xFF4ADE80),
              onTap: _selectRating,
            ),
          ],
        ),
        if (_error != null) ...[
          const SizedBox(height: 12),
          Text(
            _error!,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 12),
          ),
        ],
        const SizedBox(height: 18),
        FilledButton(
          onPressed: _selectedRating == null || _isSending
              ? null
              : _submitRating,
          style: FilledButton.styleFrom(
            backgroundColor: const Color(0xFFF4F4F5),
            foregroundColor: const Color(0xFF09090B),
            minimumSize: const Size.fromHeight(50),
          ),
          child: _isSending
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Color(0xFF09090B),
                  ),
                )
              : const Text('Enviar avaliação'),
        ),
      ],
    );
  }

  void _selectRating(String rating) {
    setState(() {
      _selectedRating = rating;
      _error = null;
    });
  }

  Widget _buildResults() {
    final title = _isReviewingErrors
        ? 'Revisão dos erros concluída'
        : 'Estudo concluído';
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFF18181B),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFF27272A)),
          ),
          child: Column(
            children: [
              const Icon(
                LucideIcons.circleCheck,
                color: Color(0xFF4ADE80),
                size: 40,
              ),
              const SizedBox(height: 16),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFFF4F4F5),
                  fontSize: 22,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Você revisou $_reviewed ${_reviewed == 1 ? 'cartão' : 'cartões'}.',
                style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 14),
              ),
              const SizedBox(height: 18),
              Text(
                '${_ratings['errei']} errados · ${_ratings['dificil']} difíceis · ${_ratings['bom']} bons · ${_ratings['facil']} fáceis',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFFA1A1AA),
                  fontSize: 12,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    widget.deckId == null
                        ? 'Voltar ao início'
                        : 'Voltar ao baralho',
                  ),
                ),
              ),
              if (!_isReviewingErrors && _wrongCardIds.isNotEmpty) ...[
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: _reviewErrors,
                    child: Text('Revisar erros (${_wrongCardIds.length})'),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _RatingButton extends StatelessWidget {
  const _RatingButton({
    required this.label,
    required this.value,
    required this.selected,
    required this.enabled,
    required this.color,
    required this.onTap,
  });

  final String label;
  final String value;
  final bool selected;
  final bool enabled;
  final Color color;
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: enabled ? () => onTap(value) : null,
      style: OutlinedButton.styleFrom(
        foregroundColor: selected ? color : const Color(0xFFA1A1AA),
        side: BorderSide(color: selected ? color : const Color(0xFF3F3F46)),
        backgroundColor: selected ? color.withValues(alpha: 0.1) : null,
        minimumSize: const Size(76, 42),
        padding: const EdgeInsets.symmetric(horizontal: 12),
      ),
      child: Text(label),
    );
  }
}

class _StudyMessage extends StatelessWidget {
  const _StudyMessage({
    required this.title,
    required this.message,
    required this.actionLabel,
    required this.onAction,
  });

  final String title;
  final String message;
  final String actionLabel;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              LucideIcons.bookOpen,
              color: Color(0xFFA1A1AA),
              size: 36,
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0xFFF4F4F5),
                fontSize: 20,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0xFFA1A1AA),
                fontSize: 13,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 18),
            FilledButton(onPressed: onAction, child: Text(actionLabel)),
          ],
        ),
      ),
    );
  }
}
