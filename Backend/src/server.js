// backend/src/server.js
import app from './app.js';
import { sequelize } from './config/database.js';

// Sincronizar con .env en la raíz de /backend/
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

// Arrancar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});