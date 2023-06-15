import { SubscriptionType } from './constants';

import type {
    SubscriptionDisposer,
    SubscriptionParams,
    SubscriptionResponse,
    SubscriptionListener,
    SendMessageParams,
    SendTransactionParams,
    SendResponse,
    SignDataParams,
    SignDataResponse,
} from './types';

// Provider Api

/**
 * @remarks Provider Api
 */
export declare type ProviderApi = {
    /**
     * Signs arbitrary data.
     */
    signData: {
        input: SignDataParams;
        output: SignDataResponse;
    };
    /**
     * Sends an internal message from the user account.
     * Shows an approval window to the user.
     */
    sendMessage: {
        input: SendMessageParams;
        output: SendResponse;
    };
    /**
     * Sends transaction with provided params.
     */
    sendTransaction: {
        input: SendTransactionParams;
        output: SendResponse;
    };
};

/**
 * @remarks Provider Api
 */
export type ApiMethod = keyof ProviderApi;

/**
 * @remarks Provider Api
 */
export type ProviderApiRequestParams<T extends ApiMethod> = ProviderApi[T] extends {
    input: infer I;
}
    ? I
    : undefined;

/**
 * @remarks Provider Api
 */
export type RawProviderApiRequestParams<T extends ApiMethod> = ProviderApiRequestParams<T>;

/**
 * @remarks Provider Api
 */
export type ProviderApiResponse<T extends ApiMethod> = ProviderApi[T] extends {
    output: infer O;
}
    ? O
    : undefined;

/**
 * @remarks Provider Api
 */
export type RawProviderApiResponse<T extends ApiMethod> = ProviderApiResponse<T>;

// Subscription Api

/**
 * @remarks Subscription Api
 */
export declare type SubscriptionApi<T extends SubscriptionType> = {
    /**
     * Subscribes on data updates.
     * Returns updated data in listener callback.
     */
    subscribe: {
        input: {
            type: T;
            listener: SubscriptionListener<SubscriptionResponse<T>>;
        } & SubscriptionParams<T>;
        output: SubscriptionDisposer;
    };
};

/**
 * @remarks Subscription Api
 */
export type SubscriptionMethod = keyof SubscriptionApi<SubscriptionType>;

/**
 * @remarks Subscription Api
 */
export type ProviderSubscriptionRequestParams<T extends SubscriptionType> =
    SubscriptionApi<T>[SubscriptionMethod] extends {
        input: infer I;
    }
        ? I
        : undefined;

/**
 * @remarks Subscription Api
 */
export type RawProviderSubscriptionRequestParams<T extends SubscriptionType> = ProviderSubscriptionRequestParams<T>;

/**
 * @remarks Subscription Api
 */
export type ProviderSubscriptionResponse<T extends SubscriptionType> = SubscriptionApi<T>[SubscriptionMethod] extends {
    output: infer O;
}
    ? O
    : undefined;

/**
 * @remarks Subscription Api
 */
export type RawProviderSubscriptionResponse<T extends SubscriptionType> = ProviderSubscriptionResponse<T>;
