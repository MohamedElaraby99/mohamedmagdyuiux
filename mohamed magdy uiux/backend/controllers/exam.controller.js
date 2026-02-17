import ExamResult from "../models/examResult.model.js";
import Course from "../models/course.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/error.utils.js";
import mongoose from "mongoose";

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Take training exam
const takeTrainingExam = asyncHandler(async (req, res) => {
    const { courseId, lessonId, unitId, examId, answers, startTime } = req.body;

    // Try both _id and id fields from the JWT token
    const userId = req.user._id || req.user.id;

    if (!userId) {
        throw new AppError("User ID not found in request", 400);
    }

    // Find the course and lesson
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError("Course not found", 404);
    }

    let lesson = null;
    let unit = null;

    // Find lesson in units or direct lessons
    if (unitId) {
        unit = course.units.id(unitId);
        if (!unit) {
            throw new AppError("Unit not found", 404);
        }
        lesson = unit.lessons.id(lessonId);
    } else {
        lesson = course.directLessons.id(lessonId);
    }

    if (!lesson) {
        throw new AppError("Lesson not found", 404);
    }

    // Find the specific training by ID
    const training = lesson.trainings.id(examId);
    if (!training || !training.questions || training.questions.length === 0) {
        throw new AppError("Training not found or has no questions", 400);
    }

    // Check if training is open based on dates
    const now = new Date();
    if (training.openDate && now < new Date(training.openDate)) {
        throw new AppError("Training is not open yet", 400);
    }

    // Calculate results
    const questions = training.questions;
    let correctAnswers = 0;
    const detailedAnswers = [];

    answers.forEach((answer) => {
        const question = questions[answer.questionIndex];
        if (!question) return;

        const isCorrect = answer.selectedAnswer === question.correctAnswer;

        if (isCorrect) {
            correctAnswers++;
        }

        detailedAnswers.push({
            questionIndex: answer.questionIndex,
            selectedAnswer: answer.selectedAnswer,
            isCorrect
        });
    });

    const totalQuestions = questions.length;
    const score = correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Calculate time taken
    const endTime = new Date();
    let timeTaken = 0;

    if (startTime) {
        const start = new Date(startTime);
        timeTaken = Math.round((endTime - start) / 1000 / 60); // Convert to minutes
        console.log('⏱️ Time calculation:', {
            startTime: start,
            endTime: endTime,
            timeTakenMinutes: timeTaken
        });
    } else {

        timeTaken = req.body.timeTaken || 0;
    }

    // Save attempt to training
    const attempt = {
        userId,
        takenAt: endTime,
        score,
        totalQuestions,
        answers: detailedAnswers
    };

    training.userAttempts.push(attempt);
    await course.save();

    // Also save to ExamResult model for history tracking
    // For training exams, update existing record or create new one
    const examResultData = {
        user: userId,
        course: courseId,
        lessonId: lessonId,
        lessonTitle: lesson.title,
        unitId: unitId || null,
        unitTitle: unit ? unit.title : null,
        examType: 'training',
        score: correctAnswers,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        wrongAnswers: totalQuestions - correctAnswers,
        timeTaken: timeTaken,
        timeLimit: training.timeLimit || 30,
        passingScore: 50, // Default passing score
        passed: percentage >= 50,
        answers: detailedAnswers.map(answer => ({
            questionIndex: answer.questionIndex,
            selectedAnswer: answer.selectedAnswer,
            correctAnswer: training.questions[answer.questionIndex].correctAnswer,
            isCorrect: answer.isCorrect
        })),
        completedAt: endTime
    };

    // Use upsert to update existing record or create new one
    // Create new exam result record for history tracking
    await ExamResult.create(examResultData);

    res.status(201).json({
        success: true,
        message: "Training completed successfully",
        data: {
            examType: 'training',
            examId: training._id,
            courseId,
            lessonId,
            unitId: unitId || null,
            score,
            totalQuestions,
            percentage,
            correctAnswers,
            wrongAnswers: totalQuestions - correctAnswers,
            timeTaken: timeTaken,
            answers: detailedAnswers,
            questionsWithAnswers: questions.map((question, index) => {
                // Find the answer for this specific question by questionIndex, not by array index
                const answerForQuestion = detailedAnswers.find(a => a.questionIndex === index);
                return {
                    question: question.question,
                    options: question.options,
                    correctAnswer: question.correctAnswer,
                    explanation: question.explanation || '',
                    userAnswer: answerForQuestion?.selectedAnswer,
                    isCorrect: answerForQuestion?.isCorrect,
                    questionIndex: index
                };
            })
        }
    });
});

// Take final exam
const takeFinalExam = asyncHandler(async (req, res) => {
    const { courseId, lessonId, unitId, examId, answers, startTime } = req.body;

    // Try both _id and id fields from the JWT token
    const userId = req.user._id || req.user.id;

    if (!userId) {
        throw new AppError("User ID not found in request", 400);
    }

    // Find the course and lesson

    const course = await Course.findById(courseId);
    if (!course) {

        throw new AppError("Course not found", 404);
    }

    let lesson = null;
    let unit = null;

    // Find lesson in units or direct lessons
    if (unitId) {

        unit = course.units.id(unitId);
        if (!unit) {

            throw new AppError("Unit not found", 404);
        }

        lesson = unit.lessons.id(lessonId);
    } else {

        lesson = course.directLessons.id(lessonId);
    }

    if (!lesson) {

        if (unitId && unit) {

        } else {

        }
        throw new AppError("Lesson not found", 404);
    }

    // Find the specific exam by ID

    const exam = lesson.exams.id(examId);
    if (!exam || !exam.questions || exam.questions.length === 0) {

        throw new AppError("Exam not found or has no questions", 400);
    }

    // Check if exam is open based on dates
    const now = new Date();
    if (exam.openDate && now < new Date(exam.openDate)) {
        throw new AppError("Exam is not open yet", 400);
    }
    if (exam.closeDate && now > new Date(exam.closeDate)) {
        throw new AppError("Exam is closed", 400);
    }

    // Check if user has already taken this final exam
    // For now, allow retaking final exams (remove this check if you want to allow retakes)
    // const existingAttempt = exam.userAttempts.find(attempt => 
    //     attempt.userId.toString() === userId.toString()
    // );
    // if (existingAttempt) {
    //     throw new AppError("You have already taken this final exam", 400);
    // }

    // Calculate results
    const questions = exam.questions;
    let correctAnswers = 0;
    const detailedAnswers = [];

    answers.forEach((answer) => {
        const question = questions[answer.questionIndex];
        if (!question) return;

        const isCorrect = answer.selectedAnswer === question.correctAnswer;

        if (isCorrect) {
            correctAnswers++;
        }

        detailedAnswers.push({
            questionIndex: answer.questionIndex,
            selectedAnswer: answer.selectedAnswer,
            isCorrect
        });
    });

    const totalQuestions = questions.length;
    const score = correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Calculate time taken
    const endTime = new Date();
    let timeTaken = 0;

    if (startTime) {
        const start = new Date(startTime);
        timeTaken = Math.round((endTime - start) / 1000 / 60); // Convert to minutes
        console.log('⏱️ Final exam time calculation:', {
            startTime: start,
            endTime: endTime,
            timeTakenMinutes: timeTaken
        });
    } else {

        timeTaken = req.body.timeTaken || 0;
    }

    // Save attempt to exam
    const attempt = {
        userId,
        takenAt: endTime,
        score,
        totalQuestions,
        answers: detailedAnswers
    };

    exam.userAttempts.push(attempt);
    await course.save();

    // Also save to ExamResult model for history tracking
    // For final exams, update existing record or create new one (allow retakes)
    const examResultData = {
        user: userId,
        course: courseId,
        lessonId: lessonId,
        lessonTitle: lesson.title,
        unitId: unitId || null,
        unitTitle: unit ? unit.title : null,
        examType: 'final',
        score: correctAnswers,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        wrongAnswers: totalQuestions - correctAnswers,
        timeTaken: timeTaken,
        timeLimit: exam.timeLimit || 30,
        passingScore: 50, // Default passing score
        passed: percentage >= 50,
        answers: detailedAnswers.map(answer => ({
            questionIndex: answer.questionIndex,
            selectedAnswer: answer.selectedAnswer,
            correctAnswer: exam.questions[answer.questionIndex].correctAnswer,
            isCorrect: answer.isCorrect
        })),
        completedAt: endTime
    };

    // Use upsert to update existing record or create new one
    // Create new exam result record for history tracking
    await ExamResult.create(examResultData);

    res.status(201).json({
        success: true,
        message: "Exam completed successfully",
        data: {
            examType: 'final',
            examId: exam._id,
            courseId,
            lessonId,
            unitId: unitId || null,
            score,
            totalQuestions,
            percentage,
            correctAnswers,
            wrongAnswers: totalQuestions - correctAnswers,
            timeTaken: timeTaken,
            answers: detailedAnswers,
            questionsWithAnswers: questions.map((question, index) => {
                // Find the answer for this specific question by questionIndex, not by array index
                const answerForQuestion = detailedAnswers.find(a => a.questionIndex === index);
                return {
                    question: question.question,
                    options: question.options,
                    correctAnswer: question.correctAnswer,
                    explanation: question.explanation || '',
                    userAnswer: answerForQuestion?.selectedAnswer,
                    isCorrect: answerForQuestion?.isCorrect,
                    questionIndex: index
                };
            })
        }
    });
});

// Get exam results for a lesson
const getExamResults = asyncHandler(async (req, res) => {
    const { courseId, lessonId } = req.params;
    const { examType } = req.query;
    const userId = req.user._id || req.user.id;

    // Build filter object
    const filter = {
        user: userId,
        course: courseId,
        lessonId
    };

    // Add exam type filter if provided
    if (examType) {
        filter.examType = examType;
    }

    const results = await ExamResult.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: results
    });
});

// Get user's exam history
const getUserExamHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const results = await ExamResult.find({ user: userId })
        .populate('course', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await ExamResult.countDocuments({ user: userId });

    res.status(200).json({
        success: true,
        data: results,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            resultsPerPage: parseInt(limit)
        }
    });
});

// Check if user has taken an exam
const checkExamTaken = asyncHandler(async (req, res) => {
    const { courseId, lessonId, examType } = req.params;
    const userId = req.user._id || req.user.id;

    if (!userId) {
        throw new AppError("User ID not found in request", 400);
    }

    const existingResult = await ExamResult.findOne({
        user: userId,
        course: courseId,
        lessonId,
        examType
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: {
            hasTaken: !!existingResult,
            result: existingResult
        }
    });
});

// Get exam statistics for admin
const getExamStatistics = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const matchStage = courseId && courseId !== 'all' ? { course: new mongoose.Types.ObjectId(courseId) } : {};

    // Let's rewrite the whole pipeline correctly in one go
    const CleanStats = await ExamResult.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: "courses",
                localField: "course",
                foreignField: "_id",
                as: "courseInfo"
            }
        },
        { $unwind: { path: "$courseInfo", preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: {
                    courseId: "$course",
                    lessonId: "$lessonId",
                    examType: "$examType"
                },
                // Carry over titles
                courseTitle: { $first: "$courseInfo.title" },
                lessonTitle: { $first: "$lessonTitle" },
                // Calc stats
                totalAttempts: { $sum: 1 },
                averageScore: { $avg: "$score" },
                passedCount: { $sum: { $cond: ["$passed", 1, 0] } },
                failedCount: { $sum: { $cond: ["$passed", 0, 1] } }
            }
        },
        {
            $project: {
                _id: 0,
                courseId: "$_id.courseId",
                lessonId: "$_id.lessonId",
                examType: "$_id.examType",
                courseTitle: { $ifNull: ["$courseTitle", "Unknown Course"] },
                lessonTitle: { $ifNull: ["$lessonTitle", "Unknown Lesson"] },
                totalAttempts: 1,
                averageScore: 1,
                passedCount: 1,
                failedCount: 1
            }
        },
        { $sort: { courseTitle: 1, lessonTitle: 1 } }
    ]);

    res.status(200).json({
        success: true,
        data: CleanStats
    });
});

// Get all exam results for admin dashboard
const getAllExamResults = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, courseId, lessonId, examType, passed, sortBy = 'completedAt', sortOrder = 'desc', search } = req.query;

    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (courseId) filter.course = courseId;
    if (lessonId) filter.lessonId = lessonId;
    if (examType) filter.examType = examType;
    if (passed !== undefined && passed !== '') filter.passed = passed === 'true';

    // Handle Search (Find users, courses, lessons matching the search term)
    if (search) {
        const searchRegex = { $regex: search, $options: 'i' };

        // 1. Find Users matching name/email/phone
        const users = await User.find({
            $or: [
                { fullName: searchRegex },
                { email: searchRegex },
                { phoneNumber: searchRegex }
            ]
        }).select('_id');
        const userIds = users.map(user => user._id);

        // 2. Find Courses matching title
        const courses = await Course.find({ title: searchRegex }).select('_id');
        const courseIds = courses.map(course => course._id);

        // 3. Apply Global Search Filter
        // Matches if User found OR Course found OR Lesson Title matches OR Unit Title matches
        filter.$or = [
            { user: { $in: userIds } },
            { course: { $in: courseIds } },
            { lessonTitle: searchRegex },
            { unitTitle: searchRegex }
        ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const results = await ExamResult.find(filter)
        .populate('user', 'fullName email phoneNumber')
        .populate('course', 'title instructor stage subject')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

    const total = await ExamResult.countDocuments(filter);

    // Get summary statistics
    const summaryStats = await ExamResult.aggregate([
        { $match: filter },
        {
            $group: {
                _id: null,
                totalAttempts: { $sum: 1 },
                averageScore: { $avg: "$score" },
                passedCount: { $sum: { $cond: ["$passed", 1, 0] } },
                failedCount: { $sum: { $cond: ["$passed", 0, 1] } },
                averageTimeTaken: { $avg: "$timeTaken" }
            }
        }
    ]);

    const stats = summaryStats[0] || {
        totalAttempts: 0,
        averageScore: 0,
        passedCount: 0,
        failedCount: 0,
        averageTimeTaken: 0
    };

    res.status(200).json({
        success: true,
        data: results,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            resultsPerPage: parseInt(limit)
        },
        statistics: {
            totalAttempts: stats.totalAttempts,
            averageScore: Math.round(stats.averageScore * 100) / 100,
            passedCount: stats.passedCount,
            failedCount: stats.failedCount,
            passRate: stats.totalAttempts > 0 ? Math.round((stats.passedCount / stats.totalAttempts) * 100) : 0,
            averageTimeTaken: Math.round(stats.averageTimeTaken * 100) / 100
        }
    });
});

// Clear exam attempt for a specific user and exam
const clearExamAttempt = asyncHandler(async (req, res) => {
    const { courseId, lessonId, examId } = req.params;
    const userId = req.user._id || req.user.id;

    if (!userId) {
        throw new AppError("User ID not found in request", 400);
    }

    // Find the course and lesson
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError("Course not found", 404);
    }

    let lesson = null;
    let unit = null;

    // Find lesson in units or direct lessons
    if (req.query.unitId) {
        unit = course.units.id(req.query.unitId);
        if (!unit) {
            throw new AppError("Unit not found", 404);
        }
        lesson = unit.lessons.id(lessonId);
    } else {
        lesson = course.directLessons.id(lessonId);
    }

    if (!lesson) {
        throw new AppError("Lesson not found", 404);
    }

    // Find the specific exam by ID
    const exam = lesson.exams.id(examId);
    if (!exam) {
        throw new AppError("Exam not found", 404);
    }

    // Remove user attempts for this exam
    const initialLength = exam.userAttempts.length;
    exam.userAttempts = exam.userAttempts.filter(attempt =>
        attempt.userId.toString() !== userId.toString()
    );

    const removedCount = initialLength - exam.userAttempts.length;

    if (removedCount === 0) {
        return res.status(404).json({
            success: false,
            message: "No exam attempts found for this user"
        });
    }

    // Save the course
    await course.save();

    res.status(200).json({
        success: true,
        message: `Successfully cleared ${removedCount} exam attempt(s)`,
        data: {
            removedAttempts: removedCount,
            remainingAttempts: exam.userAttempts.length
        }
    });
});

// Take Entry Exam (امتحان المدخل)
const takeEntryExam = asyncHandler(async (req, res) => {
    const { courseId, lessonId, unitId, answers, startTime } = req.body;

    const userId = req.user._id || req.user.id;

    if (!userId) {
        throw new AppError("User ID not found in request", 400);
    }

    // Find the course and lesson
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError("Course not found", 404);
    }

    let lesson = null;
    let unit = null;

    // Find lesson in units or direct lessons
    if (unitId) {
        unit = course.units.id(unitId);
        if (!unit) {
            throw new AppError("Unit not found", 404);
        }
        lesson = unit.lessons.id(lessonId);
    } else {
        lesson = course.directLessons.id(lessonId);
    }

    if (!lesson) {
        throw new AppError("Lesson not found", 404);
    }

    // Check if entry exam exists and is enabled
    if (!lesson.entryExam || !lesson.entryExam.enabled || !lesson.entryExam.questions || lesson.entryExam.questions.length === 0) {
        throw new AppError("Entry exam not found or not enabled", 400);
    }

    const entryExam = lesson.entryExam;

    // Calculate results
    const questions = entryExam.questions;
    let correctAnswers = 0;
    const detailedAnswers = [];

    answers.forEach((answer) => {
        const question = questions[answer.questionIndex];
        if (!question) return;

        const isCorrect = answer.selectedAnswer === question.correctAnswer;

        if (isCorrect) {
            correctAnswers++;
        }

        detailedAnswers.push({
            questionIndex: answer.questionIndex,
            selectedAnswer: answer.selectedAnswer,
            isCorrect
        });
    });

    const totalQuestions = questions.length;
    const score = correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Calculate time taken
    const endTime = new Date();
    let timeTaken = 0;

    if (startTime) {
        const start = new Date(startTime);
        timeTaken = Math.round((endTime - start) / 1000 / 60);
    }

    // Save the attempt to the entry exam
    const attemptData = {
        userId: userId,
        takenAt: new Date(),
        score: score,
        totalQuestions: totalQuestions,
        answers: detailedAnswers
    };

    // Initialize userAttempts array if it doesn't exist
    if (!lesson.entryExam.userAttempts) {
        lesson.entryExam.userAttempts = [];
    }

    // Add the new attempt
    lesson.entryExam.userAttempts.push(attemptData);

    // Save the course
    await course.save();

    res.status(200).json({
        success: true,
        message: "Entry exam completed successfully! Content is now unlocked.",
        data: {
            score,
            totalQuestions,
            percentage,
            correctAnswers,
            wrongAnswers: totalQuestions - correctAnswers,
            timeTaken,
            answers: detailedAnswers.map((ans, idx) => ({
                ...ans,
                correctAnswer: questions[ans.questionIndex]?.correctAnswer,
                explanation: questions[ans.questionIndex]?.explanation || ''
            })),
            contentUnlocked: true
        }
    });
});

export {
    takeTrainingExam,
    takeFinalExam,
    getExamResults,
    getUserExamHistory,
    getExamStatistics,
    checkExamTaken,
    clearExamAttempt,
    takeEntryExam
}; 