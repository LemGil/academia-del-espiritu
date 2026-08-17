import { supabase } from "../lib/supabaseClient";

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function register(email, password, nombreVisible) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { data, error };
  if (data?.user) {
    const { error: perfilError } = await supabase
      .from("perfiles")
      .insert({
        id: data.user.id,
        rol: "estudiante",
        nombre_visible: nombreVisible || email.split("@")[0],
        activo: true,
      });
    if (perfilError) console.error("Error creando perfil:", perfilError.message);
  }
  return { data, error };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getProfile(userId) {
  // Primero obtenemos el perfil
  const { data: perfil, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !perfil) return { data: null, error };

  // Si tiene estudiante_id, buscamos el estudiante por separado
  if (perfil.estudiante_id) {
    const { data: estudiante } = await supabase
      .from("estudiantes")
      .select("*, niveles(*)")
      .eq("id", perfil.estudiante_id)
      .single();
    return { data: { ...perfil, estudiantes: estudiante }, error: null };
  }

  return { data: { ...perfil, estudiantes: null }, error: null };
}

export async function getEstudianteConNivel(estudianteId) {
  const { data, error } = await supabase
    .from("estudiantes")
    .select(`*, niveles(*)`)
    .eq("id", estudianteId)
    .single();
  return { data, error };
}
