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
  IconSettings,
  IconShield,
  IconTrendingUp,
  IconUsers,
} from '../icons'

const DASHBOARD = { label: 'Dashboard', to: '/dashboard', icon: IconHome, end: true }
const PROFILE = { label: 'Profile', to: '/dashboard/profile', icon: IconUsers }
const SETTINGS = { label: 'Settings', to: '/dashboard/settings', icon: IconSettings }

export const NAV_BY_ROLE = {
  admin: [
    { items: [DASHBOARD] },
    {
      title: 'Users',
      items: [
        { label: 'All Users', to: '/dashboard/users', icon: IconUsers },
        { label: 'Students', to: '/dashboard/users?role=student', icon: IconUsers },
        { label: 'Instructors', to: '/dashboard/users?role=instructor', icon: IconUsers },
        { label: 'Staff', to: '/dashboard/users?role=academic_manager,content_manager,support_staff,admin', icon: IconShield },
      ],
    },
    {
      title: 'Courses',
      items: [
        { label: 'All Courses', to: '/dashboard/courses', icon: IconBook },
        { label: 'Create Course', to: '/dashboard/courses/create', icon: IconBook },
        { label: 'Categories', to: '/dashboard/categories', icon: IconClipboard },
        { label: 'Modules & Lessons', to: '/dashboard/courses', icon: IconClipboard },
      ],
    },
    { items: [{ label: 'Enrollments', to: '/dashboard/enrollments', icon: IconClipboard }] },
    {
      title: 'Assessments',
      items: [
        { label: 'Quizzes', to: '/dashboard/quizzes', icon: IconFileText },
        { label: 'Create Quiz', to: '/dashboard/quizzes/create', icon: IconFileText },
        { label: 'Assignments', to: '/dashboard/assignments', icon: IconFileText },
        { label: 'Create Assignment', to: '/dashboard/assignments/create', icon: IconFileText },
        { label: 'Exams', to: '/dashboard/exams', icon: IconFileText },
      ],
    },
    { items: [{ label: 'Certificates', to: '/dashboard/certificates', icon: IconAward }] },
    {
      title: 'Payments',
      items: [
        { label: 'Transactions', to: '/dashboard/payments', icon: IconCreditCard },
        { label: 'Refunds', to: '/dashboard/refunds', icon: IconCreditCard },
      ],
    },
    {
      title: 'Communication',
      items: [
        { label: 'Announcements', to: '/dashboard/announcements', icon: IconBell },
        { label: 'Notifications', to: '/dashboard/notifications', icon: IconBell },
        { label: 'Messages', to: '/dashboard/messages', icon: IconChat },
        { label: 'Discussions', to: '/dashboard/discussions', icon: IconChat },
      ],
    },
    {
      title: 'Live Classes',
      items: [
        { label: 'All Live Classes', to: '/dashboard/live-classes', icon: IconTrendingUp },
        { label: 'Schedule Live Class', to: '/dashboard/live-classes/create', icon: IconTrendingUp },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Tickets', to: '/dashboard/tickets', icon: IconLifeBuoy },
        { label: 'FAQs', to: '/dashboard/faqs', icon: IconLifeBuoy },
      ],
    },
    {
      items: [
        { label: 'Audit Logs', to: '/dashboard/audit-logs', icon: IconShield },
        { label: 'System Settings', to: '/dashboard/coming-soon?label=System%20Settings', icon: IconSettings },
      ],
    },
    { items: [PROFILE, SETTINGS] },
  ],

  academic_manager: [
    { items: [DASHBOARD] },
    {
      title: 'Academics',
      items: [
        { label: 'Courses', to: '/dashboard/courses', icon: IconBook },
        { label: 'Enrollments', to: '/dashboard/enrollments', icon: IconClipboard },
        { label: 'Students', to: '/dashboard/users?role=student', icon: IconUsers },
        { label: 'Instructors', to: '/dashboard/users?role=instructor', icon: IconUsers },
        { label: 'Certificates', to: '/dashboard/certificates', icon: IconAward },
      ],
    },
    {
      title: 'Assessments',
      items: [
        { label: 'Quizzes', to: '/dashboard/quizzes', icon: IconFileText },
        { label: 'Assignments', to: '/dashboard/assignments', icon: IconFileText },
        { label: 'Exams', to: '/dashboard/exams', icon: IconFileText },
      ],
    },
    { items: [{ label: 'Live Classes', to: '/dashboard/live-classes', icon: IconTrendingUp }] },
    { items: [PROFILE, SETTINGS] },
  ],

  instructor: [
    { items: [DASHBOARD] },
    {
      title: 'My Courses',
      items: [
        { label: 'All Courses', to: '/dashboard/courses', icon: IconBook },
        { label: 'Create Course', to: '/dashboard/courses/create', icon: IconBook },
        { label: 'Content, Modules & Lessons', to: '/dashboard/courses', icon: IconClipboard },
      ],
    },
    {
      title: 'Assessments',
      items: [
        { label: 'Quizzes', to: '/dashboard/quizzes', icon: IconFileText },
        { label: 'Assignments', to: '/dashboard/assignments', icon: IconFileText },
        { label: 'Exams & Grades', to: '/dashboard/exams', icon: IconFileText },
      ],
    },
    {
      title: 'Students',
      items: [
        { label: 'Enrolled Students', to: '/dashboard/enrollments', icon: IconUsers },
      ],
    },
    {
      title: 'Communication',
      items: [
        { label: 'Discussions', to: '/dashboard/discussions', icon: IconChat },
        { label: 'Messages', to: '/dashboard/messages', icon: IconChat },
        { label: 'Announcements', to: '/dashboard/announcements', icon: IconBell },
      ],
    },
    { items: [{ label: 'Live Classes', to: '/dashboard/live-classes', icon: IconTrendingUp }] },
    { items: [PROFILE, SETTINGS] },
  ],

  student: [
    { items: [DASHBOARD] },
    {
      title: 'Learning',
      items: [
        { label: 'My Courses', to: '/dashboard/my-courses', icon: IconBook },
        { label: 'Assessments', to: '/dashboard/assessments', icon: IconClipboard },
        { label: 'Grades', to: '/dashboard/grades', icon: IconTrendingUp },
        { label: 'Certificates', to: '/dashboard/certificates', icon: IconAward },
      ],
    },
    {
      title: 'Communication',
      items: [
        { label: 'Notifications', to: '/dashboard/notifications', icon: IconBell },
        { label: 'Messages', to: '/dashboard/messages', icon: IconChat },
        { label: 'Discussions', to: '/dashboard/discussions', icon: IconChat },
      ],
    },
    { items: [{ label: 'Live Classes', to: '/dashboard/live-classes', icon: IconTrendingUp }] },
    { items: [PROFILE, SETTINGS] },
  ],

  content_manager: [
    { items: [DASHBOARD] },
    {
      title: 'Content',
      items: [
        { label: 'Courses', to: '/dashboard/courses', icon: IconBook },
        { label: 'Categories', to: '/dashboard/categories', icon: IconClipboard },
        { label: 'Modules & Lessons', to: '/dashboard/courses', icon: IconClipboard },
      ],
    },
    { items: [PROFILE, SETTINGS] },
  ],

  support_staff: [
    { items: [DASHBOARD] },
    {
      title: 'Support',
      items: [
        { label: 'Tickets', to: '/dashboard/tickets', icon: IconLifeBuoy },
        { label: 'FAQs', to: '/dashboard/faqs', icon: IconLifeBuoy },
      ],
    },
    { items: [PROFILE, SETTINGS] },
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
