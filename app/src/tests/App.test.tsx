import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../app/App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByTestId("app-welcome");
  expect(linkElement).toHaveTextContent(/Welcome to the new Packit modelling App/);
});
