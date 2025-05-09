import { useContext, useState } from "react";
import { WebRTCConnection } from "../shared/lib/web-rtc-connection";
import { Stack } from "@mui/material";
import { ConfigOutput } from "../features/config-output";
import { ConfigInput } from "../features/config-input";
import { SnackbarContext } from "../shared/ui/snackbar";

interface Props {
  connection: WebRTCConnection;
}

export const ReceiverEstablishing: React.FC<Props> = ({ connection }) => {
  const { showSnackbar } = useContext(SnackbarContext);
  const [outputJson, setOutputJson] = useState("");

  const handleConfirmInput = async (inputJson: string): Promise<void> => {
    try {
      await connection.applyRemoteSignal(JSON.parse(inputJson));
      await connection.accept();
      setOutputJson(JSON.stringify(connection.signalPayload, null, 2));
    } catch {
      showSnackbar("Invalid JSON", "error");
    }
  };

  const isOfferAccepted = !!connection.localDescription;

  return (
    <Stack alignItems="start">
      {isOfferAccepted ? (
        <>
          <h3>Send this config to initiator</h3>
          <ConfigOutput value={outputJson} />
        </>
      ) : (
        <>
          <h3>Paste offer config</h3>
          <ConfigInput onConfirm={handleConfirmInput} />
        </>
      )}
    </Stack>
  );
};
