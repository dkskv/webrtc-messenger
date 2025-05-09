import { useEffect, useState } from "react";
import { WebRTCConnection } from "../shared/lib/web-rtc-connection";
import { Button, Input, Stack } from "@mui/material";

export const Messenger: React.FC<{ connection: WebRTCConnection }> = ({
  connection,
}) => {
  const [message, setMessage] = useState("");
  const [log, setLog] = useState<string[]>([]);

  const handleSend = () => {
    connection.sendMessage(message);
    setLog((prev) => [...prev, `Sent: ${message}`]);
    setMessage("");
  };

  useEffect(() => {
    const controller = new AbortController();

    const disposeAwaiting = connection.awaitDataChannel((channel) => {
      const onMessage = (event: MessageEvent<string>) => {
        if (typeof event.data === "string") {
          setLog((prev) => [...prev, `Received: ${event.data}`]);
        } else {
          throw new Error("Invalid message type");
        }
      };

      channel.addEventListener("message", onMessage, {
        signal: controller.signal,
      });
    });

    return () => {
      disposeAwaiting();
      controller.abort();
    };
  }, [connection]);

  return (
    <>
      <h3>Messenger</h3>
      <Stack gap={2}>
        <Stack direction="row">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: "80%" }}
          />
          <Button onClick={handleSend}>Send</Button>
        </Stack>
        <Stack>
          {log.map((entry, idx) => (
            <div key={idx}>{entry}</div>
          ))}
        </Stack>
      </Stack>
    </>
  );
};
