# Getting Google Access Token Programmatically (Automated Testing)

## Create a Project
1. Create a project on Google Cloud Console: https://console.cloud.google.com/
2. Navigate to **Credentials** -> **+ CREATE CREDENTIALS** -> **OAuth client ID**:
   * Application Type: **Web**
   * Name: Some application's name
   * Authorized redirect URIs: 
     * https://developers.google.com/oauthplayground
     * (Optional) Your real callback handlers, e.g., https://example.com/auth/google/callback
   * Press **Create**
   * Save **Client ID** and **Client Secret**

## Configure OAuth Playground
1. Go to https://developers.google.com/oauthplayground
2. Press top right settings (gear) icon (OAuth 2.0 configuration):
   * Set Force prompt: Consent Screen
   * Enable "Use your own OAuth credentials"
   * Enter your OAuth Client ID and OAuth Client Secret
   * Close the configuration screen

## Authorize and Get Tokens
1. In **Step 1** accordion panel, enter required space-separated scopes (see https://developers.google.com/identity/protocols/oauth2/scopes#oauth2):

   * openid (default)
   * https://www.googleapis.com/auth/userinfo.email
   * https://www.googleapis.com/auth/userinfo.profile

Example scope string:
```
openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile
```

2. Press **Authorize APIs**
3. Choose account and grant permissions
4. You'll be redirected to: https://developers.google.com/oauthplayground/?code=SOME-SINGLE-USE-CODE&scope=openid&...
5. Press **Exchange authorization code for tokens**

Alternative manual method:
```bash
curl -v "https://oauth2.googleapis.com/token" -d "code=SOME-SINGLE-USE-CODE&redirect_uri=https%3A%2F%2Fdevelopers.google.com%2Foauthplayground&client_id=YOUR_APP_CLIENT_ID&client_secret=YOUR_APP_CLIENT_SECRET&scope=&grant_type=authorization_code"
```

## Get Access Token
1. Get your non-expiring refresh token
2. Retrieve access token from **Access token** section

Alternative manual method:
```bash
curl -d "client_id=YOUR_APP_CLIENT_ID&client_secret=YOUR_APP_CLIENT_SECRET&grant_type=refresh_token&refresh_token=YOUR_APP_REFRESH_TOKEN" "https://oauth2.googleapis.com/token"
```

## Validate Token
Request:
```bash
curl "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=ACCESS_TOKEN"
```

Example response:
```json
{
  "id": "10934363016XXXXXXXXXX",
  "picture": "https://lh3.googleusercontent.com/a-/AOh14GhoUlKjYgC-..."
}
```