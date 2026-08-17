import { supabase } from "../lib/supabaseClient";

const TABLE = "niveles";

export async function getNiveles() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("orden", { ascending: true });
  return { data, error };
}

export async function createNivel(nivel) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([nivel])
    .select()
    .single();
  return { data, error };
}

export async function updateNivel(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteNivel(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);
  return { error };
}
