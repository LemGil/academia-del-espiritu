import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { CheckCircle, XCircle } from "lucide-react";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

export default function VerificarCertificado({ codigo }) {
  const [state, setState] = useState("loading"); // loading | found | notfound | error

  useEffect(() => {
    if (!codigo) { setState("notfound"); return; }
    let mounted = true;
    async function verificar() {
      console.log("Verifying cert:", { codigo });
      const { data, error } = await supabase
        .rpc("fn_verificar_certificado", { p_codigo: codigo });
      console.log("RPC result:", { data, error });
      if (!mounted) return;
      if (error) { console.error("RPC error:", error); setState("notfound"); return; }
      if (!data) { console.warn("No data returned"); setState("notfound"); return; }
      if (!data.valido) { setState("notfound"); return; }
      setState(data);
    }
    verificar();
    return () => { mounted = false; };
  }, [codigo]);

  if (state === "loading") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: COLORS.marfil,
      }}>
        <p style={{ color: "#888", fontStyle: "italic", fontSize: 15 }}>Verificando certificado...</p>
      </div>
    );
  }

  if (state === "notfound" || state === "error") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: COLORS.marfil, padding: 20,
      }}>
        <div style={{
          background: "white", border: `1px solid ${COLORS.pergamino}`,
          borderRadius: 4, padding: "40px 36px", textAlign: "center",
          maxWidth: 420, width: "100%",
        }}>
          <XCircle size={48} color="#e74c3c" style={{ marginBottom: 16 }} />
          <h2 style={{
            fontFamily: "'Cinzel', serif", fontSize: 18,
            color: COLORS.teal, margin: "0 0 8px", fontWeight: 400,
          }}>
            Certificado no encontrado
          </h2>
          <p style={{ fontSize: 13, color: "#999", fontStyle: "italic", margin: 0 }}>
            El código ingresado no corresponde a ningún certificado válido.
          </p>
        </div>
      </div>
    );
  }

  const cert = state;
  const nombre = cert.nivel_nombre || "Nivel";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: COLORS.marfil, padding: 20,
    }}>
      <div style={{
        background: "white",
        border: `1px solid ${COLORS.pergamino}`,
        borderTop: `4px solid ${COLORS.oro}`,
        borderRadius: 4,
        padding: "40px 36px",
        textAlign: "center",
        maxWidth: 440,
        width: "100%",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "#e8f5e9", display: "flex",
          alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <CheckCircle size={32} color="#2e7d32" />
        </div>

        <h2 style={{
          fontFamily: "'Cinzel', serif", fontSize: 14,
          color: "#2e7d32", letterSpacing: "2px",
          textTransform: "uppercase", margin: "0 0 8px",
        }}>
          Certificado Válido
        </h2>

        <div style={{
          width: 40, height: 2, background: COLORS.oro,
          margin: "0 auto 20px",
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
          <Row label="Estudiante" value={`${cert.estudiante_nombre || ""} ${cert.estudiante_apellido || ""}`.trim() || "—"} />
          <Row label="Tipo" value="Nivel" />
          <Row label="Nivel" value={nombre} />
          <Row label="Emitido" value={new Date(cert.emitido_at).toLocaleDateString("es-ES", {
            year: "numeric", month: "long", day: "numeric",
          })} />
          <Row label="Código" value={cert.codigo} />
        </div>

        <p style={{
          marginTop: 24, fontSize: 11, color: "#bbb",
          fontStyle: "italic",
        }}>
          Academia del Espíritu — Ministerio Apostólico LemGil
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{
        fontSize: 12, color: "#999",
        fontFamily: "'Cinzel', serif", letterSpacing: "0.5px",
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 13, color: COLORS.teal,
        fontFamily: "'Cinzel', serif", textAlign: "right",
      }}>
        {value}
      </span>
    </div>
  );
}
