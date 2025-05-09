import { useContext, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@mui/material";
import { SnackbarContext } from "../snackbar";
import { useActualRef } from "../../lib/hooks/use-actual-ref";
import "./styles.css";

interface Props {
  onSuccess: (decodedText: string) => void;
  onCancel: () => void;
}

export const QrScanner: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const { showSnackbar } = useContext(SnackbarContext);
  const containerId = "qr-reader-container";
  const onSuccessRef = useActualRef(onSuccess);

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);

    const didStart = scanner
      .start(
        { facingMode: "environment" },
        { fps: 10 },
        (text) => onSuccessRef.current(text),
        () => {}
      )
      .catch((error) => {
        showSnackbar(`QR scanner failed: ${error}`, "error");
        onCancel();
      });

    return () => {
      didStart.then(() => scanner.stop());
    };
  }, []);

  return (
    <div className="container">
      <div id={containerId} />
      <div className="button-container">
        <Button variant="contained" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
