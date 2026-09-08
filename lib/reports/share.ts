import type {DailySummary} from "./daily";
export function formatDailyReport(r:DailySummary){return [`SMARTCHECK DAILY SECURITY REPORT`,`Date: ${r.date}`,`Total tickets: ${r.total}`,`Approved: ${r.approved}`,`Closed: ${r.closed}`,`Rejected: ${r.rejected}`,`Pending: ${r.pending}`,"","Approval happens only inside SmartCheck. WhatsApp/email sharing is reporting only."].join("\n");}
