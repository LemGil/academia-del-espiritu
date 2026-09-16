import React, { useState, useEffect } from "react";
import Modal from "./components/Modal";
import NivelForm from "./components/NivelForm";
import NivelList from "./components/NivelList";
import CursoForm from "./components/CursoForm";
import CursoList from "./components/CursoList";
import TemaForm from "./components/TemaForm";
import TemaList from "./components/TemaList";
import PasoForm from "./components/PasoForm";
import ActividadForm from "./components/ActividadForm";
import { getPreguntasPorPaso, createPregunta, updatePregunta, deletePregunta, createOpcion, updateOpcion, deleteOpcion, setOpcionCorrecta, getRespuestasCorrectas } from "./services/preguntasService";
import EstudianteForm from "./components/EstudianteForm";
import EstudianteList from "./components/EstudianteList";
import { useNiveles } from "./hooks/useNiveles";
import { useCursos } from "./hooks/useCursos";
import { useTemas } from "./hooks/useTemas";
import { usePasos } from "./hooks/usePasos";
import { useEstudiantes } from "./hooks/useEstudiantes";
import { supabase } from "./lib/supabaseClient";
import { getAllCertificados } from "./services/certificadosService";
import { Link, UserCheck } from "lucide-react";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

if (!document.getElementById("ae-fonts")) {
  const link = document.createElement("link");
  link.id = "ae-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap";
  document.head.appendChild(link);
}

function BtnGold({ onClick, children, small }) {
  return (
    <button onClick={onClick} style={{
      background: COLORS.oro, color: COLORS.teal, border: "none",
      padding: small ? "6px 14px" : "9px 20px",
      fontFamily: "'Cinzel', serif", fontSize: small ? 10 : 12,
      letterSpacing: "1px", cursor: "pointer", borderRadius: 2, fontWeight: 600,
    }}>
      {children}
    </button>
  );
}

function BtnOutline({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", color: COLORS.oro,
      border: `1px solid ${COLORS.oro}`, padding: "8px 16px",
      fontFamily: "'Cinzel', serif", fontSize: 11,
      letterSpacing: "1px", cursor: "pointer", borderRadius: 2,
    }}>
      {children}
    </button>
  );
}

// Aviso de error dentro de las ventanas: si el guardado falla, la ventana
// queda abierta y se muestra el motivo en lugar de cerrarse en silencio.
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: "#fdecea", border: "1px solid #e0a3a3", color: "#a32d2d",
      borderRadius: 4, padding: "10px 14px", marginBottom: 14, fontSize: 14,
    }}>
      {message}
    </div>
  );
}

function Topbar({ breadcrumb, children }) {
  return (
    <div style={{
      background: COLORS.teal, padding: "14px 28px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: `2px solid ${COLORS.oro}`,
    }}>
      <span style={{
        fontFamily: "'Cinzel', serif", fontSize: 11,
        color: COLORS.oro, letterSpacing: "2px", textTransform: "uppercase",
      }}>
        {breadcrumb}
      </span>
      <div style={{ display: "flex", gap: 10 }}>{children}</div>
    </div>
  );
}

function Sidebar({ vista, onNavigate, onLogout }) {
  const items = [
    { icon: "ti-stack-2", label: "Niveles", key: "niveles" },
    { icon: "ti-book", label: "Series", key: "cursos" },
    { icon: "ti-file-text", label: "Academias", key: "temas" },
    { icon: "ti-pencil-alt", label: "Actividades", key: "actividades" },
    { icon: "ti-users", label: "Alumnos", key: "alumnos" },
    { icon: "ti-shield", label: "Perfiles", key: "perfiles" },
    { icon: "ti-chart-bar", label: "Progreso", key: "progreso" },
    { icon: "ti-certificate", label: "Certificados", key: "certificados" },
  ];
  return (
    <div style={{
      background: COLORS.teal, width: 200, minHeight: "100vh",
      display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
        <div style={{
          padding: "24px 20px 20px",
          borderBottom: `1px solid rgba(201,162,74,0.25)`,
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <img src="/logo-academia.png" alt="Academia del Espíritu Logo" style={{ maxWidth: 140, height: 'auto', marginBottom: 8 }} />
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: 13, color: COLORS.oro,
            letterSpacing: "2px", textTransform: "uppercase", lineHeight: 1.5,
          }}>
            Academia<br />del Espíritu
          </div>
          <div style={{
            fontSize: 11, color: COLORS.pergamino, marginTop: 4,
            letterSpacing: "1px", fontStyle: "italic",
            fontFamily: "'EB Garamond', Georgia, serif",
          }}>
            formación · revelación
          </div>
        </div>

      <nav style={{ padding: "16px 0", flex: 1 }}>
        {items.map((item) => (
          <div
            key={item.key}
            onClick={() => onNavigate(item.key)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 20px", fontSize: 13, cursor: "pointer",
              color: vista === item.key ? COLORS.oro : COLORS.pergamino,
              borderLeft: `3px solid ${vista === item.key ? COLORS.oro : "transparent"}`,
              background: vista === item.key ? "rgba(201,162,74,0.08)" : "transparent",
              fontFamily: "'EB Garamond', Georgia, serif",
            }}
          >
            <i className={`ti ${item.icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
            {item.label}
          </div>
        ))}
      </nav>

      <div style={{
        padding: "16px 20px",
        borderTop: `1px solid rgba(201,162,74,0.2)`,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{
          fontSize: 11, color: COLORS.pergamino, fontStyle: "italic",
          fontFamily: "'EB Garamond', Georgia, serif",
        }}>
          Área administrativa
        </div>
        <button
          onClick={onLogout}
          style={{
            background: "transparent",
            color: COLORS.pergamino,
            border: `1px solid rgba(201,162,74,0.3)`,
            padding: "7px 12px",
            borderRadius: 2,
            fontFamily: "'Cinzel', serif",
            fontSize: 10,
            letterSpacing: "1px",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default function App({ onLogout }) {
  const [vistaActiva, setVistaActiva] = useState("niveles");

  // ── Vincular perfiles ──
  const [perfilesSinLink, setPerfilesSinLink] = useState([]);
  const [vinculando, setVinculando] = useState(false);
  const [profilePicker, setProfilePicker] = useState(null);

  async function fetchPerfilesSinLink() {
    const { data } = await supabase
      .from("perfiles")
      .select("id, nombre_visible, rol")
      .is("estudiante_id", null)
      .eq("activo", true);
    setPerfilesSinLink(data || []);
  }

  useEffect(() => {
    if (vistaActiva === "alumnos") {
      fetchPerfilesSinLink();
      setProfilePicker(null);
    }
  }, [vistaActiva]);

  async function handleCrearYVincular(perfilId, nombreVisible) {
    setVinculando(true);
    const partes = (nombreVisible || "").split(" ");
    const nombre = partes[0] || "Estudiante";
    const apellido = partes.slice(1).join(" ") || "";

    const { data: nuevoEst } = await supabase
      .from("estudiantes")
      .insert({ nombre, apellido, activo: true })
      .select("id")
      .single();

    if (nuevoEst) {
      await supabase
        .from("perfiles")
        .update({ estudiante_id: nuevoEst.id })
        .eq("id", perfilId);
    }
    setVinculando(false);
    setProfilePicker(null);
    await Promise.all([fetchPerfilesSinLink(), refreshEstudiantes()]);
  }

  async function handleVincularCon(perfilId, estudianteId) {
    setVinculando(true);
    await supabase
      .from("perfiles")
      .update({ estudiante_id: parseInt(estudianteId) })
      .eq("id", perfilId);
    setVinculando(false);
    setProfilePicker(null);
    await Promise.all([fetchPerfilesSinLink(), refreshEstudiantes()]);
  }
  // ── Perfiles ──
  const [perfiles, setPerfiles] = useState([]);
  const [loadingPerfiles, setLoadingPerfiles] = useState(false);
  const [savingPerfilId, setSavingPerfilId] = useState(null);

  async function fetchPerfiles() {
    setLoadingPerfiles(true);
    const { data } = await supabase
      .from("perfiles")
      .select("*, estudiantes(id, nombre, apellido)")
      .order("created_at", { ascending: false });
    setPerfiles(data || []);
    setLoadingPerfiles(false);
  }

  useEffect(() => {
    if (vistaActiva === "perfiles") {
      fetchPerfiles();
    }
  }, [vistaActiva]);

  async function handleToggleActivo(perfilId, activo) {
    setSavingPerfilId(perfilId);
    await supabase.from("perfiles").update({ activo }).eq("id", perfilId);
    setSavingPerfilId(null);
    fetchPerfiles();
  }

  async function handleChangeRol(perfilId, rol) {
    setSavingPerfilId(perfilId);
    await supabase.from("perfiles").update({ rol }).eq("id", perfilId);
    setSavingPerfilId(null);
    fetchPerfiles();
  }

  async function handleDesvincular(perfilId) {
    setSavingPerfilId(perfilId);
    await supabase.from("perfiles").update({ estudiante_id: null }).eq("id", perfilId);
    setSavingPerfilId(null);
    fetchPerfiles();
  }

  // ── Reset password ──
  const [resetPassPerfil, setResetPassPerfil] = useState(null);
  const [resetPassEmail, setResetPassEmail] = useState("");
  const [resetPassSending, setResetPassSending] = useState(false);
  const [resetPassMsg, setResetPassMsg] = useState("");

  async function handleSendReset() {
    setResetPassSending(true);
    setResetPassMsg("");
    const { error } = await supabase.auth.resetPasswordForEmail(resetPassEmail, {
      redirectTo: window.location.origin,
    });
    if (error) {
      setResetPassMsg("Error: " + error.message);
    } else {
      setResetPassMsg("Correo de recuperación enviado a " + resetPassEmail);
    }
    setResetPassSending(false);
  }

  // ── Eliminar perfil ──
  const [eliminandoPerfil, setEliminandoPerfil] = useState(false);

  async function handleEliminarPerfil(perfilId) {
    if (!window.confirm("¿Estás seguro? El usuario ya no podrá acceder al portal hasta que se le cree un nuevo acceso.")) return;
    setEliminandoPerfil(true);
    await supabase.from("perfiles").delete().eq("id", perfilId);
    setEliminandoPerfil(false);
    fetchPerfiles();
  }

  const BUCKET_IMAGENES = "imagenes-cursos";

  async function subirImagen(file, cursoId) {
    const ext = file.name.split(".").pop();
    const path = `${cursoId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET_IMAGENES)
      .upload(path, file, { upsert: true });
    if (error) { console.error("Error subiendo imagen:", error.message); return null; }
    const { data } = supabase.storage.from(BUCKET_IMAGENES).getPublicUrl(path);
    return data.publicUrl;
  }

  // ── Vista Cursos (independiente) ──
  const [todosCursos, setTodosCursos] = useState([]);
  const [loadingTodosCursos, setLoadingTodosCursos] = useState(false);
  const [isCursoGlobalModalOpen, setIsCursoGlobalModalOpen] = useState(false);
  const [editingCursoGlobal, setEditingCursoGlobal] = useState(null);
  const [cursosSaving, setCursosSaving] = useState(false);
  const [errorCursoGlobal, setErrorCursoGlobal] = useState(null);
  const [filtroNivelCursos, setFiltroNivelCursos] = useState("");

  useEffect(() => {
    if (vistaActiva === "cursos") fetchTodosCursos();
  }, [vistaActiva]);

  // Resetear filtros al cerrar modal
  useEffect(() => {
    if (!isCursoGlobalModalOpen) setFiltroNivelCursos("");
  }, [isCursoGlobalModalOpen]);

  async function fetchTodosCursos() {
    setLoadingTodosCursos(true);
    const { data: niveles } = await supabase.from("niveles").select("id, nombre").order("orden");
    if (!niveles) { setLoadingTodosCursos(false); return; }
    const cursosPorNivel = await Promise.all(
      niveles.map(async (n) => {
        const { data: cursos } = await supabase
          .from("cursos")
          .select("*")
          .eq("nivel_id", n.id)
          .order("orden");
        return { ...n, cursos: cursos || [] };
      }),
    );
    setTodosCursos(cursosPorNivel);
    setLoadingTodosCursos(false);
  }

  async function handleSaveCursoGlobal(curso, imagenFile) {
    setCursosSaving(true);
    setErrorCursoGlobal(null);
    try {
      if (editingCursoGlobal) {
        let imagen_url = editingCursoGlobal.imagen_url;
        if (imagenFile) {
          const url = await subirImagen(imagenFile, editingCursoGlobal.id);
          if (url) imagen_url = url;
        }
        const { error } = await supabase.from("cursos").update({ ...curso, imagen_url }).eq("id", editingCursoGlobal.id);
        if (error) { setErrorCursoGlobal("No se pudo actualizar la serie."); setCursosSaving(false); return; }
      } else {
        const { data: nuevoCurso, error } = await supabase
          .from("cursos").insert([curso]).select().single();
        if (error) { setErrorCursoGlobal("No se pudo crear la serie."); setCursosSaving(false); return; }
        if (imagenFile && nuevoCurso?.id) {
          const url = await subirImagen(imagenFile, nuevoCurso.id);
          if (url) {
            await supabase.from("cursos").update({ imagen_url: url }).eq("id", nuevoCurso.id);
          }
        }
      }
      await fetchTodosCursos();
      setIsCursoGlobalModalOpen(false);
      setEditingCursoGlobal(null);
    } catch (e) {
      console.error(e);
      setErrorCursoGlobal("No se pudo guardar la serie.");
    }
    setCursosSaving(false);
  }

  async function handleDeleteCursoGlobal(id) {
    if (!window.confirm("¿Eliminar esta serie? Esta acción no se puede deshacer.")) return;
    await supabase.from("cursos").delete().eq("id", id);
    await fetchTodosCursos();
  }

  // ── Vista Temas ──
  const [todosTemas, setTodosTemas] = useState([]);
  const [loadingTodosTemas, setLoadingTodosTemas] = useState(false);
  const [isTemaGlobalModalOpen, setIsTemaGlobalModalOpen] = useState(false);
  const [editingTemaGlobal, setEditingTemaGlobal] = useState(null);
  const [temasSaving, setTemasSaving] = useState(false);
  const [errorTemaGlobal, setErrorTemaGlobal] = useState(null);
  const [allCursosFlat, setAllCursosFlat] = useState([]);
  const [filtroNivelTema, setFiltroNivelTema] = useState("");
  const [filtroCursoTema, setFiltroCursoTema] = useState("");

  useEffect(() => {
    if (vistaActiva === "temas") fetchTodosTemas();
  }, [vistaActiva]);

  // Resetear filtros cuando se cierra el modal
  useEffect(() => {
    if (!isTemaGlobalModalOpen) {
      setFiltroNivelTema("");
      setFiltroCursoTema("");
    }
  }, [isTemaGlobalModalOpen]);

  async function fetchTodosTemas() {
    setLoadingTodosTemas(true);
    const { data: niveles } = await supabase.from("niveles").select("id, nombre").order("orden");
    if (!niveles) { setLoadingTodosTemas(false); return; }
    const { data: cursosFlat } = await supabase.from("cursos").select("id, titulo, nivel_id").order("orden");
    setAllCursosFlat(cursosFlat || []);
    const temasPorCurso = [];
    for (const n of niveles) {
      const { data: cursos } = await supabase
        .from("cursos")
        .select("id, titulo")
        .eq("nivel_id", n.id)
        .order("orden");
      if (!cursos) continue;
      for (const c of cursos) {
        const { data: temas } = await supabase
          .from("temas")
          .select("*")
          .eq("curso_id", c.id)
          .order("orden");
        temasPorCurso.push({ nivel: n, curso: c, temas: temas || [] });
      }
    }
    setTodosTemas(temasPorCurso);
    setLoadingTodosTemas(false);
  }

  async function handleSaveTemaGlobal(formData) {
    setTemasSaving(true);
    setErrorTemaGlobal(null);
    try {
      if (editingTemaGlobal) {
        const { error } = await supabase.from("temas").update(formData).eq("id", editingTemaGlobal.id);
        if (error) { setErrorTemaGlobal("No se pudo actualizar la academia."); setTemasSaving(false); return; }
      } else {
        const { error } = await supabase.from("temas").insert([formData]);
        if (error) { setErrorTemaGlobal("No se pudo crear la academia."); setTemasSaving(false); return; }
      }
      await fetchTodosTemas();
      setIsTemaGlobalModalOpen(false);
      setEditingTemaGlobal(null);
    } catch (e) {
      console.error(e);
      setErrorTemaGlobal("No se pudo guardar la academia.");
    }
    setTemasSaving(false);
  }

  async function handleDeleteTemaGlobal(id) {
    if (!window.confirm("¿Eliminar esta academia? Esta acción no se puede deshacer.")) return;
    await supabase.from("temas").delete().eq("id", id);
    await fetchTodosTemas();
  }

  // ── Vista Actividades ──
  const [todosActividades, setTodosActividades] = useState([]);
  const [loadingActividades, setLoadingActividades] = useState(false);
  const [isActividadModalOpen, setIsActividadModalOpen] = useState(false);
  const [editingActividad, setEditingActividad] = useState(null);
  const [actividadSaving, setActividadSaving] = useState(false);
  const [errorActividad, setErrorActividad] = useState(null);
  const [allCursosAct, setAllCursosAct] = useState([]);
  const [allTemasAct, setAllTemasAct] = useState([]);
  const [filtroNivel, setFiltroNivel] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");
  const [filtroTema, setFiltroTema] = useState("");
  const [isPreguntasModalOpen, setIsPreguntasModalOpen] = useState(false);
  const [preguntasPasoTarget, setPreguntasPasoTarget] = useState(null);
  const [preguntasList, setPreguntasList] = useState([]);

  useEffect(() => {
    if (vistaActiva === "actividades") fetchActividades();
  }, [vistaActiva]);

  // Resetear filtros cuando se cierra el modal
  useEffect(() => {
    if (!isActividadModalOpen) {
      setFiltroNivel("");
      setFiltroCurso("");
      setFiltroTema("");
    }
  }, [isActividadModalOpen]);

  async function fetchActividades() {
    setLoadingActividades(true);
    const { data: cursos } = await supabase.from("cursos").select("id, titulo, nivel_id").order("orden");
    setAllCursosAct(cursos || []);
    const { data: temas } = await supabase.from("temas").select("id, titulo, curso_id").order("orden");
    setAllTemasAct(temas || []);

    const { data } = await supabase
      .from("pasos")
      .select("*, temas(id, titulo, curso_id)")
      .order("created_at", { ascending: false });
    const enriquecidas = (data || []).map((a) => {
      const tema = (temas || []).find((t) => t.id === a.tema_id);
      const curso = tema ? (cursos || []).find((c) => c.id === tema.curso_id) : null;
      return { ...a, temaNombre: tema?.titulo || "?", cursoNombre: curso?.titulo || "?" };
    });
    setTodosActividades(enriquecidas);
    setLoadingActividades(false);
  }

  async function handleSaveActividad(formData) {
    setActividadSaving(true);
    setErrorActividad(null);
    try {
      const payload = {
        ...formData,
        tema_id: formData.tema_id ? parseInt(formData.tema_id) : null,
      };
      if (editingActividad) {
        const { error } = await supabase.from("pasos").update(payload).eq("id", editingActividad.id);
        if (error) { setErrorActividad("No se pudo actualizar la actividad."); setActividadSaving(false); return; }
      } else {
        const { error } = await supabase.from("pasos").insert([payload]);
        if (error) { setErrorActividad("No se pudo crear la actividad."); setActividadSaving(false); return; }
      }
      await fetchActividades();
      setIsActividadModalOpen(false);
      setEditingActividad(null);
    } catch (e) {
      console.error(e);
      setErrorActividad("No se pudo guardar la actividad.");
    }
    setActividadSaving(false);
  }

  async function handleDeleteActividad(id) {
    if (!window.confirm("¿Eliminar esta actividad? Esta acción no se puede deshacer.")) return;
    await supabase.from("pasos").delete().eq("id", id);
    await fetchActividades();
  }

  // ── Gestión de Preguntas (Quiz) ──
  async function abrirGestionPreguntas(paso) {
    setPreguntasPasoTarget(paso);
    const { data } = await getPreguntasPorPaso(paso.id);
    const lista = data || [];
    // es_correcta vive en opciones_correctas (solo admin): la derivamos localmente
    const { data: correctas } = await getRespuestasCorrectas(lista.map(p => p.id));
    const mapa = {};
    (correctas || []).forEach(r => { mapa[r.pregunta_id] = r.opcion_id; });
    setPreguntasList(lista.map(p => ({
      ...p,
      opciones_respuesta: (p.opciones_respuesta || []).map(o => ({ ...o, es_correcta: mapa[p.id] === o.id }))
    })));
    setIsPreguntasModalOpen(true);
  }

  async function handleAddPregunta() {
    if (!preguntasPasoTarget) return;
    const { data } = await createPregunta({ paso_id: preguntasPasoTarget.id, texto: "Nueva pregunta", orden: preguntasList.length + 1 });
    if (data) {
      const opcion = await createOpcion({ pregunta_id: data.id, texto: "Opción 1" });
      if (opcion.data) {
        await setOpcionCorrecta(data.id, opcion.data.id);
        data.opciones_respuesta = [{ ...opcion.data, es_correcta: true }];
      } else {
        data.opciones_respuesta = [];
      }
      setPreguntasList(prev => [...prev, data]);
    }
  }

  async function handleUpdatePreguntaTexto(id, texto) {
    await updatePregunta(id, { texto });
    setPreguntasList(prev => prev.map(p => p.id === id ? { ...p, texto } : p));
  }

  async function handleDeletePregunta(id) {
    if (!window.confirm("¿Eliminar esta pregunta y todas sus opciones?")) return;
    await deletePregunta(id);
    setPreguntasList(prev => prev.filter(p => p.id !== id));
  }

  async function handleAddOpcion(preguntaId) {
    const preg = preguntasList.find(p => p.id === preguntaId);
    const num = (preg?.opciones_respuesta?.length || 0) + 1;
    const { data } = await createOpcion({ pregunta_id: preguntaId, texto: `Opción ${num}` });
    if (data) {
      setPreguntasList(prev => prev.map(p => p.id === preguntaId ? { ...p, opciones_respuesta: [...(p.opciones_respuesta || []), { ...data, es_correcta: false }] } : p));
    }
  }

  async function handleUpdateOpcionTexto(opcionId, texto) {
    await updateOpcion(opcionId, { texto });
    setPreguntasList(prev => prev.map(p => ({ ...p, opciones_respuesta: (p.opciones_respuesta || []).map(o => o.id === opcionId ? { ...o, texto } : o) })));
  }

  async function handleSetOpcionCorrecta(preguntaId, opcionId) {
    // La respuesta correcta vive en opciones_correctas (solo admin vía RLS)
    await setOpcionCorrecta(preguntaId, opcionId);
    setPreguntasList(prev => prev.map(p => p.id === preguntaId ? {
      ...p,
      opciones_respuesta: (p.opciones_respuesta || []).map(o => ({ ...o, es_correcta: o.id === opcionId }))
    } : p));
  }

  async function handleDeleteOpcion(opcionId) {
    await deleteOpcion(opcionId);
    setPreguntasList(prev => prev.map(p => ({ ...p, opciones_respuesta: (p.opciones_respuesta || []).filter(o => o.id !== opcionId) })));
  }

  // ── Vista Progreso ──
  const [progresoEstudiantes, setProgresoEstudiantes] = useState([]);
  const [loadingProgreso, setLoadingProgreso] = useState(false);
  const [filtroNivelProg, setFiltroNivelProg] = useState("");
  const [filtroEstudianteProg, setFiltroEstudianteProg] = useState("");
  const [progresoDetallado, setProgresoDetallado] = useState(null);

  useEffect(() => {
    if (vistaActiva === "progreso") fetchProgreso();
  }, [vistaActiva]);

  async function fetchProgreso() {
    setLoadingProgreso(true);
    const { data: ests } = await supabase.from("estudiantes").select("*, niveles(*)").eq("activo", true);
    setProgresoEstudiantes(ests || []);
    setLoadingProgreso(false);
  }

  async function cargarDetalleProgreso(estudianteId) {
    setLoadingProgreso(true);

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("id")
      .eq("estudiante_id", estudianteId)
      .single();
    const userId = perfil?.id;

    let approvedActividades = [];
    if (userId) {
      const { data: entregas } = await supabase
        .from("entregas_actividades")
        .select("actividad_id")
        .eq("alumno_id", userId)
        .eq("estado", "aprobada");
      approvedActividades = (entregas || []).map(e => e.actividad_id);
    }

    const { data: niveles } = await supabase.from("niveles").select("*, cursos(*, temas(*, pasos(*, progreso_pasos!left(*))))").order("orden");

    const detalle = niveles.map(n => ({
      ...n,
      cursos: n.cursos.map(c => ({
        ...c,
        temas: c.temas.map(t => {
          const pasos = t.pasos.map(p => {
            const progreso = p.progreso_pasos.find(pp => pp.estudiante_id === estudianteId);
            const enActividades = approvedActividades.includes(p.id);
            const status = progreso?.status === "aprobada" || enActividades ? "aprobada" : (progreso ? progreso.status : "pendiente");
            return { ...p, status };
          });
          const vencido = pasos.length > 0 && pasos.every(p => p.status === "aprobada");
          return { ...t, pasos, vencido };
        }),
        completado: c.temas.length > 0 && c.temas.every(t => t.vencido)
      }))
    }));
    setProgresoDetallado(detalle);
    setLoadingProgreso(false);
  }

  // ── Vista Certificados (admin) ──
  const [adminCertificados, setAdminCertificados] = useState([]);
  const [loadingAdminCert, setLoadingAdminCert] = useState(false);
  const [certFiltroNivel, setCertFiltroNivel] = useState(null);

  useEffect(() => {
    if (vistaActiva === "certificados") {
      fetchAdminCertificados();
      setCertFiltroNivel(null);
    }
  }, [vistaActiva]);

  async function fetchAdminCertificados() {
    setLoadingAdminCert(true);
    const { data } = await getAllCertificados();
    setAdminCertificados(data || []);
    setLoadingAdminCert(false);
  }

  const [selectedNivel, setSelectedNivel] = useState(null);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [selectedTemaId, setSelectedTemaId] = useState(null);
  const [isPasoModalOpen, setIsPasoModalOpen] = useState(false);

  function handleNavigate(key) {
    if (["alumnos", "niveles", "perfiles", "cursos", "temas", "actividades", "progreso", "certificados"].includes(key)) {
      setVistaActiva(key);
      setSelectedNivel(null);
      setSelectedCurso(null);
    }
  }

  const vista = selectedCurso ? "temas"
    : selectedNivel ? "cursos"
    : vistaActiva;

  // ── Niveles ──
  const {
    niveles, loading: loadingNiveles, saving: savingNiveles, error: errorNiveles,
    addNivel, editNivel, removeNivel,
    editingNivel, isModalOpen: isNivelModalOpen,
    startEdit: startEditNivel, startCreate: startCreateNivel,
    closeModal: closeNivelModal,
  } = useNiveles();

  async function handleSaveNivel(formData) {
    const ok = editingNivel
      ? await editNivel(editingNivel.id, formData)
      : await addNivel(formData);
    if (ok) closeNivelModal();
  }

  // ── Cursos ──
  const {
    cursos, loading: loadingCursos, saving: savingCursos, error: errorCursos,
    addCurso, editCurso, removeCurso,
    editingCurso, isModalOpen: isCursoModalOpen,
    startEdit: startEditCurso, startCreate: startCreateCurso,
    closeModal: closeCursoModal,
  } = useCursos(selectedNivel?.id);

  async function handleSaveCurso(curso, imagenFile) {
    const ok = editingCurso
      ? await editCurso(editingCurso.id, curso, imagenFile)
      : await addCurso(curso, imagenFile);
    if (ok) closeCursoModal();
  }

  // ── Temas ──
  const {
    temas, loading: loadingTemas, saving: savingTemas, error: errorTemas,
    addTema, editTema, removeTema,
    editingTema, isModalOpen: isTemaModalOpen,
    startEdit: startEditTema, startCreate: startCreateTema,
    closeModal: closeTemaModal,
  } = useTemas(selectedCurso?.id);

  async function handleSaveTema(formData) {
    const ok = editingTema
      ? await editTema(editingTema.id, formData)
      : await addTema(formData);
    if (ok) closeTemaModal();
  }

  // ── Pasos ──
  const {
    pasosPorTema, saving: savingPasos, error: errorPasos,
    addPaso, editPaso, removePaso,
    editingPaso, startEditPaso, clearEditingPaso, clearError: clearErrorPasos,
  } = usePasos(temas);

  function handleAddPaso(temaId) {
    setSelectedTemaId(temaId);
    clearErrorPasos();
    setIsPasoModalOpen(true);
  }

  function handleEditPaso(paso) {
    setSelectedTemaId(paso.tema_id);
    startEditPaso(paso);
    setIsPasoModalOpen(true);
  }

  async function handleSavePaso(formData) {
    const ok = editingPaso
      ? await editPaso(editingPaso.id, formData)
      : await addPaso(selectedTemaId, formData);
    if (ok) {
      setIsPasoModalOpen(false);
      clearEditingPaso();
    }
  }

  // ── Estudiantes ──
  const {
    estudiantes, loading: loadingEstudiantes, saving: savingEstudiantes, error: errorEstudiantes,
    addEstudiante, editEstudiante, removeEstudiante,
    editingEstudiante, isModalOpen: isEstudianteModalOpen,
    startEdit: startEditEstudiante, startCreate: startCreateEstudiante,
    closeModal: closeEstudianteModal,
    refreshEstudiantes,
  } = useEstudiantes();
  const [filtroNivelAlumnos, setFiltroNivelAlumnos] = useState("");

  useEffect(() => {
    if (!isEstudianteModalOpen) setFiltroNivelAlumnos("");
  }, [isEstudianteModalOpen]);

  // ── Crear acceso al portal ──
  const [crearAccesoEstudiante, setCrearAccesoEstudiante] = useState(null);
  const [accesoForm, setAccesoForm] = useState({ email: "", password: "" });
  const [creandoAcceso, setCreandoAcceso] = useState(false);
  const [accesoError, setAccesoError] = useState("");

  function handleCrearAcceso(est) {
    setCrearAccesoEstudiante(est);
    setAccesoForm({ email: est.email || "", password: "" });
    setAccesoError("");
  }

  async function handleSubmitAcceso(e) {
    e.preventDefault();
    setAccesoError("");
    if (!accesoForm.email || !accesoForm.password) {
      setAccesoError("Completa todos los campos.");
      return;
    }
    if (accesoForm.password.length < 6) {
      setAccesoError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setCreandoAcceso(true);
    const { data, error } = await supabase.auth.signUp({
      email: accesoForm.email,
      password: accesoForm.password,
    });
    if (error) {
      setAccesoError(error.message);
      setCreandoAcceso(false);
      return;
    }
    if (data?.user) {
      await supabase
        .from("perfiles")
        .insert({
          id: data.user.id,
          rol: "estudiante",
          estudiante_id: crearAccesoEstudiante.id,
          nombre_visible: `${crearAccesoEstudiante.nombre} ${crearAccesoEstudiante.apellido}`,
          activo: true,
        });
    }
    setCreandoAcceso(false);
    setCrearAccesoEstudiante(null);
    refreshEstudiantes();
  }

  async function handleSaveEstudiante(formData) {
    const ok = editingEstudiante
      ? await editEstudiante(editingEstudiante.id, formData)
      : await addEstudiante(formData);
    if (ok) closeEstudianteModal();
  }

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      fontFamily: "'EB Garamond', Georgia, serif",
      background: COLORS.marfil,
    }}>
      <Sidebar vista={vista} onNavigate={handleNavigate} onLogout={onLogout} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* ── VISTA TEMAS ── */}
        {selectedCurso ? (
          <>
            <Topbar breadcrumb={`${selectedNivel?.nombre} › ${selectedCurso.titulo} › Academias`}>
              <BtnOutline onClick={() => setSelectedCurso(null)}>← Volver</BtnOutline>
              <BtnGold onClick={startCreateTema}>+ Nueva Academia</BtnGold>
            </Topbar>
            <div style={{ padding: 28 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: COLORS.teal, fontWeight: 400, letterSpacing: 1, margin: "0 0 4px" }}>
                {selectedCurso.titulo}
              </h2>
              <p style={{ fontSize: 13, color: "#888", fontStyle: "italic", margin: "0 0 24px" }}>
                Academias y pasos de esta serie
              </p>
              <hr style={{ border: "none", borderTop: `1px solid ${COLORS.pergamino}`, marginBottom: 24 }} />
              {loadingTemas
                ? <p style={{ color: "#888", fontStyle: "italic" }}>Cargando academias...</p>
                : <TemaList
                    temas={temas}
                    onEdit={startEditTema}
                    onDelete={removeTema}
                    pasosPorTema={pasosPorTema}
                    onEditPaso={handleEditPaso}
                    onDeletePaso={removePaso}
                    onAddPaso={handleAddPaso}
                  />
              }
            </div>
            <Modal open={isTemaModalOpen} onClose={closeTemaModal} title={editingTema ? "Editar Academia" : "Nueva Academia"}>
              <ErrorBanner message={errorTemas} />
              <TemaForm onSave={handleSaveTema} editingTema={editingTema} saving={savingTemas} onClose={closeTemaModal} />
            </Modal>
            <Modal open={isPasoModalOpen} onClose={() => { setIsPasoModalOpen(false); clearEditingPaso(); }} title={editingPaso ? "Editar Paso" : "Nuevo Paso"}>
              <ErrorBanner message={errorPasos} />
              <PasoForm onSave={handleSavePaso} editingPaso={editingPaso} saving={savingPasos} onClose={() => { setIsPasoModalOpen(false); clearEditingPaso(); }} />
            </Modal>
          </>

        ) : selectedNivel ? (
          /* ── VISTA CURSOS ── */
          <>
            <Topbar breadcrumb={`Niveles › ${selectedNivel.nombre}`}>
              <BtnOutline onClick={() => setSelectedNivel(null)}>← Volver</BtnOutline>
              <BtnGold onClick={startCreateCurso}>+ Nueva Serie</BtnGold>
            </Topbar>
            <div style={{ padding: 28 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: COLORS.teal, fontWeight: 400, letterSpacing: 1, margin: "0 0 4px" }}>
                {selectedNivel.nombre}
              </h2>
              <p style={{ fontSize: 13, color: "#888", fontStyle: "italic", margin: "0 0 24px" }}>
                Selecciona una serie para gestionar sus academias
              </p>
              <hr style={{ border: "none", borderTop: `1px solid ${COLORS.pergamino}`, marginBottom: 24 }} />
              {loadingCursos
                ? <p style={{ color: "#888", fontStyle: "italic" }}>Cargando series...</p>
                : <CursoList cursos={cursos} onEdit={startEditCurso} onDelete={removeCurso} onSelect={setSelectedCurso} />
              }
            </div>
            <Modal open={isCursoModalOpen} onClose={closeCursoModal} title={editingCurso ? "Editar Serie" : "Nueva Serie"}>
              <ErrorBanner message={errorCursos} />
              <CursoForm onSave={handleSaveCurso} editingCurso={editingCurso} saving={savingCursos} onClose={closeCursoModal} />
            </Modal>
          </>

        ) : vista === "alumnos" ? (
          /* ── VISTA ALUMNOS ── */
          <>
            <Topbar breadcrumb="Estudiantes">
              <BtnGold onClick={startCreateEstudiante}>+ Nuevo Estudiante</BtnGold>
            </Topbar>
            <div style={{ padding: 28 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: COLORS.teal, fontWeight: 400, letterSpacing: 1, margin: "0 0 4px" }}>
                Estudiantes
              </h2>
              <p style={{ fontSize: 13, color: "#888", fontStyle: "italic", margin: "0 0 24px" }}>
                {estudiantes.length} estudiante{estudiantes.length !== 1 ? "s" : ""} registrado{estudiantes.length !== 1 ? "s" : ""}
              </p>
              <hr style={{ border: "none", borderTop: `1px solid ${COLORS.pergamino}`, marginBottom: 24 }} />

              {/* Filtro */}
              <div style={{ marginBottom: 20 }}>
                <select value={filtroNivelAlumnos} onChange={(e) => setFiltroNivelAlumnos(e.target.value)} style={{ padding: "8px 12px", borderRadius: 2, border: `1px solid ${COLORS.pergamino}` }}>
                  <option value="">Todos los niveles</option>
                  {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                </select>
                <button onClick={() => setFiltroNivelAlumnos("")} style={{ marginLeft: 10, padding: "8px 12px", borderRadius: 2, border: `1px solid ${COLORS.pergamino}`, background: "transparent", cursor: "pointer" }}>Limpiar</button>
              </div>

              {loadingEstudiantes
                ? <p style={{ color: "#888", fontStyle: "italic" }}>Cargando estudiantes...</p>
                : <EstudianteList estudiantes={estudiantes.filter(e => (filtroNivelAlumnos ? e.niveles?.id == filtroNivelAlumnos : true))} onEdit={startEditEstudiante} onDelete={removeEstudiante} onCrearAcceso={handleCrearAcceso} />
              }

              {/* Vincular perfiles */}
              <hr style={{ border: "none", borderTop: `1px solid ${COLORS.pergamino}`, margin: "32px 0 24px" }} />
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: COLORS.teal, fontWeight: 400, letterSpacing: "0.5px", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
                <Link size={16} style={{ color: COLORS.oro }} />
                Vincular perfiles con estudiantes
              </h3>
              <p style={{ fontSize: 12, color: "#999", fontStyle: "italic", margin: "0 0 16px" }}>
                Usuarios registrados en el portal que aún no están vinculados a un estudiante
              </p>

              {perfilesSinLink.length === 0 ? (
                <p style={{ fontSize: 13, color: "#bbb", fontStyle: "italic" }}>
                  No hay perfiles pendientes de vinculación.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {perfilesSinLink.map((p) => {
                    const abierto = profilePicker === p.id;
                    return (
                      <div key={p.id} style={{
                        background: "white", border: `1px solid ${COLORS.pergamino}`,
                        borderRadius: 4, overflow: "hidden",
                      }}>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 16px",
                        }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: "rgba(201,162,74,0.12)", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <UserCheck size={16} style={{ color: COLORS.oro }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: 13, fontFamily: "'Cinzel', serif", color: COLORS.teal }}>
                              {p.nombre_visible || "Sin nombre"}
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: "#999", fontStyle: "italic" }}>
                              rol: {p.rol}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => handleCrearYVincular(p.id, p.nombre_visible)}
                              disabled={vinculando}
                              style={{
                                background: "#276749", color: "white",
                                border: "none", padding: "7px 14px", borderRadius: 2,
                                fontFamily: "'Cinzel', serif", fontSize: 10,
                                letterSpacing: "1px", fontWeight: 600, cursor: "pointer",
                                opacity: vinculando ? 0.6 : 1, whiteSpace: "nowrap",
                              }}
                            >
                              + Crear estudiante
                            </button>
                            <button
                              onClick={() => setProfilePicker(abierto ? null : p.id)}
                              style={{
                                background: abierto ? COLORS.teal : COLORS.marfil,
                                color: abierto ? "white" : COLORS.teal,
                                border: `1px solid ${abierto ? COLORS.teal : COLORS.pergamino}`,
                                padding: "7px 14px", borderRadius: 2,
                                fontFamily: "'Cinzel', serif", fontSize: 10,
                                letterSpacing: "1px", fontWeight: 600, cursor: "pointer",
                                whiteSpace: "nowrap", transition: "all 0.15s",
                              }}
                            >
                              {abierto ? "Cancelar" : "Vincular con..."}
                            </button>
                          </div>
                        </div>

                        {abierto && (
                          <div style={{
                            borderTop: `1px solid ${COLORS.pergamino}`,
                            padding: "12px 16px", background: COLORS.marfil,
                          }}>
                            <p style={{ fontSize: 11, color: "#888", fontStyle: "italic", marginBottom: 10 }}>
                              Selecciona un estudiante para vincular:
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {estudiantes.length === 0 ? (
                                <p style={{ fontSize: 12, color: "#bbb", fontStyle: "italic" }}>
                                  No hay estudiantes registrados. Crea uno primero.
                                </p>
                              ) : (
                                estudiantes.map((e) => (
                                  <div
                                    key={e.id}
                                    onClick={() => handleVincularCon(p.id, e.id)}
                                    style={{
                                      display: "flex", alignItems: "center", gap: 10,
                                      padding: "8px 12px", background: "white",
                                      border: `1px solid ${COLORS.pergamino}`,
                                      borderRadius: 2, cursor: "pointer",
                                      transition: "all 0.1s",
                                    }}
                                    onMouseEnter={(ev) => {
                                      ev.currentTarget.style.borderColor = COLORS.oro;
                                      ev.currentTarget.style.background = "rgba(201,162,74,0.06)";
                                    }}
                                    onMouseLeave={(ev) => {
                                      ev.currentTarget.style.borderColor = COLORS.pergamino;
                                      ev.currentTarget.style.background = "white";
                                    }}
                                  >
                                    <div style={{
                                      width: 28, height: 28, borderRadius: "50%",
                                      background: "rgba(26,58,74,0.08)", flexShrink: 0,
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      fontFamily: "'Cinzel', serif", fontSize: 11,
                                      color: COLORS.teal, fontWeight: 600,
                                    }}>
                                      {e.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{
                                      fontSize: 13, fontFamily: "'Cinzel', serif",
                                      color: COLORS.teal, letterSpacing: "0.3px",
                                    }}>
                                      {e.nombre} {e.apellido}
                                    </span>
                                    {e.niveles && (
                                      <span style={{
                                        fontSize: 9, color: COLORS.oro,
                                        fontFamily: "'Cinzel', serif", marginLeft: "auto",
                                        letterSpacing: "1px",
                                      }}>
                                        {e.niveles.nombre}
                                      </span>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <Modal open={isEstudianteModalOpen} onClose={closeEstudianteModal} title={editingEstudiante ? "Editar Estudiante" : "Nuevo Estudiante"}>
              <ErrorBanner message={errorEstudiantes} />
              <EstudianteForm
                onSave={handleSaveEstudiante}
                editingEstudiante={editingEstudiante}
                saving={savingEstudiantes}
                onClose={closeEstudianteModal}
                niveles={niveles}
              />
            </Modal>

            {/* Modal crear acceso al portal */}
            <Modal open={!!crearAccesoEstudiante} onClose={() => setCrearAccesoEstudiante(null)} title="Crear acceso al portal">
              <form onSubmit={handleSubmitAcceso}>
                <p style={{ fontSize: 13, color: "#888", fontStyle: "italic", marginBottom: 16 }}>
                  Creando cuenta para: <strong style={{ color: "#1A3A4A" }}>{crearAccesoEstudiante?.nombre} {crearAccesoEstudiante?.apellido}</strong>
                </p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "'Cinzel', serif", color: "#1A3A4A", letterSpacing: "1px", marginBottom: 6 }}>
                    Correo electrónico
                  </label>
                  <input type="email" value={accesoForm.email} onChange={(e) => setAccesoForm(p => ({...p, email: e.target.value}))}
                    placeholder="correo@ejemplo.com" required
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #D6D0C4", borderRadius: 2, fontSize: 14, outline: "none", background: "white", color: "#1A3A4A", boxSizing: "border-box", fontFamily: "'EB Garamond', Georgia, serif" }} />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "'Cinzel', serif", color: "#1A3A4A", letterSpacing: "1px", marginBottom: 6 }}>
                    Contraseña temporal
                  </label>
                  <input type="password" value={accesoForm.password} onChange={(e) => setAccesoForm(p => ({...p, password: e.target.value}))}
                    placeholder="Mínimo 6 caracteres" required minLength={6}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #D6D0C4", borderRadius: 2, fontSize: 14, outline: "none", background: "white", color: "#1A3A4A", boxSizing: "border-box", fontFamily: "'EB Garamond', Georgia, serif" }} />
                </div>
                {accesoError && (
                  <p style={{ fontSize: 13, color: "#a32d2d", marginBottom: 16, fontStyle: "italic" }}>{accesoError}</p>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" disabled={creandoAcceso} style={{
                    flex: 1, background: "#C9A24A", color: "#1A3A4A", border: "none",
                    padding: "10px 0", borderRadius: 2, fontFamily: "'Cinzel', serif",
                    fontSize: 11, letterSpacing: "1px", fontWeight: 600,
                    cursor: creandoAcceso ? "not-allowed" : "pointer", opacity: creandoAcceso ? 0.7 : 1,
                  }}>
                    {creandoAcceso ? "Creando..." : "Crear acceso"}
                  </button>
                  <button type="button" onClick={() => setCrearAccesoEstudiante(null)} style={{
                    flex: 1, background: "transparent", color: "#1A3A4A",
                    border: "1px solid #D6D0C4", padding: "10px 0",
                    borderRadius: 2, fontFamily: "'Cinzel', serif", fontSize: 11,
                    letterSpacing: "1px", cursor: "pointer",
                  }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </Modal>
          </>

        ) : vista === "perfiles" ? (
          /* ── VISTA PERFILES ── */
          <>
            <Topbar breadcrumb="Gestión de Perfiles" />
            <div style={{ padding: 28 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: COLORS.teal, fontWeight: 400, letterSpacing: 1, margin: "0 0 4px" }}>
                Perfiles de acceso
              </h2>
              <p style={{ fontSize: 13, color: "#888", fontStyle: "italic", margin: "0 0 24px" }}>
                {perfiles.length} perfil{perfiles.length !== 1 ? "es" : ""} registrado{perfiles.length !== 1 ? "s" : ""}
              </p>
              <hr style={{ border: "none", borderTop: `1px solid ${COLORS.pergamino}`, marginBottom: 24 }} />
              {loadingPerfiles ? (
                <p style={{ color: "#888", fontStyle: "italic" }}>Cargando perfiles...</p>
              ) : perfiles.length === 0 ? (
                <p style={{ fontSize: 13, color: "#bbb", fontStyle: "italic" }}>No hay perfiles registrados.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {perfiles.map((p) => (
                    <React.Fragment key={p.id}>
                    <div style={{
                      background: "white", border: `1px solid ${COLORS.pergamino}`,
                      borderRadius: 4, padding: "14px 18px",
                      display: "flex", alignItems: "center", gap: 14,
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 13, fontFamily: "'Cinzel', serif", color: COLORS.teal }}>
                          {p.nombre_visible || "Sin nombre"}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#999", fontStyle: "italic" }}>
                          {p.estudiantes
                            ? `Vinculado a: ${p.estudiantes.nombre} ${p.estudiantes.apellido}`
                            : "Sin vincular"}
                        </p>
                      </div>

                      {/* Rol */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, color: "#888", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>
                          Rol
                        </span>
                        <select
                          value={p.rol}
                          onChange={(e) => handleChangeRol(p.id, e.target.value)}
                          disabled={savingPerfilId === p.id}
                          style={{
                            padding: "5px 8px", fontSize: 11, borderRadius: 2,
                            border: `1px solid ${COLORS.pergamino}`,
                            fontFamily: "'Cinzel', serif", color: COLORS.teal,
                            background: "white", cursor: "pointer",
                            opacity: savingPerfilId === p.id ? 0.6 : 1,
                          }}
                        >
                          <option value="estudiante">Estudiante</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      {/* Activo / Inactivo */}
                      <button
                        onClick={() => handleToggleActivo(p.id, !p.activo)}
                        disabled={savingPerfilId === p.id}
                        style={{
                          background: p.activo ? "#276749" : "#a32d2d",
                          color: "white", border: "none", padding: "6px 12px",
                          borderRadius: 2, fontSize: 10, fontFamily: "'Cinzel', serif",
                          letterSpacing: "1px", cursor: "pointer", whiteSpace: "nowrap",
                          opacity: savingPerfilId === p.id ? 0.6 : 1,
                        }}
                      >
                        {p.activo ? "Activo" : "Inactivo"}
                      </button>

                      {/* Desvincular (solo si tiene estudiante vinculado) */}
                      {p.estudiantes && (
                        <button
                          onClick={() => handleDesvincular(p.id)}
                          disabled={savingPerfilId === p.id}
                          style={{
                            background: "transparent", color: COLORS.teal,
                            border: `1px solid ${COLORS.pergamino}`,
                            padding: "6px 12px", borderRadius: 2, fontSize: 10,
                            fontFamily: "'Cinzel', serif", letterSpacing: "1px",
                            cursor: "pointer", whiteSpace: "nowrap",
                            opacity: savingPerfilId === p.id ? 0.6 : 1,
                          }}
                        >
                          Desvincular
                        </button>
                      )}

                      {/* Resetear contraseña */}
                      <button
                        onClick={() => {
                          setResetPassPerfil(p.id);
                          setResetPassEmail("");
                          setResetPassMsg("");
                        }}
                        style={{
                          background: "transparent", color: "#a32d2d",
                          border: `1px solid #e8c8c8`,
                          padding: "6px 12px", borderRadius: 2, fontSize: 10,
                          fontFamily: "'Cinzel', serif", letterSpacing: "1px",
                          cursor: "pointer", whiteSpace: "nowrap",
                        }}
                      >
                        Reset pass
                      </button>

                      {/* Eliminar perfil */}
                      <button
                        onClick={() => handleEliminarPerfil(p.id)}
                        disabled={eliminandoPerfil}
                        style={{
                          background: "#a32d2d", color: "white", border: "none",
                          padding: "6px 12px", borderRadius: 2, fontSize: 10,
                          fontFamily: "'Cinzel', serif", letterSpacing: "1px",
                          cursor: "pointer", whiteSpace: "nowrap",
                          opacity: eliminandoPerfil ? 0.6 : 1,
                        }}
                      >
                        {eliminandoPerfil ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>

                    {/* ── Inline reset password form ── */}
                    {resetPassPerfil === p.id && (
                      <div style={{
                        borderTop: `1px solid ${COLORS.pergamino}`,
                        padding: "12px 18px", background: COLORS.marfil,
                      }}>
                        <p style={{ fontSize: 11, color: "#888", fontStyle: "italic", marginBottom: 10 }}>
                          Ingresa el correo del usuario para enviarle un enlace de recuperación:
                        </p>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input
                            type="email"
                            value={resetPassEmail}
                            onChange={(e) => setResetPassEmail(e.target.value)}
                            placeholder="correo@ejemplo.com"
                            style={{
                              flex: 1, padding: "8px 10px", border: `1px solid ${COLORS.pergamino}`,
                              borderRadius: 2, fontSize: 13, outline: "none",
                              fontFamily: "'EB Garamond', Georgia, serif", color: COLORS.teal,
                            }}
                          />
                          <button
                            onClick={handleSendReset}
                            disabled={!resetPassEmail || resetPassSending}
                            style={{
                              background: COLORS.oro, color: COLORS.teal, border: "none",
                              padding: "8px 16px", borderRadius: 2, fontSize: 10,
                              fontFamily: "'Cinzel', serif", letterSpacing: "1px",
                              fontWeight: 600, cursor: "pointer",
                              opacity: !resetPassEmail || resetPassSending ? 0.6 : 1,
                            }}
                          >
                            {resetPassSending ? "Enviando..." : "Enviar"}
                          </button>
                          <button
                            onClick={() => setResetPassPerfil(null)}
                            style={{
                              background: "transparent", color: COLORS.teal,
                              border: `1px solid ${COLORS.pergamino}`,
                              padding: "8px 12px", borderRadius: 2, fontSize: 10,
                              fontFamily: "'Cinzel', serif", cursor: "pointer",
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                        {resetPassMsg && (
                          <p style={{
                            fontSize: 12, marginTop: 8, fontStyle: "italic",
                            color: resetPassMsg.startsWith("Error") ? "#a32d2d" : "#276749",
                          }}>
                            {resetPassMsg}
                          </p>
                        )}
                      </div>
                    )}

                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </>

        ) : vista === "cursos" ? (
          /* ── VISTA TODOS LOS CURSOS ── */
          <>
            <Topbar breadcrumb="Todas las Series">
              <BtnGold onClick={() => {
                setEditingCursoGlobal(null);
                setErrorCursoGlobal(null);
                setIsCursoGlobalModalOpen(true);
              }}>+ Nueva Serie</BtnGold>
            </Topbar>
            <div style={{ padding: 28 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: COLORS.teal, fontWeight: 400, letterSpacing: 1, margin: "0 0 4px" }}>
                Cursos
              </h2>
              <p style={{ fontSize: 13, color: "#888", fontStyle: "italic", margin: "0 0 24px" }}>
                Gestiona todos los cursos del programa
              </p>
              <hr style={{ border: "none", borderTop: `1px solid ${COLORS.pergamino}`, marginBottom: 24 }} />
              
              {/* Filtro */}
              <div style={{ marginBottom: 20 }}>
                <select value={filtroNivelCursos} onChange={(e) => setFiltroNivelCursos(e.target.value)} style={{ padding: "8px 12px", borderRadius: 2, border: `1px solid ${COLORS.pergamino}` }}>
                  <option value="">Todos los niveles</option>
                  {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                </select>
              </div>

              {loadingTodosCursos ? (
                <p style={{ color: "#888", fontStyle: "italic" }}>Cargando series...</p>
              ) : todosCursos.filter(n => (filtroNivelCursos ? n.id == filtroNivelCursos : true)).length === 0 ? (
                <p style={{ fontSize: 13, color: "#bbb", fontStyle: "italic" }}>No hay series registradas.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {todosCursos.filter(n => (filtroNivelCursos ? n.id == filtroNivelCursos : true)).map((nivel) => (
                    <div key={nivel.id}>
                      <h3 style={{
                        fontFamily: "'Cinzel', serif", fontSize: 14, color: COLORS.oro,
                        fontWeight: 400, letterSpacing: "1px", margin: "0 0 12px",
                        borderBottom: `1px solid ${COLORS.pergamino}`, paddingBottom: 8,
                      }}>
                        {nivel.nombre}
                      </h3>
                      {nivel.cursos.length === 0 ? (
                        <p style={{ fontSize: 12, color: "#bbb", fontStyle: "italic", marginLeft: 12 }}>
                          Sin cursos
                        </p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {nivel.cursos.map((c) => (
                            <div key={c.id} style={{
                              background: "white", border: `1px solid ${COLORS.pergamino}`,
                              borderRadius: 4, padding: "12px 16px",
                              display: "flex", alignItems: "center", gap: 14,
                            }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: 13, fontFamily: "'Cinzel', serif", color: COLORS.teal }}>
                                  {c.titulo}
                                </p>
                                {c.descripcion && (
                                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888", fontStyle: "italic" }}>
                                    {c.descripcion}
                                  </p>
                                )}
                                {c.orden > 0 && (
                                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#999" }}>
                                    Orden: {c.orden}
                                  </p>
                                )}
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  onClick={() => {
                                    setEditingCursoGlobal(c);
                                    setErrorCursoGlobal(null);
                                    setIsCursoGlobalModalOpen(true);
                                  }}
                                  style={{
                                    background: "transparent", color: COLORS.oro,
                                    border: `1px solid ${COLORS.oro}`, padding: "6px 12px",
                                    borderRadius: 2, fontSize: 10, fontFamily: "'Cinzel', serif",
                                    letterSpacing: "1px", cursor: "pointer",
                                  }}
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteCursoGlobal(c.id)}
                                  style={{
                                    background: "#a32d2d", color: "white", border: "none",
                                    padding: "6px 12px", borderRadius: 2, fontSize: 10,
                                    fontFamily: "'Cinzel', serif", letterSpacing: "1px", cursor: "pointer",
                                  }}
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Modal open={isCursoGlobalModalOpen} onClose={() => { setIsCursoGlobalModalOpen(false); setEditingCursoGlobal(null); }} title={editingCursoGlobal ? "Editar Serie" : "Nueva Serie"}>
              <ErrorBanner message={errorCursoGlobal} />
              <CursoForm onSave={handleSaveCursoGlobal} editingCurso={editingCursoGlobal} saving={cursosSaving} onClose={() => { setIsCursoGlobalModalOpen(false); setEditingCursoGlobal(null); }} niveles={niveles} />
            </Modal>
          </>

        ) : vista === "temas" ? (
          /* ── VISTA TODOS LOS TEMAS ── */
          <>
            <Topbar breadcrumb="Todas las Academias">
              <BtnGold onClick={() => {
                setEditingTemaGlobal(null);
                setErrorTemaGlobal(null);
                setIsTemaGlobalModalOpen(true);
              }}>+ Nueva Academia</BtnGold>
            </Topbar>
            <div style={{ padding: 28 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: COLORS.teal, fontWeight: 400, letterSpacing: 1, margin: "0 0 4px" }}>
                Temas
              </h2>
              <p style={{ fontSize: 13, color: "#888", fontStyle: "italic", margin: "0 0 24px" }}>
                Gestiona todos los temas del programa
              </p>
              <hr style={{ border: "none", borderTop: `1px solid ${COLORS.pergamino}`, marginBottom: 24 }} />

              {/* Filtros */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <select value={filtroNivelTema} onChange={(e) => { setFiltroNivelTema(e.target.value); setFiltroCursoTema(""); }} style={{ padding: "8px 12px", borderRadius: 2, border: `1px solid ${COLORS.pergamino}` }}>
                  <option value="">Todos los niveles</option>
                  {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                </select>
                <select value={filtroCursoTema} onChange={(e) => setFiltroCursoTema(e.target.value)} style={{ padding: "8px 12px", borderRadius: 2, border: `1px solid ${COLORS.pergamino}` }} disabled={!filtroNivelTema}>
                  <option value="">Todas las series</option>
                  {allCursosFlat.filter(c => c.nivel_id == filtroNivelTema).map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                </select>
                <button onClick={() => { setFiltroNivelTema(""); setFiltroCursoTema(""); }} style={{ padding: "8px 12px", borderRadius: 2, border: `1px solid ${COLORS.pergamino}`, background: "transparent", cursor: "pointer" }}>Limpiar</button>
              </div>

              {loadingTodosTemas ? (
                <p style={{ color: "#888", fontStyle: "italic" }}>Cargando academias...</p>
              ) : todosTemas.filter(item => {
                return (filtroNivelTema ? item.nivel.id == filtroNivelTema : true) &&
                       (filtroCursoTema ? item.curso.id == filtroCursoTema : true);
              }).length === 0 ? (
                <p style={{ fontSize: 13, color: "#bbb", fontStyle: "italic" }}>No se encontraron academias.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {todosTemas.filter(item => {
                    return (filtroNivelTema ? item.nivel.id == filtroNivelTema : true) &&
                           (filtroCursoTema ? item.curso.id == filtroCursoTema : true);
                  }).map((item, i) => (
                    <div key={i}>
                      <h3 style={{
                        fontFamily: "'Cinzel', serif", fontSize: 12, color: COLORS.oro,
                        fontWeight: 400, letterSpacing: "1px", margin: "0 0 6px",
                      }}>
                        {item.nivel.nombre} › {item.curso.titulo}
                      </h3>
                      {item.temas.length === 0 ? (
                        <p style={{ fontSize: 12, color: "#bbb", fontStyle: "italic", marginLeft: 12 }}>
                          Sin temas
                        </p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginLeft: 12 }}>
                          {item.temas.map((t) => (
                            <div key={t.id} style={{
                              background: "white", border: `1px solid ${COLORS.pergamino}`,
                              borderRadius: 4, padding: "10px 14px",
                              display: "flex", alignItems: "center", gap: 14,
                            }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: 13, fontFamily: "'Cinzel', serif", color: COLORS.teal }}>
                                  {t.orden}. {t.titulo}
                                </p>
                                {t.descripcion && (
                                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888", fontStyle: "italic" }}>
                                    {t.descripcion}
                                  </p>
                                )}
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  onClick={() => {
                                    setEditingTemaGlobal(t);
                                    setErrorTemaGlobal(null);
                                    setIsTemaGlobalModalOpen(true);
                                  }}
                                  style={{
                                    background: "transparent", color: COLORS.oro,
                                    border: `1px solid ${COLORS.oro}`, padding: "6px 12px",
                                    borderRadius: 2, fontSize: 10, fontFamily: "'Cinzel', serif",
                                    letterSpacing: "1px", cursor: "pointer",
                                  }}
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteTemaGlobal(t.id)}
                                  style={{
                                    background: "#a32d2d", color: "white", border: "none",
                                    padding: "6px 12px", borderRadius: 2, fontSize: 10,
                                    fontFamily: "'Cinzel', serif", letterSpacing: "1px", cursor: "pointer",
                                  }}
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Modal open={isTemaGlobalModalOpen} onClose={() => { setIsTemaGlobalModalOpen(false); setEditingTemaGlobal(null); }} title={editingTemaGlobal ? "Editar Academia" : "Nueva Academia"}>
              <ErrorBanner message={errorTemaGlobal} />
              <TemaForm onSave={handleSaveTemaGlobal} editingTema={editingTemaGlobal} saving={temasSaving} onClose={() => { setIsTemaGlobalModalOpen(false); setEditingTemaGlobal(null); }} niveles={niveles} cursos={allCursosFlat} />
            </Modal>
          </>
        ) : vista === "actividades" ? (
          /* ── VISTA ACTIVIDADES ── */
          <>
            <Topbar breadcrumb="Actividades">
              <BtnGold onClick={() => {
                setEditingActividad(null);
                setErrorActividad(null);
                setIsActividadModalOpen(true);
              }}>+ Nueva Actividad</BtnGold>
            </Topbar>
            <div style={{ padding: 28 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: COLORS.teal, fontWeight: 400, letterSpacing: 1, margin: "0 0 4px" }}>
                Actividades
              </h2>
              <p style={{ fontSize: 13, color: "#888", fontStyle: "italic", margin: "0 0 24px" }}>
                Gestiona todas las actividades del programa
              </p>
              <hr style={{ border: "none", borderTop: `1px solid ${COLORS.pergamino}`, marginBottom: 24 }} />

              {/* Filtros */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <select value={filtroNivel} onChange={(e) => { setFiltroNivel(e.target.value); setFiltroCurso(""); setFiltroTema(""); }} style={{ padding: "8px 12px", borderRadius: 2, border: `1px solid ${COLORS.pergamino}` }}>
                  <option value="">Todos los niveles</option>
                  {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                </select>
                <select value={filtroCurso} onChange={(e) => { setFiltroCurso(e.target.value); setFiltroTema(""); }} style={{ padding: "8px 12px", borderRadius: 2, border: `1px solid ${COLORS.pergamino}` }} disabled={!filtroNivel}>
                  <option value="">Todas las series</option>
                  {allCursosAct.filter(c => c.nivel_id == filtroNivel).map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                </select>
                <select value={filtroTema} onChange={(e) => setFiltroTema(e.target.value)} style={{ padding: "8px 12px", borderRadius: 2, border: `1px solid ${COLORS.pergamino}` }} disabled={!filtroCurso}>
                  <option value="">Todas las academias</option>
                  {allTemasAct.filter(t => t.curso_id == filtroCurso).map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
                </select>
                <button onClick={() => { setFiltroNivel(""); setFiltroCurso(""); setFiltroTema(""); }} style={{ padding: "8px 12px", borderRadius: 2, border: `1px solid ${COLORS.pergamino}`, background: "transparent", cursor: "pointer" }}>Limpiar</button>
              </div>

              {loadingActividades ? (
                <p style={{ color: "#888", fontStyle: "italic" }}>Cargando actividades...</p>
              ) : todosActividades.filter(a => {
                const t = allTemasAct.find(item => item.id === a.tema_id);
                const c = t ? allCursosAct.find(item => item.id === t.curso_id) : null;
                return (filtroNivel ? c?.nivel_id == filtroNivel : true) &&
                       (filtroCurso ? t?.curso_id == filtroCurso : true) &&
                       (filtroTema ? a.tema_id == filtroTema : true);
              }).length === 0 ? (
                <p style={{ fontSize: 13, color: "#bbb", fontStyle: "italic" }}>No se encontraron actividades.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {todosActividades.filter(a => {
                    const t = allTemasAct.find(item => item.id === a.tema_id);
                    const c = t ? allCursosAct.find(item => item.id === t.curso_id) : null;
                    return (filtroNivel ? c?.nivel_id == filtroNivel : true) &&
                           (filtroCurso ? t?.curso_id == filtroCurso : true) &&
                           (filtroTema ? a.tema_id == filtroTema : true);
                  }).map((a) => (
                    <div key={a.id} style={{
                      background: "white", border: `1px solid ${COLORS.pergamino}`,
                      borderRadius: 4, padding: "12px 16px",
                      display: "flex", alignItems: "center", gap: 14,
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 13, fontFamily: "'Cinzel', serif", color: COLORS.teal }}>
                          {a.titulo}
                        </p>
                        <p style={{ margin: "3px 0 0", fontSize: 11, color: "#999", fontStyle: "italic" }}>
                          {a.cursoNombre} › {a.temaNombre}
                        </p>
                        {a.descripcion && (
                          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>
                            {a.descripcion}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => {
                              setEditingActividad(a);
                              setErrorActividad(null);
                              setIsActividadModalOpen(true);
                            }}
                            style={{
                              background: "transparent", color: COLORS.oro,
                              border: `1px solid ${COLORS.oro}`, padding: "6px 12px",
                              borderRadius: 2, fontSize: 10, fontFamily: "'Cinzel', serif",
                              letterSpacing: "1px", cursor: "pointer",
                            }}
                          >
                            Editar
                          </button>
                          {a.tipo === "responder_preguntas" && (
                            <button
                              onClick={() => abrirGestionPreguntas(a)}
                              style={{
                                background: "transparent", color: "#276749",
                                border: "1px solid #276749", padding: "6px 12px",
                                borderRadius: 2, fontSize: 10, fontFamily: "'Cinzel', serif",
                                letterSpacing: "1px", cursor: "pointer",
                              }}
                            >
                              Gestionar Preguntas
                            </button>
                          )}
                        <button
                          onClick={() => handleDeleteActividad(a.id)}
                          style={{
                            background: "#a32d2d", color: "white", border: "none",
                            padding: "6px 12px", borderRadius: 2, fontSize: 10,
                            fontFamily: "'Cinzel', serif", letterSpacing: "1px", cursor: "pointer",
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Modal open={isActividadModalOpen} onClose={() => { setIsActividadModalOpen(false); setEditingActividad(null); }} title={editingActividad ? "Editar Actividad" : "Nueva Actividad"}>
              <ErrorBanner message={errorActividad} />
              <ActividadForm onSave={handleSaveActividad} editingActividad={editingActividad} saving={actividadSaving} onClose={() => { setIsActividadModalOpen(false); setEditingActividad(null); }} niveles={niveles} cursos={allCursosAct} temas={allTemasAct} />
            </Modal>
            <Modal open={isPreguntasModalOpen} onClose={() => { setIsPreguntasModalOpen(false); setPreguntasList([]); setPreguntasPasoTarget(null); }} title={preguntasPasoTarget ? `Preguntas: ${preguntasPasoTarget.titulo}` : "Gestionar Preguntas"}>
              {preguntasList.map((pq, idx) => (
                <div key={pq.id} style={{ marginBottom: 20, padding: 14, background: "white", border: `1px solid ${COLORS.pergamino}`, borderRadius: 4 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontFamily: "'Cinzel', serif", color: COLORS.teal, fontWeight: 600 }}>Pregunta {idx + 1}</span>
                    <button onClick={() => handleDeletePregunta(pq.id)} style={{ marginLeft: "auto", background: "#a32d2d", color: "white", border: "none", padding: "4px 10px", borderRadius: 2, fontSize: 10, cursor: "pointer" }}>Eliminar</button>
                  </div>
                  <textarea
                    defaultValue={pq.texto}
                    onBlur={(e) => handleUpdatePreguntaTexto(pq.id, e.target.value)}
                    rows={2}
                    style={{ width: "100%", padding: "8px 10px", border: `1px solid ${COLORS.pergamino}`, borderRadius: 2, fontSize: 13, outline: "none", marginBottom: 10, boxSizing: "border-box", fontFamily: "'EB Garamond', Georgia, serif" }}
                  />
                  {(pq.opciones_respuesta || []).map((op) => (
                    <div key={op.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <input
                        type="radio"
                        name={`correcta-${pq.id}`}
                        checked={op.es_correcta}
                        onChange={() => handleSetOpcionCorrecta(pq.id, op.id)}
                      />
                      <input
                        defaultValue={op.texto}
                        onBlur={(e) => handleUpdateOpcionTexto(op.id, e.target.value)}
                        style={{ flex: 1, padding: "6px 8px", border: `1px solid ${COLORS.pergamino}`, borderRadius: 2, fontSize: 12, outline: "none", fontFamily: "'EB Garamond', Georgia, serif" }}
                      />
                      <button onClick={() => handleDeleteOpcion(op.id)} style={{ background: "transparent", color: "#a32d2d", border: "none", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                    </div>
                  ))}
                  {(pq.opciones_respuesta || []).length < 4 && (
                    <button onClick={() => handleAddOpcion(pq.id)} style={{ marginTop: 4, background: "transparent", color: "#276749", border: `1px dashed #276749`, padding: "4px 10px", borderRadius: 2, fontSize: 10, cursor: "pointer" }}>+ Agregar opción</button>
                  )}
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={handleAddPregunta} style={{ flex: 1, background: COLORS.oro, color: COLORS.teal, border: "none", padding: "9px 0", borderRadius: 2, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>+ Agregar Pregunta</button>
                <button onClick={() => { setIsPreguntasModalOpen(false); setPreguntasList([]); setPreguntasPasoTarget(null); }} style={{ flex: 1, background: "transparent", color: COLORS.teal, border: `1px solid ${COLORS.pergamino}`, padding: "9px 0", borderRadius: 2, fontFamily: "'Cinzel', serif", fontSize: 11, cursor: "pointer" }}>Cerrar</button>
              </div>
            </Modal>
          </>

        ) : vista === "progreso" ? (
          /* ── VISTA PROGRESO ── */
          <>
            <Topbar breadcrumb="Progreso de Estudiantes" />
            <div style={{ padding: 28 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: COLORS.teal, fontWeight: 400, letterSpacing: 1, margin: "0 0 4px" }}>
                Progreso
              </h2>
              <hr style={{ border: "none", borderTop: `1px solid ${COLORS.pergamino}`, marginBottom: 24 }} />

              {/* Filtros */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <select value={filtroNivelProg} onChange={(e) => { 
                    setFiltroNivelProg(e.target.value);
                    setFiltroEstudianteProg("");
                    setProgresoDetallado(null);
                  }} style={{ padding: "8px 12px", borderRadius: 2, border: `1px solid ${COLORS.pergamino}` }}>
                  <option value="">Todos los niveles</option>
                  {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                </select>

                <select value={filtroEstudianteProg} onChange={(e) => { 
                    setFiltroEstudianteProg(e.target.value); 
                    if(e.target.value) cargarDetalleProgreso(e.target.value);
                    else setProgresoDetallado(null);
                  }} style={{ padding: "8px 12px", borderRadius: 2, border: `1px solid ${COLORS.pergamino}` }}>
                  <option value="">Seleccionar alumno...</option>
                  {progresoEstudiantes
                    .filter(e => filtroNivelProg ? e.niveles?.id == filtroNivelProg : true)
                    .map(e => <option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>)}
                </select>
                <button onClick={() => { setFiltroNivelProg(""); setFiltroEstudianteProg(""); setProgresoDetallado(null); }} style={{ padding: "8px 12px", borderRadius: 2, border: `1px solid ${COLORS.pergamino}`, background: "transparent", cursor: "pointer" }}>Limpiar</button>
              </div>

              {loadingProgreso ? <p>Cargando...</p> : progresoDetallado ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {progresoDetallado
                    .filter(n => filtroNivelProg ? n.id == filtroNivelProg : true)
                    .map(n => (
                    <div key={n.id} style={{ background: "white", padding: 20, border: `1px solid ${COLORS.pergamino}` }}>
                      <h3 style={{ color: COLORS.oro }}>{n.nombre}</h3>
                      {n.cursos.map(c => (
                        <div key={c.id} style={{ marginTop: 10 }}>
                          <p style={{ fontWeight: 600 }}>Serie: {c.titulo} {c.completado ? "✅" : "⏳"}</p>
                          <div style={{ marginLeft: 15 }}>
                            {c.temas.map(t => (
                              <div key={t.id} style={{ marginTop: 5 }}>
                                <p>Academia: {t.titulo} ({t.pasos.filter(p => p.status === 'aprobada').length}/{t.pasos.length} pasos aprobados)</p>
                                <div style={{ height: 6, background: COLORS.pergamino, width: 200 }}><div style={{ height: "100%", background: COLORS.oro, width: `${t.pasos.length > 0 ? (t.pasos.filter(p => p.status === 'aprobada').length / t.pasos.length) * 100 : 0}%` }}></div></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: "#888", fontStyle: "italic" }}>Selecciona un alumno para ver su detalle.</p>}
            </div>
          </>

        ) : vista === "certificados" ? (
          /* ── VISTA CERTIFICADOS (admin) ── */
          <>
            <Topbar breadcrumb="Certificados" />
            <div style={{ padding: 28 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: COLORS.teal, fontWeight: 400, letterSpacing: 1, margin: "0 0 4px" }}>
                Certificados
              </h2>
              <p style={{ fontSize: 13, color: "#888", fontStyle: "italic", margin: "0 0 24px" }}>
                {adminCertificados.length} certificado{adminCertificados.length !== 1 ? "s" : ""} emitido{adminCertificados.length !== 1 ? "s" : ""}
              </p>
              <hr style={{ border: "none", borderTop: `1px solid ${COLORS.pergamino}`, marginBottom: 24 }} />

              {/* Filtro por nivel */}
              {(() => {
                const nivelesUnicos = Object.values(
                  adminCertificados.reduce((acc, c) => {
                    if (c.niveles) acc[c.nivel_id] = c.niveles;
                    return acc;
                  }, {})
                );
                if (nivelesUnicos.length === 0) return null;
                return (
                  <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
                    {nivelesUnicos.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => setCertFiltroNivel(certFiltroNivel === n.id ? null : n.id)}
                        style={{
                          padding: "6px 16px", borderRadius: 20, border: "none",
                          fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: "1px",
                          cursor: "pointer", fontWeight: 600,
                          background: certFiltroNivel === n.id ? COLORS.oro : "white",
                          color: COLORS.teal,
                          boxShadow: `0 0 0 1px ${certFiltroNivel === n.id ? COLORS.oro : COLORS.pergamino}`,
                        }}
                      >
                        {n.nombre}
                      </button>
                    ))}
                  </div>
                );
              })()}

              {loadingAdminCert ? (
                <p style={{ color: "#888", fontStyle: "italic" }}>Cargando certificados...</p>
              ) : adminCertificados.length === 0 ? (
                <p style={{ fontSize: 13, color: "#bbb", fontStyle: "italic" }}>No hay certificados emitidos.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(certFiltroNivel
                    ? adminCertificados.filter((c) => c.nivel_id === certFiltroNivel)
                    : adminCertificados
                  ).map((cert) => (
                    <div key={cert.id} style={{
                      background: "white", border: `1px solid ${COLORS.pergamino}`,
                      borderLeft: `4px solid ${COLORS.oro}`,
                      borderRadius: "0 4px 4px 0", padding: "14px 18px",
                      display: "flex", alignItems: "center", gap: 14,
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: "rgba(201,162,74,0.12)", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontSize: 14, color: COLORS.oro, fontFamily: "'Cinzel', serif", fontWeight: 600 }}>
                          {cert.estudiantes?.nombre?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 13, fontFamily: "'Cinzel', serif", color: COLORS.teal }}>
                          {cert.estudiantes?.nombre || "?"} {cert.estudiantes?.apellido || ""}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#888", fontStyle: "italic" }}>
                          {cert.curso_id
                            ? `Serie: ${cert.cursos?.titulo || "?"}`
                            : `Nivel: ${cert.niveles?.nombre || "?"}`}
                          {' · '}
                          {new Date(cert.emitido_at).toLocaleDateString("es-ES")}
                          {' · '}
                          <span style={{ fontFamily: "monospace", fontSize: 10, color: COLORS.oro }}>
                            {cert.codigo}
                          </span>
                        </p>
                      </div>
                      <span style={{
                        fontSize: 10, padding: "4px 10px", borderRadius: 2,
                        background: cert.estado === "emitido"
                          ? "rgba(39,103,73,0.1)"
                          : cert.estado === "borrador"
                          ? "rgba(201,162,74,0.1)" : "rgba(163,45,45,0.1)",
                        color: cert.estado === "emitido" ? "#276749"
                          : cert.estado === "borrador" ? COLORS.oro : "#a32d2d",
                        fontFamily: "'Cinzel', serif", letterSpacing: "1px",
                      }}>
                        {cert.estado === "emitido" ? "Emitido"
                          : cert.estado === "borrador" ? "Borrador" : "Revocado"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>

        ) : (
          /* ── VISTA NIVELES ── */
          <>
            <Topbar breadcrumb="Niveles de entrenamiento">
              <BtnGold onClick={startCreateNivel}>+ Nuevo Nivel</BtnGold>
            </Topbar>
            <div style={{ padding: 28 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: COLORS.teal, fontWeight: 400, letterSpacing: 1, margin: "0 0 4px" }}>
                Niveles
              </h2>
              <p style={{ fontSize: 13, color: "#888", fontStyle: "italic", margin: "0 0 24px" }}>
                Selecciona un nivel para gestionar sus cursos
              </p>
              <hr style={{ border: "none", borderTop: `1px solid ${COLORS.pergamino}`, marginBottom: 24 }} />
              {loadingNiveles
                ? <p style={{ color: "#888", fontStyle: "italic" }}>Cargando niveles...</p>
                : <NivelList niveles={niveles} onDelete={removeNivel} onEdit={startEditNivel} onSelect={setSelectedNivel} />
              }
            </div>
            <Modal open={isNivelModalOpen} onClose={closeNivelModal} title={editingNivel ? "Editar Nivel" : "Nuevo Nivel"}>
              <ErrorBanner message={errorNiveles} />
              <NivelForm onSave={handleSaveNivel} editingNivel={editingNivel} saving={savingNiveles} onClose={closeNivelModal} />
            </Modal>
          </>
        )}
      </div>
    </div>
  );
}
