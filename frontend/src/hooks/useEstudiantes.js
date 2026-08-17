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
  const [editingEstudiante, setEditingEstudiante] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function fetchEstudiantes() {
    setLoading(true);
    const { data, error } = await getEstudiantes();
    if (error) console.error("Error cargando estudiantes:", error.message);

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
    const { error } = await createEstudiante(estudiante);
    if (error) console.error("Error creando estudiante:", error.message);
    await fetchEstudiantes();
    setSaving(false);
  }

  async function editEstudiante(id, updates) {
    setSaving(true);
    const { error } = await updateEstudiante(id, updates);
    if (error) console.error("Error actualizando estudiante:", error.message);
    await fetchEstudiantes();
    setSaving(false);
  }

  async function removeEstudiante(id) {
    const { error } = await deleteEstudiante(id);
    if (error) console.error("Error eliminando estudiante:", error.message);
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
