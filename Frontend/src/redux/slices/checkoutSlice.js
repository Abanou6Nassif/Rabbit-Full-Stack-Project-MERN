import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axiosConfig.js";

// Async thunk to creat checkout session
export const createCheckout = createAsyncThunk(
  "checkout/createCheckout",
  async (checkoutData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/checkout`,
        checkoutData,
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message,
      );
    }
  },
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    checkout: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload;
      })
      .addCase(createCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error during checkout";
      });
  },
});

export default checkoutSlice.reducer;
