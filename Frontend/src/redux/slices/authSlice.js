import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axiosConfig.js";
import { v6 as uuidV6 } from "uuid";
import { getErrorMessage } from "./shared.js";

const getAuthErrorMessage = (error) =>
  error.response?.data?.message ||
  getErrorMessage(error) ||
  "Authentication failed";

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
  // ADDED: tracks whether checkAuth has resolved at least once. Lets
  // ProtectedRoute (and anything else gating on auth) wait for the real
  // answer instead of redirecting based on stale/absent localStorage data.
  authChecked: false,
};

// ADDED: checkAuth thunk. localStorage("userInfo") only reflects what happened
// on the LAST successful login/verify - it never actually asks the server
// "is my cookie still valid?". Dispatch this once when the app boots (e.g. in
// your top-level App component's useEffect) so the store's `user` reflects
// reality instead of stale localStorage data. Since the httpOnly access and
// refresh cookies are persistent (see cookieOptions.js), this should keep
// succeeding across browser restarts until the access token expires and the
// refresh flow is no longer valid.
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/users/profile`);

      localStorage.setItem("userInfo", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      // No valid cookie / expired token: clear the stale local copy so the
      // UI doesn't keep showing a user that the backend no longer recognizes.
      localStorage.removeItem("userInfo");
      localStorage.setItem("guestId", `guest_${uuidV6()}`); //set new guest ID in localStorage

      return rejectWithValue(getAuthErrorMessage(error));
    }
  },
);

//Async Thunk for User Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/users/login`, userData);

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      return response.data.user; //Return the user object from the response
    } catch (error) {
      return rejectWithValue(getAuthErrorMessage(error));
    }
  },
);

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/users/forgot-password`, userData);

      return response.data;
    } catch (error) {
      return rejectWithValue(getAuthErrorMessage(error));
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/users/reset-password/${token}`, {
        password,
        confirmPassword,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(getAuthErrorMessage(error));
    }
  },
);

//Async Thunk for User Registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/users/register`, userData);

      return response.data;
    } catch (error) {
      return rejectWithValue(getAuthErrorMessage(error));
    }
  },
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/users/verify-email/${token}`);

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(getAuthErrorMessage(error));
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
      return rejectWithValue(getAuthErrorMessage(error));
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
      // ADDED: reducers for the new checkAuth thunk above.
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        state.authChecked = true; // ADDED
      })
      .addCase(checkAuth.rejected, (state) => {
        // Cookie missing/expired - make sure the store doesn't keep
        // pretending the user is logged in.
        state.loading = false;
        state.user = null;
        state.authChecked = true; // ADDED
      })
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
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
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
