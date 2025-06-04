import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Info, MoreVertical } from "lucide-react"

export default function FundManager() {
  const fundsManaged = [
    "VIP Balanced Portfolio - Investor Class (since 12/05/2024)",
    "Fidelity Advisor® Equity Growth Fund Class C (since 04/11/2025)",
    "VIP Growth Portfolio - Service Class 2 (since 04/11/2025)",
    "Fidelity® Growth Discovery Fund (since 04/11/2025)",
    "Fidelity Advisor® Equity Growth Fund Class M (since 04/11/2025)",
    "VIP Balanced Portfolio - Service Class 2 (since 12/05/2024)",
    "Fidelity Advisor® Equity Growth Fund Class A (since 04/11/2025)",
    "VIP Balanced Portfolio - Service Class (since 12/05/2024)",
    "Fidelity® Balanced Fund (since 12/05/2024)",
    "VIP Balanced Portfolio - Initial Class (since 12/05/2024)",
    "VIP Growth Portfolio - Initial Class (since 04/11/2025)",
    "VIP Growth Portfolio - Service Class (since 04/11/2025)",
  ]

  const commentaryLinks = [
    { title: "Quarterly Fund Review", href: "#" },
    { title: "Portfolio Manager Q&A", href: "#" },
    { title: "Investment Approach", href: "#" },
  ]

  return (
    <Card className="w-full  min-w-[350px] h-[430px] border-none bg-foreground overflow-auto p-2 gap-2 flex-1">
      <div className="pb-1  border-b-1 border-gray-200">
        <h2 className="flex items-center gap-2 text-[16px] px-3 font-semibold">
          Fund Manager(s)
          <Info className="h-4 w-4 text-[#2470ff]" />
        </h2>
      </div>
      <CardContent className="space-y-3 px-3 overflow-y-auto relative">
        <div className="flex items-center gap-3">
          <div className="bg-gray-300 rounded-full h-12 w-12 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-gray-600"
            >
              <circle cx="12" cy="8" r="5" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
          </div>
          <div>
            <div className="font-medium">Christopher W. Lin</div>
            <div className="text-sm">Primary Manager</div>
            <div className="text-sm">Manager Tenure: since 09/16/2017</div>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-center pb-1">
            <div className="font-medium">Funds Currently Managed</div>
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-[1px] bg-[#2470ff] w-full mb-2"></div>
          <ul className="list-disc pl-5 space-y-2 text-sm max-h-[180px] ">
            {fundsManaged.map((fund, index) => (
              <li
                key={index}
                className="text-[13px]"
                dangerouslySetInnerHTML={{ __html: fund.replace(/®/g, "<sup>®</sup>") }}
              />
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <div className="pt-2 border-t border-gray-200 bottom-0">
          <div className="font-medium pb-1">Commentary</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {commentaryLinks.map((link, index) => (
              <div key={index} className="text-sm text-[#2470ff] hover:underline cursor-pointer">
                {link.title}
              </div>
            ))}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
