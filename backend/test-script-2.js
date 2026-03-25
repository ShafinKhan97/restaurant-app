async function test() {
  try {
    const loginResp = await fetch('http://localhost:5000/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test12345@test.com', password: 'password123' }) });
    const login = await loginResp.json();

    const getRestsResp = await fetch('http://localhost:5000/api/restaurants', { method: 'GET', headers: { Authorization: 'Bearer ' + login.token } });
    const getRests = await getRestsResp.json();
    const restaurantId = getRests.restaurants[0]._id;

    const addItemResp = await fetch('http://localhost:5000/api/restaurants/' + restaurantId + '/menu-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + login.token },
      body: JSON.stringify({
        name: 'Spicy Burger',
        description: 'A very spicy burger',
        price: 12.99,
        category_name: 'Burgers',
        discount_type: 'none',
        discount_value: 0,
        image_url: 'https://example.com/burger.jpg',
        availability: 'available'
      })
    });
    console.log('Add Item:', await addItemResp.json());
  } catch (e) {
    console.error(e);
  }
}
test();
