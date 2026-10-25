async function test() {
  const base = 'http://127.0.0.1:5173';
  
  // Test 1: Admin login without password (MUST FAIL 403)
  let res = await fetch(base + '/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'vihan.agrawal4@gmail.com' })
  });
  const data1 = await res.json();
  console.log('Test 1 (No password): status =', res.status, '-', data1.error);
  if (res.status !== 403) throw new Error('Security check 1 failed');

  // Test 2: Admin login with wrong password (MUST FAIL 403)
  res = await fetch(base + '/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'vihan.agrawal4@gmail.com', password: 'wrongpassword' })
  });
  const data2 = await res.json();
  console.log('Test 2 (Wrong password): status =', res.status, '-', data2.error);
  if (res.status !== 403) throw new Error('Security check 2 failed');

  // Test 3: Student login (MUST SUCCEED role: student)
  res = await fetch(base + '/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student.test@gmail.com' })
  });
  const studData = await res.json();
  console.log('Test 3 (Student login): status =', res.status, 'role =', studData.user.role);
  if (res.status !== 200 || studData.user.role !== 'student') throw new Error('Security check 3 failed');

  // Test 4: Admin login with correct password (MUST SUCCEED role: admin)
  res = await fetch(base + '/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'vihan.agrawal4@gmail.com', password: '@Cr7meow30' })
  });
  const adminData = await res.json();
  console.log('Test 4 (Admin login with password): status =', res.status, 'role =', adminData.user.role);
  if (res.status !== 200 || adminData.user.role !== 'admin') throw new Error('Security check 4 failed');

  console.log('✅ ALL SECURITY AUDIT CHECKS PASSED PERFECTLY!');
}
test().catch(err => {
  console.error('FAILED:', err);
  process.exit(1);
});
