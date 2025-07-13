import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import axios from "axios";

interface Props {
  channelId: string;
  messageId: string;
  initialText: string;
  onCancel: () => void;
  onEdited: () => void;
}

const EditMessage = (props: Props) => {
  const [text, setText] = useState(props.initialText);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  const submitEdit = async () => {
    setError(null);
    try {
      if (!props.channelId) return;
      const response = await axios.post(
        "http://localhost:3000/home/messages/edit",
        {
          conversation: props.channelId,
          messageId: props.messageId,
          message: text,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.valid) {
        props.onEdited();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message);
      } else {
        setError("Network Error");
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitEdit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      props.onCancel();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#23232a] border border-[#36373a] shadow-xl rounded-2xl p-4 flex flex-col items-stretch">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        rows={3}
        className="w-full resize-none bg-[#191a1d] text-sm text-white placeholder-gray-500 rounded-xl px-4 py-3 border border-[#36373a] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[60px]"
      />
      <div className="text-xs text-gray-400 mt-2 mb-1 select-none">
        Press <span className="font-semibold text-indigo-300">Enter</span> to
        save, <span className="font-semibold text-indigo-300">Esc</span> to
        cancel
      </div>
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-2 text-sm">
          {error}
        </div>
      )}
      <div className="mt-2 flex gap-3 justify-end">
        <button
          type="button"
          onClick={props.onCancel}
          className="px-5 py-2 rounded-full bg-[#36373a] text-gray-200 font-semibold hover:bg-[#23232a] transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submitEdit}
          disabled={!text.trim()}
          className="px-5 py-2 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default EditMessage;
