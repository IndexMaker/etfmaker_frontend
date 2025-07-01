import { ethers } from 'ethers';
export function formatTimestamp(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000) - timestamp;
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

// Example LETV calculation (adjust as needed)
export function calculateLETV(amount: number): number {
  return parseFloat((amount / 100000).toFixed(1));
}

export function buildCallData(functionName: string, paramValues: any[]): `0x${string}` {
  const paramTypesMatch = functionName.match(/\(([^)]*)\)/);
  if (!paramTypesMatch) {
    throw new Error(`Invalid function signature: ${functionName}`);
  }

  const paramTypesString = paramTypesMatch[1];
  const paramTypes = paramTypesString
    .split(",")
    .map((type) => type.trim())
    .filter((type) => type.length > 0);

  if (paramTypes.length !== paramValues.length) {
    throw new Error(`Parameter count mismatch: expected ${paramTypes.length}, got ${paramValues.length}`);
  }

  const functionSelector = ethers.id(functionName).slice(0, 10);

  let encodedParams = "0x";
  if (paramTypes.length > 0) {
    encodedParams = ethers.AbiCoder.defaultAbiCoder().encode(paramTypes, paramValues);
  }

  const callData = (functionSelector + encodedParams.slice(2)) as `0x${string}`;

  return callData;
}