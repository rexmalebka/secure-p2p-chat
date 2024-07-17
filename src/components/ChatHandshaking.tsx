import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useIdReceiverParam } from '../hooks';
import QRCode from 'qrcode';
import { FaClipboard } from 'react-icons/fa';
import SessionDataContext from '../Context';

const ChatHandshaking: React.FC<{
    chatURL: string;
}> = ({ chatURL }) => {
    const { peer, local } = useContext(SessionDataContext);
    const receiver_id = useIdReceiverParam();

    const [qrcode_url, set_qrcode_url] = useState<string>();

    const copyURL = useCallback(() => {
        navigator.clipboard.writeText(chatURL);
    }, [peer, chatURL]);

    useEffect(() => {
        if (!peer || !chatURL) return;

        QRCode.toDataURL(chatURL)
            .then((url) => {
                set_qrcode_url(url);
            })
            .catch((err: unknown) => {
                console.error('error creating QR', err);
            });
    }, [peer, chatURL]);

    return (
        <>
            {chatURL && local && local.privateKey && local.publicKey && !receiver_id && (
                <div className="chat-panel__handshake">
                    <div className="chat-panel__handshake__clipboard" onClick={copyURL}>
                        <FaClipboard className="chat-panel__handshake__clipboard__icon" />
                        <a href={chatURL}>copy this url</a>
                    </div>

                    <label htmlFor="">or scan this QR</label>
                    <img src={qrcode_url} className="chat-panel__handshake__qrcode" />
                </div>
            )}
        </>
    );
};

export default ChatHandshaking;
