import { Request, Response } from 'express';
import { ChannelService } from '../services/channel.service';

const channelService = new ChannelService();

export class ChannelController {
  async getAll(req: Request, res: Response) {
    try {
      // Default property_id to 1 for MVP if not provided (assume single property owner)
      const propertyId = req.query.property_id ? parseInt(req.query.property_id as string) : 1;
      const channels = await channelService.getAllChannels(propertyId);
      res.json({ data: channels });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async connect(req: Request, res: Response) {
    try {
      const { property_id, channel_code, config } = req.body;
      const pid = property_id || 1; // Default
      await channelService.connectChannel(pid, channel_code, config);
      res.json({ message: 'Channel connected successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async disconnect(req: Request, res: Response) {
    try {
      const { property_id, channel_code } = req.body;
      const pid = property_id || 1; // Default
      await channelService.disconnectChannel(pid, channel_code);
      res.json({ message: 'Channel disconnected successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAuthUrl(req: Request, res: Response) {
      try {
          const { channel_code } = req.params;
          const url = await channelService.getAuthUrl(channel_code);
          res.json({ url });
      } catch (error: any) {
          res.status(400).json({ error: error.message });
      }
  }

  async handleAuthCallback(req: Request, res: Response) {
       try {
           const { channel_code } = req.params;
           const { code, property_id } = req.body;
           const pid = property_id || 1; 
           await channelService.handleAuthCallback(pid, channel_code, code);
           res.json({ message: 'Authorization successful' });
       } catch (error: any) {
           res.status(400).json({ error: error.message });
       }
   }

   async getChannelRooms(req: Request, res: Response) {
       try {
           const { channel_code } = req.params;
           const propertyId = req.query.property_id ? parseInt(req.query.property_id as string) : 1;
           const rooms = await channelService.getChannelRooms(propertyId, channel_code);
           res.json({ data: rooms });
       } catch (error: any) {
           res.status(400).json({ error: error.message });
       }
   }
 
   async getMappings(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.query.property_id as string);
        if (!propertyId) return res.status(400).json({ error: 'property_id is required' });
        
        const mappings = await channelService.getMappings(propertyId);
        res.json({ data: mappings });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  }

  async updateMapping(req: Request, res: Response) {
    try {
        await channelService.updateMapping(req.body);
        res.json({ message: 'Mapping updated successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  }

  async getSyncLogs(req: Request, res: Response) {
    try {
        const logs = await channelService.getSyncLogs();
        res.json({ data: logs });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  }
}
