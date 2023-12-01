## Overview
A chat client and server using WebSockets

The repo contains `ChatApp` folder and `ChatServer` folder which are standalone projects. 

- `ChatApp` uses Next.js 14
- `ChatServer` is a pure Node.js project


## How to run

> [!IMPORTANT]  
> Before running the server make sure you have a way of runnning `TypeScript` files in Node. 
> 
> I recommend using `ts-node`. Install it by runing `npm i ts-node -g`

1. Clone the repo
3. `cd into `ChatServer and run `npm i`
4. Launch the server by running `ts-node server.ts` 
2. `cd` into `ChatApp` and run `npm i`
5. Launch the client by running `npm run dev`

## Features
- Chat history
- Auto-scrolling with detection if user manually scrolled to read previous messages
- Moch messages with famous quotes