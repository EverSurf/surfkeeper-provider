import { SubscriptionType } from './constants';

import type {
  ConnectResponse,
  DisconnectResponse,
  Provider,
  ProviderProperties,
  RawProviderApiMethods,
  RawProviderSubscriptionMethods,
  SubscriptionDisposer,
} from './types';
import {
  ApiMethod,
  ProviderApiRequestParams, ProviderApiResponse, ProviderSubscriptionRequestParams,
  RawProviderApiRequestParams,
  RawProviderSubscriptionRequestParams,
} from './api';

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

const getProvider = (): Provider | undefined => (isBrowser ? window.surfkeeper : undefined);

let isPageLoaded: Promise<void>;

if (!isBrowser || window.document.readyState === 'complete') {
  isPageLoaded = Promise.resolve();
} else {
  isPageLoaded = new Promise<void>(resolve => {
    const loadEventListener = () => {
      // Resolve
      resolve();
      // Stop listening to the event
      window.removeEventListener('load', loadEventListener);
    };
    window.addEventListener('load', loadEventListener);
  });
}

export async function hasSurfKeeperProvider(): Promise<boolean> {
  if (!isBrowser) {
    return false;
  }

  await isPageLoaded;

  return Boolean(window.surfkeeper);
}

export class ProviderNotFoundException extends Error {
  constructor() {
    super('surfkeeper provider was not found');
  }
}

export class ProviderNotInitializedException extends Error {
  constructor() {
    super('surfkeeper provider was not initialized yet');
  }
}

export class ProviderRpcClient {
  private readonly _properties: ProviderProperties;

  private readonly _api: RawProviderApiMethods;

  private readonly _subscribe: RawProviderSubscriptionMethods;

  private readonly _initializationPromise: Promise<void>;

  private _provider?: Provider;

  constructor(properties: ProviderProperties = {}) {
    this._properties = properties;

    // Wrap provider requests
    this._api = new Proxy<RawProviderApiMethods>({} as unknown as RawProviderApiMethods, {
      get:
        <K extends ApiMethod>(_object: RawProviderApiMethods, method: K) =>
          (params: RawProviderApiRequestParams<K>) => {
            if (this._provider != null) {
              return this._provider.request({ method, params });
            } else {
              throw new ProviderNotInitializedException();
            }
          },
    });

    // Wrap provider subscriptions
    this._subscribe = new Proxy<RawProviderSubscriptionMethods>({} as unknown as RawProviderSubscriptionMethods, {
      get:
        <K extends SubscriptionType>(_object: RawProviderSubscriptionMethods) =>
          (params: RawProviderSubscriptionRequestParams<K>) => {
            if (this._provider != null) {
              return this._provider.subscribe(params);
            } else {
              throw new ProviderNotInitializedException();
            }
          },
    });

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
              new Promise<void>((resolve, reject) => {
                if (!hasProvider) {
                  // Fully loaded page doesn't even contain provider flag
                  return reject(
                    'Surf Keeper initializations unfortunately went rogue. Please let us know about details.',
                  );
                }

                // Wait injected provider initialization otherwise
                this._provider = getProvider();
                if (this._provider != null) {
                  resolve();
                } else {
                  reject('Surf Keeper initializations unfortunately went rogue. Please let us know about details.');
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
  public async connect(): Promise<ConnectResponse> {
    await this.ensureInitialized();
    return await this._provider!.connect();
  }

  /**
   * Get connection status
   */
  public async connectStatus(): Promise<ConnectResponse> {
    await this.ensureInitialized();
    return await this._provider!.checkConnection();
  }

  /**
   * Disconnect
   */
  public async disconnect(): Promise<DisconnectResponse> {
    await this.ensureInitialized();
    return await this._provider!.disconnect();
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
        header: args.callSet.header,
      },
      net: args.net,
    });
  }

  /**
   * Sends an internal message from the user account.
   * Shows an approval window to the user.
   */
  public async sendTransaction(
    args: ProviderApiRequestParams<'sendTransaction'>,
  ): Promise<ProviderApiResponse<'sendTransaction'>> {
    await this.ensureInitialized();
    return this._api.sendTransaction({
      amount: args.amount,
      bounce: args.bounce,
      comment: args.comment,
      net: args.net,
      to: args.to,
    });
  }
  /**
   * Sends an internal message from the user account.
   * Shows an approval window to the user.
   */
  public subscribe<T extends SubscriptionType>(args: ProviderSubscriptionRequestParams<T>): SubscriptionDisposer {
    return this._subscribe.subscribe({
      type: args.type,
      address: args.address,
      listener: args.listener,
    });
  }
}
