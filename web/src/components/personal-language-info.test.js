import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PersonalLanguageInfo from './personal-language-info';

test('should render if not added languages', () => {
  render(<PersonalLanguageInfo/>);
  expect(screen.getByText('You have not added any languages yet.')).toBeTruthy();
});

test('should list languages with stats', () => {
  const props = {
    languageStats: {
      en: {
        added: 5,
      },
      de: {
        added: 2,
      },
    },
    languages: [{
      id: 'en',
      name: 'English',
      nativeName: 'English',
    }, {
      id: 'de',
      name: 'German',
      nativeName: 'Deutsch',
    }],
    pendingLanguages: false,
  };

  render(<PersonalLanguageInfo {...props}/>);

  expect(screen.getByText('English (English)')).toBeTruthy();
  expect(screen.getByText('5 added by you')).toBeTruthy();
  expect(screen.getByText('Deutsch (German)')).toBeTruthy();
  expect(screen.getByText('2 added by you')).toBeTruthy();
});

test('should use 0 if no stats', () => {
  const props = {
    languageStats: {},
    languages: [{
      id: 'en',
      name: 'English',
      nativeName: 'English',
    }],
    pendingLanguages: false,
  };

  render(<PersonalLanguageInfo {...props}/>);

  expect(screen.getByText('English (English)')).toBeTruthy();
  expect(screen.getByText('0 added by you')).toBeTruthy();
});

test('should render remove button', () => {
  const props = {
    languageStats: {},
    languages: [{
      id: 'en',
      name: 'English',
      nativeName: 'English',
    }],
    pendingLanguages: false,
  };

  render(<PersonalLanguageInfo {...props}/>);

  expect(screen.getByRole('button')).toBeTruthy();
  expect(screen.getByText('remove')).toBeTruthy();
});

test('should disable button while languages are pending', () => {
  const props = {
    languageStats: {},
    languages: [{
      id: 'en',
      name: 'English',
      nativeName: 'English',
    }],
    pendingLanguages: true,
  };

  render(<PersonalLanguageInfo {...props}/>);

  expect(screen.getByRole('button').disabled).toBeTruthy();
});

test('should dispatch on remove', async () => {
  const onRemove = jest.fn();
  const props = {
    languageStats: {},
    languages: [{
      id: 'en',
      name: 'English',
      nativeName: 'English',
    }],
    pendingLanguages: false,
    onRemove,
  };

  render(<PersonalLanguageInfo {...props}/>);

  await userEvent.click(screen.getByRole('button'));
  expect(onRemove).toHaveBeenCalled();
});
