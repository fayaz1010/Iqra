# Iqra Learning Platform

An interactive web application designed to teach Arabic reading through Iqra books and Quranic integration.

## Features

- Interactive Quranic reading practice
- Real-time virtual classrooms
- Teacher booking system
- Progress tracking
- Social learning features
- File sharing and whiteboard
- Notifications system

## Tech Stack

- Next.js
- Firebase (Auth, Firestore, Storage, Hosting)
- Zustand
- Framer Motion
- TailwindCSS
- TypeScript

## Prerequisites

- Node.js 18+
- npm
- Firebase CLI
- Git

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/iqra-learning.git
   cd iqra-learning
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Initialize Firebase:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

5. Set up Git hooks:
   ```bash
   npm run prepare
   ```

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Start Firebase emulators:
   ```bash
   npm run firebase:emulate
   ```

## Testing

Run the test suite:
```bash
npm test
```

## Deployment

1. Manual deployment:
   ```bash
   npm run deploy
   ```

2. Deploy only hosting:
   ```bash
   npm run deploy:hosting
   ```

3. Deploy only rules:
   ```bash
   npm run deploy:rules
   ```

Deployments are also automated through GitHub Actions when pushing to the main branch.

## Backup

Run manual backup:
```bash
npm run backup
```

Backups are stored in the `backups` directory and are automatically cleaned up after 7 days.

## Contributing

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. Push to your branch:
   ```bash
   git push origin feature/your-feature
   ```

4. Create a Pull Request

## License

[MIT License](LICENSE)

## Support

For support, email support@iqralearning.com or open an issue in the repository.
