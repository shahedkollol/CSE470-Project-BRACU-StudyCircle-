const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/thesis', require('./routes/thesisRoutes'));
app.use('/api/tutoring', require('./routes/tutoringRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));
app.use('/api/studygroup', require('./routes/studygroup.routes'));
app.use('/api/users', require('./routes/users.routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
