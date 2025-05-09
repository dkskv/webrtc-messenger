import { Stack } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import {
  SignalPayload,
  WebRTCConnection,
} from "../shared/lib/web-rtc-connection";
import { ConfigOutput } from "../features/config-output";
import { ConfigInput } from "../features/config-input";
import { SnackbarContext } from "../shared/ui/snackbar";

interface Props {
  connection: WebRTCConnection;
}

export const InitiatorEstablishing: React.FC<Props> = ({ connection }) => {
  const { showSnackbar } = useContext(SnackbarContext);
  const [outputJson, setOutputJson] = useState("");

  const handleConfirmInput = async (inputJson: string): Promise<void> => {
    let payload: SignalPayload;

    try {
      payload = JSON.parse(inputJson) as SignalPayload;
    } catch {
      showSnackbar("Invalid Answer JSON", "error");

      return;
    }

    await connection.applyRemoteSignal(payload);
  };

  useEffect(() => {
    setOutputJson(JSON.stringify(connection.signalPayload));
  }, [connection]);

  return (
    <Stack gap={4}>
      <Stack alignItems="start">
        <h3>Send this config to receiver</h3>
        <ConfigOutput value={outputJson} />
      </Stack>
      <Stack alignItems="start">
        <h3>Paste answer from receiver</h3>
        <ConfigInput onConfirm={handleConfirmInput} />
      </Stack>
    </Stack>
  );
};
