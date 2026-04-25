// Microsoft Graph API integration — O365 calendar events + Outlook email sending

const MS_GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

async function getAccessToken() {
  const tenantId = process.env.MS_TENANT_ID;
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Microsoft Graph credentials not configured');
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to get Graph token: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function getUserIdByEmail(token, email) {
  const res = await fetch(`${MS_GRAPH_BASE}/users/${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`User not found: ${email}`);
  const data = await res.json();
  return data.id;
}

export async function createEvent(engineerEmail, eventData) {
  const token = await getAccessToken();
  const userId = await getUserIdByEmail(token, engineerEmail);

  const res = await fetch(`${MS_GRAPH_BASE}/users/${userId}/calendar/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create calendar event: ${err}`);
  }

  return res.json();
}

// Send email from an O365 mailbox via Microsoft Graph
export async function sendOutlookEmail({ fromEmail, toEmail, subject, htmlBody, ccEmails = [] }) {
  const token = await getAccessToken();
  const userId = await getUserIdByEmail(token, fromEmail);

  const message = {
    subject,
    body: { contentType: 'HTML', content: htmlBody },
    toRecipients: (Array.isArray(toEmail) ? toEmail : [toEmail]).map(a => ({ emailAddress: { address: a } })),
    ccRecipients: ccEmails.map(a => ({ emailAddress: { address: a } })),
  };

  const res = await fetch(`${MS_GRAPH_BASE}/users/${userId}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, saveToSentItems: true }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to send Outlook email: ${err}`);
  }
  return true;
}

// Update an existing calendar event
export async function updateEvent(engineerEmail, eventId, eventData) {
  const token = await getAccessToken();
  const userId = await getUserIdByEmail(token, engineerEmail);

  const res = await fetch(`${MS_GRAPH_BASE}/users/${userId}/calendar/events/${eventId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to update calendar event: ${err}`);
  }
  return res.json();
}

// Get all events for a user between two dates
export async function getCalendarEvents(userEmail, startDate, endDate) {
  const token = await getAccessToken();
  const userId = await getUserIdByEmail(token, userEmail);
  const start = encodeURIComponent(new Date(startDate).toISOString());
  const end = encodeURIComponent(new Date(endDate).toISOString());

  const res = await fetch(
    `${MS_GRAPH_BASE}/users/${userId}/calendarView?startDateTime=${start}&endDateTime=${end}&$select=id,subject,start,end,location&$orderby=start/dateTime`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error('Failed to fetch calendar events');
  const data = await res.json();
  return data.value || [];
}

export function buildCalendarEvent({ title, description, startDateTime, endDateTime, location, attendees = [], directorEmail }) {
  const attendeeList = attendees.map((email) => ({
    emailAddress: { address: email },
    type: 'required',
  }));

  if (directorEmail && !attendees.includes(directorEmail)) {
    attendeeList.push({
      emailAddress: { address: directorEmail },
      type: 'optional',
    });
  }

  return {
    subject: title,
    body: {
      contentType: 'HTML',
      content: description,
    },
    start: {
      dateTime: startDateTime,
      timeZone: 'Europe/London',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'Europe/London',
    },
    location: location ? { displayName: location } : undefined,
    attendees: attendeeList,
    isReminderOn: true,
    reminderMinutesBeforeStart: 60,
  };
}
