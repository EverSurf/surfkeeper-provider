import { Abi, Address, EverscaleNetNameKey } from "./models";

/**
 * @category Provider Api
 */
export type ProviderEvents<Addr = Address> = {
    /**
     * Called when inpage provider connects to the extension
     */
    connected: Record<string, never>;
  
    /**
     * Called when inpage provider disconnects from extension
     */
    disconnected: Error;
  
    /**
     * Called each time the user changes network
     */
    networkChanged: {
      /**
       * Network group name
       *
       * @deprecated `networkId` should be used instead
       */
      selectedConnection: string;
      /**
       * Numeric network id
       */
      networkId: number;
    };
  
    /**
     * Called when permissions are changed.
     * Mostly when account has been removed from the current `accountInteraction` permission,
     * or disconnect method was called
     */
    permissionsChanged: {
      // permissions: Partial<Permissions<Addr>>;
    };
  
    /**
     * Called when permissions are changed.
     * Mostly when account has been removed from the current `accountInteraction` permission,
     * or disconnect method was called
     */
    accountChanged: {
      account: Addr;
    };
  };

/**
 * @category Provider
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
            address: Address;
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
        output: {
        };
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
            to: string;
        };
        output: {
        };
    };
};


/**
 * @category Provider Api
 */
export type ProviderEvent = keyof ProviderEvents;

/**
 * @category Provider Api
 */
export type ProviderEventData<T extends ProviderEvent, Addr = Address> = ProviderEvents<Addr>[T];

/**
 * @category Provider Api
 */
export type RawProviderEventData<T extends ProviderEvent> = ProviderEventData<T, string>;



/**
 * @category Provider Api
 */
export type ProviderMethod = keyof ProviderApi;

/**
 * @category Provider Api
 */
export type ProviderApiRequestParams<T extends ProviderMethod, Addr = Address> = ProviderApi<Addr>[T] extends {
  input: infer I;
}
  ? I
  : undefined;

/**
 * @category Provider Api
 */
export type RawProviderApiRequestParams<T extends ProviderMethod> = ProviderApiRequestParams<T, string>;

/**
 * @category Provider Api
 */
export type ProviderApiResponse<T extends ProviderMethod, Addr = Address> = ProviderApi<Addr>[T] extends {
  output: infer O;
}
  ? O
  : undefined;

/**
 * @category Provider Api
 */
export type RawProviderApiResponse<T extends ProviderMethod> = ProviderApiResponse<T, string>;

/**
 * @category Provider Api
 */
export interface RawProviderRequest<T extends ProviderMethod> {
  method: T;
  params: RawProviderApiRequestParams<T>;
}
