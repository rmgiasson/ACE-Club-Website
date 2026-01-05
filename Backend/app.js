const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const usersRouter = require('./routes/users');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.STRING)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

app.get('/', (req, res) => {
  res.send('API is running...');
});
app.use('/users', usersRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});