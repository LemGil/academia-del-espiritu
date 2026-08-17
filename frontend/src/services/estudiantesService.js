import { supabase } from "../lib/supabaseClient";

const TABLE = "estudiantes";

export async function getEstudiantes() {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      niveles ( id, nombre )
    `)
    .order("nombre", { ascending: true });
  return { data, error };
}



export async function getEstudiantesByNivel(nivelId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("nivel_id", nivelId)
    .order("nombre", { ascending: true });
  return { data, error };
}

export async function createEstudiante(estudiante) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([estudiante])
    .select()
    .single();
  return { data, error };
}

export async function updateEstudiante(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteEstudiante(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);
  return { error };
}
