LessonBilly starter website
This project is a React/Vite public tutoring website with Firebase Authentication, Firestore parent grade portal, tutor-only grade publishing, lesson links and a manual email draft button.
Local setup
1. Open this folder in VS Code.
2. Install Node.js LTS if necessary.
3. Run npm install, then npm run dev.
4. In src/firebase.js, replace the Firebase web configuration placeholders with the Web App's config from the Firebase Console.
5. Enable Firebase Authentication Email/Password and create a Firestore Standard database on Spark.
6. Paste firestore.rules into the Firestore Database Rules tab and publish.
7. Authorize localhost in Firebase Auth > Settings > Authorized domains.
8. Register the tutor account through the site, verify email, and copy its UID from Firebase Auth > Users.
9. Paste the UID into BOTH src/firebase.js and firestore.rules, and publish the updated Firestore rules in Firebase.
10. Replace CONTACT_EMAIL in src/App.jsx with your actual contact email.
Deploy
Use VS Code's built-in Source Control to publish the repository to GitHub. Connect Cloudflare Pages to that repository with Vite build command npm run build and build output dist. Authorize the Pages domain in Firebase Authentication Settings.
Safety
Do not enter actual child information until you have tested authorization with several unrelated accounts, reviewed applicable privacy obligations, and obtained appropriate parental consent. Firebase web configuration is public; never put a Firebase Admin service-account key in frontend code.

Google Meet is hosted externally. The site only links to meetings and displays a local timer; recording requires separate software such as OBS on your own laptop. Do not record sessions involving minors without prior consent.