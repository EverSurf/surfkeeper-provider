type RequestMethods = 'connect' | 'disconnect' | 'checkConnect' | 'subscribeToBalance' | 'unsubscribeFromBalance';
type SubscribeType = 'balance';
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

export interface SubscribeParams {
    type: SubscribeType;
    listener: BalanceListener;
    address: string;
}

export interface SubscribeResponse {
    remove: () => void
}

export type Address = string;

export type Abi = string;