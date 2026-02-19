import Course from '../models/course.model.js';
import User from '../models/user.model.js';
import CourseAccess from '../models/courseAccess.model.js';
import NotificationRead from '../models/NotificationRead.js';

// Get course notifications for logged-in user
const getCourseNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all courses (since stage concept is removed)
    const stageCourses = await Course.find({});

    if (!stageCourses || stageCourses.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No courses found',
        data: []
      });
    }

    const courseIds = stageCourses.map(course => course._id);

    // Get courses with recent updates (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Use the stage courses directly (they're already filtered by stage)
    const coursesWithUpdates = stageCourses.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    console.log('🔔 Course details:', coursesWithUpdates.map(c => ({
      id: c._id,
      title: c.title,
      stage: c.stage,
      updatedAt: c.updatedAt,
      lessonsCount: c.lessons?.length || 0,
      unitsCount: c.units?.length || 0,
      directLessonsCount: c.directLessons?.length || 0
    })));

    // Get read notifications for this user
    const readNotifications = await NotificationRead.find({ userId }).select('notificationId');
    const readNotificationIds = new Set(readNotifications.map(n => n.notificationId));

    // Generate notifications based on course updates
    const notifications = [];

    for (const course of coursesWithUpdates) {
      // Check lessons from both units and direct lessons
      const allLessons = [];

      // Add lessons from units
      if (course.units && course.units.length > 0) {
        course.units.forEach(unit => {
          if (unit.lessons && unit.lessons.length > 0) {
            allLessons.push(...unit.lessons);
          }
        });
      }

      // Add direct lessons
      if (course.directLessons && course.directLessons.length > 0) {
        allLessons.push(...course.directLessons);
      }

      // Check for any videos in all lessons
      const allVideos = [];
      allLessons.forEach(lesson => {
        const videos = lesson.videos || [];
        allVideos.push(...videos.map(video => ({ ...video, lessonTitle: lesson.title })));
      });

      // Create notifications for recent lessons (last 7 days for testing)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentLessons = allLessons.filter(lesson =>
        new Date(lesson.createdAt || lesson.updatedAt || course.createdAt) >= sevenDaysAgo
      );

      const recentVideos = allVideos.filter(video =>
        new Date(video.createdAt || video.updatedAt || course.createdAt) >= sevenDaysAgo
      );

      // Create notifications for new lessons (only if not read)
      recentLessons.forEach(lesson => {
        const notificationId = `lesson_${lesson._id}_${course._id}`;
        if (!readNotificationIds.has(notificationId)) {
          notifications.push({
            _id: notificationId,
            type: 'new_lesson',
            title: 'درس جديد متاح',
            message: `تم إضافة درس جديد: ${lesson.title}`,
            courseName: course.title,
            courseId: course._id,
            courseUrl: `/courses/${course._id}`,
            actionText: 'عرض الكورس',
            contentDetails: {
              lessonTitle: lesson.title,
              lessonDescription: lesson.description
            },
            createdAt: lesson.createdAt || lesson.updatedAt || course.createdAt,
            isRead: false
          });
        }
      });

      // Create notifications for new videos (only if not read)
      recentVideos.forEach(video => {
        const notificationId = `video_${video._id}_${course._id}`;
        if (!readNotificationIds.has(notificationId)) {
          notifications.push({
            _id: notificationId,
            type: 'new_video',
            title: 'فيديو جديد متاح',
            message: `تم إضافة فيديو جديد "${video.title}" في درس: ${video.lessonTitle}`,
            courseName: course.title,
            courseId: course._id,
            courseUrl: `/courses/${course._id}`,
            actionText: 'مشاهدة الفيديو',
            contentDetails: {
              videoTitle: video.title,
              videoDescription: video.description,
              lessonTitle: video.lessonTitle,
              videoUrl: video.url
            },
            createdAt: video.createdAt || video.updatedAt || course.createdAt,
            isRead: false
          });
        }
      });

      // Always create a notification for course updates if course was updated recently (only if not read)
      if (new Date(course.updatedAt) >= sevenDaysAgo) {
        const notificationId = `course_${course._id}`;
        if (!readNotificationIds.has(notificationId)) {
          notifications.push({
            _id: notificationId,
            type: 'course_update',
            title: 'تحديث في الكورس',
            message: `تم تحديث محتوى الكورس: ${course.title}`,
            courseName: course.title,
            courseId: course._id,
            courseUrl: `/courses/${course._id}`,
            actionText: 'عرض التحديثات',
            contentDetails: {
              updateType: 'general_update'
            },
            createdAt: course.updatedAt,
            isRead: false
          });
        }
      }
    }

    // Sort notifications by creation date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      message: 'Course notifications retrieved successfully',
      data: notifications.slice(0, 20) // Limit to 20 most recent notifications
    });

  } catch (error) {
    console.error('Error getting course notifications:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: error.message
    });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    // Create or update read notification record
    await NotificationRead.findOneAndUpdate(
      { userId, notificationId },
      { userId, notificationId, readAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: error.message
    });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    // Use the same user identifier style as the getter for consistency
    const userId = req.user.id || req.user._id;

    // Get all courses (since stage concept is removed)
    const coursesWithUpdates = await Course.find({});

    // Generate notification IDs for all current notifications (mirror getter logic)
    const allNotificationIds = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const course of coursesWithUpdates) {
      // Add course update notification
      if (new Date(course.updatedAt) >= sevenDaysAgo) {
        allNotificationIds.push(`course_${course._id}`);
      }

      // Add lesson notifications
      const allLessons = [];
      if (course.units && course.units.length > 0) {
        course.units.forEach(unit => {
          if (unit.lessons && unit.lessons.length > 0) {
            allLessons.push(...unit.lessons);
          }
        });
      }
      if (course.directLessons && course.directLessons.length > 0) {
        allLessons.push(...course.directLessons);
      }

      const recentLessons = allLessons.filter(lesson =>
        new Date(lesson.createdAt || lesson.updatedAt || course.createdAt) >= sevenDaysAgo
      );

      recentLessons.forEach(lesson => {
        allNotificationIds.push(`lesson_${lesson._id}_${course._id}`);
      });

      // Add video notifications
      const allVideos = [];
      allLessons.forEach(lesson => {
        const videos = lesson.videos || [];
        allVideos.push(...videos.map(video => ({ ...video, lessonTitle: lesson.title })));
      });

      const recentVideos = allVideos.filter(video =>
        new Date(video.createdAt || video.updatedAt || course.createdAt) >= sevenDaysAgo
      );

      recentVideos.forEach(video => {
        allNotificationIds.push(`video_${video._id}_${course._id}`);
      });
    }

    // Mark all notifications as read
    if (allNotificationIds.length > 0) {
      const ops = allNotificationIds.map(notificationId => ({
        updateOne: {
          filter: { userId, notificationId },
          update: { $set: { userId, notificationId, readAt: new Date() } },
          upsert: true
        }
      }));
      await NotificationRead.bulkWrite(ops, { ordered: false });
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: error.message
    });
  }
};

export {
  getCourseNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};
