import {
  createContext,
  use,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type StrikerContextType = {
  count: number;
  setCount: Dispatch<SetStateAction<number>>;
};

const StrikerContext = createContext<StrikerContextType | null>(null);

export function StrikersCountProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  return <StrikerContext value={{ count, setCount }}>{children}</StrikerContext>;
}

export function useStrikersCount() {
  const context = use(StrikerContext);

  if (!context) {
    throw new Error("useStrikersCount must be used within a StrikersCountProvider");
  }

  return context;
}
