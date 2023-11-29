import { ChatMessageType } from "@/lib/types";
import React from "react";

export default function ChatMessageComponent({
  id,
  userName,
  message,
  color,
}: ChatMessageType) {
  return (
    <div className="flex flex-col w-full bg-slate-800 rounded p-3">
      <div className="flex flex-row justify-between">
        <span className="text-xl" style={{ color: color }}>
          {userName}
        </span>
        <span className="text-xs text-slate-600">{id}</span>
      </div>
      <div>
        <p style={{ whiteSpace: "pre-wrap" }}>{message}</p>
      </div>
    </div>
  );
}
