import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { getEstudianteConNivel } from "../services/authService";
import PortalLayout from "./PortalLayout";
import Dashboard from "./Dashboard";
import MisCursos from "./MisCursos";
import CursoDetalle from "./CursoDetalle";
import MiProgreso from "./MiProgreso";
import TemaPage from "./TemaPage";

// La vista de certificados usa jspdf (pesada); se carga bajo demanda.
const Certificados = lazy(() => import("./Certificados"));

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

export default function PortalAppInner({ profile, onLogout }) {
  const [vista, setVista] = useState("inicio");
  const [estudiante, setEstudiante] = useState(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    if (!profile || profile.rol !== "estudiante") return;
    if (!profile.estudiante_id) return;

    async function init() {
      const { data: est } = await getEstudianteConNivel(profile.estudiante_id);
      setEstudiante(est);
    }
    init();
  }, [profile]);

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

  // Sin estudiante_id asignado
  if (!profile.estudiante_id) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.marfil,
        padding: 20,
      }}>
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
          <p style={{ fontSize: 15, color: "#666666", fontStyle: "italic", lineHeight: 1.6, marginBottom: 20 }}>
            Tu cuenta está lista, pero aún no has sido asignado como estudiante.
            Un administrador debe vincular tu perfil. Contacta al equipo pastoral.
          </p>
          <button
            onClick={onLogout}
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
      </div>
    );
  }

  // Cargando datos del estudiante
  if (!estudiante) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.marfil,
      }}>
        <p style={{ color: "#666666", fontStyle: "italic", fontSize: 15 }}>
          Cargando tus datos...
        </p>
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
            onNavigate={handleNavigate}
            onSelectCurso={handleSelectCurso}
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
        return (
          <Suspense fallback={
            <p style={{ color: "#888", fontStyle: "italic", fontSize: 15, padding: 24 }}>
              Cargando certificados...
            </p>
          }>
            <Certificados estudiante={estudiante} />
          </Suspense>
        );
      default:
        return (
          <Dashboard
            estudiante={estudiante}
            onNavigate={handleNavigate}
            onSelectCurso={handleSelectCurso}
          />
        );
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/tema/:temaId" element={
          <TemaPage
            estudiante={estudiante}
            onBack={() => handleNavigate("cursos")}
          />
        } />
        <Route path="*" element={
          <PortalLayout
            vista={vista === "curso-detalle" ? "cursos" : vista}
            onNavigate={handleNavigate}
            estudiante={estudiante}
            onLogout={onLogout}
          >
            {renderVista()}
          </PortalLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
