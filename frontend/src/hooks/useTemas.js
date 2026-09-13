import { useState, useEffect } from "react";
import {
  getTemas,
  createTema,
  updateTema,
  deleteTema,
} from "../services/temasService";

export function useTemas(cursoId = null) {
  const [temas, setTemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editingTema, setEditingTema] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function fetchTemas() {
    if (!cursoId) {
      setTemas([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await getTemas(cursoId);
    if (error) setError("No se pudieron cargar los temas.");
    setTemas(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchTemas();
  }, [cursoId]);

  async function addTema(tema) {
    setSaving(true);
    setError(null);
    const payload = { ...tema, curso_id: cursoId };
    const { error } = await createTema(payload);
    if (error) {
      setError("No se pudo crear el tema.");
      setSaving(false);
      return;
    }
    await fetchTemas();
    setSaving(false);
  }

  async function editTema(id, updates) {
    setSaving(true);
    setError(null);
    const { error } = await updateTema(id, updates);
    if (error) {
      setError("No se pudo actualizar el tema.");
      setSaving(false);
      return;
    }
    await fetchTemas();
    setSaving(false);
  }

  async function removeTema(id) {
    setError(null);
    const { error } = await deleteTema(id);
    if (error) {
      setError("No se pudo eliminar el tema.");
      return;
    }
    await fetchTemas();
  }

  function startEdit(tema) {
    setEditingTema(tema);
    setIsModalOpen(true);
  }

  function startCreate() {
    setEditingTema(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingTema(null);
    setIsModalOpen(false);
  }

  return {
    temas,
    loading,
    saving,
    error,
    addTema,
    editTema,
    removeTema,
    editingTema,
    isModalOpen,
    startEdit,
    startCreate,
    closeModal,
  };
}
