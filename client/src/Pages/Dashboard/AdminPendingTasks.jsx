import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../Helpers/axiosInstance';
import Layout from '../../Layout/Layout';
import ImageViewer from '../../Components/ImageViewer';
import { FaCheck, FaTimes, FaExternalLinkAlt, FaImage, FaSpinner, FaSearchPlus } from 'react-icons/fa';
import { generateFileUrl } from '../../utils/fileUtils';
import toast from 'react-hot-toast';

const AdminPendingTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [adminFeedback, setAdminFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [currentImageUrl, setCurrentImageUrl] = useState('');

    useEffect(() => {
        fetchPendingTasks();
    }, []);

    const fetchPendingTasks = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/exams/entry-task/pending');
            if (res.data.success) {
                setTasks(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching pending tasks:", error);
            toast.error('فشل في جلب المهام المعلقة');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewClick = (task) => {
        setSelectedTask(task);
        setAdminFeedback('');
        setReviewModalOpen(true);
    };

    const handleReviewSubmit = async (status) => {
        if (!selectedTask) return;

        setSubmitting(true);
        try {
            const res = await axiosInstance.put(
                `/exams/entry-task/${selectedTask.courseId}/${selectedTask.lessonId}/review/${selectedTask.userId}`,
                { status, adminFeedback }
            );

            if (res.data.success) {
                toast.success(status === 'success' ? 'تم قبول المهمة' : 'تم رفض المهمة');
                setReviewModalOpen(false);
                fetchPendingTasks(); // Refresh list
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error('فشل في تقييم المهمة');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-4xl text-primary" />
            </div>
        );
    }

    return (
        <Layout hideFooter hideNav>
            <div className="container py-8 mx-auto p-4 md:p-6 text-right z-0 relative" dir="rtl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        مراجعة مہام الدخول ({tasks.length})
                    </h1>
                    <button
                        onClick={fetchPendingTasks}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors"
                    >
                        تحديث القائمة
                    </button>
                </div>

                {tasks.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-sm">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">لا توجد مهام معلقة</h2>
                        <p className="text-gray-500 mt-2">جميع مہام الطلاب قد تمت مراجعتها.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map(task => (
                            <div key={`${task.lessonId}-${task.userId}`} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-200">
                                        قيد المراجعة
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(task.takenAt).toLocaleDateString('ar-EG')}
                                    </span>
                                </div>

                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 leading-tight mb-2">
                                    {task.courseTitle} - {task.lessonTitle}
                                </h3>

                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-4 text-sm mt-3">
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">بيانات الطالب:</p>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">{task.user?.fullName}</p>
                                    <p className="text-gray-500 text-xs">{task.user?.email}</p>
                                </div>

                                <div className="flex flex-col gap-2 mt-auto pt-2">
                                    <button
                                        onClick={() => handleReviewClick(task)}
                                        className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded-lg font-medium transition-colors"
                                    >
                                        عرض وتقييم المهمة
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Review Modal */}
                {reviewModalOpen && selectedTask && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-right">
                        <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                    تقييم مهمة: {selectedTask.user?.fullName}
                                </h3>
                                <button
                                    onClick={() => setReviewModalOpen(false)}
                                    className="text-gray-500 hover:text-red-500 transition-colors bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/40 w-8 h-8 rounded-full flex items-center justify-center"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                                    <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">المطلوب من الطالب:</h4>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                        {selectedTask.taskDescription}
                                    </p>
                                </div>

                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 mb-6">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                                        تسليم الطالب:
                                    </h4>

                                    {selectedTask.taskLink && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">الرابط المرفق:</p>
                                            <a
                                                href={selectedTask.taskLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg"
                                            >
                                                <FaExternalLinkAlt size={12} />
                                                <span dir="ltr">{selectedTask.taskLink}</span>
                                            </a>
                                        </div>
                                    )}

                                    {selectedTask.taskImage && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">الصورة المرفقة (انقر للتكبير):</p>
                                            <div
                                                className="relative group cursor-zoom-in rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
                                                onClick={() => {
                                                    setCurrentImageUrl(selectedTask.taskImage);
                                                    setImageViewerOpen(true);
                                                }}
                                            >
                                                <img
                                                    src={generateFileUrl(selectedTask.taskImage)}
                                                    alt="Task Submission"
                                                    className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                                                    style={{ maxHeight: '400px', objectFit: 'contain' }}
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                    <FaSearchPlus className="text-white opacity-0 group-hover:opacity-100 text-3xl transition-opacity" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!selectedTask.taskLink && !selectedTask.taskImage && (
                                        <p className="text-red-500 italic text-sm">لم يقم الطالب بإرفاق رابط أو صورة.</p>
                                    )}
                                </div>

                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        تعليمات / ملاحظات للطالب (اختياري / يظهر للطالب عند الرفض أو القبول):
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        rows="4"
                                        placeholder="اكتب ملاحظاتك ومقترحاتك للتحسين..."
                                        value={adminFeedback}
                                        onChange={(e) => setAdminFeedback(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex gap-3 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
                                <button
                                    onClick={() => handleReviewSubmit('success')}
                                    disabled={submitting}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                    قبول المهمة (فتح المحتوى)
                                </button>
                                <button
                                    onClick={() => handleReviewSubmit('failed')}
                                    disabled={submitting || !adminFeedback.trim()}
                                    title={!adminFeedback.trim() ? "يرجى كتابة سبب الرفض في الملاحظات أولاً" : ""}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                                    رفض المہمة (المطالبة بالإعادة)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ImageViewer
                isOpen={imageViewerOpen}
                imageUrl={currentImageUrl}
                title={`تسليم الطالب: ${selectedTask?.user?.fullName}`}
                onClose={() => setImageViewerOpen(false)}
            />
        </Layout>
    );
};

export default AdminPendingTasks;
