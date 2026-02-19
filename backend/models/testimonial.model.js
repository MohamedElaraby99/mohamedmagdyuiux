import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        trim: true,
        default: 'Student'
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5
    },
    image: {
        public_id: {
            type: String,
            default: ''
        },
        secure_url: {
            type: String,
            default: ''
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Testimonial', testimonialSchema);
