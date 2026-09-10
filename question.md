Question & Assessment Engine Integration Specification

Document: Question Engine Integration & Technical Requirements
Platform: Asa Academy
Version: 1.0
Scope: All supported e-learning question types and assessment functionality

1. Purpose

This document defines how the complete question engine shall be integrated into the Asa Academy e-learning platform.

The objective is to provide a unified assessment system supporting:

Question creation
Question editing
Question banks
Question categorization
Question versioning
Multiple question types
Automatic grading
Manual grading
Partial credit
Randomization
Assessment creation
Quiz attempts
Exam attempts
Answer storage
Result calculation
Instructor grading
Feedback
Assessment analytics

The implementation should use a common assessment architecture rather than implementing each question type as an independent system.

2. High-Level Architecture

The recommended architecture is:

                    ASA ACADEMY
                         │
          ┌──────────────┴──────────────┐
          │                             │
      Instructor                      Learner
          │                             │
          ▼                             ▼
   Question Builder              Assessment Player
          │                             │
          ▼                             ▼
     Question Bank                Assessment Attempt
          │                             │
          └──────────────┬──────────────┘
                         │
                         ▼
                 Assessment Engine
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
           Grading     Attempts   Feedback
              │          │          │
              └──────────┼──────────┘
                         ▼
                    Results Engine
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        Learner Results       Instructor Analytics
3. Core Components

The system should consist of the following major components.

3.1 Question Bank

Responsible for:

Creating questions
Updating questions
Deleting/archiving questions
Searching questions
Filtering questions
Tagging questions
Categorizing questions
Versioning questions
3.2 Question Builder

Used by instructors to create questions.

The builder dynamically changes depending on the selected question type.

For example:

Question Type
    ↓
SINGLE_CHOICE
    ↓
Display Single Choice Builder

Whereas:

Question Type
    ↓
CODE
    ↓
Display Code Question Builder
4. Assessment Engine

The Assessment Engine manages:

Quizzes
Exams
Tests
Practice activities
Assignments
Surveys

An assessment contains questions.

Example:

Assessment
 ├── Question 1
 ├── Question 2
 ├── Question 3
 ├── Question 4
 └── Question 5
5. Assessment Types

The system should support:

QUIZ
EXAM
PRACTICE
ASSIGNMENT
SURVEY
PRACTICAL
FINAL_EXAM

The exact enumeration should follow the existing project conventions.

6. Question Type Architecture

All question types should implement a common question contract.

Conceptually:

Question
│
├── SingleChoiceQuestion
├── MultipleChoiceQuestion
├── TrueFalseQuestion
├── ShortAnswerQuestion
├── FillBlankQuestion
├── EssayQuestion
├── MatchingQuestion
├── OrderingQuestion
├── DragDropQuestion
├── CategorizationQuestion
├── NumericalQuestion
├── FormulaQuestion
├── HotspotQuestion
├── ImageChoiceQuestion
├── ClozeQuestion
├── DropdownQuestion
├── LikertQuestion
├── RatingQuestion
├── FileUploadQuestion
├── CodeQuestion
├── SQLQuestion
├── AudioResponseQuestion
├── VideoResponseQuestion
├── OralQuestion
├── ScenarioQuestion
├── CaseStudyQuestion
└── CompositeQuestion

The question engine should provide shared functionality while allowing each question type to define its own configuration and grading behavior.

7. Common Question Model

Every question should contain common properties.

Recommended model:

{
  "id": "question-id",
  "type": "SINGLE_CHOICE",
  "version": 1,
  "title": "Capital City",
  "content": "...",
  "instructions": "...",
  "points": 5,
  "difficulty": "EASY",
  "categoryId": "category-id",
  "tags": [
    "geography",
    "rwanda"
  ],
  "gradingType": "AUTOMATIC",
  "status": "PUBLISHED"
}
8. Question Content

Question content should support rich content.

The question body should be capable of containing:

Plain text
Rich text
Images
Audio
Video
Links
Tables
Mathematical notation
Code blocks

Avoid storing complex UI structures as arbitrary HTML wherever possible.

Use a structured content model if the existing platform supports one.

9. Question Configuration

Question-specific configuration should be separated from common metadata.

Example:

{
  "type": "SINGLE_CHOICE",
  "configuration": {
    "options": [
      {
        "id": "a",
        "content": "Kigali",
        "isCorrect": true
      },
      {
        "id": "b",
        "content": "Nairobi",
        "isCorrect": false
      }
    ],
    "shuffleOptions": true
  }
}

This allows the same question engine to support many types.

10. Question Type Configuration
Single Choice
{
  "type": "SINGLE_CHOICE",
  "configuration": {
    "options": [],
    "shuffleOptions": true
  }
}
Multiple Choice
{
  "type": "MULTIPLE_CHOICE",
  "configuration": {
    "options": [],
    "shuffleOptions": true,
    "partialCredit": true
  }
}
True/False
{
  "type": "TRUE_FALSE",
  "configuration": {
    "correctAnswer": true
  }
}
Short Answer
{
  "type": "SHORT_ANSWER",
  "configuration": {
    "acceptedAnswers": [
      "Kigali",
      "kigali"
    ],
    "caseSensitive": false
  }
}
Fill in the Blank
{
  "type": "FILL_BLANK",
  "configuration": {
    "blanks": [
      {
        "id": "blank1",
        "acceptedAnswers": ["Kigali"]
      }
    ]
  }
}
Matching
{
  "type": "MATCHING",
  "configuration": {
    "pairs": [
      {
        "left": "Rwanda",
        "right": "Kigali"
      }
    ]
  }
}
Ordering
{
  "type": "ORDERING",
  "configuration": {
    "items": [
      {
        "id": "1",
        "position": 1
      },
      {
        "id": "2",
        "position": 2
      }
    ]
  }
}
Numerical
{
  "type": "NUMERICAL",
  "configuration": {
    "correctAnswer": 100,
    "tolerance": 0
  }
}
Numeric Range
{
  "type": "NUMERIC_RANGE",
  "configuration": {
    "minimum": 20,
    "maximum": 25
  }
}
Formula
{
  "type": "FORMULA",
  "configuration": {
    "formula": "pi * r * r",
    "variables": {
      "r": {
        "min": 2,
        "max": 10
      }
    },
    "tolerance": 0.01
  }
}
11. Interactive Question Types

Interactive questions should use a common interaction framework.

Supported types:

Drag & Drop
Categorization
Hotspot
Image Choice
Ordering

The frontend should render an appropriate interactive component based on:

question.type
12. Media Integration

Questions should support media attachments.

Example:

{
  "media": [
    {
      "type": "IMAGE",
      "url": "...",
      "altText": "Network topology"
    }
  ]
}

Supported:

IMAGE
AUDIO
VIDEO
DOCUMENT

Media should be stored using the platform's existing file/media infrastructure.

Do not store large binary files directly inside the question database record.

13. Question Bank Architecture

Questions should exist independently from assessments.

Example:

Question Bank
│
├── Database
│   ├── SQL
│   ├── Normalization
│   └── Transactions
│
├── Programming
│   ├── Python
│   ├── Java
│   └── JavaScript
│
└── Networking
    ├── TCP/IP
    └── Security

An assessment can then select questions from the bank.

14. Question Categories

Every question should optionally belong to:

Course
Module
Lesson
Topic
Subject
Category

Example:

Computer Science
    ↓
Database Systems
    ↓
SQL
    ↓
SELECT Queries
15. Question Tags

Questions should support multiple tags.

Example:

database
sql
beginner
joins
exam

Tags can be used for:

Search
Filtering
Random selection
Analytics
Exam generation
16. Question Difficulty

Questions should support:

EASY
MEDIUM
HARD

Optionally:

VERY_EASY
EASY
MEDIUM
HARD
VERY_HARD
17. Bloom's Taxonomy

Questions should optionally support:

REMEMBER
UNDERSTAND
APPLY
ANALYZE
EVALUATE
CREATE

This allows instructors to build assessments based on learning objectives.

18. Question Versioning

Question changes must not alter historical assessment results.

Example:

Question 100
    Version 1
    Version 2
    Version 3

When an assessment is published, the system should preserve the question version used by that assessment.

19. Assessment Model

An assessment should contain:

Assessment
├── ID
├── Course
├── Title
├── Description
├── Type
├── Instructions
├── Duration
├── Attempts Allowed
├── Passing Score
├── Randomization
├── Status
├── Start Date
├── End Date
└── Questions
20. Assessment Question

Do not directly depend on a question's current state.

Create an assessment-question relationship.

Example:

Assessment
    │
    ├── AssessmentQuestion
    │       ├── Question ID
    │       ├── Question Version
    │       ├── Position
    │       ├── Points
    │       └── Required

This allows the instructor to configure the same question differently in different assessments.

21. Assessment Randomization

Support:

Random Questions

Example:

Question Bank = 100
Assessment = 20 questions

The engine randomly selects 20.

Random Options

Randomize multiple-choice options.

Random Question Order

Questions appear in different order.

Random Numeric Values

Formula questions can generate different values per attempt.

22. Assessment Attempt

Every learner attempt should be stored separately.

Example:

Assessment Attempt
├── ID
├── Assessment ID
├── User ID
├── Attempt Number
├── Started At
├── Submitted At
├── Status
├── Score
├── Percentage
└── Passed
23. Attempt Status

Recommended statuses:

NOT_STARTED
IN_PROGRESS
SUBMITTED
AUTO_GRADED
PENDING_GRADING
GRADED
EXPIRED
CANCELLED
24. Answer Storage

Each answer should be stored separately.

Example:

Attempt
│
├── Answer 1
├── Answer 2
├── Answer 3
└── Answer 4

An answer should contain:

Answer
├── ID
├── Attempt ID
├── Question ID
├── Question Version
├── Response
├── Score
├── Max Score
├── Is Correct
├── Grading Status
├── Feedback
└── Graded At
25. Answer Data

Because different question types produce different responses, use a flexible response structure.

Example:

Single Choice
{
  "selectedOptionId": "option-a"
}
Multiple Choice
{
  "selectedOptionIds": [
    "option-a",
    "option-c"
  ]
}
Short Answer
{
  "text": "Kigali"
}
Matching
{
  "matches": [
    {
      "leftId": "rwanda",
      "rightId": "kigali"
    }
  ]
}
File Upload
{
  "files": [
    {
      "fileId": "file-123"
    }
  ]
}
26. Grading Engine

Create a centralized grading engine.

Conceptually:

Answer
   ↓
Grading Engine
   ↓
Question Type
   ↓
Question Grader
   ↓
Score
   ↓
Feedback

Example:

SingleChoiceGrader
MultipleChoiceGrader
ShortAnswerGrader
NumericalGrader
MatchingGrader
OrderingGrader
EssayGrader
CodeGrader
...
27. Automatic Grading

Automatically grade:

Single Choice
Multiple Choice
True/False
Short Answer
Fill Blank
Matching
Ordering
Numerical
Numeric Range
Formula
Hotspot
Drag & Drop
Categorization
28. Manual Grading

Manual grading should support:

Essay
Case Study
File Upload
Audio
Video
Presentation
Oral Response

The instructor should be able to:

Enter score
Add feedback
Use rubric
Save draft grading
Submit final grade
29. Hybrid Grading

Some questions can use:

Automatic initial score + Instructor adjustment

Example:

Automatic Score = 7/10

Instructor Adjustment = +1

Final Score = 8/10

The system should preserve the grading history.

30. Rubrics

For subjective questions, instructors should optionally create rubrics.

Example:

Criterion	Points
Understanding	4
Analysis	3
Evidence	2
Presentation	1
Total	10

Rubrics should be reusable.

31. Feedback

Questions should support:

Correct Feedback

Example:

Correct! Kigali is the capital of Rwanda.

Incorrect Feedback

Example:

Incorrect. The correct answer is Kigali.

General Explanation

The instructor can provide an explanation regardless of the learner's answer.

32. Immediate vs Delayed Feedback

Assessment configuration should control feedback.

Options:

IMMEDIATE
AFTER_SUBMISSION
AFTER_GRADING
AFTER_ASSESSMENT_CLOSE
NEVER

For exams, answers may remain hidden until the exam closes.

33. Timer

Assessments may have a time limit.

Example:

Duration = 60 minutes

The frontend should display the remaining time.

The backend must also enforce the deadline.

Do not trust the frontend timer.

When time expires:

IN_PROGRESS
      ↓
EXPIRED
      ↓
Automatic Submission
34. Autosave

Learner responses should be automatically saved.

Recommended behavior:

Learner changes answer
        ↓
Debounce
        ↓
Save response

The system should also save periodically.

Example:

Every 10–30 seconds

The exact interval should be configurable.

35. Resume Attempt

If an assessment allows resuming:

Learner closes browser
        ↓
Reopens Asa Academy
        ↓
Assessment
        ↓
Resume Attempt

Previously saved answers must be restored.

36. Navigation

Assessment configuration should support:

FREE_NAVIGATION
SEQUENTIAL
Free Navigation

Learner can move:

1 → 5 → 3 → 8 → 2
Sequential

Learner must follow:

1 → 2 → 3 → 4 → 5
37. Question Flagging

Learners should optionally be able to flag questions.

Example:

⚑ Review this question

The system stores:

attempt_id
question_id
flagged = true

The learner can later view:

Flagged Questions

38. Required Questions

An assessment may mark questions as required.

Example:

Question 1 — Required
Question 2 — Required
Question 3 — Optional

The submission rules should respect the configuration.

39. Passing Score

An assessment may define:

Passing Score = 70%

After grading:

Score >= 70
    ↓
PASSED

Otherwise:

FAILED
40. Attempts

Configure:

Attempts Allowed

Examples:

1
2
3
Unlimited

The system should enforce the limit server-side.

41. Highest / Latest / Average Score

For multiple attempts, the assessment can define the result calculation:

HIGHEST_SCORE
LATEST_SCORE
AVERAGE_SCORE
FIRST_ATTEMPT

Example:

Attempt	Score
1	60%
2	75%
3	68%

With HIGHEST_SCORE:

Final = 75%

42. Question-Level Analytics

Track:

Times answered
Correct responses
Incorrect responses
Average score
Difficulty
Average response time
Skip rate
Distractor selection

Example:

Question:
What is normalization?

Correct: 78%
Incorrect: 22%
Average Time: 34 seconds

This helps instructors identify problematic questions.

43. Assessment Analytics

Instructors should see:

Average score
Highest score
Lowest score
Pass rate
Failure rate
Completion rate
Average completion time
Question performance
44. Learner Results

The learner result page should show, according to assessment configuration:

Assessment: Database Fundamentals

Score: 82/100
Percentage: 82%
Status: PASSED
Attempt: 2 of 3

Correct: 18
Incorrect: 4
Skipped: 3

Whether individual answers are shown should be configurable.

45. Question Review

After submission, the learner may see:

Correct answer
Their answer
Explanation
Instructor feedback
Score

But only when the assessment configuration permits it.

46. Security Requirements

The question engine must prevent learners from retrieving correct answers before submission.

Never send:

isCorrect
correctAnswer
expectedAnswer

to the learner's browser unless the assessment is explicitly configured to reveal them.

Correct answers should remain server-side.

47. API Architecture

The exact endpoints should follow the existing Asa Academy API conventions.

Conceptually:

Questions

POST   /api/questions
GET    /api/questions
GET    /api/questions/:id
PUT    /api/questions/:id
DELETE /api/questions/:id

Question Bank

GET    /api/question-banks
POST   /api/question-banks

Assessments

POST   /api/assessments
GET    /api/assessments/:id
PUT    /api/assessments/:id
DELETE /api/assessments/:id

Attempts

POST   /api/assessments/:id/start
GET    /api/attempts/:id
POST   /api/attempts/:id/answers
POST   /api/attempts/:id/submit

Grading

GET    /api/attempts/:id/grading
POST   /api/answers/:id/grade

Results

GET    /api/attempts/:id/result
GET    /api/assessments/:id/results

These are conceptual APIs. Claude/developers should first inspect the existing project API structure.

48. Question Builder UI

The instructor should have a unified question creation screen.

Example:

Create Question

Question Type
[ Single Choice ▼ ]

Question
[ Rich Text Editor ]

Points
[ 5 ]

Difficulty
[ Medium ▼ ]

Category
[ Database ▼ ]

Tags
[ SQL ] [ Beginner ]

--------------------------------

Answer Options

○ Option A
○ Option B
○ Option C
○ Option D

[+ Add Option]

☑ Shuffle Options

--------------------------------

Explanation
[ Rich Text Editor ]

[Save Draft] [Publish]

When the type changes, the configuration section changes dynamically.

49. Dynamic Question Builder

Example:

SINGLE_CHOICE
        ↓
Options Builder

MULTIPLE_CHOICE
        ↓
Options + Multiple Correct Answers

ESSAY
        ↓
Rich Text + Word Limits + Rubric

NUMERICAL
        ↓
Answer + Tolerance

CODE
        ↓
Language + Editor + Test Cases

This avoids creating separate unrelated question management systems.

50. Assessment Builder

The instructor should be able to create:

Create Assessment

Title
Description
Assessment Type
Duration
Attempts
Passing Score

Questions

[+ Add Question]

[Question Bank]

[Random Questions]

[Save Draft]

[Publish]
51. Add Questions From Question Bank

The instructor should be able to:

Open Question Bank.
Filter questions.
Select questions.
Add them to assessment.
Configure points.
Configure ordering.
Save assessment.

Filters should include:

Type
Topic
Difficulty
Tags
Bloom level
Course
Status
52. Random Question Pools

An assessment can contain pools.

Example:

Section: SQL

Question Pool:
    50 available
    Select 10 randomly

Every learner can receive a different set.

53. Section-Based Assessments

An assessment may contain sections.

Example:

Final Database Exam

Section 1 — Fundamentals
10 questions

Section 2 — SQL
15 questions

Section 3 — Database Design
10 questions

Section 4 — Case Study
1 case study

Each section can have its own:

Instructions
Points
Randomization
Time constraints where supported
54. Composite Questions

Composite questions should support:

Case Study
    ↓
Question A
Question B
Question C
Question D

This allows a shared scenario or document to be used by several questions.

55. Code Questions

Code questions require a separate secure execution architecture.

Recommended:

Learner
   ↓
Code Editor
   ↓
API
   ↓
Code Execution Queue
   ↓
Sandbox / Isolated Container
   ↓
Test Cases
   ↓
Result
   ↓
Grading Engine

Never execute untrusted learner code directly in the main application process.

56. SQL Questions

SQL questions should use an isolated database environment.

Example:

Learner SQL
     ↓
Validation
     ↓
Sandbox Database
     ↓
Execute Query
     ↓
Compare Result
     ↓
Score

The learner must not have access to production databases.

57. File Upload Questions

Files should be:

Virus/malware scanned.
Size limited.
Type validated.
Stored in secure object/file storage.
Access-controlled.

Never trust only the file extension.

58. Audio and Video Questions

Media submissions should have:

File-size limits.
Duration limits.
Format validation.
Secure storage.
Access control.
Processing status.

Example:

UPLOADING
PROCESSING
READY
FAILED
59. Accessibility

All question types should support accessibility.

The platform should provide:

Keyboard navigation
Screen-reader support
Accessible labels
Alternative text
Focus management
Adequate contrast
Captions for video
Transcripts for audio where appropriate

Interactive questions must have an accessible alternative where practical.

60. Mobile Compatibility

The assessment engine must work on:

Desktop
Tablet
Mobile

Interactive questions should be designed for both mouse/touch interaction.

61. Offline / Connection Recovery

If technically supported, the assessment player should protect learner progress against temporary network failures.

At minimum:

Preserve local unsent answers.
Retry failed saves.
Warn the learner when connection is lost.
Synchronize when connection returns.

The server remains the authoritative source.

62. Localization

Questions should eventually support:

Multiple languages
Translated question content
Translated answer options
Localized instructions
Localized feedback

Question identity should remain consistent across translations.

63. Database Architecture

A recommended relational structure is:

users
courses
modules
lessons

question_banks
questions
question_versions
question_options
question_media
question_tags
tags

assessments
assessment_sections
assessment_questions

assessment_attempts
attempt_answers
answer_files

rubrics
rubric_criteria
answer_grades

assessment_results
audit_logs

This should be adapted to the existing Asa Academy database rather than blindly creating all tables.

64. Recommended Relationships
Course
  │
  ├── Question Bank
  │      │
  │      └── Questions
  │
  └── Assessments
          │
          ├── Sections
          │      │
          │      └── Assessment Questions
          │
          └── Attempts
                  │
                  └── Answers
65. Publishing Workflow

Questions should support:

DRAFT
       ↓
REVIEW
       ↓
PUBLISHED
       ↓
ARCHIVED

An assessment should also support:

DRAFT
SCHEDULED
PUBLISHED
CLOSED
ARCHIVED

Only published questions should normally be available for published assessments.

66. Instructor Permissions

Instructors should be able to manage questions associated with courses they are authorized to manage.

They should not automatically have access to every question in the platform.

67. Admin Permissions

Administrators may have:

Global question management
Question bank management
Assessment management
Instructor management
Analytics
Audit access

according to Asa Academy's authorization model.

68. Learner Permissions

Learners may:

View assigned assessments.
Start permitted attempts.
Submit answers.
View permitted results.

Learners must never have question-authoring privileges.

69. Performance Requirements

The question engine should be designed to support large question banks.

For example:

100,000+ Questions
10,000+ Assessments
Large concurrent assessment sessions

Use:

Pagination
Database indexing
Caching where appropriate
Lazy loading
Efficient answer persistence
Background processing for media/code execution
70. Audit Requirements

Record important actions:

QUESTION_CREATED
QUESTION_UPDATED
QUESTION_PUBLISHED
QUESTION_ARCHIVED
QUESTION_VERSION_CREATED

ASSESSMENT_CREATED
ASSESSMENT_PUBLISHED
ASSESSMENT_UPDATED

ATTEMPT_STARTED
ANSWER_SAVED
ATTEMPT_SUBMITTED

ANSWER_GRADED
RESULT_PUBLISHED

For important operations, record:

User
Timestamp
Resource
Action
Previous state where appropriate
New state where appropriate
71. Implementation Phases
Phase 1 — Foundation

Implement:

Question model
Question types
Question bank
Question CRUD
Question builder
Basic assessment
Attempts
Answers

Implement first:

Single Choice
Multiple Choice
True/False
Short Answer
Fill Blank
Essay
Phase 2 — Assessment Engine

Add:

Timer
Autosave
Attempts
Randomization
Question navigation
Results
Passing score
Feedback
Basic analytics
Phase 3 — Interactive Questions

Add:

Matching
Ordering
Drag & Drop
Categorization
Hotspot
Image Choice
Cloze
Dropdown
Phase 4 — Advanced Questions

Add:

Numerical
Numeric Range
Formula
Code
SQL
File Upload
Audio
Video
Oral
Case Study
Scenario
Composite
Phase 5 — Advanced Analytics

Add:

Question difficulty analysis
Bloom taxonomy analytics
Learner performance
Course performance
Assessment analytics
Question discrimination analysis
Item statistics
72. Definition of Done

The integrated question engine is considered complete when:

Instructors can create questions.
Questions can be organized into question banks.
All supported question types can be configured.
Questions can be added to assessments.
Assessments can be published.
Learners can start attempts.
Answers can be saved.
Answers can be submitted.
Automatic questions are graded.
Manual questions can be graded.
Partial credit works where configured.
Results are calculated correctly.
Feedback is displayed according to configuration.
Assessment timers are server-enforced.
Attempts are enforced server-side.
Randomization works correctly.
Historical question versions are preserved.
Question security prevents answer leakage.
Media submissions are secure.
Code execution is sandboxed.
SQL execution is isolated.
Accessibility requirements are addressed.
Instructor analytics are available.
Existing Asa Academy functionality continues to work.
Automated tests cover the assessment engine.
73. Recommended Final Architecture

The most important architectural principle for Asa Academy is:

                    QUESTION ENGINE
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
  QUESTION BANK     ASSESSMENT       GRADING ENGINE
        │                │                │
        │                ▼                │
        │             ATTEMPTS            │
        │                │                │
        │                ▼                │
        └──────────── ANSWERS ────────────┘
                         │
                         ▼
                      RESULTS
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
          LEARNER                INSTRUCTOR
           VIEW                    ANALYTICS

The key design decision is to avoid building 30 separate question systems. Instead, Asa Academy should have one common question/assessment framework with specialized configuration and grading handlers for each question type.