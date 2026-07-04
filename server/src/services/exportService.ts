export class ExportService {
  /**
   * Convert list of objects to CSV string
   */
  convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    // Extract headers
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        let cellVal = val === null || val === undefined ? '' : String(val);
        // Escape quotes
        cellVal = cellVal.replace(/"/g, '""');
        // Wrap in quotes if contains commas/quotes/newlines
        if (cellVal.includes(',') || cellVal.includes('"') || cellVal.includes('\n')) {
          cellVal = `"${cellVal}"`;
        }
        return cellVal;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Convert list of objects to Excel HTML format
   */
  convertToExcelHTML(data: any[], sheetTitle: string = 'Sheet 1'): string {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${sheetTitle}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; font-family: sans-serif; font-size: 11px; }
          th { background-color: #4f46e5; color: white; border: 1px solid #e2e8f0; padding: 6px 12px; font-weight: bold; }
          td { border: 1px solid #e2e8f0; padding: 6px 12px; }
          tr:nth-child(even) { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(h => {
                  const val = row[h];
                  const cell = val === null || val === undefined ? '' : String(val);
                  return `<td>${cell}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    return html.trim();
  }

  /**
   * Convert Markdown to standard printable HTML structure (for PDF format layout)
   */
  convertToPDFHtml(title: string, markdown: string): string {
    // Basic Markdown to HTML converter for rendering
    let htmlContent = markdown
      .replace(/# (.*?)\n/g, '<h1 style="color:#0f172a; font-size:24px; border-bottom:2px solid #cbd5e1; padding-bottom:8px;">$1</h1>')
      .replace(/## (.*?)\n/g, '<h2 style="color:#1e293b; font-size:18px; margin-top:20px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\| (.*?) \|/g, (match) => {
        // Simple table parsing
        if (match.includes('---')) return '';
        const cells = match.split('|').map(c => c.trim()).filter(c => c !== '');
        const isHeader = markdown.indexOf(match) < markdown.indexOf('---');
        const tag = isHeader ? 'th' : 'td';
        const style = isHeader 
          ? 'style="background-color:#f1f5f9; padding:8px; border:1px solid #e2e8f0; text-align:left;"' 
          : 'style="padding:8px; border:1px solid #e2e8f0;"';
        return `<tr>${cells.map(c => `<${tag} ${style}>${c}</${tag}>`).join('')}</tr>`;
      })
      // Wrap table rows
      .replace(/(<tr>.*?<\/tr>)+/g, '<table style="border-collapse:collapse; width:100%; margin:15px 0;">$1</table>')
      .replace(/\* (.*?)\n/g, '<li style="margin-left:20px; padding:2px 0; color:#334155;">$1</li>')
      .replace(/⚠️/g, '<span style="color:#eab308;">⚠️</span>')
      .replace(/🛑/g, '<span style="color:#ef4444;">🛑</span>')
      .replace(/✅/g, '<span style="color:#22c55e;">✅</span>')
      .replace(/🎉/g, '<span style="color:#a855f7;">🎉</span>');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; padding: 40px; max-width: 800px; margin: 0 auto; }
          table { border-collapse: collapse; width: 100%; margin: 15px 0; font-size: 13px; }
          th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
          th { background-color: #f8fafc; font-weight: bold; color: #0f172a; }
          h1, h2, h3 { font-family: Arial, sans-serif; page-break-after: avoid; }
          li { font-size: 14px; }
          p { font-size: 14px; color: #475569; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="margin-bottom: 20px; text-align: right;" class="no-print">
          <button onclick="window.print()" style="background-color:#4f46e5; color:white; border:none; padding:8px 16px; border-radius:6px; font-weight:bold; cursor:pointer;">
            Print / Save to PDF
          </button>
        </div>
        ${htmlContent}
      </body>
      </html>
    `;
  }
}

export default ExportService;
