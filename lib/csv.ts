export interface CsvPreview {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());

  return values;
}

export async function previewCsvFile(file: File, maxRows = 20): Promise<CsvPreview> {
  const text = await file.text();
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const [headerLine, ...bodyLines] = lines;

  return {
    headers: headerLine ? parseCsvLine(headerLine) : [],
    rows: bodyLines.slice(0, maxRows).map(parseCsvLine),
    totalRows: bodyLines.length,
  };
}

export const clientExampleCsv = [
  "fullNames,phone,address,language,type,subscriptionAmount,registeredDate",
  "Aline Mutesi,0780000001,Kigali,en,NORMAL,20.00,2026-04-15",
  "Jean Bosco,0780000002,Remera,fr,POTENTIAL,50.00,2026-04-15",
].join("\n");

export const agentExampleCsv = [
  "fullNames,phone,language",
  "Grace Uwase,0780000003,en",
  "Daniel Mensa,0780000004,fr",
].join("\n");
