import express, { Request, Response } from 'express';
import path from 'path';
import { getBasePath } from '../shared/utils/paths';
import professionalsRouter from './routes/professionals';

const app = express();
const port = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(getBasePath(), 'public')));

// Routes
app.use('/professionals', professionalsRouter);

// Root path handler
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(getBasePath(), 'public', 'professionals', 'dashboard.html'));
});

// Basic health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Base path: ${getBasePath()}`);
});
