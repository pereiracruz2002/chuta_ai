import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Sync avatar from Google OAuth if it changed
  const authAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  if (profile && authAvatarUrl && profile.avatar_url !== authAvatarUrl) {
    await supabase
      .from("users")
      .update({ avatar_url: authAvatarUrl })
      .eq("id", user.id);

    if (profile) {
      profile.avatar_url = authAvatarUrl;
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-[30%] -left-[15%] w-[500px] h-[500px] bg-green-500/[0.03] rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/[0.02] rounded-full blur-3xl" />
      </div>
      
      <Header user={profile} />
      <main className="relative container mx-auto px-4 py-8 max-w-4xl">
        {children}
      </main>
    </div>
  );
}
