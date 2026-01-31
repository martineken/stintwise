/**
 * OpenF1 API client for fetching race data
 */

const BASE_URL = "https://api.openf1.org/v1"

export interface OpenF1Meeting {
  meeting_key: number
  meeting_name: string
  meeting_official_name: string
  location: string
  country_name: string
  circuit_short_name: string
  date_start: string
  date_end: string
  year: number
}

export interface OpenF1Session {
  session_key: number
  session_type: string
  session_name: string
  meeting_key: number
  date_start: string
  date_end: string
}

export interface OpenF1Driver {
  driver_number: number
  name_acronym: string
  first_name: string
  last_name: string
  team_name: string
  country_code: string
}

export interface OpenF1Stint {
  driver_number: number
  stint_number: number
  compound: string
  lap_start: number
  lap_end: number
  tyre_age_at_start: number
}

export interface OpenF1Pit {
  driver_number: number
  lap_number: number
  lane_duration: number
  stop_duration: number | null
  date: string
}

export interface OpenF1SessionResult {
  driver_number: number
  position: number
  number_of_laps: number
  dnf: boolean
  dns: boolean
  dsq: boolean
  gap_to_leader: number | string
  duration: number | null
}

export interface OpenF1StartingGrid {
  driver_number: number
  position: number
}

export interface OpenF1RaceControl {
  date: string
  lap_number: number
  category: string
  flag: string | null
  message: string
  driver_number: number | null
}

export interface OpenF1Lap {
  driver_number: number
  lap_number: number
  lap_duration: number | null
  is_pit_out_lap: boolean
}

async function fetchJson<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value))
  })
  
  // Retry logic for rate limits
  let retries = 3
  let delay = 2000
  
  while (retries > 0) {
    const response = await fetch(url.toString())
    
    if (response.status === 429) {
      retries--
      if (retries > 0) {
        console.log(`  Rate limited, waiting ${delay/1000}s...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
        continue
      }
    }
    
    if (!response.ok) {
      throw new Error(`OpenF1 API error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }
  
  throw new Error("OpenF1 API error: Rate limit exceeded after retries")
}

export async function getMeetings(year: number): Promise<OpenF1Meeting[]> {
  return fetchJson<OpenF1Meeting[]>("/meetings", { year })
}

export async function getMeeting(meetingKey: number): Promise<OpenF1Meeting | null> {
  const meetings = await fetchJson<OpenF1Meeting[]>("/meetings", { meeting_key: meetingKey })
  return meetings[0] ?? null
}

export async function getRaceSession(meetingKey: number): Promise<OpenF1Session | null> {
  const sessions = await fetchJson<OpenF1Session[]>("/sessions", { 
    meeting_key: meetingKey, 
    session_name: "Race" 
  })
  return sessions[0] ?? null
}

export async function getDrivers(sessionKey: number): Promise<OpenF1Driver[]> {
  return fetchJson<OpenF1Driver[]>("/drivers", { session_key: sessionKey })
}

export async function getStints(sessionKey: number): Promise<OpenF1Stint[]> {
  return fetchJson<OpenF1Stint[]>("/stints", { session_key: sessionKey })
}

export async function getPitStops(sessionKey: number): Promise<OpenF1Pit[]> {
  return fetchJson<OpenF1Pit[]>("/pit", { session_key: sessionKey })
}

export async function getSessionResults(sessionKey: number): Promise<OpenF1SessionResult[]> {
  return fetchJson<OpenF1SessionResult[]>("/session_result", { session_key: sessionKey })
}

export async function getStartingGrid(sessionKey: number): Promise<OpenF1StartingGrid[]> {
  return fetchJson<OpenF1StartingGrid[]>("/starting_grid", { session_key: sessionKey })
}

export async function getRaceControl(sessionKey: number): Promise<OpenF1RaceControl[]> {
  return fetchJson<OpenF1RaceControl[]>("/race_control", { session_key: sessionKey })
}

export async function getLaps(sessionKey: number, driverNumber: number): Promise<OpenF1Lap[]> {
  return fetchJson<OpenF1Lap[]>("/laps", { session_key: sessionKey, driver_number: driverNumber })
}
