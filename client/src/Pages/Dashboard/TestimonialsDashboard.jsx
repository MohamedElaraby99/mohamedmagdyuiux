import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getAllTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
} from '../../Redux/Slices/TestimonialSlice';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaStar,
    FaSearch,
    FaTimes,
    FaQuoteRight
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Layout from '../../Layout/Layout';
import { generateImageUrl } from "../../utils/fileUtils";

const TestimonialsDashboard = () => {
    const dispatch = useDispatch();
    const { testimonials, loading } = useSelector((state) => state.testimonial);
    const { role } = useSelector((state) => state.auth);

    const [showModal, setShowModal] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        role: 'Student',
        text: '',
        rating: 5,
        isActive: true,
        image: null
    });

    useEffect(() => {
        dispatch(getAllTestimonials());
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let testimonialData;

            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('role', formData.role);
            formDataToSend.append('text', formData.text);
            formDataToSend.append('rating', formData.rating);
            formDataToSend.append('isActive', formData.isActive);

            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            testimonialData = formDataToSend;

            if (editingTestimonial) {
                await dispatch(updateTestimonial({
                    id: editingTestimonial._id,
                    testimonialData
                })).unwrap();
            } else {
                await dispatch(createTestimonial(testimonialData)).unwrap();
            }

            setShowModal(false);
            setEditingTestimonial(null);
            resetForm();
        } catch (error) {
            // Error handled in slice
        }
    };

    const handleEdit = (testimonial) => {
        setEditingTestimonial(testimonial);
        setFormData({
            name: testimonial.name,
            role: testimonial.role || 'Student',
            text: testimonial.text,
            rating: testimonial.rating || 5,
            isActive: testimonial.isActive,
            image: null
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الرأي؟')) {
            await dispatch(deleteTestimonial(id));
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            role: 'Student',
            text: '',
            rating: 5,
            isActive: true,
            image: null
        });
    };

    const filteredTestimonials = testimonials.filter(testimonial =>
        testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FaStar
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold">غير مصرح لك بالوصول</h1>
            </div>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                                إدارة آراء الطلاب
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                إضافة وتعديل آراء الطلاب والتوصيات
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingTestimonial(null);
                                resetForm();
                                setShowModal(true);
                            }}
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                        >
                            <FaPlus />
                            إضافة رأي جديد
                        </button>
                    </div>

                    {/* Search */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-8">
                        <div className="relative">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="البحث في الآراء..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTestimonials.map((testimonial) => (
                            <div key={testimonial._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                                        {testimonial.image?.secure_url ? (
                                            <img
                                                src={generateImageUrl(testimonial.image.secure_url)}
                                                alt={testimonial.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                <FaQuoteRight className="text-gray-400 text-xl" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{testimonial.name}</h3>
                                        <p className="text-sm text-primary">{testimonial.role}</p>
                                        <div className="flex gap-1 mt-1">
                                            {renderStars(testimonial.rating)}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 flex-grow">
                                    "{testimonial.text}"
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <span className={`text-xs px-2 py-1 rounded-full ${testimonial.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {testimonial.isActive ? 'نشط' : 'غير نشط'}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(testimonial)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(testimonial._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {editingTestimonial ? 'تعديل الرأي' : 'إضافة رأي جديد'}
                                    </h2>
                                    <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                        <FaTimes />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            الاسم
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            الصفة (طالب / خريج / ولي أمر)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            نص الرأي
                                        </label>
                                        <textarea
                                            required
                                            rows="4"
                                            value={formData.text}
                                            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                التقييم
                                            </label>
                                            <select
                                                value={formData.rating}
                                                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                                            >
                                                {[1, 2, 3, 4, 5].map(num => (
                                                    <option key={num} value={num}>{num} نجوم</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center pt-6">
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                                />
                                                <span className="mr-2 text-sm text-gray-700 dark:text-gray-300">نشط (يظهر في الموقع)</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            الصورة الشخصية
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            إلغاء
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'جاري الحفظ...' : (editingTestimonial ? 'تحديث' : 'حفظ')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default TestimonialsDashboard;
