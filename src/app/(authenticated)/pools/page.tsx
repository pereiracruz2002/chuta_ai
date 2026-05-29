import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { JoinPoolDialog } from "@/components/join-pool-dialog";
import { Trophy, Plus, Users, ChevronRight, Zap } from "lucide-react";

export default async function PoolsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: memberships } = await supabase
    .from("pool_members")
    .select("pool_id, score, pools(id, name, owner_id, invite_code, created_at)")
    .eq("user_id", user.id);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const pools = (memberships ?? []).map((m: any) => ({
    ...(Array.isArray(m.pools) ? m.pools[0] : m.pools),
    score: m.score,
    isOwner: (Array.isArray(m.pools) ? m.pools[0]?.owner_id : m.pools?.owner_id) === user.id,
  }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gradient">Meus Boloes</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Gerencie seus boloes da Copa 2026</p>
        </div>
        <div className="flex gap-2">
          <JoinPoolDialog />
          <Link href="/pools/new" className={buttonVariants({ className: "gap-1.5 cursor-pointer bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/35 transition-all duration-300 font-semibold" })}>
            <Plus className="w-4 h-4" />
            Criar
          </Link>
        </div>
      </div>

      {pools.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50 glass">
          <CardContent className="py-20 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500/15 to-green-500/15 rounded-2xl flex items-center justify-center mb-5 glow-green-sm">
              <Trophy className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-bold text-xl mb-2">Nenhum bolao ainda</h3>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">
              Crie um bolao ou entre em um existente para comecar a palpitar!
            </p>
            <div className="flex justify-center gap-3">
              <JoinPoolDialog />
              <Link href="/pools/new" className={buttonVariants({ className: "gap-1.5 cursor-pointer bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-green-500/20 font-semibold" })}>
                <Plus className="w-4 h-4" />
                Criar Bolao
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {pools.map((pool: any) => (
            <Link key={pool?.id} href={`/pools/${pool?.id}`}>
              <Card className="glass hover:border-emerald-500/30 hover:glow-green-sm transition-all duration-300 cursor-pointer group overflow-hidden relative">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="flex flex-row items-center justify-between py-5 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 flex items-center justify-center group-hover:from-emerald-500/25 group-hover:to-green-500/25 transition-all duration-300 group-hover:scale-105">
                      <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">{pool?.name}</CardTitle>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">Bolao ativo</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {pool?.isOwner && (
                      <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold">
                        Dono
                      </Badge>
                    )}
                    <div className="text-right flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-black text-xl">{pool?.score}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">pts</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-all duration-200" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
