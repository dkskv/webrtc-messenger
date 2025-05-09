import {
  RadioGroup,
  FormControlLabel,
  Radio,
  TextareaAutosize,
  Button,
  Stack,
} from "@mui/material";
import { useContext, useState } from "react";
import QRCode from "react-qr-code";
import { SnackbarContext } from "../shared/ui/snackbar";

export const ConfigOutput = ({ value }: { value: string }) => {
  const { showSnackbar } = useContext(SnackbarContext);
  const [mode, setMode] = useState<"text" | "qr">("text");

  const copyConfigToClipboard = async () => {
    await navigator.clipboard.writeText(value);
    showSnackbar("Config copied to clipboard");
  };

  return (
    <Stack>
      <RadioGroup
        row
        value={mode}
        onChange={(e) => setMode(e.target.value as typeof mode)}
      >
        <FormControlLabel value="text" control={<Radio />} label="Copy" />
        <FormControlLabel value="qr" control={<Radio />} label="Show QR-code" />
      </RadioGroup>
      {mode === "text" && (
        <>
          <TextareaAutosize value={value} readOnly minRows={3} maxRows={3} />
          <Button disabled={value.length === 0} onClick={copyConfigToClipboard}>
            Copy
          </Button>
        </>
      )}
      {mode === "qr" && <QRCode value={value} level="L" />}
    </Stack>
  );
};
