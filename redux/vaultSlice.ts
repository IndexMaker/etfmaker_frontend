import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Vault {
  vaultId: string;
  token: string;
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
      action: PayloadAction<{ vaultId: string; token: string }>
    ) {
      // Remove any vault with same vaultId AND amount === 0 or null
      state.selectedVault = state.selectedVault.filter(
        (v) =>
          (v.amount && v.amount > 0)
      );

      // Add the new one
      state.selectedVault.push({
        vaultId: action.payload.vaultId,
        token: action.payload.token,
        amount: 0,
      });
    },
    removeSelectedVault(state, action: PayloadAction<string>) {
      state.selectedVault = state.selectedVault.filter(
        (vault) => vault.vaultId !== action.payload
      );
    },
    updateVaultAmount(
      state,
      action: PayloadAction<{ vaultId: string; amount: number }>
    ) {
      const vault = state.selectedVault.find(
        (v) => v.vaultId === action.payload.vaultId
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
