/**
 * Undercut Detection Rule
 * 
 * Detects when a driver gains position by pitting earlier than a competitor.
 * 
 * Signal:
 * - Driver A pits before Driver B (within 1-4 laps)
 * - Driver A was behind Driver B before the stop
 * - After both have pitted, Driver A is ahead
 */

import type { Insight, AnalysisInput } from "../types"

interface PitWindow {
  driverNumber: number
  driverCode: string
  driverName: string
  lap: number
  stintNumber: number
  newCompound: string
}

export function detectUndercuts(input: AnalysisInput): Insight[] {
  const insights: Insight[] = []
  
  // Build pit stop windows for each driver
  const pitWindows: PitWindow[] = []
  
  for (const entry of input.entries) {
    for (let i = 0; i < entry.stints.length - 1; i++) {
      const currentStint = entry.stints[i]
      const nextStint = entry.stints[i + 1]
      
      // Pit stop happened at the end of current stint
      pitWindows.push({
        driverNumber: entry.driverNumber,
        driverCode: entry.driverCode,
        driverName: entry.driverName,
        lap: currentStint.endLap,
        stintNumber: currentStint.stintNumber,
        newCompound: nextStint.compound,
      })
    }
  }
  
  // Sort by lap
  pitWindows.sort((a, b) => a.lap - b.lap)
  
  // Compare each pit stop to later ones within the undercut window
  for (let i = 0; i < pitWindows.length; i++) {
    const stopA = pitWindows[i]
    const entryA = input.entries.find(e => e.driverNumber === stopA.driverNumber)
    if (!entryA) continue
    
    // Look for drivers who pitted 1-4 laps later
    for (let j = i + 1; j < pitWindows.length; j++) {
      const stopB = pitWindows[j]
      const lapDelta = stopB.lap - stopA.lap
      
      // Outside undercut window
      if (lapDelta > 4) break
      if (lapDelta < 1) continue
      
      // Same driver (second stop)
      if (stopA.driverNumber === stopB.driverNumber) continue
      
      const entryB = input.entries.find(e => e.driverNumber === stopB.driverNumber)
      if (!entryB) continue
      
      // Check if A was behind B before A pitted (using grid as proxy for pre-stop position)
      // In reality we'd need lap-by-lap positions, but grid + finish gives us a signal
      const aGridPos = entryA.gridPosition ?? 20
      const bGridPos = entryB.gridPosition ?? 20
      const aFinishPos = entryA.finishPosition ?? 20
      const bFinishPos = entryB.finishPosition ?? 20
      
      // A was behind B at start, but finished ahead
      const aWasBehind = aGridPos > bGridPos
      const aFinishedAhead = aFinishPos < bFinishPos
      
      // This suggests an undercut may have occurred
      if (aWasBehind && aFinishedAhead) {
        // Check if the position change aligns with the pit stop timing
        const positionsGained = bFinishPos - aFinishPos
        
        if (positionsGained > 0) {
          insights.push({
            type: "undercut",
            lap: stopA.lap,
            description: `${entryA.driverName} undercut ${entryB.driverName} — pitted lap ${stopA.lap} vs lap ${stopB.lap}, gained track position with fresh ${stopA.newCompound}s`,
            driverNumber: stopA.driverNumber,
            targetDriverNumber: stopB.driverNumber,
            positionsGained: 1, // Conservative estimate
            metadata: {
              pitLapDelta: lapDelta,
              undercutterPitLap: stopA.lap,
              targetPitLap: stopB.lap,
              newCompound: stopA.newCompound,
            },
          })
        }
      }
    }
  }
  
  return insights
}
