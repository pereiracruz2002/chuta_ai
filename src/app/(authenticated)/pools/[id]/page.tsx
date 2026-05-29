import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PoolTabs } from "@/components/pool-tabs";
import { InviteCode } from "@/components/invite-code";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Settings, Users, Trophy } from "lucide-react";

interface PoolPageProps {
  params: Promise<{ id: string }>;
}

export default async function PoolPage({ params }: PoolPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get pool info
  const { data: pool } = await supabase
    .from("pools")
    .select("*")
    .eq("id", id)
    .single();

  if (!pool) redirect("/pools");

  const isOwner = pool.owner_id === user.id;

  // Get members with user info
  const { data: members } = await supabase
    .from("pool_members")
    .select("*, users(id, name, avatar_url)")
    .eq("pool_id", id)
    .order("score", { ascending: false });

  // Get all matches
  const { data: matches, error: matchesError, count, status } = await supabase
    .from("matches")
    .select("*", { count: "exact" })
    .order("starts_at", { ascending: true });

  // Debug: show on page if there's an issue
  if (matchesError) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <p className="font-bold text-destructive">Erro ao buscar jogos:</p>
        <pre className="text-xs mt-2 text-destructive/80">{JSON.stringify(matchesError, null, 2)}</pre>
      </div>
    );
  }

  // Debug info - REMOVER DEPOIS
  console.log("[DEBUG MATCHES]", { count, status, matchesLength: matches?.length, firstMatch: matches?.[0] });

  // Get user predictions for this pool
  const { data: predictions } = await supabase
    .from("predictions")
    .select("*")
    .eq("pool_id", id)
    .eq("user_id", user.id);

  return (
    <div className="space-y-8">
      {/* Pool Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">{pool.name}</h1>
          </div>
          <InviteCode code={pool.invite_code} />
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <Link
              href={`/pools/${id}/admin`}
              className={buttonVariants({ variant: "outline", size: "sm", className: "cursor-pointer gap-1.5 border-border/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all" })}
            >
              <Settings className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
          <Badge variant="outline" className="border-border/50 bg-card/50 font-semibold flex items-center gap-1.5 py-1.5 px-3">
            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {members?.length || 0}
          </Badge>
        </div>
      </div>

      <PoolTabs
        poolId={id}
        matches={matches || []}
        members={members || []}
        predictions={predictions || []}
        userId={user.id}
        isOwner={isOwner}
      />
    </div>
  );
}
