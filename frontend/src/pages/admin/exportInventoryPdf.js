import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export product rows as a printable PDF report.
 */
export function exportInventoryPdf({
  title = 'Gift Mart — Products report',
  rows,
  summary
}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  let y = 14;
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(title, 14, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 6;
  if (summary) {
    doc.setTextColor(15, 118, 110);
    doc.text(
      `Summary — Products: ${summary.totalProducts}  |  Units sold: ${summary.totalUnitsSold}  |  Revenue: LKR ${Math.round(summary.totalRevenue).toLocaleString()}  |  Monthly sales: LKR ${Math.round(summary.averageMonthlySales).toLocaleString()}`,
      14,
      y
    );
    y += 8;
  }

  const head = [[
    'Product',
    'Category',
    'Price (LKR)',
    'Units sold',
    'Revenue (LKR)',
    'Stock',
    'Status',
    'Rating'
  ]];

  const body = rows.map((r) => [
    r.name || '—',
    r.category || '—',
    String(r.price != null ? Math.round(r.price) : '—'),
    String(r.unitsSold ?? 0),
    String(Math.round(r.revenue || 0)),
    String(r.stock ?? 0),
    r.statusLabel || '—',
    r.ratingLabel ?? '—'
  ]);

  autoTable(doc, {
    startY: y,
    head,
    body,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [95, 158, 160], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 }
  });

  doc.save(`gift-mart-products-${new Date().toISOString().slice(0, 10)}.pdf`);
}
