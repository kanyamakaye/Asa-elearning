ASA ACADEMY E-LEARNING PLATFORM
SYSTEM COMPONENTS AND DATABASE FIELDS
1. Introduction
The Asa Academy E-Learning Platform is a web-based learning management system designed to support online education, training, assessment, communication, administration, and academic reporting. The platform provides a centralized digital environment where students can register, enroll in courses, access learning materials, attend lessons, complete quizzes and assignments, view their results, monitor their learning progress, and obtain certificates after successful completion.
The platform also provides instructors with tools for creating and managing courses, organizing learning content, preparing assessments, grading student work, communicating with students, and monitoring learner performance. Administrators are responsible for managing users, courses, academic activities, payments, system configurations, reports, and overall platform operations.
The major components of the Asa Academy E-Learning Platform include user management, authentication, role and permission management, student management, instructor management, course management, course content management, enrollment management, assessment management, assignment management, progress tracking, grading, certification, communication, notifications, live classes, attendance, payment management, reporting and analytics, support services, and system security.
The following sections describe each system component and the main database fields required for its implementation.
________________________________________
2. User Management Component
The User Management Component manages all users who access the Asa Academy E-Learning Platform. It supports user registration, login, profile management, account activation, account suspension, password management, and user authorization.
The platform supports the following primary user roles:
•	Administrator
•	Instructor
•	Student
•	Academic Manager
•	Content Manager
•	Support Staff
User Table
Table Name: users
Fields:
•	user_id – Unique identifier for each user.
•	first_name – User's first name.
•	middle_name – User's middle name where applicable.
•	last_name – User's surname or family name.
•	username – Unique username used to identify the user.
•	email – User's email address.
•	phone_number – User's telephone number.
•	password_hash – Securely hashed version of the user's password.
•	profile_picture – Path or URL of the user's profile picture.
•	gender – User's gender where required.
•	date_of_birth – User's date of birth.
•	address – User's physical or postal address.
•	country – User's country of residence.
•	city – User's city of residence.
•	status – Indicates whether the account is active, inactive, suspended, or blocked.
•	email_verified – Indicates whether the user's email has been verified.
•	last_login_at – Date and time of the user's most recent login.
•	created_at – Date and time when the account was created.
•	updated_at – Date and time when the account was last updated.
________________________________________
3. Authentication Management Component
The Authentication Management Component controls secure access to the Asa Academy platform. It allows users to log in, log out, recover forgotten passwords, verify their email addresses, and maintain secure sessions.
The component ensures that users can only access functions and information permitted by their assigned roles.
Authentication Fields
The authentication functionality uses information from the users, password_reset_tokens, email_verification_tokens, and login_history tables.
Main fields include:
•	email – User's registered email address.
•	username – User's registered username.
•	password_hash – Securely stored password hash.
•	email_verified – Email verification status.
•	status – Account status.
•	last_login_at – Last successful login.
•	reset_token – Temporary password recovery token.
•	expires_at – Expiration date of the recovery or verification token.
•	verified_at – Date and time of email verification.
________________________________________
4. Role Management Component
The Role Management Component determines the responsibilities and access levels of different users within the Asa Academy platform.
For example, administrators can manage the entire system, instructors can create and manage courses, and students can access learning resources and assessments for courses in which they are enrolled.
Roles Table
Table Name: roles
Fields:
•	role_id – Unique identifier for the role.
•	role_name – Name of the role, such as Administrator, Instructor, or Student.
•	description – Description of the responsibilities associated with the role.
•	status – Indicates whether the role is active or inactive.
•	created_at – Date and time when the role was created.
•	updated_at – Date and time when the role was modified.
User Roles Table
Table Name: user_roles
Fields:
•	user_role_id – Unique identifier for the user-role relationship.
•	user_id – References the user.
•	role_id – References the assigned role.
•	assigned_at – Date and time when the role was assigned.
________________________________________
5. Permission Management Component
The Permission Management Component provides detailed access control for Asa Academy system functions.
Permissions determine exactly what actions a user or role is allowed to perform.
Examples of permissions include:
•	Create course
•	Edit course
•	Delete course
•	Publish course
•	Enroll student
•	Manage users
•	Create quiz
•	Create assignment
•	Grade assignment
•	View reports
•	Manage payments
•	Issue certificates
•	Manage system settings
Permissions Table
Table Name: permissions
Fields:
•	permission_id – Unique identifier for the permission.
•	permission_name – Name of the permission.
•	permission_code – Unique code representing the permission.
•	description – Description of the permission.
•	created_at – Date and time when the permission was created.
Role Permissions Table
Table Name: role_permissions
Fields:
•	role_permission_id – Unique identifier.
•	role_id – References a particular role.
•	permission_id – References a specific permission.
________________________________________
6. Student Profile Management Component
The Student Profile Management Component stores personal, academic, and learning-related information about Asa Academy students.
Student Profiles Table
Table Name: student_profiles
Fields:
•	student_profile_id – Unique student profile identifier.
•	user_id – References the student's user account.
•	student_number – Unique student registration number.
•	institution_name – Name of the student's institution where applicable.
•	department – Student's department where applicable.
•	program – Student's academic or training program.
•	academic_level – Current academic or training level.
•	admission_date – Date when the student joined Asa Academy.
•	expected_completion_date – Expected date of program completion.
•	biography – Optional short description of the student.
•	created_at – Profile creation date.
•	updated_at – Profile modification date.
________________________________________
7. Instructor Profile Management Component
The Instructor Profile Management Component stores professional and academic information about Asa Academy instructors.
Instructor Profiles Table
Table Name: instructor_profiles
Fields:
•	instructor_profile_id – Unique instructor profile identifier.
•	user_id – References the instructor's user account.
•	staff_number – Unique staff or employee number.
•	qualification – Instructor's academic or professional qualification.
•	specialization – Instructor's field of specialization.
•	department – Department or academic area of the instructor.
•	biography – Professional biography of the instructor.
•	years_of_experience – Number of years of teaching or professional experience.
•	profile_photo – Instructor's profile photograph.
•	created_at – Profile creation date.
•	updated_at – Profile modification date.
________________________________________
8. Course Category Management Component
The Course Category Management Component organizes Asa Academy courses into meaningful categories.
Examples may include:
•	Information Technology
•	Software Development
•	Data Science
•	Business
•	Accounting
•	Digital Marketing
•	Languages
•	Professional Development
•	Other specialized training areas
Course Categories Table
Table Name: course_categories
Fields:
•	category_id – Unique identifier for the category.
•	category_name – Name of the course category.
•	description – Description of the category.
•	category_image – Image representing the category.
•	status – Indicates whether the category is active or inactive.
•	created_at – Date the category was created.
•	updated_at – Date the category was updated.
________________________________________
9. Course Management Component
The Course Management Component is one of the core components of the Asa Academy E-Learning Platform. It enables authorized instructors and administrators to create, edit, organize, publish, archive, and manage courses.
Courses Table
Table Name: courses
Fields:
•	course_id – Unique identifier for the course.
•	course_code – Unique code assigned to the course.
•	course_title – Name of the course.
•	course_slug – URL-friendly version of the course name.
•	course_description – Detailed description of the course.
•	short_description – Brief introduction to the course.
•	category_id – References the course category.
•	instructor_id – References the primary instructor.
•	difficulty_level – Beginner, Intermediate, or Advanced.
•	language – Main language used to deliver the course.
•	duration_hours – Estimated total learning duration.
•	course_image – Main image associated with the course.
•	course_video – Introductory course video where applicable.
•	price – Course price where applicable.
•	is_free – Indicates whether the course is free.
•	status – Draft, Published, Archived, or Suspended.
•	enrollment_limit – Maximum number of learners permitted.
•	start_date – Planned course start date.
•	end_date – Planned course completion date.
•	certificate_enabled – Indicates whether certificates are available.
•	created_at – Course creation date.
•	updated_at – Course modification date.
________________________________________
10. Course Instructor Management Component
A course may be delivered by one or more instructors. This component manages instructors assigned to Asa Academy courses.
Course Instructors Table
Table Name: course_instructors
Fields:
•	course_instructor_id – Unique identifier.
•	course_id – References the course.
•	instructor_id – References the instructor.
•	instructor_role – Lead Instructor, Assistant Instructor, Tutor, or Moderator.
•	assigned_at – Date the instructor was assigned to the course.
________________________________________
11. Course Module Management Component
The Course Module Management Component divides courses into organized sections or modules.
Course Modules Table
Table Name: course_modules
Fields:
•	module_id – Unique module identifier.
•	course_id – References the course.
•	module_title – Name of the module.
•	module_description – Description of the module.
•	module_order – Position of the module within the course.
•	status – Indicates whether the module is active, inactive, or hidden.
•	created_at – Module creation date.
•	updated_at – Module modification date.
________________________________________
12. Lesson Management Component
The Lesson Management Component manages individual lessons belonging to course modules.
Lessons are the primary units through which students consume Asa Academy learning content.
Lessons Table
Table Name: lessons
Fields:
•	lesson_id – Unique lesson identifier.
•	module_id – References the course module.
•	lesson_title – Title of the lesson.
•	lesson_description – Description of the lesson.
•	lesson_type – Video, Text, Audio, PDF, Presentation, Live Session, or External Link.
•	lesson_content – Main written or HTML learning content.
•	content_url – URL to external learning material where applicable.
•	video_url – URL or path to the lesson video.
•	duration_minutes – Estimated lesson duration.
•	lesson_order – Position of the lesson within the module.
•	is_preview – Indicates whether the lesson is accessible before enrollment.
•	status – Draft, Published, or Hidden.
•	created_at – Lesson creation date.
•	updated_at – Lesson modification date.
________________________________________
13. Learning Resource Management Component
The Learning Resource Management Component manages educational materials attached to Asa Academy courses and lessons.
Resources may include documents, presentations, PDFs, videos, audio files, images, and external learning links.
Learning Resources Table
Table Name: learning_resources
Fields:
•	resource_id – Unique identifier for the learning resource.
•	course_id – References the course.
•	lesson_id – References the associated lesson.
•	resource_title – Name of the learning resource.
•	resource_type – PDF, Document, Presentation, Video, Audio, Image, or Link.
•	file_url – File path or resource URL.
•	file_name – Original file name.
•	file_size – Size of the uploaded file.
•	mime_type – Technical file type.
•	is_downloadable – Indicates whether students can download the resource.
•	uploaded_by – References the user who uploaded the resource.
•	created_at – Resource upload date.
________________________________________
14. Course Enrollment Management Component
The Course Enrollment Management Component manages the relationship between Asa Academy students and courses.
It records when students join courses and monitors their enrollment status.
Enrollments Table
Table Name: enrollments
Fields:
•	enrollment_id – Unique identifier for the enrollment.
•	student_id – References the student.
•	course_id – References the course.
•	enrollment_date – Date when the student enrolled.
•	enrollment_status – Pending, Active, Completed, Cancelled, or Suspended.
•	completion_percentage – Percentage of the course completed.
•	completed_at – Date when the student completed the course.
•	final_grade – Overall course grade.
•	certificate_issued – Indicates whether a certificate was issued.
•	created_at – Enrollment creation date.
•	updated_at – Enrollment update date.
________________________________________
15. Student Learning Progress Component
The Student Learning Progress Component tracks each student's progress through Asa Academy courses and lessons.
Lesson Progress Table
Table Name: lesson_progress
Fields:
•	progress_id – Unique progress identifier.
•	student_id – References the student.
•	course_id – References the course.
•	lesson_id – References the lesson.
•	progress_percentage – Percentage of the lesson completed.
•	is_completed – Indicates whether the lesson has been completed.
•	started_at – Date and time when the student started the lesson.
•	completed_at – Date and time when the lesson was completed.
•	last_accessed_at – Most recent time the student accessed the lesson.
•	time_spent_seconds – Total time spent studying the lesson.
________________________________________
16. Quiz Management Component
The Quiz Management Component enables Asa Academy instructors to create and manage online quizzes.
Quizzes Table
Table Name: quizzes
Fields:
•	quiz_id – Unique quiz identifier.
•	course_id – References the course.
•	module_id – References the module where applicable.
•	lesson_id – References the lesson where applicable.
•	quiz_title – Name of the quiz.
•	quiz_description – Quiz instructions and description.
•	duration_minutes – Maximum time allowed for the quiz.
•	total_marks – Maximum marks available.
•	passing_marks – Minimum marks required to pass.
•	attempt_limit – Maximum number of attempts allowed.
•	shuffle_questions – Indicates whether question order should be randomized.
•	show_answers – Indicates whether answers are displayed after submission.
•	available_from – Date and time when the quiz becomes available.
•	available_until – Date and time when the quiz closes.
•	status – Draft, Published, or Closed.
•	created_by – References the instructor or administrator.
•	created_at – Quiz creation date.
•	updated_at – Quiz modification date.
________________________________________
17. Quiz Question Management Component
This component stores individual questions used in Asa Academy quizzes.
Quiz Questions Table
Table Name: quiz_questions
Fields:
•	question_id – Unique question identifier.
•	quiz_id – References the quiz.
•	question_text – Actual question presented to the student.
•	question_type – Multiple Choice, True/False, Short Answer, Essay, Matching, or Fill in the Blank.
•	marks – Marks assigned to the question.
•	question_order – Position of the question.
•	explanation – Explanation provided after answering where applicable.
•	created_at – Question creation date.
•	updated_at – Question modification date.
________________________________________
18. Quiz Answer Option Component
This component stores answer options for objective questions.
Question Options Table
Table Name: question_options
Fields:
•	option_id – Unique identifier.
•	question_id – References the question.
•	option_text – Text displayed to the student.
•	is_correct – Indicates whether the option is correct.
•	option_order – Position of the option.
________________________________________
19. Quiz Attempt Management Component
The Quiz Attempt Management Component records every attempt made by a student on an Asa Academy quiz.
Quiz Attempts Table
Table Name: quiz_attempts
Fields:
•	attempt_id – Unique attempt identifier.
•	quiz_id – References the quiz.
•	student_id – References the student.
•	attempt_number – Number of the student's attempt.
•	started_at – Date and time the attempt started.
•	submitted_at – Date and time the attempt was submitted.
•	score – Marks obtained.
•	percentage – Percentage score.
•	passed – Indicates whether the student passed.
•	status – In Progress, Submitted, or Graded.
________________________________________
20. Student Quiz Answer Component
This component records answers submitted by students during quiz attempts.
Quiz Answers Table
Table Name: quiz_answers
Fields:
•	answer_id – Unique answer identifier.
•	attempt_id – References the quiz attempt.
•	question_id – References the quiz question.
•	selected_option_id – References the selected answer option where applicable.
•	answer_text – Student's written response.
•	marks_awarded – Marks awarded for the answer.
•	is_correct – Indicates whether the answer is correct.
•	graded_by – References the instructor who graded the response.
•	graded_at – Date and time of grading.
________________________________________
21. Assignment Management Component
The Assignment Management Component enables instructors to create coursework and collect student submissions.
Assignments Table
Table Name: assignments
Fields:
•	assignment_id – Unique assignment identifier.
•	course_id – References the course.
•	module_id – References the module.
•	assignment_title – Assignment title.
•	assignment_description – Detailed assignment instructions.
•	maximum_marks – Maximum marks available.
•	passing_marks – Minimum passing mark where applicable.
•	due_date – Assignment submission deadline.
•	allow_late_submission – Indicates whether late submissions are accepted.
•	attachment_url – File attached to the assignment.
•	status – Draft, Published, or Closed.
•	created_by – References the instructor.
•	created_at – Assignment creation date.
•	updated_at – Assignment modification date.
________________________________________
22. Assignment Submission Component
The Assignment Submission Component stores coursework submitted by students.
Assignment Submissions Table
Table Name: assignment_submissions
Fields:
•	submission_id – Unique submission identifier.
•	assignment_id – References the assignment.
•	student_id – References the student.
•	submission_text – Written assignment content.
•	file_url – Uploaded assignment file.
•	submitted_at – Date and time of submission.
•	is_late – Indicates whether the submission was late.
•	marks_awarded – Marks awarded to the submission.
•	feedback – Instructor feedback.
•	graded_by – References the instructor.
•	graded_at – Date and time when grading was completed.
•	submission_status – Submitted, Graded, Returned, or Resubmitted.
________________________________________
23. Grade and Results Management Component
The Grade and Results Management Component manages student academic performance across quizzes, assignments, examinations, and other assessments.
Grades Table
Table Name: grades
Fields:
•	grade_id – Unique grade identifier.
•	student_id – References the student.
•	course_id – References the course.
•	assessment_type – Quiz, Assignment, Exam, Project, or Participation.
•	assessment_id – References the corresponding assessment.
•	marks_obtained – Marks achieved by the student.
•	maximum_marks – Maximum available marks.
•	percentage – Percentage result.
•	letter_grade – Grade such as A, B, C, D, or F.
•	remarks – Additional instructor comments.
•	graded_by – References the instructor.
•	graded_at – Date and time when the grade was recorded.
________________________________________
24. Examination Management Component
The Examination Management Component manages formal online examinations conducted through the Asa Academy platform.
Exams Table
Table Name: exams
Fields:
•	exam_id – Unique examination identifier.
•	course_id – References the course.
•	exam_title – Examination title.
•	exam_description – Examination instructions.
•	exam_date – Examination date.
•	start_time – Examination starting time.
•	end_time – Examination ending time.
•	duration_minutes – Allowed examination duration.
•	total_marks – Maximum marks.
•	passing_marks – Minimum passing score.
•	attempt_limit – Maximum number of permitted attempts.
•	status – Scheduled, Active, Completed, or Cancelled.
•	created_by – User who created the examination.
•	created_at – Examination creation date.
•	updated_at – Last modification date.
________________________________________
25. Certificate Management Component
The Certificate Management Component generates and manages digital certificates for students who successfully complete eligible Asa Academy courses.
Certificates Table
Table Name: certificates
Fields:
•	certificate_id – Unique certificate identifier.
•	certificate_number – Unique certificate reference number.
•	student_id – References the student.
•	course_id – References the completed course.
•	enrollment_id – References the student's enrollment.
•	issue_date – Date when the certificate was issued.
•	certificate_url – Path or URL to the generated certificate.
•	verification_code – Code used to verify certificate authenticity.
•	status – Active, Revoked, or Expired.
•	created_at – Certificate creation date.
________________________________________
26. Discussion Forum Component
The Discussion Forum Component provides a communication environment where Asa Academy students and instructors can discuss course-related subjects.
Discussion Topics Table
Table Name: discussion_topics
Fields:
•	topic_id – Unique discussion topic identifier.
•	course_id – References the course.
•	created_by – References the user who created the topic.
•	title – Discussion topic title.
•	description – Initial discussion content.
•	is_pinned – Indicates whether the topic is pinned.
•	is_locked – Indicates whether additional replies are allowed.
•	status – Active, Closed, or Hidden.
•	created_at – Topic creation date.
•	updated_at – Last update date.
Discussion Replies Table
Table Name: discussion_replies
Fields:
•	reply_id – Unique reply identifier.
•	topic_id – References the discussion topic.
•	user_id – References the user who posted the reply.
•	reply_text – Content of the reply.
•	parent_reply_id – References another reply where nested replies are supported.
•	created_at – Reply posting date.
•	updated_at – Reply modification date.
________________________________________
27. Announcement Management Component
The Announcement Management Component allows Asa Academy administrators and instructors to communicate important information to users.
Announcements Table
Table Name: announcements
Fields:
•	announcement_id – Unique announcement identifier.
•	course_id – Course associated with the announcement where applicable.
•	title – Announcement title.
•	message – Announcement content.
•	created_by – User who created the announcement.
•	audience_type – Students, Instructors, All Users, or Specific Course.
•	publish_date – Date when the announcement becomes visible.
•	expiry_date – Date after which the announcement is no longer displayed.
•	status – Draft, Published, or Archived.
•	created_at – Announcement creation date.
•	updated_at – Announcement modification date.
________________________________________
28. Notification Management Component
The Notification Management Component provides automatic notifications to Asa Academy users.
Notifications may inform users about:
•	New courses
•	Course enrollment
•	New lessons
•	New assignments
•	Upcoming deadlines
•	Quiz availability
•	Examination schedules
•	Assessment results
•	Instructor feedback
•	Announcements
•	Certificates
•	Live classes
Notifications Table
Table Name: notifications
Fields:
•	notification_id – Unique notification identifier.
•	user_id – User receiving the notification.
•	notification_type – Type or category of notification.
•	title – Notification title.
•	message – Notification content.
•	reference_type – Related entity such as Course, Quiz, Assignment, or Certificate.
•	reference_id – Identifier of the related record.
•	is_read – Indicates whether the notification has been read.
•	read_at – Date and time when the notification was opened.
•	created_at – Notification creation date.
________________________________________
29. Internal Messaging Component
The Internal Messaging Component allows students, instructors, and authorized staff to communicate privately within the Asa Academy platform.
Messages Table
Table Name: messages
Fields:
•	message_id – Unique message identifier.
•	sender_id – References the sender.
•	receiver_id – References the recipient.
•	subject – Message subject.
•	message_body – Main message content.
•	attachment_url – Optional attachment.
•	is_read – Indicates whether the message has been read.
•	read_at – Date and time when the message was read.
•	sent_at – Date and time when the message was sent.
________________________________________
30. Live Class Management Component
The Live Class Management Component manages real-time online classes conducted by Asa Academy instructors.
Live Sessions Table
Table Name: live_sessions
Fields:
•	session_id – Unique session identifier.
•	course_id – References the course.
•	instructor_id – Instructor leading the session.
•	session_title – Title of the live class.
•	description – Description of the session.
•	meeting_platform – Online meeting platform used.
•	meeting_url – Link used to join the session.
•	meeting_id – Meeting identification number where applicable.
•	meeting_password – Meeting access password where applicable.
•	scheduled_date – Scheduled session date.
•	start_time – Session starting time.
•	end_time – Session ending time.
•	status – Scheduled, Live, Completed, or Cancelled.
•	recording_url – Link to the recorded session where applicable.
•	created_at – Session creation date.
________________________________________
31. Attendance Management Component
The Attendance Management Component records student participation in scheduled Asa Academy live classes and learning sessions.
Attendance Table
Table Name: attendance
Fields:
•	attendance_id – Unique attendance identifier.
•	course_id – References the course.
•	student_id – References the student.
•	session_id – References the scheduled class session.
•	attendance_date – Date of attendance.
•	attendance_status – Present, Absent, Late, or Excused.
•	check_in_time – Student check-in time.
•	remarks – Additional attendance notes.
•	recorded_by – User who recorded the attendance.
________________________________________
32. Course Review and Rating Component
The Course Review and Rating Component allows students to provide feedback and ratings for completed or enrolled courses.
Course Reviews Table
Table Name: course_reviews
Fields:
•	review_id – Unique review identifier.
•	course_id – References the course.
•	student_id – References the student.
•	rating – Numerical course rating.
•	review_text – Written student feedback.
•	status – Pending, Approved, or Rejected.
•	created_at – Review submission date.
•	updated_at – Review modification date.
________________________________________
33. Wishlist Component
The Wishlist Component allows students to save courses that they are interested in taking in the future.
Wishlists Table
Table Name: wishlists
Fields:
•	wishlist_id – Unique wishlist identifier.
•	student_id – References the student.
•	course_id – References the saved course.
•	created_at – Date the course was added to the wishlist.
________________________________________
34. Payment Management Component
The Payment Management Component manages payments for paid Asa Academy courses and training programs.
Payments Table
Table Name: payments
Fields:
•	payment_id – Unique payment identifier.
•	student_id – References the student.
•	course_id – References the purchased course.
•	transaction_reference – Unique payment transaction reference.
•	amount – Amount paid.
•	currency – Currency used for the payment.
•	payment_method – Payment method used.
•	payment_provider – Payment service provider.
•	payment_status – Pending, Successful, Failed, Cancelled, or Refunded.
•	payment_date – Date and time of payment.
•	provider_reference – Reference supplied by the payment provider.
•	created_at – Date the payment record was created.
________________________________________
35. Refund Management Component
The Refund Management Component manages requests for refunds associated with paid Asa Academy courses.
Refunds Table
Table Name: refunds
Fields:
•	refund_id – Unique refund identifier.
•	payment_id – References the original payment.
•	student_id – References the student.
•	refund_amount – Amount requested for refund.
•	refund_reason – Reason for requesting the refund.
•	refund_status – Pending, Approved, Rejected, or Completed.
•	processed_by – Administrator responsible for processing the refund.
•	requested_at – Date of the refund request.
•	processed_at – Date the refund was processed.
________________________________________
36. Support Ticket Management Component
The Support Ticket Management Component allows Asa Academy users to report technical, academic, account, payment, or other platform-related issues.
Support Tickets Table
Table Name: support_tickets
Fields:
•	ticket_id – Unique support ticket identifier.
•	user_id – User who opened the ticket.
•	subject – Ticket subject.
•	description – Detailed explanation of the issue.
•	category – Technical, Academic, Payment, Account, or General.
•	priority – Low, Medium, High, or Urgent.
•	status – Open, In Progress, Resolved, or Closed.
•	assigned_to – Support staff member responsible for the ticket.
•	created_at – Ticket creation date.
•	resolved_at – Date the issue was resolved.
________________________________________
37. Frequently Asked Questions Component
The FAQ Component provides common questions and answers to help Asa Academy users obtain information quickly.
FAQ Table
Table Name: faqs
Fields:
•	faq_id – Unique FAQ identifier.
•	question – Frequently asked question.
•	answer – Corresponding answer.
•	category – FAQ category.
•	display_order – Position of the FAQ.
•	status – Active or Inactive.
•	created_at – FAQ creation date.
•	updated_at – FAQ modification date.
________________________________________
38. File Management Component
The File Management Component controls files uploaded to the Asa Academy platform, including course materials, assignments, profile images, certificates, and other documents.
Uploaded Files Table
Table Name: uploaded_files
Fields:
•	file_id – Unique file identifier.
•	uploaded_by – User who uploaded the file.
•	original_name – Original file name.
•	stored_name – Name assigned to the file by the system.
•	file_path – File storage location.
•	file_url – File access URL.
•	mime_type – Technical file type.
•	file_size – File size.
•	file_category – Course Resource, Assignment, Profile Picture, Certificate, or other category.
•	created_at – File upload date.
________________________________________
39. Academic Calendar Component
The Academic Calendar Component manages important Asa Academy academic activities and events.
Academic Events Table
Table Name: academic_events
Fields:
•	event_id – Unique event identifier.
•	event_title – Name of the event.
•	event_description – Detailed event information.
•	event_type – Examination, Assignment, Holiday, Live Class, Deadline, or General Event.
•	course_id – References a course where applicable.
•	start_datetime – Event starting date and time.
•	end_datetime – Event ending date and time.
•	created_by – User who created the event.
•	status – Active, Cancelled, or Completed.
•	created_at – Event creation date.
________________________________________
40. System Feedback Component
The System Feedback Component collects feedback from Asa Academy users about the quality and functionality of the platform.
Feedback Table
Table Name: feedback
Fields:
•	feedback_id – Unique feedback identifier.
•	user_id – User submitting the feedback.
•	feedback_type – Suggestion, Complaint, Appreciation, or Technical Issue.
•	subject – Feedback subject.
•	message – Detailed feedback.
•	rating – Optional satisfaction rating.
•	status – New, Reviewed, or Closed.
•	created_at – Feedback submission date.
________________________________________
41. System Settings Component
The System Settings Component stores configurable settings used throughout the Asa Academy platform.
System Settings Table
Table Name: system_settings
Fields:
•	setting_id – Unique setting identifier.
•	setting_key – Unique setting name.
•	setting_value – Current setting value.
•	setting_type – Text, Number, Boolean, JSON, or other data type.
•	description – Explanation of the setting.
•	updated_by – Administrator who modified the setting.
•	updated_at – Date and time when the setting was modified.
Examples include:
•	Academy name
•	Academy logo
•	Default language
•	Email configuration
•	File upload limit
•	Certificate settings
•	Course enrollment settings
•	Payment configuration
•	Maintenance mode
•	Notification settings
________________________________________
42. Audit Log Component
The Audit Log Component records important activities performed by users within the Asa Academy platform for security, monitoring, accountability, and troubleshooting.
Audit Logs Table
Table Name: audit_logs
Fields:
•	audit_id – Unique audit record identifier.
•	user_id – User responsible for the activity.
•	action – Action performed by the user.
•	entity_type – Type of affected record.
•	entity_id – Identifier of the affected record.
•	old_values – Previous values before the change.
•	new_values – New values after the change.
•	ip_address – IP address from which the activity originated.
•	user_agent – Browser or device information.
•	created_at – Date and time of the activity.
________________________________________
43. Login History Component
The Login History Component records authentication activities performed on the Asa Academy platform.
Login History Table
Table Name: login_history
Fields:
•	login_id – Unique login history identifier.
•	user_id – References the user.
•	ip_address – User's IP address.
•	device_information – Information about the user's device.
•	browser_information – Information about the user's browser.
•	login_status – Successful or Failed.
•	login_at – Date and time of login.
•	logout_at – Date and time of logout.
________________________________________
44. Password Reset Component
The Password Reset Component enables users to securely recover access to their Asa Academy accounts when they forget their passwords.
Password Reset Tokens Table
Table Name: password_reset_tokens
Fields:
•	reset_id – Unique identifier.
•	user_id – References the user.
•	reset_token – Secure password recovery token.
•	expires_at – Date and time when the token expires.
•	used_at – Date and time when the token was used.
•	created_at – Token creation date.
________________________________________
45. Email Verification Component
The Email Verification Component confirms that user email addresses registered with Asa Academy are valid and controlled by the respective users.
Email Verification Tokens Table
Table Name: email_verification_tokens
Fields:
•	verification_id – Unique identifier.
•	user_id – References the user.
•	verification_token – Secure email verification token.
•	expires_at – Token expiration date and time.
•	verified_at – Date and time when the email was verified.
•	created_at – Token creation date.
________________________________________
46. Reporting and Analytics Component
The Reporting and Analytics Component provides administrators and instructors with information required to monitor the performance of Asa Academy and its learners.
The system can generate reports such as:
•	Total number of registered students
•	Total number of instructors
•	Total number of courses
•	Active course enrollments
•	Completed courses
•	Student completion rates
•	Course performance
•	Quiz performance
•	Assignment performance
•	Examination results
•	Student attendance
•	Certificate issuance
•	Student engagement
•	Popular courses
•	Course ratings
•	Course dropout rates
•	Payment and revenue reports
•	Monthly enrollment reports
Most reports can be generated dynamically from existing database records rather than storing duplicate reporting data.
________________________________________
47. Dashboard Component
The Dashboard Component provides users with a summarized view of information relevant to their responsibilities within Asa Academy.
Administrator Dashboard
The administrator dashboard may display:
•	Total registered users
•	Active students
•	Total instructors
•	Published courses
•	Draft courses
•	Active enrollments
•	Completed courses
•	Total payments
•	Revenue information
•	Recent system activities
•	Open support tickets
•	Course performance statistics
•	Certificate statistics
Instructor Dashboard
The instructor dashboard may display:
•	Courses created
•	Total enrolled students
•	Upcoming live classes
•	Pending assignments to grade
•	Recent student discussions
•	Course completion rates
•	Student results
•	Course ratings
•	Upcoming assessments
Student Dashboard
The student dashboard may display:
•	Enrolled courses
•	Recently accessed lessons
•	Course progress percentage
•	Upcoming assignments
•	Upcoming quizzes
•	Examination schedules
•	Grades and results
•	Certificates
•	Notifications
•	Live classes
•	Saved courses
________________________________________
48. Search and Filtering Component
The Search and Filtering Component enables Asa Academy users to find courses and learning resources efficiently.
Users may search using:
•	Course title
•	Course code
•	Instructor name
•	Category
•	Keyword
•	Difficulty level
•	Language
Filtering may also be provided according to:
•	Free or paid course
•	Course rating
•	Publication date
•	Course duration
•	Course category
•	Difficulty level
________________________________________
49. Database Relationship Summary
The main relationships within the Asa Academy E-Learning Platform include the following:
•	One user can have one or more roles.
•	One role can contain multiple permissions.
•	One user can have one student or instructor profile where applicable.
•	One instructor can manage multiple courses.
•	One course can have multiple instructors.
•	One category can contain multiple courses.
•	One course can contain multiple modules.
•	One module can contain multiple lessons.
•	One lesson can contain multiple learning resources.
•	One student can enroll in multiple courses.
•	One course can have multiple enrolled students.
•	One student can have multiple lesson progress records.
•	One course can contain multiple quizzes.
•	One quiz can contain multiple questions.
•	One question can contain multiple answer options.
•	One student can make multiple quiz attempts.
•	One quiz attempt can contain multiple answers.
•	One course can contain multiple assignments.
•	One assignment can receive multiple student submissions.
•	One student can receive multiple grades.
•	One student can receive multiple certificates.
•	One course can contain multiple discussion topics.
•	One discussion topic can contain multiple replies.
•	One user can receive multiple notifications.
•	One user can send and receive multiple messages.
•	One course can have multiple live sessions.
•	One live session can have multiple attendance records.
•	One student can make multiple course reviews.
•	One student can save multiple courses in a wishlist.
•	One student can make multiple payments.
•	One payment can have associated refund records.
•	One user can create multiple support tickets.
•	One user can generate multiple audit log records.
•	One user can have multiple login history records.
________________________________________
50. Major Asa Academy System Components Summary
The complete Asa Academy E-Learning Platform contains the following major components:
1.	User Management
2.	Authentication Management
3.	Role Management
4.	Permission Management
5.	Student Profile Management
6.	Instructor Profile Management
7.	Course Category Management
8.	Course Management
9.	Course Instructor Management
10.	Course Module Management
11.	Lesson Management
12.	Learning Resource Management
13.	Course Enrollment Management
14.	Student Learning Progress Tracking
15.	Quiz Management
16.	Quiz Question Management
17.	Quiz Answer Option Management
18.	Quiz Attempt Management
19.	Student Quiz Answer Management
20.	Assignment Management
21.	Assignment Submission Management
22.	Grade and Results Management
23.	Examination Management
24.	Certificate Management
25.	Discussion Forum Management
26.	Announcement Management
27.	Notification Management
28.	Internal Messaging
29.	Live Class Management
30.	Attendance Management
31.	Course Review and Rating
32.	Wishlist Management
33.	Payment Management
34.	Refund Management
35.	Support Ticket Management
36.	FAQ Management
37.	File Management
38.	Academic Calendar Management
39.	System Feedback Management
40.	System Configuration
41.	Audit Logging
42.	Login History
43.	Password Recovery
44.	Email Verification
45.	Reporting and Analytics
46.	Dashboard Management
47.	Search and Filtering
________________________________________
51. Conclusion
The Asa Academy E-Learning Platform is designed as an integrated online learning environment that supports the complete educational and administrative lifecycle of the academy.
The platform enables administrators to manage users, instructors, students, courses, payments, reports, system settings, and security activities. Instructors can create and organize courses, upload learning materials, conduct live classes, prepare quizzes and assignments, assess students, provide feedback, and monitor learner performance. Students can create accounts, enroll in courses, access learning materials, attend online classes, complete quizzes and assignments, view grades, monitor their learning progress, participate in discussions, and receive certificates after meeting course completion requirements.
The proposed database structure provides a strong foundation for implementing the Asa Academy platform in a secure, scalable, and maintainable manner. The modular design also allows the platform to be extended in the future with mobile applications, advanced analytics, artificial intelligence-based learning recommendations, automated assessments, multilingual learning content, virtual classrooms, payment integrations, and other educational technologies.
