"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Sparkles, CheckCircle2, Circle, Copy } from "lucide-react";
import CustomTooltip from "./custom-tooltip";
import USDC from "../../public/logos/usd-coin.png";
import IndexMaker from "../icons/indexmaker";
interface TransactionItem {
  token: string;
  amount: number;
  value: number;
  apy: number;
  collateral: {
    name: string;
    logo: string;
  }[];
}

interface TransactionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionItem[] | null;
}

export function TransactionConfirmModal({
  isOpen,
  onClose,
  transactions,
}: TransactionConfirmModalProps) {
  const [step, setStep] = useState<"review" | "confirm">("review");

  const [approvalComplete, setApprovalComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  //   const { wallet, connect } = useWeb3()

  const handleConfirm = async () => {
    // if (!wallet) {
    //   await connect()
    //   return
    // }

    if (step === "review") {
      setStep("confirm");
    } else {
      setIsProcessing(true);
      // Simulate approval process
      setTimeout(() => {
        setApprovalComplete(true);
        setIsProcessing(false);
      }, 2000);
    }
  };

  const handleApproval = async () => {
    setIsProcessing(true);
    // Simulate approval transaction
    setTimeout(() => {
      setApprovalComplete(true);
      setIsProcessing(false);
    }, 2000);
  };

  const resetModal = () => {
    setStep("review");
    setApprovalComplete(false);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-background border-accent text-primary">
        <div className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-bold">
            {step === "review" ? "Review transaction" : "Confirm transaction"}
          </DialogTitle>
          {/* <Button
            variant="ghost"
            size="[12px]"
            onClick={handleClose}
            className="text-secondary hover:text-primary h-auto p-1"
          >
            Cancel
          </Button> */}
        </div>

        {step === "review" && transactions ? (
          <div className="space-y-4">
            {/* Multiple Transaction Items */}
            {transactions.map((transaction, index) => (
              <div key={transaction.token} className="space-y-3">
                {/* Token Info */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-transparent rounded-full flex items-center justify-center">
                    <span className="text-[12px] font-bold">
                      <IndexMaker className="w-[24px] h-[24px] text-muted" />
                    </span>
                  </div>
                  <span className="font-bold text-[18px]">{transaction.token}</span>
                </div>

                {/* Transaction Details */}
                <div className="space-y-3 bg-foreground rounded-lg p-4 pt-8 pb-4">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-secondary">Supply</span>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-transparent rounded-full flex items-center justify-center">
                        <Image
                          src={USDC}
                          alt="USDC"
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      </div>
                      <span className="font-medium">
                        {transaction.amount} USDC
                        {/* {transaction.value} */}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-secondary">Net Supply APY</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{transaction.apy}</span>
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-secondary">Collateral</span>
                    <div className="flex items-center gap-1">
                      {transaction.collateral.length > 0 ? (
                        transaction.collateral
                          .slice(0, 5)
                          .map((collateral, index) => (
                            <CustomTooltip
                              key={"collateral-" + index.toString()}
                              content={
                                <div className="flex flex-col gap-1 min-w-[220px] bg-foreground rounded-[8px]">
                                  <div className="flex justify-between border-b py-1 px-3 border-accent">
                                    <span>Collateral</span>
                                    <div className="flex items-center">
                                      <Image
                                        src={collateral.logo || USDC}
                                        alt={"USDC"}
                                        width={17}
                                        height={17}
                                      />
                                      <span>PT-U...025</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between border-b py-1 px-3 border-accent">
                                    <span className="">Oracle</span>
                                    <a
                                      target="_blank"
                                      href="https://etherscan.io/address/0xDddd770BADd886dF3864029e4B377B5F6a2B6b83"
                                      className="hover:bg-[afafaf20]"
                                    >
                                      Exchange rate
                                    </a>
                                    <Copy className="w-[15px] h-[15px]" />
                                  </div>
                                </div>
                              }
                            >
                              <div className="flex items-center gap-1 hover:px-1 hover:transition-all">
                                {/* <span className="hover:px-1 hover:transition-all text-primary text-[12px] cursor-pointer">
                                    {collateral.name}
                                  </span> */}
                                <Image
                                  src={collateral.logo ?? USDC}
                                  alt={collateral.name}
                                  width={17}
                                  height={17}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            </CustomTooltip>
                          ))
                      ) : (
                        <></>
                      )}
                      {transaction.collateral.length > 5 && (
                        <CustomTooltip
                          content={
                            <div className="flex flex-col gap-2 p-2 overflow-y-auto max-h-[300px] bg-foreground">
                              {transaction.collateral
                                .slice(5)
                                .map((collateral, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <span>{collateral.name}</span>
                                  </div>
                                ))}
                            </div>
                          }
                        >
                          <span className="text-[12px] pl-2 text-secondary">
                            + {transaction.collateral.length - 5}
                          </span>
                        </CustomTooltip>
                      )}
                    </div>
                  </div>
                </div>

                {index < transactions.length - 1 && (
                  <div className="border-t border-accent my-4" />
                )}
              </div>
            ))}

            {/* Terms */}
            <p className="text-[11px] text-secondary">
              By confirming this transaction, you agree to the{" "}
              <a
                target="_blank"
                href={
                  "https://psymm.gitbook.io/indexmaker/index-maker-hld/compliance/terms-of-use"
                }
                className="underline cursor-pointer"
              >
                Terms of Use
              </a>{" "}
              and the services provisions relating to the IndexMaker Vault.
            </p>

            {/* Confirm Button */}
            <Button
              onClick={handleConfirm}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Confirm"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Step 1: Approval */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {approvalComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                ) : (
                  <Circle className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-medium">
                  Approve the bundler to spend tokens (via permit)
                </p>
                {!approvalComplete && (
                  <Button
                    onClick={handleApproval}
                    size="sm"
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Approving..." : "Approve"}
                  </Button>
                )}
              </div>
            </div>

            {/* Step 2: Bundle Actions */}
            <div className="flex items-start gap-3">
              <div className="mt-0">
                <Circle
                  className={`w-5 h-5 ${
                    approvalComplete ? "text-blue-500" : "text-secondary"
                  }`}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`text-[15px] font-medium ${
                    approvalComplete ? "text-primary" : "text-secondary"
                  }`}
                >
                  Bundle the following actions
                </p>
                <div
                  className={`mt-4 space-y-2 ${
                    approvalComplete ? "" : "opacity-50"
                  }`}
                >
                  {transactions &&
                    transactions.map((transaction) => (
                      <div
                        key={transaction.token + "-2nd"}
                        className="p-3 bg-foreground rounded-lg"
                      >
                        <p className="text-[12px] text-secondary">
                          Supply {transaction.amount} to {transaction.token}
                        </p>
                      </div>
                    ))}
                </div>
                {approvalComplete && (
                  <Button
                    onClick={() => {
                      // Handle final transaction
                      handleClose();
                    }}
                    size="sm"
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Execute Transaction
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
