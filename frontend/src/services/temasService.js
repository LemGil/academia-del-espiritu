import { supabase } from "../lib/supabaseClient";

const TABLE = "temas";

export async function getTemas(cursoId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("curso_id", cursoId)
    .order("orden", { ascending: true });
  return { data, error };
}

export async function createTema(tema) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([tema])
    .select()
    .single();
  return { data, error };
}

export async function updateTema(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteTema(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);
  return { error };
}
