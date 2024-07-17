import SessionDataContext from '../Context';
import React, { useContext, useEffect, useState } from 'react';

import ChatChecks from './ChatChecks';
import ChatForm from './ChatForm';
import ChatHandshaking from './ChatHandshaking';

const Chat = () => {
    const { history, peer, local, remote, set_history, SenderConnection, set_remotePublicKey } =
        useContext(SessionDataContext);
    const [chatURL, set_chatURL] = useState<string>();

    useEffect(() => {
        if (!peer) return;

        set_chatURL(
            window.location.protocol +
                '//' +
                window.location.host +
                '/' +
                window.location.pathname +
                `?id=${peer.id}`
        );
    }, [peer]);

    return (
        <div className="chat-panel">
            <ChatChecks />
            <ChatHandshaking chatURL={chatURL} />
            <ChatForm />
        </div>
    );
};

export default Chat;
