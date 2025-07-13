import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";

export interface User {
  id: string;
  username: string;
  servers: string[];
  friends: string[];
  conversations: string[];
  pfp?: string;
  displayName?: string;
  bio?: string;
  xyn_id?: string;
}

interface UserContextType {
  user: User;
  setUser: Dispatch<SetStateAction<User | null>>;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
};
