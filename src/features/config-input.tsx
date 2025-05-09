import {
  RadioGroup,
  FormControlLabel,
  Radio,
  TextareaAutosize,
  Button,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { QrScanner } from "../shared/ui/qr-scanner";

export const ConfigInput = ({
  onConfirm,
}: {
  onConfirm: (value: string) => void;
}) => {
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<"text" | "qr">("text");

  return (
    <Stack>
      <RadioGroup
        row
        value={mode}
        onChange={(e) => setMode(e.target.value as typeof mode)}
      >
        <FormControlLabel value="text" control={<Radio />} label="Paste" />
        <FormControlLabel value="qr" control={<Radio />} label="Read QR-code" />
      </RadioGroup>
      {mode === "text" && (
        <>
          <TextareaAutosize
            value={value}
            onChange={(e) => setValue(e.target.value)}
            minRows={3}
            maxRows={3}
          />
          <Button
            disabled={value.length === 0}
            onClick={() => onConfirm(value)}
          >
            Confirm
          </Button>
        </>
      )}
      {mode === "qr" && (
        <QrScanner
          onSuccess={(text) => {
            setValue(text);
            setMode("text");
          }}
          onCancel={() => setMode("text")}
        />
      )}
    </Stack>
  );
};
