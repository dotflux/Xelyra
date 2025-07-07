import botIcon from "../../../assets/botIcon.svg";
import { useParams } from "react-router-dom";
import axios from "axios";

interface BotInfo {
  bot_id: string;
}

interface Props {
  setBotInfo: React.Dispatch<React.SetStateAction<BotInfo | null>>;
}

const AppBotCreate = (props: Props) => {
  const { id } = useParams();
  const createBot = async () => {
    if (!id) return;
    try {
      const res = await axios.post(
        `http://localhost:3000/developer/applications/${id}/bots/create`,
        {},
        { withCredentials: true }
      );
      if (res.data.valid) {
        props.setBotInfo(res.data.botInfo);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };
  return (
    <div className="h-full flex flex-col px-4">
      {/* Top heading and intro text */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white font-bold text-2xl">Create Bot</h1>
        <button
          className="rounded-lg text-sm font-medium shadow-sm transition-all duration-150 cursor-pointer bg-blue-600 flex items-end justify-end ml-auto px-4 py-2 text-white"
          onClick={createBot}
        >
          Create Bot
        </button>
      </div>

      <p className="text-gray-400 text-xl font-medium mb-4">
        This app has no bot as of now. Would you like to create one?
      </p>

      {/* Centered icon + description */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <img src={botIcon} className="w-32 h-32" />
        <p className="text-gray-400 text-lg max-w-md">
          Apps can use bots. Bots are automated users that can interact with
          servers programmatically.
        </p>
      </div>
    </div>
  );
};

export default AppBotCreate;
