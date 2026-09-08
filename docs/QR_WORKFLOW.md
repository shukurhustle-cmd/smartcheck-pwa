# QR Lifecycle

1. Ticket reaches approval step.
2. Approval action marks ticket approved.
3. Server generates a unique QR token tied to ticket ID.
4. QR image is displayed as the SmartCheck pass.
5. Reception scans and validates the ticket.
6. Ticket advances to SECURITY_PENDING.
7. Security scans the same pass.
8. Ticket closes and an audit action is recorded.

Production hardening next: persist token hashes, expiry, one-time checkpoint rules and audit records in CRM.
