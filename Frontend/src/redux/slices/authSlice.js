import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axiosConfig.js";
import { v6 as uuidV6 } from "uuid";

//Retrieve user info and from localStorage if available
const userFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

//Check for an existing guest ID in the localStorage or generate a new One
const initialGuestId = localStorage.getItem("userInfo")
  ? null
  : localStorage.getItem("guestId") || `guest_${uuidV6()}`;
localStorage.setItem("guestId", initialGuestId);

//Initial state
const initialState = {
  user: userFromStorage,
  guestId: initialGuestId,
  loading: false,
  error: null,
};

//Async Thunk for User Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/users/login`, userData);

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      return response.data.user; //Return the user object from the response
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message,
      );
    }
  },
);

//Async Thunk for User Registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/users/register`, userData);

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      return response.data.user; //Return the user object from the response
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message,
      );
    }
  },
);

//Async Thunk for User Logout
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/users/logout`);

      localStorage.removeItem("userInfo");
      localStorage.setItem("guestId", `guest_${uuidV6()}`); //set new guest ID in localStorage

      return response.data.message; //Return the message from the response
    } catch (error) {
      return rejectWithValue(
        error.response?.data  || error.message,
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.guestId = `guest_${uuidV6()}`; //Reset guest ID on logout
      localStorage.removeItem("userInfo");
      localStorage.setItem("guestId", state.guestId); //set new guest ID in localStorage
    },

    generateNewGuestId: (state) => {
      state.guestId = `guest_${uuidV6()}`;
      localStorage.setItem("guestId", state.guestId);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        // state.guestId = null;
        // localStorage.removeItem("guestId");
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        // state.guestId = null;
        // localStorage.removeItem("guestId");
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
        state.guestId = localStorage.getItem("guestId") || `guest_${uuidV6()}`;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Logout failed";
      });
  },
});

export const { logout, generateNewGuestId } = authSlice.actions;
export default authSlice.reducer;
