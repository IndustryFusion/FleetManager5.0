import { getBindings } from "@/utility/bindings";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";


const initialState = {
    bindings: [],
    status: "idle",
    error: null,
  };

export const fetchBindingsRedux = createAsyncThunk(
  "bindings/fetchBindings",
  async (company_ifric_id: string) => {
    const bindingsData = await getBindings(company_ifric_id);
    if(bindingsData) {
      return bindingsData || [];
    } else {
      return [];
    }
  }
);

const bindingsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBindingsRedux.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchBindingsRedux.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.bindings = action.payload;
        }
      )
      .addCase(fetchBindingsRedux.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default bindingsSlice.reducer;
