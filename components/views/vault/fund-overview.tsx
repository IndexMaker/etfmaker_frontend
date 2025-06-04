import { Card, CardContent } from "@/components/ui/card"
import { Cpu, MapPin } from "lucide-react"

export default function FundOverview() {
  return (
    <Card className="w-full min-w-[350px] h-[430px] border-none bg-foreground overflow-auto p-2 gap-2 flex-1">
      <div className="pb-1  border-b-1 border-gray-200">
        <h2 className="text-[16px] px-3 font-semibold">Fund Overview</h2>
      </div>
      <CardContent className="space-y-4 overflow-y-auto px-3 text-[14px]">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-medium mb-1">Top Sector</div>
            <div className="text-[12px] text-muted mb-2">AS OF 04/30/2025</div>
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium text-[13px]">Information</div>
                <div className="font-medium text-[13px]">Technology</div>
              </div>
            </div>
          </div>
          <div>
            <div className="font-medium mb-1">Top Country</div>
            <div className="text-[12px] text-muted mb-2">AS OF 04/30/2025</div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-300 rounded-sm flex items-center justify-center">
                <MapPin className="h-3 w-3 text-[#2470ff]" />
              </div>
              <div>
                <div className="font-medium text-[13px]">United States</div>
                <div className="font-medium text-[13px]">93.66%</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="font-medium mb-2">Objective</div>
          <p className="text-[13px]">Seeks capital appreciation.</p>
        </div>

        <div>
          <div className="font-medium mb-2">Strategy</div>
          <p className="text-[13px] leading-relaxed">
            Normally investing at least 80% of assets in securities principally traded on NASDAQ or an over-the-counter
            market, which has more small and medium-sized companies than other markets. Investing more than 25% of total
            assets in the technology sector. Investing in either "growth" stocks or "value" stocks or both. Normally
            investing primarily in common stocks.
          </p>
        </div>

        <div>
          <div className="font-medium mb-2">Risk</div>
          <p className="text-[13px] leading-relaxed">
            Stock markets, especially foreign markets, are volatile and can decline significantly in response to adverse
            issuer, political, regulatory, market, or economic developments. The technology industries can be
            significantly affected by obsolescence of existing technology, short product cycles, falling prices and
            profits, and competition from new market entrants and general economic conditions. Foreign securities are
            subject to interest rate, currency exchange rate, economic, and political risks. The securities of smaller,
            less well-known companies can be more volatile than those of larger companies. The fund may have additional
            volatility because it can invest a significant portion of its assets in securities of a small number of
            individual issuers.
          </p>
        </div>

        <div>
          <div className="font-medium mb-2">Additional Disclosures</div>
          <p className="text-[13px] leading-relaxed">
            This description is only intended to provide a brief overview of the mutual fund. Read the fund's prospectus
            for more detailed information about the fund.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
