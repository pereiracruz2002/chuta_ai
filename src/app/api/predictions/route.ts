import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

// Admin client para bypass de RLS (validação manual)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  try {
    // Autenticar usuario via session do server
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autenticado. Faça login novamente." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { pool_id, match_id, home_prediction, away_prediction, prediction_id } = body;

    // Validar campos
    if (!pool_id || !match_id) {
      return NextResponse.json(
        { error: "Dados incompletos." },
        { status: 400 }
      );
    }

    const home = Number(home_prediction);
    const away = Number(away_prediction);

    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) {
      return NextResponse.json(
        { error: "Placares inválidos." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Verificar se o jogo existe e não começou
    const { data: match, error: matchError } = await admin
      .from("matches")
      .select("id, starts_at")
      .eq("id", match_id)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: "Jogo não encontrado." },
        { status: 404 }
      );
    }

    if (new Date(match.starts_at) <= new Date()) {
      return NextResponse.json(
        { error: "Este jogo já começou. Não é mais possível registrar palpites." },
        { status: 403 }
      );
    }

    // Verificar se o usuário é membro do bolão
    const { data: membership } = await admin
      .from("pool_members")
      .select("id")
      .eq("pool_id", pool_id)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "Você não é membro deste bolão." },
        { status: 403 }
      );
    }

    // Upsert: atualizar se já existe, inserir se não
    if (prediction_id) {
      // Update existente
      const { error: updateError } = await admin
        .from("predictions")
        .update({
          home_prediction: home,
          away_prediction: away,
          updated_at: new Date().toISOString(),
        })
        .eq("id", prediction_id)
        .eq("user_id", user.id);

      if (updateError) {
        return NextResponse.json(
          { error: "Erro ao atualizar palpite." },
          { status: 500 }
        );
      }
    } else {
      // Insert novo (com upsert para evitar duplicatas)
      const { error: insertError } = await admin
        .from("predictions")
        .upsert(
          {
            user_id: user.id,
            pool_id,
            match_id,
            home_prediction: home,
            away_prediction: away,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,pool_id,match_id" }
        );

      if (insertError) {
        return NextResponse.json(
          { error: "Erro ao salvar palpite." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
