import { useEffect, useState } from "react";
import {
  getNiveles,
  createNivel,
  updateNivel,
  deleteNivel,
} from "../services/nivelesService";

export function useNiveles() {
  const [niveles, setNiveles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editingNivel, setEditingNivel] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function fetchNiveles() {
    setLoading(true);
    setError(null);
    const { data, error } = await getNiveles();
    if (error) setError("No se pudieron cargar los niveles.");
    setNiveles(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchNiveles(); }, []);

  async function addNivel(nivel) {
    setSaving(true);
    setError(null);
    const { error } = await createNivel(nivel);
    if (error) {
      setError("No se pudo crear el nivel.");
      setSaving(false);
      return false;
    }
    await fetchNiveles();
    setSaving(false);
    return true;
  }

  async function editNivel(id, updates) {
    setSaving(true);
    setError(null);
    const { error } = await updateNivel(id, updates);
    if (error) {
      setError("No se pudo actualizar el nivel.");
      setSaving(false);
      return false;
    }
    await fetchNiveles();
    setSaving(false);
    return true;
  }

  async function removeNivel(id) {
    setError(null);
    const { error } = await deleteNivel(id);
    if (error) {
      setError("No se pudo eliminar el nivel.");
      return;
    }
    await fetchNiveles();
  }

  function startEdit(nivel) {
    setError(null);
    setEditingNivel(nivel);
    setIsModalOpen(true);
  }

  function startCreate() {
    setError(null);
    setEditingNivel(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingNivel(null);
    setIsModalOpen(false);
  }

  return {
    niveles,
    loading,
    saving,
    error,
    addNivel,
    editNivel,
    removeNivel,
    editingNivel,
    isModalOpen,
    startEdit,
    startCreate,
    closeModal,
  };
}
