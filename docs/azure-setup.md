# Microsoft Graph — Azure App Registration Guide

## Why This Is Needed
The DVC CRM creates Outlook calendar events for engineers when leads are assigned. This uses Microsoft Graph API with application-level permissions (no user login required — the app acts as a service account).

---

## Step-by-Step

### 1. Open Azure Portal
Go to https://portal.azure.com and sign in with your Microsoft 365 admin account.

### 2. Navigate to App Registrations
Microsoft Entra ID → App registrations → New registration

### 3. Register the App
- **Name**: DVC Engineering CRM
- **Supported account types**: Accounts in this organizational directory only (Single tenant)
- **Redirect URI**: Leave blank (not needed for service-to-service)
- Click **Register**

### 4. Copy Identifiers
From the app's **Overview** page:
- **Application (client) ID** → `MS_CLIENT_ID`
- **Directory (tenant) ID** → `MS_TENANT_ID`

### 5. Add API Permissions
API permissions → Add a permission → Microsoft Graph → **Application permissions**

Add these permissions:
| Permission | Reason |
|-----------|--------|
| `Calendars.ReadWrite` | Create/update calendar events for engineers |
| `User.Read.All` | Resolve engineer email to user ID |

Click **Grant admin consent for [your org]** — this is required for application permissions.

### 6. Create Client Secret
Certificates & secrets → Client secrets → New client secret
- Description: `dvc-crm-production`
- Expiry: 24 months (or custom)
- Click **Add**

**Copy the secret VALUE immediately** — it will not be shown again.
→ `MS_CLIENT_SECRET`

### 7. Verify Setup
Test the token endpoint:
```bash
curl -X POST \
  https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token \
  -d "grant_type=client_credentials" \
  -d "client_id={CLIENT_ID}" \
  -d "client_secret={CLIENT_SECRET}" \
  -d "scope=https://graph.microsoft.com/.default"
```
You should receive a JSON response with `access_token`.

---

## How It Works in the CRM

1. When an engineer is assigned to a lead, the API calls `createEvent()` in `lib/graph.js`
2. The app authenticates via client credentials flow (no user interaction)
3. It finds the engineer's user ID by their email via `GET /users/{email}`
4. Creates a calendar event on their calendar via `POST /users/{id}/calendar/events`
5. The engineer sees the event in Outlook/Teams calendar

---

## Troubleshooting

**Error: "Insufficient privileges"**
→ Admin consent was not granted. Return to API permissions and click "Grant admin consent".

**Error: "User not found"**
→ The engineer's email must belong to the same Azure AD tenant.

**Error: "Invalid client secret"**
→ Secret may have expired or been copied incorrectly. Create a new one.
