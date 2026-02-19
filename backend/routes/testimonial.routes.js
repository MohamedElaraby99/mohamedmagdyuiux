import express from 'express';
const router = express.Router();
import { isLoggedIn, authorisedRoles } from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';
import {
    createTestimonial,
    getAllTestimonials,
    deleteTestimonial,
    updateTestimonial
} from '../controllers/testimonial.controller.js';

// Public routes
router.get('/', getAllTestimonials);

// Admin routes
router.post('/', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), upload.single('image'), createTestimonial);
router.put('/:id', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), upload.single('image'), updateTestimonial);
router.delete('/:id', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), deleteTestimonial);

export default router;
