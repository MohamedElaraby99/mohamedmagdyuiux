import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from '../../Helpers/axiosInstance';

const initialState = {
    isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
    role: localStorage.getItem("role") || "",
    data: (() => {
        try {
            const data = localStorage.getItem("data");
            const parsedData = data ? JSON.parse(data) : {};

            return parsedData;
        } catch (error) {

            return {};
        }
    })(),
    tokenInfo: (() => {
        try {
            const tokenInfo = localStorage.getItem("tokenInfo");
            const parsedTokenInfo = tokenInfo ? JSON.parse(tokenInfo) : null;

            return parsedTokenInfo;
        } catch (error) {

            return null;
        }
    })()
}

// .....signup.........
export const createAccount = createAsyncThunk("/auth/signup", async (data) => {
    const loadingMessage = toast.loading("Please wait! creating your account...");
    try {
        const res = await axiosInstance.post("/users/register", data);
        toast.success(res?.data?.message, { id: loadingMessage });
        return res?.data
    } catch (error) {
        toast.error(error?.response?.data?.message, { id: loadingMessage });
        throw error;
    }
})

// .....Login.........
export const login = createAsyncThunk("/auth/login", async (data) => {
    const loadingMessage = toast.loading("Please wait! logging into your account...");
    try {
        const res = await axiosInstance.post("/users/login", data);
        toast.success(res?.data?.message, { id: loadingMessage });
        return res?.data
    } catch (error) {
        toast.error(error?.response?.data?.message, { id: loadingMessage });
        throw error;
    }
})

// .....Logout.........
export const logout = createAsyncThunk("/auth/logout", async () => {
    const loadingMessage = toast.loading("logout...");
    try {
        const res = await axiosInstance.get("/users/logout");
        toast.success(res?.data?.message, { id: loadingMessage });
        return res?.data
    } catch (error) {
        toast.error(error?.response?.data?.message, { id: loadingMessage });
        throw error;
    }
})

// .....get user data.........
export const getUserData = createAsyncThunk("/auth/user/me", async () => {
    try {
        const res = await axiosInstance.get("/users/me");

        return res?.data
    } catch (error) {

        throw error;
    }
})

// .....update user data.........
export const updateUserData = createAsyncThunk("/auth/user/me", async (data) => {
    const loadingMessage = toast.loading("Updating changes...");
    try {
        const res = await axiosInstance.post(`/users/update/${data.id}`, data.formData);
        toast.success(res?.data?.message, { id: loadingMessage });
        return res?.data
    } catch (error) {
        toast.error(error?.response?.data?.message, { id: loadingMessage });
        throw error;
    }
})

// .....change user password.......
export const changePassword = createAsyncThunk(
    "/auth/user/changePassword",
    async (userPassword) => {
        const loadingMessage = toast.loading("Changing password...");
        try {
            const res = await axiosInstance.post("/users/change-password", userPassword);
            toast.success(res?.data?.message, { id: loadingMessage });
            return res?.data
        } catch (error) {
            toast.error(error?.response?.data?.message, { id: loadingMessage });
            throw error;
        }
    }
);

// .....forget user password.....
export const forgetPassword = createAsyncThunk(
    "auth/user/forgetPassword",
    async (email) => {
        const loadingMessage = toast.loading("Please Wait! sending email...");
        try {
            const res = await axiosInstance.post("/users/reset", {email});
            toast.success(res?.data?.message, { id: loadingMessage });
            return res?.data
        } catch (error) {
            toast.error(error?.response?.data?.message, { id: loadingMessage });
            throw error;
        }
    }
);

// .......reset the user password......
export const resetPassword = createAsyncThunk("/user/reset", async (data) => {
    const loadingMessage = toast.loading("Please Wait! reseting your password...");
    try {
        const res = await axiosInstance.post(`/users/reset/${data.resetToken}`,
            { password: data.password }
        );
        toast.success(res?.data?.message, { id: loadingMessage });
        return res?.data
    } catch (error) {
        toast.error(error?.response?.data?.message, { id: loadingMessage });
        throw error;
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Manual sync from localStorage
        syncFromLocalStorage: (state) => {
            try {
                const storedData = localStorage.getItem("data");
                const storedRole = localStorage.getItem("role");
                const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
                
                if (storedData && storedRole && storedIsLoggedIn === "true") {
                    const parsedData = JSON.parse(storedData);
                    state.data = parsedData;
                    state.role = storedRole;
                    state.isLoggedIn = true;

                }
            } catch (error) {

            }
        },
        // Clear all user data (called from other slices)
        clearAllUserData: (state) => {
            // Clear cookies
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

            // Clear localStorage
            localStorage.removeItem("data");
            localStorage.removeItem("role");
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("tokenInfo");
            localStorage.removeItem("walletBalance");
            localStorage.removeItem("purchaseHistory");
            localStorage.removeItem("purchasedContent");
            localStorage.removeItem("courseProgress");
            localStorage.removeItem("examResults");
            localStorage.removeItem("userPreferences");

            // Clear sessionStorage
            sessionStorage.clear();

            // Clear auth state
            state.data = {};
            state.role = "";
            state.isLoggedIn = false;
            state.tokenInfo = null;

        },
        // Update tokens after refresh
        updateTokens: (state, action) => {

            state.tokenInfo = action.payload;
            localStorage.setItem("tokenInfo", JSON.stringify(action.payload));

        }
    },
    extraReducers: (builder) => {
        // for signup
        builder.addCase(createAccount.fulfilled, (state, action) => {
            localStorage.setItem("data", JSON.stringify(action?.payload?.user));
            localStorage.setItem("role", action?.payload?.user?.role);
            localStorage.setItem("isLoggedIn", true);
            state.data = action?.payload?.user;
            state.role = action?.payload?.user?.role;
            state.isLoggedIn = true;
        })

        // for login
        builder.addCase(login.fulfilled, (state, action) => {
            localStorage.setItem("data", JSON.stringify(action?.payload?.user));
            localStorage.setItem("role", action?.payload?.user?.role);
            localStorage.setItem("isLoggedIn", true);

            // Store token expiration info if provided
            if (action?.payload?.tokens) {
                localStorage.setItem("tokenInfo", JSON.stringify(action.payload.tokens));
                state.tokenInfo = action.payload.tokens;
            }

            state.data = action?.payload?.user;
            state.role = action?.payload?.user?.role;
            state.isLoggedIn = true;
        })

        // for logout
        builder.addCase(logout.fulfilled, (state, action) => {
            // Clear cookies
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

            // Clear localStorage
            localStorage.removeItem("data");
            localStorage.removeItem("role");
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("tokenInfo");

            // Clear auth state
            state.data = {};
            state.role = "";
            state.isLoggedIn = false;
            state.tokenInfo = null;

            // Clear all other user-related data from localStorage
            localStorage.removeItem("walletBalance");
            localStorage.removeItem("purchaseHistory");
            localStorage.removeItem("purchasedContent");
            localStorage.removeItem("courseProgress");
            localStorage.removeItem("examResults");
            localStorage.removeItem("userPreferences");

            // Clear sessionStorage as well
            sessionStorage.clear();

        })

        // for get user data
        builder.addCase(getUserData.fulfilled, (state, action) => {

            localStorage.setItem("data", JSON.stringify(action?.payload?.user));
            localStorage.setItem("role", action?.payload?.user?.role);
            localStorage.setItem("isLoggedIn", true);
            state.data = action?.payload?.user;
            state.role = action?.payload?.user?.role;
            state.isLoggedIn = true;

        })
    }
})

export const { syncFromLocalStorage, clearAllUserData, updateTokens } = authSlice.actions;
export default authSlice.reducer;