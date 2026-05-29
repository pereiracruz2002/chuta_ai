import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinPoolPage({ params }: JoinPageProps) {
  const { code } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/join/${code}`);
  }

  // Find pool by invite code
  const { data: pools } = await supabase
    .from("pools")
    .select("id")
    .eq("invite_code", code)
    .limit(1);

  if (!pools || pools.length === 0) {
    redirect("/pools");
  }

  const poolId = pools[0].id;

  // Check if already a member
  const { data: members } = await supabase
    .from("pool_members")
    .select("id")
    .eq("pool_id", poolId)
    .eq("user_id", user.id)
    .limit(1);

  if (!members || members.length === 0) {
    // Join the pool
    await supabase
      .from("pool_members")
      .insert([{ pool_id: poolId, user_id: user.id }]);
  }

  redirect(`/pools/${poolId}`);
}
