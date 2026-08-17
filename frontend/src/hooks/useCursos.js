import { useState, useEffect } from "react";
import {
  getCursos,
  createCurso,
  updateCurso,
  deleteCurso,
} from "../services/cursosService";
import { supabase } from "../lib/supabaseClient";

const BUCKET = "imagenes-cursos";

async function subirImagen(file, cursoId) {
  const ext = file.name.split(".").pop();
  const path = `${cursoId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (error) {
    console.error("Error subiendo imagen:", error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function useCursos(nivelId = null) {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCurso, setEditingCurso] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function fetchCursos() {
    setLoading(true);
    const { data, error } = await getCursos(nivelId);
    if (error) console.error("Error cargando cursos:", error.message);
    setCursos(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchCursos();
  }, [nivelId]);

  async function addCurso(curso, imagenFile) {
    setSaving(true);

    // Primero creamos el curso para tener el id
    const payload = { ...curso, nivel_id: nivelId };
    const { data: nuevoCurso, error } = await createCurso(payload);

    if (error) {
      console.error("Error creando curso:", error.message);
      setSaving(false);
      return;
    }

    // Si hay imagen, la subimos y actualizamos imagen_url
    if (imagenFile && nuevoCurso?.id) {
      const url = await subirImagen(imagenFile, nuevoCurso.id);
      if (url) {
        await updateCurso(nuevoCurso.id, { imagen_url: url });
      }
    }

    await fetchCursos();
    setSaving(false);
  }

  async function editCurso(id, updates, imagenFile) {
    setSaving(true);

    let imagen_url = updates.imagen_url;

    // Si hay imagen nueva, la subimos primero
    if (imagenFile) {
      const url = await subirImagen(imagenFile, id);
      if (url) imagen_url = url;
    }
 console.log("Guardando imagen_url:", imagen_url); // ← agrega esto
    const { error } = await updateCurso(id, { ...updates, imagen_url });
    if (error) console.error("Error actualizando curso:", error.message);

    await fetchCursos();
    setSaving(false);
  }

  async function removeCurso(id) {
    const { error } = await deleteCurso(id);
    if (error) console.error("Error eliminando curso:", error.message);
    await fetchCursos();
  }

  function startEdit(curso) {
    setEditingCurso(curso);
    setIsModalOpen(true);
  }

  function startCreate() {
    setEditingCurso(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingCurso(null);
    setIsModalOpen(false);
  }

  return {
    cursos,
    loading,
    saving,
    addCurso,
    editCurso,
    removeCurso,
    editingCurso,
    isModalOpen,
    startEdit,
    startCreate,
    closeModal,
  };
async function subirImagen(file, cursoId) {
  const ext = file.name.split(".").pop();
  const path = `${cursoId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (error) {
    console.error("Error subiendo imagen:", error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  console.log("URL generada:", data.publicUrl); // ← agrega esto
  return data.publicUrl;
}
}
