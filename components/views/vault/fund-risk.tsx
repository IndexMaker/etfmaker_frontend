import { Card, CardContent } from "@/components/ui/card"

export default function Risk() {
  return (
    <Card className="w-full min-w-[350px] h-[430px] border-none bg-foreground overflow-auto p-2 gap-2 flex-1">
      <div className="pb-1 border-b-1 border-gray-200">
        <h2 className="text-[16px] px-3 font-semibold">Risk</h2>
      </div>
      <CardContent className="overflow-y-auto px-3">
        <p className="text-[14px] leading-relaxed">
          Stock markets, especially foreign markets, are volatile and can decline significantly in response to adverse
          issuer, political, regulatory, market, or economic developments. The technology industries can be
          significantly affected by obsolescence of existing technology, short product cycles, falling prices and
          profits, and competition from new markets, and general economic conditions. Foreign securities are subject to
          interest rate, currency exchange rate, economic, and political risks. The securities of smaller, less
          well-known companies can be more volatile than those of larger companies. The fund may have additional
          volatility because it can invest a significant portion of assets in securities of a small number of individual
          issuers.
        </p>
      </CardContent>
    </Card>
  )
}
