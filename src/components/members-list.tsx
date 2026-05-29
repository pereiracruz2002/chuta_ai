"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface MembersListProps {
  members: any[];
}

export function MembersList({ members }: MembersListProps) {
  return (
    <Card className="glass overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-500/[0.08] via-green-500/[0.05] to-transparent border-b border-border/30 pb-4">
        <CardTitle className="text-lg flex items-center gap-2.5 font-bold">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          Participantes ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/30">
          {members.map((member: any) => (
            <div key={member.id} className="flex items-center gap-3.5 px-5 py-4 hover:bg-muted/20 transition-colors duration-200">
              <Avatar className="h-10 w-10 ring-2 ring-border/30 ring-offset-1 ring-offset-background">
                <AvatarImage
                  src={member.users?.avatar_url || undefined}
                  alt={member.users?.name || ""}
                />
                <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400">
                  {member.users?.name?.slice(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm truncate block">
                  {member.users?.name || "Usuario"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span className="text-xs font-medium" suppressHydrationWarning>
                  {new Date(member.joined_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
