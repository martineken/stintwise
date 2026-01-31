/**
 * Main analysis runner
 * 
 * Runs all analysis rules on a race and returns combined insights.
 */

import type { Insight, AnalysisInput } from "./types"
import { detectUndercuts } from "./rules/undercut"
import { detectPitStopPositionChanges } from "./rules/position-change"
import { detectLongStints } from "./rules/long-stint"

export function analyzeRace(input: AnalysisInput): Insight[] {
  const insights: Insight[] = [
    ...detectUndercuts(input),
    ...detectPitStopPositionChanges(input),
    ...detectLongStints(input),
  ]
  
  // Sort by lap, then by significance (position change)
  return insights.sort((a, b) => {
    if (a.lap !== b.lap) return a.lap - b.lap
    return Math.abs(b.positionsGained) - Math.abs(a.positionsGained)
  })
}

/**
 * Prepare analysis input from database query results
 */
export function prepareAnalysisInput(
  raceId: number,
  totalLaps: number,
  entries: {
    id: number
    carNumber: number
    gridPosition: number | null
    finishPosition: number | null
    driver: {
      code: string
      firstName: string
      lastName: string
    }
    team: string
    stints: {
      stintNumber: number
      compound: string
      startLap: number
      endLap: number
      lapCount: number
    }[]
  }[],
  pitStops: {
    raceEntryId: number
    lap: number
    pitStopDuration: string | null
  }[]
): AnalysisInput {
  // Map entry IDs to driver numbers
  const entryToDriver = new Map(entries.map(e => [e.id, e.carNumber]))
  
  return {
    raceId,
    totalLaps,
    entries: entries.map(e => ({
      id: e.id,
      driverNumber: e.carNumber,
      driverCode: e.driver.code,
      driverName: `${e.driver.firstName} ${e.driver.lastName}`,
      team: e.team,
      gridPosition: e.gridPosition,
      finishPosition: e.finishPosition,
      stints: e.stints,
    })),
    pitStops: pitStops.map(p => ({
      driverNumber: entryToDriver.get(p.raceEntryId) ?? 0,
      lap: p.lap,
      duration: parseFloat(p.pitStopDuration ?? "0"),
    })),
  }
}
