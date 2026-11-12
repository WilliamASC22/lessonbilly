# LessonBilly

LessonBilly is an online tutoring website built with React,
Vite, Firebase, and Cloudflare Pages.

The platform includes a public landing page and private
tutor, parent, and student portals.

## Features

- Responsive website with scroll animations
- Firebase email and password authentication
- Separate student and parent login interfaces
- Tutor dashboard for managing students
- Private student and parent grade dashboards
- Draft and published assessment scores
- Tutor-managed student account linking
- Google Meet lesson scheduling
- Lesson durations from 1 to 3 hours
- Manual email notifications
- Built-in Tutor Guide with onboarding instructions

## Technologies

- React
- Vite
- Firebase Authentication
- Cloud Firestore
- Motion
- Lucide React
- Cloudflare Pages
- GitHub

## Local Setup

1. Install Node.js.
2. Open the project folder in VS Code.
3. Run `npm install`.
4. Configure `src/firebase.js` with your Firebase web app settings.
5. Create `.env.local` containing your VITE_CONTACT_EMAIL.
6. Enable Firebase Email/Password Authentication.
7. Create a Firestore database on the Spark plan.
8. Publish the security rules from `firestore.rules`.
9. Configure your tutor UID in both firebase.js and firestore.rules.
10. Run `npm run dev`.

## Deployment

The website is deployed using Cloudflare Pages.

- Production branch: main
- Framework: React (Vite)
- Build command: npm run build
- Build output directory: dist

Add VITE_CONTACT_EMAIL to Cloudflare's build environment.

Authorize the Cloudflare Pages domain in Firebase Authentication.

## Tutor Instructions

After signing in with the tutor account, open Dashboard.

The built-in Tutor Guide explains:

1. How to enroll a new family
2. How to connect parent and student accounts
3. How to add student records
4. How to enter and publish assessment results
5. How to schedule Google Meet lessons
6. How to manually notify parents
7. How to troubleshoot account problems

## Parent and Student Access

Parents register through Parent Sign In.

Students with approved accounts register through Student Sign In.

The tutor connects each account to the appropriate student record.

Only published grades are available to students and parents.

## Security and Privacy

Firestore Security Rules control access to student information.

Never commit passwords, private service account keys,
or actual student data to GitHub.

Test permissions with fictional accounts before enrolling
real students.

Parental approval and applicable privacy requirements must
be addressed before collecting information from children.

## Notes

- LessonBilly does not automatically send grade notifications.
- Video lessons are hosted externally through Google Meet.
- LessonBilly does not store meeting recordings.
- The website uses free service tiers with usage limits.