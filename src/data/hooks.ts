import { useContext } from "react";
import { StoreContext, type StoreContextValue } from "./context";

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore 必须在 StoreProvider 内使用");
  return ctx;
}
