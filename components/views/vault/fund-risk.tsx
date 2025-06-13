import { Card, CardContent } from "@/components/ui/card"
import { fundRisk } from "@/lib/IndexDetailData"

export default function Risk() {
  return (
    <Card className="w-full min-w-[350px] h-[430px] border-none bg-foreground overflow-auto p-2 gap-2 flex-1">
      <div className="pb-1 border-b-1 border-gray-200">
        <h2 className="text-[16px] px-3 font-semibold">Risk</h2>
      </div>
      <CardContent className="overflow-y-auto px-3">
        <p className="text-[14px] leading-relaxed">
          {fundRisk}
        </p>
      </CardContent>
    </Card>
  )
}
