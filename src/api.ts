import { Abi, Address, EverscaleNetNameKey, SubscriptionResponse, SubscriptionType } from './models';

/**
 * @remarks Subscription
 */
export declare type SubscriptionApi<T extends SubscriptionType, Addr = Address> = {
  /**
   * Signs arbitrary data.
   */
  subscribe: {
    input: {
      /**
       * Base64 encoded arbitrary bytes
       */
      type: SubscriptionType;
      listener: SubscriptionListener<T>;
      address: Addr;
    };
    output: SubscriptionResponse;
  };
};

/**
 * @remarks Provider
 */
export declare type ProviderApi<Addr = Address> = {
  /**
   * Signs arbitrary data.
   */
  signData: {
    input: {
      /**
       * Base64 encoded arbitrary bytes
       */
      data: string;
    };
    output: {
      /**
       * Base64 encoded signature bytes (data is guaranteed to be 64 bytes long)
       */
      signature: string;
    };
  };
  /**
   * Sends an internal message from the user account.
   * Shows an approval window to the user.
   */
  sendMessage: {
    input: {
      /**
       * Contract abi
       */
      abi: Abi;
      /**
       * Name of action to be performed by message send
       */
      action?: string;
      /**
       * Message destination address
       */
      address: Addr;
      /**
       * Amount of nano EVER to send
       */
      amount: string;
      /**
       * Whether to bounce message back on error
       */
      bounce: boolean;

      callSet: {
        /**
         * Name of contract function to be sent to the contract
         */
        functionName: string;
        /**
         * Name of contract function to be sent to the contract
         */
        input: Record<string, any>;
        /**
         * Options header for function
         */
        // header?: FunctionHeader;
        header?: any;
      };
      /**
       * Name of network to send message in
       */
      net: EverscaleNetNameKey;
    };
    output: {};
  };
  /**
   * Sends transaction with provided params.
   */
  sendTransaction: {
    input: {
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
      net: EverscaleNetNameKey;
      /**
       * Address to send transaction to
       */
      to: Addr;
    };
    output: {};
  };
};

/**
 * @remarks Provider Api
 */
export type ApiMethod = keyof ProviderApi;

/**
 * @remarks Provider Api
 */
export type ProviderApiRequestParams<T extends ApiMethod, Addr = Address> = ProviderApi<Addr>[T] extends {
  input: infer I;
}
  ? I
  : undefined;

/**
 * @remarks Provider Api
 */
export type RawProviderApiRequestParams<T extends ApiMethod> = ProviderApiRequestParams<T, string>;

/**
 * @remarks Provider Api
 */
export type ProviderApiResponse<T extends ApiMethod, Addr = Address> = ProviderApi<Addr>[T] extends {
  output: infer O;
}
  ? O
  : undefined;

/**
 * @remarks Provider Api
 */
export type RawProviderApiResponse<T extends ApiMethod> = ProviderApiResponse<T, string>;

/**
 * @remarks Provider Api
 */
export interface RawProviderRequest<T extends ApiMethod> {
  method: T;
  params: RawProviderApiRequestParams<T>;
}

/**
 * @remarks Subscription Api
 */
export type SubscriptionMethod = keyof SubscriptionApi<SubscriptionType>;

/**
 * @remarks Subscription Api
 */
export type SubscriptionListener<T extends SubscriptionType> = (args: SubscriptionListenerParams<T>) => void;

/**
 * @remarks Subscription Api
 */
export type SubscriptionListenerParams<T extends SubscriptionType> = T extends infer R ? R : never;

/**
 * @remarks Provider Api
 */
export type ProviderSubscriptionRequestParams<T extends SubscriptionType, Addr = Address> = SubscriptionApi<
  T,
  Addr
>[SubscriptionMethod] extends {
  input: infer I;
}
  ? I
  : undefined;

/**
 * @remarks Provider Api
 */
export type RawProviderSubscriptionRequestParams<T extends SubscriptionType> = ProviderSubscriptionRequestParams<
  T,
  string
>;

/**
 * @remarks Provider Api
 */
export type ProviderSubscriptionResponse<T extends SubscriptionType, Addr = Address> = SubscriptionApi<
  T,
  Addr
>[SubscriptionMethod] extends {
  output: infer O;
}
  ? O
  : undefined;

/**
 * @remarks Provider Api
 */
export type RawProviderSubscriptionResponse<T extends SubscriptionType> = ProviderSubscriptionResponse<T, string>;
