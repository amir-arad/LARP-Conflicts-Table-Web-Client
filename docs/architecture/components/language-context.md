# LanguageContext Component

This document provides a detailed description of the `LanguageContext` component (`src/contexts/LanguageContext.tsx`).

## Overview

The `LanguageContext` component manages the application's language and text direction (left-to-right or right-to-left). It provides this information to all child components via React Context.

## Responsibilities

- Storing and providing the currently selected language (`en` or `he`).
- Storing and providing the current text direction (`ltr` or `rtl`).
- Providing a function (`setLanguage`) to change the language.
- Persisting the selected language in local storage.
- Updating the `dir` attribute of the `html` element to reflect the current text direction.

## State

The `LanguageContext` manages the following state variables:

- `language`: The currently selected language ('en' or 'he').
- `direction`: The current text direction ('ltr' or 'rtl').

## Hooks Used

- `useState`, `useEffect`, `useCallback`, `useContext`: Standard React hooks for managing state, side effects, and context.

## Interactions with Other Components

- Provides the language and direction to all child components via React Context.
- Used by `I18nProvider` to configure the `IntlProvider` with the correct messages and locale.
- Used by `LanguageSwitcher` to display and change the current language.
- Used by components that need to handle RTL layouts (e.g., `TableCell`, `Card`).

## Implementation Details

- The component validates the language value and defaults to Hebrew ('he') if an invalid value is provided.
- It persists the selected language in local storage so that it is remembered across sessions.
- It updates the `document.documentElement.dir` and `document.documentElement.lang` attributes to ensure proper RTL support.
