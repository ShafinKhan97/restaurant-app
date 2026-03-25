const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createSuperAdmin() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected!');
  
  const db = mongoose.connection.db;
  
  // Check if super admin already exists
  const existing = await db.collection('admins').findOne({ role: 'super_admin' });
  if (existing) {
    console.log('Super admin already exists:', existing.email);
    await mongoose.disconnect();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('SuperAdmin@123', salt);
  
  const result = await db.collection('admins').insertOne({
    name: 'Super Admin',
    email: 'superadmin@restaurant.com',
    password: hashedPassword,
    role: 'super_admin',
    max_restaurants: 999,
    reset_pin: null,
    reset_pin_expires_at: null,
    created_at: new Date(),
    updated_at: new Date()
  });
  
  console.log('✅ Super admin created successfully!');
  console.log('   Email:    superadmin@restaurant.com');
  console.log('   Password: SuperAdmin@123');
  console.log('   ID:', result.insertedId);
  await mongoose.disconnect();
}

createSuperAdmin().catch(console.error);
