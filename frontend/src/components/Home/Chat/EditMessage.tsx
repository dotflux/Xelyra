import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import axios from "axios";

interface Props {
  channelId: string;
  messageId: string; // your created_at or id, depending on endpoint
  initialText: string;
  onCancel: () => void; // to exit edit mode
  onEdited: () => void; // callback after successful edit to refresh UI
}

const EditMessage = (props: Props) => {
  const [text, setText] = useState(props.initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // focus & select all text on mount
  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  const submitEdit = async () => {
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
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
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
    <div className="w-full bg-[#191a1d] px-3 py-2 rounded-md">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        rows={2}
        className="w-full resize-none bg-transparent text-sm text-white placeholder-gray-500 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />

      <div className="mt-2 flex space-x-4">
        <button
          type="button"
          onClick={props.onCancel}
          className="text-sm text-blue-500 hover:underline"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submitEdit}
          disabled={!text.trim()}
          className="text-sm text-blue-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default EditMessage;
