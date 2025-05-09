import React, { useEffect, useState } from "react";
import { WebRTCConnection } from "../shared/lib/web-rtc-connection";
import { ReceiverEstablishing } from "../widgets/receiver-establishing";
import { Button, Stack } from "@mui/material";
import { InitiatorEstablishing } from "../widgets/initiator-establishing";
import { Messenger } from "../widgets/messenger";

export const MainPage: React.FC = () => {
  const connection = useState(() => new WebRTCConnection())[0];

  const [mode, setMode] = useState<
    | "role-selection"
    | "initiator-establishing"
    | "receiver-establishing"
    | "connected"
  >("role-selection");

  useEffect(() => {
    const dispose = connection.awaitDataChannelOpen(() => {
      setMode("connected");
    });

    return dispose;
  }, [connection]);

  if (mode === "role-selection") {
    return (
      <Stack direction="row">
        <Button
          onClick={async () => {
            await connection.initiate();
            setMode("initiator-establishing");
          }}
        >
          Initiate Connection
        </Button>
        <Button
          onClick={() => {
            setMode("receiver-establishing");
          }}
        >
          Receive Connection
        </Button>
      </Stack>
    );
  }

  if (mode === "connected") {
    return <Messenger connection={connection} />;
  }

  if (mode === "initiator-establishing") {
    return <InitiatorEstablishing connection={connection} />;
  }

  if (mode === "receiver-establishing") {
    return <ReceiverEstablishing connection={connection} />;
  }
};
