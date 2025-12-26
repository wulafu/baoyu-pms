import { ChannelMapping } from '../../models/channel.model';

export interface IChannelAdapter {
    channelCode: string;
    
    /**
     * Push inventory/rate updates to the OTA
     */
    syncStock(mapping: ChannelMapping, date: string, status: string, price?: number): Promise<boolean>;

    /**
     * Fetch new orders from the OTA (Simulated)
     */
    fetchOrders(mapping: ChannelMapping): Promise<any[]>;

    /**
     * Get OAuth Authorization URL
     */
    getAuthUrl?(): string;

    /**
     * Handle OAuth Callback
     */
    handleCallback?(code: string): Promise<any>;

    /**
     * Get Room List from OTA
     */
    getRoomList?(config: any): Promise<any[]>;
}
