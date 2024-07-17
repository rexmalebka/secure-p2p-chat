import React, { useCallback, useContext, useEffect, useState } from 'react';
import { IoSend } from 'react-icons/io5';
import * as openpgp from 'openpgp/lightweight';
import SessionDataContext from '../Context';

import { FaClock } from 'react-icons/fa';

export type DataMsg =
    | {
          type: 'msg';
          msg: string;
      }
    | {
          type: 'offerPublicKey';
          publicKey: string;
      }
    | {
          type: 'askPublicKey';
      };

const ChatForm: React.FC = () => {
    const {
        history,
        set_history,

        remote,

        SenderConnection,
        peer,

        stalled,
        set_stalled
    } = useContext(SessionDataContext);
    const [text_input, set_text_input] = useState<string>();

    const sendMessage = useCallback(
        function sendMessage() {
            if (!peer || !text_input || !SenderConnection || !remote.publicKey) return;

            set_stalled(true);
            (async () => {
                console.info('reading remote public key');

                const msg = await openpgp.createMessage({
                    text: text_input
                });

                const encrypted = await openpgp.encrypt({
                    message: msg,
                    encryptionKeys: remote.publicKey
                });
                console.info('encrypting message');

                SenderConnection.send({
                    type: 'msg',
                    msg: encrypted
                });
                set_history(text_input, false);
                set_stalled(false);
            })();
        },
        [peer, text_input, remote, SenderConnection]
    );

    return (
        <div className={SenderConnection ? 'chat-panel__form' : 'chat-panel__form--disabled'}>
            <div className="chat-panel__form__title">
                <b>chat</b>
            </div>
            <div className="chat-panel__form__history">
                {history.map((msg) => (
                    <div
                        className={
                            msg.remote
                                ? 'chat-panel__form__history__remote-msg'
                                : 'chat-panel__form__history__local-msg'
                        }
                        key={Math.random().toString(16).substring(2)}>
                        <span>{msg.text}</span>
                        <label
                            htmlFor="time"
                            className={
                                msg.remote
                                    ? 'chat-panel__form__history__remote-msg__time'
                                    : 'chat-panel__form__history__local-msg__time'
                            }>
                            {msg.date}
                        </label>
                    </div>
                ))}
            </div>
            <div className="chat-panel__form__input">
                <input
                    type="text"
                    onChange={(inp) => {
                        set_text_input(inp.target.value);
                    }}
                    onKeyDown={(inp) => {
                        if (stalled) return;
                        if (inp.key == 'Enter') {
                            sendMessage();
                            (inp.target as HTMLInputElement).value = '';
                        }
                    }}
                />
                <button className="chat-panel__form__input__button">
                    {stalled ? <FaClock></FaClock> : <IoSend onClick={sendMessage} />}
                </button>
            </div>
        </div>
    );
};

export default ChatForm;
