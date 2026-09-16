import { jsPDF } from "jspdf";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

function formatFecha(fecha) {
  if (!fecha) return "";
  try {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return fecha;
  }
}

async function generarPDF({ tipo, nombreEstudiante, nombreCursoONivel, textoBiblico, fechaCompletado }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "letter" });
  const w = 279;
  const h = 216;

  const loadLogo = async () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(doc.addImage(img, "PNG", w / 2 - 15, 20, 30, 30)); }
        catch { resolve(); }
      };
      img.onerror = () => resolve();
      img.src = "/logo-academia.png";
    });
  };

  const drawBorders = () => {
    doc.setDrawColor(201, 162, 74);
    doc.setLineWidth(1.5);
    doc.rect(15, 15, w - 30, h - 30);
    doc.setLineWidth(0.5);
    doc.rect(18, 18, w - 36, h - 36);
  };

  const addCenteredText = (text, y, opts = {}) => {
    doc.setFontSize(opts.size || 11);
    if (opts.font) {
      const [family, style] = opts.font.split("-");
      doc.setFont(family, style || "normal");
    }
    if (opts.color) doc.setTextColor(...opts.color);
    if (opts.letterSpacing) {
      const spaced = text.split("").join(" ");
      doc.text(spaced, w / 2, y, { align: "center" });
    } else {
      doc.text(text, w / 2, y, { align: "center" });
    }
  };

  const addItalicText = (text, y, size, color) => {
    doc.setFontSize(size || 14);
    doc.setFont("helvetica", "italic");
    if (color) doc.setTextColor(...color);
    else doc.setTextColor(100, 100, 100);
    doc.text(text, w / 2, y, { align: "center", maxWidth: 200 });
  };

  await loadLogo();

  drawBorders();

  let y = 62;

  addCenteredText("ACADEMIA DEL ESPÍRITU", y, {
    size: 13, font: "helvetica-bold", color: [201, 162, 74], letterSpacing: true,
  });
  y += 10;

  doc.setDrawColor(201, 162, 74);
  doc.setLineWidth(0.3);
  doc.line(w / 2 - 60, y, w / 2 + 60, y);
  y += 8;

  addCenteredText("MINISTERIO APOSTÓLICO LEMGIL", y, {
    size: 10, font: "helvetica", color: [26, 58, 74], letterSpacing: true,
  });
  y += 16;

  addItalicText("Certifica que", y, 16, [136, 136, 136]);
  y += 12;

  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 58, 74);
  doc.text(nombreEstudiante, w / 2, y, { align: "center" });
  y += 14;

  if (tipo === "curso") {
    addItalicText("Ha completado satisfactoriamente la serie", y, 14, [136, 136, 136]);
    y += 10;
  } else {
    addItalicText("Ha completado el", y, 14, [136, 136, 136]);
    y += 10;
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(201, 162, 74);
  doc.text(nombreCursoONivel, w / 2, y, { align: "center" });
  y += 4;

  if (tipo === "nivel") {
    addItalicText("quedando acreditado para continuar al siguiente nivel", y, 12, [136, 136, 136]);
    y += 4;
  }

  doc.setDrawColor(201, 162, 74);
  doc.setLineWidth(0.2);
  doc.line(w / 2 - 45, y, w / 2 + 45, y);
  y += 10;

  const fechaTexto = `Fecha de completación: ${formatFecha(fechaCompletado)}`;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text(fechaTexto, w / 2, y, { align: "center" });
  y += 8;

  if (textoBiblico) {
    addItalicText(`"${textoBiblico}"`, y, 13, [90, 90, 90]);
    y += 24;
  }

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  const firmaX = w / 2;
  doc.line(firmaX - 30, y, firmaX + 30, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(26, 58, 74);
  doc.text("Pastor LemGil — Director", firmaX, y, { align: "center" });

  return doc;
}

export default function Certificado({ tipo, nombreEstudiante, nombreCursoONivel, textoBiblico, fechaCompletado, codigoVerificacion, onClose }) {
  const handleDownload = async () => {
    try {
      const doc = await generarPDF({
        tipo, nombreEstudiante, nombreCursoONivel,
        textoBiblico, fechaCompletado,
      });
      const nombre = `Certificado_${nombreEstudiante.replace(/\s+/g, "_")}_${nombreCursoONivel.replace(/\s+/g, "_")}.pdf`;
      doc.save(nombre);
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  const fechaFormateada = formatFecha(fechaCompletado);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        background: COLORS.marfil,
        borderRadius: 4,
        width: "100%",
        maxWidth: 700,
        maxHeight: "90vh",
        overflowY: "auto",
        padding: 32,
        position: "relative",
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 16,
            background: "none", border: "none",
            fontSize: 22, color: "#888", cursor: "pointer",
            fontFamily: "Georgia, serif",
            lineHeight: 1,
          }}
        >
          &times;
        </button>

        {/* ── Certificate Preview ── */}
        <div style={{
          background: COLORS.marfil,
          border: `3px solid ${COLORS.oro}`,
          padding: 20,
          marginBottom: 24,
        }}>
          <div style={{
            border: `1px solid ${COLORS.oro}`,
            padding: 30,
            textAlign: "center",
            position: "relative",
          }}>
            {/* Logo */}
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              border: `2px solid ${COLORS.oro}`,
              margin: "0 auto 12px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: COLORS.marfil,
              overflow: "hidden",
            }}>
              <img src="/logo-academia.png" alt="Academia del Espíritu"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <p style={{
              fontSize: 11, color: COLORS.oro,
              fontFamily: "'Cinzel', serif",
              letterSpacing: "4px",
              margin: "0 0 8px",
            }}>
              ACADEMIA DEL ESPÍRITU
            </p>

            <div style={{
              width: 120, height: 1, background: COLORS.oro,
              margin: "0 auto 8px",
            }} />

            <p style={{
              fontSize: 9, color: COLORS.teal,
              fontFamily: "'Cinzel', serif",
              letterSpacing: "3px",
              margin: "0 0 20px",
            }}>
              MINISTERIO APOSTÓLICO LEMGIL
            </p>

            <p style={{
              fontSize: 16, color: "#888",
              fontFamily: "'EB Garamond', Georgia, serif",
              fontStyle: "italic", margin: "0 0 6px",
            }}>
              Certifica que
            </p>

            <p style={{
              fontSize: 28, color: COLORS.teal,
              fontFamily: "'Cinzel', serif",
              fontWeight: 600, margin: "0 0 8px",
            }}>
              {nombreEstudiante}
            </p>

            <p style={{
              fontSize: 14, color: "#888",
              fontFamily: "'EB Garamond', Georgia, serif",
              fontStyle: "italic", margin: "0 0 4px",
            }}>
              {tipo === "curso"
                ? "Ha completado satisfactoriamente la serie"
                : "Ha completado el"}
            </p>

            <p style={{
              fontSize: 18, color: COLORS.oro,
              fontFamily: "'Cinzel', serif",
              fontWeight: 600, margin: "0 0 4px",
            }}>
              {nombreCursoONivel}
            </p>

            {tipo === "nivel" && (
              <p style={{
                fontSize: 12, color: "#888",
                fontFamily: "'EB Garamond', Georgia, serif",
                fontStyle: "italic", margin: "0 0 8px",
              }}>
                quedando acreditado para continuar al siguiente nivel
              </p>
            )}

            <div style={{
              width: 90, height: 1, background: COLORS.oro,
              margin: "8px auto",
            }} />

            <p style={{
              fontSize: 11, color: "#999", margin: "8px 0 8px",
            }}>
              Fecha de completación: {fechaFormateada}
            </p>

            {textoBiblico && (
              <p style={{
                fontSize: 14, color: "#666",
                fontFamily: "'EB Garamond', Georgia, serif",
                fontStyle: "italic", margin: "0 0 8px",
              }}>
                &ldquo;{textoBiblico}&rdquo;
              </p>
            )}

            <div style={{ height: 24 }} />

            <div style={{
              width: 120, height: 1, borderTop: `2px solid ${COLORS.pergamino}`,
              margin: "0 auto 4px",
            }} />

            <p style={{
              fontSize: 11, color: COLORS.teal,
              fontFamily: "'Cinzel', serif", margin: 0,
            }}>
              Pastor LemGil — Director
            </p>
          </div>
        </div>

        {/* Verification & Share */}
        <div style={{
          background: "white",
          border: `1px solid ${COLORS.pergamino}`,
          borderRadius: 3,
          padding: "14px 18px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 10, color: "#999",
              fontFamily: "'Cinzel', serif", letterSpacing: "0.5px",
            }}>
              Código: <strong style={{ color: COLORS.teal }}>{codigoVerificacion || "—"}</strong>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              fontSize: 10, color: "#999",
              fontFamily: "'Cinzel', serif", letterSpacing: "0.5px",
            }}>
              Compartir:
            </span>
            {(() => {
              const url = typeof window !== "undefined"
                ? `${window.location.origin}/?codigo=${codigoVerificacion || ""}`
                : "";
              const text = `He obtenido un certificado en Academia del Espíritu:`;
              const shares = [
                { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, color: "#1877F2" },
                { name: "Twitter", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, color: "#000" },
                { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, color: "#0A66C2" },
                { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, color: "#25D366" },
              ];
              return shares.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                  title={`Compartir en ${s.name}`}
                  style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: s.color, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    cursor: "pointer", opacity: 0.85, textDecoration: "none",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "0.85"}
                >
                  <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>
                    {s.name[0]}
                  </span>
                </a>
              ));
            })()}
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          style={{
            width: "100%",
            padding: "12px 0",
            background: COLORS.oro,
            color: COLORS.teal,
            border: "none",
            borderRadius: 2,
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            letterSpacing: "1px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Descargar Certificado PDF
        </button>
      </div>
    </div>
  );
}
