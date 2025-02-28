# Internationalization Feature

This document details the internationalization (i18n) and localization (l10n) features of the LARP Conflicts Table Tool.

## Overview

The application supports multiple languages, including English and Hebrew. It also provides support for right-to-left (RTL) layouts for Hebrew.

## Implementation Details

- **Language Context:** The `LanguageContext` (`src/contexts/LanguageContext.tsx`) manages the currently selected language and text direction (LTR or RTL).
- **Translation Hook:** The `useTranslations` hook (`src/hooks/useTranslations.ts`) provides a function `t` to translate text based on the current language.
- **Message Files:** Translation strings are stored in JSON files under `src/i18n/messages/` (e.g., `en.json`, `he.json`).
- **RTL Support:** The `useRtlUtils` hook (`src/hooks/useRtlUtils.ts`) provides utility functions for handling RTL layouts, including determining text direction and alignment.
- **Language Switcher:** The `LanguageSwitcher` component (`src/components/LanguageSwitcher.tsx`) allows users to switch between supported languages.
- **Internationalization library:** `react-intl` is used to format messages.

## Supported Languages

- English (`en`)
- Hebrew (`he`)

## Usage

To translate text within a component, use the `useTranslations` hook:

```typescript
import { useTranslations } from '../hooks/useTranslations';

function MyComponent() {
  const { t } = useTranslations();

  return (
    <div>{t('app.title')}</div>
  );
}
```
