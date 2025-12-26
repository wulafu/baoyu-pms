import { run, get, all } from '../utils/dbHelper';
import { User } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  async login(code: string): Promise<{ user: User; token: string }> {
    // MOCK: In real world, exchange code for openid via WeChat API
    const mockOpenId = `openid_${code}_${Date.now()}`;
    
    // Check if user exists
    let user = await get<User>('SELECT * FROM users WHERE openid = ?', [mockOpenId]);
    
    if (!user) {
      // Create new user
      const result = await run(
        'INSERT INTO users (openid, nickname, role) VALUES (?, ?, ?)',
        [mockOpenId, 'New User', 'host']
      );
      user = await get<User>('SELECT * FROM users WHERE id = ?', [result.id]);
    }

    if (!user) throw new Error('Failed to login');

    // MOCK: Generate JWT
    const token = `mock_jwt_token_${user.id}`;
    
    return { user, token };
  }

  async register(nickname: string, phone: string): Promise<{ user: User; token: string }> {
     const openid = uuidv4();
     const result = await run(
        'INSERT INTO users (openid, nickname, phone, role) VALUES (?, ?, ?, ?)',
        [openid, nickname, phone, 'host']
     );
     const user = await get<User>('SELECT * FROM users WHERE id = ?', [result.id]);
     if (!user) throw new Error('Failed to register');

     // MOCK: Generate JWT
     const token = `mock_jwt_token_${user.id}`;

     return { user, token };
  }
}
