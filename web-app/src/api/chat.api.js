import axios from 'axios';
import { domain } from './server.connection';
import { buildTokenAuthHeader } from './utils';


const buildEndpoint = (apiroute) => {
    return `${domain}${apiroute}`;
}

export const loadAllMessagesWithReceiver = async (receiverId, token) => {
    try {
        const endpoint = buildEndpoint(`/api/chat/messages/${receiverId}`);
        const response = await axios.get(endpoint, buildTokenAuthHeader(token));
        return response.data;
    } catch (err) {
        throw err;
    }
}