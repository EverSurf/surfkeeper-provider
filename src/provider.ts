import {
    ApiMethod,
    ProviderApiRequestParams,
    ProviderApiResponse,
    ProviderSubscriptionRequestParams,
    ProviderUnsubscriptionRequestParams,
    ProviderUnsubscriptionResponse,
    RawProviderApiRequestParams,
    RawProviderSubscriptionRequestParams,
    RawProviderUnsubscriptionRequestParams,
} from './api';

import { SubscriptionType } from './constants';

import type {
    ConnectResponse,
    DisconnectResponse,
    Provider,
    ProviderProperties,
    RawProviderApiMethods,
    RawProviderSubscriptionMethods,
    RawProviderUnsubscriptionMethods,
    SubscriptionDisposer,
} from './types';

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

    private readonly _unsubscribe: RawProviderUnsubscriptionMethods;

    private readonly _initializationPromise: Promise<void>;

    private _provider?: Provider;

    constructor(properties: ProviderProperties = {}) {
        this._properties = properties;

        // Wrap provider requests
        this._api = new Proxy<RawProviderApiMethods>({} as unknown as RawProviderApiMethods, {
            get:
                <M extends ApiMethod>(_object: RawProviderApiMethods, method: M) =>
                (params: RawProviderApiRequestParams<M>) => {
                    if (this._provider != null) {
                        // @ts-ignore
                        return this._provider.request({ method, params });
                    } else {
                        throw new ProviderNotInitializedException();
                    }
                },
        });

        // Wrap provider subscriptions
        this._subscribe = new Proxy<RawProviderSubscriptionMethods>({} as unknown as RawProviderSubscriptionMethods, {
            get:
                <T extends SubscriptionType>(_object: RawProviderSubscriptionMethods) =>
                (params: RawProviderSubscriptionRequestParams<T>) => {
                    if (this._provider != null) {
                        // @ts-ignore
                        return this._provider.subscribe(params);
                    } else {
                        throw new ProviderNotInitializedException();
                    }
                },
        });

        this._unsubscribe = new Proxy<RawProviderUnsubscriptionMethods>(
            {} as unknown as RawProviderUnsubscriptionMethods,
            {
                get:
                    <T extends SubscriptionType>(_object: RawProviderUnsubscriptionMethods) =>
                    (params: RawProviderUnsubscriptionRequestParams<T>) => {
                        if (this._provider != null) {
                            return this._provider.unsubscribe(params);
                        } else {
                            throw new ProviderNotInitializedException();
                        }
                    },
            },
        );

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
                                        'surfkeeper initializations unfortunately went rogue. Please let us know about the details.',
                                    );
                                }

                                // Wait injected provider initialization otherwise
                                this._provider = getProvider();
                                if (this._provider != null) {
                                    resolve();
                                } else {
                                    reject(
                                        'surfkeeper initializations unfortunately went rogue. Please let us know about the details.',
                                    );
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
     * Checks whether this page has injected surfkeeper provider or
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
     * Connect extension.
     * Shows an approval window to the user.
     */
    public async connect(): Promise<ConnectResponse> {
        await this.ensureInitialized();
        return await this._provider!.connect();
    }

    /**
     * Get connection status.
     */
    public async connectStatus(): Promise<ConnectResponse> {
        await this.ensureInitialized();
        return await this._provider!.checkConnection();
    }

    /**
     * Disconnect extension.
     */
    public async disconnect(): Promise<DisconnectResponse> {
        await this.ensureInitialized();
        return await this._provider!.disconnect();
    }

    /**
     * Signs arbitrary data.
     * Shows an approval window to the user.
     */
    public async signData(args: ProviderApiRequestParams<'signData'>): Promise<ProviderApiResponse<'signData'>> {
        await this.ensureInitialized();
        return this._api.signData(args);
    }

    /**
     * Sends an internal message from the user account.
     * Shows an approval window to the user.
     */
    public async sendMessage(
        args: ProviderApiRequestParams<'sendMessage'>,
    ): Promise<ProviderApiResponse<'sendMessage'>> {
        await this.ensureInitialized();
        return this._api.sendMessage(args);
    }

    /**
     * Sends transaction with provided params.
     * Shows an approval window to the user.
     */
    public async sendTransaction(
        args: ProviderApiRequestParams<'sendTransaction'>,
    ): Promise<ProviderApiResponse<'sendTransaction'>> {
        await this.ensureInitialized();
        return this._api.sendTransaction(args);
    }

    /**
     * Subscribes on the event and listens to the updates.
     */
    public subscribe<T extends SubscriptionType>(args: ProviderSubscriptionRequestParams<T>): SubscriptionDisposer {
        // @ts-ignore
        return this._subscribe.subscribe(args);
    }

    /**
     * Unsubscribes from the event listening.
     */
    public unsubscribe<T extends SubscriptionType>(
        args: ProviderUnsubscriptionRequestParams<T>,
    ): Promise<ProviderUnsubscriptionResponse<T>> {
        // @ts-ignore
        return this._unsubscribe.unsubscribe(args);
    }
}
