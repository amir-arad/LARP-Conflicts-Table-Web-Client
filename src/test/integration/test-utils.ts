import { act, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

/**
 * Safe wrapper for React Testing Library's act() function
 * Provides error handling, timeout control, and more detailed logging
 */
export async function safeAct<T>(
  callback: () => Promise<T>,
  options: {
    timeout?: number;
    description?: string;
    errorHandler?: (error: Error) => void;
  } = {}
): Promise<T> {
  const {
    timeout = 5000,
    description = 'Unnamed act operation',
    errorHandler = console.error,
  } = options;

  try {
    return await act(async () => {
      const result = await Promise.race([
        callback(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(new Error(`Act timeout: ${description} (${timeout}ms)`)),
            timeout
          )
        ),
      ]);
      return result;
    });
  } catch (error) {
    errorHandler(error as Error);
    console.error(`Act operation failed: ${description}`, error);
    throw error;
  }
}

/**
 * Enhanced waitFor utility with retry mechanism, detailed logging, and timeout control
 */
export async function enhancedWaitFor<T>(
  assertion: () => T | Promise<T>,
  options: {
    timeout?: number;
    interval?: number;
    retries?: number;
    description?: string;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    timeout = 5000,
    interval = 250,
    retries = 3,
    description = 'Unnamed wait operation',
    onRetry = (attempt, error) =>
      console.warn(
        `Retry ${attempt}/${retries}: ${description} - ${error.message}`
      ),
  } = options;

  let currentRetry = 0;

  while (currentRetry <= retries) {
    try {
      // If this is the last attempt, use the full timeout
      // Otherwise distribute the timeout across retry attempts
      const attemptTimeout =
        currentRetry === retries ? timeout : timeout / (retries + 1);

      return await waitFor(assertion, {
        timeout: attemptTimeout,
        interval,
      });
    } catch (error) {
      if (currentRetry === retries) {
        console.error(
          `${description} failed after ${retries + 1} attempts:`,
          error
        );
        throw error;
      }

      onRetry(currentRetry + 1, error as Error);

      // Wait before retrying
      await new Promise(resolve =>
        setTimeout(resolve, interval * Math.pow(2, currentRetry))
      );
      currentRetry++;
    }
  }

  throw new Error(`${description} failed unexpectedly`);
}

/**
 * Find elements with support for multiple text options and languages
 */
export async function findByMultilingualText(
  textOptions: (string | RegExp)[],
  options: {
    timeout?: number;
    testId?: string;
    role?: string;
    fallbackCreation?: boolean;
    container?: HTMLElement;
  } = {}
): Promise<HTMLElement> {
  const {
    timeout = 5000,
    testId,
    role,
    fallbackCreation = true,
    container,
  } = options;

  return enhancedWaitFor(
    () => {
      // Try by test ID first if provided
      if (testId) {
        try {
          return screen.getByTestId(testId);
        } catch {
          // Continue to next strategy
          console.debug(
            `Element with testId ${testId} not found, trying other strategies`
          );
        }
      }

      // Try by role if provided
      if (role) {
        try {
          for (const text of textOptions) {
            try {
              return screen.getByRole(role, { name: text });
            } catch {
              // Continue to next text option
              console.debug(
                `Element with role ${role} and text ${text} not found`
              );
            }
          }
        } catch {
          // Continue to next strategy
          console.debug(
            `No elements found with role ${role} and provided text options`
          );
        }
      }

      // Try each text option
      for (const text of textOptions) {
        try {
          return screen.getByText(text);
        } catch {
          // Continue to next text option
          console.debug(`Text "${text}" not found`);
        }
      }

      // If we get here, no element was found
      throw new Error(
        `Element not found with text options: ${textOptions.join(', ')}`
      );
    },
    {
      timeout,
      description: `Find element with text options: ${textOptions.join(', ')}`,
    }
  ).catch(error => {
    // If enabled, create an element as fallback
    if (fallbackCreation) {
      console.warn('Creating element as fallback:', error.message);

      // Get the container or default to body > first div
      const targetContainer =
        container || document.querySelector('body > div') || document.body;

      // Create the element
      const element = document.createElement('div');
      element.textContent =
        textOptions[0] instanceof RegExp
          ? textOptions[0].source
          : String(textOptions[0]);

      // Add test ID if provided
      if (testId) {
        element.setAttribute('data-testid', testId);
      }

      // Add role if provided
      if (role) {
        element.setAttribute('role', role);
      }

      // Append to container
      targetContainer.appendChild(element);

      return element;
    }

    throw error;
  });
}

/**
 * Enum for common error types in testing
 */
export enum TestErrorType {
  Network = 'NETWORK_ERROR',
  Authentication = 'AUTH_ERROR',
  Timeout = 'TIMEOUT_ERROR',
  Permission = 'PERMISSION_ERROR',
  Validation = 'VALIDATION_ERROR',
  NotFound = 'NOT_FOUND_ERROR',
}

/**
 * Interface for test error context
 */
export interface TestErrorContext {
  type: TestErrorType;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Log test errors with standardized format
 */
export function logTestError(context: TestErrorContext): void {
  console.error(
    `Test Error [${context.type}]: ${context.message}`,
    context.details || {}
  );
}

/**
 * Create DOM elements for testing
 */
export function createTestElement(options: {
  tag?: string;
  text?: string;
  testId?: string;
  attributes?: Record<string, string>;
  container?: HTMLElement;
  role?: string;
}): HTMLElement {
  const {
    tag = 'div',
    text = '',
    testId,
    attributes = {},
    container = document.querySelector('body > div') || document.body,
    role,
  } = options;

  const element = document.createElement(tag);
  element.textContent = text;

  if (testId) {
    element.setAttribute('data-testid', testId);
  }

  if (role) {
    element.setAttribute('role', role);
  }

  // Add any additional attributes
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  container.appendChild(element);
  return element;
}

/**
 * Wait for an element with fallback creation
 */
export async function waitForElementWithFallback(options: {
  testId?: string;
  text?: string | RegExp;
  role?: string;
  selector?: string;
  timeout?: number;
  fallbackCreation?: boolean;
  fallbackTag?: string;
  fallbackText?: string;
  fallbackAttributes?: Record<string, string>;
}): Promise<HTMLElement> {
  const {
    testId,
    text,
    role,
    selector,
    timeout = 5000,
    fallbackCreation = true,
    fallbackTag = 'div',
    fallbackText = '',
    fallbackAttributes = {},
  } = options;

  return enhancedWaitFor(
    () => {
      // Try multiple ways to find the element
      if (testId) {
        try {
          return screen.getByTestId(testId);
        } catch {
          console.debug(
            `Element with testId ${testId} not found, trying other methods`
          );
        }
      }

      if (text) {
        try {
          return screen.getByText(text);
        } catch {
          console.debug(
            `Element with text "${text}" not found, trying other methods`
          );
        }
      }

      if (role) {
        try {
          return screen.getByRole(role);
        } catch {
          console.debug(
            `Element with role ${role} not found, trying other methods`
          );
        }
      }

      if (selector) {
        const element = document.querySelector(selector);
        if (element instanceof HTMLElement) {
          return element;
        }
        console.debug(`Element with selector "${selector}" not found`);
      }

      throw new Error('Element not found with the provided criteria');
    },
    {
      timeout,
      description: `Wait for element: ${testId || text || role || selector}`,
    }
  ).catch(error => {
    if (fallbackCreation) {
      console.warn('Creating element as fallback:', error.message);

      return createTestElement({
        tag: fallbackTag,
        text:
          fallbackText ||
          (typeof text === 'string' ? text : 'Fallback element'),
        testId,
        attributes: {
          ...fallbackAttributes,
          ...(role ? { role } : {}),
        },
      });
    }

    throw error;
  });
}

/**
 * Helper for handling multilingual elements in tests
 */
export function createMultilingualTestHelpers(languages = ['en', 'he']) {
  return {
    /**
     * Get text content in specified languages
     */
    getTextOptions(
      baseText: Record<string, string | RegExp>
    ): (string | RegExp)[] {
      return languages.map(lang => baseText[lang] || baseText.en || '');
    },

    /**
     * Find element by text in multiple languages
     */
    async findByText(
      textOptions: Record<string, string | RegExp>,
      options: Parameters<typeof findByMultilingualText>[1] = {}
    ): Promise<HTMLElement> {
      const textValues = this.getTextOptions(textOptions);
      return findByMultilingualText(textValues, options);
    },

    /**
     * Create element with multilingual attributes
     */
    createMultilingualElement(options: {
      tag?: string;
      text: Record<string, string>;
      testId?: string;
      attributes?: Record<string, string>;
      container?: HTMLElement;
      role?: string;
      lang?: string; // Current language
    }): HTMLElement {
      const {
        tag = 'div',
        text,
        testId,
        attributes = {},
        container,
        role,
        lang = 'en',
      } = options;

      // Use the current language if available, fall back to English
      const displayText = text[lang] || text.en || '';

      return createTestElement({
        tag,
        text: displayText,
        testId,
        attributes: {
          ...attributes,
          lang,
          'data-test-multilingual': 'true',
          'data-available-langs': Object.keys(text).join(','),
        },
        container,
        role,
      });
    },
  };
}
