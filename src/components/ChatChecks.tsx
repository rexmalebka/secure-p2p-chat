import { FaCheck } from 'react-icons/fa';
import { FaClock } from 'react-icons/fa';

import { useIdReceiverParam } from '../hooks';
import React, { useContext } from 'react';
import SessionDataContext from '../Context';

const ChatChecks: React.FC = () => {
    const receiver_id = useIdReceiverParam();
    const { peer, local, remote, SenderConnection } = useContext(SessionDataContext);

    return (
        <div className="chat-panel__checks">
            {peer ? (
                <FaCheck className="chat-panel__checks__icon" />
            ) : (
                <FaClock className="chat-panel__checks__icon" />
            )}
            <label htmlFor="" className="chat-panel__checks__label">
                {peer && peer.id ? 'peer created.' : 'creating peer...'}
            </label>

            {local && local.privateKey ? (
                <FaCheck className="chat-panel__checks__icon" />
            ) : (
                <FaClock className="chat-panel__checks__icon" />
            )}
            <label htmlFor="" className="chat-panel__checks__label">
                {local && local.privateKey ? 'private key created.' : 'creating private key...'}
            </label>

            {local && local.publicKey ? (
                <FaCheck className="chat-panel__checks__icon" />
            ) : (
                <FaClock className="chat-panel__checks__icon" />
            )}
            <label htmlFor="" className="chat-panel__checks__label">
                {local && local.publicKey ? 'public key created.' : 'creating public key...'}
            </label>

            {remote && remote.publicKey ? (
                <FaCheck className="chat-panel__checks__icon" />
            ) : (
                <FaClock className="chat-panel__checks__icon" />
            )}
            <label htmlFor="" className="chat-panel__checks__label">
                {receiver_id && !SenderConnection
                    ? 'connecting to remote...'
                    : 'waiting for connection...'}
            </label>
        </div>
    );
};

export default ChatChecks;
