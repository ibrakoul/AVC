import { renderRouter } from 'expo-router/testing-library';
import { join } from 'node:path';

const APP = join(__dirname, '..', '..', 'app');

/**
 * Renders the REAL app routes (app/ directory) at `url`.
 * Note: expo-router's renderRouter enables fake timers; tests restore real
 * timers in afterEach. In RNTL v14 `fireEvent` is async and must be awaited.
 */
export function renderApp(url: string) {
  return renderRouter(APP, { initialUrl: url });
}
