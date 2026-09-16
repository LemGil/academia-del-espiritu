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
  const [error, setError] = useState(null);
  const [editingCurso, setEditingCurso] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function fetchCursos() {
    setLoading(true);
    setError(null);
    const { data, error } = await getCursos(nivelId);
    if (error) setError("No se pudieron cargar las series.");
    setCursos(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchCursos();
  }, [nivelId]);

  async function addCurso(curso, imagenFile) {
    setSaving(true);
    setError(null);

    const payload = { ...curso, nivel_id: nivelId };
    const { data: nuevoCurso, error } = await createCurso(payload);

    if (error) {
      setError("No se pudo crear la serie.");
      setSaving(false);
      return false;
    }

    if (imagenFile && nuevoCurso?.id) {
      const url = await subirImagen(imagenFile, nuevoCurso.id);
      if (url) {
        await updateCurso(nuevoCurso.id, { imagen_url: url });
      }
    }

    await fetchCursos();
    setSaving(false);
    return true;
  }

  async function editCurso(id, updates, imagenFile) {
    setSaving(true);
    setError(null);

    let imagen_url = updates.imagen_url;

    if (imagenFile) {
      const url = await subirImagen(imagenFile, id);
      if (url) imagen_url = url;
    }

    const { error } = await updateCurso(id, { ...updates, imagen_url });
    if (error) {
      setError("No se pudo actualizar la serie.");
      setSaving(false);
      return false;
    }

    await fetchCursos();
    setSaving(false);
    return true;
  }

  async function removeCurso(id) {
    setError(null);
    const { error } = await deleteCurso(id);
    if (error) {
      setError("No se pudo eliminar la serie.");
      return;
    }
    await fetchCursos();
  }

  function startEdit(curso) {
    setError(null);
    setEditingCurso(curso);
    setIsModalOpen(true);
  }

  function startCreate() {
    setError(null);
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
    error,
    addCurso,
    editCurso,
    removeCurso,
    editingCurso,
    isModalOpen,
    startEdit,
    startCreate,
    closeModal,
  };
}
