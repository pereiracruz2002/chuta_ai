import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminMatchList } from "@/components/admin-match-list";
import { Settings } from "lucide-react";

interface AdminPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Check if user is the pool owner
  const { data: pool } = await supabase
    .from("pools")
    .select("*")
    .eq("id", id)
    .single();

  if (!pool) redirect("/pools");
  if (pool.owner_id !== user.id) redirect(`/pools/${id}`);

  // Get all matches
  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .order("starts_at", { ascending: true });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 flex items-center justify-center">
          <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Painel Admin</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">
            Atualize os resultados das partidas para {pool.name}
          </p>
        </div>
      </div>
      <AdminMatchList matches={matches || []} poolId={id} />
    </div>
  );
}
