import { adminClient } from '../../../../lib/supabase';
import { signToken, setCookieHeader } from '../../../../lib/auth';

export default async function handler(req, res) {
  const { code, state, error: oauthError } = req.query;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;

  if (oauthError) {
    return res.redirect(`${appUrl}/?auth_error=${encodeURIComponent(oauthError)}`);
  }

  // Validate state to prevent CSRF
  const cookies = req.headers.cookie || '';
  const storedState = cookies.match(/ms_oauth_state=([^;]+)/)?.[1];
  if (!storedState || storedState !== state) {
    return res.redirect(`${appUrl}/?auth_error=invalid_state`);
  }

  const tenantId = process.env.MS_TENANT_ID;
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/microsoft/callback`;

  try {
    // Exchange code for access token
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          scope: 'openid profile email offline_access User.Read',
        }),
      }
    );

    const tokens = await tokenRes.json();
    if (!tokenRes.ok || !tokens.access_token) {
      console.error('Token exchange failed:', tokens);
      return res.redirect(`${appUrl}/?auth_error=token_exchange_failed`);
    }

    // Get user profile from Microsoft Graph
    const meRes = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const msUser = await meRes.json();

    const email = (msUser.mail || msUser.userPrincipalName || '').toLowerCase();

    // Enforce @dvceng.com domain
    if (!email.endsWith('@dvceng.com')) {
      return res.redirect(`${appUrl}/?auth_error=unauthorized_domain`);
    }

    const db = adminClient();

    // Find existing user
    let { data: users } = await db.from('users').select('*').eq('email', email).limit(1);
    let user = users?.[0];

    if (!user) {
      // Auto-provision @dvceng.com user
      const { data: newUser, error: createErr } = await db
        .from('users')
        .insert({
          email,
          name: msUser.displayName || email.split('@')[0],
          role: 'engineer',
          password_hash: '$2b$10$placeholder_ms_sso_no_password_used',
          active: true,
        })
        .select()
        .single();

      if (createErr) {
        console.error('User creation error:', createErr);
        return res.redirect(`${appUrl}/?auth_error=user_creation_failed`);
      }
      user = newUser;
    }

    // Update last_login
    await db.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });

    // Clear state cookie, set auth cookie, redirect with token in query for client to pick up
    res.setHeader('Set-Cookie', [
      setCookieHeader(token),
      'ms_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    ]);

    // Pass token via URL fragment so it's never sent to server logs
    return res.redirect(`${appUrl}/?ms_token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error('Microsoft OAuth callback error:', err);
    return res.redirect(`${appUrl}/?auth_error=server_error`);
  }
}
