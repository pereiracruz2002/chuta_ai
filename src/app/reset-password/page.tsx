"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Lock, CheckCircle, Trophy } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setError("As senhas nao coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      if (updateError.message.includes("same as")) {
        setError("A nova senha deve ser diferente da senha anterior.");
      } else if (updateError.message.includes("session")) {
        setError(
          "Sessao expirada. Solicite um novo link de recuperacao."
        );
      } else {
        setError("Erro ao redefinir senha. Tente novamente.");
      }
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
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl opacity-20 blur-lg -z-10" />
            </div>
            <h1 className="text-xl font-bold">Senha redefinida!</h1>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground text-sm">
              Sua senha foi alterada com sucesso. Agora voce pode fazer login
              com a nova senha.
            </p>
            <Link href="/login">
              <Button className="w-full mt-4 cursor-pointer h-11 font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300">
                Ir para o login
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
            <h1 className="text-2xl font-black tracking-tight flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Nova Senha
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5 font-medium">
              Defina sua nova senha de acesso
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-sm font-semibold text-muted-foreground uppercase tracking-wide"
              >
                Nova Senha
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Minimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="h-11 bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-muted-foreground uppercase tracking-wide"
              >
                Confirmar Nova Senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
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
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
