import '@testing-library/jest-dom';
import { describe, expect, it } from '@jest/globals';
import Home from '../pages/index';
import { renderWithCamera } from '@/utils/testUtils';
import { screen } from '@testing-library/dom';

describe('App', () => {
  it('renders App', () => {
    // render the Home component with the camera context
    renderWithCamera(Home);

    const button = screen.getByRole('button', { name: /start/i });

    expect(button).toBeInTheDocument();
  });
});
