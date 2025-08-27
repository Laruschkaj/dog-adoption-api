const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/user.model');
const Dog = require('../models/dog.model');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

const sampleDogs = [
    {
        name: "Buddy",
        description: "A friendly Golden Retriever who loves playing fetch and long walks. Perfect family companion.",
        imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop"
    },
    {
        name: "Luna",
        description: "Beautiful Husky with striking blue eyes. Energetic and loves outdoor adventures.",
        imageUrl: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop"
    },
    {
        name: "Charlie",
        description: "Gentle Labrador mix who's great with kids. Well-trained and house-broken.",
        imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop"
    },
    {
        name: "Bella",
        description: "Sweet Border Collie who's incredibly smart and loves learning new tricks.",
        imageUrl: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop"
    },
    {
        name: "Max",
        description: "Playful German Shepherd puppy looking for an active family. Very loyal and protective.",
        imageUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop"
    },
    {
        name: "Daisy",
        description: "Calm and loving Beagle who enjoys quiet evenings and gentle walks in the park.",
        imageUrl: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop"
    },
    {
        name: "Rocky",
        description: "Strong and brave Rottweiler mix. Great guard dog but also very affectionate with family.",
        imageUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300&fit=crop"
    },
    {
        name: "Molly",
        description: "Adorable Cocker Spaniel who loves attention and belly rubs. Very social and friendly.",
        imageUrl: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&h=300&fit=crop"
    }
];

const sampleUsers = [
    {
        username: "sarah_loves_dogs",
        password: "password123"
    },
    {
        username: "mike_adoption_center",
        password: "password123"
    },
    {
        username: "emma_rescue_volunteer",
        password: "password123"
    }
];

async function seedDatabase() {
    try {
        console.log('🔄 Starting database seed...');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await User.deleteMany({});
        await Dog.deleteMany({});

        // Create users
        console.log('👥 Creating sample users...');
        const users = [];
        for (const userData of sampleUsers) {
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            const user = new User({
                username: userData.username,
                password: hashedPassword
            });
            await user.save();
            users.push(user);
        }

        // Create dogs
        console.log('🐕 Creating sample dogs...');
        const dogsPerUser = Math.ceil(sampleDogs.length / users.length);

        for (let i = 0; i < sampleDogs.length; i++) {
            const userIndex = Math.floor(i / dogsPerUser);
            const owner = users[userIndex] || users[users.length - 1];

            const dog = new Dog({
                name: sampleDogs[i].name,
                description: sampleDogs[i].description,
                imageUrl: sampleDogs[i].imageUrl,
                owner: owner._id
            });

            await dog.save();
        }

        // Adopt a few dogs to show the adoption feature
        console.log('❤️ Creating some adoptions...');
        const allDogs = await Dog.find();
        if (allDogs.length >= 2 && users.length >= 2) {
            // User 2 adopts a dog from User 1
            await allDogs[0].adoptDog(users[1]._id, "Thank you so much for taking care of this wonderful dog!");

            // User 3 adopts a dog from User 1
            if (users[2] && allDogs[1]) {
                await allDogs[1].adoptDog(users[2]._id, "I promise to give them the best home possible!");
            }
        }

        console.log('✅ Database seeded successfully!');
        console.log(`📊 Created ${users.length} users and ${sampleDogs.length} dogs`);
        console.log('\n🔐 Sample login credentials:');
        sampleUsers.forEach(user => {
            console.log(`   Username: ${user.username}, Password: ${user.password}`);
        });

    } catch (error) {
        console.error('❌ Seed failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Connect to database and run seed
connectDB().then(seedDatabase);