export enum RequestMethod {
    CheckConnection = 'checkConnection',
    Connect = 'connect',
    Disconnect = 'disconnect',
    SendMessage = 'sendMessage',
    SendTransaction = 'sendTransaction',
    SignData = 'signData',
}

export enum SubscriptionType {
    Balance = 'balance',
    IsConnected = 'isConnected',
}
