# Google Sheets CRM Setup

## 1. Create Google Cloud Project
Enable **Google Sheets API** and **Google Drive API**.

## 2. Create Service Account
Create a service account and generate a JSON key. Never commit the JSON key to GitHub.

## 3. Create Spreadsheet
Create tabs named exactly:
- STUDENTS
- HOSTS
- TICKETS
- TICKET_ACTIONS
- VEHICLES
- WORKFLOW_STEPS

## 4. Share Spreadsheet
Share the spreadsheet with the service-account email as Editor.

## 5. Environment Variables
Copy values from the service-account JSON into:
GOOGLE_SHEET_ID
GOOGLE_CLIENT_EMAIL
GOOGLE_PRIVATE_KEY
GOOGLE_DRIVE_FOLDER_ID

## 6. Test
Open /api/crm/health. A successful response confirms server-side Sheets connectivity.

Security: credentials must only exist in server environment variables, never NEXT_PUBLIC variables.
