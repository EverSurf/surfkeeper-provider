import {
  ProviderApiRequestParams,
  ProviderApiResponse,
  ProviderMethod,
  RawProviderApiRequestParams,
  RawProviderApiResponse,
  RawProviderRequest
} from './api';
import { ConnectResponse, SubscribeParams, SubscribeResponse } from './models';
export * from './api';
export * from './models';

/**
* @category Provider
*/
export interface Provider {
  readonly isSurf: boolean;

  checkConnection(): Promise<ConnectResponse | void>;
  connect(): Promise<ConnectResponse | void>;
  disconnect(): Promise<ConnectResponse | void>;
  subscribe(params: SubscribeParams): SubscribeResponse;
  request<T extends ProviderMethod>(params: RawProviderRequest<T>): Promise<RawProviderApiResponse<T>>;
}
/**
* @category Provider
*/
export declare type ProviderProperties = {
  /***
   * Ignore injected provider and try to use `fallback` instead.
   * @default false
   */
  forceUseFallback?: boolean;
  /***
   * Provider factory which will be called if injected provider was not found.
   * Can be used for initialization of the standalone Everscale client
   */
  fallback?: () => Promise<Provider>;
};

declare global {
  interface Window {
      everscale: Provider | undefined;
  }
}
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

const getProvider = (): Provider | undefined => (isBrowser ? window.everscale : undefined);

let isPageLoaded: Promise<void>;
if (document.readyState === 'complete' || !isBrowser) {
  isPageLoaded = Promise.resolve();
} else {
  isPageLoaded = new Promise<void>(resolve => {
  window.addEventListener('load', () => {
    resolve();
  });
});
}

/**
* @category Provider
*/
export async function hasSurfKeeperProvider(): Promise<boolean> {
  if (!isBrowser) {
    return false;
  }

  await isPageLoaded;
  return Boolean(window.everscale) && window.everscale!.isSurf;
}

/**
* @category Provider
*/
export class ProviderRpcClient {
  private readonly _properties: ProviderProperties;
  private readonly _api: RawProviderApiMethods;
  private readonly _initializationPromise: Promise<void>;
  // private readonly _subscriptions: { [K in ProviderEvent]: Map<number, (data: ProviderEventData<K>) => void> } = {};
  // private readonly _contractSubscriptions: Map<string, Map<number, ContractUpdatesSubscription>> = new Map();
  private _provider?: Provider;

  // public Contract: new <Abi>(abi: Abi, address: Address) => contract.Contract<Abi>;
  // public Subscriber: new () => subscriber.Subscriber;

  constructor(properties: ProviderProperties = {}) {
    this._properties = properties;

    const self = this;

    // Wrap provider requests
    this._api = new Proxy(
      {},
      {
        get:
          <K extends ProviderMethod>(_object: ProviderRpcClient, method: K) =>
          (params: RawProviderApiRequestParams<K>) => {
            if (this._provider != null) {
              return this._provider.request({ method, params });
            } else {
              throw new ProviderNotInitializedException();
            }
          },
      },
    ) as unknown as RawProviderApiMethods;  

    if (properties.forceUseFallback === true) {
      this._initializationPromise =
        properties.fallback != null
          ? properties.fallback().then(provider => {
              this._provider = provider;
            })
          : Promise.resolve();
    } else {
      // Initialize provider with injected object by default
      this._provider = getProvider();
      if (this._provider != null) {
        // Provider as already injected
        this._initializationPromise = Promise.resolve();
      } else {
        // Wait until page is loaded and initialization complete
        this._initializationPromise = hasSurfKeeperProvider()
          .then(
            hasProvider =>
              new Promise<void>(resolve => {
                if (!hasProvider) {
                  // Fully loaded page doesn't even contain provider flag
                  return resolve();
                }

                // Wait injected provider initialization otherwise
                this._provider = getProvider();
                if (this._provider != null) {
                  resolve();
                } else {
                  const eventName = window.everscale?.isSurf === true ? 'surfkeeper#initialized' : 'surfkeeper#initialized';
                  window.addEventListener(eventName, _ => {
                    this._provider = getProvider();
                    resolve();
                  });
                }
              }),
          )
          .then(async () => {
            if (this._provider == null && properties.fallback != null) {
              this._provider = await properties.fallback();
            }
          });
      }
    }
  }

  /**
   * Checks whether this page has injected Everscale provider or
   * there is a fallback provider.
   */
  public async hasProvider(): Promise<boolean> {
    if (this._properties.fallback != null) {
      return true;
    }
    return hasSurfKeeperProvider();
  }

  /**
   * Waits until provider api will be available. Calls `fallback` if no provider was found
   *
   * @throws ProviderNotFoundException when no provider found
   */
  public async ensureInitialized(): Promise<void> {
    await this._initializationPromise;
    if (this._provider == null) {
      throw new ProviderNotFoundException();
    }
  }

  /**
   * Whether provider api is ready
   */
  public get isInitialized(): boolean {
    return this._provider != null;
  }

  /**
   * Raw provider
   */
  public get getProvider(): Provider {
    if (this._provider != null) {
      return this._provider;
    } else {
      throw new ProviderNotInitializedException();
    }
  }

  /**
   * Raw provider api
   */
  public get getApi(): RawProviderApiMethods {
    return this._api;
  }

  /**
   * Connect extension
   */
  public async connect(): Promise<ConnectResponse | void> {
    await this.ensureInitialized();
    return await this._provider!.connect();
  }

  /**
   * Get connection status
   */
  public async connectStatus(): Promise<ConnectResponse | void> {
    await this.ensureInitialized();
    return await this._provider!.checkConnection();
  }

  /**
   * Disconnect
   */
  public async disconnect(): Promise<ConnectResponse | void> {
    await this.ensureInitialized();
    await this._provider!.disconnect();
  }

  /**
   * Signs arbitrary data.
   */
  public async signData(args: ProviderApiRequestParams<'signData'>): Promise<ProviderApiResponse<'signData'>> {
    await this.ensureInitialized();
    return this._api.signData(args);
  }

  /**
   * Sends an internal message from the user account.
   * Shows an approval window to the user.
   */
  public async sendMessage(args: ProviderApiRequestParams<'sendMessage'>): Promise<ProviderApiResponse<'sendMessage'>> {
    await this.ensureInitialized();
    return this._api.sendMessage({
      abi: args.abi,
      action: args.action,
      address: args.address,
      amount: args.amount,
      bounce: args.bounce,
      callSet: {
          functionName: args.callSet.functionName,
          input: args.callSet.input,
          header: args.callSet.header
      },
      net: args.net
    });
  }

  /**
   * Sends an internal message from the user account.
   * Shows an approval window to the user.
   */
  public async sendTransaction(args: ProviderApiRequestParams<'sendTransaction'>): Promise<ProviderApiResponse<'sendTransaction'>> {
      await this.ensureInitialized();
      return this._api.sendTransaction({
        amount: args.amount,
        bounce: args.bounce,
        comment: args.comment,
        net: args.net,
        to: args.to
      });
    }
}

/**
 * @category Provider
 */
export class ProviderNotFoundException extends Error {
  constructor() {
    super('Everscale provider was not found');
  }
}

/**
 * @category Provider
 */
export class ProviderNotInitializedException extends Error {
  constructor() {
    super('Everscale provider was not initialized yet');
  }
}

/**
 * @category Provider
 */
export type RawRpcMethod<P extends ProviderMethod> = (args: RawProviderApiRequestParams<P>) => Promise<RawProviderApiResponse<P>>;

/**
 * @category Provider
 */
export type RawProviderApiMethods = {
  [P in ProviderMethod]: RawRpcMethod<P>;
};
