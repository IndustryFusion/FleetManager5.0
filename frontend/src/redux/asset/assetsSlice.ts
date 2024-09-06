import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Asset } from "@/interfaces/assetTypes";
import { fetchAssets } from "@/utility/asset";

interface AssetsState {
  assets: Asset[];
  status: string;
  error: string | null;
}

const initialState: AssetsState = {
  assets: [],
  status: "idle",
  error: null,
};

export const fetchAssetsRedux = createAsyncThunk(
  "assets/fetchAssets",
  async () => {
    const assetData = await fetchAssets();
    if(assetData) {
      return assetData || [];
    } else {
      return [];
    }
  }
);

const assetsSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssetsRedux.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchAssetsRedux.fulfilled,
        (state, action: PayloadAction<Asset[]>) => {
          state.status = "succeeded";
          state.assets = action.payload;
        }
      )
      .addCase(fetchAssetsRedux.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default assetsSlice.reducer;
