export const clientId = process.env.GOOGLE_CLIENT_ID!;
export const sheetId = process.env.GOOGLE_SPREADSHEET_ID!;
export const apiKey = process.env.GOOGLE_API_KEY!;
if (!clientId) {
  throw new Error("GOOGLE_CLIENT_ID not set in environment");
}
if (!sheetId) {
  throw new Error("GOOGLE_SPREADSHEET_ID not set in environment");
}
if (!apiKey) {
  throw new Error("GOOGLE_API_KEY not set in environment");
}
