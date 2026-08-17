import { supabase } from "../lib/supabaseClient";

const TABLE = "pasos";

export async function getPasos(temaId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("tema_id", temaId)
    .order("orden", { ascending: true });
  return { data, error };
}

export async function getPasosPorTemas(temaIds) {
  if (!temaIds || temaIds.length === 0) return { data: [], error: null };
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .in("tema_id", temaIds)
    .order("orden", { ascending: true });
  return { data, error };
}

export async function createPaso(paso) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([paso])
    .select()
    .single();
  return { data, error };
}

export async function updatePaso(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deletePaso(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);
  return { error };
}
