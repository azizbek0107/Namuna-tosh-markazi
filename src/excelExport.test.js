import test from "node:test";
import assert from "node:assert/strict";
import { buildWorkbook, inventorySheets } from "./excelExport.js";
test("Excel roundtrip preserves numeric amounts, literal text, filters and sheets", async () => {
  const book = await buildWorkbook([{ name: "Savdo", headers: ["Mijoz", "Summa"], rows: [["=HYPERLINK(test)", 1234.56], ["O‘ktam", 0]] }, { name: "Bo‘sh", headers: ["Sana"], rows: [] }]);
  const bytes = await book.xlsx.writeBuffer();
  const { default: ExcelJS } = await import("exceljs");
  const loaded = new ExcelJS.Workbook(); await loaded.xlsx.load(bytes);
  assert.equal(loaded.worksheets.length, 2);
  assert.equal(loaded.getWorksheet(1).getCell("A2").value, "=HYPERLINK(test)");
  assert.equal(loaded.getWorksheet(1).getCell("B2").value, 1234.56);
  assert.equal(loaded.getWorksheet(1).getCell("B3").value, 0);
  assert.equal(loaded.getWorksheet(1).views[0].ySplit, 1);
  assert.ok(loaded.getWorksheet(1).getTable("Data1"));
  assert.equal(inventorySheets({}).length, 11);
});
