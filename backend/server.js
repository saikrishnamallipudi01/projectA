const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config({ path: '../.env' }); // load from root .env
connectDB();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL?.trim(),
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
].filter(Boolean);

// Allow dynamic origins for deployment (EC2) or specific listed origins
app.use(cors({ 
  origin: (origin, callback) => {
    // If no origin (e.g. mobile apps, curl) or if it's in the allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Alternatively, to just allow any origin dynamically for EC2 without disturbing too much:
    return callback(null, true); 
  }, 
  credentials: true 
}));
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/users',       require('./routes/user.routes'));
app.use('/api/categories',  require('./routes/category.routes'));
app.use('/api/services',    require('./routes/service.routes'));
app.use('/api/technicians', require('./routes/technician.routes'));
app.use('/api/bookings',    require('./routes/booking.routes'));
app.use('/api/tokens',      require('./routes/token.routes'));
app.use('/api/invoices',    require('./routes/invoice.routes'));
app.use('/api/admin',       require('./routes/admin.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum limit is 5MB.' });
  }
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`ATNIS Server running on port ${process.env.PORT || 5000}`)
);
