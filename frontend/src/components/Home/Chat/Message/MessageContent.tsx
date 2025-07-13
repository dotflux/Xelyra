import React from "react";
import { parseFullMessage } from "../../../../utils/messageFormatting";
import Embed from "../Embed";

interface MessageContentProps {
  message: string;
  edited: boolean;
  files?: any[];
  embeds?: string[] | object[];
  imageDims: { [key: number]: { width: number; height: number } };
  setImageDims: React.Dispatch<
    React.SetStateAction<{ [key: number]: { width: number; height: number } }>
  >;
}

const BACKEND_URL = "http://localhost:3000";

const MessageContent: React.FC<MessageContentProps> = ({
  message,
  edited,
  files = [],
  embeds = [],
  imageDims,
  setImageDims,
}) => (
  <>
    <div className="max-w-full sm:max-w-[75%] text-sm text-gray-200 whitespace-pre-wrap break-words overflow-x-hidden">
      {parseFullMessage(message)}
      {edited && <span className="text-gray-400 text-xs ml-1">(edited)</span>}
    </div>
    {Array.isArray(files) && files.length > 0 && (
      <div className="mt-2 flex flex-col gap-2">
        {files.map((file: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2">
            {file.type.startsWith("image/") ? (
              <a
                href={`${BACKEND_URL}${file.url}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={`${BACKEND_URL}${file.url}`}
                  alt={file.filename}
                  className="rounded shadow border border-gray-700 w-full max-w-[600px] h-auto max-h-[400px]"
                  style={{ display: "block" }}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setImageDims((dims) => ({
                      ...dims,
                      [idx]: {
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                      },
                    }));
                  }}
                />
                <span className="ml-2 text-xs text-gray-400">
                  {imageDims[idx]
                    ? `${imageDims[idx].width}×${imageDims[idx].height}px, `
                    : ""}
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </a>
            ) : (
              <div className="flex items-center bg-gray-800/80 px-4 py-2 rounded-lg border border-gray-700 shadow max-w-[400px]">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-100 font-semibold truncate">
                    {file.originalname || file.filename}
                  </div>
                  <div className="text-xs text-gray-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <a
                  href={`${BACKEND_URL}${file.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 flex items-center px-2 py-1 bg-blue-700 hover:bg-blue-800 text-white text-xs rounded transition-colors duration-150 font-bold"
                  download
                  title="Download file"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                    />
                  </svg>
                  Download
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
    {Array.isArray(embeds) && embeds.length > 0 && (
      <div className="mt-2 flex flex-col gap-2">
        {embeds.map((embed: string | object, idx: number) => {
          let parsed: any = embed;
          if (typeof embed === "string") {
            try {
              parsed = JSON.parse(embed);
            } catch {
              return null;
            }
          }
          if (!parsed || typeof parsed !== "object") return null;
          return <Embed key={idx} {...parsed} />;
        })}
      </div>
    )}
  </>
);

export default MessageContent;
