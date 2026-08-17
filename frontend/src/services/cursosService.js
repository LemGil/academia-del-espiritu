import { supabase } from "../lib/supabaseClient";

const TABLE = "cursos";

export async function getCursos(nivelId = null) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("orden", { ascending: true });

  if (nivelId) {
    query = query.eq("nivel_id", nivelId);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function createCurso(curso) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([curso])
    .select()
    .single();
  return { data, error };
}

export async function updateCurso(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteCurso(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);
  return { error };
}
