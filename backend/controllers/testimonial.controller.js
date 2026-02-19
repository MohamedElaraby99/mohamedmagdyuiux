import Testimonial from '../models/testimonial.model.js';
import path from 'path';
import fs from 'fs';

// Create a new testimonial
const createTestimonial = async (req, res, next) => {
    try {
        const { name, role, text, rating, isActive } = req.body;

        // Handle image upload
        let image = {
            public_id: 'placeholder',
            secure_url: 'https://randomuser.me/api/portraits/men/32.jpg' // Default placeholder
        };

        if (req.file) {
            try {
                const uploadsDir = path.join('uploads', 'testimonials');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }

                const destPath = path.join(uploadsDir, req.file.filename);
                fs.renameSync(req.file.path, destPath);

                image = {
                    public_id: req.file.filename,
                    secure_url: `/uploads/testimonials/${req.file.filename}`
                };
            } catch (uploadError) {
                console.error('❌ Image upload error:', uploadError);

                if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
                    fs.rmSync(`uploads/${req.file.filename}`);
                }

                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload image'
                });
            }
        }

        const testimonial = new Testimonial({
            name: name.trim(),
            role: role?.trim() || 'Student',
            text: text.trim(),
            rating: rating || 5,
            image,
            isActive: isActive !== undefined ? isActive : true
        });

        await testimonial.save();

        return res.status(201).json({
            success: true,
            message: 'Testimonial created successfully',
            data: { testimonial }
        });
    } catch (error) {
        console.error('Error creating testimonial:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create testimonial',
            error: error.message
        });
    }
};

// Get all testimonials
const getAllTestimonials = async (req, res, next) => {
    try {
        const { isActive } = req.query;
        const query = {};

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const testimonials = await Testimonial.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Testimonials retrieved successfully',
            data: { testimonials }
        });
    } catch (error) {
        console.error('Error getting testimonials:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get testimonials',
            error: error.message
        });
    }
};

// Delete testimonial
const deleteTestimonial = async (req, res, next) => {
    try {
        const { id } = req.params;

        const testimonial = await Testimonial.findById(id);
        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }

        // Delete image if exists and not placeholder
        if (testimonial.image && testimonial.image.public_id && testimonial.image.public_id !== 'placeholder') {
            try {
                const imagePath = path.join('uploads', 'testimonials', testimonial.image.public_id);
                if (fs.existsSync(imagePath)) {
                    fs.rmSync(imagePath);
                }
            } catch (fileError) {
                console.error('❌ Error deleting local testimonial image:', fileError);
            }
        }

        await Testimonial.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Testimonial deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting testimonial:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete testimonial',
            error: error.message
        });
    }
};

// Update testimonial
const updateTestimonial = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, role, text, rating, isActive } = req.body;

        const testimonial = await Testimonial.findById(id);
        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }

        let image = testimonial.image;
        if (req.file) {
            try {
                // Delete old image
                if (testimonial.image && testimonial.image.public_id && testimonial.image.public_id !== 'placeholder') {
                    const oldImagePath = path.join('uploads', 'testimonials', testimonial.image.public_id);
                    if (fs.existsSync(oldImagePath)) {
                        fs.rmSync(oldImagePath);
                    }
                }

                const uploadsDir = path.join('uploads', 'testimonials');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }

                const destPath = path.join(uploadsDir, req.file.filename);
                fs.renameSync(req.file.path, destPath);

                image = {
                    public_id: req.file.filename,
                    secure_url: `/uploads/testimonials/${req.file.filename}`
                };
            } catch (uploadError) {
                console.error('❌ Image upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload image'
                });
            }
        }

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (role) updateData.role = role.trim();
        if (text) updateData.text = text.trim();
        if (rating) updateData.rating = rating;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (req.file) updateData.image = image;

        const updatedTestimonial = await Testimonial.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Testimonial updated successfully',
            data: { testimonial: updatedTestimonial }
        });
    } catch (error) {
        console.error('Error updating testimonial:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update testimonial',
            error: error.message
        });
    }
};

export {
    createTestimonial,
    getAllTestimonials,
    deleteTestimonial,
    updateTestimonial
};
