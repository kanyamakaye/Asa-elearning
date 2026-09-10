Software Requirements Specification (SRS)
Asa Academy — Self-Registration and Email-Based Two-Factor Authentication

System Name: Asa Academy
Feature: Self-Registration with Email Verification and Email-Based 2FA
Document Version: 1.0
Status: Proposed
Date: September 9, 2026

1. Introduction
1.1 Purpose

This Software Requirements Specification defines the requirements for implementing a self-registration and email-based two-factor authentication system for Asa Academy, an e-learning platform.

The feature will allow learners to create their own accounts, verify ownership of their email addresses using a One-Time Password (OTP), and securely authenticate using their password and an email-based second authentication factor.

The objective is to provide a registration and authentication process that is:

Secure
Easy to use
Reliable
Scalable
Appropriate for an e-learning environment
Resistant to common authentication attacks
2. System Overview

Asa Academy is an e-learning platform where learners can access educational content, courses, learning materials, assessments, and other academic services.

The self-registration feature will allow a new learner to register without requiring an administrator to manually create the account.

The general process will be:

Visitor → Registration → Email OTP → Account Activation → Login → Email 2FA → Asa Academy Dashboard

3. Objectives

The system shall achieve the following objectives:

Allow users to register independently.
Verify the user's email address.
Automatically create a learner account after successful registration.
Prevent users from registering privileged roles.
Securely store passwords.
Generate secure, temporary OTPs.
Send customized Asa Academy emails.
Support email-based two-factor authentication.
Prevent OTP brute-force attacks.
Prevent excessive OTP requests.
Provide appropriate account recovery mechanisms.
Maintain security audit logs.
4. User Roles
4.1 Visitor

A visitor is an unauthenticated person accessing Asa Academy.

The visitor can:

Open the registration page.
Create an account.
Verify their email.
Access the login page.
4.2 Learner

A learner is a successfully registered and verified Asa Academy user.

The learner can:

Log in.
Complete 2FA.
Access authorized courses.
Manage their profile.
Enroll in available courses.
Access learning content according to their permissions.
4.3 Administrator

An administrator can:

View registered learners.
Manage accounts.
Suspend accounts.
Activate/deactivate accounts where authorized.
Review security events.
Manage platform users.

The administrator shall not be able to view plaintext passwords or OTPs.

5. Self-Registration Requirements
FR-REG-001 — Registration Page

Asa Academy shall provide a public registration page.

The registration form shall contain:

First Name
Last Name
Email Address
Password
Confirm Password
Terms and Conditions
Privacy Policy
Create Account button

Optional fields may include:

Phone number
Country
Profile information
FR-REG-002 — Required Information

The system shall reject registration when required information is missing.

The following fields are mandatory:

First Name
Last Name
Email
Password
Confirm Password
Terms acceptance
Privacy Policy acceptance
FR-REG-003 — Email Validation

The system shall validate the email address on both the frontend and backend.

The system shall reject invalid email formats.

FR-REG-004 — Duplicate Email

Each Asa Academy account shall have a unique email address.

If the email is already associated with an account, the system shall handle the request securely without unnecessarily exposing account information.

6. Password Requirements

The password shall meet a configurable security policy.

The recommended minimum requirement is:

At least 8 characters
At least one uppercase letter
At least one lowercase letter
At least one number
At least one special character

Example:

AsaAcademy@2026

The password shall never be stored in plaintext.

The backend shall hash the password using a strong password hashing algorithm such as Argon2id or appropriately configured bcrypt.

7. Account Creation

After successful registration validation, Asa Academy shall create a learner account.

The initial account status shall be:

PENDING_VERIFICATION

Example:

Role: LEARNER
Status: PENDING_VERIFICATION
Email Verified: false

The user shall not receive normal learner access until the required email verification is completed.

8. Role Assignment

Public registration shall automatically create a:

LEARNER

account.

Users shall not be allowed to select their own role.

For example, the frontend must not be trusted if it sends:

role = ADMIN

or:

role = INSTRUCTOR

The backend shall always determine the role for public registration.

9. Email Verification

After registration, Asa Academy shall generate a six-digit OTP.

Example:

583214

The OTP shall be:

Six digits
Randomly generated using a secure random mechanism
Valid for 10 minutes
Single-use
Limited to a maximum number of attempts
Invalidated when a new OTP is generated

The OTP should be hashed before being stored in the database.

10. Email Verification Process

The complete process shall be:

User submits registration.
Asa Academy validates the information.
Asa Academy creates a pending account.
Asa Academy generates an OTP.
Asa Academy sends a customized verification email.
User enters the OTP.
System validates the OTP.
Email is marked as verified.
Account status changes to ACTIVE.
User can proceed to login.
11. Email OTP Rules
Requirement	Value
OTP length	6 digits
Expiration	10 minutes
Maximum verification attempts	5
OTP reuse	Not allowed
Previous OTP after resend	Invalid
Storage	Hashed
Generation	Cryptographically secure
12. OTP Verification

When the user enters an OTP, Asa Academy shall verify:

The OTP exists.
The OTP belongs to the appropriate user/challenge.
The OTP has not expired.
The OTP has not been used.
The attempt limit has not been exceeded.
The submitted value matches the stored secure representation.

If all conditions are satisfied, verification shall succeed.

13. Invalid OTP

If the OTP is incorrect, Asa Academy shall reject the request.

The system shall display:

"The verification code is invalid or has expired. Please try again or request a new code."

The failed attempt counter shall be increased.

After five unsuccessful attempts, the OTP shall be invalidated.

14. Resend OTP

The registration page shall provide a Resend Code option.

Example:

Didn't receive the code? Resend Code

The system shall prevent users from repeatedly requesting OTPs.

Recommended configuration:

Minimum resend interval: 60 seconds
Maximum requests: configurable
Previous OTP: immediately invalidated
New OTP: generated securely
15. Email-Based Two-Factor Authentication

After registration and email verification, Asa Academy shall support email-based 2FA during authentication.

The login process shall be:

Step 1: Email + Password

Step 2: Email OTP

Step 3: Authenticated Session

Therefore:

Something the user knows: Password

Additional authentication factor: Email-delivered OTP

16. Login Process

The login process shall be:

User enters email.
User enters password.
System validates credentials.
If credentials are valid, the system creates a temporary authentication challenge.
Asa Academy generates a new OTP.
OTP is sent to the user's verified email.
User enters OTP.
System validates OTP.
Full authentication is granted.
User is redirected to the Asa Academy learner dashboard.
17. Login 2FA Screen

The screen shall display:

Two-Factor Authentication

"We've sent a security code to your registered email address."

Enter your 6-digit code

_ _ _ _ _ _

Verify

Didn't receive the code? Resend Code

The system may partially mask the email address, for example:

k******@gmail.com

18. Account Status

Asa Academy shall support the following statuses:

PENDING_VERIFICATION

Account created but email verification has not been completed.

ACTIVE

Account is verified and available for normal use.

SUSPENDED

Account has been suspended by an authorized administrator.

LOCKED

Account has been temporarily locked because of security controls.

DEACTIVATED

Account has been disabled.

19. Database Requirements
Users

The users table should contain at least:

id
first_name
last_name
email
password_hash
role
status
email_verified
created_at
updated_at
last_login_at
Email OTP

A separate OTP table should contain:

id
user_id
otp_hash
purpose
expires_at
attempt_count
used
created_at
used_at

The purpose field may contain:

REGISTRATION
LOGIN_2FA
PASSWORD_RESET

This allows the same OTP infrastructure to be reused across the authentication system.

20. API Requirements
Registration

POST /api/auth/register

Request:

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "StrongPassword123!",
  "confirmPassword": "StrongPassword123!",
  "acceptTerms": true,
  "acceptPrivacyPolicy": true
}

Response:

{
  "message": "Registration successful. Please check your email for your verification code.",
  "verificationRequired": true
}
Verify Email

POST /api/auth/verify-email

Request:

{
  "email": "john@example.com",
  "otp": "583214"
}

Response:

{
  "message": "Your email has been verified successfully.",
  "status": "ACTIVE"
}
Resend OTP

POST /api/auth/resend-otp

Request:

{
  "email": "john@example.com",
  "purpose": "REGISTRATION"
}
Login

POST /api/auth/login

Request:

{
  "email": "john@example.com",
  "password": "StrongPassword123!"
}

If 2FA is required:

{
  "requiresTwoFactor": true,
  "challengeId": "temporary-challenge-id"
}
Verify 2FA

POST /api/auth/verify-2fa

Request:

{
  "challengeId": "temporary-challenge-id",
  "otp": "583214"
}

Successful verification shall establish the authenticated session.

21. Custom Asa Academy Emails

All emails sent by the authentication system shall be branded as Asa Academy emails.

The email design should contain:

Asa Academy logo
Asa Academy name
Clear email subject
Personalized greeting
Purpose of the email
OTP or required action
Expiration information
Security notice
Asa Academy support/contact information
Professional footer
22. Registration Verification Email

Subject: Welcome to Asa Academy — Verify Your Email

Email content:

Hello [First Name],

Welcome to Asa Academy!

Thank you for creating your account. To complete your registration and start your learning journey, please verify your email address using the verification code below:

[OTP]

This code will expire in 10 minutes and can only be used once.

If you did not create an Asa Academy account, you can safely ignore this email.

We're excited to have you learning with us.

Best regards,
Asa Academy Team

23. Login 2FA Email

Subject: Asa Academy — Your Login Verification Code

Email content:

Hello [First Name],

A login attempt was made on your Asa Academy account.

To continue signing in, enter the verification code below:

[OTP]

This code will expire in 10 minutes and can only be used once.

If you did not attempt to sign in to Asa Academy, please secure your account by changing your password and contacting the Asa Academy support team.

Best regards,
Asa Academy Security Team

24. Password Reset Email

Subject: Asa Academy — Password Reset Request

Email content:

Hello [First Name],

We received a request to reset the password for your Asa Academy account.

Use the verification code below to continue:

[OTP]

This code will expire in 10 minutes.

If you did not request a password reset, please ignore this email. Your existing password will remain unchanged.

For your security, never share this code with anyone.

Best regards,
Asa Academy Security Team

25. Password Changed Email

Subject: Asa Academy — Your Password Has Been Changed

Email content:

Hello [First Name],

Your Asa Academy account password was successfully changed.

If you made this change, no further action is required.

If you did not make this change, please contact the Asa Academy support team immediately and secure your account.

Best regards,
Asa Academy Security Team

26. New Account Confirmation Email

Subject: Welcome to Asa Academy — Your Account Is Ready

Email content:

Hello [First Name],

Your Asa Academy account has been successfully verified.

Your account is now active and you can sign in to access your learner dashboard and begin exploring available courses.

Welcome to Asa Academy!

We wish you a successful learning experience.

Best regards,
Asa Academy Team

27. Security Alert Email

Subject: Asa Academy — Security Alert

Email content:

Hello [First Name],

We detected a security-related activity on your Asa Academy account.

Activity: [Activity Type]
Date: [Date and Time]
Device: [Device Information]

If this activity was performed by you, no action is required.

If you do not recognize this activity, please change your password and contact Asa Academy support immediately.

Best regards,
Asa Academy Security Team

28. Email Configuration

The application shall use environment variables for email configuration.

Example:

EMAIL_USER=<Asa Academy email account>

EMAIL_PASS=<secure email application password>

Additional SMTP configuration may include:

EMAIL_HOST=<SMTP host>

EMAIL_PORT=<SMTP port>

EMAIL_FROM=<Asa Academy sender address>

The actual password must never be stored in the SRS, source code, Git repository, frontend code, or application logs.

The email credential previously provided should be rotated/revoked, because it has been exposed.

29. Security Requirements
SEC-001 — Password Protection

Passwords shall be hashed using Argon2id or bcrypt.

SEC-002 — OTP Protection

OTP values shall not be stored as plaintext.

SEC-003 — HTTPS

All authentication communication shall use HTTPS in production.

SEC-004 — Rate Limiting

Rate limiting shall be applied to:

Registration
Login
OTP verification
OTP resend
Password reset
SEC-005 — Brute-Force Protection

Repeated failed login and OTP attempts shall trigger appropriate security controls.

SEC-006 — OTP Expiration

OTP codes shall expire after the configured period.

SEC-007 — OTP Single Use

A successfully used OTP shall never be accepted again.

SEC-008 — Credential Protection

Email service credentials shall be stored using environment variables or a secrets-management solution.

SEC-009 — Sensitive Logging

The following shall never appear in application logs:

Passwords
Plaintext OTPs
Email passwords
Access tokens
Refresh tokens
Password reset secrets
30. Audit Logging

Asa Academy shall record security-related events, including:

User registration
OTP generated
OTP sent
Email verification successful
Email verification failed
OTP resend
Login successful
Login failed
2FA requested
2FA successful
2FA failed
Password reset requested
Password changed
Account locked
Account suspended

Each event should contain:

User ID where available
Event type
Timestamp
Result
IP address where appropriate
User agent where appropriate
31. Functional Acceptance Criteria
AC-001 — Registration

Given a visitor enters valid registration information,

When they submit the registration form,

Then Asa Academy shall create a pending learner account and send an email verification OTP.

AC-002 — Successful Verification

Given the user enters a valid, non-expired OTP,

When the OTP is submitted,

Then the email shall be verified and the account shall become active.

AC-003 — Invalid OTP

Given the user enters an incorrect OTP,

When the OTP is submitted,

Then the system shall reject it and increase the attempt counter.

AC-004 — Expired OTP

Given the OTP has expired,

When the user submits it,

Then the system shall reject it and allow a new OTP to be requested.

AC-005 — OTP Reuse

Given an OTP has already been successfully used,

When the user submits it again,

Then the system shall reject it.

AC-006 — 2FA

Given a verified learner enters a valid email and password,

When 2FA is required,

Then Asa Academy shall send an OTP to the user's registered email and require successful OTP verification before granting full access.

AC-007 — Role Protection

Given a visitor registers publicly,

When the account is created,

Then the account shall always be created as LEARNER.

AC-008 — Password Security

Given a user creates a password,

When the account is stored,

Then only a secure password hash shall be stored.

32. End-to-End User Journey

The final Asa Academy workflow shall be:

1. User opens Asa Academy

↓

2. User selects "Create Account"

↓

3. User enters personal information

↓

4. User creates password

↓

5. User accepts Terms & Privacy Policy

↓

6. User clicks "Create Account"

↓

7. Asa Academy validates the information

↓

8. Asa Academy creates a PENDING_VERIFICATION learner account

↓

9. Asa Academy sends a customized verification email

↓

10. User enters the six-digit OTP

↓

11. Asa Academy validates the OTP

↓

12. Email becomes verified

↓

13. Account becomes ACTIVE

↓

14. User goes to Login

↓

15. User enters email and password

↓

16. Asa Academy generates a new 2FA OTP

↓

17. Customized 2FA email is sent

↓

18. User enters 2FA OTP

↓

19. Asa Academy validates the OTP

↓

20. Authentication succeeds

↓

21. User enters Asa Academy Dashboard

↓

22. User can access authorized learning features

33. Future Enhancements

The architecture should be designed so that Asa Academy can later support:

Google authentication
Microsoft authentication
Authenticator-app TOTP
Passkeys/WebAuthn
SMS OTP
Recovery codes
Trusted devices
Device/session management
Enterprise SSO
Instructor approval workflow
Organization-based registration
Risk-based authentication
34. Final Requirement

The Asa Academy Self-Registration and Email-Based 2FA feature shall provide a secure end-to-end authentication experience:

Self Registration → Email Verification → Account Activation → Password Authentication → Email 2FA → Learner Dashboard

The implementation shall prioritize security, usability, maintainability, scalability, and protection of user credentials.

The email service shall use custom Asa Academy-branded email templates for each authentication event, including registration verification, login 2FA, password reset, password-change confirmation, account activation, and security alerts.



//
Asa Academy — Instructor Creation with Email-Based 2FA
1. Feature Overview

Asa Academy shall provide a secure Admin-to-Instructor account creation workflow.

An Administrator shall be able to create an Instructor account from the administration portal.

The system shall not activate the instructor account immediately after the Admin creates it.

Instead, Asa Academy shall:

Allow the Admin to create the Instructor.
Automatically assign the INSTRUCTOR role.
Generate a temporary activation/verification challenge.
Send a customized Asa Academy email to the Instructor.
Require the Instructor to verify their email using an OTP.
Require the Instructor to establish or confirm their authentication credentials.
Require email-based 2FA.
Activate the Instructor account only after successful verification.
2. Instructor Creation Workflow

The complete workflow shall be:

Admin Login

↓

Admin Dashboard

↓

User Management

↓

Create Instructor

↓

Enter Instructor Information

↓

Submit

↓

System Creates Instructor Account

↓

Status = PENDING_ACTIVATION

↓

System Sends Instructor Invitation Email

↓

Instructor Opens Invitation

↓

Instructor Sets Password

↓

Email Verification / OTP

↓

Email-Based 2FA

↓

Account Activated

↓

Instructor Login

↓

Instructor Dashboard

3. Admin Create Instructor

The Admin shall have access to:

Administration → Users → Instructors → Create Instructor

The form shall contain:

First Name
Last Name
Email Address
Phone Number (optional)
Department/Organization (optional)
Instructor identification information where required
Account status
Create Instructor button

The Admin shall not manually assign the role through an arbitrary frontend value.

The backend endpoint shall explicitly create the account with:

role = INSTRUCTOR

4. Instructor Account Status

When the Admin creates an Instructor, the initial status shall be:

PENDING_ACTIVATION

Example:

Role: INSTRUCTOR
Status: PENDING_ACTIVATION
Email Verified: false
2FA Verified: false

The Instructor shall not be allowed to access the Instructor Dashboard while the account remains pending.

5. Instructor Invitation Email

Immediately after the Admin successfully creates the Instructor, Asa Academy shall send a customized email.

Subject

Welcome to Asa Academy — Instructor Account Invitation

Email

Hello [First Name],

Welcome to Asa Academy!

An administrator has created an Instructor account for you on the Asa Academy e-learning platform.

To activate your Instructor account, please complete the account verification process using the link below:

[Activate My Asa Academy Instructor Account]

For your security, this invitation is temporary and can only be used within the specified validity period.

During activation, you will be asked to:

Confirm your email address.
Create your password.
Complete two-factor authentication.

If you were not expecting this invitation, please contact the Asa Academy administration team.

We look forward to having you as an Instructor on Asa Academy.

Best regards,
Asa Academy Administration Team

6. Instructor Account Activation

When the Instructor clicks the invitation link, Asa Academy shall display:

Activate Your Instructor Account

Welcome to Asa Academy, [First Name].

Please complete the following steps to activate your Instructor account.

Step 1 — Confirm Email

Step 2 — Create Password

Step 3 — Verify Two-Factor Authentication

Step 4 — Complete Account Activation

7. Instructor Password Creation

The Instructor shall create their own password rather than receiving a permanent password from the Administrator.

The password shall comply with the Asa Academy password policy.

For example:

Minimum 8 characters.
Uppercase character.
Lowercase character.
Number.
Special character.

The password shall be securely hashed.

The Admin shall never be shown the Instructor's password.

8. Instructor Email Verification

After the Instructor submits their password, Asa Academy shall generate a six-digit OTP.

Example:

736291

The OTP shall be sent to the Instructor's registered email address.

The email shall be customized for the Instructor activation process.

Subject

Asa Academy — Verify Your Instructor Account

Email

Hello [First Name],

You are almost ready to start using your Instructor account on Asa Academy.

Please use the verification code below to confirm your email address:

[OTP]

This code will expire in 10 minutes and can only be used once.

If you did not expect an Instructor account invitation from Asa Academy, please contact the administration team.

Best regards,
Asa Academy Security Team

9. Instructor Two-Factor Authentication

After successful email verification, the Instructor shall complete email-based 2FA.

The authentication process shall require:

Factor 1: Instructor password

Factor 2: OTP sent to the Instructor's verified email address.

The flow shall be:

Email + Password

↓

Generate 2FA OTP

↓

Send OTP to Instructor Email

↓

Instructor Enters OTP

↓

Validate OTP

↓

Authentication Successful

10. Instructor 2FA Email

The 2FA email shall use a dedicated template.

Subject

Asa Academy — Instructor Login Verification Code

Email

Hello [First Name],

A sign-in attempt was made on your Asa Academy Instructor account.

To continue signing in, please enter the verification code below:

[OTP]

This code will expire in 10 minutes and can only be used once.

If you did not attempt to sign in, please change your password immediately and contact the Asa Academy administration team.

Best regards,
Asa Academy Security Team

11. Instructor Activation Rules

The Instructor account shall become ACTIVE only when:

The invitation is valid.
The email address has been verified.
The Instructor has successfully created a password.
The required 2FA process has been completed.

Therefore:

Admin creates Instructor ≠ Instructor is immediately active

Instead:

Admin Creates → Pending Activation → Instructor Verification → 2FA → Active

12. Admin Workflow

The Admin interface shall display:

Instructor Management
Name	Email	Status	Email Verified	2FA	Actions
John Doe	john@example.com	Active	Yes	Enabled	View
Jane Smith	jane@example.com	Pending	No	No	Resend
Peter Kay	peter@example.com	Suspended	Yes	Enabled	Manage

The Admin shall be able to:

Create Instructor
View Instructor
Edit permitted Instructor information
Resend invitation
Suspend Instructor
Deactivate Instructor
Reactivate Instructor where authorized

The Admin shall not be able to:

View Instructor password
View plaintext OTP
View 2FA OTP
Bypass authentication without an authorized administrative security procedure
13. Resend Instructor Invitation

If an Instructor does not activate the account, the Admin shall be able to select:

Resend Invitation

The system shall:

Invalidate the previous invitation.
Generate a new secure invitation token.
Send a new Asa Academy invitation email.
Maintain the Instructor's PENDING_ACTIVATION status.

The resend operation shall be rate-limited.

14. Instructor Invitation Expiration

The invitation token shall be time-limited.

Recommended validity:

24 hours

After expiration:

Invitation expired

The Instructor shall be required to request or receive a new invitation.

15. Instructor Security Model

The following security model shall apply:

Learner Self-Registration

Visitor → Registration → Email OTP → Active Learner

Admin-Created Instructor

Admin → Create Instructor → Invitation → Email Verification → Password Creation → 2FA → Active Instructor

Administrator

Administrators shall be created and managed through a controlled administrative process and shall not be created through public self-registration.

16. Database Requirements

The users table should support all three account types.

Example:

Field	Example
id	1024
first_name	John
last_name	Doe
email	john@example.com
password_hash	Secure hash
role	INSTRUCTOR
status	PENDING_ACTIVATION
email_verified	false
two_factor_enabled	false
created_by	Admin User ID
created_at	Timestamp
updated_at	Timestamp

The created_by field is particularly useful for Admin-created accounts.

For a self-registered learner:

created_by = SELF_REGISTRATION

or a nullable/system-created reference.

For an Instructor:

created_by = ADMIN_USER_ID

17. Instructor Invitation Table

A separate invitation table is recommended.

user_invitations
Field	Description
id	Invitation ID
user_id	Instructor user ID
token_hash	Hashed invitation token
expires_at	Invitation expiration
used	Whether invitation was used
created_by	Admin who created invitation
created_at	Creation time
used_at	Activation time

The actual invitation token shall not be stored in plaintext.

18. API Requirements
Create Instructor

POST /api/admin/instructors

Request:

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+250700000000"
}

The backend shall automatically assign:

{
  "role": "INSTRUCTOR",
  "status": "PENDING_ACTIVATION"
}

The frontend shall not determine the role.

Activate Instructor

POST `/api/auth/instructor/activate

Request:

{
  "invitationToken": "temporary-token",
  "password": "StrongPassword123!",
  "confirmPassword": "StrongPassword123!"
}
Verify Instructor Email

POST /api/auth/instructor/verify-email

Request:

{
  "challengeId": "challenge-id",
  "otp": "736291"
}
Instructor Login

POST /api/auth/login

Request:

{
  "email": "john@example.com",
  "password": "StrongPassword123!"
}

Response:

{
  "requiresTwoFactor": true,
  "challengeId": "temporary-challenge-id"
}
Verify Instructor 2FA

POST /api/auth/verify-2fa

Request:

{
  "challengeId": "temporary-challenge-id",
  "otp": "736291"
}

Successful verification shall grant the Instructor an authenticated session.

19. Custom Email Templates

Asa Academy shall maintain separate email templates for different events.

Event	Email Template
Learner registration	Welcome & Email Verification
Learner login	Login 2FA Code
Instructor creation	Instructor Invitation
Instructor activation	Instructor Email Verification
Instructor login	Instructor 2FA Code
Password reset	Password Reset
Password changed	Password Changed
Security event	Security Alert
Account activated	Account Activation Confirmation

This prevents users from receiving confusing or generic authentication emails.

20. End-to-End Instructor Workflow

The final process shall be:

ADMIN

↓

Admin logs into Asa Academy

↓

Admin opens User Management

↓

Admin selects Create Instructor

↓

Admin enters:

First Name
Last Name
Email
Other required information

↓

Admin selects Create

↓

Asa Academy creates:

Role = INSTRUCTOR

Status = PENDING_ACTIVATION

↓

Asa Academy sends:

Instructor Invitation Email

↓

INSTRUCTOR

↓

Instructor opens invitation

↓

Instructor creates password

↓

Asa Academy sends:

Email Verification OTP

↓

Instructor enters OTP

↓

Email verified

↓

Instructor proceeds to login

↓

Instructor enters email + password

↓

Asa Academy sends:

2FA OTP

↓

Instructor enters 2FA OTP

↓

2FA successful

↓

Account becomes:

ACTIVE

↓

Instructor is redirected to:

Instructor Dashboard

21. Acceptance Criteria
AC-INST-001 — Admin Creates Instructor

Given an authorized Admin is logged into Asa Academy,

When the Admin creates an Instructor with valid information,

Then the system shall create an INSTRUCTOR account with PENDING_ACTIVATION status and send an invitation email.

AC-INST-002 — Role Protection

Given an Admin creates an Instructor,

When the request is processed,

Then the backend shall assign the INSTRUCTOR role.

AC-INST-003 — Invitation

Given an Instructor account has been created,

When the account creation succeeds,

Then Asa Academy shall send a customized Instructor invitation email.

AC-INST-004 — Password Creation

Given the Instructor opens a valid invitation,

When they create a valid password,

Then the system shall securely store the password hash.

AC-INST-005 — Email Verification

Given the Instructor receives a valid OTP,

When they enter the OTP before expiration,

Then their email shall be verified.

AC-INST-006 — 2FA

Given the Instructor has a verified account,

When they successfully enter their email and password,

Then Asa Academy shall require a second OTP authentication factor.

AC-INST-007 — Successful Authentication

Given the Instructor enters a valid 2FA OTP,

When the OTP is verified,

Then the Instructor shall receive an authenticated session and access the Instructor Dashboard.

AC-INST-008 — Failed Authentication

Given the Instructor enters an invalid 2FA OTP,

When the OTP is submitted,

Then the Instructor shall not receive an authenticated session.

AC-INST-009 — Expired Invitation

Given an Instructor invitation has expired,

When the Instructor attempts to activate the account,

Then the system shall reject the invitation and require a new invitation.

AC-INST-010 — Admin Cannot View Password

Given an Instructor has created a password,

When an Administrator views the Instructor account,

Then the Administrator shall never see the Instructor's plaintext password.

22. Combined Asa Academy Authentication Architecture

The SRS should therefore define two separate onboarding paths:

Path A — Learner Self-Registration

Visitor

→ Create Account

→ Email OTP

→ Email Verified

→ Active Learner

→ Login

→ Email 2FA

→ Learner Dashboard

Path B — Admin-Created Instructor

Admin

→ Create Instructor

→ Instructor Invitation Email

→ Instructor Creates Password

→ Email Verification OTP

→ Email Verified

→ Login

→ Email 2FA

→ Active Instructor

→ Instructor Dashboard

This gives Asa Academy a consistent security model while ensuring that public users can only self-register as Learners, whereas Instructors can only be provisioned by authorized Administrators.