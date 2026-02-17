
import React from 'react';
import { FaStar } from 'react-icons/fa';
import iconLine from '../assets/image copy 3.png';

const TestimonialsSection = () => {
    const testimonials = [
        {
            id: 1,
            name: "أحمد",
            image: "https://randomuser.me/api/portraits/men/32.jpg",
            rating: 5,
            text: "الكورس كان تجربة حقيقية مش مجرد فيديوهات. التطبيق العملي فرق جدا معايا. حسيت لأول مرة إني فاهم المجال بجد وابتديت أشوف التصميم بشكل مختلف."
        },
        {
            id: 2,
            name: "أحمد",
            image: "https://randomuser.me/api/portraits/men/44.jpg",
            rating: 5,
            text: "الكورس كان تجربة حقيقية مش مجرد فيديوهات. التطبيق العملي فرق جدا معايا. حسيت لأول مرة إني فاهم المجال بجد وابتديت أشوف التصميم بشكل مختلف."
        },
        {
            id: 3,
            name: "أحمد",
            image: "https://randomuser.me/api/portraits/men/86.jpg",
            rating: 4,
            text: "الكورس كان تجربة حقيقية مش مجرد فيديوهات. التطبيق العملي فرق جدا معايا. حسيت لأول مرة إني فاهم المجال بجد وابتديت أشوف التصميم بشكل مختلف."
        },
        {
            id: 4,
            name: "أحمد",
            image: "https://randomuser.me/api/portraits/men/11.jpg",
            rating: 5,
            text: "الكورس كان تجربة حقيقية مش مجرد فيديوهات. التطبيق العملي فرق جدا معايا. حسيت لأول مرة إني فاهم المجال بجد وابتديت أشوف التصميم بشكل مختلف."
        },
        {
            id: 5,
            name: "أحمد",
            image: "https://randomuser.me/api/portraits/men/64.jpg",
            rating: 5,
            text: "الكورس كان تجربة حقيقية مش مجرد فيديوهات. التطبيق العملي فرق جدا معايا. حسيت لأول مرة إني فاهم المجال بجد وابتديت أشوف التصميم بشكل مختلف."
        },
        {
            id: 6,
            name: "أحمد",
            image: "https://randomuser.me/api/portraits/men/22.jpg",
            rating: 5,
            text: "الكورس كان تجربة حقيقية مش مجرد فيديوهات. التطبيق العملي فرق جدا معايا. حسيت لأول مرة إني فاهم المجال بجد وابتديت أشوف التصميم بشكل مختلف."
        }
    ];

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-[#f9f9f9] dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                            <div className="flex items-center justify-between mb-6">
                                {/* User Info (Right Side in RTL) */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20">
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary">
                                        {testimonial.name}
                                    </h3>
                                </div>

                                {/* Rating (Left Side in RTL) */}
                                <div className="flex gap-1 text-primary">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={`w-5 h-5 ${i < testimonial.rating ? 'fill-current' : 'text-gray-300'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                                {testimonial.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
