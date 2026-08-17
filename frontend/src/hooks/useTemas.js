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
  const [editingTema, setEditingTema] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function fetchTemas() {
    if (!cursoId) {
      setTemas([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await getTemas(cursoId);
    if (error) console.error("Error cargando temas:", error.message);
    setTemas(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchTemas();
  }, [cursoId]);

  async function addTema(tema) {
    setSaving(true);
    const payload = { ...tema, curso_id: cursoId };
    const { error } = await createTema(payload);
    if (error) console.error("Error creando tema:", error.message);
    await fetchTemas();
    setSaving(false);
  }

  async function editTema(id, updates) {
    setSaving(true);
    const { error } = await updateTema(id, updates);
    if (error) console.error("Error actualizando tema:", error.message);
    await fetchTemas();
    setSaving(false);
  }

  async function removeTema(id) {
    const { error } = await deleteTema(id);
    if (error) console.error("Error eliminando tema:", error.message);
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
