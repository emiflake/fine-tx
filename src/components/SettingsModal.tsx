import React, { useMemo } from "react";
import { ogmiosURL } from "../ogmios";
import { betterfrostURL, useLatestBlock } from "../betterfrost";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { data: latestBlock, isLoading: latestBlockLoading, isError: latestBlockError } = useLatestBlock();

  const betterfrostConnectionState = useMemo(() => {
    if (latestBlockLoading) return "loading";
    if (latestBlockError) return "error";
    return latestBlock !== undefined ? "connected" : "error";
  }, [latestBlock, latestBlockLoading, latestBlockError]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-transparent bg-opacity-50" onClick={onClose}>
      <div className="bg-white p-5 rounded-md shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold mb-4">Settings</h2>
          <p className="text-gray-500">Current settings:</p>
          <div className="flex flex-col">
            <label htmlFor="ogmios-url">Ogmios URL:</label>
            <input
              type="text"
              id="ogmios-url"
              value={ogmiosURL}
              disabled
              className="border rounded p-2 bg-gray-100 text-gray-500"
              title="This is disabled because it is set in the environment"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="betterfrost-url">Betterfrost URL:</label>
            <input
              type="text"
              id="betterfrost-url"
              value={betterfrostURL}
              disabled
              className="border rounded p-2 bg-gray-100 text-gray-500"
              title="This is disabled because it is set in the environment"
            />
            <ConnectionState connectionState={betterfrostConnectionState} />
          </div>
          <button
            onClick={onClose}
            className="mt-4 border px-4 py-2 rounded text-sm text-indigo-500 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ConnectionState = ({ connectionState }: { connectionState: 'connected' | 'loading' | 'error' }) => {
  if (connectionState === "connected") {
    return <span className="text-green-800">Connected</span>;
  } else if (connectionState === "loading") {
    return (
      <div className="p-2 gap-2 text-gray-500 flex items-center">
        <Spinner /> 
        Loading
      </div>
    );
  } else {
    return <span className="text-red-800">Not connected</span>;
  }
};

const Spinner = () => {
  return (
    <div className="p-4 animate-spin w-4 h-4 border-b-2 border-gray-500 rounded-full"></div>
  );
};  