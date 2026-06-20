import app from './app';
import { config } from './config';

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Finance Copilot Backend online on port ${PORT}`);
  console.log(`📄 Swagger documentation available at http://localhost:${PORT}/docs`);
  console.log(`==================================================`);
});

// Graceful shutdowns
const shutdown = () => {
  console.log('Shutting down server gracefully...');
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      const { prisma } = require('./config/prisma');
      await prisma.$disconnect();
      console.log('Database connections disconnected.');
      process.exit(0);
    } catch (e) {
      console.error('Error during database disconnect:', e);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
