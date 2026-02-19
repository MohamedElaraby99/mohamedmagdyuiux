import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../Helpers/axiosInstance';

// Async thunks
export const createTestimonial = createAsyncThunk(
    'testimonial/createTestimonial',
    async (testimonialData, { rejectWithValue }) => {
        try {
            let formData;

            if (testimonialData instanceof FormData) {
                formData = testimonialData;
            } else {
                formData = new FormData();
                Object.keys(testimonialData).forEach(key => {
                    formData.append(key, testimonialData[key]);
                });
            }

            const response = await axiosInstance.post('/testimonials', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Testimonial created successfully');
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create testimonial');
            return rejectWithValue(error.response?.data);
        }
    }
);

export const getAllTestimonials = createAsyncThunk(
    'testimonial/getAllTestimonials',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/testimonials', { params });
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to get testimonials');
            return rejectWithValue(error.response?.data);
        }
    }
);

export const updateTestimonial = createAsyncThunk(
    'testimonial/updateTestimonial',
    async ({ id, testimonialData }, { rejectWithValue }) => {
        try {
            let formData;

            if (testimonialData instanceof FormData) {
                formData = testimonialData;
            } else {
                formData = new FormData();
                Object.keys(testimonialData).forEach(key => {
                    formData.append(key, testimonialData[key]);
                });
            }

            const response = await axiosInstance.put(`/testimonials/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Testimonial updated successfully');
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update testimonial');
            return rejectWithValue(error.response?.data);
        }
    }
);

export const deleteTestimonial = createAsyncThunk(
    'testimonial/deleteTestimonial',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/testimonials/${id}`);
            toast.success('Testimonial deleted successfully');
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete testimonial');
            return rejectWithValue(error.response?.data);
        }
    }
);

const initialState = {
    testimonials: [],
    loading: false,
    error: null
};

const testimonialSlice = createSlice({
    name: 'testimonial',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create testimonial
            .addCase(createTestimonial.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTestimonial.fulfilled, (state, action) => {
                state.loading = false;
                state.testimonials.unshift(action.payload.data.testimonial);
            })
            .addCase(createTestimonial.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get all testimonials
            .addCase(getAllTestimonials.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllTestimonials.fulfilled, (state, action) => {
                state.loading = false;
                state.testimonials = action.payload.data.testimonials;
            })
            .addCase(getAllTestimonials.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update testimonial
            .addCase(updateTestimonial.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTestimonial.fulfilled, (state, action) => {
                state.loading = false;
                const updatedTestimonial = action.payload.data.testimonial;
                state.testimonials = state.testimonials.map(testimonial =>
                    testimonial._id === updatedTestimonial._id ? updatedTestimonial : testimonial
                );
            })
            .addCase(updateTestimonial.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete testimonial
            .addCase(deleteTestimonial.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTestimonial.fulfilled, (state, action) => {
                state.loading = false;
                state.testimonials = state.testimonials.filter(testimonial =>
                    testimonial._id !== action.meta.arg
                );
            })
            .addCase(deleteTestimonial.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = testimonialSlice.actions;
export default testimonialSlice.reducer;
