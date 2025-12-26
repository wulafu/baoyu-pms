export interface ChannelMapping {
    id?: number;
    property_id: number;
    channel_code: string;
    channel_name: string;
    local_room_id: string;
    channel_room_id: string;
    sync_enabled: boolean;
    created_at?: string;
}
