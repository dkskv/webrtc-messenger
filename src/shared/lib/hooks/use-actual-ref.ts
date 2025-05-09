import { useRef } from "react";

export const useActualRef = <T>(value: T) => {
  const ref = useRef(value);
  ref.current = value;

  return ref;
};
