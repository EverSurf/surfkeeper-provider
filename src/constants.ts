export enum RequestMethod {
  CheckConnection = 'checkConnection',
  Connect = 'connect',
  Disconnect = 'disconnect',
  SubscribeToBalance = 'subscribeToBalance',
  UnsubscribeFromBalance = 'unsubscribeFromBalance',
  SubscribeToIsConnected = 'subscribeToIsConnected',
  UnsubscribeFromIsConnected = 'unsubscribeFromIsConnected',
  EncodeInternalInput = 'encodeInternalInput',
  SendMessage = 'sendMessage',
  SendTransaction = 'sendTransaction',
  SignData = 'signData',
}

export enum SubscriptionType {
  Balance = 'balance',
  IsConnected = 'isConnected',
}
