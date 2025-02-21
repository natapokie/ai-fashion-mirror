import React from 'react';
import { render } from '@testing-library/react';
import { jest } from '@jest/globals';
import { CameraContext, CameraContextType } from '@/context/cameraContext';

const context: CameraContextType = {
  videoRef: { current: document.createElement('video') },
  startCamera: jest.fn(() => Promise.resolve()),
  stopCamera: jest.fn(),
  takePhoto: jest.fn(() => Promise.resolve(new FormData())),
};

export const renderWithCamera = (
  Component: React.FC,
  mockedContextValue: CameraContextType = context,
) => {
  render(
    <CameraContext.Provider value={mockedContextValue}>
      <Component></Component>
    </CameraContext.Provider>,
  );
};
