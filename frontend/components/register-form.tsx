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

export function RegisterForm({
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
    const nome = formData.get('nome') as string;
    const email = formData.get('email') as string;
    const senha = formData.get('senha') as string;
    const confirmarSenha = formData.get('confirmarSenha') as string;

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      setCarregando(false);
      return;
    }

    try {
      const resposta = await fetch('http://localhost:3000/auth/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.message || 'Erro ao registrar usuário.');
      }

      // Registro bem-sucedido, redireciona para o login
      router.push('/login');
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Seja bem-vindo!</CardTitle>
            <CardDescription>
              Crie sua conta
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
                  <FieldLabel htmlFor="nome">Nome</FieldLabel>
                  <Input
                      id="nome"
                      name="nome"
                      type="text"
                      placeholder="fulano"
                      required
                  />
                </Field>
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
                  </div>
                  <Input
                      id="senha"
                      name="senha"
                      type="password"
                      required
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="confirmarSenha">Confirmar senha</FieldLabel>
                  </div>
                  <Input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type="password"
                      required
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={carregando} className="w-full">
                    {carregando ? 'Criando conta...' : 'Criar conta'}
                  </Button>
                  <FieldDescription className="text-center mt-2">
                    Já possui conta? <a href="/login" className="underline">Fazer login</a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}