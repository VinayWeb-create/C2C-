import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import { connectDB } from './config/db.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();
        
        const email = 'avalavinay8@gmail.com';
        const password = 'Vinay..rok@1432';

        // Find if user already exists
        let user = await User.findOne({ email });
        
        if (user) {
            // Updating existing user
            user.password = password; // Hashing will be handled by pre-save hook
            user.role = 'admin';
            user.isActive = true;
            await user.save();
            console.log('✅ User updated to Admin successfully!');
        } else {
            // Creating new user
            user = new User({
                name: 'Main Admin',
                email: email,
                password: password, // Hashing handled by pre-save
                role: 'admin',
                phone: '+91 0000000000',
                location: {
                    type: 'Point',
                    coordinates: [78.4867, 17.3850],
                    address: 'Main Command Center',
                    city: 'Hyderabad',
                    state: 'Telangana'
                }
            });
            await user.save();
            console.log('✅ Admin user created successfully!');
        }

        console.log('Email:', email);
        console.log('Password (plain):', password);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating/updating admin:', err);
        process.exit(1);
    }
};

createAdmin();
