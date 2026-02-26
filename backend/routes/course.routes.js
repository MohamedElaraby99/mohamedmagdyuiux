import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import upload from '../middleware/multer.middleware.js';
import { isLoggedIn, authorisedRoles } from '../middleware/auth.middleware.js';
import {
  getAllCourses,
  getAdminCourses,
  getCourseById,
  getLessonById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  getFeaturedCourses,
  toggleFeatured,
  addUnitToCourse,
  addLessonToUnit,
  addDirectLessonToCourse,
  updateLesson,
  deleteLesson,
  reorderLessons,
  reorderUnits,
  deleteUnit,
  updateUnit,
  updateLessonContent,
  submitTrainingAttempt
} from '../controllers/course.controller.js';

const router = express.Router();

// Public routes (with optional authentication for filtering)
router.get('/', async (req, res, next) => {
  // Try to authenticate if token exists, but don't fail if not authenticated
  const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

  if (token) {
    try {
      // Try to verify the token and set user info
      const userDetails = await jwt.verify(token, process.env.JWT_SECRET);

      // Fetch full user data
      const user = await User.findById(userDetails.id);
      if (user) {
        req.user = {
          ...userDetails,
          // stage: user.stage?._id, // Stage removed
          // stageName: user.stage?.name // Stage removed
        };

      }
    } catch (error) {

      // Continue without authentication - req.user will be undefined
    }
  }

  getAllCourses(req, res, next);
});
router.get('/featured', getFeaturedCourses);
router.patch('/:id/toggle-featured', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), toggleFeatured);

// Admin routes
router.get('/admin/all', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), getAdminCourses);
router.get('/admin/:id', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), getCourseById);
router.get('/stats', getCourseStats);
router.get('/:id', getCourseById);

// Get optimized lesson data
router.get('/:courseId/lessons/:lessonId', isLoggedIn, getLessonById);

// Protected routes
router.post('/', upload.single('thumbnail'), isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), createCourse);
router.put('/:id', upload.single('thumbnail'), isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), updateCourse);
router.delete('/:id', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), deleteCourse);

// Course structure management - Unit operations
router.post('/:courseId/units', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), addUnitToCourse);
router.put('/:courseId/units/:unitId', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), updateUnit);
router.delete('/:courseId/units/:unitId', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), deleteUnit);

// Course structure management - Lesson operations
router.post('/:courseId/units/:unitId/lessons',
  upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  isLoggedIn,
  authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'),
  addLessonToUnit
);

router.post('/:courseId/direct-lessons',
  upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  isLoggedIn,
  authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'),
  addDirectLessonToCourse
);

router.put('/:courseId/lessons/:lessonId',
  upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  isLoggedIn,
  authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'),
  updateLesson
);

router.put('/:courseId/lessons/:lessonId/content', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), updateLessonContent);

router.delete('/:courseId/lessons/:lessonId', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), deleteLesson);
router.put('/:courseId/reorder-lessons', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), reorderLessons);
router.put('/:courseId/reorder-units', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), reorderUnits);

// Training attempt submission
router.post('/:courseId/lessons/:lessonId/trainings/:trainingIndex/submit', isLoggedIn, submitTrainingAttempt);

// Entry Exam management
router.put('/:courseId/lessons/:lessonId/entry-exam', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { unitId, entryExam } = req.body;

    const Course = (await import('../models/course.model.js')).default;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let lesson = null;

    if (unitId) {
      const unit = course.units.id(unitId);
      if (!unit) {
        return res.status(404).json({ success: false, message: 'Unit not found' });
      }
      lesson = unit.lessons.id(lessonId);
    } else {
      lesson = course.directLessons.id(lessonId);
    }

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Update entry exam
    lesson.entryExam = {
      enabled: entryExam.enabled,
      type: entryExam.type || 'mcq',
      title: entryExam.title || 'امتحان المدخل',
      description: entryExam.description || '',
      taskDescription: entryExam.taskDescription || '',
      timeLimit: entryExam.timeLimit || 15,
      questions: entryExam.questions || [],
      userAttempts: lesson.entryExam?.userAttempts || [] // Preserve existing attempts
    };

    await course.save();

    return res.status(200).json({
      success: true,
      message: 'Entry exam saved successfully',
      data: { entryExam: lesson.entryExam }
    });
  } catch (error) {
    console.error('Error saving entry exam:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Entry Exam for lessons in units
router.put('/:courseId/units/:unitId/lessons/:lessonId/entry-exam', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
  try {
    const { courseId, unitId, lessonId } = req.params;
    const { entryExam } = req.body;

    const Course = (await import('../models/course.model.js')).default;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const unit = course.units.id(unitId);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    const lesson = unit.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Update entry exam
    lesson.entryExam = {
      enabled: entryExam.enabled,
      type: entryExam.type || 'mcq',
      title: entryExam.title || 'امتحان المدخل',
      description: entryExam.description || '',
      taskDescription: entryExam.taskDescription || '',
      timeLimit: entryExam.timeLimit || 15,
      questions: entryExam.questions || [],
      userAttempts: lesson.entryExam?.userAttempts || [] // Preserve existing attempts
    };

    await course.save();

    return res.status(200).json({
      success: true,
      message: 'Entry exam saved successfully',
      data: { entryExam: lesson.entryExam }
    });
  } catch (error) {
    console.error('Error saving entry exam:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
