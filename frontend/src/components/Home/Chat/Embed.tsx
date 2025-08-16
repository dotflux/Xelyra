import React from "react";

// Simple markdown parser for *italic* and **bold**
function parseMessageFormatting(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      // Bold
      result.push(
        <span key={match.index} className="font-bold text-white">
          {match[1]}
        </span>
      );
    } else if (match[2]) {
      // Italic
      result.push(
        <span key={match.index} className="italic text-gray-300">
          {match[2]}
        </span>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
}

interface EmbedField {
  name: string;
  value: string;
}

interface EmbedProps {
  title?: string;
  description?: string;
  color?: string;
  image?: string;
  fields?: EmbedField[];
}

const Embed: React.FC<EmbedProps> = ({
  title,
  description,
  color = "#7f5cff",
  image,
  fields,
}) => {
  return (
    <div
      className="my-1 rounded-lg shadow border border-[#23232a] bg-[#18191c] overflow-hidden flex flex-col max-w-xl min-w-[180px] w-fit"
      style={{ borderLeft: `6px solid ${color}` }}
    >
      <div className="p-3 flex flex-col gap-1">
        {title && (
          <div
            className="text-base font-bold text-white mb-0.5 truncate"
            title={title}
            style={{ wordBreak: "break-word", whiteSpace: "pre-line" }}
          >
            {title}
          </div>
        )}
        {description && (
          <div
            className="text-gray-200 whitespace-pre-line text-xs mb-1"
            style={{ wordBreak: "break-word" }}
          >
            {parseMessageFormatting(description)}
          </div>
        )}
        {fields && fields.length > 0 && (
          <div className="grid grid-cols-1 gap-1 mt-1">
            {fields.map((field, idx) => (
              <div key={idx} className="flex flex-col">
                <span
                  className="text-xs font-bold text-white mb-0.5 truncate"
                  title={field.name}
                  style={{ wordBreak: "break-word" }}
                >
                  {field.name}
                </span>
                <span
                  className="text-gray-300 text-xs whitespace-pre-line"
                  style={{ wordBreak: "break-word" }}
                >
                  {parseMessageFormatting(field.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {image && (
        <div className="w-full flex bg-[#191a1d] p-2 border-t border-[#23232a]">
          <img
            src={image}
            alt="Embed visual"
            className="rounded object-contain mx-auto"
            style={{ maxWidth: "100%", maxHeight: "160px", display: "block" }}
          />
        </div>
      )}
    </div>
  );
};

export default Embed;
