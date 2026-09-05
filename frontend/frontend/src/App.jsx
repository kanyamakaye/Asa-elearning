import { Route, Routes } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import RequireRole from './components/RequireRole'
import DashboardLayout from './components/dashboard/DashboardLayout'
import MainLayout from './layouts/MainLayout'
import Contact from './pages/Contact'
import CourseDetail from './pages/CourseDetail'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyCertificate from './pages/VerifyCertificate'

import Assessments from './pages/dashboard/Assessments'
import CategoriesList from './pages/dashboard/CategoriesList'
import CertificatesList from './pages/dashboard/CertificatesList'
import ComingSoon from './pages/dashboard/ComingSoon'
import CoursesList from './pages/dashboard/CoursesList'
import DashboardIndex from './pages/dashboard/DashboardIndex'
import EnrollmentsList from './pages/dashboard/EnrollmentsList'
import FAQsList from './pages/dashboard/FAQsList'
import Grades from './pages/dashboard/Grades'
import MyCourses from './pages/dashboard/MyCourses'
import NotificationsList from './pages/dashboard/NotificationsList'
import PaymentsList from './pages/dashboard/PaymentsList'
import Profile from './pages/dashboard/Profile'
import Settings from './pages/dashboard/Settings'
import TicketsList from './pages/dashboard/TicketsList'
import UsersList from './pages/dashboard/UsersList'

import CreateCourse from './pages/instructor/courses/CreateCourse'
import ManageContent from './pages/instructor/courses/ManageContent'
import CreateQuiz from './pages/instructor/quizzes/CreateQuiz'
import CreateAssignment from './pages/instructor/assignments/CreateAssignment'
import AssignmentSubmissions from './pages/instructor/assignments/AssignmentSubmissions'
import ScheduleLiveClass from './pages/instructor/live-classes/ScheduleLiveClass'

import QuizzesList from './pages/dashboard/QuizzesList'
import AssignmentsList from './pages/dashboard/AssignmentsList'
import LiveClassesList from './pages/dashboard/LiveClassesList'
import AnnouncementsList from './pages/dashboard/AnnouncementsList'
import MessagesInbox from './pages/dashboard/MessagesInbox'
import DiscussionsList from './pages/dashboard/DiscussionsList'
import RefundsList from './pages/dashboard/RefundsList'
import AuditLogsList from './pages/dashboard/AuditLogsList'
import ExamsList from './pages/dashboard/ExamsList'

const MANAGER_ROLES = ['admin', 'academic_manager', 'instructor']
// Content Managers manage modules/lessons on any course, but don't create
// courses/quizzes/assignments/live classes themselves (see course.md's role matrix).
const CONTENT_ROLES = [...MANAGER_ROLES, 'content_manager']

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/verify-certificate" element={<VerifyCertificate />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardIndex />} />
          <Route path="users" element={<UsersList />} />
          <Route path="courses" element={<CoursesList />} />
          <Route path="categories" element={<CategoriesList />} />
          <Route path="enrollments" element={<EnrollmentsList />} />
          <Route path="certificates" element={<CertificatesList />} />
          <Route path="payments" element={<PaymentsList />} />
          <Route path="tickets" element={<TicketsList />} />
          <Route path="faqs" element={<FAQsList />} />
          <Route path="notifications" element={<NotificationsList />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="grades" element={<Grades />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="coming-soon" element={<ComingSoon />} />

          <Route
            path="courses/create"
            element={<RequireRole roles={MANAGER_ROLES}><CreateCourse /></RequireRole>}
          />
          <Route
            path="courses/:slug/edit"
            element={<RequireRole roles={MANAGER_ROLES}><CreateCourse /></RequireRole>}
          />
          <Route
            path="courses/:slug/content"
            element={<RequireRole roles={CONTENT_ROLES}><ManageContent /></RequireRole>}
          />

          <Route path="quizzes" element={<RequireRole roles={MANAGER_ROLES}><QuizzesList /></RequireRole>} />
          <Route
            path="quizzes/create"
            element={<RequireRole roles={MANAGER_ROLES}><CreateQuiz /></RequireRole>}
          />
          <Route
            path="quizzes/:id/edit"
            element={<RequireRole roles={MANAGER_ROLES}><CreateQuiz /></RequireRole>}
          />

          <Route path="assignments" element={<RequireRole roles={MANAGER_ROLES}><AssignmentsList /></RequireRole>} />
          <Route
            path="assignments/create"
            element={<RequireRole roles={MANAGER_ROLES}><CreateAssignment /></RequireRole>}
          />
          <Route
            path="assignments/:id/edit"
            element={<RequireRole roles={MANAGER_ROLES}><CreateAssignment /></RequireRole>}
          />
          <Route
            path="assignments/:id/submissions"
            element={<RequireRole roles={MANAGER_ROLES}><AssignmentSubmissions /></RequireRole>}
          />

          <Route path="live-classes" element={<LiveClassesList />} />
          <Route
            path="live-classes/create"
            element={<RequireRole roles={MANAGER_ROLES}><ScheduleLiveClass /></RequireRole>}
          />
          <Route
            path="live-classes/:id/edit"
            element={<RequireRole roles={MANAGER_ROLES}><ScheduleLiveClass /></RequireRole>}
          />

          <Route path="announcements" element={<AnnouncementsList />} />
          <Route path="messages" element={<MessagesInbox />} />
          <Route path="discussions" element={<DiscussionsList />} />
          <Route path="exams" element={<ExamsList />} />
          <Route path="refunds" element={<RequireRole roles={['admin']}><RefundsList /></RequireRole>} />
          <Route path="audit-logs" element={<RequireRole roles={['admin']}><AuditLogsList /></RequireRole>} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
