import {
  LayoutDashboard, BookOpen, BarChart3, Award, LogOut,
} from "lucide-react";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

const NAV_ITEMS = [
  { key: "inicio", label: "Inicio", icon: LayoutDashboard },
  { key: "cursos", label: "Mis Cursos", icon: BookOpen },
  { key: "progreso", label: "Mi Progreso", icon: BarChart3 },
  { key: "certificados", label: "Certificados", icon: Award },
];

export default function PortalLayout({ children, vista, onNavigate, estudiante, onLogout }) {
  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      fontFamily: "'EB Garamond', Georgia, serif",
      background: COLORS.marfil,
    }}>
      {/* Sidebar */}
      <div style={{
        background: COLORS.teal,
        width: 220,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: "28px 24px 22px",
          borderBottom: `1px solid rgba(201,162,74,0.2)`,
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <img src="/logo-academia.png" alt="Academia del Espíritu Logo" style={{ maxWidth: 140, height: 'auto', marginBottom: 8 }} />
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 14,
            color: COLORS.oro,
            letterSpacing: "2px",
            textTransform: "uppercase",
            lineHeight: 1.5,
          }}>
            Academia<br />del Espíritu
          </div>
        </div>
        {/* Estudiante info */}
        {estudiante && (
          <div style={{
            padding: "16px 24px",
            borderBottom: `1px solid rgba(201,162,74,0.12)`,
          }}>
            <p style={{
              margin: 0,
              fontSize: 13,
              color: COLORS.marfil,
              fontFamily: "'Cinzel', serif",
              letterSpacing: "0.5px",
            }}>
              {estudiante.nombre} {estudiante.apellido}
            </p>
            {estudiante.niveles && (
              <p style={{
                margin: "4px 0 0",
                fontSize: 11,
                color: COLORS.oro,
                fontStyle: "italic",
              }}>
                {estudiante.niveles.nombre}
              </p>
            )}
          </div>
        )}

        {/* Nav */}
        <nav style={{ padding: "20px 0", flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const activo = vista === item.key;
            return (
              <div
                key={item.key}
                onClick={() => onNavigate(item.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 24px",
                  fontSize: 14,
                  cursor: "pointer",
                  color: activo ? COLORS.oro : COLORS.pergamino,
                  borderLeft: `3px solid ${activo ? COLORS.oro : "transparent"}`,
                  background: activo ? "rgba(201,162,74,0.08)" : "transparent",
                  transition: "all 0.15s",
                  fontFamily: "'EB Garamond', Georgia, serif",
                }}
                onMouseEnter={(e) => {
                  if (!activo) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = COLORS.marfil;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!activo) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = COLORS.pergamino;
                  }
                }}
              >
                <Icon size={17} />
                {item.label}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{
          padding: "16px 24px",
          borderTop: `1px solid rgba(201,162,74,0.2)`,
        }}>
          <div
            onClick={onLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: COLORS.pergamino,
              cursor: "pointer",
              padding: "6px 0",
              transition: "color 0.15s",
              fontFamily: "'EB Garamond', Georgia, serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.oro; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.pergamino; }}
          >
            <LogOut size={15} />
            Cerrar sesión
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
