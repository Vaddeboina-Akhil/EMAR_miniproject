const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'], 
  credentials: true 
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/records', require('./src/routes/recordRoutes'));
app.use('/api/patient', require('./src/routes/patientRoutes'));
app.use('/api/doctors', require('./src/routes/doctorRoutes'));

// ✅ Add these from second file
app.use('/api/consent', require('./src/routes/consentRoutes'));

// ❌ Only add blockchain if file exists
// app.use('/api/blockchain', require('./src/routes/blockchainRoutes'));

app.get('/', (req, res) => res.send('EMAR Backend Running'));
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));