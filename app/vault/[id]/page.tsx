"use client";
import { notFound, useParams } from "next/navigation";
import { VaultDetailPage } from "@/components/views/vault/vault-detail";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";
import { setIndices } from "@/redux/indexSlice";
import { IndexListEntry } from "@/types";
import { useEffect, useState } from "react";
import { fetchAllIndices } from "@/api/indices";

export default function VaultPage() {
  const params = useParams();
  const indexTicker = params.id?.toString();
  const [vault, setVault] = useState<IndexListEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const storedIndexes = useSelector((state: RootState) => state.index.indices);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!indexTicker) {
      notFound();
    }

    // First check Redux store
    const index = storedIndexes.find(
      (index) => index.ticker.toLowerCase() === indexTicker.toLowerCase()
    );

    if (index) {
      setVault(index);
      setLoading(false);
      return;
    }

    // If not found in Redux, fetch from API
    const fetchData = async () => {
      try {
        const response = await fetchAllIndices();
        const data: IndexListEntry[] = response || [];
        dispatch(setIndices(data));

        const foundIndex = data.find(
          (_index) => _index.ticker.toLowerCase() === indexTicker.toLowerCase()
        );

        if (foundIndex) {
          setVault(foundIndex);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching performance data:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [indexTicker, storedIndexes]);

  if (loading) {
    return <VaultDetailPage index={null} />;
  }
  if (!vault) {
    notFound();
  }

  return <VaultDetailPage index={vault} />;
}
