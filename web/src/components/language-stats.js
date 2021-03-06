import React from 'react';
import { Link } from 'react-router-dom';

import LanguageInfo from './language-info';

export default function LanguageStats({ languages, allLanguages, languageStats, userUnreviewedStats }) {
  if (!languages || languages.length < 1) {
    return (
      <p>
        You have no languages. <br />
        Add languages on your <Link to="/profile">Profile</Link>.
      </p>
    );
  }

  const extendedLanguages = languages.map((lang) => allLanguages.find((extendedLanguage) => extendedLanguage.id === lang)).filter(Boolean);

  return extendedLanguages.map((lang) => languageStats && languageStats[lang.id] && (
    <LanguageInfo
      key={lang.id}
      language={lang.id}
      languageName={lang.name}
      nativeLanguageName={lang.nativeName}
      total={languageStats[lang.id].added}
      validated={languageStats[lang.id].validated}
      rejected={languageStats[lang.id].rejected}
      unreviewedByYou={userUnreviewedStats[lang.id]}
    />
  )).filter(Boolean);
}
