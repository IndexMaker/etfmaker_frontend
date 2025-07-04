// src/api/indices.ts
import { IndexData } from "@/components/views/vault/vault-detail";
import { IndexListEntry } from "@/types";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

export const fetchAllIndices = async (): Promise<IndexListEntry[]> => {
  const response = await fetch(`${API_BASE_URL}/indices/getIndexLists`);

  if (!response.ok) {
    console.log("Failed to fetch indices");
    return []
  }

  return response.json();
};

export const deposit = async (address: string, amount: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/indices/deposit/${address}/${amount}`);

  if (!response.ok) {
    console.log("Failed to fetch indices");
    return []
  }

  return response.json();
};

export const fetchRebalancesById = async (indexId: number): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/indices/getCalculatedRebalances/${indexId}`);

  if (!response.ok) {
    console.log("Failed to fetch rebalances");
    return []
  }

  return response.json();
};

export const fetchCurrentRebalanceById = async (indexId: number): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/indices/fetchCurrentRebalanceById/${indexId}`);

  if (!response.ok) {
    console.log("Failed to fetch rebalances");
    return []
  }

  return response.json();
};

export const fetchIndexByTicker = async (
  ticker: string
): Promise<IndexListEntry> => {
  const response = await fetch(`${API_BASE_URL}/indices/by-ticker/${ticker}`);

  if (response.status === 404) {
    console.log("Index not found");
  }

  if (!response.ok) {
    console.log("Failed to fetch index");
  }

  return response.json();
};

export const fetchBtcHistoricalData = async (): Promise<any[]> => {
  const response = await fetch(
    `${API_BASE_URL}/indices/fetchBtcHistoricalData`
  );

  if (!response.ok) {
    console.log("Failed to fetch BTC historical data");
  }

  return response.json();
};

export const fetchEthHistoricalData = async (): Promise<any[]> => {
  const response = await fetch(
    `${API_BASE_URL}/indices/fetchEthHistoricalData`
  );

  if (!response.ok) {
    console.log("Failed to fetch ETH historical data");
    return [];
  }

  return response.json();
};

export const fetchVaultAssets = async (indexId: number): Promise<any[]> => {
  const response = await fetch(
    `${API_BASE_URL}/indices/fetchVaultAssets/${indexId}`
  );

  if (!response.ok) {
    console.log("Failed to fetch Index assets data");
    return [];
  }

  return response.json();
};

export const fetchHistoricalData = async (
  indexId: string | number
): Promise<IndexData> => {
  const response = await fetch(
    `${API_BASE_URL}/indices/getHistoricalData/${indexId}`
  );

  if (!response.ok) {
    console.log("Failed to fetch historical data");
  }

  return response.json();
};

export const downloadRebalanceData = async (
  indexId: string | number,
  indexName?: string
): Promise<void> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/indices/downloadRebalanceData/${indexId}`,
      {
        responseType: "blob", // Important for file downloads
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `rebalance_data_${indexName ? indexName : indexId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.log(
      axios.isAxiosError(error)
        ? error.message
        : "Failed to download rebalance data"
    );
  }
};

export const downloadDailyPriceData = async (
  indexId: string | number,
  indexName?: string
): Promise<void> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/indices/downloadDailyPriceData/${indexId}`,
      {
        responseType: "blob", // Important for file downloads
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily_price_data_${indexName ? indexName : indexId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.log(
      axios.isAxiosError(error)
        ? error.message
        : "Failed to download rebalance data"
    );
  }
};
