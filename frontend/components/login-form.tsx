'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
                            className,
                            ...props
                          }: React.ComponentProps<"div">) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const senha = formData.get('senha') as string;

    try {
      const resposta = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.message || 'E-mail ou senha inválidos.');
      }

      // Salva o token de acesso no localStorage do navegador
      localStorage.setItem('accessToken', dados.accessToken);

      // Redireciona o usuário após o login bem-sucedido
      router.push('/dashboard');
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Não foi possível realizar o login.');
    } finally {
      setCarregando(false);
    }
  }

  return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Bem-vindo de volta!</CardTitle>
            <CardDescription>
              Faça login com sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card" />

                {erro && (
                    <div className="text-red-500 text-sm text-center mb-2 font-medium">
                      {erro}
                    </div>
                )}

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="fulano@exemplo.com"
                      required
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="senha">Senha</FieldLabel>
                    <a
                        href="#"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Esqueceu sua senha?
                    </a>
                  </div>
                  <Input
                      id="senha"
                      name="senha"
                      type="password"
                      required
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={carregando} className="w-full">
                    {carregando ? 'Entrando...' : 'Login'}
                  </Button>
                  <FieldDescription className="text-center mt-2">
                    Não possui conta? <a href="/register" className="underline">Criar conta</a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}