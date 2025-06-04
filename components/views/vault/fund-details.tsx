import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function FundDetail() {
  const fundDetails = [
    { label: "Morningstar Category", value: "Large Growth" },
    { label: "Fund Inception", value: "12/31/1984" },
    {
      label: "Exp Ratio (Gross)",
      value: "0.73%",
      date: "09/28/2024",
      hasTooltip: true,
    },
    {
      label: "Exp Ratio (Net)",
      value: "0.73%",
      date: "09/28/2024",
      hasTooltip: true,
    },
    { label: "NAV", value: "$20.60", date: "06/02/2025", hasTooltip: true },
    { label: "Minimum to Invest", value: "$0.00" },
    {
      label: "Turnover Rate",
      value: "55.00%",
      date: "01/31/2025",
      hasTooltip: true,
    },
    {
      label: "Portfolio Net Assets ($M)",
      value: "$29,465.73",
      date: "05/31/2025",
      hasTooltip: true,
    },
    {
      label: "Share Class Net Assets ($M)",
      value: "$21,799.68",
      date: "05/31/2025",
      hasTooltip: true,
    },
    {
      label: "12 Month Low-High",
      value: "$16.90 - $24.02",
      date: "05/31/2025",
      hasTooltip: true,
    },
  ];

  return (
    <Card className="w-full min-w-[350px] h-[430px] border-none bg-foreground overflow-auto p-2 gap-2 flex-1">
      <div className="pb-1  border-b-1 border-gray-200">
        <CardTitle className="flex items-center gap-2 text-[16px] px-3 font-semibold">
          Details
          <Info className="h-4 w-4 text-[#2470ff]" />
        </CardTitle>
      </div>
      <CardContent className="space-y-3 overflow-y-auto px-3">
        {fundDetails.map((item, index) => (
          <div key={index} className="flex justify-between items-start text-[14px] border-b-1 pb-1">
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
