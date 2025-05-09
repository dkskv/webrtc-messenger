import { useCallback, useMemo, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert, { AlertColor } from "@mui/material/Alert";
import { SnackbarContext } from "./snackbar-context";

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("info");

  const showSnackbar = useCallback(
    (message: string, severity: AlertColor = "info") => {
      setMessage(message);
      setSeverity(severity);
      setOpen(true);
    },
    []
  );

  const contextValue = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
