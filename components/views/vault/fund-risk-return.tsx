import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"

export default function FundRiskReturn() {
  const RiskReturnScale = ({
    title,
    selectedIndex,
    showLabels = true,
  }: {
    title: string
    selectedIndex: number
    showLabels?: boolean
  }) => (
    <div className="space-y-2">
      <h3 className="text-[13px] font-medium text-center border-b border-dotted border-gray-400 pb-1">{title}</h3>
      <div className="flex justify-center gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`w-6 h-6 border border-gray-300 ${
              index === selectedIndex ? "bg-blue-600" : index < selectedIndex ? "bg-blue-400" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      {showLabels && (
        <div className="flex justify-between text-[11px] text-gray-600 px-1">
          <span>Low</span>
          <span>Avg</span>
          <span>High</span>
        </div>
      )}
    </div>
  )

  const CategoryRiskScale = () => (
    <div className="space-y-2">
      <h3 className="text-[13px] font-medium text-center border-b border-dotted border-gray-400 pb-1">
        Risk of this Category
      </h3>
      <div className="relative">
        <div className="h-2 bg-gradient-to-r from-green-300 via-yellow-300 to-red-300 rounded-full"></div>
        <div
          className="absolute top-0 w-3 h-2 bg-blue-600 rounded-full transform -translate-x-1/2"
          style={{ left: "65%" }}
        ></div>
      </div>
      <div className="flex justify-between text-[11px] text-gray-600">
        <span>Lower</span>
        <span>Higher</span>
      </div>
    </div>
  )

  return (
    <Card className="w-full min-w-[350px] h-[430px] border-none bg-foreground overflow-auto p-2 gap-2 flex-1">
      <div className="pb-1  border-b-1 border-gray-200">
        <div className="flex items-center justify-between px-3">
          <h2 className="flex items-center gap-2 text-[16px] font-semibold">
            Fund Risk and Return
            <Info className="h-4 w-4 text-[#2470ff]" />
          </h2>
          <span className="text-[12px] text-gray-500">AS OF 04/30/2025</span>
        </div>
      </div>
      <CardContent className="space-y-6 overflow-y-auto px-3">
        <div className="text-[14px]">
          <span className="font-medium">Morningstar Category:</span> Large Growth
        </div>

        <div className="space-y-8">
          <RiskReturnScale title="Return of this Fund within Morningstar Category" selectedIndex={3} />

          <RiskReturnScale title="Risk of this Fund within Morningstar Category" selectedIndex={2} />

          <CategoryRiskScale />
        </div>
      </CardContent>
    </Card>
  )
}
