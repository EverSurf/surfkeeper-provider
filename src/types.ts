import {
    ApiMethod,
    RawProviderApiRequestParams,
    RawProviderApiResponse,
    RawProviderSubscriptionRequestParams,
    RawProviderSubscriptionResponse,
    RawProviderUnsubscriptionRequestParams,
    SubscriptionMethod,
    UnsubscriptionMethod,
    RawProviderUnsubscriptionResponse,
} from './api';

import type { RequestMethod, SubscriptionType } from './constants';

// Connect / Check Connection

export type CheckConnectionParams = Record<string, never>;

export type ConnectParams = {
    icon?: string;
};

export type ConnectResponse = {
    isConnected: boolean;
    address?: string;
    publicKey?: string;
};

// Disconnect

export type DisconnectParams = Record<string, never>;

export type DisconnectResponse = {
    isConnected: false;
};

// Balance subscription

export type BalanceSubscriptionParams = {
    address: string;
};

export type BalanceSubscriptionResponse = string;

// Balance unsubscription

export type BalanceUnsubscriptionParams = {
    address: string;
};

export type BalanceUnsubscriptionResponse = {
    isUnsubscribed: false;
    error: Error | undefined;
};

// Connected subscription

export type ConnectedSubscriptionParams = {
    //
};

export type ConnectedSubscriptionResponse = boolean;

// Connected unsubscription

export type ConnectedUnsubscriptionParams = {
    //
};

export type ConnectedUnsubscriptionResponse = {
    isUnsubscribed: false;
    error: Error | undefined;
};

// Subscription

export type SubscriptionParams<T extends SubscriptionType> = T extends SubscriptionType.Balance
    ? BalanceSubscriptionParams
    : T extends SubscriptionType.IsConnected
    ? ConnectedSubscriptionParams
    : never;

export type SubscriptionResponse<T extends SubscriptionType> = T extends SubscriptionType.Balance
    ? BalanceSubscriptionResponse
    : T extends SubscriptionType.IsConnected
    ? ConnectedSubscriptionResponse
    : never;

export type SubscriptionListener<R> = (value: R | undefined, error?: Error) => void | Promise<void>;

export type Subscribe<
    T extends SubscriptionType,
    P extends SubscriptionParams<T>,
    R extends SubscriptionResponse<T>,
> = {
    type: T;
    listener: SubscriptionListener<R>;
} & P;

export type SubscriptionDisposer = {
    remove: () => void;
};

// Unsubscription

export type UnsubscriptionParams<T extends SubscriptionType> = T extends SubscriptionType.Balance
    ? BalanceUnsubscriptionParams
    : T extends SubscriptionType.IsConnected
    ? ConnectedUnsubscriptionParams
    : never;

export type UnsubscriptionResponse<T extends SubscriptionType> = T extends SubscriptionType.Balance
    ? BalanceUnsubscriptionResponse
    : T extends SubscriptionType.IsConnected
    ? ConnectedUnsubscriptionResponse
    : never;

export type Unsubscribe<T extends SubscriptionType, P extends UnsubscriptionParams<T>> = {
    type: T;
} & P;

// Send message or transaction

type FunctionHeader = {
    /**
     * Message expiration time in seconds. If not specified - calculated automatically from message_expiration_timeout(), try_index and message_expiration_timeout_grow_factor() (if ABI includes `expire` header).
     */
    expire?: number;
    /**
     * Message creation time in milliseconds.
     *
     * @remarks
     * If not specified, `now` is used (if ABI includes `time` header).
     */
    time?: bigint;
    /**
     * Public key is used by the contract to check the signature.
     *
     * @remarks
     * Encoded in `hex`. If not specified, method fails with exception (if ABI includes `pubkey` header)..
     */
    pubkey?: string;
};

type CallSet = {
    /**
     * Name of contract function to be sent to the contract.
     */
    functionName: string;
    /**
     * Name of contract function to be sent to the contract.
     */
    input: Record<string, any>;
    /**
     * Options header for function.
     */
    header?: FunctionHeader;
};

export type ClientNetName = string;

export type SendMessageParams = {
    /**
     * Contract abi.
     */
    abi: string;
    /**
     * Name of action to be performed by message send.
     */
    action?: string;
    /**
     * Message destination address.
     */
    address: string;
    /**
     * Amount of nano EVER to send.
     */
    amount: string;
    /**
     * Whether to bounce message back on error.
     */
    bounce: boolean;
    /**
     * Set of params for function call.
     */
    callSet: CallSet;
    /**
     * Name of network to send message in.
     */
    net: ClientNetName;
};

export type SendTransactionParams = {
    /**
     * Amount of nano EVER to send
     */
    amount: string;
    /**
     * Whether to bounce message back on error
     */
    bounce: boolean;
    /**
     * Comment for the transaction to send it in payload
     */
    comment: string;
    /**
     * Name of network to send message in
     */
    net: ClientNetName;
    /**
     * Address to send transaction to
     */
    to: string;
};

type ResultOfSendMessage = {
    /**
     * The last generated shard block of the message destination account before the message was sent.
     *
     * @remarks
     * This block id must be used as a parameter of the
     * `wait_for_transaction`.
     */
    shard_block_id: string;
    /**
     * The list of endpoints to which the message was sent.
     *
     * @remarks
     * This list id must be used as a parameter of the
     * `wait_for_transaction`.
     */
    sending_endpoints: string[];
};

type SendResult = {
    /**
     * Result of message send.
     */
    sendMessageResult: ResultOfSendMessage;
    /**
     * Message id.
     */
    messageID: string;
};

export type SendResponse = {
    /**
     * Result of message or transaction send
     */
    result?: SendResult;
    /**
     * String with error details
     */
    error?: string;
};

// Sign data

export type SignDataParams = {
    /**
     * Unsigned user data.
     * Must be encoded with base64.
     */
    data: string;
};

export interface SignDataResponse {
    /**
     * Data signature.
     * Encoded with hex.
     */
    signature?: string;
    /**
     * String with error details
     */
    error?: string;
}

// JSON-RPC Request

export type RequestParams<M extends RequestMethod> = M extends RequestMethod.Connect
    ? ConnectParams
    : M extends RequestMethod.CheckConnection
    ? CheckConnectionParams
    : M extends RequestMethod.Disconnect
    ? DisconnectParams
    : M extends RequestMethod.SendMessage
    ? SendMessageParams
    : M extends RequestMethod.SendTransaction
    ? SendTransactionParams
    : M extends RequestMethod.SignData
    ? SignDataParams
    : M extends RequestMethod.UnsubscribeFromBalance
    ? BalanceUnsubscriptionParams
    : M extends RequestMethod.UnsubscribeFromIsConnected
    ? ConnectedUnsubscriptionParams
    : never;

export type RequestResponse<M extends RequestMethod> = M extends RequestMethod.Connect
    ? ConnectResponse
    : M extends RequestMethod.CheckConnection
    ? ConnectResponse
    : M extends RequestMethod.Disconnect
    ? DisconnectResponse
    : M extends RequestMethod.SendMessage
    ? SendResponse
    : M extends RequestMethod.SendTransaction
    ? SendResponse
    : M extends RequestMethod.SignData
    ? SignDataResponse
    : M extends RequestMethod.UnsubscribeFromBalance
    ? BalanceUnsubscriptionResponse
    : M extends RequestMethod.UnsubscribeFromIsConnected
    ? ConnectedUnsubscriptionResponse
    : never;

export type Request<M extends RequestMethod, P extends RequestParams<M>> = {
    method: M;
    params?: P;
};

export interface Provider {
    checkConnection(): Promise<ConnectResponse>;

    connect(): Promise<ConnectResponse>;

    disconnect(): Promise<DisconnectResponse>;

    subscribe<T extends SubscriptionType, P extends SubscriptionParams<T>, R extends SubscriptionResponse<T>>(
        params: Subscribe<T, P, R>,
    ): SubscriptionDisposer;

    unsubscribe<T extends SubscriptionType, P extends UnsubscriptionParams<T>, R extends UnsubscriptionResponse<T>>(
        params: Unsubscribe<T, P>,
    ): Promise<R>;

    request<M extends RequestMethod, P extends RequestParams<M>, R extends RequestResponse<M>>(
        params: Request<M, P>,
    ): Promise<R>;
}

export declare type ProviderProperties = {
    /***
     * Ignore injected provider and try to use {@link  ProviderProperties.fallback} instead.
     * @defaultValue false
     */
    forceUseFallback?: boolean;
    /***
     * Provider factory which will be called if injected provider was not found.
     * Can be used for initialization of the standalone Everscale client
     */
    fallback?: () => Promise<Provider>;
};

export type RawRpcMethod<M extends ApiMethod | SubscriptionMethod | UnsubscriptionMethod> = M extends ApiMethod
    ? (args: RawProviderApiRequestParams<M>) => Promise<RawProviderApiResponse<M>>
    : M extends SubscriptionMethod
    ? (
          args: RawProviderSubscriptionRequestParams<SubscriptionType>,
      ) => RawProviderSubscriptionResponse<SubscriptionType>
    : M extends UnsubscriptionMethod
    ? (
          args: RawProviderUnsubscriptionRequestParams<SubscriptionType>,
      ) => RawProviderUnsubscriptionResponse<SubscriptionType>
    : never;

export type RawProviderApiMethods = {
    [M in ApiMethod]: RawRpcMethod<M>;
};

export type RawProviderSubscriptionMethods = {
    [M in SubscriptionMethod]: RawRpcMethod<M>;
};

export type RawProviderUnsubscriptionMethods = {
    [M in UnsubscriptionMethod]: RawRpcMethod<M>;
};

declare global {
    interface Window {
        surfkeeper: Provider | undefined;
    }
}
