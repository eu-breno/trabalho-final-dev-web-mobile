import 'package:flutter/material.dart';
import 'app_mobile/app_login/login.dart';

void main() {
  runApp(const MeuApp());
}

class MeuApp extends StatelessWidget {
  const MeuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Memora Mobile',
      debugShowCheckedModeBanner: false,
      home: const LoginPage(),
    );
  }
}