// backend/seed.js — Run with: node seed.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User    from './models/User.js';
import Service from './models/Service.js';
import Booking from './models/Booking.js';
import Review  from './models/Review.js';

dotenv.config();

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Service.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log('🧹 Cleared existing data');

  // ── Users ──────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('123456', 12);

  const [user1, user2, prov1, prov2, prov3, prov4] = await User.insertMany([
    {
      name: 'Arjun Sharma',
      email: 'demo@user.com',
      password: hashedPassword,
      role: 'user',
      phone: '+91 9876543210',
      location: { type: 'Point', coordinates: [78.4867, 17.3850], address: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana' },
    },
    {
      name: 'Priya Nair',
      email: 'priya@user.com',
      password: hashedPassword,
      role: 'user',
      phone: '+91 9876543211',
      location: { type: 'Point', coordinates: [80.2707, 13.0827], address: 'T. Nagar', city: 'Chennai', state: 'Tamil Nadu' },
    },
    {
      name: 'Ravi Kumar',
      email: 'demo@provider.com',
      password: hashedPassword,
      role: 'provider',
      phone: '+91 9876500001',
      location: { type: 'Point', coordinates: [78.4867, 17.3850], address: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana' },
    },
    {
      name: 'Suresh Electricals',
      email: 'suresh@provider.com',
      password: hashedPassword,
      role: 'provider',
      phone: '+91 9876500002',
      location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Indiranagar', city: 'Bangalore', state: 'Karnataka' },
    },
    {
      name: 'Anita Tutors',
      email: 'anita@provider.com',
      password: hashedPassword,
      role: 'provider',
      phone: '+91 9876500003',
      location: { type: 'Point', coordinates: [72.8777, 19.0760], address: 'Andheri West', city: 'Mumbai', state: 'Maharashtra' },
    },
    {
      name: 'Dr. Mehta Clinic',
      email: 'mehta@provider.com',
      password: hashedPassword,
      role: 'provider',
      phone: '+91 9876500004',
      location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Connaught Place', city: 'Delhi', state: 'Delhi' },
    },
  ]);
  console.log('👥 Created 6 users (2 users, 4 providers)');

  // ── Services ───────────────────────────────────────────────────────
  const services = await Service.insertMany([
    {
      provider: prov1._id,
      title: 'Expert Plumbing & Pipe Repair',
      description: 'Professional plumbing services including pipe repair, leak fixing, bathroom fittings, and water tank installation. 10+ years experience. Available on weekends.',
      category: 'Plumber',
      price: { amount: 450, unit: 'per_hour', currency: 'INR' },
      location: { type: 'Point', coordinates: [78.4867, 17.3850], address: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033' },
      rating: { average: 4.7, count: 52 },
      tags: ['plumbing', 'leak repair', 'pipe fitting', 'bathroom'],
      availability: { days: ['Mon','Tue','Wed','Thu','Fri','Sat'], startTime: '08:00', endTime: '20:00' },
      totalBookings: 52,
    },
    {
      provider: prov1._id,
      title: 'Home Carpenter — Furniture & Repair',
      description: 'Custom furniture making, wooden door/window repair, modular kitchen fitting. Quality guaranteed with 3-month warranty on all work.',
      category: 'Carpenter',
      price: { amount: 600, unit: 'per_day', currency: 'INR' },
      location: { type: 'Point', coordinates: [78.4867, 17.3850], address: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033' },
      rating: { average: 4.5, count: 28 },
      tags: ['carpenter', 'furniture', 'woodwork', 'modular kitchen'],
      availability: { days: ['Mon','Tue','Wed','Thu','Fri'], startTime: '09:00', endTime: '18:00' },
      totalBookings: 28,
    },
    {
      provider: prov2._id,
      title: 'Certified Electrician — All Wiring Work',
      description: 'Licensed electrician for house wiring, switchboard repair, fan/AC installation, short circuit repair. Safety-first approach. Available 24/7 for emergencies.',
      category: 'Electrician',
      price: { amount: 350, unit: 'per_hour', currency: 'INR' },
      location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Indiranagar', city: 'Bangalore', state: 'Karnataka', pincode: '560038' },
      rating: { average: 4.8, count: 95 },
      tags: ['electrician', 'wiring', 'AC installation', 'switchboard'],
      availability: { days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], startTime: '07:00', endTime: '21:00' },
      totalBookings: 95,
      isFeatured: true,
    },
    {
      provider: prov2._id,
      title: 'Interior House Painting Service',
      description: 'Professional house painting with premium paints. Interior, exterior, texture painting. Free colour consultation. 5-year warranty on work.',
      category: 'Painter',
      price: { amount: 15000, unit: 'fixed', currency: 'INR' },
      location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Indiranagar', city: 'Bangalore', state: 'Karnataka', pincode: '560038' },
      rating: { average: 4.6, count: 34 },
      tags: ['painting', 'interior design', 'texture', 'wall painting'],
      availability: { days: ['Mon','Tue','Wed','Thu','Fri','Sat'], startTime: '09:00', endTime: '17:00' },
      totalBookings: 34,
    },
    {
      provider: prov3._id,
      title: 'Maths & Science Tutor (Grades 8–12)',
      description: 'IIT graduate with 8 years of tutoring experience. Specialised in Maths, Physics, Chemistry for CBSE and ICSE boards. Also coaching for JEE/NEET.',
      category: 'Tutor',
      price: { amount: 800, unit: 'per_hour', currency: 'INR' },
      location: { type: 'Point', coordinates: [72.8777, 19.0760], address: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400058' },
      rating: { average: 4.9, count: 120 },
      tags: ['maths', 'physics', 'chemistry', 'JEE', 'NEET', 'CBSE'],
      availability: { days: ['Mon','Tue','Wed','Thu','Fri','Sat'], startTime: '14:00', endTime: '20:00' },
      totalBookings: 120,
      isFeatured: true,
    },
    {
      provider: prov3._id,
      title: 'English & Communication Skills Coach',
      description: 'Improve your spoken English and communication skills. Ideal for students, job seekers, and professionals. Group and individual sessions available.',
      category: 'Tutor',
      price: { amount: 500, unit: 'per_hour', currency: 'INR' },
      location: { type: 'Point', coordinates: [72.8777, 19.0760], address: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400058' },
      rating: { average: 4.7, count: 67 },
      tags: ['english', 'communication', 'spoken english', 'interview prep'],
      availability: { days: ['Mon','Wed','Fri','Sat','Sun'], startTime: '10:00', endTime: '18:00' },
      totalBookings: 67,
    },
    {
      provider: prov4._id,
      title: 'General Physician — Home Consultation',
      description: 'MBBS doctor with 15 years of experience. Home visits for fever, cold, general checkups. Prescription provided. Emergency calls accepted.',
      category: 'Doctor',
      price: { amount: 700, unit: 'fixed', currency: 'INR' },
      location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Connaught Place', city: 'Delhi', state: 'Delhi', pincode: '110001' },
      rating: { average: 4.8, count: 210 },
      tags: ['doctor', 'home visit', 'general physician', 'health checkup'],
      availability: { days: ['Mon','Tue','Wed','Thu','Fri','Sat'], startTime: '09:00', endTime: '19:00' },
      totalBookings: 210,
      isFeatured: true,
    },
    {
      provider: prov4._id,
      title: 'Professional House Cleaning Service',
      description: 'Deep cleaning, regular cleaning, kitchen cleaning, bathroom sanitization. Eco-friendly products used. Trained and verified staff.',
      category: 'Cleaner',
      price: { amount: 1200, unit: 'fixed', currency: 'INR' },
      location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Saket', city: 'Delhi', state: 'Delhi', pincode: '110017' },
      rating: { average: 4.5, count: 88 },
      tags: ['cleaning', 'deep cleaning', 'sanitization', 'housekeeping'],
      availability: { days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], startTime: '08:00', endTime: '18:00' },
      totalBookings: 88,
    },
    {
      provider: prov1._id,
      title: 'AC Service & Repair — All Brands',
      description: 'Split AC, window AC installation, servicing and gas refilling. All major brands serviced. 90-day service warranty.',
      category: 'Mechanic',
      price: { amount: 550, unit: 'fixed', currency: 'INR' },
      location: { type: 'Point', coordinates: [78.4867, 17.3850], address: 'Kondapur', city: 'Hyderabad', state: 'Telangana', pincode: '500084' },
      rating: { average: 4.6, count: 143 },
      tags: ['AC repair', 'AC service', 'gas refilling', 'split AC'],
      availability: { days: ['Mon','Tue','Wed','Thu','Fri','Sat'], startTime: '09:00', endTime: '19:00' },
      totalBookings: 143,
    },
    {
      provider: prov2._id,
      title: 'IT Support & Computer Repair',
      description: 'Laptop and desktop repair, virus removal, software installation, networking setup, data recovery. On-site and remote support available.',
      category: 'IT Support',
      price: { amount: 400, unit: 'per_hour', currency: 'INR' },
      location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034' },
      rating: { average: 4.7, count: 76 },
      tags: ['laptop repair', 'networking', 'data recovery', 'virus removal'],
      availability: { days: ['Mon','Tue','Wed','Thu','Fri','Sat'], startTime: '10:00', endTime: '20:00' },
      totalBookings: 76,
    },
  ]);
  console.log(`🛠️  Created ${services.length} services`);

  // ── Bookings ───────────────────────────────────────────────────────
  const bookingData = await Booking.insertMany([
    {
      user:        user1._id,
      service:     services[0]._id,
      provider:    prov1._id,
      bookingDate: new Date('2024-12-10'),
      timeSlot:    { start: '10:00', end: '11:00' },
      status:      'completed',
      address:     { street: '12 Park Lane', city: 'Hyderabad', state: 'Telangana', pincode: '500033' },
      pricing:     { baseAmount: 450, taxAmount: 81, totalAmount: 531, paymentMethod: 'upi', paymentStatus: 'paid' },
      completedAt: new Date('2024-12-10'),
      reviewSubmitted: true,
    },
    {
      user:        user1._id,
      service:     services[4]._id,
      provider:    prov3._id,
      bookingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      timeSlot:    { start: '16:00', end: '17:00' },
      status:      'confirmed',
      address:     { street: '12 Park Lane', city: 'Hyderabad', state: 'Telangana', pincode: '500033' },
      pricing:     { baseAmount: 800, taxAmount: 144, totalAmount: 944, paymentMethod: 'cash', paymentStatus: 'pending' },
    },
    {
      user:        user2._id,
      service:     services[2]._id,
      provider:    prov2._id,
      bookingDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      timeSlot:    { start: '11:00', end: '12:00' },
      status:      'pending',
      address:     { street: '55 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
      pricing:     { baseAmount: 350, taxAmount: 63, totalAmount: 413, paymentMethod: 'upi', paymentStatus: 'pending' },
    },
    {
      user:        user2._id,
      service:     services[6]._id,
      provider:    prov4._id,
      bookingDate: new Date('2024-12-05'),
      timeSlot:    { start: '09:00', end: '10:00' },
      status:      'completed',
      address:     { street: '33 Saket', city: 'Delhi', state: 'Delhi', pincode: '110017' },
      pricing:     { baseAmount: 700, taxAmount: 126, totalAmount: 826, paymentMethod: 'card', paymentStatus: 'paid' },
      completedAt: new Date('2024-12-05'),
      reviewSubmitted: true,
    },
  ]);
  console.log(`📅 Created ${bookingData.length} bookings`);

  // ── Reviews ────────────────────────────────────────────────────────
  await Review.insertMany([
    {
      user:    user1._id,
      service: services[0]._id,
      booking: bookingData[0]._id,
      rating:  5,
      comment: 'Ravi was excellent! Fixed the leaking pipe quickly and cleanly. Very professional. Will definitely book again.',
    },
    {
      user:    user2._id,
      service: services[6]._id,
      booking: bookingData[3]._id,
      rating:  5,
      comment: 'Dr. Mehta was very thorough and caring. Came on time and gave detailed advice. Highly recommended!',
    },
  ]);
  console.log('⭐ Created 2 reviews');

  console.log('\n✅ Database seeded successfully!');
  console.log('─────────────────────────────────────');
  console.log('Demo Accounts:');
  console.log('  User:     demo@user.com     / 123456');
  console.log('  Provider: demo@provider.com / 123456');
  console.log('─────────────────────────────────────\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
