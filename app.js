const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig');
const connectDB = require('./db');
const User = require('./models/user.model');
const Dog = require('./models/dog.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to protect authenticated routes
const auth = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.redirect('/login');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie('token');
        res.redirect('/login');
    }
};

// API Documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Login route
app.get('/login', (req, res) => {
    const message = req.query.message;
    res.render('login', { message });
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('login', { error: 'Invalid username or password.' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.redirect('/dogs');
    } catch (error) {
        console.error('Login failed:', error);
        res.render('login', { error: 'Login failed. Please try again.' });
    }
});

// Registration route
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('register', { error: 'Username already exists. Please choose a different one.' });
        }

        const newUser = new User({ username, password });
        await newUser.save();

        res.redirect('/login?message=User registered successfully! You can now log in.');
    } catch (error) {
        console.error('Registration failed:', error);
        res.render('register', { error: 'Registration failed. Please try again.' });
    }
});

// Logout route
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

// --- Dog Routes (Protected) ---
app.get('/dogs', auth, async (req, res) => {
    try {
        const filter = req.query.filter || 'all'; // Default to 'all'
        let dogs;
        let title = 'All Dogs';

        // Add a case for each filter
        if (filter === 'registered') {
            dogs = await Dog.find({ owner: req.user.userId }).populate('owner', 'username');
            title = 'My Registered Dogs';
        } else if (filter === 'adopted') {
            dogs = await Dog.find({ isAdopted: true }).populate('owner', 'username');
            title = 'Adopted Dogs';
        } else { // 'all' filter
            dogs = await Dog.find().populate('owner', 'username');
        }

        // Pass flash messages to the view if they exist
        const message = req.query.message;
        const error = req.query.error;

        res.render('dogs', {
            dogs,
            user: req.user,
            message,
            error,
            currentFilter: filter,
            title
        });
    } catch (error) {
        console.error('Failed to retrieve dogs:', error);
        res.status(500).send('Server Error');
    }
});

app.get('/register-dog', auth, (req, res) => {
    res.render('register-dog');
});

app.post('/register-dog', auth, async (req, res) => {
    try {
        const { name, description, imageUrl } = req.body;
        const ownerId = req.user.userId;

        const newDog = new Dog({
            name,
            description,
            imageUrl,
            owner: ownerId,
        });

        await newDog.save();
        res.redirect('/dogs?message=Dog registered successfully!');
    } catch (error) {
        console.error('Dog registration failed:', error);
        res.render('register-dog', { error: 'Dog registration failed. Please try again.' });
    }
});

app.post('/adopt-dog/:id', auth, async (req, res) => {
    try {
        const dogId = req.params.id;
        const userId = req.user.userId;

        const dog = await Dog.findById(dogId);

        if (!dog) {
            return res.redirect('/dogs?error=Dog not found.');
        }

        // This is a sanity check to prevent any accidental re-adoption
        if (dog.isAdopted) {
            return res.redirect('/dogs?error=Dog has already been adopted.');
        }

        // Check if the user is the owner
        if (dog.owner.toString() === userId) {
            return res.redirect('/dogs?error=You cannot adopt a dog you registered.');
        }

        dog.isAdopted = true;
        await dog.save();

        res.redirect('/dogs?message=Dog adopted successfully!');
    } catch (error) {
        console.error('Adoption failed:', error);
        res.redirect('/dogs?error=Adoption failed. Please try again.');
    }
});

app.post('/remove-dog/:id', auth, async (req, res) => {
    try {
        const dogId = req.params.id;
        const userId = req.user.userId;

        const dog = await Dog.findById(dogId);

        if (!dog) {
            return res.redirect('/dogs?error=Dog not found.');
        }

        // Check if the user is the owner
        if (dog.owner.toString() !== userId) {
            return res.redirect('/dogs?error=You do not have permission to remove this dog.');
        }

        // If the dog is already adopted, prevent removal
        if (dog.isAdopted) {
            return res.redirect('/dogs?error=Cannot remove an adopted dog.');
        }

        await Dog.findByIdAndDelete(dogId);

        res.redirect('/dogs?message=Dog removed successfully!');
    } catch (error) {
        console.error('Dog removal failed:', error);
        res.redirect('/dogs?error=Dog removal failed. Please try again.');
    }
});

// Catch-all route for the root
app.get('*', (req, res) => {
    res.redirect('/login');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
