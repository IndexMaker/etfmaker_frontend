import { configureStore } from "@reduxjs/toolkit";
import walletReducer from "./walletSlice";
import networkReducer from './networkSlice';
import vaultReducer from "./vaultSlice";
export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    network: networkReducer,
    vault: vaultReducer,
  },
});

// Export RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;