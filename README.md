This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Development Setup

This project is configured with the following development tools for optimal code quality:

### Code Quality Tools

- **ESLint**: Configured with Next.js best practices, TypeScript support, and React rules
- **Prettier**: Automatic code formatting with consistent style
- **TypeScript**: Type checking for enhanced development experience
- **Husky**: Git hooks for automated quality checks
- **lint-staged**: Run linters on staged files only

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check if code is formatted
npm run type-check   # TypeScript type checking
npm run check-all    # Run all quality checks
```

### Pre-commit Hooks

This project automatically runs the following on each commit:

- ESLint with auto-fix for TypeScript/JavaScript files
- Prettier formatting for all supported files
- Type checking

### VS Code Setup

The project includes VS Code configuration for:

- Automatic formatting on save
- ESLint integration
- Tailwind CSS IntelliSense
- Recommended extensions

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
