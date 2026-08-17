import { supabase } from "../lib/supabaseClient";

export async function marcarPasoCompletado(estudianteId, pasoId) {
  const { data, error } = await supabase.rpc("fn_marcar_paso_completado", {
    p_estudiante_id: estudianteId,
    p_paso_id: pasoId,
    p_completado_por: "estudiante",
  });
  return { data, error };
}

export async function getProgresoPasos(estudianteId) {
  const { data, error } = await supabase
    .from("progreso_pasos")
    .select("*")
    .eq("estudiante_id", estudianteId);
  return { data, error };
}

export async function getProgresoTemas(estudianteId) {
  const { data, error } = await supabase
    .from("progreso_temas")
    .select("*")
    .eq("estudiante_id", estudianteId);
  return { data, error };
}

export async function getProgresoCursos(estudianteId) {
  const { data, error } = await supabase
    .from("progreso_cursos")
    .select("*")
    .eq("estudiante_id", estudianteId);
  return { data, error };
}

export async function getProgresoNiveles(estudianteId) {
  const { data, error } = await supabase
    .from("progreso_niveles")
    .select("*")
    .eq("estudiante_id", estudianteId);
  return { data, error };
}

export async function getResumenEstudiante() {
  const { data, error } = await supabase
    .from("v_resumen_estudiante")
    .select("*");
  return { data, error };
}
