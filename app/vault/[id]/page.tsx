"use client";
import { notFound, useParams } from "next/navigation";
import { VaultDetailPage } from "@/components/views/vault/vault-detail";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";
import { setIndices } from "@/redux/indexSlice";
import { IndexListEntry } from "@/types";
import { useEffect, useState } from "react";

export default function VaultPage() {
  const params = useParams();
  const indexName = params.id?.toString();
  const [vault, setVault] = useState<IndexListEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const storedIndexes = useSelector((state: RootState) => state.index.indices);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!indexName) {
      notFound();
    }

    // First check Redux store
    const index = storedIndexes.find(
      (index) => index.name.toLowerCase() === indexName.toLowerCase()
    );

    if (index) {
      setVault(index);
      setLoading(false);
      return;
    }

    // If not found in Redux, fetch from API
    const fetchData = async () => {
      try {
        const API_BASE_URL = process.env.BACKEND_API || "http://localhost:5001";
        const response = await axios(`${API_BASE_URL}/indices/getIndexLists`);
        const data: IndexListEntry[] = response.data;
        dispatch(setIndices(data));

        const foundIndex = data.find(
          (_index) => _index.name.toLowerCase() === indexName.toLowerCase()
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
  }, [indexName, storedIndexes, dispatch]);

  if (loading) {
    return <VaultDetailPage index={null} />;
  }

  if (!vault) {
    notFound();
  }

  return <VaultDetailPage index={vault} />;
}
