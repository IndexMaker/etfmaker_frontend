"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/language-context";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useWallet } from "@/contexts/wallet-context";
interface HowEarnWorksProps {
  onClose: () => void;
}

export function HowEarnWorks({ onClose }: HowEarnWorksProps) {
  const {
    wallet,
    isConnected,
    connecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    switchWallet,
  } = useWallet();
  const { t } = useLanguage();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { theme } = useTheme();
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  // const storedWallet = useSelector((state: RootState) => state.wallet?.wallet);
  // Load from localStorage on mount
  useEffect(() => {
    const storedValue = localStorage.getItem("termsAccepted");
    if (storedValue === "true") {
      setTermsAccepted(true);
    }
  }, []);

  // Save to localStorage whenever termsAccepted changes
  useEffect(() => {
    localStorage.setItem("termsAccepted", termsAccepted.toString());
  }, [termsAccepted]);

  const handleStepChange = (step: number) => {
    setActiveStep(step);

    const targetId = step === 2 ? "second-path-long-vertical" : `step-${step}`; // SVG Element ID
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  useEffect(() => {
    handleStepChange(activeStep);
  }, [activeStep]);

  if (isMobile) {
    return (
      <div className="flex flex-col px-3 border-none py-[60px] pt-[60px] relative h-auto">
        {/* Top disclaimer section */}
        <div className="mb-6">
          <div className="flex justify-end mb-2">
            {!wallet && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-secondary w-5 h-5 rounded-[4px] hover:text-primary absolute top-3 p-[6px] bg-accent right-3"
              >
                <X className="h-[8px] w-[8px]" />
              </Button>
            )}
          </div>

          <p
            className="text-secondary text-sm mb-4"
            dangerouslySetInnerHTML={{
              __html: t("common.fundmakerSecurityWithLinks"),
            }}
          ></p>

          <div className="flex gap-2 mb-4 items-center">
            <Checkbox
              id="terms-mobile"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 cursor-pointer"
            />
            <label
              htmlFor="terms-mobile"
              className="text-sm text-secondary"
              dangerouslySetInnerHTML={{
                __html: t("common.checkBoxConfirmationWithLink"),
              }}
            ></label>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
            disabled={!termsAccepted}
            onClick={onClose}
          >
            {t("common.proceed")}
          </Button>
        </div>

        {/* Title */}
        <h2 className="text-[20px] text-card font-normal text-center mb-8">
          {t("common.howEarnWorks")}
        </h2>

        {/* Visualization */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="w-[250px] h-[340px] overflow-hidden">
            <svg viewBox="0 0 537 1465" fill="none" className="anim-svg">
              <g id="step-1">
                <path
                  d="M53.6741 59.9883H55.1461V70.2203H61.5461V71.5083H53.6741V59.9883ZM62.5421 67.4283C62.5421 64.6603 64.0781 63.1643 66.4941 63.1643C68.9181 63.1643 70.2541 64.6763 70.2541 67.0763V67.7803H63.9021C63.9341 69.4763 64.9101 70.5643 66.4941 70.5643C67.9981 70.5643 68.6941 69.7083 68.8221 68.9563H70.0861V69.1963C69.9021 70.1963 68.9581 71.7003 66.5101 71.7003C64.0941 71.7003 62.5421 70.2043 62.5421 67.4283ZM63.9261 66.6683H68.9101C68.8941 65.2763 68.0701 64.2923 66.4861 64.2923C64.9341 64.2923 64.0381 65.2923 63.9261 66.6683ZM72.0926 63.3563H73.4606V64.4043H73.5886C74.1726 63.5163 75.1566 63.1723 76.3166 63.1723C78.2126 63.1723 79.3966 64.1323 79.3966 66.1243V71.5083H77.9886V66.2603C77.9886 64.9323 77.2686 64.3483 75.9966 64.3483C74.6046 64.3483 73.5006 65.1723 73.5006 66.9563V71.5083H72.0926V63.3563ZM89.1435 59.9883V71.5083H87.7755V70.3883H87.6475C87.0315 71.3243 86.0475 71.6923 84.8875 71.6923C82.7675 71.6923 81.1515 70.2523 81.1515 67.4363C81.1515 64.6123 82.7675 63.1723 84.8875 63.1723C86.0235 63.1723 86.9995 63.5323 87.6075 64.4363H87.7355V59.9883H89.1435ZM82.5675 67.4363C82.5675 69.4123 83.6235 70.5243 85.1755 70.5243C86.7355 70.5243 87.7915 69.4123 87.7915 67.4363C87.7915 65.4523 86.7355 64.3403 85.1755 64.3403C83.6235 64.3403 82.5675 65.4523 82.5675 67.4363ZM90.9796 67.4283C90.9796 64.6603 92.5156 63.1643 94.9316 63.1643C97.3556 63.1643 98.6916 64.6763 98.6916 67.0763V67.7803H92.3396C92.3716 69.4763 93.3476 70.5643 94.9316 70.5643C96.4356 70.5643 97.1316 69.7083 97.2596 68.9563H98.5236V69.1963C98.3396 70.1963 97.3956 71.7003 94.9476 71.7003C92.5316 71.7003 90.9796 70.2043 90.9796 67.4283ZM92.3636 66.6683H97.3476C97.3316 65.2763 96.5076 64.2923 94.9236 64.2923C93.3716 64.2923 92.4756 65.2923 92.3636 66.6683ZM100.53 63.3563H101.89V64.3323H102.018C102.298 63.7563 102.81 63.3243 104.034 63.3243H105.17V64.5403H104.066C102.538 64.5403 101.938 65.3803 101.938 67.0363V71.5083H100.53V63.3563Z"
                  fill={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  opacity={activeStep === 1 ? "1" : "0.1"}
                  // style="transition: var(--transitions-appear);"
                ></path>
                <path
                  d="M276.972 66.5099L117.972 66.5066"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  opacity={activeStep === 1 ? "1" : "0.1"}
                  // style="transition: var(--transitions-appear);"
                ></path>
              </g>
              <g>
                <path
                  d="M52.9207 445.365H54.3607L56.6807 455.277H56.8087L59.4727 445.365H61.2167L63.8727 455.277H64.0007L66.3207 445.365H67.7207V445.605L64.9767 456.885H62.9927L60.3847 447.197H60.2567L57.6487 456.885H55.6647L52.9207 445.605V445.365ZM69.5027 445.365H77.5187V446.605H70.9587V450.445H76.7187V451.685H70.9587V455.645H77.6307V456.885H69.5027V445.365ZM78.6616 445.365H88.4536V446.637H84.2936V456.885H82.8216V446.637H78.6616V445.365ZM90.1746 445.365H91.6386V450.453H97.8146V445.365H99.2866V456.885H97.8146V451.749H91.6386V456.885H90.1746V445.365ZM105.075 445.365H106.555L110.179 455.389H110.307L113.939 445.365H115.371V445.605L111.171 456.885H109.283L105.075 445.605V445.365ZM115.685 450.997C115.853 449.485 117.149 448.541 119.261 448.541C121.357 448.541 122.589 449.485 122.589 451.517V456.885H121.277V455.765H121.149C120.805 456.397 119.957 457.061 118.285 457.061C116.525 457.061 115.293 456.173 115.293 454.653C115.293 453.037 116.517 452.325 118.165 452.117L121.229 451.733V451.437C121.229 450.165 120.549 449.661 119.229 449.661C117.901 449.661 117.117 450.165 117.005 451.237H115.685V450.997ZM116.693 454.589C116.693 455.437 117.405 455.925 118.517 455.925C120.005 455.925 121.229 455.125 121.229 453.325V452.821L118.445 453.189C117.365 453.333 116.693 453.733 116.693 454.589ZM132.012 456.885H130.644V455.845H130.516C129.94 456.725 128.964 457.069 127.804 457.069C125.908 457.069 124.74 456.109 124.74 454.117V448.733H126.148V453.981C126.148 455.309 126.852 455.893 128.124 455.893C129.516 455.893 130.604 455.069 130.604 453.285V448.733H132.012V456.885ZM134.327 445.365H135.735V456.885H134.327V445.365ZM137.182 448.733H139.11V446.493H140.518V448.733H142.958V449.877H140.518V455.541L140.646 455.669H142.934V456.885H141.206C139.87 456.885 139.11 456.221 139.11 454.893V449.877H137.182V448.733Z"
                  fill={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  opacity={activeStep !== 3 ? "1" : "0.1"}
                  // style="transition: var(--transitions-appear);"
                ></path>
                <path
                  d="M204.972 451.887L155.972 451.883"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  opacity={activeStep !== 3 ? "0.5" : "0.1"}
                  // style="transition: var(--transitions-appear);"
                ></path>
              </g>
              <g>
                <path
                  d="M58.4732 1378.91C60.5212 1378.91 62.0412 1379.87 62.0412 1381.81C62.0412 1383.65 60.8412 1384.26 60.1612 1384.41V1384.54C60.8972 1384.71 62.2572 1385.29 62.2572 1387.29C62.2572 1389.41 60.6332 1390.43 58.5292 1390.43H53.4012V1378.91H58.4732ZM54.8492 1389.19H58.3692C59.7852 1389.19 60.8172 1388.63 60.8172 1387.19C60.8172 1385.74 59.7852 1385.19 58.3692 1385.19H54.8492V1389.19ZM54.8492 1383.95H58.2892C59.6092 1383.95 60.6332 1383.45 60.6332 1382.05C60.6332 1380.65 59.6092 1380.15 58.2892 1380.15H54.8492V1383.95ZM63.6129 1386.35C63.6129 1383.6 65.2849 1382.08 67.7649 1382.08C70.2369 1382.08 71.9169 1383.6 71.9169 1386.35C71.9169 1389.1 70.2369 1390.62 67.7649 1390.62C65.2849 1390.62 63.6129 1389.1 63.6129 1386.35ZM65.0369 1386.35C65.0369 1388.37 66.1329 1389.47 67.7649 1389.47C69.3889 1389.47 70.4849 1388.37 70.4849 1386.35C70.4849 1384.33 69.3889 1383.24 67.7649 1383.24C66.1329 1383.24 65.0369 1384.33 65.0369 1386.35ZM73.7415 1382.27H75.1015V1383.25H75.2295C75.5095 1382.67 76.0215 1382.24 77.2455 1382.24H78.3815V1383.46H77.2775C75.7495 1383.46 75.1495 1384.3 75.1495 1385.95V1390.43H73.7415V1382.27ZM79.9447 1382.27H81.3047V1383.25H81.4327C81.7127 1382.67 82.2247 1382.24 83.4487 1382.24H84.5847V1383.46H83.4807C81.9527 1383.46 81.3527 1384.3 81.3527 1385.95V1390.43H79.9447V1382.27ZM85.3473 1386.35C85.3473 1383.6 87.0193 1382.08 89.4993 1382.08C91.9713 1382.08 93.6513 1383.6 93.6513 1386.35C93.6513 1389.1 91.9713 1390.62 89.4993 1390.62C87.0193 1390.62 85.3473 1389.1 85.3473 1386.35ZM86.7713 1386.35C86.7713 1388.37 87.8673 1389.47 89.4993 1389.47C91.1233 1389.47 92.2193 1388.37 92.2193 1386.35C92.2193 1384.33 91.1233 1383.24 89.4993 1383.24C87.8673 1383.24 86.7713 1384.33 86.7713 1386.35ZM94.5654 1382.27H95.9094L97.5654 1388.82H97.7014L99.6854 1382.27H101.245L103.237 1388.82H103.365L105.013 1382.27H106.317V1382.51L104.181 1390.43H102.493L100.509 1383.91H100.381L98.3974 1390.43H96.7014L94.5654 1382.51V1382.27ZM107.254 1386.35C107.254 1383.58 108.79 1382.08 111.206 1382.08C113.63 1382.08 114.966 1383.59 114.966 1385.99V1386.7H108.614C108.646 1388.39 109.622 1389.48 111.206 1389.48C112.71 1389.48 113.406 1388.63 113.534 1387.87H114.798V1388.11C114.614 1389.11 113.67 1390.62 111.222 1390.62C108.806 1390.62 107.254 1389.12 107.254 1386.35ZM108.638 1385.59H113.622C113.606 1384.19 112.782 1383.21 111.198 1383.21C109.646 1383.21 108.75 1384.21 108.638 1385.59ZM116.804 1382.27H118.164V1383.25H118.292C118.572 1382.67 119.084 1382.24 120.308 1382.24H121.444V1383.46H120.34C118.812 1383.46 118.212 1384.3 118.212 1385.95V1390.43H116.804V1382.27Z"
                  fill={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  opacity={activeStep === 3 ? "1" : "0.5"}
                  // style="transition: var(--transitions-appear);"
                ></path>
                <path
                  d="M276.972 1385.43L133.972 1385.42"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  opacity={activeStep === 3 ? "1" : "0.1"}
                  // style="transition: var(--transitions-appear);"
                ></path>
              </g>
              <path
                id="first-path"
                d="M268.468 109.474v295"
                stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 4"
                opacity={activeStep === 1 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></path>
              <g
                opacity={activeStep === 1 ? "1" : "0"}
                // style="transition: var(--transitions-appear);"
              >
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                ></path>
                <animateMotion
                  dur="4s"
                  begin="0s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#first-path"></mpath>
                </animateMotion>
              </g>
              <g
                opacity={activeStep === 1 ? "1" : "0"}
                // style="transition: var(--transitions-appear);"
              >
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                  opacity="0"
                >
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    begin="2s"
                    dur="0.01s"
                    fill="freeze"
                  ></animate>
                </path>
                <animateMotion
                  dur="4s"
                  begin="2s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#first-path"></mpath>
                </animateMotion>
              </g>
              <path
                id="second-path-long-vertical"
                d="M268.46 558.8L268.46 750.79"
                stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 4"
                opacity={activeStep === 2 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></path>
              <path
                id="second-path-left-part"
                d="M268.448 680.458L97.1001 680.458C86.0544 680.458 77.1001 689.413 77.1001 700.458L77.1001 825.73"
                stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 4"
                opacity={activeStep === 2 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></path>
              <path
                id="second-path-right-part"
                d="M268.448 680.458L439.535 680.458C450.563 680.458 459.51 689.386 459.535 700.414L459.809 824.174"
                stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 4"
                opacity={activeStep === 2 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              >
                <g opacity={activeStep === 2 ? "1" : "0"}>
                  <path
                    d="M6.2683 0l-6.2683 6l-6.2683 -6"
                    stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="rotate(-90)"
                  ></path>
                  <animateMotion
                    dur="2s"
                    begin="0s"
                    rotate="auto"
                    repeatCount="indefinite"
                  >
                    <mpath href="#second-path-long-vertical"></mpath>
                  </animateMotion>
                </g>
              </path>
              <g opacity={activeStep === 2 ? "1" : "0"}>
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                ></path>
                <animateMotion
                  dur="2s"
                  begin="0s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#second-path-long-vertical"></mpath>
                </animateMotion>
              </g>
              <g
                opacity={activeStep === 2 ? "1" : "0"}
                // style="transition: var(--transitions-appear);"
              >
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                  opacity="0"
                >
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    begin="1.26s"
                    dur="0.01s"
                    fill="freeze"
                  ></animate>
                </path>
                <animateMotion
                  dur="2s"
                  begin="1.26s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#second-path-right-part"></mpath>
                </animateMotion>
              </g>
              <g
                opacity={activeStep === 2 ? "1" : "0"}
                // style="transition: var(--transitions-appear);"
              >
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                  opacity="0"
                >
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    begin="1.26s"
                    dur="0.01s"
                    fill="freeze"
                  ></animate>
                </path>
                <animateMotion
                  dur="2s"
                  begin="1.26s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#second-path-left-part"></mpath>
                </animateMotion>
              </g>
              <path
                id="third-path-vertical-part"
                d="M268.468 1387.43L268.468 930"
                stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 4"
                opacity={activeStep === 3 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></path>
              <path
                id="third-path-left-part"
                d="M268.512 1009.24L97.1016 1009.24C86.0559 1009.24 77.1016 1000.28 77.1016 989.237L77.1016 930.228"
                stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 4"
                opacity={activeStep === 3 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></path>
              <path
                id="third-path-right-part"
                d="M268.472 1009.24L439.826 1009.24C450.872 1009.24 459.826 1000.28 459.826 989.237L459.826 923.857"
                stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 4"
                opacity={activeStep === 3 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></path>
              <g
                opacity={activeStep === 3 ? "1" : "0"}
                // style="transition: var(--transitions-appear);"
              >
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                ></path>
                <animateMotion
                  dur="3s"
                  begin="0s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#third-path-vertical-part"></mpath>
                </animateMotion>
              </g>
              <g
                opacity={activeStep === 3 ? "1" : "0"}
                // style="transition: var(--transitions-appear);"
              >
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                >
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    begin="2.4375s"
                    dur="0.01s"
                    fill="freeze"
                  ></animate>
                </path>
                <animateMotion
                  dur="3s"
                  begin="2.4375s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#third-path-left-part"></mpath>
                </animateMotion>
              </g>
              <g
                opacity={activeStep === 3 ? "1" : "0"}
                // style="transition: var(--transitions-appear);"
              >
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                >
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    begin="2.4375s"
                    dur="0.01s"
                    fill="freeze"
                  ></animate>
                </path>
                <animateMotion
                  dur="3s"
                  begin="2.4375s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#third-path-right-part"></mpath>
                </animateMotion>
              </g>
              <image
                href="https://cdn.morpho.org/v2/assets/images/graph_person.png"
                height="136"
                x="222"
                opacity={activeStep === 1 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></image>
              <rect width="10" height="95" x="263" y="190" fill="none"></rect>
              <image
                href="https://cdn.morpho.org/v2/assets/images/graph_weth.png"
                height="97"
                x="232"
                y="187"
                opacity={activeStep === 1 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></image>
              <image
                href="https://cdn.morpho.org/v2/assets/images/graph_eth_in_cube.png"
                height="219"
                x="174"
                y="342"
                opacity="1"
                //   style="transition: var(--transitions-appear);"
              ></image>
              <image
                id="step-3"
                href="https://cdn.morpho.org/v2/assets/images/graph_yield.png"
                height="98"
                x="232"
                y="1090"
                opacity={activeStep === 3 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></image>
              <image
                href="https://cdn.morpho.org/v2/assets/images/graph_person.png"
                height="136"
                x="222"
                y="1310"
                opacity={activeStep === 3 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></image>
              <svg
                x="-26"
                y="708"
                opacity={activeStep !== 1 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              >
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin.png"
                  x="25.9502"
                  y="33"
                  width="152"
                  height="175"
                ></image>
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin_flipped.png"
                  x="25.9502"
                  y="22"
                  width="152"
                  height="175"
                ></image>
                ;
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin.png"
                  x="25.9502"
                  y="11"
                  width="152"
                  height="175"
                ></image>
                ;
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin_flipped.png"
                  x="25.9502"
                  y="0"
                  width="152"
                  height="175"
                ></image>
                ;
              </svg>
              <svg
                x="167"
                y="708"
                opacity={activeStep !== 1 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              >
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin.png"
                  x="25.9502"
                  y="33"
                  width="152"
                  height="175"
                ></image>
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin_flipped.png"
                  x="25.9502"
                  y="22"
                  width="152"
                  height="175"
                ></image>
                ;
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin.png"
                  x="25.9502"
                  y="11"
                  width="152"
                  height="175"
                ></image>
                ;
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin_flipped.png"
                  x="25.9502"
                  y="0"
                  width="152"
                  height="175"
                ></image>
                ;
              </svg>
              <svg
                x="360"
                y="708"
                opacity={activeStep !== 1 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              >
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin.png"
                  x="25.9502"
                  y="33"
                  width="152"
                  height="175"
                ></image>
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin_flipped.png"
                  x="25.9502"
                  y="22"
                  width="152"
                  height="175"
                ></image>
                ;
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin.png"
                  x="25.9502"
                  y="11"
                  width="152"
                  height="175"
                ></image>
                ;
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin_flipped.png"
                  x="25.9502"
                  y="0"
                  width="152"
                  height="175"
                ></image>
                ;
              </svg>
              <path
                d="M23.043 903.767H24.219L25.668 909.493H25.787L27.523 903.767H28.888L30.631 909.493H30.743L32.185 903.767H33.326V903.977L31.457 910.9H29.98L28.244 905.195H28.132L26.396 910.9H24.912L23.043 903.977V903.767ZM34.2771 905.636C34.2771 904.369 35.3551 903.606 37.1821 903.606C39.0161 903.606 40.1361 904.369 40.2481 905.727V905.937H39.1211C39.0721 904.95 38.3021 904.579 37.1891 904.579C36.0761 904.579 35.4531 904.943 35.4531 905.608C35.4531 906.273 35.9851 906.532 36.7411 906.623L37.9661 906.777C39.3871 906.952 40.3671 907.561 40.3671 908.863C40.3671 910.179 39.3451 911.061 37.3851 911.061C35.4251 911.061 34.2001 910.186 34.1161 908.891V908.681H35.2571C35.3271 909.647 36.1951 910.088 37.3851 910.088C38.5821 910.088 39.1771 909.64 39.1771 908.926C39.1771 908.226 38.6171 907.918 37.7001 907.799L36.4751 907.645C35.1521 907.477 34.2771 906.889 34.2771 905.636ZM41.0756 903.767H42.7626V901.807H43.9946V903.767H46.1296V904.768H43.9946V909.724L44.1066 909.836H46.1086V910.9H44.5966C43.4276 910.9 42.7626 910.319 42.7626 909.157V904.768H41.0756V903.767ZM47.7411 900.82H54.7551V901.905H49.0151V905.265H54.0551V906.35H49.0151V909.815H54.8531V910.9H47.7411V900.82ZM55.7551 900.82H64.3231V901.933H60.6831V910.9H59.3951V901.933H55.7551V900.82ZM65.829 900.82H67.11V905.272H72.514V900.82H73.802V910.9H72.514V906.406H67.11V910.9H65.829V900.82ZM82.6158 900.82H83.8058V901.03L79.8578 910.9H78.6678V910.69L82.6158 900.82ZM87.8373 900.82H89.0973L91.1273 909.493H91.2393L93.5703 900.82H95.0963L97.4203 909.493H97.5323L99.5623 900.82H100.787V901.03L98.3863 910.9H96.6503L94.3683 902.423H94.2563L91.9743 910.9H90.2383L87.8373 901.03V900.82ZM102.347 900.82H109.361V901.905H103.621V905.265H108.661V906.35H103.621V909.815H109.459V910.9H102.347V900.82ZM110.361 900.82H118.929V901.933H115.289V910.9H114.001V901.933H110.361V900.82ZM120.434 900.82H121.715V905.272H127.119V900.82H128.407V910.9H127.119V906.406H121.715V910.9H120.434V900.82Z"
                fill={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
              ></path>

              <path
                d="M226.552 905.636C226.552 904.369 227.63 903.606 229.457 903.606C231.291 903.606 232.411 904.369 232.523 905.727V905.937H231.396C231.347 904.95 230.577 904.579 229.464 904.579C228.351 904.579 227.728 904.943 227.728 905.608C227.728 906.273 228.26 906.532 229.016 906.623L230.241 906.777C231.662 906.952 232.642 907.561 232.642 908.863C232.642 910.179 231.62 911.061 229.66 911.061C227.7 911.061 226.475 910.186 226.391 908.891V908.681H227.532C227.602 909.647 228.47 910.088 229.66 910.088C230.857 910.088 231.452 909.64 231.452 908.926C231.452 908.226 230.892 907.918 229.975 907.799L228.75 907.645C227.427 907.477 226.552 906.889 226.552 905.636ZM237.97 900.82C240.938 900.82 242.912 902.724 242.912 905.86C242.912 908.996 240.938 910.9 237.97 910.9H234.274V900.82H237.97ZM235.555 909.794H237.935C240.133 909.794 241.61 908.401 241.61 905.86C241.61 903.319 240.133 901.926 237.935 901.926H235.555V909.794ZM247.173 900.82H248.825L252.507 910.69V910.9H251.226L250.162 908.002H245.801L244.744 910.9H243.498V910.69L247.173 900.82ZM246.172 906.896H249.791L248.041 902.108H247.929L246.172 906.896ZM254.03 900.82H255.318V910.9H254.03V900.82ZM264.131 900.82H265.321V901.03L261.373 910.9H260.183V910.69L264.131 900.82ZM269.352 900.82H270.612L272.642 909.493H272.754L275.085 900.82H276.611L278.935 909.493H279.047L281.077 900.82H282.302V901.03L279.901 910.9H278.165L275.883 902.423H275.771L273.489 910.9H271.753L269.352 901.03V900.82ZM283.862 900.82H290.876V901.905H285.136V905.265H290.176V906.35H285.136V909.815H290.974V910.9H283.862V900.82ZM291.876 900.82H300.444V901.933H296.804V910.9H295.516V901.933H291.876V900.82ZM301.95 900.82H303.231V905.272H308.635V900.82H309.923V910.9H308.635V906.406H303.231V910.9H301.95V900.82Z"
                fill={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
              ></path>
              <path
                d="M406.918 905.636C406.918 904.369 407.996 903.606 409.823 903.606C411.657 903.606 412.777 904.369 412.889 905.727V905.937H411.762C411.713 904.95 410.943 904.579 409.83 904.579C408.717 904.579 408.094 904.943 408.094 905.608C408.094 906.273 408.626 906.532 409.382 906.623L410.607 906.777C412.028 906.952 413.008 907.561 413.008 908.863C413.008 910.179 411.986 911.061 410.026 911.061C408.066 911.061 406.841 910.186 406.757 908.891V908.681H407.898C407.968 909.647 408.836 910.088 410.026 910.088C411.223 910.088 411.818 909.64 411.818 908.926C411.818 908.226 411.258 907.918 410.341 907.799L409.116 907.645C407.793 907.477 406.918 906.889 406.918 905.636ZM413.73 904.768V903.767H415.473V902.563C415.473 901.401 416.138 900.82 417.307 900.82H418.91V901.821H416.817L416.705 901.933V903.767H418.756V904.768H416.705V910.9H415.473V904.768H413.73ZM420.024 903.767H421.214V904.621H421.326C421.571 904.117 422.019 903.739 423.09 903.739H424.084V904.803H423.118C421.781 904.803 421.256 905.538 421.256 906.987V910.9H420.024V903.767ZM425.089 903.767H426.356L428.358 906.42H428.47L430.633 903.767H431.872V903.977L429.17 907.288L431.753 910.69V910.9H430.493L428.4 908.135H428.288L426.034 910.9H424.795V910.69L427.588 907.274L425.089 903.977V903.767ZM433.507 900.82H440.521V901.905H434.781V905.265H439.821V906.35H434.781V909.815H440.619V910.9H433.507V900.82ZM441.521 900.82H450.089V901.933H446.449V910.9H445.161V901.933H441.521V900.82ZM451.595 900.82H452.876V905.272H458.28V900.82H459.568V910.9H458.28V906.406H452.876V910.9H451.595V900.82ZM468.382 900.82H469.572V901.03L465.624 910.9H464.434V910.69L468.382 900.82ZM473.603 900.82H474.863L476.893 909.493H477.005L479.336 900.82H480.862L483.186 909.493H483.298L485.328 900.82H486.553V901.03L484.152 910.9H482.416L480.134 902.423H480.022L477.74 910.9H476.004L473.603 901.03V900.82ZM488.113 900.82H495.127V901.905H489.387V905.265H494.427V906.35H489.387V909.815H495.225V910.9H488.113V900.82ZM496.127 900.82H504.695V901.933H501.055V910.9H499.767V901.933H496.127V900.82ZM506.201 900.82H507.482V905.272H512.886V900.82H514.174V910.9H512.886V906.406H507.482V910.9H506.201V900.82Z"
                fill={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
              ></path>
            </svg>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-8 mb-6">
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer ${
              activeStep === 1
                ? "bg-blue-600 text-primary"
                : "bg-background text-secondary"
            }`}
            onClick={() => setActiveStep(1)}
          >
            01
          </button>
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer ${
              activeStep === 2
                ? "bg-blue-600 text-primary"
                : "bg-background text-secondary"
            }`}
            onClick={() => setActiveStep(2)}
          >
            02
          </button>
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer ${
              activeStep === 3
                ? "bg-blue-600 text-primary"
                : "bg-background text-secondary"
            }`}
            onClick={() => setActiveStep(3)}
          >
            03
          </button>
        </div>

        {/* Step content */}
        <div className="mb-0">
          {activeStep === 1 && (
            <div>
              <h3 className="text-[16px] text-card font-normal mb-2">
                {t("common.depositInFundMakerVault")}
              </h3>
              <p className="text-secondary text-[13px] leading-[16px]">
                {t("common.indexYieldByDepositingAssetIntoVault")}
              </p>
            </div>
          )}

          {activeStep === 2 && (
            <div>
              <h3 className="text-[16px] text-card font-normal mb-2">
                {t("common.assetsAreSuppliedOnFundMaker")}
              </h3>
              <p className="text-secondary text-[13px] leading-[16px]">
                {t("common.fundmakerVaultAllocation")}
              </p>
            </div>
          )}

          {activeStep === 3 && (
            <div>
              <h3 className="text-[16px] text-card font-normal mb-2">
                {t("common.indexYieldFromBorrowers")}
              </h3>
              <p className="text-secondary text-[13px] leading-[16px]">
                {t("common.vaultsGenerateYield")}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0 px-[20px] xl:px-[82px] border-none relative h-auto pb-0">
      <div className="">
        {!wallet && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-secondary hover:text-primary absolute right-4 top-4"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left side - Visualization */}
        <div
          className="w-full md:w-1/2 h-[770px] py-[180px] overflow-hidden"
          ref={scrollableRef}
        >
          <div className="w-full 2xl:h-[1300px] xl:h-[1000px] h-[800px] flex flex-col items-center">
            <svg
              viewBox="0 0 537 1465"
              fill="none"
              className="anim-svg"
              height={1300}
            >
              <g id="step-1">
                <path
                  d="M53.6741 59.9883H55.1461V70.2203H61.5461V71.5083H53.6741V59.9883ZM62.5421 67.4283C62.5421 64.6603 64.0781 63.1643 66.4941 63.1643C68.9181 63.1643 70.2541 64.6763 70.2541 67.0763V67.7803H63.9021C63.9341 69.4763 64.9101 70.5643 66.4941 70.5643C67.9981 70.5643 68.6941 69.7083 68.8221 68.9563H70.0861V69.1963C69.9021 70.1963 68.9581 71.7003 66.5101 71.7003C64.0941 71.7003 62.5421 70.2043 62.5421 67.4283ZM63.9261 66.6683H68.9101C68.8941 65.2763 68.0701 64.2923 66.4861 64.2923C64.9341 64.2923 64.0381 65.2923 63.9261 66.6683ZM72.0926 63.3563H73.4606V64.4043H73.5886C74.1726 63.5163 75.1566 63.1723 76.3166 63.1723C78.2126 63.1723 79.3966 64.1323 79.3966 66.1243V71.5083H77.9886V66.2603C77.9886 64.9323 77.2686 64.3483 75.9966 64.3483C74.6046 64.3483 73.5006 65.1723 73.5006 66.9563V71.5083H72.0926V63.3563ZM89.1435 59.9883V71.5083H87.7755V70.3883H87.6475C87.0315 71.3243 86.0475 71.6923 84.8875 71.6923C82.7675 71.6923 81.1515 70.2523 81.1515 67.4363C81.1515 64.6123 82.7675 63.1723 84.8875 63.1723C86.0235 63.1723 86.9995 63.5323 87.6075 64.4363H87.7355V59.9883H89.1435ZM82.5675 67.4363C82.5675 69.4123 83.6235 70.5243 85.1755 70.5243C86.7355 70.5243 87.7915 69.4123 87.7915 67.4363C87.7915 65.4523 86.7355 64.3403 85.1755 64.3403C83.6235 64.3403 82.5675 65.4523 82.5675 67.4363ZM90.9796 67.4283C90.9796 64.6603 92.5156 63.1643 94.9316 63.1643C97.3556 63.1643 98.6916 64.6763 98.6916 67.0763V67.7803H92.3396C92.3716 69.4763 93.3476 70.5643 94.9316 70.5643C96.4356 70.5643 97.1316 69.7083 97.2596 68.9563H98.5236V69.1963C98.3396 70.1963 97.3956 71.7003 94.9476 71.7003C92.5316 71.7003 90.9796 70.2043 90.9796 67.4283ZM92.3636 66.6683H97.3476C97.3316 65.2763 96.5076 64.2923 94.9236 64.2923C93.3716 64.2923 92.4756 65.2923 92.3636 66.6683ZM100.53 63.3563H101.89V64.3323H102.018C102.298 63.7563 102.81 63.3243 104.034 63.3243H105.17V64.5403H104.066C102.538 64.5403 101.938 65.3803 101.938 67.0363V71.5083H100.53V63.3563Z"
                  fill={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  opacity={activeStep === 1 ? "1" : "0.1"}
                  // style="transition: var(--transitions-appear);"
                ></path>
                <path
                  d="M276.972 66.5099L117.972 66.5066"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  opacity={activeStep === 1 ? "1" : "0.1"}
                  // style="transition: var(--transitions-appear);"
                ></path>
              </g>
              <g>
                <path
                  d="M52.9207 445.365H54.3607L56.6807 455.277H56.8087L59.4727 445.365H61.2167L63.8727 455.277H64.0007L66.3207 445.365H67.7207V445.605L64.9767 456.885H62.9927L60.3847 447.197H60.2567L57.6487 456.885H55.6647L52.9207 445.605V445.365ZM69.5027 445.365H77.5187V446.605H70.9587V450.445H76.7187V451.685H70.9587V455.645H77.6307V456.885H69.5027V445.365ZM78.6616 445.365H88.4536V446.637H84.2936V456.885H82.8216V446.637H78.6616V445.365ZM90.1746 445.365H91.6386V450.453H97.8146V445.365H99.2866V456.885H97.8146V451.749H91.6386V456.885H90.1746V445.365ZM105.075 445.365H106.555L110.179 455.389H110.307L113.939 445.365H115.371V445.605L111.171 456.885H109.283L105.075 445.605V445.365ZM115.685 450.997C115.853 449.485 117.149 448.541 119.261 448.541C121.357 448.541 122.589 449.485 122.589 451.517V456.885H121.277V455.765H121.149C120.805 456.397 119.957 457.061 118.285 457.061C116.525 457.061 115.293 456.173 115.293 454.653C115.293 453.037 116.517 452.325 118.165 452.117L121.229 451.733V451.437C121.229 450.165 120.549 449.661 119.229 449.661C117.901 449.661 117.117 450.165 117.005 451.237H115.685V450.997ZM116.693 454.589C116.693 455.437 117.405 455.925 118.517 455.925C120.005 455.925 121.229 455.125 121.229 453.325V452.821L118.445 453.189C117.365 453.333 116.693 453.733 116.693 454.589ZM132.012 456.885H130.644V455.845H130.516C129.94 456.725 128.964 457.069 127.804 457.069C125.908 457.069 124.74 456.109 124.74 454.117V448.733H126.148V453.981C126.148 455.309 126.852 455.893 128.124 455.893C129.516 455.893 130.604 455.069 130.604 453.285V448.733H132.012V456.885ZM134.327 445.365H135.735V456.885H134.327V445.365ZM137.182 448.733H139.11V446.493H140.518V448.733H142.958V449.877H140.518V455.541L140.646 455.669H142.934V456.885H141.206C139.87 456.885 139.11 456.221 139.11 454.893V449.877H137.182V448.733Z"
                  fill={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  opacity={activeStep !== 3 ? "1" : "0.1"}
                  // style="transition: var(--transitions-appear);"
                ></path>
                <path
                  d="M204.972 451.887L155.972 451.883"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  opacity={activeStep !== 3 ? "0.5" : "0.1"}
                  // style="transition: var(--transitions-appear);"
                ></path>
              </g>
              <g>
                <path
                  d="M58.4732 1378.91C60.5212 1378.91 62.0412 1379.87 62.0412 1381.81C62.0412 1383.65 60.8412 1384.26 60.1612 1384.41V1384.54C60.8972 1384.71 62.2572 1385.29 62.2572 1387.29C62.2572 1389.41 60.6332 1390.43 58.5292 1390.43H53.4012V1378.91H58.4732ZM54.8492 1389.19H58.3692C59.7852 1389.19 60.8172 1388.63 60.8172 1387.19C60.8172 1385.74 59.7852 1385.19 58.3692 1385.19H54.8492V1389.19ZM54.8492 1383.95H58.2892C59.6092 1383.95 60.6332 1383.45 60.6332 1382.05C60.6332 1380.65 59.6092 1380.15 58.2892 1380.15H54.8492V1383.95ZM63.6129 1386.35C63.6129 1383.6 65.2849 1382.08 67.7649 1382.08C70.2369 1382.08 71.9169 1383.6 71.9169 1386.35C71.9169 1389.1 70.2369 1390.62 67.7649 1390.62C65.2849 1390.62 63.6129 1389.1 63.6129 1386.35ZM65.0369 1386.35C65.0369 1388.37 66.1329 1389.47 67.7649 1389.47C69.3889 1389.47 70.4849 1388.37 70.4849 1386.35C70.4849 1384.33 69.3889 1383.24 67.7649 1383.24C66.1329 1383.24 65.0369 1384.33 65.0369 1386.35ZM73.7415 1382.27H75.1015V1383.25H75.2295C75.5095 1382.67 76.0215 1382.24 77.2455 1382.24H78.3815V1383.46H77.2775C75.7495 1383.46 75.1495 1384.3 75.1495 1385.95V1390.43H73.7415V1382.27ZM79.9447 1382.27H81.3047V1383.25H81.4327C81.7127 1382.67 82.2247 1382.24 83.4487 1382.24H84.5847V1383.46H83.4807C81.9527 1383.46 81.3527 1384.3 81.3527 1385.95V1390.43H79.9447V1382.27ZM85.3473 1386.35C85.3473 1383.6 87.0193 1382.08 89.4993 1382.08C91.9713 1382.08 93.6513 1383.6 93.6513 1386.35C93.6513 1389.1 91.9713 1390.62 89.4993 1390.62C87.0193 1390.62 85.3473 1389.1 85.3473 1386.35ZM86.7713 1386.35C86.7713 1388.37 87.8673 1389.47 89.4993 1389.47C91.1233 1389.47 92.2193 1388.37 92.2193 1386.35C92.2193 1384.33 91.1233 1383.24 89.4993 1383.24C87.8673 1383.24 86.7713 1384.33 86.7713 1386.35ZM94.5654 1382.27H95.9094L97.5654 1388.82H97.7014L99.6854 1382.27H101.245L103.237 1388.82H103.365L105.013 1382.27H106.317V1382.51L104.181 1390.43H102.493L100.509 1383.91H100.381L98.3974 1390.43H96.7014L94.5654 1382.51V1382.27ZM107.254 1386.35C107.254 1383.58 108.79 1382.08 111.206 1382.08C113.63 1382.08 114.966 1383.59 114.966 1385.99V1386.7H108.614C108.646 1388.39 109.622 1389.48 111.206 1389.48C112.71 1389.48 113.406 1388.63 113.534 1387.87H114.798V1388.11C114.614 1389.11 113.67 1390.62 111.222 1390.62C108.806 1390.62 107.254 1389.12 107.254 1386.35ZM108.638 1385.59H113.622C113.606 1384.19 112.782 1383.21 111.198 1383.21C109.646 1383.21 108.75 1384.21 108.638 1385.59ZM116.804 1382.27H118.164V1383.25H118.292C118.572 1382.67 119.084 1382.24 120.308 1382.24H121.444V1383.46H120.34C118.812 1383.46 118.212 1384.3 118.212 1385.95V1390.43H116.804V1382.27Z"
                  fill={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  opacity={activeStep === 3 ? "1" : "0.5"}
                  // style="transition: var(--transitions-appear);"
                ></path>
                <path
                  d="M276.972 1385.43L133.972 1385.42"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  opacity={activeStep === 3 ? "1" : "0.1"}
                  // style="transition: var(--transitions-appear);"
                ></path>
              </g>
              <path
                id="first-path"
                d="M268.468 109.474v295"
                stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 4"
                opacity={activeStep === 1 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></path>
              <g
                opacity={activeStep === 1 ? "1" : "0"}
                // style="transition: var(--transitions-appear);"
              >
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                ></path>
                <animateMotion
                  dur="4s"
                  begin="0s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#first-path"></mpath>
                </animateMotion>
              </g>
              <g
                opacity={activeStep === 1 ? "1" : "0"}
                // style="transition: var(--transitions-appear);"
              >
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                  opacity="0"
                >
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    begin="2s"
                    dur="0.01s"
                    fill="freeze"
                  ></animate>
                </path>
                <animateMotion
                  dur="4s"
                  begin="2s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#first-path"></mpath>
                </animateMotion>
              </g>
              <path
                id="second-path-long-vertical"
                d="M268.46 558.8L268.46 750.79"
                stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 4"
                opacity={activeStep === 2 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></path>
              <path
                id="second-path-left-part"
                d="M268.448 680.458L97.1001 680.458C86.0544 680.458 77.1001 689.413 77.1001 700.458L77.1001 825.73"
                stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 4"
                opacity={activeStep === 2 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></path>
              <path
                id="second-path-right-part"
                d="M268.448 680.458L439.535 680.458C450.563 680.458 459.51 689.386 459.535 700.414L459.809 824.174"
                stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 4"
                opacity={activeStep === 2 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              >
                <g opacity={activeStep === 2 ? "1" : "0"}>
                  <path
                    d="M6.2683 0l-6.2683 6l-6.2683 -6"
                    stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="rotate(-90)"
                  ></path>
                  <animateMotion
                    dur="2s"
                    begin="0s"
                    rotate="auto"
                    repeatCount="indefinite"
                  >
                    <mpath href="#second-path-long-vertical"></mpath>
                  </animateMotion>
                </g>
              </path>
              <g opacity={activeStep === 2 ? "1" : "0"}>
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                ></path>
                <animateMotion
                  dur="2s"
                  begin="0s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#second-path-long-vertical"></mpath>
                </animateMotion>
              </g>
              <g
                opacity={activeStep === 2 ? "1" : "0"}
                // style="transition: var(--transitions-appear);"
              >
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                  opacity="0"
                >
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    begin="1.26s"
                    dur="0.01s"
                    fill="freeze"
                  ></animate>
                </path>
                <animateMotion
                  dur="2s"
                  begin="1.26s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#second-path-right-part"></mpath>
                </animateMotion>
              </g>
              <g
                opacity={activeStep === 2 ? "1" : "0"}
                // style="transition: var(--transitions-appear);"
              >
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                  opacity="0"
                >
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    begin="1.26s"
                    dur="0.01s"
                    fill="freeze"
                  ></animate>
                </path>
                <animateMotion
                  dur="2s"
                  begin="1.26s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#second-path-left-part"></mpath>
                </animateMotion>
              </g>
              <path
                id="third-path-vertical-part"
                d="M268.468 1387.43L268.468 930"
                stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 4"
                opacity={activeStep === 3 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></path>
              <path
                id="third-path-left-part"
                d="M268.512 1009.24L97.1016 1009.24C86.0559 1009.24 77.1016 1000.28 77.1016 989.237L77.1016 930.228"
                stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 4"
                opacity={activeStep === 3 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></path>
              <path
                id="third-path-right-part"
                d="M268.472 1009.24L439.826 1009.24C450.872 1009.24 459.826 1000.28 459.826 989.237L459.826 923.857"
                stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 4"
                opacity={activeStep === 3 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></path>
              <g
                opacity={activeStep === 3 ? "1" : "0"}
                // style="transition: var(--transitions-appear);"
              >
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                ></path>
                <animateMotion
                  dur="3s"
                  begin="0s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#third-path-vertical-part"></mpath>
                </animateMotion>
              </g>
              <g
                opacity={activeStep === 3 ? "1" : "0"}
                // style="transition: var(--transitions-appear);"
              >
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                >
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    begin="2.4375s"
                    dur="0.01s"
                    fill="freeze"
                  ></animate>
                </path>
                <animateMotion
                  dur="3s"
                  begin="2.4375s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#third-path-left-part"></mpath>
                </animateMotion>
              </g>
              <g
                opacity={activeStep === 3 ? "1" : "0"}
                // style="transition: var(--transitions-appear);"
              >
                <path
                  d="M6.2683 0l-6.2683 6l-6.2683 -6"
                  stroke={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(-90)"
                >
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    begin="2.4375s"
                    dur="0.01s"
                    fill="freeze"
                  ></animate>
                </path>
                <animateMotion
                  dur="3s"
                  begin="2.4375s"
                  rotate="auto"
                  repeatCount="indefinite"
                >
                  <mpath href="#third-path-right-part"></mpath>
                </animateMotion>
              </g>
              <image
                href="https://cdn.morpho.org/v2/assets/images/graph_person.png"
                height="136"
                x="222"
                opacity={activeStep === 1 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></image>
              <rect width="10" height="95" x="263" y="190" fill="none"></rect>
              <image
                href="https://cdn.morpho.org/v2/assets/images/graph_weth.png"
                height="97"
                x="232"
                y="187"
                opacity={activeStep === 1 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></image>
              <image
                href="https://cdn.morpho.org/v2/assets/images/graph_eth_in_cube.png"
                height="219"
                x="174"
                y="342"
                opacity="1"
                //   style="transition: var(--transitions-appear);"
              ></image>
              <image
                id="step-3"
                href="https://cdn.morpho.org/v2/assets/images/graph_yield.png"
                height="98"
                x="232"
                y="1090"
                opacity={activeStep === 3 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></image>
              <image
                href="https://cdn.morpho.org/v2/assets/images/graph_person.png"
                height="136"
                x="222"
                y="1310"
                opacity={activeStep === 3 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              ></image>
              <svg
                x="-26"
                y="708"
                opacity={activeStep !== 1 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              >
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin.png"
                  x="25.9502"
                  y="33"
                  width="152"
                  height="175"
                ></image>
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin_flipped.png"
                  x="25.9502"
                  y="22"
                  width="152"
                  height="175"
                ></image>
                ;
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin.png"
                  x="25.9502"
                  y="11"
                  width="152"
                  height="175"
                ></image>
                ;
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin_flipped.png"
                  x="25.9502"
                  y="0"
                  width="152"
                  height="175"
                ></image>
                ;
              </svg>
              <svg
                x="167"
                y="708"
                opacity={activeStep !== 1 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              >
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin.png"
                  x="25.9502"
                  y="33"
                  width="152"
                  height="175"
                ></image>
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin_flipped.png"
                  x="25.9502"
                  y="22"
                  width="152"
                  height="175"
                ></image>
                ;
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin.png"
                  x="25.9502"
                  y="11"
                  width="152"
                  height="175"
                ></image>
                ;
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin_flipped.png"
                  x="25.9502"
                  y="0"
                  width="152"
                  height="175"
                ></image>
                ;
              </svg>
              <svg
                x="360"
                y="708"
                opacity={activeStep !== 1 ? "1" : "0.1"}
                //   style="transition: var(--transitions-appear);"
              >
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin.png"
                  x="25.9502"
                  y="33"
                  width="152"
                  height="175"
                ></image>
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin_flipped.png"
                  x="25.9502"
                  y="22"
                  width="152"
                  height="175"
                ></image>
                ;
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin.png"
                  x="25.9502"
                  y="11"
                  width="152"
                  height="175"
                ></image>
                ;
                <image
                  href="https://cdn.morpho.org/v2/assets/images/graph_coin_flipped.png"
                  x="25.9502"
                  y="0"
                  width="152"
                  height="175"
                ></image>
                ;
              </svg>
              <path
                d="M23.043 903.767H24.219L25.668 909.493H25.787L27.523 903.767H28.888L30.631 909.493H30.743L32.185 903.767H33.326V903.977L31.457 910.9H29.98L28.244 905.195H28.132L26.396 910.9H24.912L23.043 903.977V903.767ZM34.2771 905.636C34.2771 904.369 35.3551 903.606 37.1821 903.606C39.0161 903.606 40.1361 904.369 40.2481 905.727V905.937H39.1211C39.0721 904.95 38.3021 904.579 37.1891 904.579C36.0761 904.579 35.4531 904.943 35.4531 905.608C35.4531 906.273 35.9851 906.532 36.7411 906.623L37.9661 906.777C39.3871 906.952 40.3671 907.561 40.3671 908.863C40.3671 910.179 39.3451 911.061 37.3851 911.061C35.4251 911.061 34.2001 910.186 34.1161 908.891V908.681H35.2571C35.3271 909.647 36.1951 910.088 37.3851 910.088C38.5821 910.088 39.1771 909.64 39.1771 908.926C39.1771 908.226 38.6171 907.918 37.7001 907.799L36.4751 907.645C35.1521 907.477 34.2771 906.889 34.2771 905.636ZM41.0756 903.767H42.7626V901.807H43.9946V903.767H46.1296V904.768H43.9946V909.724L44.1066 909.836H46.1086V910.9H44.5966C43.4276 910.9 42.7626 910.319 42.7626 909.157V904.768H41.0756V903.767ZM47.7411 900.82H54.7551V901.905H49.0151V905.265H54.0551V906.35H49.0151V909.815H54.8531V910.9H47.7411V900.82ZM55.7551 900.82H64.3231V901.933H60.6831V910.9H59.3951V901.933H55.7551V900.82ZM65.829 900.82H67.11V905.272H72.514V900.82H73.802V910.9H72.514V906.406H67.11V910.9H65.829V900.82ZM82.6158 900.82H83.8058V901.03L79.8578 910.9H78.6678V910.69L82.6158 900.82ZM87.8373 900.82H89.0973L91.1273 909.493H91.2393L93.5703 900.82H95.0963L97.4203 909.493H97.5323L99.5623 900.82H100.787V901.03L98.3863 910.9H96.6503L94.3683 902.423H94.2563L91.9743 910.9H90.2383L87.8373 901.03V900.82ZM102.347 900.82H109.361V901.905H103.621V905.265H108.661V906.35H103.621V909.815H109.459V910.9H102.347V900.82ZM110.361 900.82H118.929V901.933H115.289V910.9H114.001V901.933H110.361V900.82ZM120.434 900.82H121.715V905.272H127.119V900.82H128.407V910.9H127.119V906.406H121.715V910.9H120.434V900.82Z"
                fill={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
              ></path>

              <path
                d="M226.552 905.636C226.552 904.369 227.63 903.606 229.457 903.606C231.291 903.606 232.411 904.369 232.523 905.727V905.937H231.396C231.347 904.95 230.577 904.579 229.464 904.579C228.351 904.579 227.728 904.943 227.728 905.608C227.728 906.273 228.26 906.532 229.016 906.623L230.241 906.777C231.662 906.952 232.642 907.561 232.642 908.863C232.642 910.179 231.62 911.061 229.66 911.061C227.7 911.061 226.475 910.186 226.391 908.891V908.681H227.532C227.602 909.647 228.47 910.088 229.66 910.088C230.857 910.088 231.452 909.64 231.452 908.926C231.452 908.226 230.892 907.918 229.975 907.799L228.75 907.645C227.427 907.477 226.552 906.889 226.552 905.636ZM237.97 900.82C240.938 900.82 242.912 902.724 242.912 905.86C242.912 908.996 240.938 910.9 237.97 910.9H234.274V900.82H237.97ZM235.555 909.794H237.935C240.133 909.794 241.61 908.401 241.61 905.86C241.61 903.319 240.133 901.926 237.935 901.926H235.555V909.794ZM247.173 900.82H248.825L252.507 910.69V910.9H251.226L250.162 908.002H245.801L244.744 910.9H243.498V910.69L247.173 900.82ZM246.172 906.896H249.791L248.041 902.108H247.929L246.172 906.896ZM254.03 900.82H255.318V910.9H254.03V900.82ZM264.131 900.82H265.321V901.03L261.373 910.9H260.183V910.69L264.131 900.82ZM269.352 900.82H270.612L272.642 909.493H272.754L275.085 900.82H276.611L278.935 909.493H279.047L281.077 900.82H282.302V901.03L279.901 910.9H278.165L275.883 902.423H275.771L273.489 910.9H271.753L269.352 901.03V900.82ZM283.862 900.82H290.876V901.905H285.136V905.265H290.176V906.35H285.136V909.815H290.974V910.9H283.862V900.82ZM291.876 900.82H300.444V901.933H296.804V910.9H295.516V901.933H291.876V900.82ZM301.95 900.82H303.231V905.272H308.635V900.82H309.923V910.9H308.635V906.406H303.231V910.9H301.95V900.82Z"
                fill={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
              ></path>
              <path
                d="M406.918 905.636C406.918 904.369 407.996 903.606 409.823 903.606C411.657 903.606 412.777 904.369 412.889 905.727V905.937H411.762C411.713 904.95 410.943 904.579 409.83 904.579C408.717 904.579 408.094 904.943 408.094 905.608C408.094 906.273 408.626 906.532 409.382 906.623L410.607 906.777C412.028 906.952 413.008 907.561 413.008 908.863C413.008 910.179 411.986 911.061 410.026 911.061C408.066 911.061 406.841 910.186 406.757 908.891V908.681H407.898C407.968 909.647 408.836 910.088 410.026 910.088C411.223 910.088 411.818 909.64 411.818 908.926C411.818 908.226 411.258 907.918 410.341 907.799L409.116 907.645C407.793 907.477 406.918 906.889 406.918 905.636ZM413.73 904.768V903.767H415.473V902.563C415.473 901.401 416.138 900.82 417.307 900.82H418.91V901.821H416.817L416.705 901.933V903.767H418.756V904.768H416.705V910.9H415.473V904.768H413.73ZM420.024 903.767H421.214V904.621H421.326C421.571 904.117 422.019 903.739 423.09 903.739H424.084V904.803H423.118C421.781 904.803 421.256 905.538 421.256 906.987V910.9H420.024V903.767ZM425.089 903.767H426.356L428.358 906.42H428.47L430.633 903.767H431.872V903.977L429.17 907.288L431.753 910.69V910.9H430.493L428.4 908.135H428.288L426.034 910.9H424.795V910.69L427.588 907.274L425.089 903.977V903.767ZM433.507 900.82H440.521V901.905H434.781V905.265H439.821V906.35H434.781V909.815H440.619V910.9H433.507V900.82ZM441.521 900.82H450.089V901.933H446.449V910.9H445.161V901.933H441.521V900.82ZM451.595 900.82H452.876V905.272H458.28V900.82H459.568V910.9H458.28V906.406H452.876V910.9H451.595V900.82ZM468.382 900.82H469.572V901.03L465.624 910.9H464.434V910.69L468.382 900.82ZM473.603 900.82H474.863L476.893 909.493H477.005L479.336 900.82H480.862L483.186 909.493H483.298L485.328 900.82H486.553V901.03L484.152 910.9H482.416L480.134 902.423H480.022L477.74 910.9H476.004L473.603 901.03V900.82ZM488.113 900.82H495.127V901.905H489.387V905.265H494.427V906.35H489.387V909.815H495.225V910.9H488.113V900.82ZM496.127 900.82H504.695V901.933H501.055V910.9H499.767V901.933H496.127V900.82ZM506.201 900.82H507.482V905.272H512.886V900.82H514.174V910.9H512.886V906.406H507.482V910.9H506.201V900.82Z"
                fill={theme == "dark" ? "#ffffffc2" : "#191d20f2"}
              ></path>
            </svg>
          </div>
        </div>

        {/* Right side - Steps */}
        <div className="w-full md:w-1/2 space-y-6 pt-[50px]">
          <h1 className="text-[20px] font-normal text-primary pl-10">
            {t("common.howEarnWorks")}
          </h1>

          {/* Step 1 */}
          <div
            className={`space-y-2 cursor-pointer transition-colors ${
              activeStep === 1 ? "opacity-100" : "opacity-30 hover:opacity-90"
            }`}
            onClick={() => setActiveStep(1)}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-primary font-medium text-sm transition-colors cursor-pointer `}
              >
                01
              </div>
              <h3 className="text-[16px] font-normal text-card">
                {t("common.depositInFundMakerVault")}
              </h3>
            </div>
            <p
              className={`text-card pl-12 text-[13px] leading-[16px] transition-colors ${
                activeStep === 1 ? "opacity-100" : "opacity-100"
              }`}
            >
              {t("common.indexYieldByDepositingAssetIntoVault")}
            </p>
          </div>

          {/* Step 2 */}
          <div
            className={`space-y-2 cursor-pointer transition-colors ${
              activeStep === 2 ? "opacity-100" : "opacity-30 hover:opacity-90"
            }`}
            onClick={() => setActiveStep(2)}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-card font-medium text-sm transition-colors cursor-pointer `}
              >
                02
              </div>
              <h3 className="text-[16px] font-normal text-card leading-[16px]">
                {t("common.assetsAreSuppliedOnFundMaker")}
              </h3>
            </div>
            <p
              className={`text-card text-[13px] pl-12 transition-colors ${
                activeStep === 2 ? "opacity-100" : "opacity-100"
              }`}
            >
              {t("common.fundmakerVaultAllocation")}
            </p>
          </div>

          {/* Step 3 */}
          <div
            className={`space-y-2 cursor-pointer transition-colors ${
              activeStep === 3 ? "opacity-100" : "opacity-30 hover:opacity-90"
            }`}
            onClick={() => setActiveStep(3)}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-card font-medium text-sm transition-colors cursor-pointer `}
              >
                03
              </div>
              <h3 className="text-[16px] font-normal text-card leading-[16px]">
                {t("common.indexYieldFromBorrowers")}
              </h3>
            </div>
            <p
              className={`text-card text-[13px] pl-12 transition-colors ${
                activeStep === 3 ? "opacity-100" : "opacity-100"
              }`}
            >
              {t("common.vaultsGenerateYield")}
            </p>
          </div>

          {/* Disclaimer */}
          <div className="pt-4 border-t border-accent">
            <p
              className="text-secondary text-[13px]"
              dangerouslySetInnerHTML={{
                __html: t("common.fundmakerSecurityWithLinks"),
              }}
            ></p>

            <div className="flex items-center gap-2 mt-4">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) =>
                  setTermsAccepted(checked === true)
                }
                className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-[12px] text-secondary"
                dangerouslySetInnerHTML={{
                  __html: t("common.checkBoxConfirmationWithLink"),
                }}
              ></label>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-[11px] h-[26px] rounded-[4px] cursor-pointer text-white"
                disabled={!termsAccepted}
                onClick={onClose}
              >
                {t("common.proceed")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
