export function formatValue(
  value: number,
  type: "currency" | "count" | "percentage" = "count",
) {
  const absValue = Math.abs(value)
  const sign = value < 0 ? "-" : ""

  if (type === "percentage") return `(${value.toFixed(1)}%)`

  const format = (num: number, suffix: string) =>
    type === "currency"
      ? `${sign}$${num.toFixed(1)}${suffix}`
      : `${sign}${num.toFixed(1)}${suffix}`

  if (absValue >= 1_000_000) return format(absValue / 1_000_000, "M")
  if (absValue >= 1_000) return format(absValue / 1_000, "K")

  return type === "currency"
    ? `${sign}$${Math.round(absValue)}`
    : Math.round(value).toString()
}
