import React, { useState, useEffect } from 'react';
import {
  Users,
  X,
  Copy,
  Check,
  Radio,
  Share2,
  ShieldCheck,
  RefreshCw,
  UserCheck,
  Edit3
} from 'lucide-react';
import { RealTimeSyncEngine, PeerPresence } from '../engine/sync';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncEngine: RealTimeSyncEngine;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  syncEngine,
  onShowToast
}) => {
  const [peers, setPeers] = useState<PeerPresence[]>([]);
  const [roomIdInput, setRoomIdInput] = useState(syncEngine.getRoomId());
  const [myProfile, setMyProfile] = useState(syncEngine.getPeerProfile());
  const [copiedLink, setCopiedLink] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(myProfile.name);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = syncEngine.onPeersChange((updated) => {
      setPeers(updated);
      setMyProfile(syncEngine.getPeerProfile());
    });

    return () => unsubscribe();
  }, [isOpen, syncEngine]);

  const handleCopyInviteLink = () => {
    const url = syncEngine.getShareableRoomUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    onShowToast('Collaboration link copied to clipboard', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomIdInput.trim()) return;
    syncEngine.setRoomId(roomIdInput.trim().toLowerCase());
    onShowToast(`Switched to room "${roomIdInput.trim()}"`, 'success');
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    syncEngine.setPeerName(nameInput.trim());
    setMyProfile(syncEngine.getPeerProfile());
    setEditingName(false);
    onShowToast('Updated your display name', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-2xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-stone-900">
                  Real-Time Collaboration
                </h2>
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Peer-to-peer cross-tab & multi-user synchronized editing (CRDT LWW)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* My Profile */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-2xs"
                style={{ backgroundColor: myProfile.color }}
              >
                {myProfile.avatar}
              </div>
              <div>
                {editingName ? (
                  <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="px-2 py-1 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 bg-stone-900 text-white text-xs rounded-md"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-stone-900">
                      {myProfile.name}
                    </span>
                    <span className="text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.2 rounded font-medium">
                      You
                    </span>
                  </div>
                )}
                <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                  ID: {myProfile.id}
                </p>
              </div>
            </div>

            {!editingName && (
              <button
                onClick={() => {
                  setNameInput(myProfile.name);
                  setEditingName(true);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-md transition-colors"
                title="Edit name"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Room Configuration */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Collaboration Room
            </label>
            <form onSubmit={handleJoinRoom} className="flex items-center gap-2">
              <input
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="room-name"
                className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors shadow-2xs"
              >
                Switch Room
              </button>
            </form>
          </div>

          {/* Invite Link */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Shareable Live Session Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={syncEngine.getShareableRoomUrl()}
                className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600 font-mono truncate"
              />
              <button
                onClick={handleCopyInviteLink}
                className="px-3 py-1.5 border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Peers List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-700">
                Active Participants ({peers.length})
              </label>
              <span className="text-[11px] text-stone-400">
                Auto-syncs on edit
              </span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {peers.map((peer) => {
                const isMe = peer.id === myProfile.id;
                return (
                  <div
                    key={peer.id}
                    className="p-2.5 rounded-lg border border-stone-100 bg-stone-50/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-2xs shrink-0"
                        style={{ backgroundColor: peer.color }}
                      >
                        {peer.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-stone-800">
                            {peer.name}
                          </span>
                          {isMe && (
                            <span className="text-[10px] text-stone-400 font-mono">
                              (You)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between text-xs">
          <span className="text-stone-400 text-[11px]">
            LWW Register Conflict Resolution
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
