import { SubscriptionListener } from './api';

type RequestMethods = 'connect' | 'disconnect' | 'checkConnect' | 'subscribeToBalance' | 'unsubscribeFromBalance';
export type SubscriptionType = 'balance';
export type EverscaleNetNameKey = 'mainnet' | 'devnet';

export interface Request {
  method: RequestMethods;
  params?: any;
}

export interface ConnectResponse {
  isConnected: boolean;
  address?: string;
  publicKey?: string;
}

export type BalanceListener = (balance: string) => void | Promise<void>;

export interface SubscriptionParams<T extends SubscriptionType> {
  type: SubscriptionType;
  listener: SubscriptionListener<T>;
  address: string;
}
export interface SubscriptionResponse {
  remove: () => void;
}

export type Address = string;

export type Abi = string;
