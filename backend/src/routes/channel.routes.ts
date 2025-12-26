import { Router } from 'express';
import { ChannelController } from '../controllers/channel.controller';

const router = Router();
const channelController = new ChannelController();

router.get('/', channelController.getAll);
router.post('/connect', channelController.connect);
router.post('/disconnect', channelController.disconnect);
router.get('/:channel_code/auth-url', channelController.getAuthUrl.bind(channelController));
router.post('/:channel_code/auth-callback', channelController.handleAuthCallback.bind(channelController));
router.get('/:channel_code/rooms', channelController.getChannelRooms.bind(channelController));
router.get('/mappings', channelController.getMappings);
router.post('/mappings', channelController.updateMapping);
router.get('/logs', channelController.getSyncLogs);

export default router;
