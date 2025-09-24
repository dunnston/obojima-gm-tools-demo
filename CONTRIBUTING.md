# Contributing to Obojima Potions

Thank you for your interest in contributing to Obojima Potions! This guide will help you get started with contributing to the project.

## Development Guidelines

### Console Logging Policy

To maintain a clean production console and preserve useful diagnostics during development:

1. **Console logs must be dev-gated**: All `console.log` statements must be wrapped in development environment checks.

   ```typescript
   // ✅ Good - only logs in development
   if (process.env.NODE_ENV === 'development') {
     console.log('Debug information');
   }

   // ❌ Bad - logs in production
   console.log('Debug information');
   ```

2. **No module-scope logs**: Do not place console logs at the module/file level that execute on import.

3. **Console.error is allowed**: Error logging can remain ungated as it's useful for production debugging.

4. **User feedback priority**: Always prefer user-visible confirmations (alerts, toasts, UI updates) over console logs for important state changes.

### Code Style

- Use TypeScript for all new code
- Follow existing patterns and conventions in the codebase
- Use functional React components with hooks
- Implement proper error handling with try/catch blocks

### State Management

- Use functional state updates to avoid stale closure issues
- Persist state changes atomically with state updates
- Implement proper race condition handling for async operations

### Testing

Before submitting a pull request:
1. Run `npm run build` to ensure the build passes
2. Run `npx tsc --noEmit` to check for TypeScript errors
3. Test your changes in both development and production modes
4. Verify no unexpected console output in production builds

## Submitting Changes

1. Fork the repository
2. Create a feature branch from `master`
3. Make your changes following the guidelines above
4. Commit with clear, descriptive messages
5. Push to your fork and submit a pull request

## Questions?

If you have questions about contributing, please open an issue for discussion.