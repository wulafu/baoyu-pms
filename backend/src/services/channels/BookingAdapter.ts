import { IChannelAdapter } from './IChannelAdapter';
import { ChannelMapping } from '../../models/channel.model';

export class BookingAdapter implements IChannelAdapter {
    channelCode = 'booking';

    async syncStock(mapping: ChannelMapping, date: string, status: string, price?: number): Promise<boolean> {
        console.log(`[Booking.com API] Request: POST https://supply-xml.booking.com/hotels/xml/availability`);
        // Booking.com often uses XML
        const xml = `
            <request>
                <room id="${mapping.channel_room_id}">
                    <date value="${date}">
                        <closed>${status === 'blocked' || status === 'booked' ? 1 : 0}</closed>
                        ${price ? `<rate>${price}</rate>` : ''}
                    </date>
                </room>
            </request>
        `;
        console.log(`[Booking.com API] Payload: ${xml.replace(/\s+/g, ' ').trim()}`);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        console.log(`[Booking.com API] Response: <OK/>`);
        return true;
    }

    async fetchOrders(mapping: ChannelMapping): Promise<any[]> {
        console.log(`[Booking.com API] Fetching orders...`);
        return [];
    }
}
