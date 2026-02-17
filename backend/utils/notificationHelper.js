import User from '../models/user.model.js';
import notificationService from '../services/notification.service.js'; // Assuming this service exists

// Create notifications for all users with matching stage when content is added
export const notifyUsersOfNewContent = async (course, contentType, contentDetails) => {
  try {

    // Send to all users since stage is removed
    const users = await User.find({ role: 'USER' });

    const message = generateNotificationMessage(contentType, course.title, contentDetails);
    const title = `New Content in ${course.title}`; // A default title, can be made more dynamic

    await notificationService.createNotification({
      title,
      message,
      type: 'course',
      relatedId: course._id,
      targetUsers: users.map(user => user._id),
    });

    // For now, we'll just log the notification creation
    // In a real implementation, you could store these in a notifications collection
    // or send real-time notifications via WebSocket/Socket.io


    // Here you could:
    // 1. Store in a notifications collection
    // 2. Send push notifications
    // 3. Send real-time updates via WebSocket
    // 4. Send email notifications

    return null;

  } catch (error) {
    console.error('❌ Error creating notifications:', error);
    return null;
  }
};

// Generate appropriate notification message based on content type
const generateNotificationMessage = (contentType, courseName, contentDetails) => {
  switch (contentType) {
    case 'new_video':
      return `تم إضافة فيديو جديد "${contentDetails.title}" في كورس ${courseName}`;
    case 'new_pdf':
      return `تم إضافة ملف PDF جديد "${contentDetails.title}" في كورس ${courseName}`;
    case 'new_exam':
      return `تم إضافة امتحان جديد "${contentDetails.title}" في كورس ${courseName}`;
    case 'new_training':
      return `تم إضافة تدريب جديد "${contentDetails.title}" في كورس ${courseName}`;
    case 'lesson_update':
      return `تم تحديث محتوى الدرس في كورس ${courseName}`;
    default:
      return `تم تحديث محتوى كورس ${courseName}`;
  }
};

// Detect what type of content was added by comparing before/after
export const detectContentChanges = (oldLesson, newLesson) => {
  const changes = [];

  // Check for new videos
  const oldVideoIds = (oldLesson.videos || []).map(v => v._id?.toString());
  const newVideos = (newLesson.videos || []).filter(v =>
    !oldVideoIds.includes(v._id?.toString())
  );

  newVideos.forEach(video => {
    changes.push({
      type: 'new_video',
      details: {
        title: video.title,
        description: video.description,
        url: video.url
      }
    });
  });

  // Check for new PDFs
  const oldPdfIds = (oldLesson.pdfs || []).map(p => p._id?.toString());
  const newPdfs = (newLesson.pdfs || []).filter(p =>
    !oldPdfIds.includes(p._id?.toString())
  );

  newPdfs.forEach(pdf => {
    changes.push({
      type: 'new_pdf',
      details: {
        title: pdf.title,
        description: pdf.description
      }
    });
  });

  // Check for new exams
  const oldExamIds = (oldLesson.exams || []).map(e => e._id?.toString());
  const newExams = (newLesson.exams || []).filter(e =>
    !oldExamIds.includes(e._id?.toString())
  );

  newExams.forEach(exam => {
    changes.push({
      type: 'new_exam',
      details: {
        title: exam.title,
        description: exam.description
      }
    });
  });

  // Check for new trainings
  const oldTrainingIds = (oldLesson.trainings || []).map(t => t._id?.toString());
  const newTrainings = (newLesson.trainings || []).filter(t =>
    !oldTrainingIds.includes(t._id?.toString())
  );

  newTrainings.forEach(training => {
    changes.push({
      type: 'new_training',
      details: {
        title: training.title,
        description: training.description
      }
    });
  });

  return changes;
};
