import { IChannelAdapter } from './IChannelAdapter';
import { ChannelMapping } from '../../models/channel.model';

export class CtripAdapter implements IChannelAdapter {
    channelCode = 'ctrip';

    async syncStock(mapping: ChannelMapping, date: string, status: string, price?: number): Promise<boolean> {
        console.log(`[Ctrip API] Request: POST https://openservice.ctrip.com/hotel/room/inventory`);
        console.log(`[Ctrip API] Payload: <Inventory><Room>${mapping.channel_room_id}</Room><Date>${date}</Date><Status>${status === 'booked' ? 0 : 1}</Status></Inventory>`);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log(`[Ctrip API] Response: 200 OK - <Success>True</Success>`);
        return true;
    }

    async fetchOrders(mapping: ChannelMapping): Promise<any[]> {
        console.log(`[Ctrip API] Fetching orders...`);
        return [];
    }

    getAuthUrl(): string {
        // Redirect to Frontend Callback URL
        const redirectUri = encodeURIComponent('http://localhost:5173/channels/callback');
        // Point to the Mock Page in the Frontend for demo purposes
        return `http://localhost:5173/mock-oauth?channel=ctrip&redirect_uri=${redirectUri}`;
    }

    async handleCallback(code: string): Promise<any> {
        console.log(`[Ctrip Adapter] Handling callback with code: ${code}`);
        return {
            access_token: 'mock_ctrip_token_' + Date.now(),
            refresh_token: 'mock_ctrip_refresh',
            expires_in: 7200
        };
    }

    async getRoomList(config: any): Promise<any[]> {
        // Mock rooms
        return [
            { id: 'ctrip_101', name: 'Ctrip Deluxe King' },
            { id: 'ctrip_102', name: 'Ctrip Standard Twin' },
            { id: 'ctrip_103', name: 'Ctrip Family Suite' }
        ];
    }
}
