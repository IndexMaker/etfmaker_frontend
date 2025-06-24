import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIndexData } from "@/lib/IndexMockupData";
import { Info } from "lucide-react";

export default function FundDetail({indexId = 'SY100'}: {indexId: string}) {
  const fundDetails = getIndexData(indexId).fundDetails || []

  return (
    <Card className="w-full min-w-[350px] h-[440px] border-none bg-foreground overflow-auto p-2 gap-2 flex-1">
      <div className="pb-1  border-b-1 border-gray-200">
        <CardTitle className="flex items-center gap-2 text-[16px] px-3 font-semibold">
          Details
          <Info className="h-4 w-4 text-[#2470ff]" />
        </CardTitle>
      </div>
      <CardContent className="space-y-3 overflow-y-auto px-3">
        {fundDetails.map((item: any) => (
          <div key={indexId} className="flex justify-between items-start text-[14px] border-b-1 pb-1">
            <div className="flex gap-2 pr-4">
              <span
                className={`${
                  item.hasTooltip
                    ? "border-b-2 border-dotted border-gray-400 cursor-help"
                    : ""
                }`}
              >
                {item.label}
              </span>
              {item.date && (
                <div className="text-[12px] text-muted mt-0.5">{item.date}</div>
              )}
            </div>
            <div className="text-right font-medium">{item.value}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
