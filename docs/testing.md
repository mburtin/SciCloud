# Testing Architecture & Standards

## Testing Stack

### Core Testing Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Vitest** | Unit & Integration Testing | ^3.1.1 |
| **Playwright** | E2E Testing | ^1.54.2 |
| **Vue Test Utils** | Vue Component Testing | ^2.4.6 |
| **jsdom** | DOM Simulation | ^25.0.1 |
| **@vitest/coverage-v8** | Coverage Reporting | ^3.1.1 |

### Supporting Libraries

- **Pinia Testing**: State management testing utilities
- **Supabase Mocks**: Database and auth mocking
- **Custom Fixtures**: Reusable test data generators

## Project Structure

```
tests/
├── e2e/                          # End-to-End Tests
│   ├── fixtures/                 # Playwright fixtures
│   │   └── base.ts              # Base test configuration
│   ├── home.spec.ts             # Home page E2E tests
│   └── navigation.spec.ts       # Navigation E2E tests
│
├── web/                         # Unit & Integration Tests
│   ├── __mocks__/               # Mock implementations
│   │   ├── pinia.mock.ts        # Pinia store mocks
│   │   └── supabase.mock.ts     # Supabase client mocks
│   │
│   ├── suites/                  # Test suites organized by domain
│   │   ├── services/            # Service layer tests
│   │   ├── stores/              # Pinia store tests
│   │   └── utils/               # Utility function tests
│   │
│   ├── utils/                   # Testing utilities
│   │   ├── fixtures.ts          # Test data generators
│   │   └── test-utils.ts        # Common test helpers
│   │
│   └── setup.ts                 # Global test setup
│
├── vitest.config.ts             # Vitest configuration
└── playwright.config.ts         # Playwright configuration
```

## Configuration

### Vitest Configuration

The project uses Vitest with the following key configurations:

```typescript
// vitest.config.ts highlights
{
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/web/setup.ts'],
    
    coverage: {
      provider: 'v8',
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    },
    
    testTimeout: 10000
  }
}
```

## Coverage Standards

### Coverage Thresholds

- **Branches**: 70% minimum
- **Functions**: 70% minimum  
- **Lines**: 70% minimum
- **Statements**: 70% minimum

## Testing Commands

### Development Commands

```bash
# Unit Tests
pnpm test                 # Run all unit tests
pnpm test:ui             # Run tests with UI interface
pnpm test:coverage       # Run tests with coverage report
pnpm test --watch        # Run tests in watch mode

# E2E Tests  
pnpm test:e2e            # Run E2E tests (headless)
pnpm test:e2e:ui         # Run E2E tests with Playwright UI
pnpm test:e2e:headed     # Run E2E tests in headed mode
pnpm test:e2e:debug      # Run E2E tests in debug mode
```

### CI/CD Commands

```bash
# Production testing pipeline
pnpm test:ci             # Run all tests for CI
pnpm test:coverage       # Generate coverage reports
pnpm test:e2e --reporter=github  # E2E tests with GitHub reporter
```

## Quick Reference

### Test File Naming

- Unit tests: `*.test.ts` or `*.spec.ts`
- E2E tests: `*.spec.ts` in `tests/e2e/`
- Mock files: `*.mock.ts` in `__mocks__/`

### Essential Test Utilities

```typescript
// From test-utils.ts
createMockUser()          // Generate mock user
createMockUsers(5)        // Generate multiple users
createMockApiResponse()   // Mock API responses
nextTick()               // Wait for Vue reactivity
waitFor(ms)              // Custom wait utility
```

## Quality Gates

### 1. Pre-Merge Requirements

- ✅ All tests pass
- ✅ Coverage thresholds met
- ✅ No test performance regressions
- ✅ E2E tests pass for critical paths

### 2. Release Requirements

- ✅ Full test suite passes
- ✅ E2E tests pass on all supported browsers
- ✅ Performance tests within acceptable limits
- ✅ Security tests pass (if applicable)

## Troubleshooting

### Common Issues

1. **Flaky E2E Tests**
   - Increase timeouts for slow CI environments
   - Add proper wait conditions
   - Use data-testid attributes for stable selectors

2. **Memory Leaks in Tests**
   - Properly clean up event listeners
   - Reset global state between tests
   - Avoid circular references in mocks

3. **Slow Test Performance**
   - Optimize mock implementations
   - Use shallow mounting when possible
   - Minimize heavy mock setups
   - Reduce test data size

### Debug Strategies

1. **Isolate failing tests** with `test.only()`
2. **Add debug logging** with `console.log()` in tests
3. **Use test UI** for visual debugging
4. **Check test coverage** to identify untested paths

## Future Enhancements

### Planned Improvements

1. **Visual Regression Testing**: Implement screenshot comparison
2. **Component Library Testing**: Dedicated Storybook integration
3. **API Contract Testing**: OpenAPI schema validation
4. **Performance Monitoring**: Automated performance regression detection
5. **Accessibility Testing**: Automated a11y validation

### Tool Evaluations

- **Storybook**: For component documentation and testing
- **MSW**: For more sophisticated API mocking
- **Chromatic**: For visual regression testing
- **Lighthouse CI**: For performance monitoring
