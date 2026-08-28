import React from 'react';
import { useSlack } from '../../hooks/useSlack';
import { Button } from '../ui/Button';
import { MessageSquare, Check, Power, AlertTriangle } from 'lucide-react';

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
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400">
        <MessageSquare className="w-3.5 h-3.5 animate-pulse" />
        Checking Slack...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {status.isConnected ? (
        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Check className="w-3.5 h-3.5" />
            Slack: {status.teamName || 'Connected'}
          </span>
          <button
            onClick={() => disconnect()}
            disabled={isDisconnecting}
            className="text-slate-400 hover:text-rose-400 transition-colors ml-1"
            title="Disconnect Slack"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnect}
            leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
          >
            Connect Slack
          </Button>
          <button
            onClick={() => mockConnect()}
            className="text-[10px] text-slate-500 hover:text-slate-300 underline"
            title="Quick dev connect without live client secret"
          >
            (Dev Connect)
          </button>
        </div>
      )}
    </div>
  );
};
