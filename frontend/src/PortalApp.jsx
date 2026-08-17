import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { getEstudianteConNivel } from "./services/authService";
import { logout } from "./services/authService";
import { getProgresoPasos } from "./services/progresoService";
import { getCursos } from "./services/cursosService";
import { getTemas } from "./services/temasService";
import { getPasosPorTemas } from "./services/pasosService";
import Login from "./portal/Login";
import PortalLayout from "./portal/PortalLayout";
import Dashboard from "./portal/Dashboard";
import MisCursos from "./portal/MisCursos";
import CursoDetalle from "./portal/CursoDetalle";
import MiProgreso from "./portal/MiProgreso";
import Certificados from "./portal/Certificados";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

export default function PortalApp() {
  const { user, profile, loading: authLoading, refresh } = useAuth();
  const [vista, setVista] = useState("inicio");
  const [estudiante, setEstudiante] = useState(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [pasosCompletados, setPasosCompletados] = useState(0);
  const [totalPasos, setTotalPasos] = useState(0);
  const [nivelesCompletados] = useState(0);
  const [totalCursos, setTotalCursos] = useState(0);
  async function loadStudentData(estudianteId, nivelId) {
    const [pasosRes, cursosRes] = await Promise.all([
      getProgresoPasos(estudianteId),
      getCursos(nivelId),
    ]);
    setPasosCompletados((pasosRes.data || []).length);

    const cursos = cursosRes.data || [];
    setTotalCursos(cursos.length);

    const temasPromises = cursos.map((c) => getTemas(c.id));
    const temasResults = await Promise.all(temasPromises);
    const temaIds = temasResults.flatMap((r) => (r.data || []).map((t) => t.id));

    if (temaIds.length > 0) {
      const { data: todosPasos } = await getPasosPorTemas(temaIds);
      setTotalPasos(todosPasos?.length || 0);
    } else {
      setTotalPasos(0);
    }
  }

  useEffect(() => {
    if (!user || !profile) return;
    if (profile.rol !== "estudiante") return;

    if (!profile.estudiante_id) {
      setEstudiante(null);
      return;
    }

    async function init() {
      const { data: est } = await getEstudianteConNivel(profile.estudiante_id);
      setEstudiante(est);
      if (est?.nivel_id) {
        await loadStudentData(est.id, est.nivel_id);
      }
    }
    init();
  }, [user, profile]);

  async function handleLogin() {
    await refresh();
  }

  async function handleLogout() {
    await logout();
    setEstudiante(null);
    setVista("inicio");
    refresh();
  }

  function handleNavigate(key) {
    setCursoSeleccionado(null);
    setReadOnly(false);
    setVista(key);
  }

  function handleSelectCurso(curso, isReadOnly = false) {
    setCursoSeleccionado(curso);
    setReadOnly(isReadOnly);
    setVista("curso-detalle");
  }

  function handleBackFromCurso() {
    setCursoSeleccionado(null);
    setReadOnly(false);
    setVista("cursos");
  }

  // Loading
  if (authLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F5F1E8",
        fontFamily: "'EB Garamond', Georgia, serif",
      }}>
        <p style={{ color: "#888", fontStyle: "italic", fontSize: 15 }}>
          Cargando...
        </p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Logged in but no student profile
  if (!profile || profile.rol !== "estudiante") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#F5F1E8",
        padding: 20,
        fontFamily: "'EB Garamond', Georgia, serif",
      }}>
        <div style={{
          background: "white",
          border: "1px solid #D6D0C4",
          borderTop: "4px solid #C9A24A",
          borderRadius: 4,
          padding: "40px 36px",
          textAlign: "center",
          maxWidth: 400,
        }}>
          <p style={{ fontSize: 16, color: "#1A3A4A", marginBottom: 12 }}>
            {profile
              ? "Tu perfil no tiene acceso al portal de estudiantes."
              : "No se encontró un perfil asociado a tu cuenta."}
          </p>
          <p style={{ fontSize: 13, color: "#999", fontStyle: "italic", marginBottom: 24 }}>
            Contacta con el administrador de la academia.
          </p>
          <button
            onClick={handleLogout}
            style={{
              background: "#C9A24A",
              color: "#1A3A4A",
              border: "none",
              padding: "10px 24px",
              borderRadius: 2,
              fontFamily: "'Cinzel', serif",
              fontSize: 11,
              letterSpacing: "2px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  // Loading student data
  if (!estudiante) {
    const sinAsignar = profile && !profile.estudiante_id;
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.marfil,
        fontFamily: "'EB Garamond', Georgia, serif",
        padding: 20,
      }}>
        {sinAsignar ? (
          <div style={{
            background: "white",
            border: `1px solid ${COLORS.pergamino}`,
            borderTop: `4px solid ${COLORS.oro}`,
            borderRadius: 4,
            padding: "40px 36px",
            textAlign: "center",
            maxWidth: 420,
          }}>
            <p style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 14,
              color: COLORS.teal,
              marginBottom: 12,
              letterSpacing: "0.5px",
            }}>
              Cuenta creada
            </p>
            <p style={{ fontSize: 15, color: "#888", fontStyle: "italic", lineHeight: 1.6, marginBottom: 20 }}>
              Tu cuenta está lista, pero aún no has sido asignado como estudiante.
              Un administrador debe vincular tu perfil. Contacta al equipo pastoral.
            </p>
            <button
              onClick={handleLogout}
              style={{
                background: COLORS.oro,
                color: COLORS.teal,
                border: "none",
                padding: "10px 24px",
                borderRadius: 2,
                fontFamily: "'Cinzel', serif",
                fontSize: 11,
                letterSpacing: "2px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <p style={{ color: "#888", fontStyle: "italic", fontSize: 15 }}>
            Cargando tus datos...
          </p>
        )}
      </div>
    );
  }

  function renderVista() {
    if (vista === "curso-detalle" && cursoSeleccionado) {
      return (
        <CursoDetalle
          curso={cursoSeleccionado}
          estudiante={estudiante}
          readOnly={readOnly}
          onBack={handleBackFromCurso}
        />
      );
    }
    switch (vista) {
      case "inicio":
        return (
          <Dashboard
            estudiante={estudiante}
            pasosCompletados={pasosCompletados}
            totalPasos={totalPasos}
            nivelesCompletados={nivelesCompletados}
            totalCursos={totalCursos}
            onNavigate={handleNavigate}
          />
        );
      case "cursos":
        return (
          <MisCursos
            estudiante={estudiante}
            onSelectCurso={handleSelectCurso}
          />
        );
      case "progreso":
        return <MiProgreso estudiante={estudiante} />;
      case "certificados":
        return <Certificados estudiante={estudiante} />;
      default:
        return (
          <Dashboard
            estudiante={estudiante}
            pasosCompletados={pasosCompletados}
            totalPasos={totalPasos}
            nivelesCompletados={nivelesCompletados}
            totalCursos={totalCursos}
            onNavigate={handleNavigate}
          />
        );
    }
  }

  return (
    <PortalLayout
      vista={vista === "curso-detalle" ? "cursos" : vista}
      onNavigate={handleNavigate}
      estudiante={estudiante}
      onLogout={handleLogout}
    >
      {renderVista()}
    </PortalLayout>
  );
}
