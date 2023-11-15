"use client";

import { ChatMessageType } from "@/lib/types";
import { createId } from "@paralleldrive/cuid2";
import React, { FormEvent, KeyboardEvent, useRef } from "react";

type ChatSendFormProps = {
  userName: string;
  isConnected: boolean;
  handleSendMessage: (msg: string) => void;
};

export default function ChatSendForm({
  userName,
  isConnected,
  handleSendMessage,
}: ChatSendFormProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleConfirmMessage = (event: FormEvent) => {
    event.preventDefault();

    if (!inputRef.current || inputRef.current.value === "") return;

    const messageToSend: ChatMessageType = {
      id: createId(),
      userName: userName,
      message: inputRef.current.value,
      color: "#adadFF",
    };

    handleSendMessage(JSON.stringify(messageToSend));
    inputRef.current.value = "";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid new line on Enter
      console.log(inputRef.current?.value);
      handleConfirmMessage(e); // Call your send message handler
    }
    // No need to handle SHIFT+ENTER specifically, as textarea supports it natively
  };

  return (
    <form className="flex flex-row" onSubmit={handleConfirmMessage}>
      <button className="flex-none bg-slate-900 text-slate-400 p-5">
        Send Message
      </button>
      <textarea
        className="grow text-xl text-slate-900 bg-slate-400 px-4 align-middle pt-4"
        name="chatMessageInput"
        ref={inputRef}
        autoComplete="off"
        onKeyDown={handleKeyDown}
        placeholder=""
        rows={1}
        disabled={!isConnected}
      />
    </form>
  );
}
