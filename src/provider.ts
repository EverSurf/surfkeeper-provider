import {
    ApiMethod,
    ProviderNetwork,
    ProviderSubscriptionRequestParams,
    RawProviderApiRequestParams,
    RawProviderSubscriptionRequestParams,
} from './api';

import { RequestMethod, SubscriptionType } from './constants';

import type {
    ConnectResponse,
    DisconnectResponse,
    SurfKeeperProvider,
    ProviderProperties,
    RawProviderApiNetworks,
    RawProviderApiMethods,
    RawProviderSubscriptionMethods,
    RequestParams,
    SubscriptionDisposer,
} from './types';

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

const getProvider = (): SurfKeeperProvider | undefined => (isBrowser ? window.surfkeeper : undefined);

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
    private _provider?: SurfKeeperProvider;

    private readonly _properties: ProviderProperties;

    private readonly _subscribe: RawProviderSubscriptionMethods;

    private readonly _initializationPromise: Promise<void>;

    public readonly networks: RawProviderApiNetworks;

    constructor(properties: ProviderProperties = {}) {
        this._properties = properties;

        // Wrap provider requests
        this.networks = ['everscale', 'gosh', 'ton', 'venom', 'dev', 'fld'].reduce(
            (api, networkKey) => ({
                ...api,
                [networkKey as ProviderNetwork]: new Proxy<RawProviderApiMethods>({} as RawProviderApiMethods, {
                    get:
                        <M extends ApiMethod>(_object: RawProviderApiMethods, method: M) =>
                        (params: RawProviderApiRequestParams<M>) => {
                            if (this._provider != null && this._provider[networkKey as ProviderNetwork]) {
                                return this._provider[networkKey as ProviderNetwork].request({ method, params } as {
                                    method: RequestMethod;
                                    params: RequestParams<RequestMethod>;
                                });
                            } else {
                                throw new ProviderNotInitializedException();
                            }
                        },
                }),
            }),
            {},
        ) as RawProviderApiNetworks;

        // Wrap provider subscriptions
        this._subscribe = new Proxy<RawProviderSubscriptionMethods>({} as RawProviderSubscriptionMethods, {
            get:
                <T extends SubscriptionType>(_object: RawProviderSubscriptionMethods) =>
                (params: RawProviderSubscriptionRequestParams<T>) => {
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
                // Provider is already injected
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
    public get getProvider(): SurfKeeperProvider {
        if (this._provider != null) {
            return this._provider;
        } else {
            throw new ProviderNotInitializedException();
        }
    }

    /**
     * Raw networks provider api
     */
    public get getNetworks(): RawProviderApiNetworks {
        return this.networks;
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
     * Subscribes on the event and listens to the updates.
     */
    public subscribe(args: ProviderSubscriptionRequestParams<SubscriptionType>): SubscriptionDisposer {
        return this._subscribe.subscribe(args);
    }
}
