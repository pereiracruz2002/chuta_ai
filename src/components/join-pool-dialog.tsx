"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Ticket } from "lucide-react";

export function JoinPoolDialog() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

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

    // Find pool by invite code
    const { data: pools } = await supabase
      .from("pools")
      .select("id")
      .eq("invite_code", code.trim())
      .limit(1);

    if (!pools || pools.length === 0) {
      setError("Codigo invalido. Verifique e tente novamente.");
      setLoading(false);
      return;
    }

    const poolId = pools[0].id;

    // Check if already a member
    const { data: members } = await supabase
      .from("pool_members")
      .select("id")
      .eq("pool_id", poolId)
      .eq("user_id", user.id)
      .limit(1);

    if (members && members.length > 0) {
      router.push(`/pools/${poolId}`);
      setOpen(false);
      return;
    }

    // Join the pool
    const { error: joinError } = await supabase
      .from("pool_members")
      .insert([{ pool_id: poolId, user_id: user.id }]);

    if (joinError) {
      setError("Erro ao entrar no bolao.");
      setLoading(false);
      return;
    }

    setOpen(false);
    router.push(`/pools/${poolId}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="cursor-pointer gap-1.5 border-border/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 font-semibold transition-all" />}>
        <UserPlus className="w-4 h-4" />
        Entrar em Bolao
      </DialogTrigger>
      <DialogContent className="glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-lg font-bold">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Entrar em um Bolao
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleJoin} className="space-y-4 pt-2">
          <Input
            placeholder="Cole o codigo de convite"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-11 bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-colors font-mono"
          />
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5">
              <p className="text-sm text-destructive text-center font-medium">{error}</p>
            </div>
          )}
          <Button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full h-11 cursor-pointer font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/35 transition-all duration-300"
          >
            {loading ? "Entrando..." : "Entrar no Bolao"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
