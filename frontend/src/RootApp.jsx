import { useEffect, useState, lazy, Suspense } from "react";
import { useAuth } from "./hooks/useAuth";
import { logout } from "./services/authService";
import Login from "./portal/Login";

// Code-splitting: el panel de administración, el portal del estudiante y la
// verificación pública de certificados se cargan bajo demanda para reducir
// el tamaño del bundle inicial. Sin cambios de comportamiento visible.
const App = lazy(() => import("./App"));
const PortalAppInner = lazy(() => import("./portal/PortalAppInner"));
const VerificarCertificado = lazy(() => import("./components/VerificarCertificado"));

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

function PantallaCargando({ texto }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: COLORS.marfil,
    }}>
      <p style={{ color: "#888", fontStyle: "italic", fontSize: 15 }}>
        {texto || "Cargando..."}
      </p>
    </div>
  );
}

export default function RootApp() {
  const { user, profile, loading, refresh } = useAuth();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (!loading) setAppReady(true);
  }, [loading]);

  async function handleLogin() {
    await refresh();
  }

  async function handleLogout() {
    await logout();
    await refresh();
  }

  if (loading || !appReady) {
    return <PantallaCargando />;
  }

  // Public verification page
  const params = new URLSearchParams(window.location.search);
  const codigoVerif = params.get("codigo");
  if (codigoVerif) {
    return (
      <Suspense fallback={<PantallaCargando />}>
        <VerificarCertificado codigo={codigoVerif} />
      </Suspense>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Admin / Instructor → panel de administración
  if (profile && (profile.rol === "admin" || profile.rol === "instructor")) {
    return (
      <Suspense fallback={<PantallaCargando texto="Cargando panel de administración..." />}>
        <App onLogout={handleLogout} />
      </Suspense>
    );
  }

  // Estudiante → portal del estudiante
  if (profile && profile.rol === "estudiante") {
    return (
      <Suspense fallback={<PantallaCargando texto="Cargando portal..." />}>
        <PortalAppInner profile={profile} user={user} onLogout={handleLogout} />
      </Suspense>
    );
  }

  // Logged in but no recognized profile
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
        border: "1px solid #D6D0C4",
        borderTop: "4px solid #C9A24A",
        borderRadius: 4,
        padding: "40px 36px",
        textAlign: "center",
        maxWidth: 400,
      }}>
        <p style={{ fontSize: 16, color: COLORS.teal, marginBottom: 12 }}>
          {profile
            ? "Tu perfil no tiene acceso al portal."
            : "No se encontró un perfil asociado a tu cuenta."}
        </p>
        <p style={{ fontSize: 13, color: "#999", fontStyle: "italic", marginBottom: 24 }}>
          Contacta con el administrador de la academia.
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
    </div>
  );
}
