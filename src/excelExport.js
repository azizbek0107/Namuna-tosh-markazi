import { paymentNames, paymentOf } from "./sales.js";
import { attendanceStatus, tashkentDay, workedMinutes, durationLabel } from "./attendance.js";

const date = (value) => value ? new Date(value).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" }) : "";
export async function buildWorkbook(sheets) {
  const { default: ExcelJS } = await import("exceljs");
  const book = new ExcelJS.Workbook();
  book.creator = "StoneX ERP";
  book.created = new Date();
  sheets.forEach(({ name, headers, rows }, index) => {
    const sheet = book.addWorksheet(name, { views: [{ state: "frozen", ySplit: 1 }] });
    sheet.columns = headers.map((header, column) => ({ header, width: Math.min(48, Math.max(16, header.length + 4, ...rows.slice(0, 200).map((row) => String(row[column] ?? "").length + 2))) }));
    if (rows.length) sheet.addRows(rows.map((row) => row.map((value) => value ?? "")));
    sheet.addTable({ name: `Data${index + 1}`, ref: "A1", headerRow: true, style: { theme: "TableStyleMedium2", showRowStripes: true }, columns: headers.map((name) => ({ name, filterButton: true })), rows: rows.length ? rows.map((row) => row.map((value) => value ?? "")) : [headers.map(() => "")] });
    sheet.getRow(1).height = 30;
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    sheet.eachRow((row, number) => {
      row.alignment = { vertical: "middle", wrapText: true };
      if (number > 1) {
        row.height = 30;
        row.eachCell((cell) => { if (typeof cell.value === "number") cell.numFmt = '#,##0.#########;[Red](#,##0.#########);"—"'; });
      }
    });
    sheet.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
  });
  return book;
}

export async function downloadExcel(filename, sheets) {
  try {
    const book = await buildWorkbook(sheets);
    const bytes = await book.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const link = document.createElement("a"); link.href = url; link.download = filename.replace(/\.(csv|json|xlsx)$/i, "") + ".xlsx"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch { window.alert("Excel faylini saqlab bo‘lmadi. Qayta urinib ko‘ring."); }
}

export const exportExcel = (filename, headers, rows) => downloadExcel(filename, [{ name: "Hisobot", headers, rows }]);

export function inventorySheets(data) {
  const sales = data.sales ?? [], expenses = data.expenses ?? [];
  return [
    { name: "Davomat tasdiqlari", headers: ["Xodim", "Sana", "Holat", "Tasdiqlagan", "Tasdiqlangan vaqt"], rows: (data.attendanceMarks ?? []).map((item) => [item.name, item.day, item.status === "present" ? "Kelgani tasdiqlangan" : "Kelmadi", item.confirmedBy, date(item.confirmedAt)]) },
    { name: "Kunlik bonuslar", headers: ["Xodim", "Sana", "Bonus UZS", "Izoh", "Belgilagan", "Yangilangan vaqt"], rows: (data.bonuses ?? []).map((item) => [item.name, item.day, item.amount, item.note, item.updatedBy, date(item.updatedAt)]) },
    { name: "Davomat", headers: ["Xodim", "Kelgan vaqt", "Ketgan vaqt", "Ishlagan vaqt", "Holat", "Tuzatgan", "Tuzatish vaqti", "Tuzatish tarixi"], rows: (data.attendance ?? []).map((item) => [item.name, date(item.arrivedAt), date(item.leftAt), durationLabel(workedMinutes(item)), attendanceStatus(item, tashkentDay(Date.parse(item.arrivedAt)), data.attendanceSchedule), item.updatedBy, date(item.updatedAt), (item.audit ?? []).map((audit) => `${date(audit.time)} · ${audit.by}: ${audit.reason}`).join("; ")]) },
    { name: "Korxona", headers: ["Ko‘rsatkich", "Qiymat"], rows: [["Korxona", data.settings?.company], ["Administrator", data.settings?.admin], ["Telefon", data.settings?.phone], ["Yuklangan vaqt (Toshkent)", date(Date.now())]] },
    { name: "Savdolar", headers: ["ID", "Sana", "Mahsulot", "Mijoz", "Miqdor", "Birlik", "Narx UZS", "Jami UZS", "To‘lov", "Kassir", "Smena ID", "Holat", "Bekor qilish sababi"], rows: sales.map((s) => [s.id, date(s.time), s.productName, s.customer, s.quantity, s.unit, s.price, s.amount, paymentNames[paymentOf(s)], s.cashierName ?? "Noma’lum", s.shiftId, s.cancelledAt ? "Bekor qilingan" : "Saqlangan", s.cancelReason]) },
    { name: "Xarajatlar", headers: ["ID", "Sana", "Nomi", "Kategoriya", "To‘lov", "Summa UZS"], rows: expenses.map((e) => [e.id, date(e.time), e.name, e.category, paymentNames[e.paymentMethod ?? "cash"], e.amount]) },
    { name: "Mahsulotlar", headers: ["ID", "Kod", "Nomi", "Kategoriya", "Birlik", "Qoldiq", "Minimum", "Tannarx UZS", "Sotuv narxi UZS"], rows: (data.products ?? []).map((p) => [p.id, p.code, p.name, p.category, p.unit, p.quantity, p.minimumStock, p.price, p.salePrice ?? p.price]) },
    { name: "Xodimlar", headers: ["ID", "Ism", "Lavozim", "Telefon", "Ish haqi UZS", "Holat"], rows: (data.employees ?? []).map((e) => [e.id, e.name, e.role, e.phone, e.salary, e.status]) },
    { name: "Smenalar", headers: ["ID", "Xodim", "Ochildi", "Yopildi"], rows: (data.shifts ?? []).map((s) => [s.id, s.name, date(s.openedAt), date(s.closedAt)]) },
    { name: "Ishlab chiqarish", headers: ["ID", "Sana", "Topshiriq", "Ishchi", "Xomashyo", "Sarf", "Birlik", "Natija", "Miqdor", "Natija birligi", "Holat"], rows: (data.production ?? []).map((p) => [p.id, date(p.time), p.name, p.assigneeName, p.sourceName, p.input, p.sourceUnit, p.targetName, p.output, p.targetUnit, p.status]) },
    { name: "Amallar tarixi", headers: ["ID", "Sana", "Nomi", "Amal"], rows: (data.operations ?? []).map((o) => [o.id, date(o.time), o.name, o.action]) },
  ];
}
