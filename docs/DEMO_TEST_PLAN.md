# SmartCheck Demo Test Plan

## Demo flow
1. Parent creates an early-pickup request with student, reason and contact details.
2. Approver reviews and approves inside SmartCheck.
3. The approved ticket receives a QR.
4. Reception scans the QR and records the reception checkpoint.
5. Security scans the same ticket QR and records final closure.
6. Visitor flow follows the same approval → QR → reception → security pattern.
7. Security captures a vehicle photo, confirms the detected/manual vehicle number, and saves the photo to Drive plus the record to Sheets.
8. Notifications are visible inside `/notifications` and refresh automatically.
9. Management generates `/reports` and can share the report through WhatsApp or email. Sharing does not approve anything.

## Demo prerequisites
- `GOOGLE_SHEET_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` configured on the server.
- Google Sheets tabs: STUDENTS, HOSTS, TICKETS, TICKET_ACTIONS, VEHICLES, WORKFLOW_STEPS, PATROLS, HELP_REQUESTS, NOTIFICATIONS.
- Google Drive folder ID configured for vehicle media.
- Browser camera permission enabled for QR and vehicle capture.

## Important demo limitation
Pilot role selection is not production authentication yet. QR persistence/replay protection and full server-side authorization remain production-hardening gates.
