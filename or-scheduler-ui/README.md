# OrSchedulerUi

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

This project uses **Playwright** for E2E testing.

Run smoke tests in headless mode:

```bash
npm run e2e
```

Run in headed mode:

```bash
npm run e2e:headed
```

Open Playwright UI mode for debugging and extending tests:

```bash
npm run e2e:ui
```

### E2E structure

- `e2e/smoke.spec.ts` — baseline smoke test for protected route behavior
- `playwright.config.ts` — browser, web server, retries, and CI settings

### CI usage

For CI environments, use:

```bash
npm run e2e:ci
```

GitHub Actions workflow: `.github/workflows/frontend-e2e.yml`

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
