const borsh = require('borsh');

const PUBLIC_KEY_SCHEMA = {
    keyType: 'u8',
    data: [32],
};

const ACCESS_KEY_SCHEMA = {
    nonce: 'u64',
    permission: {
        enum: true,
        functionCall: {
            allowance: 'u128',
            receiverId: 'string',
            methodNames: ['string'],
        },
        fullAccess: {},
    },
};

const ACTION_SCHEMA = {
    enum: true,
    createAccount: {},
    deployContract: {
        code: ['u8'],
    },
    functionCall: {
        methodName: 'string',
        args: ['u8'],
        gas: 'u64',
        deposit: 'u128',
    },
    transfer: {
        deposit: 'u128',
    },
    stake: {
        stake: 'u128',
        publicKey: PUBLIC_KEY_SCHEMA,
    },
    addKey: {
        publicKey: PUBLIC_KEY_SCHEMA,
        accessKey: ACCESS_KEY_SCHEMA,
    },
    deleteKey: {
        publicKey: PUBLIC_KEY_SCHEMA,
    },
    deleteAccount: {
        beneficiaryId: 'string',
    },
};

const TRANSACTION_SCHEMA = {
    signerId: 'string',
    publicKey: PUBLIC_KEY_SCHEMA,
    nonce: 'u64',
    receiverId: 'string',
    blockHash: [32, 'u8'],
    actions: [ACTION_SCHEMA],
}

const SIGNED_TRANSACTION_SCHEMA = {
    transaction: TRANSACTION_SCHEMA,
    signature: {
        keyType: 'u8',
        data: [64],
    },
};

function encodeTransaction(transaction) {
    return borsh.serialize(TRANSACTION_SCHEMA, transaction);
}

function decodeTransaction(buffer) {
    return borsh.deserialize(TRANSACTION_SCHEMA, buffer);
}

class TransactionBuilder {
    constructor(receiverId) {
        this.transaction = {
            receiverId,
            actions: [],
        };
    }

    createAccount() {
        this.transaction.actions.push({ createAccount: {} });
        return this;
    }

    deployContract(code) {
        this.transaction.actions.push({ deployContract: { code } });
        return this;
    }

    functionCall(methodName, args, gas, deposit) {
        this.transaction.actions.push({ functionCall: { methodName, args, gas, deposit } });
        return this;
    }

    transfer(deposit) {
        this.transaction.actions.push({ transfer: { deposit } });
        return this;
    }

    stake(stake, publicKey) {
        this.transaction.actions.push({ stake: { stake, publicKey } });
        return this;
    }

    addKey(publicKey, accessKey) {
        this.transaction.actions.push({ addKey: { publicKey, accessKey } });
        return this;
    }

    deleteKey(publicKey) {
        this.transaction.actions.push({ deleteKey: { publicKey } });
        return this;
    }

    deleteAccount(beneficiaryId) {
        this.transaction.actions.push({ deleteAccount: { beneficiaryId } });
        return this;
    }

    build(signerId, publicKey, nonce, blockHash) {
        // TODO: Check if all fields set?
        this.transaction.signerId = signerId;
        this.transaction.publicKey = publicKey;
        this.transaction.nonce = nonce;
        this.transaction.blockHash = blockHash;
        return this.transaction;
    }
}
