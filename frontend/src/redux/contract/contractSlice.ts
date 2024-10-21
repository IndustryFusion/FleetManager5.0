import { getContracts } from "@/utility/contracts";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";


const initialState = {
    contracts: [],
    status: "idle",
    error: null,
  };

export const fetchContractsRedux = createAsyncThunk(
  "contracts/fetchContracts",
  async (company_ifric_id: string) => {
    const contractsData = await getContracts(company_ifric_id);
    if(contractsData) {
      return contractsData || [];
    } else {
      return [];
    }
  }
);

const contractsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContractsRedux.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchContractsRedux.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.contracts = action.payload;
        }
      )
      .addCase(fetchContractsRedux.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default contractsSlice.reducer;
