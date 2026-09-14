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

// ── Respuestas correctas (tabla opciones_correctas, solo admin) ─────────────
export async function setOpcionCorrecta(preguntaId, opcionId) {
  const { data, error } = await supabase
    .from("opciones_correctas")
    .upsert({ pregunta_id: preguntaId, opcion_id: opcionId }, { onConflict: "pregunta_id" })
    .select()
    .single();
  return { data, error };
}

export async function getRespuestasCorrectas(preguntaIds) {
  if (!preguntaIds || preguntaIds.length === 0) return { data: [], error: null };
  const { data, error } = await supabase
    .from("opciones_correctas")
    .select("pregunta_id, opcion_id")
    .in("pregunta_id", preguntaIds);
  return { data, error };
}

// ── Calificación del quiz en el servidor (el estudiante nunca ve es_correcta)
export async function calificarQuiz(pasoId, respuestas) {
  const { data, error } = await supabase.rpc("fn_calificar_quiz", {
    p_paso_id: pasoId,
    p_respuestas: respuestas,
  });
  return { data, error };
}
