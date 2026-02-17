
import React from 'react';

import mainImage from '../assets/image copy 2.png';
import icon1 from '../assets/image copy 3.png';
import icon2 from '../assets/image copy 4.png';
import icon3 from '../assets/image copy 5.png';

const FeaturesSection = () => {
    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300" dir="rtl">
            <div className="flex flex-col items-center justify-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-center text-primary mb-2">ما يميزنا</h1>
                <img src={icon1} alt="ما يميزنا" className="w-32 md:w-48 h-auto object-contain" />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Image Side */}
                    <div className="relative">
                        <div className="relative z-10">
                            <img
                                src={mainImage}
                                alt="Platform Overview"
                                className="w-full h-auto object-contain transition-transform duration-700"
                            />

                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative z-10">
                            <img
                                src={icon2}
                                alt="Platform Overview"
                                className="w-full h-auto object-contain transition-transform duration-700"
                            />

                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative z-10">
                            <img
                                src={icon3}
                                alt="Platform Overview"
                                className="w-full h-auto object-contain transition-transform duration-700"
                            />

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
