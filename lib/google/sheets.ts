// Google Sheets CRM adapter. Credentials stay server-side.
export type SheetRow=Record<string,string|number|boolean|undefined>;
export async function appendTicketToCRM(_ticket:SheetRow){throw new Error("Google Sheets integration not configured. Add service-account credentials and GOOGLE_SHEET_ID.");}