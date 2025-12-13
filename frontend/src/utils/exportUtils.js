/**
 * Export data as CSV
 */
export const exportAsCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Convert objects to CSV format
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create and download blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data as PDF (opens print dialog for user to save as PDF)
 */
export const exportAsPDF = async (data, filename = 'export.pdf') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  try {
    const html = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            ${Object.keys(data[0]).map(key => `<th style="border: 1px solid #ddd; padding: 8px;">${key}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${Object.values(row).map(value => `<td style="border: 1px solid #ddd; padding: 8px;">${value}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><body>${html}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  } catch (error) {
    console.error('PDF export failed:', error);
    alert('Failed to export PDF');
  }
};

/**
 * Export data as JSON
 */
export const exportAsJSON = (data, filename = 'export.json') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Print data as table
 */
export const printData = (data, title = 'Report') => {
  if (!data || data.length === 0) {
    alert('No data to print');
    return;
  }

  const html = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>
              ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};

/**
 * Copy data to clipboard as CSV
 */
export const copyToClipboard = (data) => {
  if (!data || data.length === 0) {
    alert('No data to copy');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join('\t'),
    ...data.map(row => headers.map(h => row[h]).join('\t'))
  ].join('\n');

  navigator.clipboard.writeText(csvContent).then(() => {
    alert('Data copied to clipboard');
  }).catch(() => {
    alert('Failed to copy to clipboard');
  });
};

/**
 * Generate dashboard report
 */
export const generateDashboardReport = (dashboardName, sections) => {
  const timestamp = new Date().toLocaleString();
  const html = `
    <html>
      <head>
        <title>${dashboardName} Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          .timestamp { color: #6b7280; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .metric { display: inline-block; margin: 10px 20px 10px 0; }
          .metric-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
          .metric-label { color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${dashboardName} Report</h1>
        <div class="timestamp">Generated on ${timestamp}</div>
        ${sections.map(section => `
          <h2>${section.title}</h2>
          ${section.content}
        `).join('')}
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
};
