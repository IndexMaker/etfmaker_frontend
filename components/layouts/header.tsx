"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NetworkSwitcher, networks } from "../elements/network-switcher";
import { CustomButton } from "../ui/custom-button";
import Navigation from "../icons/navigation";
import { LanguageSelector } from "../elements/language-selector";
import { useLanguage } from "@/contexts/language-context";
import onboard, {
  autoConnectRabby,
  switchNetwork,
} from "@/lib/blocknative/web3-onboard";
import { useDispatch, useSelector } from "react-redux";
import { clearWallet, setWallet } from "@/redux/walletSlice";
import {
  setNetwork as setReduxNetwork,
  setSelectedNetwork as setReduxSelectedNetwork,
  setCurrentChainId as setReduxCurrentChainId,
} from "@/redux/networkSlice";
import { shortenAddress } from "@/lib/utils";
import { RootState } from "@/redux/store";
import NavigationAlert from "../icons/navigation-alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import RightArrow from "../icons/right-arrow";
import Switch from "../icons/switch";
import Disconnect from "../icons/disconnect";
import { useCallback, useEffect, useState } from "react";
import { WalletState } from "@web3-onboard/core";
import { NetworkMismatchModal } from "../elements/network-mismatch-modal";
import Image from "next/image";
import Base from "../../public/icons/base.png";
import Info from "../icons/info";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  rightbarOpen: boolean;
  setRightbarOpen: (open: boolean) => void;
}

export function Header({
  sidebarOpen,
  setSidebarOpen,
  rightbarOpen,
  setRightbarOpen,
}: HeaderProps) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentNetwork = searchParams.get("network");
  const [switchOption, setSwitchOption] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const { network, selectedNetwork, currentChainId } = useSelector(
    (state: RootState) => state.network
  );
  const storedWallet = useSelector((state: RootState) => state.wallet.wallet);

  const defaultNetwork =
    networks.find((n) => n.id === searchParams.get("network")) || networks[0];

  const dispatch = useDispatch();
  // Initialize network if not set
  useEffect(() => {
    if (!network) {
      dispatch(setReduxNetwork(defaultNetwork));
    }
  }, [dispatch, defaultNetwork, network]);

  useEffect(() => {
    storedWallet &&
      dispatch(setReduxSelectedNetwork(network?.chainId || "0x1"));
  }, [network, storedWallet, dispatch]);

  useEffect(() => {
    // Update the URL without reloading the page
    const url = new URL(window.location.href);
    if (network) {
      url.searchParams.set("network", network.id);
      router.replace(url.toString(), { scroll: false });
    }
  }, [network, router]);

  // Generate breadcrumb items
  const pathSegments = pathname.split("/").filter((segment) => segment);

  // Only show breadcrumb if there is a second segment (i.e., more than one)
  const shouldShowBreadcrumb = pathSegments.length > 1;

  const breadcrumbItems = pathSegments.map((segment, index) => {
    if (segment === "vault") {
      segment = "earn";
    }
    const path = `../${pathSegments.slice(0, index + 1).join("/")}`;
    const _segment = t("common." + segment);
    return {
      name: _segment.charAt(0).toUpperCase() + segment.slice(1), // Capitalize first letter
      href: path,
    };
  });

  // Listen for wallet chain changes
  useEffect(() => {
    if (currentChainId !== selectedNetwork) {
      storedWallet && setShowModal(true);
    } else {
      setShowModal(false);
    }

    const subscription = onboard.state
      .select("wallets")
      .subscribe((wallets) => {
        if (wallets.length > 0) {
          const chainId = wallets[0].chains[0].id;
          dispatch(setReduxCurrentChainId(chainId));

          if (chainId !== selectedNetwork) {
            setShowModal(true);
          } else {
            setShowModal(false);
          }
        } else {
          dispatch(setReduxCurrentChainId(null));
          setShowModal(false);
        }
      });
    return () => subscription.unsubscribe();
  }, [selectedNetwork, storedWallet, dispatch]);

  const handleNetworkSwitch = useCallback(
    async (chainId: string) => {
      if (!storedWallet) return;

      dispatch(setReduxSelectedNetwork(chainId));

      if (currentChainId !== chainId) {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    },
    [storedWallet, currentChainId, dispatch]
  );

  useEffect(() => {
    // if (!storedWallet && !switchOption) {
    //   autoConnectRabby()
    // }
    if (!storedWallet && switchOption) {
      connectWallet();
      setSwitchOption(false);
    }
  }, [storedWallet, switchOption, setSwitchOption]);

  const connectWallet = useCallback(async () => {
    if (storedWallet) {
      console.log("Wallet already connected:", storedWallet);
      return;
    }
    let connected: boolean | WalletState[] = false;
    if (!switchOption) connected = await autoConnectRabby();
    if (!connected) {
      const wallets = await onboard.connectWallet();
      if (wallets.length > 0) {
        await onboard.setChain({ chainId: selectedNetwork });
        const { label, accounts, chains, icon } = wallets[0]; // Extract only serializable data
        console.log("Connected Wallet:", wallets[0]);

        dispatch(setWallet({ label, accounts, chains, icon })); // Store only serializable parts
        // hide onboard-v2 elements...

        // show How earn makes modal...
      }
    } else {
      if (connected.length > 0) {
        const { label, accounts, chains, icon } = connected[0]; // Extract only serializable data
        console.log("Connected Wallet:", connected[0]);

        dispatch(setWallet({ label, accounts, chains, icon })); // Store only serializable parts

        // hide onboard-v2 elements...
      }
    }
  }, [storedWallet, dispatch, switchOption]);

  const disconnectWallet = async () => {
    if (storedWallet) {
      await onboard.disconnectWallet({ label: storedWallet.label });
      dispatch(clearWallet()); // Clear from Redux
    }
  };

  const switchWallet = useCallback(async () => {
    setSwitchOption(true);
    if (storedWallet) {
      await onboard.disconnectWallet({ label: storedWallet.label });
      dispatch(clearWallet()); // Clear from Redux
    }
  }, [storedWallet, dispatch, setSwitchOption]);

  // Switch wallet's network to match the dApp's selected network
  const handleSwitchWalletNetwork = async () => {
    await switchNetwork(selectedNetwork);
    setShowModal(false); // Close modal after switching
  };

  return (
    <header className="flex h-[55px] md:h-[50px] pt-0 shrink-0 items-center border-b border-transparent bg-background px-[11px] lg:px-[40px]">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Navigation className="h-6 w-6 text-primary" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Breadcrumb (only if there's a second segment) */}
      {shouldShowBreadcrumb && (
        <nav className="text-sm text-secondary hidden md:flex">
          <ol className="flex items-center space-x-2">
            {breadcrumbItems.map((item, index) => (
              <li key={item.href} className="flex items-center">
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-muted text-semibold text-[13px]">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-muted text-semibold hover:text-primary text-[13px]"
                  >
                    {item.name}
                    <span className="mx-2 text-muted text-semibold text-[13px]">
                      {" "}
                      /{" "}
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="ml-auto flex items-center gap-2">
        <LanguageSelector />
        <NetworkSwitcher
          handleNetworkSwitch={handleNetworkSwitch}
          selectedNetwork={network} // Using Redux state
          setSelectedNetwork={(newNetwork) =>
            dispatch(setReduxNetwork(newNetwork))
          }
        />

        {/* Connect Wallet Button */}
        {storedWallet ? (
          <Popover>
            <PopoverTrigger asChild>
              <CustomButton className="flex items-center gap-1 bg-transparent lg:bg-foreground text-[11px] rounded-[3px] cursor-pointer hover:bg-accent">
                <div className="w-[17px] h-[17px] rounded-full bg-gradient-to-br from-[#A5FECA] via-[#3EDCEB] via-[#2594FF] to-[#53F]"></div>
                <span className="text-secondary hidden lg:flex">
                  {shortenAddress(storedWallet.accounts[0].address)}
                </span>
                {currentChainId !== selectedNetwork && (
                  <Info color="#FFB13De6" className="h-4 w-4" />
                )}
              </CustomButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-[300px] p-0 bg-foreground text-card flex flex-col shadow-[0px_1px_20px_0px_rgba(0,0,0,0.04),0px_12px_16px_0px_rgba(6,9,11,0.05),0px_6px_12px_0px_rgba(0,0,0,0.07)] z-100"
              align="end"
              sideOffset={5}
            >
              <Link
                href={
                  `https://etherscan.${
                    currentNetwork === "mainnet" ? "org" : "io"
                  }/address/` + storedWallet.accounts[0].address
                }
                target="_blank"
                className="flex gap-2 px-[8px] py-[12px] items-center h-[48px] border-b-[1px] border-accent cursor-pointer hover:bg-accent"
              >
                <div className="w-[17px] h-[17px] rounded-full bg-gradient-to-br from-[#A5FECA] via-[#3EDCEB] via-[#2594FF] to-[#53F]"></div>
                <span className="text-secondary text-[14px] underline">
                  {shortenAddress(storedWallet.accounts[0].address)}
                </span>
                <RightArrow
                  className="w-4 h-4 rotate-135"
                  width="12px"
                  height="12px"
                />
              </Link>
              {currentChainId !== selectedNetwork ? (
                <div
                  className="flex gap-2 p-[6px] items-center h-[36px] border-b-[1px] border-accent cursor-pointer hover:bg-accent"
                  onClick={handleSwitchWalletNetwork}
                >
                  {currentChainId !== "0x1" ? (
                    <Image
                      src={"https://cdn.morpho.org/assets/chains/eth.svg"}
                      alt={"Ethereum"}
                      width={17}
                      height={17}
                    />
                  ) : (
                    <Image src={Base} alt={"Base"} width={17} height={17} />
                  )}
                  <span className="text-secondary text-[14px]">
                    {t("common.switchWalletNetwork")}
                  </span>
                  <Info color="#FFB13De6" className="h-4 w-4" />
                </div>
              ) : (
                <></>
              )}
              <div
                className="flex gap-2 p-[6px] items-center h-[36px] border-b-[1px] border-accent cursor-pointer hover:bg-accent"
                onClick={switchWallet}
              >
                <Switch className="w-4 h-4 text-primary" />
                <span className="text-secondary text-[14px]">
                  {t("common.switchWallet")}
                </span>
              </div>
              <div
                className="flex gap-2 p-[6px] items-center h-[36px] cursor-pointer hover:bg-accent"
                onClick={disconnectWallet}
              >
                <Disconnect className="w-4 h-4 text-primary" />
                <span className="text-secondary text-[14px]">
                  {t("common.disconnectWallet")}
                </span>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <CustomButton
            onClick={connectWallet}
            className="bg-[#2470ff] hover:bg-blue-700 text-[11px] rounded-[3px] cursor-pointer"
          >
            {t("common.connectWallet")}
          </CustomButton>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setRightbarOpen(!rightbarOpen)}
        >
          <NavigationAlert className="h-7 w-7 text-primary" />
          <span className="sr-only">Toggle Right</span>
        </Button>

        <NetworkMismatchModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          walletChainId={currentChainId || ""}
          desiredNetwork={selectedNetwork}
          onSwitch={handleSwitchWalletNetwork}
        />
      </div>
    </header>
  );
}
