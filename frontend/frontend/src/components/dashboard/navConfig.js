import {
  IconAward,
  IconBell,
  IconBook,
  IconChat,
  IconClipboard,
  IconCreditCard,
  IconFileText,
  IconHome,
  IconLifeBuoy,
  IconSearch,
  IconSettings,
  IconShield,
  IconTrendingUp,
  IconUsers,
} from '../icons'

// `id` is a stable identity (React key, open-submenu tracking) independent
// of `labelKey` — Sidebar.jsx resolves labelKey via t('dashboardChrome.nav.*')
// at render time, so the identity used for state/keys never changes when
// the active language does.
const DASHBOARD = { id: 'dashboard', labelKey: 'dashboard', to: '/dashboard', icon: IconHome, end: true }
const PROFILE = { id: 'profile', labelKey: 'profile', to: '/dashboard/profile', icon: IconUsers }
const SETTINGS = { id: 'settings', labelKey: 'settings', to: '/dashboard/settings', icon: IconSettings }

// A nav entry is either a leaf link ({ id, labelKey, to, icon, end? }) or a
// collapsible submenu ({ id, labelKey, icon, children: [leaf, ...] }).
export const NAV_BY_ROLE = {
  admin: [
    DASHBOARD,
    {
      id: 'users', labelKey: 'users', icon: IconUsers,
      children: [
        { id: 'allUsers', labelKey: 'allUsers', to: '/dashboard/users', icon: IconUsers },
        { id: 'students', labelKey: 'students', to: '/dashboard/users?role=student', icon: IconUsers },
        { id: 'instructors', labelKey: 'instructors', to: '/dashboard/users?role=instructor', icon: IconUsers },
        { id: 'staff', labelKey: 'staff', to: '/dashboard/users?role=academic_manager,content_manager,support_staff,admin', icon: IconShield },
      ],
    },
    {
      id: 'courses', labelKey: 'courses', icon: IconBook,
      children: [
        { id: 'allCourses', labelKey: 'allCourses', to: '/dashboard/courses', icon: IconBook },
        { id: 'createCourse', labelKey: 'createCourse', to: '/dashboard/courses/create', icon: IconBook },
        { id: 'categories', labelKey: 'categories', to: '/dashboard/categories', icon: IconClipboard },
        { id: 'modulesLessons', labelKey: 'modulesLessons', to: '/dashboard/courses', icon: IconClipboard },
      ],
    },
    { id: 'enrollments', labelKey: 'enrollments', to: '/dashboard/enrollments', icon: IconClipboard },
    { id: 'groups', labelKey: 'groups', to: '/dashboard/groups', icon: IconUsers },
    {
      id: 'assessments', labelKey: 'assessments', icon: IconFileText,
      children: [
        { id: 'quizzes', labelKey: 'quizzes', to: '/dashboard/quizzes', icon: IconFileText },
        { id: 'createQuiz', labelKey: 'createQuiz', to: '/dashboard/quizzes/create', icon: IconFileText },
        { id: 'questionBanks', labelKey: 'questionBanks', to: '/dashboard/question-banks', icon: IconFileText },
        { id: 'assignments', labelKey: 'assignments', to: '/dashboard/assignments', icon: IconFileText },
        { id: 'createAssignment', labelKey: 'createAssignment', to: '/dashboard/assignments/create', icon: IconFileText },
        { id: 'exams', labelKey: 'exams', to: '/dashboard/exams', icon: IconFileText },
        { id: 'rubrics', labelKey: 'rubrics', to: '/dashboard/rubrics', icon: IconFileText },
        { id: 'gradingQueue', labelKey: 'gradingQueue', to: '/dashboard/grading', icon: IconFileText },
      ],
    },
    { id: 'certificates', labelKey: 'certificates', to: '/dashboard/certificates', icon: IconAward },
    {
      id: 'payments', labelKey: 'payments', icon: IconCreditCard,
      children: [
        { id: 'transactions', labelKey: 'transactions', to: '/dashboard/payments', icon: IconCreditCard },
        { id: 'refunds', labelKey: 'refunds', to: '/dashboard/refunds', icon: IconCreditCard },
      ],
    },
    {
      id: 'communication', labelKey: 'communication', icon: IconChat,
      children: [
        { id: 'announcements', labelKey: 'announcements', to: '/dashboard/announcements', icon: IconBell },
        { id: 'notifications', labelKey: 'notifications', to: '/dashboard/notifications', icon: IconBell },
        { id: 'messages', labelKey: 'messages', to: '/dashboard/messages', icon: IconChat },
        { id: 'discussions', labelKey: 'discussions', to: '/dashboard/discussions', icon: IconChat },
      ],
    },
    {
      id: 'liveClasses', labelKey: 'liveClasses', icon: IconTrendingUp,
      children: [
        { id: 'allLiveClasses', labelKey: 'allLiveClasses', to: '/dashboard/live-classes', icon: IconTrendingUp },
        { id: 'scheduleLiveClass', labelKey: 'scheduleLiveClass', to: '/dashboard/live-classes/create', icon: IconTrendingUp },
      ],
    },
    {
      id: 'support', labelKey: 'support', icon: IconLifeBuoy,
      children: [
        { id: 'tickets', labelKey: 'tickets', to: '/dashboard/tickets', icon: IconLifeBuoy },
        { id: 'faqs', labelKey: 'faqs', to: '/dashboard/faqs', icon: IconLifeBuoy },
      ],
    },
    { id: 'auditLogs', labelKey: 'auditLogs', to: '/dashboard/audit-logs', icon: IconShield },
    { id: 'systemSettings', labelKey: 'systemSettings', to: '/dashboard/coming-soon?label=System%20Settings', icon: IconSettings },
    PROFILE,
    SETTINGS,
  ],

  academic_manager: [
    DASHBOARD,
    {
      id: 'academics', labelKey: 'academics', icon: IconBook,
      children: [
        { id: 'courses', labelKey: 'courses', to: '/dashboard/courses', icon: IconBook },
        { id: 'enrollments', labelKey: 'enrollments', to: '/dashboard/enrollments', icon: IconClipboard },
        { id: 'groups', labelKey: 'groups', to: '/dashboard/groups', icon: IconUsers },
        { id: 'students', labelKey: 'students', to: '/dashboard/users?role=student', icon: IconUsers },
        { id: 'instructors', labelKey: 'instructors', to: '/dashboard/users?role=instructor', icon: IconUsers },
        { id: 'certificates', labelKey: 'certificates', to: '/dashboard/certificates', icon: IconAward },
      ],
    },
    {
      id: 'assessments', labelKey: 'assessments', icon: IconFileText,
      children: [
        { id: 'quizzes', labelKey: 'quizzes', to: '/dashboard/quizzes', icon: IconFileText },
        { id: 'questionBanks', labelKey: 'questionBanks', to: '/dashboard/question-banks', icon: IconFileText },
        { id: 'assignments', labelKey: 'assignments', to: '/dashboard/assignments', icon: IconFileText },
        { id: 'exams', labelKey: 'exams', to: '/dashboard/exams', icon: IconFileText },
        { id: 'rubrics', labelKey: 'rubrics', to: '/dashboard/rubrics', icon: IconFileText },
        { id: 'gradingQueue', labelKey: 'gradingQueue', to: '/dashboard/grading', icon: IconFileText },
      ],
    },
    { id: 'liveClasses', labelKey: 'liveClasses', to: '/dashboard/live-classes', icon: IconTrendingUp },
    PROFILE,
    SETTINGS,
  ],

  instructor: [
    DASHBOARD,
    {
      id: 'myCourses', labelKey: 'myCourses', icon: IconBook,
      children: [
        { id: 'allCourses', labelKey: 'allCourses', to: '/dashboard/courses', icon: IconBook },
        { id: 'createCourse', labelKey: 'createCourse', to: '/dashboard/courses/create', icon: IconBook },
        { id: 'contentModulesLessons', labelKey: 'contentModulesLessons', to: '/dashboard/courses', icon: IconClipboard },
      ],
    },
    {
      id: 'assessments', labelKey: 'assessments', icon: IconFileText,
      children: [
        { id: 'quizzes', labelKey: 'quizzes', to: '/dashboard/quizzes', icon: IconFileText },
        { id: 'questionBanks', labelKey: 'questionBanks', to: '/dashboard/question-banks', icon: IconFileText },
        { id: 'assignments', labelKey: 'assignments', to: '/dashboard/assignments', icon: IconFileText },
        { id: 'examsGrades', labelKey: 'examsGrades', to: '/dashboard/exams', icon: IconFileText },
        { id: 'rubrics', labelKey: 'rubrics', to: '/dashboard/rubrics', icon: IconFileText },
        { id: 'gradingQueue', labelKey: 'gradingQueue', to: '/dashboard/grading', icon: IconFileText },
      ],
    },
    {
      id: 'students', labelKey: 'students', icon: IconUsers,
      children: [
        { id: 'enrolledStudents', labelKey: 'enrolledStudents', to: '/dashboard/enrollments', icon: IconUsers },
        { id: 'groups', labelKey: 'groups', to: '/dashboard/groups', icon: IconUsers },
      ],
    },
    {
      id: 'communication', labelKey: 'communication', icon: IconChat,
      children: [
        { id: 'discussions', labelKey: 'discussions', to: '/dashboard/discussions', icon: IconChat },
        { id: 'messages', labelKey: 'messages', to: '/dashboard/messages', icon: IconChat },
        { id: 'announcements', labelKey: 'announcements', to: '/dashboard/announcements', icon: IconBell },
      ],
    },
    { id: 'liveClasses', labelKey: 'liveClasses', to: '/dashboard/live-classes', icon: IconTrendingUp },
    PROFILE,
    SETTINGS,
  ],

  student: [
    DASHBOARD,
    {
      id: 'learning', labelKey: 'learning', icon: IconBook,
      children: [
        { id: 'browseCourses', labelKey: 'browseCourses', to: '/dashboard/browse-courses', icon: IconSearch },
        { id: 'myCourses', labelKey: 'myCourses', to: '/dashboard/my-courses', icon: IconBook },
        { id: 'assessments', labelKey: 'assessments', to: '/dashboard/assessments', icon: IconClipboard },
        { id: 'grades', labelKey: 'grades', to: '/dashboard/grades', icon: IconTrendingUp },
        { id: 'transcript', labelKey: 'transcript', to: '/dashboard/transcript', icon: IconFileText },
        { id: 'certificates', labelKey: 'certificates', to: '/dashboard/certificates', icon: IconAward },
      ],
    },
    {
      id: 'communication', labelKey: 'communication', icon: IconChat,
      children: [
        { id: 'notifications', labelKey: 'notifications', to: '/dashboard/notifications', icon: IconBell },
        { id: 'messages', labelKey: 'messages', to: '/dashboard/messages', icon: IconChat },
        { id: 'discussions', labelKey: 'discussions', to: '/dashboard/discussions', icon: IconChat },
      ],
    },
    { id: 'liveClasses', labelKey: 'liveClasses', to: '/dashboard/live-classes', icon: IconTrendingUp },
    PROFILE,
    SETTINGS,
  ],

  content_manager: [
    DASHBOARD,
    {
      id: 'content', labelKey: 'content', icon: IconBook,
      children: [
        { id: 'courses', labelKey: 'courses', to: '/dashboard/courses', icon: IconBook },
        { id: 'categories', labelKey: 'categories', to: '/dashboard/categories', icon: IconClipboard },
        { id: 'modulesLessons', labelKey: 'modulesLessons', to: '/dashboard/courses', icon: IconClipboard },
      ],
    },
    PROFILE,
    SETTINGS,
  ],

  support_staff: [
    DASHBOARD,
    {
      id: 'support', labelKey: 'support', icon: IconLifeBuoy,
      children: [
        { id: 'tickets', labelKey: 'tickets', to: '/dashboard/tickets', icon: IconLifeBuoy },
        { id: 'faqs', labelKey: 'faqs', to: '/dashboard/faqs', icon: IconLifeBuoy },
      ],
    },
    PROFILE,
    SETTINGS,
  ],
}

export const ROLE_LABEL_KEYS = {
  admin: 'roleAdmin',
  academic_manager: 'roleAcademicManager',
  instructor: 'roleInstructor',
  student: 'roleStudent',
  content_manager: 'roleContentManager',
  support_staff: 'roleSupportStaff',
}

// Kept for any code that still wants a plain English label outside of a
// React render (t() needs LanguageContext, which isn't always in scope) —
// Sidebar/Topbar use ROLE_LABEL_KEYS + t() instead.
export const ROLE_LABELS = {
  admin: 'Administrator',
  academic_manager: 'Academic Manager',
  instructor: 'Instructor',
  student: 'Student',
  content_manager: 'Content Manager',
  support_staff: 'Support Staff',
}
