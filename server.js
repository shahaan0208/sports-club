const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


mongoose.connect('mongodb://127.0.0.1:27017/sportsClubDB')
  .then(() => console.log('Connected to MongoDB (sportsClubDB)'))
  .catch((err) => console.error(' MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  sport: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/register', async (req, res) => {
  try {
    const { fullName, username, sport, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken! Choose another.' });
    }
    const newUser = new User({ fullName, username, sport, password });
    await newUser.save();
    res.status(201).json({ message: 'Registration successful! Redirecting to login...' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password!' });
    }
    res.status(200).json({
      message: 'Login successful!',
      user: {
        fullName: user.fullName,
        username: user.username,
        sport: user.sport
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
});

app.listen(PORT, () => {
  console.log(' Server running at http://localhost:' + PORT);
});