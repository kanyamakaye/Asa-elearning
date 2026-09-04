# ASA ACADEMY

## Course, Quiz, Assignment & Live Class Management

### Backend and Frontend Implementation Documentation

---

# 1. Objective

The current dashboard contains the following placeholder actions:

```text
Create Course
Create Quiz
Create Assignment
Schedule Live Class
```

These actions currently redirect users to:

```text
/dashboard/coming-soon
```

The objective is to replace these placeholders with fully functional features.

Each feature shall provide:

* Dashboard quick action
* Frontend page
* Form validation
* API endpoint
* Django model
* Serializer
* View/API
* URL routing
* Permission control
* Database persistence
* Success/error handling
* Loading states
* Edit functionality where applicable
* Detail/view functionality
* Responsive Tailwind CSS interface

---

# 2. Technology Stack

## Backend

```text
Python
Django
Django REST Framework
PostgreSQL
JWT Authentication
django-filter
Pillow
```

## Frontend

```text
React.js
Vite
Tailwind CSS
React Router
Axios
```

---

# 3. User Roles

The features shall use role-based permissions.

| Feature             | Admin | Academic Manager |       Instructor | Student |
| ------------------- | ----: | ---------------: | ---------------: | ------: |
| Create Course       |     ✓ |                ✓ |                ✓ |       ✗ |
| Edit Course         |     ✓ |                ✓ |      Own Courses |       ✗ |
| Publish Course      |     ✓ |                ✓ | Permission-based |       ✗ |
| Create Quiz         |     ✓ |                ✓ |                ✓ |       ✗ |
| Edit Quiz           |     ✓ |                ✓ |      Own Courses |       ✗ |
| Create Assignment   |     ✓ |                ✓ |                ✓ |       ✗ |
| Grade Assignment    |     ✓ |                ✓ |                ✓ |       ✗ |
| Schedule Live Class |     ✓ |                ✓ |                ✓ |       ✗ |
| Join Live Class     |     ✓ |                ✓ |                ✓ |       ✓ |
| Delete Content      |     ✓ |                ✓ |      Own Content |       ✗ |

Backend permissions must be enforced regardless of frontend visibility.

---

# 4. Overall Architecture

```text
                         React Dashboard
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
       Create Course      Create Quiz      Create Assignment
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                       Schedule Live Class
                               │
                               ▼
                         Axios / REST API
                               │
                               ▼
                    Django REST Framework
                               │
              ┌────────────────┼────────────────┐
              │                │                │
           Courses          Quizzes        Assignments
              │                │                │
              └────────────────┼────────────────┘
                               │
                         Live Classes
                               │
                               ▼
                          PostgreSQL
```

---

# 5. Backend Application Structure

Use separate Django applications:

```text
backend/
│
├── courses/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── permissions.py
│   ├── admin.py
│   └── tests.py
│
├── assessments/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── permissions.py
│   ├── admin.py
│   └── tests.py
│
├── assignments/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── permissions.py
│   ├── admin.py
│   └── tests.py
│
└── live_classes/
    ├── models.py
    ├── serializers.py
    ├── views.py
    ├── urls.py
    ├── permissions.py
    ├── admin.py
    └── tests.py
```

---

# 6. Feature 1 — Create Course

## 6.1 Purpose

Instructors and authorized administrators can create a complete online course.

A course contains:

```text
Course
 ├── Basic Information
 ├── Category
 ├── Instructor
 ├── Thumbnail
 ├── Modules
 │    ├── Lessons
 │    └── Resources
 ├── Pricing
 ├── Course Requirements
 ├── Learning Objectives
 └── Publication Settings
```

---

# 7. Course Database Model

### Course

Required fields:

```text
id
title
slug
course_code
short_description
description
category
thumbnail
instructor
level
language
price
discount_price
duration
status
visibility
requirements
learning_objectives
created_at
updated_at
published_at
```

### Field specification

| Field               | Type           | Required | Description                    |
| ------------------- | -------------- | -------: | ------------------------------ |
| id                  | UUID/Integer   |      Yes | Unique course identifier       |
| title               | String         |      Yes | Course title                   |
| slug                | String         |      Yes | URL-friendly identifier        |
| course_code         | String         |      Yes | Unique course code             |
| short_description   | Text           |      Yes | Short summary                  |
| description         | Rich Text/Text |      Yes | Full course description        |
| category            | Foreign Key    |      Yes | Course category                |
| thumbnail           | Image          |       No | Course image                   |
| instructor          | Foreign Key    |      Yes | Course owner                   |
| level               | Choice         |      Yes | Beginner/Intermediate/Advanced |
| language            | String         |      Yes | Course language                |
| price               | Decimal        |      Yes | Course price                   |
| discount_price      | Decimal        |       No | Discounted price               |
| duration            | Integer        |      Yes | Duration in hours              |
| status              | Choice         |      Yes | Draft/Published/Archived       |
| visibility          | Choice         |      Yes | Public/Private                 |
| requirements        | JSON/Text      |       No | Prerequisites                  |
| learning_objectives | JSON/Text      |       No | Learning outcomes              |
| created_at          | DateTime       |      Yes | Creation timestamp             |
| updated_at          | DateTime       |      Yes | Last update                    |
| published_at        | DateTime       |       No | Publication date               |

---

# 8. Course API

Base URL:

```text
/api/v1/courses/
```

### Create

```http
POST /api/v1/courses/
```

### List

```http
GET /api/v1/courses/
```

### Detail

```http
GET /api/v1/courses/{id}/
```

### Update

```http
PUT /api/v1/courses/{id}/
```

### Partial Update

```http
PATCH /api/v1/courses/{id}/
```

### Delete

```http
DELETE /api/v1/courses/{id}/
```

### Publish

```http
POST /api/v1/courses/{id}/publish/
```

### Archive

```http
POST /api/v1/courses/{id}/archive/
```

---

# 9. Course Create Request

Example:

```json
{
    "title": "Full Stack Web Development",
    "course_code": "WEB-001",
    "short_description": "Learn modern web development.",
    "description": "Complete web development course.",
    "category": 2,
    "level": "beginner",
    "language": "English",
    "price": 150.00,
    "discount_price": 120.00,
    "duration": 40,
    "visibility": "public",
    "requirements": [
        "Basic computer knowledge"
    ],
    "learning_objectives": [
        "Build web applications",
        "Understand REST APIs",
        "Build React applications"
    ]
}
```

---

# 10. Course Frontend

Route:

```text
/dashboard/courses/create
```

React component:

```text
src/pages/instructor/courses/CreateCourse.jsx
```

The dashboard button changes from:

```text
/dashboard/coming-soon?label=Create%20Course
```

to:

```text
/dashboard/courses/create
```

---

# 11. Course Form

The form should contain:

### Basic Information

```text
Course Title *
Course Code *
Category *
Level *
Language *
```

### Course Description

```text
Short Description *
Full Description *
```

### Course Media

```text
Course Thumbnail
```

### Pricing

```text
Price
Discount Price
```

### Course Structure

```text
Duration
Requirements
Learning Objectives
```

### Publication

```text
Visibility
Status
```

Buttons:

```text
Save as Draft
Create Course
Cancel
```

---

# 12. Course Creation Workflow

```text
Instructor
    │
    ▼
Click "Create Course"
    │
    ▼
React Create Course Page
    │
    ▼
Fill Form
    │
    ▼
Frontend Validation
    │
    ▼
POST /api/v1/courses/
    │
    ▼
Django Permission Check
    │
    ▼
Serializer Validation
    │
    ▼
Save Course
    │
    ▼
PostgreSQL
    │
    ▼
Return Course JSON
    │
    ▼
React Success Message
    │
    ▼
Course Management Page
```

---

# 13. Feature 2 — Create Quiz

## 13.1 Purpose

Instructors create quizzes associated with courses or lessons.

A quiz contains:

```text
Quiz
 ├── Questions
 │    ├── Multiple Choice
 │    ├── True/False
 │    ├── Short Answer
 │    └── Multiple Select
 ├── Time Limit
 ├── Attempts
 ├── Passing Score
 └── Publication Settings
```

---

# 14. Quiz Database Models

### Quiz

```text
id
course
lesson
title
description
instructions
time_limit
passing_score
maximum_attempts
randomize_questions
show_results
status
available_from
available_until
created_by
created_at
updated_at
```

### Quiz Question

```text
id
quiz
question_text
question_type
marks
order
explanation
created_at
```

### Question Option

```text
id
question
option_text
is_correct
order
```

---

# 15. Quiz Field Specification

| Field               | Type        | Required |
| ------------------- | ----------- | -------: |
| title               | String      |      Yes |
| course              | Foreign Key |      Yes |
| lesson              | Foreign Key |       No |
| description         | Text        |       No |
| instructions        | Text        |       No |
| time_limit          | Integer     |       No |
| passing_score       | Decimal     |      Yes |
| maximum_attempts    | Integer     |      Yes |
| randomize_questions | Boolean     |      Yes |
| show_results        | Boolean     |      Yes |
| status              | Choice      |      Yes |
| available_from      | DateTime    |       No |
| available_until     | DateTime    |       No |

---

# 16. Quiz API

```http
POST /api/v1/quizzes/
GET /api/v1/quizzes/
GET /api/v1/quizzes/{id}/
PUT /api/v1/quizzes/{id}/
PATCH /api/v1/quizzes/{id}/
DELETE /api/v1/quizzes/{id}/
```

Question APIs:

```http
POST /api/v1/quizzes/{quiz_id}/questions/
GET /api/v1/quizzes/{quiz_id}/questions/
PUT /api/v1/questions/{id}/
DELETE /api/v1/questions/{id}/
```

Publish:

```http
POST /api/v1/quizzes/{id}/publish/
```

---

# 17. Quiz Frontend

Route:

```text
/dashboard/quizzes/create
```

Component:

```text
src/pages/instructor/quizzes/CreateQuiz.jsx
```

Dashboard action:

```text
Create Quiz
```

must navigate to:

```text
/dashboard/quizzes/create
```

---

# 18. Quiz Creation Interface

### Step 1 — Quiz Information

```text
Quiz Title *
Course *
Lesson
Description
Instructions
```

### Step 2 — Configuration

```text
Time Limit
Passing Score
Maximum Attempts
Randomize Questions
Show Results
```

### Step 3 — Questions

Question editor:

```text
Question 1

Question Type
Question Text
Marks

Option A
Option B
Option C
Option D

Correct Answer
Explanation
```

Actions:

```text
+ Add Question
Delete Question
Move Up
Move Down
```

### Step 4 — Availability

```text
Start Date
End Date
Status
```

Buttons:

```text
Save Draft
Publish Quiz
Cancel
```

---

# 19. Quiz Creation Workflow

```text
Create Quiz
     │
     ▼
Quiz Information
     │
     ▼
Quiz Configuration
     │
     ▼
Add Questions
     │
     ▼
Validate Questions
     │
     ▼
POST Quiz
     │
     ▼
POST Questions
     │
     ▼
Save PostgreSQL
     │
     ▼
Quiz Details
```

---

# 20. Feature 3 — Create Assignment

## 20.1 Purpose

Instructors create assignments that students can submit before a specified deadline.

---

# 21. Assignment Database Model

Required fields:

```text
id
course
lesson
title
description
instructions
attachment
maximum_marks
passing_marks
due_date
submission_type
allowed_file_types
max_file_size
late_submission_allowed
late_penalty
status
created_by
created_at
updated_at
```

---

# 22. Assignment Field Specification

| Field                   | Type        | Required |
| ----------------------- | ----------- | -------: |
| title                   | String      |      Yes |
| course                  | Foreign Key |      Yes |
| lesson                  | Foreign Key |       No |
| description             | Text        |      Yes |
| instructions            | Text        |      Yes |
| attachment              | File        |       No |
| maximum_marks           | Integer     |      Yes |
| passing_marks           | Integer     |      Yes |
| due_date                | DateTime    |      Yes |
| submission_type         | Choice      |      Yes |
| allowed_file_types      | JSON        |       No |
| max_file_size           | Integer     |       No |
| late_submission_allowed | Boolean     |      Yes |
| late_penalty            | Decimal     |       No |
| status                  | Choice      |      Yes |
| created_by              | Foreign Key |      Yes |

---

# 23. Assignment Submission Model

Students' submissions require a separate model:

```text
AssignmentSubmission

id
assignment
student
submission_text
file
submitted_at
status
marks
feedback
graded_by
graded_at
created_at
updated_at
```

Statuses:

```text
Draft
Submitted
Late
Graded
Returned
```

---

# 24. Assignment API

```http
POST /api/v1/assignments/
GET /api/v1/assignments/
GET /api/v1/assignments/{id}/
PUT /api/v1/assignments/{id}/
PATCH /api/v1/assignments/{id}/
DELETE /api/v1/assignments/{id}/
```

Publish:

```http
POST /api/v1/assignments/{id}/publish/
```

Submissions:

```http
GET /api/v1/assignments/{id}/submissions/
GET /api/v1/submissions/{id}/
POST /api/v1/assignments/{id}/submit/
PATCH /api/v1/submissions/{id}/grade/
```

---

# 25. Assignment Frontend

Route:

```text
/dashboard/assignments/create
```

Component:

```text
src/pages/instructor/assignments/CreateAssignment.jsx
```

Dashboard button:

```text
Create Assignment
```

navigates to:

```text
/dashboard/assignments/create
```

---

# 26. Assignment Form

### Basic Information

```text
Assignment Title *
Course *
Lesson
Description *
Instructions *
```

### Assessment

```text
Maximum Marks *
Passing Marks *
```

### Submission

```text
Submission Type
Allowed File Types
Maximum File Size
```

### Deadline

```text
Due Date *
Late Submission Allowed
Late Penalty
```

### Attachment

```text
Reference File
```

### Publication

```text
Draft
Published
```

Buttons:

```text
Save Draft
Create Assignment
Cancel
```

---

# 27. Assignment Workflow

```text
Instructor
    │
    ▼
Create Assignment
    │
    ▼
Enter Information
    │
    ▼
Upload Attachment
    │
    ▼
Frontend Validation
    │
    ▼
POST /api/v1/assignments/
    │
    ▼
Django Validation
    │
    ▼
Save Assignment
    │
    ▼
PostgreSQL
    │
    ▼
Return Assignment
    │
    ▼
React Success
```

---

# 28. Feature 4 — Schedule Live Class

## 28.1 Purpose

Instructors and authorized staff can schedule live online classes for students.

A live class contains:

```text
Course
Instructor
Session Title
Description
Date
Start Time
End Time
Meeting Platform
Meeting URL
Recording URL
Capacity
Status
```

---

# 29. Live Class Database Model

```text
LiveClass

id
course
instructor
title
description
scheduled_date
start_time
end_time
timezone
platform
meeting_url
meeting_id
meeting_password
recording_url
capacity
status
created_by
created_at
updated_at
```

Statuses:

```text
Scheduled
Live
Completed
Cancelled
Postponed
```

---

# 30. Live Class Field Specification

| Field            | Type        | Required |
| ---------------- | ----------- | -------: |
| course           | Foreign Key |      Yes |
| instructor       | Foreign Key |      Yes |
| title            | String      |      Yes |
| description      | Text        |       No |
| scheduled_date   | Date        |      Yes |
| start_time       | Time        |      Yes |
| end_time         | Time        |      Yes |
| timezone         | String      |      Yes |
| platform         | Choice      |      Yes |
| meeting_url      | URL         |      Yes |
| meeting_id       | String      |       No |
| meeting_password | String      |       No |
| recording_url    | URL         |       No |
| capacity         | Integer     |       No |
| status           | Choice      |      Yes |

---

# 31. Live Class Platforms

The system should initially support:

```text
Zoom
Google Meet
Microsoft Teams
Other
```

The platform should be represented using choices:

```python
PLATFORM_CHOICES = [
    ("zoom", "Zoom"),
    ("google_meet", "Google Meet"),
    ("teams", "Microsoft Teams"),
    ("other", "Other"),
]
```

The first implementation can store the meeting URL manually.

Integration with external meeting providers can be added later.

---

# 32. Live Class API

```http
POST /api/v1/live-classes/
GET /api/v1/live-classes/
GET /api/v1/live-classes/{id}/
PUT /api/v1/live-classes/{id}/
PATCH /api/v1/live-classes/{id}/
DELETE /api/v1/live-classes/{id}/
```

Upcoming classes:

```http
GET /api/v1/live-classes/upcoming/
```

Cancel:

```http
POST /api/v1/live-classes/{id}/cancel/
```

Complete:

```http
POST /api/v1/live-classes/{id}/complete/
```

---

# 33. Live Class Frontend

Route:

```text
/dashboard/live-classes/create
```

Component:

```text
src/pages/instructor/live-classes/ScheduleLiveClass.jsx
```

Dashboard button:

```text
Schedule Live Class
```

navigates to:

```text
/dashboard/live-classes/create
```

---

# 34. Live Class Form

### Session Information

```text
Course *
Session Title *
Description
Instructor *
```

### Schedule

```text
Date *
Start Time *
End Time *
Timezone *
```

### Meeting Information

```text
Platform *
Meeting URL *
Meeting ID
Meeting Password
```

### Additional Information

```text
Maximum Participants
Recording URL
```

Buttons:

```text
Schedule Class
Save Draft
Cancel
```

---

# 35. Live Class Validation

The frontend and backend must validate:

```text
Course is required
Title is required
Date is required
Start time is required
End time is required
End time must be after start time
Meeting URL must be valid
Platform is required
Scheduled date cannot be invalid
```

The backend must repeat these validations even if React already validates them.

---

# 36. React Routing

The dashboard router should contain:

```jsx
<Route
    path="/dashboard/courses/create"
    element={<CreateCourse />}
/>

<Route
    path="/dashboard/quizzes/create"
    element={<CreateQuiz />}
/>

<Route
    path="/dashboard/assignments/create"
    element={<CreateAssignment />}
/>

<Route
    path="/dashboard/live-classes/create"
    element={<ScheduleLiveClass />}
/>
```

---

# 37. Dashboard Quick Actions

Replace the existing placeholder links.

### Before

```text
/dashboard/coming-soon?label=Create%20Course
```

### After

```text
/dashboard/courses/create
```

### Create Quiz

```text
/dashboard/quizzes/create
```

### Create Assignment

```text
/dashboard/assignments/create
```

### Schedule Live Class

```text
/dashboard/live-classes/create
```

---

# 38. Axios API Services

Create:

```text
src/services/
├── api.js
├── courseService.js
├── quizService.js
├── assignmentService.js
└── liveClassService.js
```

### courseService.js

```javascript
import api from "./api";

export const createCourse = (data) =>
    api.post("/courses/", data);

export const getCourses = () =>
    api.get("/courses/");

export const getCourse = (id) =>
    api.get(`/courses/${id}/`);

export const updateCourse = (id, data) =>
    api.patch(`/courses/${id}/`, data);

export const deleteCourse = (id) =>
    api.delete(`/courses/${id}/`);

export const publishCourse = (id) =>
    api.post(`/courses/${id}/publish/`);
```

The same service pattern should be used for quizzes, assignments, and live classes.

---

# 39. Frontend Form State

Use controlled React forms or a form library.

Recommended structure:

```text
CreateCourse
    │
    ├── courseData
    ├── errors
    ├── loading
    ├── submit
    └── success
```

Example state:

```javascript
const [formData, setFormData] = useState({
    title: "",
    course_code: "",
    category: "",
    level: "beginner",
    language: "English",
    price: "",
    duration: "",
});
```

---

# 40. Form Validation

Required validation should happen before API submission.

Example:

```text
Course title:
Required
Minimum length: 3 characters

Course code:
Required
Unique

Price:
Must be >= 0

Discount price:
Must be <= price

Duration:
Must be greater than 0
```

Quiz:

```text
Title required
Course required
Passing score between 0 and 100
At least one question
Every question must have valid content
```

Assignment:

```text
Title required
Course required
Maximum marks > 0
Passing marks <= maximum marks
Due date required
```

Live class:

```text
Course required
Title required
Date required
Start time required
End time required
End > Start
Valid meeting URL
```

---

# 41. Backend Permission Class

Create reusable permissions:

```text
permissions.py
```

Example logic:

```text
IsAdministrator
IsAcademicManager
IsInstructor
CanManageCourse
CanManageAssessment
CanScheduleLiveClass
```

The backend should check:

```text
Is authenticated?
        │
        ▼
Has appropriate role?
        │
        ▼
Owns or manages the resource?
        │
        ▼
Allow request
```

---

# 42. Error Handling

API errors should use a consistent structure.

Example:

```json
{
    "success": false,
    "message": "Course could not be created.",
    "errors": {
        "title": [
            "This field is required."
        ],
        "category": [
            "Invalid category."
        ]
    }
}
```

Successful response:

```json
{
    "success": true,
    "message": "Course created successfully.",
    "data": {
        "id": 25,
        "title": "Full Stack Web Development",
        "status": "draft"
    }
}
```

---

# 43. Frontend UX States

Every creation page must support:

### Loading

```text
Creating Course...
Creating Quiz...
Creating Assignment...
Scheduling Class...
```

### Success

Display:

```text
✓ Course created successfully.
```

### Error

Display:

```text
Unable to create course.
Please correct the highlighted fields.
```

### Unsaved Changes

If a user attempts to leave a form containing unsaved changes:

```text
You have unsaved changes.
Are you sure you want to leave?
```

---

# 44. Database Relationships

The major relationships should be:

```text
User
 │
 ├── Instructor
 │       │
 │       ├── Courses
 │       │      │
 │       │      ├── Modules
 │       │      │     └── Lessons
 │       │      │
 │       │      ├── Quizzes
 │       │      │     └── Questions
 │       │      │
 │       │      └── Assignments
 │       │
 │       └── Live Classes
 │
 └── Student
         │
         ├── Enrollments
         ├── Quiz Attempts
         ├── Assignment Submissions
         └── Live Class Attendance
```

---

# 45. Recommended Course Content Relationship

A course should not directly contain lessons without structure.

Recommended:

```text
Course
   │
   ├── Module 1
   │     ├── Lesson 1
   │     ├── Lesson 2
   │     └── Quiz 1
   │
   ├── Module 2
   │     ├── Lesson 3
   │     ├── Lesson 4
   │     └── Assignment 1
   │
   └── Module 3
         ├── Lesson 5
         └── Final Quiz
```

This makes the learning platform scalable.

---

# 46. Course Creation Should Be Multi-Step

Do not create a huge single-page form.

Recommended workflow:

```text
Step 1
Basic Information
        ↓
Step 2
Course Description
        ↓
Step 3
Thumbnail & Media
        ↓
Step 4
Pricing
        ↓
Step 5
Learning Objectives
        ↓
Step 6
Requirements
        ↓
Step 7
Review
        ↓
Save Draft / Publish
```

After the course is created, instructors can manage:

```text
Course
 ├── Modules
 ├── Lessons
 ├── Resources
 ├── Quizzes
 ├── Assignments
 ├── Live Classes
 └── Students
```

---

# 47. Recommended Quiz Creation Flow

```text
Quiz Details
      ↓
Configuration
      ↓
Questions
      ↓
Review
      ↓
Save Draft
      ↓
Publish
```

Questions should be created independently after the quiz exists.

This avoids sending one extremely large request and makes editing easier.

---

# 48. Recommended Assignment Flow

```text
Assignment Details
       ↓
Instructions
       ↓
Assessment Configuration
       ↓
Submission Rules
       ↓
Attachments
       ↓
Review
       ↓
Save / Publish
```

---

# 49. Recommended Live Class Flow

```text
Select Course
       ↓
Enter Session Information
       ↓
Select Date & Time
       ↓
Enter Meeting Details
       ↓
Review
       ↓
Schedule
       ↓
Send Notifications
```

After scheduling, the system should optionally create notifications for enrolled students.

Example:

```text
New Live Class Scheduled

Course:
Full Stack Web Development

Session:
React State Management

Date:
15 September 2026

Time:
10:00 AM

[View Class]
```

---

# 50. Notification Integration

When important actions occur, the backend can generate notifications.

### Course Published

```text
Course published successfully.
```

### Quiz Published

```text
A new quiz is available in your course.
```

### Assignment Published

```text
A new assignment has been posted.
```

### Live Class Scheduled

```text
A new live class has been scheduled.
```

Notification model:

```text
notification
├── recipient
├── title
├── message
├── notification_type
├── reference_type
├── reference_id
├── is_read
└── created_at
```

---

# 51. Testing Requirements

Each feature requires backend and frontend testing.

## Backend

Test:

```text
Authentication
Authorization
Create
Read
Update
Delete
Validation
Permissions
File uploads
Duplicate data
Invalid data
```

## Course Tests

```text
Instructor can create course
Student cannot create course
Admin can create course
Required fields validated
Course code unique
Course saved correctly
```

## Quiz Tests

```text
Instructor can create quiz
Quiz requires course
Quiz requires questions before publishing
Invalid passing score rejected
Unauthorized users rejected
```

## Assignment Tests

```text
Instructor can create assignment
Maximum marks validated
Passing marks validated
Due date validated
Student cannot create assignment
```

## Live Class Tests

```text
Instructor can schedule class
Invalid time rejected
Invalid URL rejected
Student cannot schedule class
Class saved correctly
```

---

# 52. Frontend Component Structure

```text
src/
│
├── pages/
│   ├── courses/
│   │   ├── CreateCourse.jsx
│   │   ├── EditCourse.jsx
│   │   └── CourseDetails.jsx
│   │
│   ├── quizzes/
│   │   ├── CreateQuiz.jsx
│   │   ├── EditQuiz.jsx
│   │   └── QuizDetails.jsx
│   │
│   ├── assignments/
│   │   ├── CreateAssignment.jsx
│   │   ├── EditAssignment.jsx
│   │   └── AssignmentDetails.jsx
│   │
│   └── live-classes/
│       ├── ScheduleLiveClass.jsx
│       ├── EditLiveClass.jsx
│       └── LiveClassDetails.jsx
│
├── components/
│   ├── forms/
│   │   ├── CourseForm.jsx
│   │   ├── QuizForm.jsx
│   │   ├── AssignmentForm.jsx
│   │   └── LiveClassForm.jsx
│   │
│   ├── quizzes/
│   │   ├── QuestionBuilder.jsx
│   │   └── QuestionEditor.jsx
│   │
│   ├── courses/
│   │   ├── CourseCard.jsx
│   │   └── CourseSelector.jsx
│   │
│   └── common/
│       ├── FormInput.jsx
│       ├── FormSelect.jsx
│       ├── FormTextarea.jsx
│       ├── FileUpload.jsx
│       ├── Modal.jsx
│       ├── Button.jsx
│       └── LoadingSpinner.jsx
│
└── services/
    ├── courseService.js
    ├── quizService.js
    ├── assignmentService.js
    └── liveClassService.js
```

---

# 53. Backend API Structure

Final API structure:

```text
/api/v1/
│
├── courses/
│   ├── POST /
│   ├── GET /
│   ├── GET /{id}/
│   ├── PATCH /{id}/
│   ├── DELETE /{id}/
│   └── POST /{id}/publish/
│
├── quizzes/
│   ├── POST /
│   ├── GET /
│   ├── GET /{id}/
│   ├── PATCH /{id}/
│   ├── DELETE /{id}/
│   └── POST /{id}/publish/
│
├── assignments/
│   ├── POST /
│   ├── GET /
│   ├── GET /{id}/
│   ├── PATCH /{id}/
│   ├── DELETE /{id}/
│   └── POST /{id}/publish/
│
└── live-classes/
    ├── POST /
    ├── GET /
    ├── GET /{id}/
    ├── PATCH /{id}/
    ├── DELETE /{id}/
    ├── GET /upcoming/
    ├── POST /{id}/cancel/
    └── POST /{id}/complete/
```

---

# 54. Definition of Done

The four dashboard actions are considered complete only when:

## Create Course

* [ ] Button opens real page
* [ ] Form implemented
* [ ] Frontend validation implemented
* [ ] Django model implemented
* [ ] Serializer implemented
* [ ] API implemented
* [ ] Permission implemented
* [ ] Database persistence works
* [ ] Thumbnail upload works
* [ ] Draft functionality works
* [ ] Publish functionality works
* [ ] Success/error messages work
* [ ] Responsive design implemented
* [ ] Tests implemented

## Create Quiz

* [ ] Button opens real page
* [ ] Quiz form implemented
* [ ] Question builder implemented
* [ ] Question options implemented
* [ ] Validation implemented
* [ ] Django models implemented
* [ ] APIs implemented
* [ ] Permissions implemented
* [ ] Draft/publish implemented
* [ ] Tests implemented

## Create Assignment

* [ ] Button opens real page
* [ ] Assignment form implemented
* [ ] File upload implemented
* [ ] Submission rules implemented
* [ ] Deadline implemented
* [ ] Backend model implemented
* [ ] API implemented
* [ ] Permissions implemented
* [ ] Draft/publish implemented
* [ ] Tests implemented

## Schedule Live Class

* [ ] Button opens real page
* [ ] Class form implemented
* [ ] Course selection implemented
* [ ] Date/time selection implemented
* [ ] Time validation implemented
* [ ] Meeting URL implemented
* [ ] Django model implemented
* [ ] API implemented
* [ ] Permissions implemented
* [ ] Student notification implemented
* [ ] Cancel functionality implemented
* [ ] Tests implemented

---

# 55. Final Implementation Flow

The existing dashboard:

```text
┌─────────────────────────────────────────────────┐
│                  QUICK ACTIONS                   │
│                                                 │
│  [ Create Course ]                              │
│  [ Create Quiz ]                                │
│  [ Create Assignment ]                          │
│  [ Schedule Live Class ]                        │
└─────────────────────────────────────────────────┘
```

should become:

```text
Create Course
      │
      ▼
/dashboard/courses/create
      │
      ▼
POST /api/v1/courses/
      │
      ▼
Django Course Model
      │
      ▼
PostgreSQL
```

```text
Create Quiz
      │
      ▼
/dashboard/quizzes/create
      │
      ▼
POST /api/v1/quizzes/
      │
      ▼
Django Quiz Model
      │
      ▼
PostgreSQL
```

```text
Create Assignment
      │
      ▼
/dashboard/assignments/create
      │
      ▼
POST /api/v1/assignments/
      │
      ▼
Django Assignment Model
      │
      ▼
PostgreSQL
```

```text
Schedule Live Class
      │
      ▼
/dashboard/live-classes/create
      │
      ▼
POST /api/v1/live-classes/
      │
      ▼
Django LiveClass Model
      │
      ▼
PostgreSQL
      │
      ▼
Student Notifications
```

# 56. Implementation Priority

The recommended development order is:

```text
1. Course Creation
       ↓
2. Course Modules & Lessons
       ↓
3. Quiz Creation
       ↓
4. Assignment Creation
       ↓
5. Live Class Scheduling
       ↓
6. Student Enrollment
       ↓
7. Student Learning
       ↓
8. Quiz Attempts
       ↓
9. Assignment Submission
       ↓
10. Grading
       ↓
11. Notifications
       ↓
12. Analytics
```

This order ensures that quizzes, assignments, and live classes are attached to real courses and that the data relationships are established correctly before student functionality is built.
