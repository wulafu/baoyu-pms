import { IChannelAdapter } from './IChannelAdapter';
import { AirbnbAdapter } from './AirbnbAdapter';
import { CtripAdapter } from './CtripAdapter';
import { MeituanAdapter } from './MeituanAdapter';
import { BookingAdapter } from './BookingAdapter';

export class ChannelFactory {
    private static adapters: Map<string, IChannelAdapter> = new Map();

    static {
        this.register(new AirbnbAdapter());
        this.register(new CtripAdapter());
        this.register(new MeituanAdapter());
        this.register(new BookingAdapter());
    }

    private static register(adapter: IChannelAdapter) {
        this.adapters.set(adapter.channelCode, adapter);
    }

    static getAdapter(channelCode: string): IChannelAdapter | undefined {
        return this.adapters.get(channelCode);
    }
}
