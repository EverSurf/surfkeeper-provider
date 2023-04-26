import { SubscriptionListener } from './api';

export type Abi = string;

export type Address = string;

export type EverscaleNetNameKey = 'mainnet' | 'devnet';

export interface DisconnectResponse {
  isConnected: false;
}

export interface ConnectResponse {
  isConnected: boolean;
  address?: Address;
  publicKey?: string;
}

export type BalanceListener = (balance: string) => void | Promise<void>;

type RequestMethods = 'connect' | 'disconnect' | 'checkConnect' | 'subscribeToBalance' | 'unsubscribeFromBalance';
export interface Request {
  method: RequestMethods;
  params?: any;
}

export type SubscriptionType = 'balance';
export interface SubscriptionParams<T extends SubscriptionType> {
  type: SubscriptionType;
  listener: SubscriptionListener<T>;
  address: Address;
}
export interface SubscriptionResponse {
  remove: () => void;
}
