# Authentication User Flow

This document describes the user flow for authentication in the LARP Conflicts Table Tool.

## Flow Diagram

```mermaid
graph LR
    A[User opens application] --> B(Click "Log In");
    B --> C{Redirect to Google Sign-In};
    C --> D[User selects Google account];
    D --> E{Grant permission};
    E --> F(Redirect back to application);
    F --> G{Exchange code for token};
    G --> H{Authenticate with Firebase};
    H --> I[User is logged in];
```

## Steps

1.  **User opens application:** The user navigates to the application URL.
2.  **Click "Log In":** The user clicks the "Log In" button.
3.  **Redirect to Google Sign-In:** The application redirects the user to the Google Sign-In page.
4.  **User selects Google account:** The user chooses the Google account they want to use.
5.  **Grant permission:** The user grants the application permission to access their Google account information (profile and email).
6.  **Redirect back to application:** Google redirects the user back to the application with an authorization code.
7.  **Exchange code for token:** The application exchanges the authorization code for an access token.
8.  **Authenticate with Firebase:** The application uses the access token to authenticate with Firebase.
9.  **User is logged in:** The user is now logged in and can access the application's features.
