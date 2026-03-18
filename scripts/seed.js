/**
 * Seed Script
 *
 * Populates the database with sample data.
 * Run: npm run seed
 *
 * Uses require() (CommonJS) since this runs directly via node,
 * not through Next.js bundler.
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

// ── Inline schemas (CJS versions of the ES module models) ───
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    role: { type: String, enum: ['admin', 'manager', 'member'], default: 'member' },
    country: { type: String, enum: ['india', 'america'] },
}, { timestamps: true });

const restaurantSchema = new mongoose.Schema({
    name: String, address: String, cuisine: String,
    country: { type: String, enum: ['india', 'america'], index: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const menuItemSchema = new mongoose.Schema({
    name: String, description: { type: String, default: '' },
    price: Number,
    category: { type: String, enum: ['starter', 'main', 'dessert', 'beverage', 'side'], default: 'main' },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    country: { type: String, enum: ['india', 'america'], index: true },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    items: [{ menuItem: mongoose.Schema.Types.ObjectId, name: String, quantity: Number, price: Number }],
    country: String, status: { type: String, default: 'pending' },
    paymentMethod: { type: String, default: 'cash' }, totalAmount: Number,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        await Promise.all([
            User.deleteMany({}), Restaurant.deleteMany({}),
            MenuItem.deleteMany({}), Order.deleteMany({}),
        ]);
        console.log('🗑️  Cleared existing data');

        const hash = await bcrypt.hash('password123', 12);

        const users = await User.create([
            { name: 'Admin India', email: 'admin.india@test.com', password: hash, role: 'admin', country: 'india' },
            { name: 'Manager India', email: 'manager.india@test.com', password: hash, role: 'manager', country: 'india' },
            { name: 'Member India', email: 'member.india@test.com', password: hash, role: 'member', country: 'india' },
            { name: 'Admin America', email: 'admin.america@test.com', password: hash, role: 'admin', country: 'america' },
            { name: 'Manager America', email: 'manager.america@test.com', password: hash, role: 'manager', country: 'america' },
            { name: 'Member America', email: 'member.america@test.com', password: hash, role: 'member', country: 'america' },
        ]);
        console.log(`👤 Created ${users.length} users`);

        const restaurants = await Restaurant.create([
            { name: 'Spice Garden', address: '12 MG Road, Mumbai, India', cuisine: 'Indian', country: 'india' },
            { name: 'Tandoori Nights', address: '45 Connaught Place, Delhi, India', cuisine: 'North Indian', country: 'india' },
            { name: 'Burger Barn', address: '789 Broadway, New York, USA', cuisine: 'American', country: 'america' },
            { name: 'Pizza Palace', address: '321 Sunset Blvd, Los Angeles, USA', cuisine: 'Italian-American', country: 'america' },
        ]);
        console.log(`🍽️  Created ${restaurants.length} restaurants`);

        const menuItems = await MenuItem.create([
            { name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', price: 350, category: 'main', restaurant: restaurants[0]._id, country: 'india' },
            { name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled to perfection', price: 250, category: 'starter', restaurant: restaurants[0]._id, country: 'india' },
            { name: 'Dal Makhani', description: 'Slow-cooked black lentils in butter gravy', price: 200, category: 'main', restaurant: restaurants[1]._id, country: 'india' },
            { name: 'Gulab Jamun', description: 'Deep-fried milk dumplings in sugar syrup', price: 120, category: 'dessert', restaurant: restaurants[1]._id, country: 'india' },
            { name: 'Classic Cheeseburger', description: 'Angus beef patty with cheddar cheese', price: 12.99, category: 'main', restaurant: restaurants[2]._id, country: 'america' },
            { name: 'Loaded Fries', description: 'Crispy fries with cheese sauce and bacon', price: 7.99, category: 'side', restaurant: restaurants[2]._id, country: 'america' },
            { name: 'Pepperoni Pizza', description: 'Classic pepperoni with mozzarella', price: 15.99, category: 'main', restaurant: restaurants[3]._id, country: 'america' },
            { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center', price: 8.99, category: 'dessert', restaurant: restaurants[3]._id, country: 'america' },
        ]);
        console.log(`🍕 Created ${menuItems.length} menu items`);

        console.log('\n✅ Seed completed!\n');
        console.log('📋 Test Credentials (all passwords: password123):');
        console.log('──────────────────────────────────────────────────');
        users.forEach((u) => console.log(`   ${u.role.padEnd(8)} | ${u.country.padEnd(8)} | ${u.email}`));
        console.log('');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
