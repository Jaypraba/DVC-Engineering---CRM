// Redirect user to Microsoft OAuth login
export default function handler(req, res) {
  const tenantId = process.env.MS_TENANT_ID;
  const clientId = process.env.MS_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;
  const redirectUri = `${appUrl}/api/auth/microsoft/callback`;

  if (!tenantId || !clientId) {
    return res.status(500).json({ error: 'Microsoft OAuth not configured' });
  }

  const state = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  res.setHeader('Set-Cookie', `ms_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'openid profile email offline_access User.Read',
    state,
    response_mode: 'query',
    prompt: 'select_account',
  });

  res.redirect(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params}`);
}
