/**
 * Genera y descarga un archivo CSV.
 */
export function exportToCSV(filename: string, headers: string[], rows: any[][]) {
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
    + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Genera un PDF nativo abriendo la caja de diálogo de impresión del navegador.
 * Las configuraciones del negocio se leen dinámicamente desde el objeto settings.
 */
export function exportToPDF(
  reportTitle: string, 
  dynamicSubtitle: string, 
  headers: string[], 
  rows: any[][], 
  toastNotifier?: (msg: any) => void,
  settings?: any
) {
  // Configuraciones del negocio (Valores por defecto si no vienen settings)
  const companyName = settings?.business_name || "Soho Boutique"
  const companyAddress = settings?.address || "Av. Principal de las Mercedes, Caracas, Venezuela"
  const companyRif = `RIF: ${settings?.rif || "J-12345678-9"} | Tel: ${settings?.phone || "+58 412-1234567"}`
  const companyContact = `${settings?.email || "contacto@sohoboutique.com"} | ${settings?.slogan || "@sohoboutique"}`
  
  // Convertir HSL a string CSS válido si es necesario, o usar directamente
  const primaryColor = settings?.primary_color ? `hsl(${settings.primary_color})` : "hsl(350, 65%, 65%)"
  const headerBgColor = "#fdf2f4"
  const logoUrl = settings?.logo_url || "/images/logo.png"
  const headingFont = settings?.heading_font || "Great Vibes"

  let html = `
    <html>
      <head>
        <title>Reporte - ${companyName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, '+')}&display=swap');
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid ${primaryColor}; padding-bottom: 20px; margin-bottom: 30px; }
          .logo-container { margin-bottom: 10px; }
          .logo-img { max-height: 60px; margin-bottom: 5px; }
          .logo-text { font-family: '${headingFont}', cursive; font-size: 42px; font-weight: normal; color: ${primaryColor}; margin-bottom: 0px; }
          .business-info { font-size: 12px; color: #666; line-height: 1.5; margin-top: -5px; }
          .report-title { font-size: 22px; margin-top: 30px; margin-bottom: 5px; color: ${primaryColor}; }
          .report-subtitle { font-size: 13px; color: #666; margin-bottom: 20px; font-style: italic; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th { background-color: ${headerBgColor}; text-align: left; padding: 12px 8px; border-bottom: 2px solid ${primaryColor}; font-weight: 600; color: #333; }
          td { padding: 10px 8px; border-bottom: 1px solid #e2e8f0; color: #475569; }
          .right { text-align: right; }
          .center { text-align: center; }
          .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
          .Activo, .Entregado, .Pagado { background-color: #dcfce7; color: #166534; }
          .Bajo.Stock, .Pendiente { background-color: #fef08a; color: #854d0e; }
          .Agotado, .Cancelado, .Deudor { background-color: #fee2e2; color: #991b1b; }
          .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            ${settings?.logo_url ? `<img src="${settings.logo_url}" class="logo-img" alt="logo" />` : `<div class="logo-text">${companyName}</div>`}
          </div>
          <div class="business-info">
            ${companyAddress}<br/>
            ${companyRif}<br/>
            ${companyContact}
          </div>
        </div>
        
        <h1 class="report-title">${reportTitle}</h1>
        <div class="report-subtitle">${dynamicSubtitle} &nbsp;&mdash;&nbsp; Generado el ${new Date().toLocaleDateString('es-VE')}</div>

        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
  `

  rows.forEach(row => {
    html += `<tr>`
    row.forEach(cell => {
      // Intenta formatear celdas con etiquetas de estado automáticamente
      if (typeof cell === "string" && ["Activo", "Entregado", "Pagado", "Pendiente", "Bajo Stock", "Agotado", "Cancelado", "Deudor"].includes(cell)) {
        html += `<td class="center"><span class="status-badge ${cell.replace(' ', '.')}">${cell}</span></td>`
      } else if (typeof cell === "string" && cell.includes("$")) {
         html += `<td class="right">${cell}</td>` // Alinea montos a la derecha
      } else {
        html += `<td>${cell}</td>`
      }
    })
    html += `</tr>`
  })

  html += `
          </tbody>
        </table>
        
        <div class="footer">
          Reporte administrativo de uso interno. Generado automáticamente por el Sistema Soho.<br/>
          Total de registros: ${rows.length}
        </div>
      </body>
    </html>
  `

  const printWindow = window.open('', '', 'width=900,height=600')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.onafterprint = () => printWindow.close()
    }, 250)
    
    if (toastNotifier) {
      toastNotifier({ title: "Generando PDF", description: "Se abrirá la ventana de impresión para guardar el PDF." })
    }
  } else {
    if (toastNotifier) {
      toastNotifier({ title: "Ventana bloqueada", description: "Es posible que tu navegador esté bloqueando pop-ups.", variant: "destructive" })
    }
  }
}
