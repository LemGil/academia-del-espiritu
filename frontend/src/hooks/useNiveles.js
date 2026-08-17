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
  const [saving, setSaving] = useState(false);  // ← faltaba
  const [editingNivel, setEditingNivel] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function fetchNiveles() {
    setLoading(true);
    const { data, error } = await getNiveles();
    if (error) console.error(error);
    setNiveles(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchNiveles(); }, []);

  async function addNivel(nivel) {
    setSaving(true);
    console.log("Creating nivel with data:", nivel);
    const { error } = await createNivel(nivel);
    if (error) console.error("Error creando nivel:", error.message);
    await fetchNiveles();
    setSaving(false);
  }

  async function editNivel(id, updates) {
    setSaving(true);
    console.log("Updating nivel", id, "with:", updates);
    const { error } = await updateNivel(id, updates);
    if (error) console.error("Error actualizando nivel:", error.message);
    await fetchNiveles();
    setSaving(false);
  }

  async function removeNivel(id) {
    await deleteNivel(id);
    await fetchNiveles();
  }

  function startEdit(nivel) {
    setEditingNivel(nivel);
    setIsModalOpen(true);
  }

  function startCreate() {
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
