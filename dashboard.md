# ASA ACADEMY E-LEARNING PLATFORM

## USER DASHBOARD SYSTEM DOCUMENTATION

### 1. Dashboard Overview

The Asa Academy E-Learning Platform provides role-based dashboards for users according to their responsibilities and permissions.

The dashboard is the main working environment after authentication. It provides users with a summarized view of important information, activities, notifications, learning progress, academic performance, management activities, and system operations.

The system contains the following primary dashboards:

1. Administrator Dashboard
2. Academic Manager Dashboard
3. Instructor Dashboard
4. Student Dashboard
5. Content Manager Dashboard
6. Support Staff Dashboard

Each dashboard displays only the information and functions permitted by the user's role.

---

# 2. Common Dashboard Structure

All Asa Academy dashboards should follow a consistent layout.

### 2.1 Dashboard Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ ASA ACADEMY                         Search  Notification User │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│ Dashboard    │                 Page Header                   │
│              │                                               │
│ Users        │     ┌────────┐ ┌────────┐ ┌────────┐         │
│ Courses      │     │  KPI 1 │ │  KPI 2 │ │  KPI 3 │         │
│ Enrollments  │     └────────┘ └────────┘ └────────┘         │
│              │                                               │
│ Assessments  │     Charts / Tables / Activities             │
│ Reports      │                                               │
│ Messages     │                                               │
│ Notifications│                                               │
│ Settings     │                                               │
│              │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

### 2.2 Common Dashboard Components

Every dashboard should provide:

* Sidebar navigation
* Top navigation bar
* User profile menu
* Global search
* Notification center
* Messages
* Breadcrumb navigation
* Dashboard cards
* Charts
* Tables
* Recent activities
* Quick actions
* Alerts
* Responsive mobile navigation
* Logout functionality

---

# 3. Administrator Dashboard

## 3.1 Purpose

The Administrator Dashboard provides complete control over the Asa Academy platform.

Administrators can monitor users, courses, enrollments, payments, assessments, certificates, system activities, support requests, and overall platform performance.

## 3.2 Administrator KPI Cards

The dashboard should display:

* Total Users
* Active Users
* Total Students
* Total Instructors
* Total Courses
* Published Courses
* Draft Courses
* Active Enrollments
* Completed Courses
* Certificates Issued
* Total Revenue
* Pending Payments
* Open Support Tickets

## 3.3 Administrator Charts

The dashboard should include:

### User Registration Chart

Displays user registrations over time.

Data:

* Date
* Number of new students
* Number of new instructors
* Total registrations

### Enrollment Chart

Displays course enrollment trends.

Data:

* Month
* New enrollments
* Completed enrollments
* Cancelled enrollments

### Revenue Chart

Displays payment performance.

Data:

* Date
* Number of transactions
* Revenue
* Refunds
* Net revenue

### Course Performance Chart

Displays:

* Most enrolled courses
* Most completed courses
* Highest-rated courses
* Lowest-rated courses

## 3.4 Recent Activities

The administrator can view:

* New user registrations
* New courses
* Course publication
* Course updates
* New enrollments
* Payments
* Refund requests
* Certificates issued
* Support tickets
* Security events

## 3.5 Quick Actions

Administrator quick actions:

```text
+ Add User
+ Add Instructor
+ Create Course
+ Add Category
+ Create Announcement
+ View Reports
+ Manage Payments
+ System Settings
```

---

# 4. Administrator Navigation

```text
Dashboard
│
├── Users
│   ├── All Users
│   ├── Students
│   ├── Instructors
│   ├── Staff
│   └── Roles & Permissions
│
├── Courses
│   ├── All Courses
│   ├── Categories
│   ├── Modules
│   └── Lessons
│
├── Enrollments
│
├── Assessments
│   ├── Quizzes
│   ├── Assignments
│   └── Exams
│
├── Certificates
│
├── Payments
│   ├── Transactions
│   └── Refunds
│
├── Communication
│   ├── Announcements
│   ├── Notifications
│   └── Messages
│
├── Support
│   ├── Tickets
│   └── FAQs
│
├── Reports
│
├── Audit Logs
│
└── System Settings
```

---

# 5. Academic Manager Dashboard

## 5.1 Purpose

The Academic Manager Dashboard focuses on academic operations and monitoring.

The Academic Manager can monitor:

* Courses
* Instructors
* Students
* Enrollment
* Academic schedules
* Assessments
* Student performance
* Course completion
* Certificates

## 5.2 KPI Cards

```text
Total Courses
Active Courses
Total Students
Active Instructors
Active Enrollments
Completed Courses
Pending Assessments
Certificates Issued
```

## 5.3 Academic Charts

Charts include:

* Student enrollment trends
* Course completion rate
* Student performance
* Instructor activity
* Assessment results
* Course popularity

## 5.4 Academic Quick Actions

```text
Create Course
Assign Instructor
Schedule Assessment
Create Announcement
View Student Results
Generate Academic Report
```

---

# 6. Instructor Dashboard

## 6.1 Purpose

The Instructor Dashboard provides instructors with tools to manage their courses and students.

## 6.2 Instructor KPI Cards

The dashboard displays:

* My Courses
* Published Courses
* Total Students
* New Enrollments
* Pending Assignments
* Pending Grades
* Upcoming Quizzes
* Upcoming Live Classes
* Average Course Rating

## 6.3 Instructor Course Overview

Each course card should display:

```text
Course Image
Course Title
Course Code
Number of Students
Course Progress
Course Rating
Course Status
Last Updated
```

Actions:

```text
View
Edit
Manage Content
Manage Students
View Analytics
```

## 6.4 Pending Activities

The instructor should see:

* Assignments waiting for grading
* Quiz results requiring review
* Student questions
* Discussion posts
* Support requests
* Upcoming classes

## 6.5 Instructor Quick Actions

```text
+ Create Course
+ Add Module
+ Add Lesson
+ Upload Resource
+ Create Quiz
+ Create Assignment
+ Schedule Live Class
+ Create Announcement
```

---

# 7. Instructor Navigation

```text
Dashboard

My Courses
│
├── All Courses
├── Create Course
├── Course Content
├── Modules
├── Lessons
└── Learning Resources

Assessments
│
├── Quizzes
├── Assignments
├── Exams
└── Grades

Students
│
├── Enrolled Students
├── Student Progress
└── Student Performance

Communication
│
├── Discussions
├── Messages
└── Announcements

Live Classes
│
├── Upcoming Classes
├── Completed Classes
└── Attendance

Analytics

Profile
Settings
```

---

# 8. Student Dashboard

## 8.1 Purpose

The Student Dashboard is the main learning environment for Asa Academy students.

It provides students with access to their courses, lessons, assessments, grades, progress, certificates, communication, and learning activities.

## 8.2 Student KPI Cards

The dashboard displays:

* Enrolled Courses
* Courses In Progress
* Completed Courses
* Average Progress
* Pending Assignments
* Upcoming Quizzes
* Upcoming Exams
* Certificates Earned

## 8.3 Continue Learning

The most recently accessed courses should appear in a "Continue Learning" section.

Each course should display:

```text
Course Image
Course Title
Instructor
Progress Percentage
Current Lesson
Last Accessed
Continue Button
```

Example:

```text
Python Programming

Progress: ███████████░░░ 75%

Current Lesson:
Object-Oriented Programming

[ Continue Learning ]
```

## 8.4 My Courses

The student can view:

* All enrolled courses
* Active courses
* Completed courses
* Expired courses
* Cancelled enrollments

Course information:

* Course title
* Instructor
* Enrollment date
* Progress
* Last lesson
* Completion status
* Final grade
* Certificate status

---

# 9. Student Learning Progress

The dashboard should provide detailed progress information.

Fields:

* Course ID
* Course title
* Total lessons
* Completed lessons
* Remaining lessons
* Completion percentage
* Time spent
* Last accessed lesson
* Course status

Example:

```text
Web Development
━━━━━━━━━━━━━━━━━━━━ 80%

Completed Lessons: 24 / 30
Time Spent: 32h 15m

[ Continue Course ]
```

---

# 10. Student Assessment Dashboard

Students should see all upcoming and completed assessments.

### Assessment Types

* Quizzes
* Assignments
* Exams
* Projects

### Assessment Information

```text
Assessment Title
Course
Type
Due Date
Maximum Marks
Status
Result
Action
```

Statuses:

```text
Upcoming
Available
In Progress
Submitted
Graded
Overdue
```

---

# 11. Student Grades Dashboard

The Grades page displays academic performance.

Fields:

* Course
* Assessment
* Assessment Type
* Marks Obtained
* Maximum Marks
* Percentage
* Grade
* Instructor Feedback
* Date

Example:

```text
Python Programming

Quiz 1          18/20     90%    A
Assignment 1    42/50     84%    B+
Midterm Exam    78/100    78%    B
```

The dashboard can also display:

* Average score
* Highest score
* Lowest score
* Course average
* Overall grade

---

# 12. Student Certificate Dashboard

Students can view certificates earned from completed courses.

Certificate fields:

* Certificate ID
* Certificate Number
* Course
* Student Name
* Issue Date
* Verification Code
* Status
* Certificate URL

Actions:

```text
View Certificate
Download Certificate
Verify Certificate
Share Certificate
```

---

# 13. Student Notification Dashboard

Notifications inform students about important activities.

Examples:

```text
New lesson available
Assignment deadline approaching
Quiz available
New grade published
Certificate issued
New announcement
Live class starting soon
Instructor replied to your question
```

Fields:

* Notification ID
* Notification Type
* Title
* Message
* Reference Type
* Reference ID
* Read Status
* Created Date

Actions:

```text
Mark as Read
Mark All as Read
Delete
Open Related Item
```

---

# 14. Student Messaging Dashboard

The messaging interface allows students to communicate with instructors and authorized staff.

### Message Fields

* Message ID
* Sender
* Receiver
* Subject
* Message
* Attachment
* Read Status
* Sent Date

Functions:

```text
New Message
Inbox
Sent
Reply
Delete
Search
Attachment
```

---

# 15. Student Discussion Dashboard

Students can participate in course discussions.

Features:

* Discussion topics
* Replies
* Instructor responses
* Pinned discussions
* Search
* Reply
* Create topic

Discussion fields:

* Topic title
* Course
* Created by
* Description
* Number of replies
* Last reply
* Status
* Created date

---

# 16. Live Class Dashboard

The Live Class Dashboard displays scheduled online sessions.

Information:

```text
Course
Session Title
Instructor
Date
Start Time
End Time
Meeting Platform
Meeting Link
Attendance Status
Recording
```

Actions:

```text
Join Class
View Recording
View Attendance
Add to Calendar
```

---

# 17. Content Manager Dashboard

## 17.1 Purpose

The Content Manager manages educational materials and course content.

## 17.2 KPI Cards

```text
Total Courses
Published Courses
Draft Courses
Total Lessons
Learning Resources
Pending Content
```

## 17.3 Content Activities

The Content Manager can:

* Create courses
* Edit courses
* Create modules
* Create lessons
* Upload resources
* Manage videos
* Manage documents
* Publish content
* Archive content

---

# 18. Support Staff Dashboard

## 18.1 Purpose

The Support Dashboard manages user support requests.

## 18.2 KPI Cards

```text
Open Tickets
In Progress
High Priority
Resolved Today
Average Response Time
```

## 18.3 Support Ticket Table

Fields:

* Ticket Number
* User
* Subject
* Category
* Priority
* Assigned Staff
* Status
* Created Date
* Updated Date

Statuses:

```text
Open
In Progress
Waiting for User
Resolved
Closed
```

---

# 19. Common User Profile Widget

All authenticated users should have access to a profile widget.

The widget displays:

```text
Profile Picture
Full Name
Username
Email
Role
Account Status
Last Login
```

Actions:

```text
View Profile
Edit Profile
Change Password
Notification Settings
Logout
```

---

# 20. Global Search

The Asa Academy dashboard should provide a global search function.

Searchable information may include:

* Courses
* Lessons
* Students
* Instructors
* Assignments
* Quizzes
* Exams
* Certificates
* Announcements
* Messages
* Support tickets

Search results should be filtered according to the user's permissions.

---

# 21. Dashboard API Requirements

The React frontend should obtain dashboard information from Django REST Framework APIs.

### Administrator APIs

```text
GET /api/v1/dashboard/admin/
GET /api/v1/dashboard/admin/statistics/
GET /api/v1/dashboard/admin/users/
GET /api/v1/dashboard/admin/enrollments/
GET /api/v1/dashboard/admin/revenue/
GET /api/v1/dashboard/admin/activities/
```

### Instructor APIs

```text
GET /api/v1/dashboard/instructor/
GET /api/v1/dashboard/instructor/statistics/
GET /api/v1/dashboard/instructor/courses/
GET /api/v1/dashboard/instructor/students/
GET /api/v1/dashboard/instructor/activities/
GET /api/v1/dashboard/instructor/analytics/
```

### Student APIs

```text
GET /api/v1/dashboard/student/
GET /api/v1/dashboard/student/statistics/
GET /api/v1/dashboard/student/courses/
GET /api/v1/dashboard/student/progress/
GET /api/v1/dashboard/student/assessments/
GET /api/v1/dashboard/student/grades/
GET /api/v1/dashboard/student/certificates/
GET /api/v1/dashboard/student/notifications/
```

### Support APIs

```text
GET /api/v1/dashboard/support/
GET /api/v1/dashboard/support/statistics/
GET /api/v1/support/tickets/
GET /api/v1/support/tickets/{id}/
```

---

# 22. Dashboard Database Data Sources

The dashboards should retrieve data from the following main tables.

| Dashboard Information | Database Table           |
| --------------------- | ------------------------ |
| Users                 | `users`                  |
| Roles                 | `roles`                  |
| Students              | `student_profiles`       |
| Instructors           | `instructor_profiles`    |
| Courses               | `courses`                |
| Categories            | `course_categories`      |
| Modules               | `course_modules`         |
| Lessons               | `lessons`                |
| Resources             | `learning_resources`     |
| Enrollments           | `enrollments`            |
| Progress              | `lesson_progress`        |
| Quizzes               | `quizzes`                |
| Quiz Attempts         | `quiz_attempts`          |
| Assignments           | `assignments`            |
| Submissions           | `assignment_submissions` |
| Grades                | `grades`                 |
| Exams                 | `exams`                  |
| Certificates          | `certificates`           |
| Discussions           | `discussion_topics`      |
| Notifications         | `notifications`          |
| Messages              | `messages`               |
| Live Classes          | `live_sessions`          |
| Attendance            | `attendance`             |
| Reviews               | `course_reviews`         |
| Payments              | `payments`               |
| Refunds               | `refunds`                |
| Support               | `support_tickets`        |
| Audit                 | `audit_logs`             |

---

# 23. Role-Based Dashboard Access

| Feature               | Admin | Academic Manager |  Instructor |     Student | Content Manager | Support |
| --------------------- | ----: | ---------------: | ----------: | ----------: | --------------: | ------: |
| System Dashboard      |     ✓ |                ✓ |             |             |                 |         |
| User Management       |     ✓ |          Limited |             |             |                 | Limited |
| Course Management     |     ✓ |                ✓ |           ✓ |        View |               ✓ |         |
| Course Creation       |     ✓ |                ✓ |           ✓ |             |               ✓ |         |
| Course Enrollment     |     ✓ |                ✓ |        View |           ✓ |                 |         |
| Student Management    |     ✓ |                ✓ | Own Courses | Own Account |                 | Limited |
| Instructor Management |     ✓ |                ✓ |             |             |                 |         |
| Lessons               |     ✓ |                ✓ |           ✓ |        View |               ✓ |         |
| Quizzes               |     ✓ |                ✓ |           ✓ |        Take |               ✓ |         |
| Assignments           |     ✓ |                ✓ |           ✓ |      Submit |               ✓ |         |
| Grading               |     ✓ |                ✓ |           ✓ |        View |                 |         |
| Exams                 |     ✓ |                ✓ |           ✓ |        Take |               ✓ |         |
| Certificates          |     ✓ |                ✓ |           ✓ |        View |                 |         |
| Payments              |     ✓ |                ✓ |             |        View |                 |         |
| Reports               |     ✓ |                ✓ | Own Courses | Own Results |         Content | Support |
| Discussions           |     ✓ |                ✓ |           ✓ |           ✓ |                 |         |
| Notifications         |     ✓ |                ✓ |           ✓ |           ✓ |               ✓ |       ✓ |
| Messaging             |     ✓ |                ✓ |           ✓ |           ✓ |                 |       ✓ |
| Live Classes          |     ✓ |                ✓ |           ✓ |        Join |               ✓ |         |
| Support Tickets       |     ✓ |                ✓ |             | Create/View |                 |       ✓ |
| System Settings       |     ✓ |                  |             |             |                 |         |
| Audit Logs            |     ✓ |          Limited |             |             |                 |         |

---

# 24. Responsive Dashboard Requirements

The dashboard must support:

* Desktop
* Laptop
* Tablet
* Mobile

### Desktop

```text
Sidebar + Main Content + Widgets
```

### Tablet

```text
Collapsible Sidebar
Responsive Cards
Two-column Layout
```

### Mobile

```text
Top Navigation
Drawer Menu
Single-column Cards
Scrollable Tables
Mobile-friendly Forms
```

---

# 25. React Component Structure

The frontend dashboard components should be reusable.

```text
src/
├── components/
│   └── dashboard/
│       ├── DashboardLayout.jsx
│       ├── Sidebar.jsx
│       ├── Topbar.jsx
│       ├── StatCard.jsx
│       ├── ChartCard.jsx
│       ├── RecentActivity.jsx
│       ├── NotificationPanel.jsx
│       ├── UserMenu.jsx
│       ├── SearchBar.jsx
│       ├── CourseCard.jsx
│       ├── ProgressCard.jsx
│       ├── AssessmentCard.jsx
│       ├── CertificateCard.jsx
│       └── QuickActions.jsx
│
├── pages/
│   ├── admin/
│   │   └── AdminDashboard.jsx
│   ├── instructor/
│   │   └── InstructorDashboard.jsx
│   ├── student/
│   │   └── StudentDashboard.jsx
│   ├── academic/
│   │   └── AcademicDashboard.jsx
│   ├── content/
│   │   └── ContentDashboard.jsx
│   └── support/
│       └── SupportDashboard.jsx
```

---

# 26. Dashboard Security Requirements

Dashboard information must be protected through both frontend and backend authorization.

The React application should hide unauthorized navigation items, but **Django must remain the final authority for authorization**.

Security requirements include:

* JWT authentication
* Role-based permissions
* Object-level authorization
* Protected API endpoints
* Secure password storage
* HTTPS in production
* Input validation
* File upload validation
* Audit logging
* Session/token expiration
* Rate limiting where appropriate
* Secure CORS configuration
* Protection of sensitive information

---

# 27. Dashboard Performance Requirements

Dashboard APIs should avoid loading unnecessary information.

Recommended approach:

```text
React Dashboard
       │
       ▼
Dashboard API
       │
       ├── Statistics Query
       ├── Recent Activity Query
       ├── Notification Query
       └── User-specific Query
       │
       ▼
JSON Response
```

The backend should use optimized queries and pagination for large datasets.

Large reports should not be loaded automatically on the dashboard.

---

# 28. Recommended Dashboard API Response

A student dashboard response can follow this structure:

```json
{
    "user": {
        "id": 15,
        "name": "Student Name",
        "role": "student"
    },
    "statistics": {
        "enrolled_courses": 6,
        "active_courses": 4,
        "completed_courses": 2,
        "average_progress": 72,
        "pending_assignments": 3,
        "upcoming_quizzes": 2,
        "certificates": 2
    },
    "continue_learning": [],
    "upcoming_assessments": [],
    "recent_grades": [],
    "notifications": [],
    "recent_activity": []
}
```

The same approach can be used for instructor and administrator dashboards.

---

# 29. Dashboard Design Principles

The Asa Academy dashboards should follow these principles:

1. **Simple** – Users should immediately understand what requires attention.
2. **Role-specific** – Users should only see relevant information.
3. **Responsive** – The dashboard must work on all screen sizes.
4. **Consistent** – Components should use a consistent Tailwind CSS design system.
5. **Accessible** – Text, buttons, forms, navigation, and charts should be accessible.
6. **Fast** – Dashboard pages should load only the information required.
7. **Action-oriented** – Important actions should be easily accessible.
8. **Secure** – Sensitive information must be protected by Django authorization.
9. **Scalable** – The architecture should support additional roles and modules.
10. **Maintainable** – React components and Django APIs should be reusable.

---

# 30. Final Dashboard Architecture

The complete Asa Academy dashboard architecture is:

```text
                         ASA ACADEMY
                              │
                         Authentication
                              │
                       Role / Permission
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
        MANAGEMENT         ACADEMIC          LEARNING
            │                 │                 │
      Administrator     Academic Manager     Student
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                       Instructor
                              │
                ┌─────────────┴─────────────┐
                │                           │
          Content Manager              Support Staff
```

The frontend is implemented with:

```text
React.js
Tailwind CSS
React Router
Axios
```

The backend is implemented with:

```text
Django
Django REST Framework
JWT Authentication
PostgreSQL
```

The dashboard therefore becomes the central interface connecting all major Asa Academy modules:

```text
Users
Courses
Lessons
Enrollments
Progress
Quizzes
Assignments
Exams
Grades
Certificates
Discussions
Notifications
Messages
Live Classes
Attendance
Payments
Reviews
Support
Reports
System Administration
```

## 31. Final Dashboard Requirement

The Asa Academy E-Learning Platform shall provide a secure, responsive, role-based dashboard system that allows each category of user to efficiently perform the activities associated with their responsibilities.

The **Administrator Dashboard** provides system-wide management and analytics.

The **Academic Manager Dashboard** provides academic monitoring and coordination.

The **Instructor Dashboard** provides course, content, assessment, grading, student, and teaching management.

The **Student Dashboard** provides personalized learning, progress, assessment, communication, and certification functionality.

The **Content Manager Dashboard** provides educational content management.

The **Support Staff Dashboard** provides user support and ticket management.

All dashboards shall communicate with the Django REST Framework backend through protected API endpoints and shall use PostgreSQL as the primary data source. The React.js and Tailwind CSS frontend shall provide a responsive and consistent user experience across desktop, tablet, and mobile devices.
