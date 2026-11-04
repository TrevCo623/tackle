/* Tackle real-app layer: Google sign-in, Supabase sync, daily push opt-in.
   Loaded before the main UI script. The UI reads window.TACKLE_APP and calls the hooks below. */
(function () {
  const cfg = window.TACKLE_CONFIG || {};
  const A = (window.TACKLE_APP = {});
  const hasBackend = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);
  const PENDING = 'tackle-app-pending';
  const STATE_KEY = 'tackle-app-v1';

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

  if (!hasBackend) { A.user = null; return; } // No config yet: local-only on this device.

  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  let user = null, ready = false, lastRemote = 0, timer = null, pushSub = null;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  A.user = () => {
    if (!user) return { initial: '' };
    const m = user.user_metadata || {};
    const name = m.full_name || m.name || user.email || '';
    return { initial: name.trim().charAt(0) || '·', name, email: user.email };
  };

  A.gate = () => {
    if (!ready) return '<section class="gate"><p class="eyebrow">Loading</p></section>';
    if (user) return null;
    return `<section class="gate">
      <h1>Tackle</h1>
      <p class="lede">Tackle your tasks, one day at a time.</p>
      <button type="button" class="google-btn" data-act="sign-in">
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
        Continue with Google</button>
    </section>`;
  };

  A.signIn = async () => {
    const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });
    if (error && A.toast) A.toast('Sign-in failed: ' + error.message);
  };

  A.signOut = async () => {
    try { localStorage.removeItem(STATE_KEY); localStorage.removeItem(PENDING); } catch (e) { /* ignore */ }
    await sb.auth.signOut();
    location.replace(location.pathname);
  };

  /* ---------- Sync: one row per user holding the whole state ---------- */
  async function write(S) {
    const at = Date.now();
    const { error } = await sb.from('tackle_state').upsert({ user_id: user.id, state: S, updated_at: at });
    if (!error) { lastRemote = at; try { localStorage.removeItem(PENDING); } catch (e) { /* ignore */ } }
  }
  A.push = (S) => {
    if (!user) return;
    try { localStorage.setItem(PENDING, String(Date.now())); } catch (e) { /* ignore */ }
    clearTimeout(timer);
    timer = setTimeout(() => write(S).catch(() => {}), 700);
  };
  window.TackleSync = { push: A.push };

  async function pull() {
    if (!user) return;
    const { data, error } = await sb.from('tackle_state').select('state, updated_at').eq('user_id', user.id).maybeSingle();
    if (error) return;
    const pending = Number(localStorage.getItem(PENDING) || 0);
    if (!data) { await write(A.getState()); return; }            // First sign-in: this device's state becomes the account's.
    if (pending && pending > data.updated_at) { await write(A.getState()); return; } // Offline edits win if newer.
    if (data.updated_at > lastRemote) { lastRemote = data.updated_at; A.setState(data.state); }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pull(); });
  window.addEventListener('online', () => { if (localStorage.getItem(PENDING)) write(A.getState()).catch(() => {}); });

  sb.auth.onAuthStateChange((event, session) => {
    const prev = user && user.id;
    user = session ? session.user : null;
    ready = true;
    if (user && user.id !== prev) { pull(); refreshPush(); }
    if (A.render) A.render();
  });

  /* ---------- Daily nudge (Web Push, sent by a scheduled Supabase function) ---------- */
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const needsInstall = () => isIOS && !standalone;
  const b64 = (s) => { const p = '='.repeat((4 - (s.length % 4)) % 4); const raw = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(raw, (c) => c.charCodeAt(0)); };

  async function refreshPush() {
    if (!pushSupported()) return;
    try { const reg = await navigator.serviceWorker.ready; pushSub = await reg.pushManager.getSubscription(); } catch (e) { pushSub = null; }
    if (A.render) A.render();
  }

  A.nudgeOn = () => !!pushSub;
  A.pushOn = async (time) => {
    if (needsInstall()) { A.toast('Add Tackle to your Home Screen first, then turn this on from there.'); return; }
    if (!pushSupported()) { A.toast('This browser can’t receive notifications.'); return; }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { A.toast('Notifications are blocked. Allow them in Settings to get the nudge.'); return; }
    try {
      const reg = await navigator.serviceWorker.ready;
      pushSub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(cfg.vapidPublicKey) });
      const json = pushSub.toJSON();
      const { error } = await sb.from('push_subscriptions').upsert({ endpoint: json.endpoint, user_id: user.id, sub: json, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, nudge_time: time || '08:30' });
      if (error) throw error;
      A.toast('Daily nudge is on. Weekdays at ' + label(time || '08:30') + '.');
    } catch (e) { A.toast('Couldn’t turn on the nudge: ' + e.message); }
  };

  A.pushOff = async () => {
    try {
      if (pushSub) {
        const ep = pushSub.endpoint;
        await pushSub.unsubscribe();
        await sb.from('push_subscriptions').delete().eq('endpoint', ep);
      }
      pushSub = null;
      A.toast('Daily nudge is off on this device.');
    } catch (e) { A.toast('Couldn’t turn it off: ' + e.message); }
  };

  const label = (hm) => { const [h, m] = hm.split(':').map(Number); return (h % 12 || 12) + ':' + String(m).padStart(2, '0') + (h < 12 ? 'am' : 'pm'); };
  const TIMES = Array.from({ length: 96 }, (_, i) => String(Math.floor(i / 4)).padStart(2, '0') + ':' + String((i % 4) * 15).padStart(2, '0'));

  A.setNudgeTime = async (time) => {
    if (!user) return;
    await sb.from('push_subscriptions').update({ nudge_time: time }).eq('user_id', user.id);
    if (pushSub) A.toast('Nudge moved to ' + label(time) + ' on weekdays.');
  };

  A.accountSheet = (head) => head('Account') + A.accountBody();
  A.accountDetails = () => {
    const u = A.user();
    return `<div class="acct-row"><p><strong>${esc(u.name || 'Signed in')}</strong><small>${esc(u.email || '')} · Google</small></p></div>`;
  };
  A.nudgeRows = () => {
    const time = (A.getState().nudgeTime) || '08:30';
    const blocked = needsInstall() || !pushSupported();
    const hint = needsInstall() ? 'Add Tackle to your Home Screen (Share → Add to Home Screen), then turn it on from there.'
      : !pushSupported() ? 'Not available in this browser.' : '“What do you want to tackle today?” on your themed days.';
    const on = !!pushSub;
    return `<div class="acct-row"><p><strong id="nudge-l">Daily nudge</strong><small>${esc(hint)}</small></p>
        <button type="button" class="switch" role="switch" aria-checked="${on}" aria-labelledby="nudge-l" data-act="nudge-toggle"${blocked ? ' disabled' : ''}></button></div>
      ${on ? `<div class="acct-row sub"><p><strong>Time</strong><small>Your time zone. Free days get nothing.</small></p>
        <label class="time-pick"><span class="sr-only">Nudge time</span><select id="nudge-time">${TIMES.map((t) => `<option value="${t}"${t === time ? ' selected' : ''}>${label(t)}</option>`).join('')}</select></label></div>` : ''}`;
  };
  A.accountBody = () => A.accountDetails() + A.nudgeRows();

  /* ---------- Account: name and deletion ---------- */
  A.updateName = async (name) => {
    const { data, error } = await sb.auth.updateUser({ data: { full_name: name } });
    if (error) throw error;
    if (data && data.user) user = data.user;
  };
  A.deleteAccount = async () => {
    try { if (pushSub) { await pushSub.unsubscribe(); pushSub = null; } } catch (e) { /* ignore */ }
    const { error } = await sb.rpc('delete_my_account'); // deletes the sign-in; plan and push rows cascade
    if (error) throw error;
    try { localStorage.removeItem(STATE_KEY); localStorage.removeItem(PENDING); } catch (e) { /* ignore */ }
    await sb.auth.signOut().catch(() => {});
    location.replace(location.pathname);
  };
})();
