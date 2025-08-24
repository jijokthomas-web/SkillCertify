# Certificate Verification System

## Overview

This is a full-stack web application for certificate verification built with React, Express.js, and PostgreSQL. The system allows administrators to manage courses, students, and certificates while providing a public verification interface for certificate authenticity. The application features a modern UI built with shadcn/ui components and uses Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation using @hookform/resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with separate public and admin endpoints
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Middleware**: Custom logging middleware for API requests
- **Error Handling**: Centralized error handling middleware

### Database Design
- **Database**: PostgreSQL with three main tables:
  - `courses`: Course information with JSON array for skills
  - `students`: Student records with unique email and student ID
  - `certificates`: Certificate records linking students and courses with verification tracking
- **Schema Management**: Drizzle Kit for migrations and schema changes
- **Connection**: Neon Database serverless connection

### Authentication & Authorization
- **Admin Authentication**: Netlify Identity integration with Google OAuth
- **Public Access**: Certificate verification endpoints are publicly accessible
- **Session Management**: Browser-based session storage for admin users

### File Structure
```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utility functions and configurations
├── server/               # Backend Express application
│   ├── index.ts          # Main server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Data access layer interface
│   └── vite.ts           # Development server integration
├── shared/               # Shared TypeScript types and schemas
└── migrations/           # Database migration files
```

### Development Workflow
- **Development Server**: Vite with HMR for frontend, tsx for backend with automatic restarts
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Code Quality**: Consistent import aliases and path resolution

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Connection Library**: @neondatabase/serverless for database connectivity

### Authentication Services
- **Netlify Identity**: User authentication and authorization service
- **Google OAuth**: Social login integration through Netlify Identity

### Third-Party APIs
- **QR Server API**: External service for QR code generation (qrserver.com)
- **Alternative QR Libraries**: Placeholder for future QR code generation libraries

### UI and Component Libraries
- **Radix UI**: Comprehensive set of accessible component primitives
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Carousel component for UI interactions
- **date-fns**: Date manipulation and formatting utilities

### Development Tools
- **Replit Integration**: Development environment with cartographer and error overlay plugins
- **Vite Plugins**: Runtime error modal and development tooling
- **TypeScript**: Static type checking across the entire application

### Deployment Infrastructure
- **Build Tools**: esbuild for production backend bundling
- **Static Assets**: Vite-generated static files for frontend deployment
- **Environment Variables**: DATABASE_URL for database connection configuration