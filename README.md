# vu-ipc
A type-safe Inter-iFrame Communication library.

Provides an ipc channel, but when passing across iFrames/WorkThreads through postMessage/onmessage, using this 
channel can provide an experience similar to method calling.

```
---------------                                                              --------------
|    iframe    | <-- postMessage(request)/onmessage = (response) => {} -->  |    parent    |
---------------                                                              --------------

equivalent to

---------------                                             --------------
|    iframe    | <--funtion (args: Tpye): Response {} -->  |    parent    |
---------------                                             --------------
```

Currently all features are implemented and used in private projects, but still need some testing before final release

# Install

## npm

```bash
npm install vu-ipc
```

## pnpm

```bash
pnpm install vu-ipc
```

# Usage

1. Define the api

define an abstract base class that represents the API, which describes what parameters an API should pass in and what types it should return.

```typescript
import { Api, ApiPromise } from "@variables-ultra/ipc"

export abstract class GreetApi implements Api {
    name: string = "GreetApi"

    abstract greeting(request: string): ApiPromise<string>
}
```

2. Implement the api in the iframe
   
implement an api-client in the module that needs to call postMessage to send messages and receive return values

```typescript
import { GreetApi, IpcClient, Request, ApiPromise } from "./GreetApi"

export class GreetApiClient extends GreetApi {
    constructor(private ipcClient: IpcClient) {
        super()
    }
    
    async greeting(request: string): Promise<string> {
        return this.ipcClient.request(Request.request(this.name, this.greeting.name, [request]))
    }
}
```

3. Implement the api in the parent

implement an api-server in the module that needs to receive messages through onMessage to process the actual 
business logic and return the required response body

```typescript
import { GreetApi, IpcClient, Request, ApiPromise } from "./GreetApi"
import { Result } from "@variables-ultra/core/result"

export class GreetApiServer extends GreetApi {
    constructor(private ipcClient: IpcClient) {
        super()
    }
    
    async greeting(request: string): ApiPromise<string> {
        return Result.ok(`Hello ${request}`)
    }
}
```

4. Use the api-client in the iframe

```typescript
// create an ipcClient
const ipcClient = new IpcClient((message, targetOrigin) => {
    parent.postMessage({ pluginMessage: message, pluginId: pluginId }, trustedOrigin)
})

// listen to the message event, redirect the message to the ipcClient
window.onmessage = (event: MessageEvent) => {
    const message = event.data
    const origin = event.origin
    if (message.pluginMessage && message.pluginId === pluginId && origin === trustedOrigin) {
        this.ipcClient.onMessage(message.pluginMessage, event.origin)
    }
}

// initialize the api-client with the ipcClient
const greetApi = new GreetApiClient(ipcClient)

// call the api
const response = greetApi.greeting("world").unwrap()

// log the response: hello world
console.log(response)
```
