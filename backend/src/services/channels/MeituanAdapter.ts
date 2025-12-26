import { IChannelAdapter } from './IChannelAdapter';
import { ChannelMapping } from '../../models/channel.model';

export class MeituanAdapter implements IChannelAdapter {
    channelCode = 'meituan';

    async syncStock(mapping: ChannelMapping, date: string, status: string, price?: number): Promise<boolean> {
        console.log(`[Meituan API] Request: POST https://api.zhenguo.com/open/inventory`);
        // Meituan usually uses a specific JSON structure for bulk updates
        const payload = {
            partnerId: mapping.property_id,
            roomId: mapping.channel_room_id,
            dateRange: { start: date, end: date },
            inventoryStatus: status === 'available' ? 1 : 0,
            price: price ? price * 100 : undefined // Meituan often uses cents
        };
        console.log(`[Meituan API] Payload: ${JSON.stringify(payload)}`);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 400));
        
        console.log(`[Meituan API] Response: { "code": 200, "msg": "success" }`);
        return true;
    }

    async fetchOrders(mapping: ChannelMapping): Promise<any[]> {
        console.log(`[Meituan API] Fetching orders for ${mapping.channel_room_id}...`);
        return [];
    }
}
