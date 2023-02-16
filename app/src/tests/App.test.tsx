import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../app/App';

test('renders app welcome message', () => {
  render(<App />);
  const linkElement = screen.getByTestId("app-welcome");
  expect(linkElement).toHaveTextContent("Welcome to packit");
});
