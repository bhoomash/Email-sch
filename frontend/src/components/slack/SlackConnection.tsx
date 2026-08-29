import React from 'react';
import { useSlack } from '../../hooks/useSlack';
import { Button } from '../ui/Button';
import { FiMessageSquare, FiCheck, FiPower } from 'react-icons/fi';

export const SlackConnection: React.FC = () => {
  const { status, isLoading, getConnectUrl, mockConnect, disconnect, isDisconnecting } = useSlack();

  const handleConnect = async () => {
    try {
      const res = await getConnectUrl();
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      // Fallback to dev mock connect if real API keys aren't set
      await mockConnect();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f4f6f4] border border-gray-300 rounded-none text-xs text-gray-500 font-medium">
        <FiMessageSquare className="w-3.5 h-3.5 animate-pulse text-[#00a854]" />
        Checking Slack...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {status.isConnected ? (
        <div className="flex items-center gap-2 bg-[#e6f4ea] border border-emerald-300 px-3 py-1.5 rounded-none text-xs">
          <span className="flex items-center gap-1.5 text-emerald-950 font-bold">
            <FiCheck className="w-3.5 h-3.5 text-[#00a854]" />
            Slack: {status.teamName || 'Connected'}
          </span>
          <button
            onClick={() => disconnect()}
            disabled={isDisconnecting}
            className="text-gray-400 hover:text-rose-600 transition-colors ml-1"
            title="Disconnect Slack"
          >
            <FiPower className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnect}
            leftIcon={<FiMessageSquare className="w-3.5 h-3.5 text-[#00a854]" />}
          >
            Connect Slack
          </Button>
          <button
            onClick={() => mockConnect()}
            className="text-[10px] text-gray-400 hover:text-gray-700 underline font-medium"
            title="Quick dev connect without live client secret"
          >
            (Dev Connect)
          </button>
        </div>
      )}
    </div>
  );
};

