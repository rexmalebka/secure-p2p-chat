import { createContext } from 'react';
import Peer from 'peerjs';
import { DataConnection } from 'peerjs';

import * as openpgp from 'openpgp';

export type msg = {
    remote: boolean;
    text: string;
    date: `${number}:${number}`;
};

export type SessionData = {
    peer: Peer;
    local: {
        privateKey: openpgp.PrivateKey;
        publicKey: openpgp.PublicKey;
    };
    remote: {
        publicKey: openpgp.PublicKey;
    };
    SenderConnection: DataConnection;
    history: msg[];
    set_history: (msg: string, isRemote: boolean) => void;
    set_remotePublicKey: React.Dispatch<React.SetStateAction<openpgp.PublicKey>>;
    stalled: boolean;
    set_stalled: React.Dispatch<React.SetStateAction<boolean>>;
};

const SessionDataContext = createContext<SessionData>({
    peer: undefined,
    local: undefined,
    remote: undefined,
    SenderConnection: undefined,
    history: [],
    set_history: () => {},
    set_remotePublicKey: () => {},
    stalled: false,
    set_stalled: () => {}
});

export default SessionDataContext;
