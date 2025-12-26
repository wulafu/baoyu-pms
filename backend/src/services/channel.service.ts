import { run, get, all } from '../utils/dbHelper';
import { ChannelMapping } from '../models/channel.model';
import { ChannelFactory } from './channels/ChannelFactory';

export class ChannelService {
  async getMappings(propertyId: number): Promise<ChannelMapping[]> {
    return await all<ChannelMapping>('SELECT * FROM channel_mappings WHERE property_id = ?', [propertyId]);
  }

  async updateMapping(mapping: ChannelMapping): Promise<void> {
    const existing = await get<ChannelMapping>(
        'SELECT * FROM channel_mappings WHERE property_id = ? AND channel_code = ? AND local_room_id = ?',
        [mapping.property_id, mapping.channel_code, mapping.local_room_id]
    );

    if (existing) {
        await run(
            'UPDATE channel_mappings SET channel_room_id = ?, sync_enabled = ? WHERE id = ?',
            [mapping.channel_room_id, mapping.sync_enabled, existing.id]
        );
    } else {
        await run(
            'INSERT INTO channel_mappings (property_id, channel_code, channel_name, local_room_id, channel_room_id, sync_enabled) VALUES (?, ?, ?, ?, ?, ?)',
            [mapping.property_id, mapping.channel_code, mapping.channel_name, mapping.local_room_id, mapping.channel_room_id, mapping.sync_enabled]
        );
    }
  }

  async getSyncLogs(): Promise<any[]> {
    return await all('SELECT * FROM channel_sync_logs ORDER BY created_at DESC LIMIT 50');
  }

  async getAllChannels(propertyId?: number) {
    // 1. Define supported channels
    const supportedChannels = [
      { code: 'airbnb', name: 'Airbnb', icon: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
      { code: 'booking', name: 'Booking.com', icon: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
      { code: 'ctrip', name: '携程', icon: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
      { code: 'meituan', name: '美团', icon: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
    ];

    if (!propertyId) {
      return supportedChannels.map(c => ({ ...c, status: 'disconnected', sync_enabled: false }));
    }

    // 2. Fetch connection status from DB
    const connections = await all<{ channel_code: string, status: string }>(
      'SELECT channel_code, status FROM property_channels WHERE property_id = ?',
      [propertyId]
    );

    const connectionMap = new Map(connections.map(c => [c.channel_code, c.status]));

    // 3. Merge
    return supportedChannels.map(c => ({
      ...c,
      status: connectionMap.get(c.code) || 'disconnected',
      sync_enabled: connectionMap.get(c.code) === 'connected'
    }));
  }

  async connectChannel(propertyId: number, channelCode: string, config: any) {
    // 1. Simulate Auth Check (In real world, call Channel API to verify credentials)
    console.log(`[ChannelService] Verifying credentials for ${channelCode}...`);
    if (!config.username || !config.password) {
      throw new Error('Invalid credentials');
    }

    // 2. Upsert into DB
    const existing = await get<{ id: number }>(
      'SELECT id FROM property_channels WHERE property_id = ? AND channel_code = ?',
      [propertyId, channelCode]
    );

    if (existing) {
      await run(
        'UPDATE property_channels SET status = ?, config = ? WHERE id = ?',
        ['connected', JSON.stringify(config), existing.id]
      );
    } else {
      await run(
        'INSERT INTO property_channels (property_id, channel_code, status, config) VALUES (?, ?, ?, ?)',
        [propertyId, channelCode, 'connected', JSON.stringify(config)]
      );
    }
  }

  async disconnectChannel(propertyId: number, channelCode: string) {
    await run(
      'UPDATE property_channels SET status = ? WHERE property_id = ? AND channel_code = ?',
      ['disconnected', propertyId, channelCode]
    );
  }

  async getAuthUrl(channelCode: string): Promise<string> {
      const adapter = ChannelFactory.getAdapter(channelCode);
      if (!adapter || !adapter.getAuthUrl) {
          throw new Error(`Channel ${channelCode} does not support OAuth`);
      }
      return adapter.getAuthUrl();
  }

  async handleAuthCallback(propertyId: number, channelCode: string, code: string): Promise<void> {
      const adapter = ChannelFactory.getAdapter(channelCode);
      if (!adapter || !adapter.handleCallback) {
          throw new Error(`Channel ${channelCode} does not support OAuth`);
      }
      
      const tokenInfo = await adapter.handleCallback(code);
      
      // Save token info
      const existing = await get<{ id: number }>(
          'SELECT id FROM property_channels WHERE property_id = ? AND channel_code = ?',
          [propertyId, channelCode]
      );

      const config = { ...tokenInfo, connectedAt: new Date().toISOString() };

      if (existing) {
          await run(
              'UPDATE property_channels SET status = ?, config = ? WHERE id = ?',
              ['connected', JSON.stringify(config), existing.id]
          );
      } else {
          await run(
              'INSERT INTO property_channels (property_id, channel_code, status, config) VALUES (?, ?, ?, ?)',
              [propertyId, channelCode, 'connected', JSON.stringify(config)]
          );
      }
  }

  async getChannelRooms(propertyId: number, channelCode: string): Promise<any[]> {
      const adapter = ChannelFactory.getAdapter(channelCode);
      if (!adapter || !adapter.getRoomList) {
          return [];
      }
      
      const channelConfig = await get<{ config: string }>(
          'SELECT config FROM property_channels WHERE property_id = ? AND channel_code = ?',
          [propertyId, channelCode]
      );
      
      if (!channelConfig) {
          throw new Error('Channel not connected');
      }
      
      const config = JSON.parse(channelConfig.config);
      return await adapter.getRoomList(config);
  }

  // Real implementation using Adapter Pattern
  async syncStockToChannel(roomId: number, date: string, status: string, price?: number): Promise<void> {
      // 1. Find mappings for this room
      const mappings = await all<ChannelMapping>('SELECT * FROM channel_mappings WHERE local_room_id = ? AND sync_enabled = 1', [roomId.toString()]);
      
      // 2. Loop and push using specific adapters
      for (const mapping of mappings) {
          const adapter = ChannelFactory.getAdapter(mapping.channel_code);
          if (adapter) {
              await adapter.syncStock(mapping, date, status, price);
          }
      }
  }
}
