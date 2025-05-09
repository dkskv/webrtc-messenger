import { createContext } from "react";
import { AlertColor } from "@mui/material/Alert";

export const SnackbarContext = createContext<{
  showSnackbar: (message: string, severity?: AlertColor) => void;
}>({
  showSnackbar: () => {},
});
