import type { SubscriptionType } from './constants';
import {
  ApiMethod,
  RawProviderApiRequestParams,
  RawProviderApiResponse, RawProviderRequest,
  RawProviderSubscriptionRequestParams,
  RawProviderSubscriptionResponse,
  SubscriptionMethod,
} from './api';

export type Abi = string;

export type Address = string;

export enum EverscaleNetNameKey {
  Mainnet = 'mainnet',
  Devnet = 'devnet',
}

export type FunctionHeader = {
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

// Connect

export type ConnectResponse = {
  isConnected: boolean;
  address?: Address;
  publicKey?: string;
};

// Disconnect

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

export type SubscriptionParams<T extends SubscriptionType> =
  T extends SubscriptionType.Balance
    ? BalanceSubscriptionParams
    : T extends SubscriptionType.IsConnected
      ? ConnectedSubscriptionParams
      : never;

export type SubscriptionResponse<T extends SubscriptionType> =
  T extends SubscriptionType.Balance
    ? BalanceSubscriptionResponse
    : T extends SubscriptionType.IsConnected
      ? ConnectedSubscriptionResponse
      : never;

export type SubscriptionDisposer = {
  remove: () => void;
};

// Unsubscription

export type UnsubscriptionParams<T extends SubscriptionType> =
  T extends SubscriptionType.Balance
    ? BalanceUnsubscriptionParams
    : T extends SubscriptionType.IsConnected
      ? ConnectedUnsubscriptionParams
      : never;

export type UnsubscriptionResponse<T extends SubscriptionType> =
  T extends SubscriptionType.Balance
    ? BalanceUnsubscriptionResponse
    : T extends SubscriptionType.IsConnected
      ? ConnectedUnsubscriptionResponse
      : never;


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

export type SendResult = {
  /**
   * Result of message send.
   */
  sendMessageResult: ResultOfSendMessage;
  /**
   * Message id.
   */
  messageID: string;
};

export interface Provider {
  checkConnection(): Promise<ConnectResponse>;

  connect(): Promise<ConnectResponse>;

  disconnect(): Promise<DisconnectResponse>;

  subscribe<T extends SubscriptionType>(params: SubscriptionParams<T>): SubscriptionDisposer;

  unsubscribe<T extends SubscriptionType>(params: UnsubscriptionParams<T>): UnsubscriptionResponse<T>; // Or promise?

  request<T extends ApiMethod>(params: RawProviderRequest<T>): Promise<RawProviderApiResponse<T>>;
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

export type RawRpcMethod<P extends ApiMethod | SubscriptionMethod> = P extends ApiMethod
  ? (args: RawProviderApiRequestParams<P>) => Promise<RawProviderApiResponse<P>>
  : P extends SubscriptionMethod
    ? (args: RawProviderSubscriptionRequestParams<SubscriptionType>) => RawProviderSubscriptionResponse<SubscriptionType>
    : never;

export type RawProviderApiMethods = {
  [P in ApiMethod]: RawRpcMethod<P>;
};

export type RawProviderSubscriptionMethods = {
  [P in SubscriptionMethod]: RawRpcMethod<P>;
};

declare global {
  interface Window {
    surfkeeper: Provider | undefined;
  }
}





