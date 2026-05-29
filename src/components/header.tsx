"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Trophy, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface HeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="container mx-auto px-4 max-w-4xl flex items-center justify-between h-16">
        <Link href="/pools" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-all duration-300 group-hover:scale-105">
            <Trophy className="w-4.5 h-4.5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-bold text-xl text-gradient">
            Chuta AI
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            className="cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {user && (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline font-medium">
                {user.name}
              </span>
              <Avatar className="h-9 w-9 ring-2 ring-border/50 ring-offset-2 ring-offset-background">
                <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-emerald-500/20 to-green-500/20 text-emerald-600 dark:text-emerald-400">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleLogout}
            title="Sair"
            className="cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
