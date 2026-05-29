"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Share2 } from "lucide-react";

interface InviteCodeProps {
  code: string;
}

export function InviteCode({ code }: InviteCodeProps) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}/join/${code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Share2 className="w-3 h-3" />
        <span className="text-xs font-medium">Codigo:</span>
      </div>
      <code className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-md font-mono font-bold">
        {code}
      </code>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-7 px-2 text-xs cursor-pointer gap-1 text-muted-foreground hover:text-emerald-600 dark:text-emerald-400 transition-colors"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copiado!" : "Copiar"}
      </Button>
    </div>
  );
}
