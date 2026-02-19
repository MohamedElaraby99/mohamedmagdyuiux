import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaStar, FaQuoteRight } from 'react-icons/fa';
import iconLine from '../assets/image copy 3.png';
import { getAllTestimonials } from '../Redux/Slices/TestimonialSlice';
import { generateImageUrl } from '../utils/fileUtils';

const TestimonialsSection = () => {
    const dispatch = useDispatch();
    const { testimonials, loading } = useSelector((state) => state.testimonial);

    useEffect(() => {
        dispatch(getAllTestimonials({ isActive: true }));
    }, [dispatch]);

    // Filter only active testimonials just in case, though backend should handle it
    const activeTestimonials = testimonials.filter(t => t.isActive);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FaStar
                key={i}
                className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <section className="py-20 bg-[#FDFDF5] dark:bg-gray-900 transition-colors duration-300" dir="rtl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex flex-col items-center justify-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2 text-center">
                        أراء طلابنا
                    </h2>
                    <img src={iconLine} alt="underline" className="w-32 md:w-48 h-auto object-contain" />
                </div>

                {/* Testimonials Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : activeTestimonials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activeTestimonials.map((testimonial) => (
                            <div
                                key={testimonial._id}
                                className="bg-[#f9f9f9] dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    {/* User Info (Right Side in RTL) */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
                                            {testimonial.image?.secure_url ? (
                                                <img
                                                    src={generateImageUrl(testimonial.image.secure_url)}
                                                    alt={testimonial.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <FaQuoteRight className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-primary">
                                                {testimonial.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {testimonial.role || 'Student'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Rating (Left Side in RTL) */}
                                    <div className="flex gap-1 text-primary">
                                        {renderStars(testimonial.rating)}
                                    </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg flex-grow">
                                    {testimonial.text}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                        لا يوجد اراء حاليا
                    </div>
                )}
            </div>
        </section>
    );
};

export default TestimonialsSection;
