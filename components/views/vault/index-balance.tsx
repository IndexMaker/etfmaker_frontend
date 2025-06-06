import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdditionalMenu } from "@/components/layouts/additionalMenu";
import { IndexListEntry } from "@/types";
import FundMaker from "@/components/icons/fundmaker";

interface IndexBalanceProps {
  className: string;
  index: IndexListEntry;
  canBuy?: boolean;
  indexName?: string;
  ticker?: string;
  walletBalance?: number;
}

export default function IndexBalance({
  className,
  canBuy = false,
  index,
  indexName,
  ticker,
  walletBalance = 0
}: IndexBalanceProps) {

  return (
    <div className="w-full bg-foreground text-primary border-gray-400">
      <div className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-400">
                <th className="text-left py-3 px-4 font-medium text-secondary">
                  Index Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-secondary">
                  YTD
                </th>
                <th className="text-left py-3 px-4 font-medium text-secondary">
                  Wallet Balance
                </th>
                <th className="sticky right-0 bg-foreground py-3 px-4 font-medium text-secondary text-right">
                  
                </th>
              </tr>
            </thead>
            <tbody>
                <tr
                  className="border-b border-gray-800 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-transparent rounded-full flex items-center justify-center text-sm font-bold">
                        <FundMaker className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{index.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`font-medium ${
                        index.ytdReturn > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {index.ytdReturn}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{walletBalance}</span>
                    </div>
                  </td>
                  <td className="sticky right-0 bg-transparent py-4 px-4 text-right">
                    <AdditionalMenu
                      canBuy={canBuy}
                      indexName={indexName}
                      ticker={ticker}
                      className={""}
                    />
                  </td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
