// run with ts-node .\server.ts

import WebSocket, { WebSocketServer } from "ws";
import { createId } from "@paralleldrive/cuid2";
import { quotesObject } from "./quotes";

type ChatMessage = {
  id: string;
  userName: string;
  message: string;
  color: string;
  type?: "message" | "userConnected";
};

// Create a WebSocket server instance
const wss = new WebSocketServer({ port: 8080 });
const serverMessageDelay = 10000;

const createRandomMessage = () => {
  const randomQuoteNo = Math.floor(Math.random() * quotesObject.quotes.length);
  const author = quotesObject.quotes[randomQuoteNo].author;
  const text = quotesObject.quotes[randomQuoteNo].quote;

  const newMessage = {
    id: createId(),
    userName: author,
    message: text,
    color: "#AD1",
  };

  return newMessage;
};

let periodicMessage = createRandomMessage(); // Global variable to store the periodic message
let isRunning = false;

// Update and broadcast the periodic message every 10 seconds
setInterval(() => {
  if (!isRunning) return;
  periodicMessage = createRandomMessage();
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(periodicMessage));
    }
  });
}, serverMessageDelay);

wss.on("connection", function connection(ws) {
  if (!isRunning) {
    isRunning = true;
  }
  console.log("A new client connected!");

  ws.on("close", () => {
    console.log("Client disconnected.");
    if (wss.clients.size <= 0) {
      isRunning = false;
    }
  });

  ws.on("message", (msg) => {
    const messageRecieved = JSON.parse(msg.toString());
    // console.log(messageRecieved);

    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(messageRecieved));
      }
    });
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
