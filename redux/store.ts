import { configureStore } from "@reduxjs/toolkit";
import walletReducer from "./walletSlice";

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
  },
});

// Export RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;