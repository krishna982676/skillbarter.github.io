import { useEffect, useMemo, useState } from "react";

export function useConnectionState(channelName = "connection-state-room") {
  const [isConnected, setIsConnected] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    setIsConnected(true);
    setIsReconnecting(false);
    return () => {};
  }, [channelName]);

  return useMemo(() => ({ isConnected, isReconnecting }), [isConnected, isReconnecting]);
}
