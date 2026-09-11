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

const DASHBOARD = { label: 'Dashboard', to: '/dashboard', icon: IconHome, end: true }
const PROFILE = { label: 'Profile', to: '/dashboard/profile', icon: IconUsers }
const SETTINGS = { label: 'Settings', to: '/dashboard/settings', icon: IconSettings }

// A nav entry is either a leaf link ({ label, to, icon, end? }) or a
// collapsible submenu ({ label, icon, children: [leaf, ...] }).
export const NAV_BY_ROLE = {
  admin: [
    DASHBOARD,
    {
      label: 'Users',
      icon: IconUsers,
      children: [
        { label: 'All Users', to: '/dashboard/users', icon: IconUsers },
        { label: 'Students', to: '/dashboard/users?role=student', icon: IconUsers },
        { label: 'Instructors', to: '/dashboard/users?role=instructor', icon: IconUsers },
        { label: 'Staff', to: '/dashboard/users?role=academic_manager,content_manager,support_staff,admin', icon: IconShield },
      ],
    },
    {
      label: 'Courses',
      icon: IconBook,
      children: [
        { label: 'All Courses', to: '/dashboard/courses', icon: IconBook },
        { label: 'Create Course', to: '/dashboard/courses/create', icon: IconBook },
        { label: 'Categories', to: '/dashboard/categories', icon: IconClipboard },
        { label: 'Modules & Lessons', to: '/dashboard/courses', icon: IconClipboard },
      ],
    },
    { label: 'Enrollments', to: '/dashboard/enrollments', icon: IconClipboard },
    { label: 'Groups', to: '/dashboard/groups', icon: IconUsers },
    {
      label: 'Assessments',
      icon: IconFileText,
      children: [
        { label: 'Quizzes', to: '/dashboard/quizzes', icon: IconFileText },
        { label: 'Create Quiz', to: '/dashboard/quizzes/create', icon: IconFileText },
        { label: 'Question Banks', to: '/dashboard/question-banks', icon: IconFileText },
        { label: 'Assignments', to: '/dashboard/assignments', icon: IconFileText },
        { label: 'Create Assignment', to: '/dashboard/assignments/create', icon: IconFileText },
        { label: 'Exams', to: '/dashboard/exams', icon: IconFileText },
        { label: 'Rubrics', to: '/dashboard/rubrics', icon: IconFileText },
        { label: 'Grading Queue', to: '/dashboard/grading', icon: IconFileText },
      ],
    },
    { label: 'Certificates', to: '/dashboard/certificates', icon: IconAward },
    {
      label: 'Payments',
      icon: IconCreditCard,
      children: [
        { label: 'Transactions', to: '/dashboard/payments', icon: IconCreditCard },
        { label: 'Refunds', to: '/dashboard/refunds', icon: IconCreditCard },
      ],
    },
    {
      label: 'Communication',
      icon: IconChat,
      children: [
        { label: 'Announcements', to: '/dashboard/announcements', icon: IconBell },
        { label: 'Notifications', to: '/dashboard/notifications', icon: IconBell },
        { label: 'Messages', to: '/dashboard/messages', icon: IconChat },
        { label: 'Discussions', to: '/dashboard/discussions', icon: IconChat },
      ],
    },
    {
      label: 'Live Classes',
      icon: IconTrendingUp,
      children: [
        { label: 'All Live Classes', to: '/dashboard/live-classes', icon: IconTrendingUp },
        { label: 'Schedule Live Class', to: '/dashboard/live-classes/create', icon: IconTrendingUp },
      ],
    },
    {
      label: 'Support',
      icon: IconLifeBuoy,
      children: [
        { label: 'Tickets', to: '/dashboard/tickets', icon: IconLifeBuoy },
        { label: 'FAQs', to: '/dashboard/faqs', icon: IconLifeBuoy },
      ],
    },
    { label: 'Audit Logs', to: '/dashboard/audit-logs', icon: IconShield },
    { label: 'System Settings', to: '/dashboard/coming-soon?label=System%20Settings', icon: IconSettings },
    PROFILE,
    SETTINGS,
  ],

  academic_manager: [
    DASHBOARD,
    {
      label: 'Academics',
      icon: IconBook,
      children: [
        { label: 'Courses', to: '/dashboard/courses', icon: IconBook },
        { label: 'Enrollments', to: '/dashboard/enrollments', icon: IconClipboard },
        { label: 'Groups', to: '/dashboard/groups', icon: IconUsers },
        { label: 'Students', to: '/dashboard/users?role=student', icon: IconUsers },
        { label: 'Instructors', to: '/dashboard/users?role=instructor', icon: IconUsers },
        { label: 'Certificates', to: '/dashboard/certificates', icon: IconAward },
      ],
    },
    {
      label: 'Assessments',
      icon: IconFileText,
      children: [
        { label: 'Quizzes', to: '/dashboard/quizzes', icon: IconFileText },
        { label: 'Question Banks', to: '/dashboard/question-banks', icon: IconFileText },
        { label: 'Assignments', to: '/dashboard/assignments', icon: IconFileText },
        { label: 'Exams', to: '/dashboard/exams', icon: IconFileText },
        { label: 'Rubrics', to: '/dashboard/rubrics', icon: IconFileText },
        { label: 'Grading Queue', to: '/dashboard/grading', icon: IconFileText },
      ],
    },
    { label: 'Live Classes', to: '/dashboard/live-classes', icon: IconTrendingUp },
    PROFILE,
    SETTINGS,
  ],

  instructor: [
    DASHBOARD,
    {
      label: 'My Courses',
      icon: IconBook,
      children: [
        { label: 'All Courses', to: '/dashboard/courses', icon: IconBook },
        { label: 'Create Course', to: '/dashboard/courses/create', icon: IconBook },
        { label: 'Content, Modules & Lessons', to: '/dashboard/courses', icon: IconClipboard },
      ],
    },
    {
      label: 'Assessments',
      icon: IconFileText,
      children: [
        { label: 'Quizzes', to: '/dashboard/quizzes', icon: IconFileText },
        { label: 'Question Banks', to: '/dashboard/question-banks', icon: IconFileText },
        { label: 'Assignments', to: '/dashboard/assignments', icon: IconFileText },
        { label: 'Exams & Grades', to: '/dashboard/exams', icon: IconFileText },
        { label: 'Rubrics', to: '/dashboard/rubrics', icon: IconFileText },
        { label: 'Grading Queue', to: '/dashboard/grading', icon: IconFileText },
      ],
    },
    {
      label: 'Students',
      icon: IconUsers,
      children: [
        { label: 'Enrolled Students', to: '/dashboard/enrollments', icon: IconUsers },
        { label: 'Groups', to: '/dashboard/groups', icon: IconUsers },
      ],
    },
    {
      label: 'Communication',
      icon: IconChat,
      children: [
        { label: 'Discussions', to: '/dashboard/discussions', icon: IconChat },
        { label: 'Messages', to: '/dashboard/messages', icon: IconChat },
        { label: 'Announcements', to: '/dashboard/announcements', icon: IconBell },
      ],
    },
    { label: 'Live Classes', to: '/dashboard/live-classes', icon: IconTrendingUp },
    PROFILE,
    SETTINGS,
  ],

  student: [
    DASHBOARD,
    {
      label: 'Learning',
      icon: IconBook,
      children: [
        { label: 'Browse Courses', to: '/dashboard/browse-courses', icon: IconSearch },
        { label: 'My Courses', to: '/dashboard/my-courses', icon: IconBook },
        { label: 'Assessments', to: '/dashboard/assessments', icon: IconClipboard },
        { label: 'Grades', to: '/dashboard/grades', icon: IconTrendingUp },
        { label: 'Transcript', to: '/dashboard/transcript', icon: IconFileText },
        { label: 'Certificates', to: '/dashboard/certificates', icon: IconAward },
      ],
    },
    {
      label: 'Communication',
      icon: IconChat,
      children: [
        { label: 'Notifications', to: '/dashboard/notifications', icon: IconBell },
        { label: 'Messages', to: '/dashboard/messages', icon: IconChat },
        { label: 'Discussions', to: '/dashboard/discussions', icon: IconChat },
      ],
    },
    { label: 'Live Classes', to: '/dashboard/live-classes', icon: IconTrendingUp },
    PROFILE,
    SETTINGS,
  ],

  content_manager: [
    DASHBOARD,
    {
      label: 'Content',
      icon: IconBook,
      children: [
        { label: 'Courses', to: '/dashboard/courses', icon: IconBook },
        { label: 'Categories', to: '/dashboard/categories', icon: IconClipboard },
        { label: 'Modules & Lessons', to: '/dashboard/courses', icon: IconClipboard },
      ],
    },
    PROFILE,
    SETTINGS,
  ],

  support_staff: [
    DASHBOARD,
    {
      label: 'Support',
      icon: IconLifeBuoy,
      children: [
        { label: 'Tickets', to: '/dashboard/tickets', icon: IconLifeBuoy },
        { label: 'FAQs', to: '/dashboard/faqs', icon: IconLifeBuoy },
      ],
    },
    PROFILE,
    SETTINGS,
  ],
}

export const ROLE_LABELS = {
  admin: 'Administrator',
  academic_manager: 'Academic Manager',
  instructor: 'Instructor',
  student: 'Student',
  content_manager: 'Content Manager',
  support_staff: 'Support Staff',
}
