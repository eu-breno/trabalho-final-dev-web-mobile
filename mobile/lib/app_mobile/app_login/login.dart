import 'package:flutter/material.dart';

void main() {
  runApp(const LoginPage());
}

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Cabeçalho / Logo (equivalente ao bloco mobile do Next.js)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: const Color(0xFF27272A), // bg-zinc-800
                          border: Border.all(color: const Color(0xFF3F3F46)), // border-zinc-700
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.psychology, // Ícone que representa o Brain
                          color: Colors.white,
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'Memora',
                        style: TextStyle(
                          color: Color(0xFFF4F4F5), // text-zinc-100
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 40),

                  // Mensagem de boas-vindas inspirada no PRD/visão da página web
                  const Text(
                    'Aprender fica mais fácil quando você volta ao que importa.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Color(0xFFF4F4F5),
                      fontSize: 24,
                      fontWeight: FontWeight.w600,
                      height: 1.25,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Organize seus conteúdos, crie bons hábitos e acompanhe cada conquista no seu ritmo.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Color(0xFFA1A1AA), // text-zinc-400
                      fontSize: 15,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 36),

                  // Campos do Formulário de Login (Simulando o componente LoginForm)
                  TextField(
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      labelText: 'E-mail',
                      labelStyle: const TextStyle(color: Color(0xFFA1A1AA)),
                      filled: true,
                      fillColor: const Color(0xFF18181B), // bg-zinc-900
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Color(0xFF27272A)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Color(0xFF27272A)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Colors.white70),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    obscureText: true,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      labelText: 'Senha',
                      labelStyle: const TextStyle(color: Color(0xFFA1A1AA)),
                      filled: true,
                      fillColor: const Color(0xFF18181B),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Color(0xFF27272A)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Color(0xFF27272A)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Colors.white70),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Botão de Entrar
                  ElevatedButton(
                    onPressed: () {
                      // Ação de login
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF4F4F5),
                      foregroundColor: const Color(0xFF09090B),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text(
                      'Entrar',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Rodapé com os termos de uso
                  const Text(
                    'Ao continuar, você concorda com nossos termos de uso e política de privacidade.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Color(0xFF71717A), // text-zinc-500
                      fontSize: 12,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}