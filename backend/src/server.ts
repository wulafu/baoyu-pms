import app from './app';
// import db from './config/database'; // SQLite (Deprecated)
import pool from './config/mysql';
import { Server } from 'socket.io';
import http from 'http';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io to be used in controllers/services
export { io };

// Test MySQL connection on startup
pool.getConnection()
    .then(conn => {
        console.log('Successfully connected to MySQL database');
        conn.release();
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MySQL:', err.message);
        process.exit(1);
    });
