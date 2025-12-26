import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }
      const result = await authService.login(code);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async register(req: Request, res: Response) {
    try {
        const { nickname, phone } = req.body;
        const result = await authService.register(nickname, phone);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  }
}
