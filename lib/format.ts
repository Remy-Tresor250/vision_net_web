export function formatCurrency(value: string | number | null | undefined) {
  const amount =
    typeof value === "number" ? value : Number(String(value ?? "0").replace(/[^0-9.-]/g, ""));

  if (Number.isNaN(amount)) return "$0";

  return `$${amount.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  })}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB");
}

export function formatMonth(value: string | null | undefined) {
  if (!value) return "-";

  const [year, month] = value.split("-");

  if (!year || !month) return value;

  const date = new Date(Number(year), Number(month) - 1, 1);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatMonths(values: string[] | string | null | undefined) {
  if (!values) return "-";
  if (typeof values === "string") return formatMonth(values);

  return values.map((value) => formatMonth(value)).join(", ");
}

export function getPageCount(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}
