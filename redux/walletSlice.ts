import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConnectedChain } from "@web3-onboard/core/dist/types";

// Define a type for the wallet state
interface Wallet {
  label: string;
  accounts: { address: string }[];
  chains?: ConnectedChain[];
  provider?: any;
  icon?: string;
}

interface WalletState {
  wallet: Wallet | null;
}

const initialState: WalletState = {
  wallet: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWallet: (state, action: PayloadAction<Wallet>) => {
      state.wallet = action.payload;
    },
    clearWallet: (state) => {
      state.wallet = null;
    },
  },
});

export const { setWallet, clearWallet } = walletSlice.actions;
export default walletSlice.reducer;
