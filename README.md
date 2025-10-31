# Football App

A football team management application with match tracking, team statistics, and user authentication. Built with Next.js 15, TypeScript, SQLite, and NextAuth.

## Features

- **User Authentication**: Sign up, login, and secure session management
- **Team Management**: Create and manage teams with multiple players
- **Match Tracking**: Record match results between teams
- **Statistics**: View team standings and match history
- **Responsive Design**: Mobile-first UI with dark mode support

## Tech Stack

| Category         | Technologies Used       |
| ---------------- | ----------------------- |
| Core             | Next.js 15, TypeScript  |
| Database         | SQLite with Drizzle ORM |
| Authentication   | NextAuth.js v5          |
| Styling          | TailwindCSS, Shadcn UI  |
| State Management | React Hooks             |
| Build Tool       | Turbopack               |

## Prerequisites

- Node.js 18+ installed
- Yarn package manager

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd football-app
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Generate and run database migrations

```bash
# Generate migrations
yarn db:generate

# Run migrations (this will create the database)
yarn db:migrate
```

### 4. Run the development server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create an account

1. Navigate to the register page at `/register`
2. Create a new account with your name, email, and password
3. Sign in to start using the app

## Database Schema

The application uses the following main tables:

- **users**: User accounts with authentication
- **teams**: Teams created by users
- **players**: Players in each team
- **matches**: Match results between teams

## Available Scripts

- `yarn dev` - Start development server with Turbopack
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn db:generate` - Generate database migrations
- `yarn db:migrate` - Run database migrations

## Project Structure

```
football-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── page.tsx           # Main app page
├── components/            # React components
├── lib/                   # Utilities and configurations
│   ├── db/               # Database setup and schema
│   └── auth.ts           # NextAuth configuration
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── drizzle.config.ts     # Drizzle ORM configuration
```

## Authentication

The app uses NextAuth.js v5 with:

- Credentials provider for email/password authentication
- JWT-based sessions
- Password hashing with bcrypt
- SQLite database for user storage

## Database

- **SQLite** with better-sqlite3 driver
- **Drizzle ORM** for type-safe database queries
- Automatic migrations on server start
