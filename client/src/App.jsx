import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import useScrollToTop from "./Helpers/useScrollToTop";
import DeviceProtection from "./Components/DeviceProtection";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoadingSpinner from "./Components/LoadingSpinner";

// Critical pages - load immediately
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";

// Lazy load all other pages for faster initial load
const AboutUs = lazy(() => import("./Pages/About"));
const NotFound = lazy(() => import("./Pages/NotFound"));
const ChangePassword = lazy(() => import("./Pages/Password/ChangePassword"));
const ForgotPassword = lazy(() => import("./Pages/Password/ForgotPassword"));
const ResetPassword = lazy(() => import("./Pages/Password/ResetPassword"));
const Contact = lazy(() => import("./Pages/Contact"));
const Denied = lazy(() => import("./Pages/Denied"));
const BlogList = lazy(() => import("./Pages/Blog/BlogList"));
const BlogDetail = lazy(() => import("./Pages/Blog/BlogDetail"));
const BlogDashboard = lazy(() => import("./Pages/Dashboard/BlogDashboard"));
const QAList = lazy(() => import("./Pages/QA/QAList"));
const QADetail = lazy(() => import("./Pages/QA/QADetail"));
const QADashboard = lazy(() => import("./Pages/Dashboard/QADashboard"));
const QACreate = lazy(() => import("./Pages/QA/QACreate"));
const QAEdit = lazy(() => import("./Pages/QA/QAEdit"));
const QAPendingQuestions = lazy(() => import("./Pages/QA/QAPendingQuestions"));
const SubjectList = lazy(() => import("./Pages/Subjects/SubjectList"));
const SubjectDashboard = lazy(() => import("./Pages/Dashboard/SubjectDashboard"));
const TermsOfService = lazy(() => import("./Pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./Pages/PrivacyPolicy"));
const Wallet = lazy(() => import("./Pages/Wallet/Wallet"));
const AdminRechargeCodeDashboard = lazy(() => import("./Pages/Dashboard/AdminRechargeCodeDashboard"));
const AdminUserDashboard = lazy(() => import("./Pages/Dashboard/AdminUserDashboard"));
const WhatsAppServiceDashboard = lazy(() => import("./Pages/Dashboard/WhatsAppServiceDashboard"));
const WhatsAppServices = lazy(() => import("./Pages/WhatsAppServices/WhatsAppServices"));
const InstructorDashboard = lazy(() => import("./Pages/Dashboard/InstructorDashboard"));

const Instructors = lazy(() => import("./Pages/Instructors"));
const InstructorDetail = lazy(() => import("./Pages/InstructorDetail"));
const CourseContentManager = lazy(() => import('./Pages/Dashboard/CourseContentManager'));
const CoursesPage = lazy(() => import('./Pages/Courses/CoursesPage'));
const CourseDetail = lazy(() => import('./Pages/Courses/CourseDetail'));
const Profile = lazy(() => import("./Pages/User/Profile"));
const AdminDashboard = lazy(() => import("./Pages/Dashboard/AdminDashboard"));
const CourseDashboard = lazy(() => import("./Pages/Dashboard/CourseDashboard"));
const UserProgressDashboard = lazy(() => import("./Pages/Dashboard/UserProgressDashboard"));
const DeviceManagementDashboard = lazy(() => import("./Pages/Dashboard/DeviceManagementDashboard"));
const LiveMeetingDashboard = lazy(() => import("./Pages/Dashboard/LiveMeetingDashboard"));
const ExamResultsDashboard = lazy(() => import("./Pages/Dashboard/ExamResultsDashboard"));
const CourseExamsDashboard = lazy(() => import("./Pages/Dashboard/CourseExamsDashboard"));
const LiveMeetings = lazy(() => import("./Pages/User/LiveMeetings"));
const ExamHistory = lazy(() => import("./Pages/User/ExamHistory"));
const AdminCourseAccessCodes = lazy(() => import("./Pages/Dashboard/AdminCourseAccessCodes"));
const EssayExamDashboard = lazy(() => import("./Pages/Dashboard/EssayExamDashboard"));
const AttendanceDashboard = lazy(() => import("./Pages/Dashboard/AttendanceDashboard"));
const CenterManagementDashboard = lazy(() => import("./Pages/Dashboard/CenterManagementDashboard"));
const Overview = lazy(() => import("./Pages/Dashboard/CenterManagement/Overview"));
const Attendance = lazy(() => import("./Pages/Dashboard/CenterManagement/Attendance"));
const Groups = lazy(() => import("./Pages/Dashboard/CenterManagement/Groups"));
const Students = lazy(() => import("./Pages/Dashboard/CenterManagement/Students"));
const Financial = lazy(() => import("./Pages/Dashboard/CenterManagement/Financial"));
const OfflineGradesDashboard = lazy(() => import("./Pages/Dashboard/OfflineGradesDashboard"));
const Achievements = lazy(() => import("./Pages/Dashboard/Achievements"));

// Auth components - load immediately as they're needed for routing
import RequireAuth from "./Components/auth/RequireAuth";
import RedirectIfAuthenticated from "./Components/auth/RedirectIfAuthenticated";

// Page loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
    </div>
  </div>
);

// Inner component that uses authentication context
function AppContent() {
  const { isInitialized } = useAuth();

  // Auto scroll to top on route change - must be called before any conditional returns (Rules of Hooks)
  useScrollToTop();

  // Show loading spinner while authentication is being initialized
  if (!isInitialized) {
    return <LoadingSpinner message="جاري تهيئة النظام..." />;
  }

  return (
    <DeviceProtection>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/denied" element={<Denied />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/whatsapp-services" element={<WhatsAppServices />} />
          <Route path="/instructors" element={<Instructors />} />
          <Route path="/instructors/:id" element={<InstructorDetail />} />

          <Route path="/signup" element={<RedirectIfAuthenticated><Signup /></RedirectIfAuthenticated>} />
          <Route path="/login" element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} />
          <Route
            path="/user/profile/reset-password"
            element={<RedirectIfAuthenticated><ForgotPassword /></RedirectIfAuthenticated>}
          />
          <Route
            path="/user/profile/reset-password/:resetToken"
            element={<RedirectIfAuthenticated><ResetPassword /></RedirectIfAuthenticated>}
          />

          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/qa" element={<QAList />} />
          <Route path="/qa/create" element={<QACreate />} />
          <Route path="/qa/edit/:id" element={<QAEdit />} />
          <Route path="/qa/:id" element={<QADetail />} />
          <Route path="/subjects" element={<SubjectList />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetail />} />

          <Route element={<RequireAuth allowedRoles={["ADMIN", "SUPER_ADMIN"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/recharge-codes" element={<AdminRechargeCodeDashboard />} />
            <Route path="/admin/users" element={<AdminUserDashboard />} />
            <Route path="/admin/instructors" element={<InstructorDashboard />} />

            <Route path="/admin/whatsapp-services" element={<WhatsAppServiceDashboard />} />
            <Route path="/admin/course-content" element={<CourseContentManager />} />
            <Route path="/admin/course-dashboard" element={<CourseDashboard />} />
            <Route path="/admin/blog-dashboard" element={<BlogDashboard />} />
            <Route path="/admin/qa-dashboard" element={<QADashboard />} />
            <Route path="/admin/qa-pending" element={<QAPendingQuestions />} />
            <Route path="/admin/subject-dashboard" element={<SubjectDashboard />} />
            <Route path="/admin/user-progress" element={<UserProgressDashboard />} />
            <Route path="/admin/device-management" element={<DeviceManagementDashboard />} />
            <Route path="/admin/live-meetings" element={<LiveMeetingDashboard />} />
            <Route path="/admin/exam-results" element={<ExamResultsDashboard />} />
            <Route path="/admin/exam-search" element={<ExamResultsDashboard />} />
            <Route path="/admin/course-exams" element={<CourseExamsDashboard />} />
            <Route path="/admin/essay-exams" element={<EssayExamDashboard />} />
            <Route path="/admin/course-access-codes" element={<AdminCourseAccessCodes />} />
            <Route path="/admin/attendance" element={<AttendanceDashboard />} />
            <Route path="/admin/center-management" element={<CenterManagementDashboard />} />
            <Route path="/admin/center-management/overview" element={<Overview />} />
            <Route path="/admin/center-management/attendance" element={<Attendance />} />
            <Route path="/admin/center-management/groups" element={<Groups />} />
            <Route path="/admin/center-management/students" element={<Students />} />
            <Route path="/admin/center-management/financial" element={<Financial />} />
            <Route path="/admin/center-management/offline-grades" element={<OfflineGradesDashboard />} />
            <Route path="/admin/center-management/achievements" element={<Achievements />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={["USER", "ADMIN", "SUPER_ADMIN"]} />}>
            <Route path="/user/profile" element={<Profile />} />
            <Route
              path="/user/profile/change-password"
              element={<ChangePassword />}
            />
            <Route path="/live-meetings" element={<LiveMeetings />} />
            <Route path="/exam-history" element={<ExamHistory />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </DeviceProtection>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
