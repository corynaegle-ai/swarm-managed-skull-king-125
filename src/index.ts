import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`Starting application in ${NODE_ENV} mode`);
console.log(`Server would listen on port ${PORT}`);

export default {
  PORT,
  NODE_ENV,
};
