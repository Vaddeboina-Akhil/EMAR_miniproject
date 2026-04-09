const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const systemCheck = require('./src/middleware/systemCheck');

dotenv.config();
connectDB();

const app = express();

// Configure CORS for both local development and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'https://emar-7ztj.vercel.app',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({ 
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 🔐 Apply system check middleware globally (blocks writes if system is frozen)
app.use(systemCheck);

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/records', require('./src/routes/recordRoutes'));
app.use('/api/patient', require('./src/routes/patientRoutes'));
app.use('/api/doctors', require('./src/routes/doctorRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/consent', require('./src/routes/consentRoutes'));

// ✅ Access logs endpoint (for audit trail)
const { getAccessLogs } = require('./src/controllers/consentController');
app.get('/api/access-logs/:patientId', getAccessLogs);

app.get('/', (req, res) => res.send('EMAR Backend Running'));
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));