import { model, Schema } from "mongoose";

const stageSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Stage name is required'],
        trim: true,
        maxLength: [100, 'Stage name should be less than 100 characters'],
        unique: true
    },
    description: {
        type: String,
        trim: true,
        maxLength: [500, 'Description should be less than 500 characters']
    },
    image: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    subjectsCount: {
        type: Number,
        default: 0
    },
    studentsCount: {
        type: Number,
        default: 0
    },

}, {
    timestamps: true
});

// Create index for better search performance
stageSchema.index({ name: 'text' });

export default model('Stage', stageSchema); 