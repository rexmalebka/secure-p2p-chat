import { createRoot } from 'react-dom/client';
import React, { useCallback, useEffect, useState } from 'react';
import { useIdReceiverParam } from './hooks';
import SessionDataContext from './Context';

import './css/style.css';
import Peer from 'peerjs';

import Chat from './components/Chat';
import { DataConnection } from 'peerjs';
import type { msg } from './Context';
import * as openpgp from 'openpgp/lightweight';
import type { DataMsg } from './components/ChatForm';

const App = () => {
    const receiver_id = useIdReceiverParam();
    const [privateKey, set_privateKey] = useState<openpgp.PrivateKey>();
    const [publicKey, set_publicKey] = useState<openpgp.Key>();

    const [peer, set_peer] = useState<Peer>();

    const [SenderConnection, set_SenderConnection] = useState<DataConnection>();

    const [history, set_history] = useState<msg[]>([]);

    const [remotePublicKey, set_remotePublicKey] = useState<openpgp.Key>();

    const [stalled, set_stalled] = useState(false);

    const connectHandler = useCallback(
        (conn: DataConnection) => {
            set_SenderConnection(conn);
        },
        [publicKey]
    );

    const appendHistory = useCallback(function appendHistory(msg: string, isRemote: boolean) {
        const now = new Date();
        const hour: `${number}:${number}` = `${now.getHours()}:${now.getMinutes()}`;

        set_history((hist) => [
            ...hist,
            {
                remote: isRemote,
                text: msg,
                date: hour
            }
        ]);
    }, []);

    const ReceiveMsg = useCallback(
        function ReceiveMsg(rawMsg: DataMsg) {
            switch (rawMsg.type) {
                case 'msg':
                    (async () => {
                        set_stalled(true);
                        const encryptedMsg = await openpgp.readMessage({
                            armoredMessage: rawMsg.msg
                        });

                        const { data: msg } = await openpgp.decrypt({
                            message: encryptedMsg,
                            decryptionKeys: privateKey
                        });

                        set_stalled(false);
                        appendHistory(`${msg}`, true);
                    })();
                    break;
                case 'offerPublicKey':
                    console.info('receiving remote public key');
                    (async () => {
                        set_stalled(true);
                        const publicKey = await openpgp.readKey({
                            armoredKey: rawMsg.publicKey
                        });
                        set_stalled(false);
                        set_remotePublicKey(publicKey);
                    })();

                    break;
                case 'askPublicKey':
                    console.info('sending remote public key');

                    SenderConnection.send({
                        type: 'offerPublicKey',
                        publicKey: publicKey.armor()
                    });
                    break;
            }
        },
        [publicKey, privateKey, SenderConnection]
    );

    useEffect(function generateLocalKeys() {
        (async () => {
            set_stalled(true);
            console.info("generating keys")
            const { privateKey: privateKeyString, publicKey: publicKeyString } =
                await openpgp.generateKey({
                    type: 'rsa',
                    rsaBits: 4096,
                    passphrase: '',
                    userIDs: [
                        {
                            name: Math.random().toString(16).substring(2),
                            email: `${Math.random().toString(16).substring(2)}@mail.com`
                        }
                    ]
                });

            const privateKey = await openpgp.readPrivateKey({
                armoredKey: privateKeyString
            });

            const publicKey = await openpgp.readKey({
                armoredKey: publicKeyString
            });

            console.info("keys generated")
            set_stalled(false);
            set_privateKey(privateKey);
            set_publicKey(publicKey);
        })();
    }, []);

    useEffect(
        function generatePeer() {
            if (!publicKey) return;
            console.info("creating peer")
            const peer = new Peer({});

            peer.on('open', () => {
                set_peer(peer);
                console.info("peer is open")
            });

            peer.on('connection', connectHandler);
        },
        [publicKey]
    );

    useEffect(() => {
        if (!publicKey || !privateKey || !SenderConnection) return;
        SenderConnection.on('data', ReceiveMsg);

        const offerMsg: DataMsg = {
            type: 'offerPublicKey',
            publicKey: publicKey.armor()
        };

        const askMsg: DataMsg = {
            type: 'askPublicKey'
        };

        SenderConnection.send(offerMsg);
        SenderConnection.send(askMsg);
    }, [publicKey, privateKey, SenderConnection]);

    useEffect(
        function connectPeer() {
            if (!peer || !publicKey || !privateKey || !receiver_id) return;
            if (SenderConnection != undefined) return;

            console.info('attempting connection');
            setTimeout(() => {
                const conn = peer.connect(receiver_id);

                if (!conn) return;

                conn.on('open', () => {
                    console.info('remote connection open');

                    set_SenderConnection(conn);
                });
            }, 1000);
        },
        [peer, publicKey, privateKey, receiver_id, SenderConnection]
    );

    return (
        <SessionDataContext.Provider
            value={{
                peer: peer,
                local: {
                    privateKey,
                    publicKey
                },
                remote: {
                    publicKey: remotePublicKey
                },
                SenderConnection,
                history: history,
                set_history: appendHistory,
                set_remotePublicKey,

                stalled,
                set_stalled
            }}>
            <Chat></Chat>
        </SessionDataContext.Provider>
    );
};

const root = createRoot(document.querySelector('#app'));
root.render(<App />);
