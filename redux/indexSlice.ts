import { IndexListEntry } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface IndexState {
  indices: IndexListEntry[];
}

const initialState: IndexState = {
  indices: [],
};

const indexSlice = createSlice({
  name: 'index',
  initialState,
  reducers: {
    setIndices(state, action: PayloadAction<IndexListEntry[]>) {
      state.indices = action.payload;
    },
  },
});

export const { setIndices } = indexSlice.actions;
export default indexSlice.reducer;
