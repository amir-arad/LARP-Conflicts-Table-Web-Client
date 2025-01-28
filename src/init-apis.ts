import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_SHEETS_CLIENT_ID,
  process.env.GOOGLE_SHEETS_CLIENT_SECRET,
  "your_redirect_uri"
);

const sheets = google.sheets({ version: "v4", auth: oauth2Client });

/*
Read data:
async function readSheet() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: 'Sheet1!A1:Z1000',
  });
  return response.data.values;
}

Write data:
async function updateCell(range, values) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: { values },
  });
}

*/
