import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateLesson } from '../../Redux/Slices/CourseSlice';
import { FaTimes, FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const LessonModal = ({ lesson, unitId, lessonId, courseId, onClose, isOpen }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: lesson?.title || '',
    description: lesson?.description || '',
    isFree: lesson?.isFree || false
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title || '',
        description: lesson.description || '',
        isFree: lesson.isFree || false
      });
    }
  }, [lesson]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('عنوان الدرس مطلوب');
      return;
    }

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        isFree: formData.isFree
      };

      await dispatch(updateLesson({
        courseId,
        unitId,
        lessonId,
        lessonData: updateData
      })).unwrap();

      toast.success('تم تحديث الدرس بنجاح');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في تحديث الدرس');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            تعديل الدرس: {formData.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">معلومات الدرس</h3>
            <div>
              <label className="block text-sm font-medium mb-1">العنوان *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="أدخل عنوان الدرس"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الوصف</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="6"
                placeholder="أدخل وصف الدرس"
              />
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={(e) => handleInputChange('isFree', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">مجاني (متاح بدون شراء)</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">الطلاب هيقدروا يشوفوا الدرس ده من غير ما يشتروا الكورس</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <FaSave className="text-sm" />
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonModal;
