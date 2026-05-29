"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Trophy, ArrowLeft } from "lucide-react";

export default function NewPoolPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Voce precisa estar logado.");
      setLoading(false);
      return;
    }

    // Create the pool
    const { data: pool, error: poolError } = await supabase
      .from("pools")
      .insert({ name: name.trim(), owner_id: user.id })
      .select()
      .single();

    if (poolError || !pool) {
      setError("Erro ao criar bolao. Tente novamente.");
      setLoading(false);
      return;
    }

    // Add owner as a member
    await supabase
      .from("pool_members")
      .insert({ pool_id: pool.id, user_id: user.id });

    router.push(`/pools/${pool.id}`);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="glass glow-green-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Criar Novo Bolao</h1>
              <p className="text-xs text-muted-foreground font-medium">Configure seu bolao da Copa 2026</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome do Bolao</Label>
              <Input
                id="name"
                placeholder="Ex: Bolao da Galera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-colors"
              />
            </div>
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5">
                <p className="text-sm text-destructive text-center font-medium">{error}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="cursor-pointer flex-1 h-11 font-semibold border-border/50 hover:bg-accent/80"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="cursor-pointer flex-1 h-11 font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/35 transition-all duration-300"
              >
                {loading ? "Criando..." : "Criar Bolao"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
