import { useState, type KeyboardEvent, type FormEvent, useRef } from "react";
import sendIcon from "../../../assets/angleRight.svg";
import axios from "axios";
import SlashAutocomplete, {
  type PickedCommand,
  isOpen as isAutocompleteOpen,
  handleKey as handleAutocompleteKey,
} from "./SlashAutoComplete";

interface Props {
  channelId: string | null;
  replyTo: string | null;
  repliedContent: string;
  setReplyTo: React.Dispatch<React.SetStateAction<string | null>>;
  setRepliedContent: React.Dispatch<React.SetStateAction<string>>;
}

const Typer = (props: Props) => {
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<PickedCommand | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = async () => {
    if (!props.channelId || !text.trim()) return;

    // 1) Slash dispatch if at very start and we have a picked command
    const m = text.match(/^\/(\w+)(?:\s+(.*))?$/);
    if (m && picked) {
      const [, name, raw = ""] = m;
      const options = raw
        .split(/\s+/)
        .map((p) => p.split(":", 2))
        .filter(([k, v]) => k && v)
        .map(([n, v]) => ({ name: n, value: v }));
      try {
        const res = await axios.post(
          `http://localhost:3000/developer/applications/${picked.app_id}/commands/dispatch`,
          { command: name, channelId: props.channelId, options },
          { withCredentials: true }
        );
        if (res.data.valid) {
          setText("");
          setPicked(null);
          props.setReplyTo("");
          props.setRepliedContent("");
        }
      } catch (err) {
        console.error("Dispatch error:", err);
      }
      return;
    }

    // 2) Otherwise normal chat
    try {
      const res = await axios.post(
        "http://localhost:3000/home/messages/send",
        {
          conversation: props.channelId,
          message: text,
          replyTo: props.replyTo,
        },
        { withCredentials: true }
      );
      if (res.data.valid) {
        setText("");
        props.setReplyTo(null);
        props.setRepliedContent("");
      }
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isAutocompleteOpen()) {
      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp":
        case "Enter":
        case "Tab":
        case "Escape":
          e.preventDefault();
          handleAutocompleteKey(e);
          return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (!e.target.value.startsWith(`/${picked?.name}`)) {
      setPicked(null);
    }
  };

  return (
    <div className="p-3 relative">
      {props.repliedContent && (
        <div className="flex items-center bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-indigo-600/15 border-l-4 px-4 py-3 mb-3 rounded-r-2xl text-sm text-gray-200 max-w-full backdrop-blur-sm shadow-lg border-r border-t border-b border-indigo-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"></div>
          <div className="relative flex items-center w-full">
            <div className="flex items-center mr-2">
              <svg
                className="w-4 h-4 text-indigo-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </div>
            <div className="truncate flex-1">
              <span className="text-indigo-300 font-semibold text-xs uppercase tracking-wide">
                Replying to:
              </span>{" "}
              <span className="font-bold text-white drop-shadow-sm">
                {props.repliedContent}
              </span>
            </div>
            <button
              className="ml-3 text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-red-500/20 hover:border hover:border-red-500/30 transition-all duration-200 group"
              onClick={() => {
                props.setReplyTo("");
                props.setRepliedContent("");
              }}
              aria-label="Cancel reply"
              type="button"
            >
              <svg
                className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          sendMessage();
        }}
        className="w-full flex items-end bg-[#191a1d] rounded-2xl px-3 py-2 space-x-3 border border-[#2a2b2e] focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-200"
      >
        <textarea
          ref={taRef}
          value={text}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Message #channel"
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-500 rounded-lg px-2 py-1 focus:outline-none scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
          style={{ minHeight: "2rem" }}
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="flex-none p-2 rounded-xl bg-[#7289DA] hover:bg-[#5b6eae] disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 disabled:shadow-none"
        >
          <img src={sendIcon} alt="Send" className="h-4 w-4 invert" />
        </button>
      </form>
      <SlashAutocomplete
        value={text}
        onChange={setText}
        onPick={setPicked}
        textareaRef={taRef}
      />
    </div>
  );
};

export default Typer;
