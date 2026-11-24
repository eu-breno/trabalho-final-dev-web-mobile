# Aplicativo mobile

## Executar

Inicie o backend na porta `3000`. No emulador Android, use o endereço da máquina
host:

```powershell
cd mobile
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000
```

Se executar o Flutter Web no Chrome do mesmo computador que hospeda a API, use
`localhost` em vez de `10.0.2.2`:

```powershell
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:3000
```

`10.0.2.2` é um endereço especial do emulador Android; não use esse endereço
no Chrome do computador. Sem `API_BASE_URL`, o app já escolhe `localhost` para
Flutter Web.

Para aparelho físico, troque `10.0.2.2` pelo IP local do computador que executa
a API e use a mesma rede Wi-Fi. Para iOS Simulator, o padrão é
`http://localhost:3000`. A URL pode ser configurada em qualquer destino com
`--dart-define=API_BASE_URL=<URL>`.

O Manifest `debug`/`profile` permite HTTP para desenvolvimento. Para builds de
produção, use HTTPS. Não há dependência de `flutter_dotenv`.

O app oferece login/cadastro, dashboard, baralhos e cartões, fila de estudo,
avaliação espaçada, estatísticas e configurações da conta.

## Lembrete local de cartões pendentes

Nas **Configurações** da conta, o usuário pode ativar ou desativar um lembrete
diário e escolher seu horário. A permissão de notificações só é solicitada ao
ativar; se for negada, uma mensagem explica o motivo e o lembrete permanece
desativado. Ativar de novo após uma negativa pode exigir permitir notificações
nas configurações do sistema.

Revisão espaçada depende de voltar no dia certo; por isso, o lembrete tem uma
função real no produto, ajudando o usuário a manter a rotina de revisão. O app
agenda uma notificação local diária com agendamento inexato. Quando conhece a
quantidade de cartões pendentes, inclui essa contagem; ela é atualizada ao abrir
o app e ao retornar de uma sessão de estudo. Sem número disponível, a mensagem
é genérica. A notificação do sistema não consulta a API sozinha: ela exibe a
última contagem que o app conseguiu agendar. A preferência de ativação/horário
fica em `SharedPreferences`; o logout cancela o agendamento.


## Testes e validação manual do lembrete

Os testes novos de preferência, logout/cancelamento e permissão negada estão em
`test/study_reminder_test.dart`; fakes implementam a interface de notificações.
**Não foram executados nesta máquina**, pois o comando `flutter` não está
disponível. Não há afirmação de validação do novo recurso em aparelho.

Para validar manualmente em um emulador Android:

1. Suba PostgreSQL, backend, migrations e seed conforme o README raiz; crie ou
   use uma conta com cartões pendentes.
2. Inicie o emulador e execute `flutter pub get` e
   `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000`.
3. Entre na conta, abra o menu do usuário e escolha **Configurações**.
4. Ative **Lembrete diário**. No Android 13+, aceite a permissão apresentada;
   escolha um horário alguns minutos à frente e salve.
5. Deixe o app em segundo plano e confira a notificação no horário. O texto
   deve conter a contagem carregada pelo app. Abra o dashboard e conclua uma
   sessão de estudo para o app buscar a contagem atualizada e reagendar.
6. Desative o lembrete e confirme que a notificação agendada é cancelada.
   Ative novamente em uma instalação de teste e negue a permissão: a opção deve
   permanecer desligada e a mensagem deve orientar a permitir notificações.
7. Ative o lembrete, saia da conta e confira que o agendamento foi cancelado.
   O receiver Android também permite verificar o reagendamento pelo sistema
   depois de reiniciar o aparelho.

No iOS, a permissão é apresentada pelo sistema quando o usuário ativa o
lembrete; uma chave de propósito no `Info.plist` não é necessária para
notificações locais.
