import assert from 'node:assert/strict';
import fs from 'node:fs';

const baseUrl = 'http://127.0.0.1:5173';
const logs = [];
const log = (...args) => {
  console.log(...args);
  logs.push(args.join(' '));
};

async function runTests() {
  log('--- Testing PaperVault PRO Features: Razorpay & AVK ---');

  // Test 1: AVK Status Endpoint
  const avkStatusRes = await fetch(`${baseUrl}/api/avk`);
  assert.equal(avkStatusRes.status, 200, 'GET /api/avk should return 200');
  const avkStatus = await avkStatusRes.json();
  assert.equal(avkStatus.connected, true, 'AVK should be connected');
  assert.equal(avkStatus.status, 'active', 'AVK status should be active');
  log('✓ GET /api/avk connected & active: ' + avkStatus.engine);

  // Sign in a student session
  const studentEmail = 'student.test@papervault.pro';
  const loginRes = await fetch(`${baseUrl}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: studentEmail, name: 'Aditya Sharma' })
  });
  assert.equal(loginRes.status, 200, 'Student login should succeed');
  const cookies = loginRes.headers.get('set-cookie');
  assert.ok(cookies, 'Auth cookie should be set');
  console.log('✓ Student test session established');

  // Test 2: AVK Answer Sheet Evaluation
  const avkEvalRes = await fetch(`${baseUrl}/api/avk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      paperId: 'sample-1',
      textSubmission: 'Given u = 20 m/s, a = -2 m/s^2, t = 5 s.\nFormula: v = u + at\nv = 20 + (-2)(5) = 10 m/s'
    })
  });
  assert.equal(avkEvalRes.status, 200, 'POST /api/avk should return 200');
  const avkResult = await avkEvalRes.json();
  assert.equal(avkResult.ok, true, 'AVK evaluation ok');
  assert.ok(avkResult.result.total >= 7.0, 'AVK should award diagnostic marks');
  assert.ok(avkResult.result.questions.length >= 2, 'AVK should have question-by-question breakdown');
  console.log('✓ POST /api/avk evaluated successfully: Score =', avkResult.result.total, '/ 10');

  // Test 3: Razorpay Order Creation
  const orderRes = await fetch(`${baseUrl}/api/billing/razorpay/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({})
  });
  assert.equal(orderRes.status, 200, 'POST /api/billing/razorpay/order should return 200');
  const order = await orderRes.json();
  assert.equal(order.amount, 29900, 'Order amount should be 29900 paise (₹299)');
  assert.equal(order.currency, 'INR', 'Currency should be INR');
  assert.ok(order.orderId, 'Order ID must be generated');
  console.log('✓ Razorpay Order Created:', order.orderId, 'Amount: ₹' + (order.amount / 100));

  // Test 4: Activate 30-Day Instant Pass
  const passRes = await fetch(`${baseUrl}/api/billing/instant-pass`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({})
  });
  assert.equal(passRes.status, 200, 'POST /api/billing/instant-pass should return 200');
  const pass = await passRes.json();
  assert.equal(pass.ok, true, 'Pass activation should be ok');
  assert.equal(pass.plan, 'premium', 'User plan should be premium');
  assert.ok(pass.premium_until, 'premium_until timestamp should be set');
  log('✓ 30-Day PRO Pass Activated! Valid until: ' + pass.premium_until);

  // Test 5: Verify Premium Info
  const premiumInfoRes = await fetch(`${baseUrl}/api/premium`, {
    headers: { 'Cookie': cookies }
  });
  assert.equal(premiumInfoRes.status, 200, 'GET /api/premium should return 200');
  const premiumInfo = await premiumInfoRes.json();
  assert.equal(premiumInfo.checkout_enabled, true, 'Checkout should be enabled');
  assert.equal(premiumInfo.avk_connected, true, 'AVK should be connected');
  assert.equal(premiumInfo.active, true, 'Student should now have active PRO status');
  log('✓ GET /api/premium verified with active PRO pass & AVK connectivity');

  log('ALL PRO & AVK INTEGRATION CHECKS PASSED SUCCESSFULLY!');
  fs.writeFileSync(new URL('./pro-test-results.log', import.meta.url), logs.join('\n'));
}

runTests().catch(err => {
  fs.writeFileSync(new URL('./pro-test-results.log', import.meta.url), 'ERROR: ' + err.stack);
  console.error('Test failed:', err);
  process.exit(1);
});
