import { supabase } from "../lib/supabaseClient";

export async function getPreguntasPorPaso(pasoId) {
  const { data, error } = await supabase
    .from("preguntas")
    .select("*, opciones_respuesta(*)")
    .eq("paso_id", pasoId)
    .order("orden", { ascending: true });
  return { data, error };
}

export async function getPreguntasPorPasos(pasoIds) {
  if (!pasoIds || pasoIds.length === 0) return { data: [], error: null };
  const { data, error } = await supabase
    .from("preguntas")
    .select("*, opciones_respuesta(*)")
    .in("paso_id", pasoIds)
    .order("orden", { ascending: true });
  return { data, error };
}

export async function createPregunta(pregunta) {
  const { data, error } = await supabase
    .from("preguntas")
    .insert([pregunta])
    .select()
    .single();
  return { data, error };
}

export async function updatePregunta(id, updates) {
  const { data, error } = await supabase
    .from("preguntas")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deletePregunta(id) {
  const { error } = await supabase
    .from("preguntas")
    .delete()
    .eq("id", id);
  return { error };
}

export async function createOpcion(opcion) {
  const { data, error } = await supabase
    .from("opciones_respuesta")
    .insert([opcion])
    .select()
    .single();
  return { data, error };
}

export async function updateOpcion(id, updates) {
  const { data, error } = await supabase
    .from("opciones_respuesta")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteOpcion(id) {
  const { error } = await supabase
    .from("opciones_respuesta")
    .delete()
    .eq("id", id);
  return { error };
}
