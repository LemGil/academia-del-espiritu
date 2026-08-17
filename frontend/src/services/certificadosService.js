import { supabase } from "../lib/supabaseClient";

export async function getCertificados(estudianteId) {
  const { data, error } = await supabase
    .from("certificados")
    .select("*")
    .eq("estudiante_id", estudianteId)
    .order("emitido_at", { ascending: false });
  if (error) return { data: null, error };

  const conRelaciones = await Promise.all(
    (data || []).map(async (cert) => {
      let nivel = null;
      if (cert.nivel_id) {
        const { data: n } = await supabase
          .from("niveles").select("nombre, texto_biblico").eq("id", cert.nivel_id).single();
        nivel = n;
      }
      let curso = null;
      if (cert.curso_id) {
        const { data: c } = await supabase
          .from("cursos").select("titulo, texto_biblico").eq("id", cert.curso_id).single();
        curso = c;
      }
      return { ...cert, niveles: nivel, cursos: curso };
    }),
  );
  return { data: conRelaciones, error: null };
}

export async function getAllCertificados() {
  const { data, error } = await supabase
    .from("certificados")
    .select("*")
    .order("emitido_at", { ascending: false });
  if (error) return { data: null, error };

  const conRelaciones = await Promise.all(
    (data || []).map(async (cert) => {
      let nivel = null;
      if (cert.nivel_id) {
        const { data: n } = await supabase
          .from("niveles").select("nombre, texto_biblico").eq("id", cert.nivel_id).single();
        nivel = n;
      }
      let curso = null;
      if (cert.curso_id) {
        const { data: c } = await supabase
          .from("cursos").select("titulo, texto_biblico").eq("id", cert.curso_id).single();
        curso = c;
      }
      let estudiante = null;
      if (cert.estudiante_id) {
        const { data: e } = await supabase
          .from("estudiantes").select("nombre, apellido").eq("id", cert.estudiante_id).single();
        estudiante = e;
      }
      return { ...cert, niveles: nivel, cursos: curso, estudiantes: estudiante };
    }),
  );
  return { data: conRelaciones, error: null };
}

export async function getHistorialNiveles(estudianteId) {
  const { data, error } = await supabase
    .from("historial_niveles")
    .select("*")
    .eq("estudiante_id", estudianteId)
    .order("fecha_fin", { ascending: false });
  if (error) return { data: null, error };

  const conNivel = await Promise.all(
    (data || []).map(async (h) => {
      let nivel = null;
      if (h.nivel_id) {
        const { data: n } = await supabase
          .from("niveles").select("nombre, orden").eq("id", h.nivel_id).single();
        nivel = n;
      }
      return { ...h, niveles: nivel };
    }),
  );
  return { data: conNivel, error: null };
}
