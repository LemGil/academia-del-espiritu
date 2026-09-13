import { useState, useEffect } from "react";
import {
  getEstudiantes,
  createEstudiante,
  updateEstudiante,
  deleteEstudiante,
} from "../services/estudiantesService";
import { supabase } from "../lib/supabaseClient";

export function useEstudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editingEstudiante, setEditingEstudiante] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function fetchEstudiantes() {
    setLoading(true);
    setError(null);
    const { data, error } = await getEstudiantes();
    if (error) {
      setError("No se pudieron cargar los estudiantes.");
      setEstudiantes([]);
      setLoading(false);
      return;
    }

    const estudiantesRaw = data || [];

    const { data: perfiles } = await supabase
      .from("perfiles")
      .select("estudiante_id")
      .not("estudiante_id", "is", null);

    const linkedIds = new Set((perfiles || []).map((p) => p.estudiante_id));

    const estudiantesConPerfil = estudiantesRaw.map((est) => ({
      ...est,
      tienePerfil: linkedIds.has(est.id),
    }));

    setEstudiantes(estudiantesConPerfil);
    setLoading(false);
  }

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  async function addEstudiante(estudiante) {
    setSaving(true);
    setError(null);
    const { error } = await createEstudiante(estudiante);
    if (error) {
      setError("No se pudo crear el estudiante.");
      setSaving(false);
      return;
    }
    await fetchEstudiantes();
    setSaving(false);
  }

  async function editEstudiante(id, updates) {
    setSaving(true);
    setError(null);
    const { error } = await updateEstudiante(id, updates);
    if (error) {
      setError("No se pudo actualizar el estudiante.");
      setSaving(false);
      return;
    }
    await fetchEstudiantes();
    setSaving(false);
  }

  async function removeEstudiante(id) {
    setError(null);
    const { error } = await deleteEstudiante(id);
    if (error) {
      setError("No se pudo eliminar el estudiante.");
      return;
    }
    await fetchEstudiantes();
  }

  function startEdit(estudiante) {
    setEditingEstudiante(estudiante);
    setIsModalOpen(true);
  }

  function startCreate() {
    setEditingEstudiante(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingEstudiante(null);
    setIsModalOpen(false);
  }

  return {
    estudiantes,
    loading,
    saving,
    error,
    addEstudiante,
    editEstudiante,
    removeEstudiante,
    editingEstudiante,
    isModalOpen,
    startEdit,
    startCreate,
    closeModal,
    refreshEstudiantes: fetchEstudiantes,
  };
}
