# Contributing to DocuVerse SaaS

First off, thank you for considering contributing to DocuVerse SaaS! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed**
- **Explain which behavior you expected to see instead**
- **Include screenshots if applicable**
- **Include your environment details** (OS, Node version, database, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternative solutions you've considered**

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/docuverse-saas.git
cd docuverse-saas

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Setup database
npm run db:push
npm run db:seed

# Start dev server
npm run dev
```

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Prefer interfaces over types
- Use explicit return types for functions
- Avoid `any` - use proper types

### React/Next.js

- Use Server Components by default
- Use Client Components (`'use client'`) only when needed
- Follow Next.js App Router conventions
- Keep components small and focused

### Styling

- Use Tailwind CSS utility classes
- Follow existing design patterns
- Use shadcn/ui components when available
- Maintain responsive design

### Database

- Always use Prisma for database queries
- Write migrations for schema changes
- Test with all supported databases
- Include proper indexes

### Naming Conventions

- **Files**: `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Database tables**: `snake_case`

## Commit Messages

Follow conventional commits:

```
feat: add user profile page
fix: resolve authentication bug
docs: update deployment guide
style: format code with prettier
refactor: simplify tenant routing
test: add integration tests
chore: update dependencies
```

## Testing

```bash
# Run tests
npm run test

# Run linter
npm run lint

# Type check
npm run type-check

# Test database
npm run db:push
npm run db:seed
```

## Project Structure

```
app/              # Next.js pages and routes
components/       # Reusable components
lib/              # Utility functions and integrations
prisma/           # Database schema and migrations
scripts/          # Helper scripts
public/           # Static assets
```

## Areas for Contribution

### High Priority
- [ ] MDX content rendering improvements
- [ ] Advanced search features
- [ ] Analytics dashboard
- [ ] Mobile app responsiveness
- [ ] Performance optimizations

### Features
- [ ] More OAuth providers
- [ ] Advanced permissions system
- [ ] Collaboration features
- [ ] API rate limiting per tenant
- [ ] Webhooks for tenant events

### Documentation
- [ ] Video tutorials
- [ ] More examples
- [ ] API documentation
- [ ] Deployment guides
- [ ] Translation to other languages

## Questions?

Feel free to reach out:
- 💬 [Discord Community](https://discord.gg/docuverse)
- 📧 Email: support@docuverse.id
- 🐛 [GitHub Issues](https://github.com/your-org/docuverse-saas/issues)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🙏**
