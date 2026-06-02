import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

// Admin client para bypass de RLS (validação manual)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Variáveis SUPABASE não configuradas no servidor.");
  }

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

    // Verificar se já existe um palpite para este jogo/bolão/usuário
    const { data: existing } = await admin
      .from("predictions")
      .select("id")
      .eq("user_id", user.id)
      .eq("pool_id", pool_id)
      .eq("match_id", match_id)
      .maybeSingle();

    if (existing || prediction_id) {
      // Update existente
      const updateId = prediction_id || existing?.id;
      const { data: updated, error: updateError } = await admin
        .from("predictions")
        .update({
          home_prediction: home,
          away_prediction: away,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updateId)
        .select()
        .single();

      if (updateError) {
        console.error("Prediction update error:", JSON.stringify(updateError));
        return NextResponse.json(
          { error: `Erro ao atualizar palpite: ${updateError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, prediction: updated });
    } else {
      // Insert novo
      const { data: inserted, error: insertError } = await admin
        .from("predictions")
        .insert({
          user_id: user.id,
          pool_id,
          match_id,
          home_prediction: home,
          away_prediction: away,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Prediction insert error:", JSON.stringify(insertError));
        return NextResponse.json(
          { error: `Erro ao salvar palpite: ${insertError.message}` },
          { status: 500 }
        );
      }

      if (!inserted) {
        return NextResponse.json(
          { error: "Palpite não foi salvo (retorno vazio)." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, prediction: inserted });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("Predictions API error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
