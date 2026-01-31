/**
 * Position Change Detection Rule
 * 
 * Detects significant position changes during pit stops.
 * This is simpler than undercut detection - just looks at who gained/lost
 * positions through the pit stop window.
 */

import type { Insight, AnalysisInput } from "../types"

export function detectPitStopPositionChanges(input: AnalysisInput): Insight[] {
  const insights: Insight[] = []
  
  for (const entry of input.entries) {
    const gridPos = entry.gridPosition
    const finishPos = entry.finishPosition
    
    if (gridPos == null || finishPos == null) continue
    
    const positionDelta = gridPos - finishPos // Positive = gained positions
    
    // Only report significant changes (3+ positions)
    if (Math.abs(positionDelta) >= 3) {
      const gained = positionDelta > 0
      
      // Find the pit stop laps for context
      const pitLaps = entry.stints
        .slice(0, -1)
        .map(s => s.endLap)
      
      if (pitLaps.length === 0) continue
      
      insights.push({
        type: "pit_stop_position_change",
        lap: pitLaps[0], // First pit stop
        description: gained
          ? `${entry.driverName} gained ${positionDelta} positions (P${gridPos} → P${finishPos}) — effective pit strategy`
          : `${entry.driverName} lost ${Math.abs(positionDelta)} positions (P${gridPos} → P${finishPos}) — strategy didn't work out`,
        driverNumber: entry.driverNumber,
        positionsGained: positionDelta,
        metadata: {
          gridPosition: gridPos,
          finishPosition: finishPos,
          pitLaps,
        },
      })
    }
  }
  
  // Sort by absolute position change (most significant first)
  return insights.sort((a, b) => Math.abs(b.positionsGained) - Math.abs(a.positionsGained))
}
