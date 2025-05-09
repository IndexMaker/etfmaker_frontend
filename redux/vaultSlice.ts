import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Vault {
  name: string;
  ticker: string;
  amount: number;
}

interface VaultState {
  selectedVault: Vault[];
}

const initialState: VaultState = {
  selectedVault: [],
};

const vaultSlice = createSlice({
  name: "vault",
  initialState,
  reducers: {
    addSelectedVault(
      state,
      action: PayloadAction<{ name: string, ticker: string }>
    ) {
      // Remove any vault with same vaultId AND amount === 0 or null
      state.selectedVault = state.selectedVault.filter(
        (v) =>
          (v.amount && v.amount > 0)
      );

      // Add the new one
      state.selectedVault.push({
        name: action.payload.name,
        ticker: action.payload.ticker,
        amount: 0,
      });
    },
    removeSelectedVault(state, action: PayloadAction<string>) {
      state.selectedVault = state.selectedVault.filter(
        (vault) => vault.name !== action.payload
      );
    },
    updateVaultAmount(
      state,
      action: PayloadAction<{ name: string; amount: number }>
    ) {
      const vault = state.selectedVault.find(
        (v) => v.name === action.payload.name
      );
      if (vault) {
        vault.amount = action.payload.amount;
      }
    },
    clearSelectedVault(state) {
      state.selectedVault = [];
    },
  },
});

export const {
  addSelectedVault,
  removeSelectedVault,
  updateVaultAmount,
  clearSelectedVault,
} = vaultSlice.actions;
export default vaultSlice.reducer;
