import { db } from "@/lib/db"
import { races } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function HomePage() {
  const allRaces = await db.select().from(races)

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stintwise</h1>
          <p className="mt-2 text-muted-foreground">
            F1 race analysis — understanding why races unfold the way they do.
          </p>
        </div>
        <Button>Add Race</Button>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Races</CardTitle>
          <CardDescription>
            All races in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allRaces.length === 0 ? (
            <p className="text-muted-foreground">No races found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Season</TableHead>
                  <TableHead>Round</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Circuit</TableHead>
                  <TableHead>Country</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRaces.map((race) => (
                  <TableRow key={race.id}>
                    <TableCell>{race.season}</TableCell>
                    <TableCell>{race.round}</TableCell>
                    <TableCell className="font-medium">{race.name}</TableCell>
                    <TableCell>{race.circuit}</TableCell>
                    <TableCell>{race.country}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
