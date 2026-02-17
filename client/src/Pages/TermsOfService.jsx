import React from "react";
import Layout from "../Layout/Layout";
import { FaShieldAlt, FaUserCheck, FaHandshake, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaVideo, FaBan } from "react-icons/fa";

export default function TermsOfService() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center mb-6 shadow-lg">
              <FaShieldAlt className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              شروط الخدمة
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              يرجى قراءة هذه الشروط بعناية قبل استخدام منصة فكرة التعليمية
            </p>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              آخر تحديث: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700" dir="rtl">
            <div className="prose prose-lg dark:prose-invert max-w-none">

              {/* Introduction */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaInfoCircle className="ml-3 text-primary" />
                  مقدمة
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  يرجى قراءة هذه الشروط بعناية قبل إنشاء حسابك. الموافقة عليها تعني التزامك الكامل بها لضمان سير العملية التعليمية بنجاح.
                </p>
              </section>

              {/* 1. Account & Data */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaUserCheck className="ml-3 text-primary" />
                  البيانات والحساب
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="font-bold text-primary ml-2 text-xl">1.</span>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">دقة البيانات</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        يجب التأكد من صحة البيانات المدخلة عند إنشاء الحساب، وتشمل الاسم الرباعي، رقم الواتساب الشخصي، لضمان التواصل الفعال.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <span className="font-bold text-primary ml-2 text-xl">2.</span>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">الحد المسموح للأجهزة</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        يسمح بفتح الحساب على جهازين فقط كحد أقصى. يرجى اختيار الجهازين بعناية، حيث لا يمكن الدخول إلى الحساب من أي جهاز آخر في حال تغييرهما، وذلك لضمان أمان المحتوى.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <span className="font-bold text-primary ml-2 text-xl">3.</span>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">أمان كلمة المرور</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        أنت مسؤول مسؤولية كاملة عن حفظ كلمة المرور الخاصة بك وعدم مشاركتها مع أي شخص آخر لضمان أمان حسابك.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Academic Commitment */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaHandshake className="ml-3 text-primary" />
                  الالتزام الأكاديمي والمتابعة
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="font-bold text-primary ml-2 text-xl">4.</span>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">الالتزام الدراسي</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        يجب الالتزام التام بمشاهدة الفيديوهات التعليمية، حل الواجبات، وأداء الامتحانات في المواعيد المحددة لضمان الاستفادة الكاملة من الدورة.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <span className="font-bold text-primary ml-2 text-xl">5.</span>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">تقارير ولي الأمر</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        سيتم إرسال تقارير دورية توضح المستوى الدراسي للطالب إلى ولي الأمر لمتابعة التقدم والأداء بشكل منتظم.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <span className="font-bold text-primary ml-2 text-xl">6.</span>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">سياسة عدم الالتزام</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        في حال عدم التزام الطالب بالواجبات ومتطلبات الدورة، سيتم إنهاء اشتراكه فوراً، ولن يتمكن من استكمال الدورة معنا.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Subscription & Refund */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaCheckCircle className="ml-3 text-primary" />
                  الاشتراك والاسترداد
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="font-bold text-primary ml-2 text-xl">7.</span>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">فترة الاشتراك</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        الاشتراك ساري حتى انتهاء امتحانات الدور الأول. يرجى العلم بأن قيمة الاشتراك غير قابلة للاسترداد نهائياً بعد الدفع.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Video Screening Policy (Kept as is) */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaVideo className="ml-3 text-red-600" />
                  سياسة حماية المحتوى
                </h2>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-l-4 border-red-500">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FaExclamationTriangle className="text-red-500 mt-1 ml-3 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                          تحذير: حقوق الملكية الفكرية
                        </h3>
                        <p className="text-red-700 dark:text-red-300">
                          يحظر تماماً تسجيل أو مشاركة أو نشر أي فيديو أو محتوى من منصتنا التعليمية.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-800">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">عقوبات انتهاك الملكية الفكرية:</h4>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <FaBan className="text-red-500 mt-1 ml-2 flex-shrink-0" />
                          <span>حذف الحساب فوراً والحظر الدائم من المنصة</span>
                        </li>
                        <li className="flex items-start">
                          <FaBan className="text-red-500 mt-1 ml-2 flex-shrink-0" />
                          <span>اتخاذ كافة الإجراءات القانونية اللازمة</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>


              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
                <p className="text-lg font-bold text-gray-800 dark:text-gray-200 text-center">
                  أوافق على جميع الشروط والأحكام المذكورة أعلاه وأتعهد بالالتزام بها كاملة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 