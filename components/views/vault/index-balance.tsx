import { Button } from "@/components/ui/button";
import FundMaker from "@/components/icons/fundmaker";
import { CustomButton } from "@/components/ui/custom-button";

interface IndexBalanceProps {
  className?: string;
  index: {
    name: string;
    ytdReturn: number;
  };
  walletBalance?: number;
  tokenSymbol?: string;
  instantAPY?: string;
}

export default function IndexBalance({
  className = "",
  index,
  walletBalance = 0,
  tokenSymbol = "USDC",
  instantAPY = "24.79"
}: IndexBalanceProps) {
  return (
    <div className={`w-full bg-foreground rounded-lg shadow ${className}`}>
      <div className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#434343]">
              <tr className="p-4">
                <th className="text-left py-3 px-4 font-medium text-primary">Token</th>
                <th className="text-left py-3 px-4 font-medium text-primary">Instant APY</th>
                <th className="text-left py-3 px-4 font-medium text-primary">Wallet Balance</th>
                <th className="text-right py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="p-4">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-transparent rounded-full flex items-center justify-center">
                      <FundMaker className="w-5 h-5 text-muted" />
                    </div>
                    <span className="font-medium text-secondary">{index.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 font-medium text-secondary">{instantAPY} %</td>
                <td className="py-4 px-4">
                  <div className="flex flex-row gap-2 items-center">
                    <span className="font-medium text-secondary">{walletBalance} {tokenSymbol}</span>
                    <span className="text-[11px] text-secondary p-1 bg-accent">$0</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right border-l border-[#434343] max-w-[140px] w-[140px]">
                  <CustomButton className="min-w-[100px] text-white">
                    Supply
                  </CustomButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}