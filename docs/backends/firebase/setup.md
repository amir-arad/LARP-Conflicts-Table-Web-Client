# Firebase Project Setup Documentation

## Project Configuration

1. Project Name: conflicts-table-collab
2. Project ID: larp-conflicts-table-23b18
3. Database Type: Realtime Database
4. Location: europe-west1

## Important URLs

- Console URL: https://console.firebase.google.com/project/larp-conflicts-table-23b18
- Database URL: https://larp-conflicts-table-23b18-default-rtdb.europe-west1.firebasedatabase.app/

## Security Rules

The security rules have been implemented in `firebase/database.rules.json`. These rules ensure:

- Presence data is secured per user
- Lock management is accessible to all authenticated users
- Data validation for all fields
- Automatic lock expiration

## Schema Structure

As defined in REALTIME-DESIGN.md, the database follows this structure:

```typescript
interface RealtimeState {
  sheets: {
    [sheetId: string]: {
      presence: {
        [userId: string]: {
          name: string,
          photoUrl: string,
          lastActive: timestamp,
          activeCell?: string
        }
      },
      locks: {
        [cellId: string]: {
          userId: string,
          acquired: timestamp,
          expires: timestamp + 30000  // 30s TTL
        }
      }
    }
  }
}
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in all Firebase-related environment variables:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_DATABASE_URL
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID

## Next Steps

1. Initialize Firebase in the application (Story 1.2)
2. Set up authentication if required
3. Implement real-time sync features (Story 1.3)

## Security Considerations

1. Never commit API keys to version control
2. Review and update security rules before production
3. Set up proper authentication for production use
4. Implement database backups if needed

## Maintenance Notes

- Monitor database usage in Firebase Console
- Set up alerts for excessive usage
- Regularly review security rules
- Keep Firebase SDK updated
