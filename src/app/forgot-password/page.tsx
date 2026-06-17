"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail, ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      }
    );

    if (resetError) {
      setError("Erro ao enviar email de recuperacao. Tente novamente.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500/[0.07] rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-green-500/[0.07] rounded-full blur-3xl animate-float-delayed" />
        </div>
        <Card className="w-full max-w-md relative z-10 glass-strong glow-green-sm shadow-2xl">
          <CardHeader className="text-center space-y-5 pb-2">
            <div className="mx-auto relative">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/25">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl opacity-20 blur-lg -z-10" />
            </div>
            <h1 className="text-xl font-bold">Verifique seu email</h1>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground text-sm">
              Enviamos um link de recuperacao para{" "}
              <strong className="text-foreground">{email}</strong>.
            </p>
            <p className="text-muted-foreground text-sm">
              Clique no link do email para redefinir sua senha.
            </p>
            <Link href="/login">
              <Button
                variant="outline"
                className="w-full mt-4 cursor-pointer h-11 font-semibold hover:bg-accent/80 transition-all"
              >
                Voltar para o login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500/[0.07] rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-green-500/[0.07] rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-teal-400/[0.03] rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 glass-strong glow-green-sm shadow-2xl">
        <CardHeader className="text-center space-y-5 pb-2">
          <div className="mx-auto relative">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/25 rotate-3 hover:rotate-0 transition-transform duration-500">
              <Trophy className="w-9 h-9 text-white drop-shadow-lg" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl opacity-20 blur-lg -z-10" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Esqueci minha senha
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5 font-medium">
              Informe seu email para receber o link de recuperacao
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-muted-foreground uppercase tracking-wide"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-colors"
              />
            </div>
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5">
                <p className="text-sm text-destructive text-center font-medium">
                  {error}
                </p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-12 cursor-pointer font-bold text-base bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading || !email.trim()}
            >
              {loading ? "Enviando..." : "Enviar link de recuperacao"}
            </Button>
          </form>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium w-full justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
