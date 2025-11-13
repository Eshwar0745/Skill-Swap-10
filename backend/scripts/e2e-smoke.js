/*
 End-to-end smoke test for core flows using seeded users.
 Steps:
 1) Login as Alice
 2) Find matches for a wanted skill (UI/UX Design)
 3) Create an exchange request to a provider (expected: Bob)
 4) Attempt to message before acceptance (expect 403)
 5) Login as Bob and accept the exchange
 6) Alice sends a message (expect 201)
 7) Verify Bob's unread messages and notifications, then mark them read
 8) Complete the exchange
 9) Alice leaves a review for Bob
 10) Verify badges on both users include 'First Swap'
*/

const base = process.env.API_BASE || 'http://localhost:4000';

async function req(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) {
    const err = new Error(data?.message || `HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function assert(cond, msg) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

(async () => {
  console.log('E2E smoke starting against', base);
  // 1) Login David (requester)
  const davidCreds = { email: 'david@skillswap.com', password: 'Password123' };
  const dLogin = await req('/api/auth/login', { method: 'POST', body: davidCreds });
  const dToken = dLogin.token;
  const david = dLogin.user;
  assert(dToken && david?.id, 'David login failed');
  console.log('✓ David logged in');

  // 2) Find matches for "Yoga Teaching" (Emma should appear)
  const find = await req('/api/matches/find?skillTitle=Yoga%20Teaching', { token: dToken });
  assert(Array.isArray(find.matches) && find.matches.length > 0, 'No matches found for Yoga Teaching');
    // Prefer a provider with no active exchange so we can test the propose -> accept flow
    let target = find.matches.find(m => !m.hasActiveExchange) || find.matches[0];
  const providerId = target.provider?._id || target.provider?.id;
  assert(providerId, 'No provider id from matches');
  console.log('✓ Matches found; targeting provider', target.provider?.name || providerId);

  // 3) Create or reuse proposed exchange (David -> Emma)
  const existingList = await req('/api/exchanges?role=requester&status=proposed', { token: dToken });
  let ex = existingList.items?.find(it => String(it.provider?._id || it.provider) === String(providerId));
  if (!ex) {
    ex = await req('/api/exchanges', { method: 'POST', token: dToken, body: { providerId, notes: 'Let\'s swap skills!' } });
  }
  assert(ex?._id, 'Exchange not created');
  console.log('✓ Exchange proposed', ex._id);

  // 4) Try message before accepted (expect 403)
  let preMsg403 = false;
  try {
    await req('/api/messages', { method: 'POST', token: dToken, body: { recipientId: providerId, content: 'Hello before acceptance' } });
  } catch (e) {
    preMsg403 = e.status === 403;
  }
    // If there is already an accepted exchange between these users (seed data), messaging may be allowed
    if (target.hasActiveExchange) {
      console.log('ℹ Provider already has active exchange with you (seeded). Messaging allowed. Skipping pre-accept assertion.');
    } else {
      assert(preMsg403, 'Messaging before acceptance should be forbidden');
      console.log('✓ Messaging restricted before acceptance');
    }

  // 5) Login Emma and accept the exchange
  const emmaCreds = { email: 'emma@skillswap.com', password: 'Password123' };
  const eLogin = await req('/api/auth/login', { method: 'POST', body: emmaCreds });
  const eToken = eLogin.token;
  const emma = eLogin.user;
  assert(eToken && emma?.id, 'Emma login failed');
  const listEmma = await req('/api/exchanges?role=provider&status=proposed', { token: eToken });
  const toAccept = listEmma.items?.find(it => String(it._id) === String(ex._id)) || listEmma.items?.[0];
  assert(toAccept?._id, 'No proposed exchange found for Emma');
  const accepted = await req(`/api/exchanges/${toAccept._id}`, { method: 'PUT', token: eToken, body: { status: 'accepted' } });
  assert(accepted.status === 'accepted', 'Exchange not accepted');
  console.log('✓ Exchange accepted');

  // 6) David sends a message
  const msg = await req('/api/messages', { method: 'POST', token: dToken, body: { recipientId: emma.id, content: 'Hello Emma! Looking forward to the swap.', exchangeId: accepted._id } });
  assert(msg?._id, 'Message not sent');
  console.log('✓ Message sent');

  // 7) Verify Emma unread and notifications
  const unreadBefore = await req('/api/messages/unread-count', { token: eToken });
  assert((unreadBefore.count || 0) > 0, 'Emma unread count should be > 0');
  const notifs = await req('/api/notifications?unreadOnly=true&limit=50', { token: eToken });
  assert((notifs.items || []).length > 0, 'Emma should have unread notifications');
  // Mark first notification read
  const firstNotif = notifs.items[0];
  await req(`/api/notifications/${firstNotif._id}/read`, { method: 'POST', token: eToken });
  const afterOne = await req('/api/notifications?unreadOnly=true&limit=50', { token: eToken });
  assert(afterOne.items.length <= notifs.items.length - 1, 'Unread notifications did not decrease after mark read');
  // Mark all read
  await req('/api/notifications/mark-all-read', { method: 'POST', token: eToken });
  const unreadCountAfter = await req('/api/notifications/unread-count', { token: eToken });
  assert(unreadCountAfter.count === 0, 'Unread notifications should be 0 after mark-all-read');
  // Mark thread read for messages
  await req(`/api/messages/thread/${david.id}/read`, { method: 'POST', token: eToken });
  const unreadAfter = await req('/api/messages/unread-count', { token: eToken });
  assert(unreadAfter.count === 0, 'Unread messages should be 0 after marking thread read');
  console.log('✓ Notifications and unread counts verified');

  // 8) Complete exchange (by David)
  const completed = await req(`/api/exchanges/${accepted._id}`, { method: 'PUT', token: dToken, body: { status: 'completed' } });
  assert(completed.status === 'completed', 'Exchange not completed');
  console.log('✓ Exchange completed');

  // 9) Leave a review for Emma
  const review = await req('/api/reviews', { method: 'POST', token: dToken, body: { revieweeId: emma.id, rating: 5, comment: 'Great exchange!' } });
  assert(review?._id, 'Review not created');
  console.log('✓ Review created');

  // 10) Verify badges
  const emmaProfile = await req(`/api/users/${emma.id}`, { token: dToken });
  const davidProfile = await req(`/api/users/${david.id}`, { token: eToken });
  assert(Array.isArray(emmaProfile.badges), 'Emma badges missing');
  assert(Array.isArray(davidProfile.badges), 'David badges missing');
  assert(emmaProfile.badges.includes('First Swap'), 'Emma missing First Swap badge');
  assert(davidProfile.badges.includes('First Swap'), 'David missing First Swap badge');
  console.log('✓ Badges verified');

  console.log('\nAll E2E smoke checks passed.');
})().catch((err) => {
  console.error('E2E smoke failed:', err?.message || err);
  if (err?.data) console.error('Details:', err.data);
  process.exit(1);
});
