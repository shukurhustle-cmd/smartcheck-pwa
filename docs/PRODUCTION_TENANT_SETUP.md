# SmartCheck production tenant setup

## Required Vercel environment variables

Set these in the Vercel project for Production (and Preview while testing):

- `DATABASE_URL` — PostgreSQL connection string.
- `SMARTCHECK_SESSION_SECRET` — long random secret used to sign HttpOnly sessions.
- `SMARTCHECK_PLATFORM_ADMIN_USERNAME` — initial SmartCheck platform administrator username.
- `SMARTCHECK_PLATFORM_ADMIN_PASSWORD` — initial platform administrator password (minimum 8 characters).

Google Sheets variables are optional and are no longer required for parent early-pickup requests.

## Database initialization

Run `db/schema.sql` once against the PostgreSQL database before using tenant provisioning.

## First login

1. Open `/login`.
2. Sign in with the bootstrap Platform Admin credentials.
3. Open `/platform-admin`.
4. Create the first School, Hospital, Apartment or other tenant.
5. Set the tenant administrator name, username and initial password.
6. The tenant administrator then signs in through `/login`.
7. The tenant administrator creates Parent, Approver, Reception, Security and Visitor accounts from `/admin/users`.
8. Upload student/member master data from `/admin/import` using CSV or Excel.

## School early-pickup flow

Parent login → linked student → reason → approval queue → Approve/Reject → notification fan-out → QR generation → Reception scan → Security scan → Closed.

Rejected requests notify the parent and tenant operational stakeholders. QR tokens are tenant-scoped, expire after 30 minutes, and cannot be reused after a checkpoint transition.

## Security boundary

Every tenant-owned database record carries `tenant_id`. Operational APIs must authorize the signed session server-side; client role selectors are not used as authentication.
