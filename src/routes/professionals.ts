import express, { Request, Response } from 'express';
import path from 'path';
import { getBasePath } from '../../shared/utils/paths';

const router = express.Router();

// Dashboard route
router.get('/dashboard', (req: Request, res: Response) => {
  res.sendFile(path.join(getBasePath(), 'public', 'professionals', 'dashboard.html'));
});

export default router;
