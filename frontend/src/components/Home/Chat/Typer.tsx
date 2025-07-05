import { useState, type KeyboardEvent, type FormEvent } from "react";
import sendIcon from "../../../assets/angleRight.svg";
import axios from "axios";

interface Props {
  channelId: string | null;
  replyTo: string | null;
  repliedContent: string;
  setReplyTo: React.Dispatch<React.SetStateAction<string | null>>;
  setRepliedContent: React.Dispatch<React.SetStateAction<string>>;
}

const Typer = (props: Props) => {
  const [text, setText] = useState("");
  const sendMessage = async () => {
    try {
      if (!props.channelId) return;
      const response = await axios.post(
        "http://localhost:3000/home/messages/send",
        {
          conversation: props.channelId,
          message: text,
          replyTo: props.replyTo,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        setText("");
        props.setReplyTo(null);
        props.setRepliedContent("");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  return (
    <div>
      {props.repliedContent && (
        <div className="flex items-center bg-[#23272a] border-l-4 border-[#5865f2] px-3 py-2 mb-1 rounded-t text-xs text-gray-200 max-w-full">
          <div className="truncate flex-1">
            Replying to:{" "}
            <span className="font-semibold text-white">
              {props.repliedContent}
            </span>
          </div>
          <button
            className="ml-2 text-gray-400 hover:text-white text-lg font-bold px-2"
            onClick={() => {
              props.setReplyTo("");
              props.setRepliedContent("");
            }}
            aria-label="Cancel reply"
            type="button"
          >
            ×
          </button>
        </div>
      )}
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          sendMessage();
        }}
        className="w-full flex items-start bg-[#191a1d] px-3 py-2 space-x-2 mb-[1px]"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message #channel"
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-500 rounded-md px-3 py-2 focus:outline-none scroll-hide"
          style={{ minHeight: "2.5rem" }}
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="flex-none p-2 rounded-full bg-[#7289DA] hover:bg-[#5b6eae] disabled:bg-gray-700 disabled:cursor-not-allowed transition"
        >
          <img src={sendIcon} alt="Send" className="h-4 w-4 invert" />
        </button>
      </form>
    </div>
  );
};

export default Typer;
