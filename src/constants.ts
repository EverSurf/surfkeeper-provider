export enum RequestMethod {
    CheckConnection = 'checkConnection',
    Connect = 'connect',
    Disconnect = 'disconnect',
    UnsubscribeFromBalance = 'unsubscribeFromBalance',
    UnsubscribeFromIsConnected = 'unsubscribeFromIsConnected',
    SendMessage = 'sendMessage',
    SendTransaction = 'sendTransaction',
    SignData = 'signData',
}

export enum SubscriptionType {
    Balance = 'balance',
    IsConnected = 'isConnected',
}
