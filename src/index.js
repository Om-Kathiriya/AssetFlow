import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import departmentRoutes from './routes/department.routes.js';
import categoryRoutes from './routes/category.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import prisma from './config/conn.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/employees', employeeRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'AssetFlow API - Backend running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    await prisma.$connect();
    console.log('Postgres database connected successfully');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
});

export default app;
