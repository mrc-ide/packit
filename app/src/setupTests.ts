// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { server } from "./msw/server";
import ResizeObserverPolyFill from "resize-observer-polyfill";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

jest.mock("./lib/auth/getBearerToken", () => ({
  getBearerToken: jest.fn(() => "fake-token")
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

document.title = "App Title";

// Checkbox component needs ResizeObserver
window.ResizeObserver = ResizeObserverPolyFill;

// combobox needs this for tests
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// fix issue with swr in tests TypeError: Cannot read properties of null (reading 'visibilityState')
// https://github.com/vercel/swr/issues/2373
global.beforeEach(() => {
  const original = jest.requireActual("swr/_internal");
  const originalIsVisible = original.defaultConfig.isVisible;
  original.defaultConfig.isVisible = () => {
    try {
      return originalIsVisible();
    } catch (e) {
      return true;
    }
  };
});
