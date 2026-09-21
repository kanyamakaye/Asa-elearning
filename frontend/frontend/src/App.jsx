import { Route, Routes } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import RequireRole from './components/RequireRole'
import DashboardLayout from './components/dashboard/DashboardLayout'
import MainLayout from './layouts/MainLayout'
import Contact from './pages/Contact'
import CourseDetail from './pages/CourseDetail'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import InstructorActivate from './pages/InstructorActivate'
import Learn from './pages/Learn'
import Login from './pages/Login'
import Register from './pages/Register'
import Verify2FA from './pages/Verify2FA'
import VerifyCertificate from './pages/VerifyCertificate'
import VerifyEmail from './pages/VerifyEmail'

import Assessments from './pages/dashboard/Assessments'
import BrowseCourses from './pages/dashboard/BrowseCourses'
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
import Transcript from './pages/dashboard/Transcript'
import UsersList from './pages/dashboard/UsersList'

import CreateCourse from './pages/instructor/courses/CreateCourse'
import ManageContent from './pages/instructor/courses/ManageContent'
import SubmoduleEditor from './pages/instructor/courses/SubmoduleEditor'
import CreateQuiz from './pages/instructor/quizzes/CreateQuiz'
import QuestionBanksList from './pages/instructor/quizzes/QuestionBanksList'
import CreateQuestionBank from './pages/instructor/quizzes/CreateQuestionBank'
import QuestionBankDetail from './pages/instructor/quizzes/QuestionBankDetail'
import BankQuestionEditor from './pages/instructor/quizzes/BankQuestionEditor'
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
import CreateExam from './pages/dashboard/CreateExam'
import ExamsList from './pages/dashboard/ExamsList'
import GradingQueue from './pages/instructor/GradingQueue'
import GroupsList from './pages/dashboard/GroupsList'
import CreateGroup from './pages/dashboard/CreateGroup'
import GroupDetail from './pages/dashboard/GroupDetail'
import CreateRubric from './pages/dashboard/CreateRubric'
import RubricsList from './pages/dashboard/RubricsList'
import ManageExamQuestions from './pages/dashboard/ManageExamQuestions'
import TakeExam from './pages/dashboard/TakeExam'

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
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-2fa" element={<Verify2FA />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/instructor/activate" element={<InstructorActivate />} />

      <Route element={<RequireAuth />}>
        {/* Full-screen, distraction-free lesson player — deliberately outside
            DashboardLayout's sidebar chrome. */}
        <Route path="/learn/:slug" element={<Learn />} />

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
          <Route path="browse-courses" element={<BrowseCourses />} />
          <Route path="transcript" element={<Transcript />} />
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
          <Route
            path="courses/:slug/content/modules/:moduleId/submodules/new"
            element={<RequireRole roles={CONTENT_ROLES}><SubmoduleEditor /></RequireRole>}
          />
          <Route
            path="courses/:slug/content/modules/:moduleId/submodules/:lessonId/edit"
            element={<RequireRole roles={CONTENT_ROLES}><SubmoduleEditor /></RequireRole>}
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

          <Route path="question-banks" element={<RequireRole roles={MANAGER_ROLES}><QuestionBanksList /></RequireRole>} />
          <Route
            path="question-banks/create"
            element={<RequireRole roles={MANAGER_ROLES}><CreateQuestionBank /></RequireRole>}
          />
          <Route
            path="question-banks/:id"
            element={<RequireRole roles={MANAGER_ROLES}><QuestionBankDetail /></RequireRole>}
          />
          <Route
            path="question-banks/:bankId/questions/new"
            element={<RequireRole roles={MANAGER_ROLES}><BankQuestionEditor /></RequireRole>}
          />
          <Route
            path="question-banks/:bankId/questions/:questionId/edit"
            element={<RequireRole roles={MANAGER_ROLES}><BankQuestionEditor /></RequireRole>}
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
          <Route path="exams/create" element={<RequireRole roles={MANAGER_ROLES}><CreateExam /></RequireRole>} />
          <Route
            path="exams/:id/questions"
            element={<RequireRole roles={MANAGER_ROLES}><ManageExamQuestions /></RequireRole>}
          />
          <Route path="exams/:id/take" element={<TakeExam />} />
          <Route path="grading" element={<RequireRole roles={MANAGER_ROLES}><GradingQueue /></RequireRole>} />
          <Route path="groups" element={<RequireRole roles={MANAGER_ROLES}><GroupsList /></RequireRole>} />
          <Route path="groups/create" element={<RequireRole roles={MANAGER_ROLES}><CreateGroup /></RequireRole>} />
          <Route path="groups/:id" element={<RequireRole roles={MANAGER_ROLES}><GroupDetail /></RequireRole>} />
          <Route path="rubrics" element={<RequireRole roles={MANAGER_ROLES}><RubricsList /></RequireRole>} />
          <Route path="rubrics/create" element={<RequireRole roles={MANAGER_ROLES}><CreateRubric /></RequireRole>} />
          <Route path="refunds" element={<RequireRole roles={['admin']}><RefundsList /></RequireRole>} />
          <Route path="audit-logs" element={<RequireRole roles={['admin']}><AuditLogsList /></RequireRole>} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
