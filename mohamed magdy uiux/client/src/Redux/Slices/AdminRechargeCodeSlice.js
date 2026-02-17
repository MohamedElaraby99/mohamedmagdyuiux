import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../Helpers/axiosInstance";

// Async thunks
export const generateRechargeCodes = createAsyncThunk(
    "adminRechargeCode/generate",
    async ({ amount, quantity }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/admin/recharge-codes/generate", { 
                amount, 
                quantity 
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to generate codes");
        }
    }
);

export const getAllRechargeCodes = createAsyncThunk(
    "adminRechargeCode/getAll",
    async ({ page = 1, limit = 20, status, amount }, { rejectWithValue }) => {
        try {

            const params = new URLSearchParams({
                page,
                limit,
                ...(status && { status }),
                ...(amount && { amount })
            });

            const response = await axiosInstance.get(`/admin/recharge-codes/codes?${params}`);

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get codes");
        }
    }
);

export const getRechargeCodeStats = createAsyncThunk(
    "adminRechargeCode/getStats",
    async (_, { rejectWithValue }) => {
        try {

            const response = await axiosInstance.get("/admin/recharge-codes/stats");

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get stats");
        }
    }
);

export const deleteRechargeCode = createAsyncThunk(
    "adminRechargeCode/delete",
    async (codeId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/admin/recharge-codes/codes/${codeId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete code");
        }
    }
);

const initialState = {
    codes: [],
    stats: {
        totalCodes: 0,
        totalAmount: 0,
        usedCodes: 0,
        unusedCodes: 0,
        totalUsedAmount: 0,
        totalUnusedAmount: 0
    },
    pagination: {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 20
    },
    loading: false,
    error: null,
    generateLoading: false,
    generateError: null,
    deleteLoading: false,
    deleteError: null
};

const adminRechargeCodeSlice = createSlice({
    name: "adminRechargeCode",
    initialState,
    reducers: {
        clearAdminRechargeCodeError: (state) => {
            state.error = null;
            state.generateError = null;
            state.deleteError = null;
        },
        clearAdminRechargeCodeState: (state) => {
            state.codes = [];
            state.stats = {
                totalCodes: 0,
                totalAmount: 0,
                usedCodes: 0,
                unusedCodes: 0,
                totalUsedAmount: 0,
                totalUnusedAmount: 0
            };
            state.pagination = {
                currentPage: 1,
                totalPages: 1,
                total: 0,
                limit: 20
            };
            state.loading = false;
            state.error = null;
            state.generateLoading = false;
            state.generateError = null;
            state.deleteLoading = false;
            state.deleteError = null;
        }
    },
    extraReducers: (builder) => {
        // Generate recharge codes
        builder
            .addCase(generateRechargeCodes.pending, (state) => {
                state.generateLoading = true;
                state.generateError = null;
            })
            .addCase(generateRechargeCodes.fulfilled, (state, action) => {
                state.generateLoading = false;
                // Add new codes to the beginning of the list
                state.codes.unshift(...action.payload.data.codes);
            })
            .addCase(generateRechargeCodes.rejected, (state, action) => {
                state.generateLoading = false;
                state.generateError = action.payload;
            });

        // Get all recharge codes
        builder
            .addCase(getAllRechargeCodes.pending, (state) => {

                state.loading = true;
                state.error = null;
            })
            .addCase(getAllRechargeCodes.fulfilled, (state, action) => {

                state.loading = false;
                state.codes = action.payload.data.codes;
                state.pagination = action.payload.data.pagination;
                state.stats = action.payload.data.stats;

            })
            .addCase(getAllRechargeCodes.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            });

        // Get recharge code stats
        builder
            .addCase(getRechargeCodeStats.pending, (state) => {

                state.loading = true;
                state.error = null;
            })
            .addCase(getRechargeCodeStats.fulfilled, (state, action) => {

                state.loading = false;
                state.stats = action.payload.data.stats;

            })
            .addCase(getRechargeCodeStats.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            });

        // Delete recharge code
        builder
            .addCase(deleteRechargeCode.pending, (state) => {
                state.deleteLoading = true;
                state.deleteError = null;
            })
            .addCase(deleteRechargeCode.fulfilled, (state, action) => {
                state.deleteLoading = false;
                // Remove the deleted code from the list
                const codeId = action.meta.arg;
                state.codes = state.codes.filter(code => code.id !== codeId);
            })
            .addCase(deleteRechargeCode.rejected, (state, action) => {
                state.deleteLoading = false;
                state.deleteError = action.payload;
            });
    }
});

export const { clearAdminRechargeCodeError, clearAdminRechargeCodeState } = adminRechargeCodeSlice.actions;
export default adminRechargeCodeSlice.reducer; 