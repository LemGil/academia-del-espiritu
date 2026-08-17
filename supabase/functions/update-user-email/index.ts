// =============================================================================
// Academia del Espíritu — Edge Function: Actualizar email de usuario
// Uso:  POST /functions/v1/update-user-email
// Body: { userId: string, newEmail: string }
// =============================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    const { userId, newEmail } = await req.json();

    if (!userId || !newEmail) {
      return new Response(
        JSON.stringify({ error: "Faltan campos requeridos: userId, newEmail" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      email: newEmail,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, user: data.user }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
