export function getInitials(name: string): string {
  return (name || "")
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .substring(0, 3)
    .toUpperCase()
}

export function formatCurrency(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : "+"
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`
  return `${sign}$${abs.toFixed(0)}`
}

export function formatSpread(bps: number | null | undefined): string {
  if (bps == null) return "N/A"
  return `${bps.toFixed(2)}bp`
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function daysUntil(dateString: string): string {
  const target = new Date(dateString)
  const now = new Date()
  const days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (days < 0) return "Expired"
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  if (days < 7) return `${days}d`
  if (days < 30) return `${Math.floor(days / 7)}w`
  return `${Math.floor(days / 30)}mo`
}

export function daysUntilRaw(dateString: string): number {
  const target = new Date(dateString)
  const now = new Date()
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
