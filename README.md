# Football App

A modern, full-stack football application built with Next.js, TypeScript, and contemporary web technologies.

## 🎯 Overview

Football App is a TypeScript-based web application that combines a powerful Next.js frontend with a robust backend infrastructure. The app features real-time data management, user authentication, and a polished UI built with Radix UI components and Tailwind CSS.

## 🚀 Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) with Turbopack
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (Accordion, Alert Dialog, Dialog, Dropdown Menu, Label, Select)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with [Tailwind Merge](https://github.com/dcastil/tailwind-merge)
- **State Management**: [TanStack React Query v5](https://tanstack.com/query/latest)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Database**: [LibSQL](https://github.com/libsql/libsql) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js v5 Beta](https://authjs.dev/)
- **Password Hashing**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Linting**: ESLint 9 with Next.js configuration

### Utilities
- **ID Generation**: [nanoid](https://github.com/ai/nanoid)
- **Environment Variables**: [dotenv](https://github.com/motdotla/dotenv)
- **Scripting**: [tsx](https://github.com/esbuild-kit/tsx)

## 📋 Scripts

```bash
# Development
npm run dev           # Start development server with Turbopack

# Production
npm run build         # Build for production
npm run start         # Start production server

# Linting
npm run lint          # Run ESLint

# Database
npm run db:generate   # Generate Drizzle migrations
npm run db:migrate    # Run database migrations
npm run db:seed       # Seed users to the database
npm run db:reset      # Reset database and re-seed
npm run db:update-passwords  # Update user passwords
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/hakynbayo/football-app.git
cd football-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

4. Initialize the database
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. Start the development server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📚 Project Structure

```
football-app/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/              # Utility functions
├── db/               # Database configuration and schema
├── scripts/          # Database setup and utility scripts
├── public/           # Static assets
├── styles/           # Global styles
├── types/            # TypeScript type definitions
└── package.json      # Project dependencies and scripts
```

## 🔐 Authentication

The app uses NextAuth.js v5 for authentication. User credentials are hashed using bcryptjs for security.

To update user passwords:
```bash
npm run db:update-passwords
```

## 🗄️ Database

The application uses LibSQL for the database backend with Drizzle ORM as the query builder. Database operations include:

- **Generate**: `npm run db:generate` - Creates migration files based on your schema
- **Migrate**: `npm run db:migrate` - Applies migrations to your database
- **Seed**: `npm run db:seed` - Populates initial user data
- **Reset**: `npm run db:reset` - Clears and re-seeds the database

## 🎨 UI & Styling

The UI is built using Radix UI primitives for accessibility and Tailwind CSS for styling. Framer Motion provides smooth animations throughout the application.

## 🧪 Quality Assurance

The project uses ESLint with Next.js recommended rules to maintain code quality and consistency.

## 📝 License

This project is public and available on [GitHub](https://github.com/hakynbayo/football-app).

## 👤 Author

- **GitHub**: [@hakynbayo](https://github.com/hakynbayo)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to fork the repository and submit pull requests.

---

**Last Updated**: July 18, 2026
