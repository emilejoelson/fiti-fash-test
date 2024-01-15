const express = require('express');
const http = require('http');
const socketIo = require('socket.io'); // Import Socket.IO
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv').config();
const Stripe = require('stripe');

// Local imports
const db = require('./database/db.js');
const rout = require('./routes/router');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Create a Socket.IO server instance and attach it to the server

// Attach io to the app
app.io = io;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors({
  origin: `${process.env.FRONTEND_URL}`, // Replace with your client's origin
  credentials: true, // Enable cookies and other credentials
  methods: ['GET', 'POST'],
}));

app.use(express.json({ limit: '10mb' }));

db()
  .then((result) => console.log('Connected to MongoDB !!'))
  .catch((err) => console.log(err));

app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: true,
    cookie: {
      sameSite: 'None', // Set to 'None' for cross-site cookies
      secure: true, // Enable secure cookies
    },
  })
);

app.use(express.static("./frontend/build"));

app.get("*",(req,res) => {
  res.sendFile(path.resolve(__dirname,"frontend","build","index.html"));
});
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  req.app.io = io; // Attach io to req.app
  next();
});

// Set template engine
app.set('view engine');

// Base Route
app.use(rout);

// Utilization of environment variables
console.log('Stripe Secret Key: ' + process.env.STRIPE_SECRET_KEY);
console.log('Admin email: ' + process.env.REACT_APP_ADMIN_EMAIL);

io.on('connection', (socket) => {
  console.log('A client connected');

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });

  // Handle custom events from clients
  socket.on('notification', (data) => {
    // Handle incoming notifications here
    console.log('Received notification:', data);

    // You can broadcast the notification to other connected clients if needed
    io.emit('notification', data);
  });
});

// Create a route for creating invoices

const port = 4000;

server.listen(port, () => {
  console.log('Server is running on port ' + port);
});


module.exports = app;