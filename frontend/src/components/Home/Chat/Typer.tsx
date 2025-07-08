import { useState, type KeyboardEvent, type FormEvent, useRef } from "react";
import sendIcon from "../../../assets/angleRight.svg";
import fileIcon from "../../../assets/file.svg";
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
  repliedSenderType?: string | null;
  channelName?: string;
  channelType?: string;
  alwaysTriggerAI?: boolean;
}

const Typer = (props: Props) => {
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<PickedCommand | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [thinking, setThinking] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!props.channelId || !text.trim()) return;

    // Command dispatch logic
    if (picked && text.startsWith(`/${picked.name}`)) {
      // Parse options from the message text
      const options: { name: string; value: string }[] = [];
      const afterCmd = text.slice(picked.name.length + 2); // skip '/cmd '
      // Match optionName:value pairs
      afterCmd.replace(/(\w+):([^\s]+)/g, (match, key, value) => {
        options.push({ name: key, value });
        return match;
      });
      try {
        const res = await axios.post(
          `http://localhost:3000/developer/applications/${picked.app_id}/commands/dispatch`,
          {
            command: picked.name,
            channelId: props.channelId,
            options,
          },
          { withCredentials: true }
        );
        if (res.data.valid) {
          setText("");
          setPicked(null);
          props.setReplyTo(null);
          props.setRepliedContent("");
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.error(
            "Command dispatch error:",
            err.response?.data || err.message
          );
        } else {
          console.error("Command dispatch error:", err);
        }
      }
      return;
    }

    const isAIMentioned = /@Xyn\b/i.test(text);
    const shouldTriggerAI =
      props.alwaysTriggerAI ||
      isAIMentioned ||
      props.repliedSenderType === "ai";
    const formData = new FormData();
    formData.append("message", text);
    formData.append("conversation", props.channelId);
    if (props.replyTo) formData.append("replyTo", props.replyTo);
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await axios.post(
        "http://localhost:3000/home/messages/send",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (res.data.valid) {
        setText("");
        setSelectedFiles([]);
        props.setReplyTo(null);
        props.setRepliedContent("");

        if (shouldTriggerAI && res.data.messageId) {
          setThinking(true);
          try {
            await axios.post(
              "http://localhost:3000/api/genai/message",
              {
                message: text,
                conversation: props.channelId,
                replyTo: res.data.messageId,
                files: res.data.files,
              },
              { withCredentials: true }
            );
          } finally {
            setThinking(false);
          }
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Send error:", err.response?.data || err.message);
      } else {
        console.error("Send error:", err);
      }
      setThinking(false);
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
      {thinking && (
        <div className="mb-2 text-indigo-300 text-xs font-semibold animate-pulse">
          Xyn is thinking...
        </div>
      )}
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
      {/* File preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center bg-gradient-to-br from-gray-800/80 to-gray-700/70 border border-gray-700/60 shadow-sm px-3 py-1.5 rounded-lg text-xs text-gray-200 backdrop-blur-md min-w-0 max-w-xs"
              style={{ minWidth: 0 }}
            >
              <img
                src={fileIcon}
                alt="file"
                className="w-4 h-4 mr-2 opacity-80"
              />
              <span
                className="font-semibold truncate max-w-[90px] mr-2"
                title={file.name}
              >
                {file.name}
              </span>
              <span className="bg-gray-900/60 text-gray-300 px-2 py-0.5 rounded-full text-[11px] mr-2 border border-gray-700/40">
                {(file.size / 1024).toFixed(1)} KB
              </span>
              <button
                onClick={() => removeFile(idx)}
                className="ml-1 text-red-400 hover:text-white hover:bg-red-500/70 rounded-full w-6 h-6 flex items-center justify-center transition-all duration-150"
                title="Remove file"
                style={{ minWidth: 0 }}
              >
                <span className="text-base">&times;</span>
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Hidden file input for file uploads */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition"
          onClick={handleFileButtonClick}
          title="Attach file"
        >
          <img src={fileIcon} alt="Attach" className="w-5 h-5" />
        </button>
        <textarea
          ref={taRef}
          className="flex-1 resize-none bg-[#23232a] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-sm shadow"
          rows={1}
          value={text}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={
            props.channelName
              ? props.channelType === "voice"
                ? `Message in ${props.channelName}`
                : `Message #${props.channelName}`
              : "Message..."
          }
        />
        <button
          type="button"
          className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-700 rounded transition"
          onClick={sendMessage}
          title="Send"
        >
          <img src={sendIcon} alt="Send" className="w-5 h-5" />
        </button>
      </div>
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
