import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { defaultConfig } from '../lib/config';
import SettingsMenu from './SettingsMenu';

// dhtech: the credit to Yopass, which upstream shows in the footer, is in
// the settings menu.

vi.mock('@shared/hooks/useConfig', () => ({
  useConfig: () => defaultConfig,
}));
vi.mock('@shared/theme/ThemeProvider', () => ({
  useTheme: () => ({ mode: 'light', setTheme: () => {} }),
}));
vi.mock('@shared/hooks/useDateFormat', () => ({
  useDateFormat: () => ['locale', () => {}],
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'en', changeLanguage: () => {} },
  }),
}));

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

it('shows the Yopass credit when the menu is open', async () => {
  await act(async () => root.render(<SettingsMenu />));
  expect(container.querySelector('[data-testid="yopass-credit"]')).toBeNull();

  const button = container.querySelector<HTMLButtonElement>(
    '[data-testid="settings-menu-button"]',
  )!;
  await act(async () => button.click());

  const credit = container.querySelector('[data-testid="yopass-credit"]')!;
  expect(credit.textContent).toBe(`© 2014–${new Date().getFullYear()} Yopass`);
  const link = credit.querySelector('a')!;
  expect(link.getAttribute('href')).toBe('https://yopass.se');
  expect(link.getAttribute('rel')).toBe('noopener noreferrer');
});
