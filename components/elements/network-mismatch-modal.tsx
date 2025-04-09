import { CustomButton } from "../ui/custom-button";

// Modal Component
export const NetworkMismatchModal = ({
    isOpen,
    onClose,
    walletChainId,
    desiredNetwork,
    onSwitch,
  }: {
    isOpen: boolean;
    onClose: () => void;
    walletChainId: string;
    desiredNetwork: string;
    onSwitch: () => {};
  }) => {
    if (!isOpen) return null;
  
    const walletNetwork =
      walletChainId === "0x1"
        ? "Ethereum"
        : walletChainId === "0x2105"
        ? "Base"
        : "Unknown";
    const desiredNetworkName = desiredNetwork === "0x1" ? "Ethereum" : "Base";
  
    return (
      <div className="absolute z-10 top-[70px] right-[50px] max-w-[400px] rounded-md">
        <div className="bg-foreground p-10 border-accent border-1 rounded-md">
          <span
            className="absolute top-[10px] right-[10px] text-[11px] text-secondary cursor-pointer"
            onClick={onClose}
          >
            Close
          </span>
          <div className="flex flex-col gap-8">
            <div className="flex gap-2 flex-col">
              <p className="text-[16px] text-primary">
                You’re currently connected to the wrong chain.
              </p>
              <p className="text-[14px] text-secondary">
                Current wallet is connected to {walletNetwork}.
              </p>
            </div>
            <CustomButton
              className="rounded-[4px] w-full text-[13px] font-200"
              variant="default"
              onClick={onSwitch}
            >
              Switch to {desiredNetworkName}
            </CustomButton>
          </div>
        </div>
      </div>
    );
  };