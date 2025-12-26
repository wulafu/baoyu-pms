import { IChannelAdapter } from './IChannelAdapter';
import { ChannelMapping } from '../../models/channel.model';

export class AirbnbAdapter implements IChannelAdapter {
    channelCode = 'airbnb';

    async syncStock(mapping: ChannelMapping, date: string, status: string, price?: number): Promise<boolean> {
        console.log(`[Airbnb API] Request: POST https://api.airbnb.com/v2/calendars/${mapping.channel_room_id}`);
        console.log(`[Airbnb API] Payload: { date: "${date}", available: ${status === 'available'}, price: ${price || 'no_change'} }`);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log(`[Airbnb API] Response: 200 OK - Inventory Updated`);
        return true;
    }

    async fetchOrders(mapping: ChannelMapping): Promise<any[]> {
        console.log(`[Airbnb API] Fetching new bookings for listing ${mapping.channel_room_id}...`);
        return [];
    }
}
