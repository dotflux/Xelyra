import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { useParams } from "react-router-dom";

export interface SlashOption {
  name: string;
  type: string;
  description: string;
  required: boolean;
  app_name: string;
}
export interface SlashCommand {
  name: string;
  description: string | null;
  app_id: string;
  app_name: string;
  options: SlashOption[];
}

export type PickedCommand = { name: string; app_id: string };

// helpers for Typer → autodetect open & forward keys
let _isOpen = false;
let _handler: (e: KeyboardEvent) => void = () => {};
export function isOpen() {
  return _isOpen;
}
export function handleKey(e: KeyboardEvent) {
  _handler(e);
}

export default function SlashAutocomplete({
  value,
  onChange,
  onPick,
  textareaRef,
}: {
  value: string;
  onChange: (v: string) => void;
  onPick: (cmd: PickedCommand) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const { id: serverId } = useParams();
  const [cmds, setCmds] = useState<SlashCommand[]>([]);
  const [opts, setOpts] = useState<SlashOption[]>([]);
  const [cursor, setCursor] = useState(0);
  const commandsRef = useRef<SlashCommand[]>([]);

  // detect “/cmd” vs “/cmd args…”
  const m = value.match(/^\/(\w*)(?:\s+(.+))?$/);
  const typingCmd = !!m && !value.includes(" ");
  const pickedName = m && m[1] && value.includes(" ") ? m[1] : null;

  // 1) fetch commands from backend
  const fetchCmds = useCallback(
    async (q: string) => {
      const { data } = await axios.post(
        `http://localhost:3000/developer/servers/${serverId}`,
        { search: q, limit: 10, offset: 0 },
        { withCredentials: true }
      );
      return data.commands as SlashCommand[];
    },
    [serverId]
  );

  // 2) debounced loader
  const load = useRef(
    debounce(async (q: string) => {
      const list = await fetchCmds(q);
      commandsRef.current = list;
      setCmds(list);
      setCursor(0);
    }, 100)
  ).current;

  // 3) switch between command‐list vs option‐list
  useEffect(() => {
    if (typingCmd) {
      load(value.slice(1));
      setOpts([]);
    } else if (pickedName) {
      const cmd = commandsRef.current.find((c) => c.name === pickedName);
      setOpts(cmd?.options ?? []);
      setCursor(0);
    } else {
      setCmds([]);
      setOpts([]);
      setCursor(0);
    }
  }, [value, typingCmd, pickedName, load]);

  // 4) track open/closed
  useEffect(() => {
    _isOpen = (typingCmd ? cmds.length : opts.length) > 0;
  }, [typingCmd, cmds.length, opts.length]);

  // --- Option filtering logic ---
  // Parse the input to find already-used options (e.g., /forward time name)
  let usedOptions: string[] = [];
  if (pickedName && value.includes(" ")) {
    // Get everything after the command name
    const afterCmd = value.slice(value.indexOf(" ") + 1);
    // Match option names (e.g., time:foo name:bar)
    usedOptions = Array.from(afterCmd.matchAll(/(\w+):/g)).map((m) => m[1]);
  }

  // Filter out already-used options
  const filteredOpts = opts.filter((opt) => !usedOptions.includes(opt.name));
  const list = typingCmd ? cmds : filteredOpts;
  const isCommandList = typingCmd && cmds.length > 0;
  const isOptionList = !typingCmd && pickedName && filteredOpts.length > 0;
  if (!list.length) return null;

  // 5) keyboard nav & pick
  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, list.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        pick(list[cursor]);
        break;
      case "Escape":
        setCmds([]);
        setOpts([]);
        break;
    }
  };
  _handler = onKeyDown;

  // 6) when you pick…
  function pick(item: SlashCommand | SlashOption) {
    const ta = textareaRef.current!;
    const before = ta.value.slice(0, ta.selectionStart);
    const after = ta.value.slice(ta.selectionStart);

    if ("options" in item) {
      // picked a command
      onChange(`/${item.name} `);
      onPick({ name: item.name, app_id: item.app_id });
    } else {
      // picked an option
      // Find the last partial word (\w*) before the cursor
      const match = before.match(/(?:^| )([\w]*)$/);
      const partial = match ? match[1] : "";
      const prefix = ` ${item.name}:`;
      // Replace the partial word with the option name
      let newBefore = before;
      if (partial) {
        newBefore =
          before.slice(0, before.length - partial.length) + item.name + ":";
      } else {
        newBefore = before + item.name + ":";
      }
      // Ensure a space after the colon if not already present
      let newAfter = after;
      if (!after.startsWith(" ")) {
        newBefore += " ";
      }
      onChange(newBefore + newAfter);
      // restore caret
      setTimeout(() => {
        const pos = newBefore.length;
        ta.setSelectionRange(pos, pos);
        ta.focus();
      }, 0);
    }
    setCmds([]);
    setOpts([]);
  }

  // --- Styling ---
  // We'll use a portal-like approach: render the dropdown inside a relatively positioned parent (Typer)
  // and anchor it just above the input box.
  // We'll use max-w-md, rounded-xl, shadow-xl, border, and Discord-like colors.

  return (
    <div
      className="absolute left-0 right-0 bottom-14 flex flex-col items-start z-50 pointer-events-none w-full"
      style={{ paddingLeft: 8, paddingRight: 8 }}
    >
      {isCommandList && (
        <div
          className="w-full bg-[#23232b] border border-[#363646] rounded-2xl shadow-xl max-h-60 overflow-y-auto mt-2 pointer-events-auto"
          style={{
            minWidth: 260,
            borderRadius: 18,
            boxShadow: "0 8px 32px 0 rgba(0,0,0,0.25)",
          }}
        >
          {cmds.map((it, i) => (
            <div
              key={it.name}
              className={`px-4 py-2 flex justify-between items-center cursor-pointer transition-colors duration-100 select-none
                ${
                  i === cursor
                    ? "bg-[#363646] text-white"
                    : "text-gray-300 hover:bg-[#23232b]/80"
                }
              `}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(it);
              }}
            >
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base text-indigo-300">
                  /{it.name}
                </span>
                {it.options.map((opt) => (
                  <span
                    key={opt.name}
                    className="px-2 py-0.5 bg-[#35354a] text-xs rounded-full text-indigo-200 border border-[#44445a]"
                  >
                    {opt.name}
                  </span>
                ))}
                <span className="ml-2 text-xs text-gray-400 max-w-[180px] truncate">
                  {it.description}
                </span>
              </div>
              <span className="text-xs text-gray-500 ml-2 font-mono">
                {it.app_name}
              </span>
            </div>
          ))}
        </div>
      )}
      {isOptionList && (
        <div
          className="w-full bg-[#18181f] border border-[#363646] rounded-2xl shadow-lg max-h-40 overflow-y-auto mt-2 pointer-events-auto"
          style={{
            minWidth: 220,
            borderRadius: 18,
            boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
          }}
        >
          {filteredOpts.map((opt, i) => (
            <div
              key={opt.name}
              className={`px-4 py-2 flex items-center cursor-pointer transition-colors duration-100 select-none
                ${
                  i === cursor
                    ? "bg-[#23232b] text-white"
                    : "text-gray-300 hover:bg-[#23232b]/80"
                }
              `}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(opt);
              }}
            >
              <span className="font-semibold text-indigo-200">{opt.name}</span>
              <span className="ml-2 text-xs text-gray-400 truncate">
                {opt.description}
              </span>
              {opt.required && (
                <span className="ml-2 px-2 py-0.5 bg-[#2e2e3a] text-xs rounded-full text-pink-300 border border-[#44445a]">
                  required
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
