
# LessonBilly

**Learn confidently. Grow consistently.**

LessonBilly is a full-stack online tutoring platform designed to make learning more organized, accessible, and personalized for K-12 students.

Built with React, Vite, Firebase, and Cloudflare Pages, the platform connects tutors, students, and parents through private learning portals.

The goal is to provide a simple tutoring experience with organized class materials, interactive practice, and transparent progress tracking.

---

## Quick Navigation

- [Overview](#overview)
- [Features](#features)
- [Practice Center](#practice-center)
- [Technology Stack](#technology-stack)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Security and Privacy](#security-and-privacy)

---

## Overview

LessonBilly combines one-on-one remote tutoring with a centralized learning platform.

The website includes:

- A responsive public landing page
- Separate student and parent login interfaces
- Private learning dashboards
- Tutor-managed classes and student records
- Interactive flashcards and quizzes
- Assessment tracking and feedback
- Class-specific learning materials
- Google Meet lesson scheduling
- An AI-powered tutoring match assistant

The platform is designed to operate using free service tiers, subject to their usage limits.

---

## Features

Explore LessonBilly's features by expanding the sections below.

<details>
<summary><strong>1. Tutor Dashboard</strong></summary>

The tutor dashboard provides tools for managing students and their learning progress.

Features include:

- Add and manage student records
- Assign and update student grade levels
- Manage multiple classes per student
- Connect approved student and parent accounts
- Schedule upcoming tutoring sessions
- Manage assessment scores
- Publish grades and feedback
- Access class-specific learning resources

Only the authorized tutor can modify student records and assessment information.

</details>

<details>
<summary><strong>2. Student and Parent Portals</strong></summary>

LessonBilly provides separate sign-in interfaces for students and parents.

Students can:

- View their assigned classes
- Access published grades
- Review tutor-approved practice activities
- Open homework and classwork materials
- Access lesson meeting links

Parents can:

- View their student's progress
- Review published assessment results
- Access class resources
- Monitor upcoming tutoring sessions

Accounts use Firebase Authentication and email verification.

The tutor connects approved accounts to student records.

</details>

<details>
<summary><strong>3. Practice Center</strong></summary>

The Practice Center allows tutors to create and publish interactive learning activities.

Supported activities:

- Flashcards
- Multiple-choice quizzes

Tutors can:

- Upload text-based PDF files
- Extract questions and answers
- Generate editable activity drafts
- Review and correct answers
- Publish flashcards independently
- Publish quizzes independently
- Update one activity without replacing the other

Students can review flashcards and answer quiz questions directly in their browsers.

Quiz attempts and answers are not saved as grades.

</details>

<details>
<summary><strong>4. Class Materials</strong></summary>

Each student can have multiple classes with their own learning resources.

The tutor can share:

- Homework PDFs
- Classwork PDFs
- Class-specific Google Drive links

Google Drive sharing permissions are managed separately.

Families can open resources shared with their authorized accounts.

</details>

<details>
<summary><strong>5. Assessment and Grade Tracking</strong></summary>

The tutor can create assessments for individual students and classes.

Each assessment can include:

- Assessment title
- Points earned
- Total possible points
- Written feedback
- Publication status

Assessment results remain unpublished until the tutor decides to release them.

Students and parents can view published grades.

</details>

<details>
<summary><strong>6. Online Lesson Scheduling</strong></summary>

LessonBilly supports class-specific Google Meet links and upcoming lesson schedules.

Supported session durations:

- 1 hour
- 1.5 hours
- 2 hours
- 2.5 hours
- 3 hours

Video calls are hosted externally through Google Meet.

LessonBilly does not store meeting recordings.

</details>

<details>
<summary><strong>7. AI Tutoring Match Assistant</strong></summary>

The public landing page includes a lightweight machine-learning assistant.

Visitors can:

- Select a grade level
- Describe an academic challenge
- Choose a tutoring goal
- Select preferred weekly tutoring hours
- Receive a suggested tutoring subject
- Preview a potential tutoring approach
- Prepare a tutoring inquiry email

The assistant uses a lightweight Naive Bayes text classifier.

It runs locally in the browser without requiring an AI API key, GPU, or model download.

The recommendations are illustrative and are not validated educational assessments.

</details>

<details>
<summary><strong>8. Built-in Tutor Guide</strong></summary>

LessonBilly includes a private Tutor Guide explaining how to:

- Enroll students and families
- Connect student and parent accounts
- Manage classes
- Publish assessment results
- Share learning materials
- Create flashcards and quizzes
- Schedule tutoring sessions
- Troubleshoot common issues

The guide also provides copyable email templates for communicating with families.

Emails are sent manually.

</details>

---

## Practice Center

The Practice Center is one of LessonBilly's core learning features.

### Flashcards

Tutors can create flashcards manually or import them from a text-based PDF.

Example format:

`CARD|What is a numerator?|The top number in a fraction.`

Each flashcard contains:

- A question on the front
- An answer on the back

Students can flip flashcards and navigate between questions.

### Quizzes

Tutors can create multiple-choice quizzes manually or import them from a text-based PDF.

Example format:

`QUIZ|What is 2 + 2?|3|4|5|6|2|2 + 2 equals 4.`

Each quiz question contains:

- A question
- Four answer choices
- One correct answer
- An optional explanation

Students receive immediate feedback when checking their answers.

### Independent Publishing

Flashcards and quizzes are managed independently.

| Action | Flashcards | Quizzes |
|---|---|---|
| Upload flashcard PDF | Updated | Unchanged |
| Upload quiz PDF | Unchanged | Updated |
| Publish flashcards | Published | Unchanged |
| Publish quiz | Unchanged | Published |

The tutor reviews all 10 items before publishing an activity.

Publishing one activity does not replace the other.

PDF text extraction runs in the browser. The original practice PDF is not uploaded to Firebase.

Unpublished editor drafts are not retained after reloading the page.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Development and production builds |
| JavaScript / JSX | Application logic |
| Firebase Authentication | Account registration and authentication |
| Cloud Firestore | Student records and published learning content |
| Cloudflare Pages | Website hosting |
| Motion | Interface animations |
| Lucide React | Interface icons |
| PDF.js | Browser-based PDF text extraction |
| Google Meet | Online tutoring sessions |
| Google Drive | Shared class materials |
| GitHub | Version control |

---

## Local Development

<details>
<summary><strong>Expand installation instructions</strong></summary>

### 1. Install Node.js

Install a supported version of Node.js.

### 2. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd LessonBilly
```

Replace `YOUR_REPOSITORY_URL` with the repository's actual GitHub URL.

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Firebase

Open:

`src/firebase.js`

Add the Firebase web application configuration from Firebase Console.

Configure the authorized tutor UID in:

- `src/firebase.js`
- `firestore.rules`

Both tutor UID values must match.

### 5. Configure Environment Variables

Create a `.env.local` file.

Add:

```env
VITE_CONTACT_EMAIL=your-email@example.com
```

Replace the placeholder with the contact email for your tutoring service.

Do not commit private credentials or service account keys.

### 6. Configure Firebase Services

In Firebase Console:

1. Enable Email/Password Authentication.
2. Create a Cloud Firestore database.
3. Publish the security rules from `firestore.rules`.
4. Verify authorized domains for Firebase Authentication.

### 7. Run the Website

```bash
npm run dev
```

Open the local development URL displayed in your terminal.

</details>

---

## Deployment

<details>
<summary><strong>Expand Cloudflare deployment instructions</strong></summary>

LessonBilly is deployed through Cloudflare Pages.

### Build Configuration

| Setting | Value |
|---|---|
| Framework | React (Vite) |
| Production branch | main |
| Build command | npm run build |
| Output directory | dist |

### Environment Variables

Configure the required Vite environment variables in Cloudflare Pages.

Example:

`VITE_CONTACT_EMAIL`

Additional environment variables may be required for optional features.

### Firebase Authentication

Add the deployed Cloudflare Pages domain to the authorized domains in Firebase Authentication.

### Updating the Website

After testing changes locally:

```bash
npm run build
git add .
git commit -m "Update LessonBilly"
git push origin main
```

Pushing to the production branch triggers a new Cloudflare Pages build when automatic deployment is configured.

</details>

---

## Security and Privacy

LessonBilly uses Firebase Authentication and Firestore Security Rules to help control access to student information.

Security considerations include:

- Verified account authentication
- Tutor-controlled student records
- Parent and student account linking
- Restricted grade publication
- Controlled access to class resources
- No saved student quiz attempts
- Manual email notifications

### Important Guidelines

Never commit:

- Passwords
- Firebase Admin SDK service account keys
- Private API credentials
- Actual student records
- Private student documents

Always test permissions with fictional accounts before enrolling real students.

Parental approval and applicable privacy requirements must be addressed before collecting information from children.

Google Drive permissions must be maintained separately from LessonBilly account permissions.

---

## Project Goals

LessonBilly is designed around four principles.

**Accessibility**

Provide an easy-to-use learning platform across desktop and mobile devices.

**Organization**

Keep classes, materials, assessments, and tutoring schedules organized.

**Personalization**

Help students practice the specific subjects and topics covered during tutoring sessions.

**Transparency**

Allow families to monitor progress through published assessments and feedback.

---

## Future Improvements

Potential improvements include:

- Additional practice activity types
- Improved progress visualizations
- More customization for tutors
- Enhanced mobile accessibility
- Expanded learning resources

New features will be evaluated with performance, privacy, and maintainability in mind.

---

## Important Notes

- LessonBilly is an independent tutoring platform.
- LessonBilly does not automatically send grade notifications.
- Lesson scheduling uses external Google Meet links.
- Meeting recordings are not stored by LessonBilly.
- Student practice answers are not saved as grades.
- Browser-based activity generation does not require an AI API key.
- Free hosting and database services have usage limits.

---

**LessonBilly - Learn confidently. Grow consistently.**
