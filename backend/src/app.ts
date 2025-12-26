import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import orderRoutes from './routes/order.routes';
import reportRoutes from './routes/report.routes';
import financeRoutes from './routes/finance.routes';
import ruleRoutes from './routes/rule.routes';
import channelRoutes from './routes/channel.routes';
import propertyRoutes from './routes/property.routes';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/finances', financeRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/properties', propertyRoutes);

// Serve Frontend Static Files (Production)
const frontendDist = path.join(__dirname, '../../baoyu-pms-web/dist');
app.use(express.static(frontendDist));

// Handle SPA routing - return index.html for any non-API routes
app.get(/.*/, (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(frontendDist, 'index.html'));
    }
});

export default app;
