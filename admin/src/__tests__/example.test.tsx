import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });

  // Example of a component test
  it('should render hello world', () => {
    render(<div>Hello World</div>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
