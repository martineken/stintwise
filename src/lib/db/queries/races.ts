import { db } from "@/lib/db"
import { races, raceEntries, stints, strategyEvents } from "@/lib/db/schema"
import { eq, and, ilike } from "drizzle-orm"
import { parseRaceSlug } from "@/lib/utils/slug"

export async function getRaceBySlug(slug: string) {
  const parsed = parseRaceSlug(slug)
  if (!parsed) return null

  const result = await db.query.races.findFirst({
    where: and(
      eq(races.season, parsed.season),
      ilike(races.name, `%${parsed.namePattern}%`)
    ),
  })

  return result ?? null
}

export async function getRaceEntries(raceId: number) {
  return db.query.raceEntries.findMany({
    where: eq(raceEntries.raceId, raceId),
    with: {
      driver: true,
      stints: {
        orderBy: (stints, { asc }) => [asc(stints.stintNumber)],
      },
    },
  })
}

export async function getStrategyEvents(raceId: number) {
  return db.query.strategyEvents.findMany({
    where: eq(strategyEvents.raceId, raceId),
    orderBy: (events, { asc }) => [asc(events.lap)],
  })
}

export async function getAllRaces() {
  return db.query.races.findMany({
    orderBy: (races, { desc }) => [desc(races.season), desc(races.round)],
  })
}
