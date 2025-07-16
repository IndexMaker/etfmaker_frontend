import { AarcCore } from "@aarc-xyz/core";

export const initAarc = () => {
  if (!process.env.NEXT_PUBLIC_AARC_API_KEY) {
    throw new Error("AARC API key is missing");
  }
  
  const aarcClient = new AarcCore(process.env.NEXT_PUBLIC_AARC_API_KEY!, true);
  return aarcClient;
};
