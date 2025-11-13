import { render, screen } from '@testing-library/react';
import App from './App';

test('renders my app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/my app/i);
  expect(titleElement).toBeInTheDocument();
});
