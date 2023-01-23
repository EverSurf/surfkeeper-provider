<p align="center">
    <h3 align="center">Surf Keeper browser provider</h3>
    <p align="center">Provider interface for Surf Keeper extension of the Everscale blockchain</p>
    <p align="center">
        <a href="/LICENSE">
            <img alt="GitHub" src="https://img.shields.io/github/license/broxus/everscale-inpage-provider" />
        </a>
        <a href="https://www.npmjs.com/package/@eversurf/surfkeeper-provider">
            <img alt="npm" src="https://img.shields.io/npm/v/@eversurf/surfkeeper-provider">
        </a>
    </p>
</p>

### How to install

```shell
npm install --save surf-keeper-provider
```

### Methods

# Surf Extension methods

- **connect**
  Requests new permissions for current origin.
  Shows an approval window to the user.
  ```jsx
  input: {};
  output: {
  	isConnected: boolean; // Flag shows connection status for the current origin
  	address?: string; // Address of extension wallet
  	publicKey?: string; // Hex encoded public key
  };
  ```
  Example:
  ```jsx
  const result = await rpc.connect();
  ```
- **connectStatus**
  Requests new permissions for current origin.
  Shows an approval window to the user.
  ```jsx
  input: {};
  output: {
  	isConnected: boolean; // Flag shows connection status for the current origin
  	address?: string; // Address of extension wallet
  	publicKey?: string; // Hex encoded public key
  };
  ```
  Example:
  ```jsx
  const result = await rpc.connectStatus();
  ```
- **disconnect**
  Removes all permissions for current origin.
  ```jsx
  input: {
  }
  output: {
    isConnected: boolean; // 	Flag shows connection status for the current origin; should return `false` as disconnect method execution result
  }
  ```
  Example:
  ```jsx
  const result = await rpc.disconnect();
  ```
- **sendMessage**
  Sends an internal message from the user account.
  Shows an approval window to the user.
  ```jsx
  input: {
  	abi: string; // Contract abi
  	address: string; // Address string
  	net: EverscaleNetNameKey; // Name of network to send message in, i.e. 'mainnet' | 'devnet'
  	callSet: {
  		functionName: string; // Name of contract function to be sent to the contract
  		input: Record<string, any>; // Input for the contract function
  		header?: FunctionHeader;
  	};
  	bounce: boolean; // Whether to bounce message back on error
  	amount: string; // Amount of nano EVER to send
  	action?: string; // Name of action to be performed by message send
  };
  output: {
    // Result of send message
    result?: {
      shard_block_id: string; // The last generated shard block of the message destination account before the message was sent
      sending_endpoints: string[]; // The list of endpoints to which the message was sent
    };
    error?: string; // String with some error details
  };
  ```
  Example:
  ```jsx
  const response = await rpc.sendMessage({
    amount: '2000000000', // in nano-tokens, i.e. 2 tokens
    bounce: true,
    callSet: {
      functionName: 'addComment',
      input: {
        comment: 'Test comment',
      },
    },
    net: 'mainnet',
    action: 'Create comment',
    address: '0:8959ea111cc0c85d996df0d16e530d584d5366618cfed9ab6a1754828bb78479',
    abi: '{"ABI version":2,"version":"2.3","header":["pubkey","time","expire"]...',
  });
  ```
- **sendTransaction**
  Sends transaction with provided params.
  ```jsx
  input: {
    amount: string; // Amount of nano EVER to send
    bounce: boolean; // Whether to bounce message back on error
    comment: string; // Comment for the transaction to send it in payload
    net: EverscaleNetNameKey; // Name of network to send transaction in, i.e. 'mainnet' | 'devnet'
    to: string; // Address to send transaction to
  }
  output: {
    // Result of send transaction message
    result?: {
      shard_block_id: string; // The last generated shard block of the message destination account before the message was sent
      sending_endpoints: string[]; // The list of endpoints to which the message was sent
    };
    error?: string; // String with some error details
  };
  ```
  Example:
  ```jsx
  const response = await rpc.sendTransaction({
    amount: '10000000000', // in nano-tokens, i.e. 10 tokens
    bounce: true,
    comment: 'check it out!',
    net: 'devnet',
    to: '0:b76b532fbe72307bff243b401d6792d5d01332ea294a0310c0ffdf874026f2b9',
  });
  ```
- **signData**
  Signs arbitrary data.
  ```jsx
  input: {
    data: string; // Base64 encoded arbitrary bytes
  }
  output: {
    signature?: string; // Base64 encoded signature bytes (data is guaranteed to be 64 bytes long)
    error?: string; // String with error details
  };
  ```
  Example:
  ```jsx
  const response = await rpc.signData({
    data: 'te6ccgEBAQEAKAAASw4E0p6AD5fz9JsGWfbBhP0Bwq9+jk0X3za9rhuI7A1H3DxC0QBw',
  });
  ```
- **subscribe**
  Subscribes to data updates.
  ```jsx
  input: {
  	type: string; // Subscription type, for now only "balance" is available
  	address: string; // Target address
  	listener: (value: string) => void; // Subscription data update handler
  };
  output: {
  	remove: () => void; // Base64 encoded signature bytes (data is guaranteed to be 64 bytes long)
  };
  ```
  Example:
  ```jsx
  const response = rpc.subscribe({
    type: 'balance',
    address: '0x000000..000',
    listener: val => console.log('Balance uodated: ', val),
  });
  ```

### Example

```typescript
import {
    Address,
    ConnectResponse,
    ProviderRpcClient,
    hasSurfKeeperProvider
} from 'surf-keeper-provider';

const rpc = new ProviderRpcClient();

async function myApp() {
  if (!(await rpc.hasProvider())) {
    throw new Error('Extension is not installed');
  }

  const connectionInfo = await rpc.connect();
  if (connectionInfo == undefined) {
    throw new Error('Insufficient permissions');
  }

  const selectedAddress = connectionInfo.address;
  const isConnected = connectionInfo.isConnected;
  const publicKey = connectionInfo.publicKey;

  const transaction = await rpc
    .sendTransaction({
        amount: '10000000000',
        bounce: true,
        comment: 'check it out!',
        net: 'devnet',
        to: '0:b76b532fbe72307bff243b401d6792d5d01332ea294a0310c0ffdf874026f2b9'
    });
  console.log(transaction);

  const message = await rpc
    .sendMessage({
        amount: '2000000000', // in nano-tokens, i.e. 2 tokens
        bounce: true,
        callSet: {
            functionName: 'functionName',
            input: {
                comment: 'Test comment',
            },
        },
        net: 'mainnet',
        action: 'Create comment',
        address: '0:8959ea111cc0c85d996df0d16e530d584d5366618cfed9ab6a1754828bb78479',
        abi: abi
    });
  console.log(message);
}

const abi = {
  'ABI version': 2,
  'header': ['time', 'expire'],
  'functions': [{
    ...
  }],
  'data': [],
  'events': [],
} as const; // NOTE: `as const` is very important here

myApp().catch(console.error);
```
