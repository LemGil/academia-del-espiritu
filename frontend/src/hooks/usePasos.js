import { useState, useEffect } from "react";
import {
  getPasosPorTemas,
  createPaso,
  updatePaso,
  deletePaso,
} from "../services/pasosService";

export function usePasos(temas = []) {
  const [pasos, setPasos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPaso, setEditingPaso] = useState(null);

  const temaIds = temas.map((t) => t.id);
  const temaIdsKey = temaIds.join(",");

  async function fetchPasos() {
    if (temaIds.length === 0) {
      setPasos([]);
      return;
    }
    setLoading(true);
    const { data, error } = await getPasosPorTemas(temaIds);
    if (error) console.error("Error cargando pasos:", error.message);
    setPasos(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchPasos();
  }, [temaIdsKey]);

  async function addPaso(temaId, formData) {
    setSaving(true);
    const payload = { ...formData, tema_id: temaId };
    const { error } = await createPaso(payload);
    if (error) console.error("Error creando paso:", error.message);
    await fetchPasos();
    setSaving(false);
  }

  async function editPaso(id, updates) {
    setSaving(true);
    const { error } = await updatePaso(id, updates);
    if (error) console.error("Error actualizando paso:", error.message);
    await fetchPasos();
    setSaving(false);
  }

  async function removePaso(id) {
    const { error } = await deletePaso(id);
    if (error) console.error("Error eliminando paso:", error.message);
    await fetchPasos();
  }

  function startEditPaso(paso) {
    setEditingPaso(paso);
  }

  function clearEditingPaso() {
    setEditingPaso(null);
  }

  // Agrupa pasos por tema_id
  const pasosPorTema = pasos.reduce((acc, paso) => {
    if (!acc[paso.tema_id]) acc[paso.tema_id] = [];
    acc[paso.tema_id].push(paso);
    return acc;
  }, {});

  return {
    pasos,
    pasosPorTema,
    loading,
    saving,
    addPaso,
    editPaso,
    removePaso,
    editingPaso,
    startEditPaso,
    clearEditingPaso,
  };
}
