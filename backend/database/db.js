const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const url = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.i3iyk4h.mongodb.net/Fiti?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);

const db = () => {
  return mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
};

module.exports = db;
