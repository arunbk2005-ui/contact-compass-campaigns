import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryTile {
  title: string
  value: number
  description: string
  colorClass: string
}

interface SummaryTilesProps {
  title: string
  tiles: SummaryTile[]
}

export const SummaryTiles = ({ title, tiles }: SummaryTilesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {tiles.map((tile, index) => (
            <div key={index} className="text-center p-4 border border-border rounded-lg">
              <div className={`text-2xl font-bold ${tile.colorClass}`}>{tile.value}</div>
              <div className="text-sm text-muted-foreground">{tile.description}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}