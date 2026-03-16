async function test() {
  try {
    const signupResp = await fetch('http://localhost:5000/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Test', email: 'test12345@test.com', password: 'password123', role: 'restaurant_admin' }) });
    const signup = await signupResp.json();
    console.log('Signup:', signup);

    const restResp = await fetch('http://localhost:5000/api/restaurants', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + signup.token }, body: JSON.stringify({ name: 'My Pizza Place' }) });
    const rest = await restResp.json();
    console.log('Create Res:', rest);

    const loginResp = await fetch('http://localhost:5000/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test12345@test.com', password: 'password123' }) });
    const login = await loginResp.json();
    console.log('Login:', login);

    const getRestsResp = await fetch('http://localhost:5000/api/restaurants', { method: 'GET', headers: { Authorization: 'Bearer ' + login.token } });
    const getRests = await getRestsResp.json();
    console.log('Get Rests:', getRests);
  } catch (e) {
    console.error(e);
  }
}
test();
