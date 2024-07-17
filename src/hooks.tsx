import { useContext } from 'react';
import SessionDataContext from './Context';

const useIdReceiverParam = () => {
    const query = window.location.search;
    const url_params = new URLSearchParams(query);

    return url_params.has('id') ? url_params.get('id') : null;
};

const useChatURL = () => {
    const { peer } = useContext(SessionDataContext);
    if (!peer || !peer.id) return undefined;

    console.info('uwu', peer);
    return (
        window.location.protocol +
        '//' +
        window.location.host +
        '/' +
        window.location.pathname +
        `?id=${peer.id}`
    );
};

export { useIdReceiverParam, useChatURL };
