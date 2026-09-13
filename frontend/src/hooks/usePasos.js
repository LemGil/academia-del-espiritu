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
  const [error, setError] = useState(null);
  const [editingPaso, setEditingPaso] = useState(null);

  const temaIds = temas.map((t) => t.id);
  const temaIdsKey = temaIds.join(",");

  async function fetchPasos() {
    if (temaIds.length === 0) {
      setPasos([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await getPasosPorTemas(temaIds);
    if (error) setError("No se pudieron cargar los pasos.");
    setPasos(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchPasos();
  }, [temaIdsKey]);

  async function addPaso(temaId, formData) {
    setSaving(true);
    setError(null);
    const payload = { ...formData, tema_id: temaId };
    const { error } = await createPaso(payload);
    if (error) {
      setError("No se pudo crear el paso.");
      setSaving(false);
      return;
    }
    await fetchPasos();
    setSaving(false);
  }

  async function editPaso(id, updates) {
    setSaving(true);
    setError(null);
    const { error } = await updatePaso(id, updates);
    if (error) {
      setError("No se pudo actualizar el paso.");
      setSaving(false);
      return;
    }
    await fetchPasos();
    setSaving(false);
  }

  async function removePaso(id) {
    setError(null);
    const { error } = await deletePaso(id);
    if (error) {
      setError("No se pudo eliminar el paso.");
      return;
    }
    await fetchPasos();
  }

  function startEditPaso(paso) {
    setEditingPaso(paso);
  }

  function clearEditingPaso() {
    setEditingPaso(null);
  }

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
    error,
    addPaso,
    editPaso,
    removePaso,
    editingPaso,
    startEditPaso,
    clearEditingPaso,
  };
}
