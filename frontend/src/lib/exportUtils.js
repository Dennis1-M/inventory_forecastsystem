import html2pdf from "html2pdf.js";
import { arrayToCSV } from "./helpers";

/**
 * Export table or component as CSV
 */
export const exportAsCSV = (data, headers, filename = "export.csv") => {
  const csv = arrayToCSV(data, headers);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export HTML element as PDF
 */
export const exportAsPDF = (element, filename = "export.pdf") => {
  const opt = {
    margin: 10,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
  };

  html2pdf().set(opt).from(element).save();
};

/**
 * Export chart as image
 */
export const exportChartAsImage = (chartRef, filename = "chart.png") => {
  if (!chartRef?.current) return;

  const canvas = chartRef.current.querySelector("canvas");
  if (!canvas) return;

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = filename;
  link.click();
};

/**
 * Export dashboard data
 */
export const exportDashboardData = (stats, data, filename = "dashboard_report.csv") => {
  const timestamp = new Date().toISOString();
  let csv = `Dashboard Report\nGenerated: ${timestamp}\n\n`;

  // Add stats
  csv += "Summary Statistics\n";
  Object.keys(stats).forEach((key) => {
    csv += `${key},${stats[key]}\n`;
  });

  csv += "\nData\n";
  csv += arrayToCSV(data, Object.keys(data[0] || {}));

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Generate and download JSON file
 */
export const exportAsJSON = (data, filename = "export.json") => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Print element
 */
export const printElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open("", "", "height=400,width=800");
  printWindow.document.write(element.innerHTML);
  printWindow.document.close();
  printWindow.print();
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};

/**
 * Generate report with timestamp
 */
export const generateReport = (title, data, format = "csv") => {
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `${title.toLowerCase()}_${timestamp}.${format}`;

  if (format === "csv") {
    exportAsCSV(data, Object.keys(data[0] || {}), filename);
  } else if (format === "json") {
    exportAsJSON(data, filename);
  }
};
