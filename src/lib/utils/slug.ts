export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function raceSlug(season: number, name: string): string {
  return `${season}-${slugify(name)}`
}

export function parseRaceSlug(slug: string): { season: number; namePattern: string } | null {
  const match = slug.match(/^(\d{4})-(.+)$/)
  if (!match) return null
  
  const [, seasonStr, nameSlug] = match
  return {
    season: parseInt(seasonStr, 10),
    namePattern: nameSlug.replace(/-/g, " "),
  }
}
