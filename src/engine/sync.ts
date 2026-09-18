/**
 * Real-Time Collaborative Synchronization Engine
 * Supports zero-dependency cross-tab & multi-peer synchronization using BroadcastChannel & Room protocols.
 * Includes CRDT Last-Write-Wins (LWW) state reconciliation and presence tracking.
 */

import { VisualDensity } from './types';

export interface PeerPresence {
  id: string;
  name: string;
  color: string;
  avatar: string;
  lastActive: number;
  currentTab?: string;
}

export interface SharedInfographicState {
  markdown: string;
  theme: string;
  density: VisualDensity;
  variants: Record<string, number>;
  customTitle: string;
  customSubtitle: string;
  timestamp: number;
  senderId: string;
  version: number;
}

export type SyncEventListener = (state: SharedInfographicState) => void;
export type PeerEventListener = (peers: PeerPresence[]) => void;

const PASTEL_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316'  // orange
];

export class RealTimeSyncEngine {
  private channel: BroadcastChannel | null = null;
  private roomId: string;
  private peerId: string;
  private peerName: string;
  private peerColor: string;
  private stateListeners: Set<SyncEventListener> = new Set();
  private peerListeners: Set<PeerEventListener> = new Set();
  private knownPeers: Map<string, PeerPresence> = new Map();
  private heartbeatInterval: any = null;
  private localVersion: number = 0;
  private lastAppliedTimestamp: number = 0;
  private isConnected: boolean = false;

  constructor(roomId: string = 'default-room') {
    this.roomId = roomId;
    this.peerId = 'peer-' + Math.random().toString(36).substring(2, 9);
    this.peerColor = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
    this.peerName = 'Contributor ' + this.peerId.slice(-4);
  }

  public connect(): void {
    if (this.isConnected) return;

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(`gig-sync-${this.roomId}`);
        this.channel.onmessage = this.handleMessage.bind(this);
      }
      this.isConnected = true;

      // Announce presence
      this.sendPresence();

      // Start periodic heartbeats (every 3 seconds)
      this.heartbeatInterval = setInterval(() => {
        this.sendPresence();
        this.pruneStalePeers();
      }, 3000);
    } catch (e) {
      console.warn('RealTimeSyncEngine: BroadcastChannel not supported or failed to initialize:', e);
    }
  }

  public disconnect(): void {
    if (!this.isConnected) return;
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    
    // Broadcast leave
    this.postMessage({
      type: 'PEER_LEAVE',
      peerId: this.peerId
    });

    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.knownPeers.clear();
    this.isConnected = false;
    this.notifyPeers();
  }

  public getRoomId(): string {
    return this.roomId;
  }

  public setRoomId(newRoomId: string): void {
    if (this.roomId === newRoomId) return;
    this.disconnect();
    this.roomId = newRoomId;
    this.connect();
  }

  public getPeerProfile(): PeerPresence {
    return {
      id: this.peerId,
      name: this.peerName,
      color: this.peerColor,
      avatar: this.peerName.charAt(0),
      lastActive: Date.now()
    };
  }

  public setPeerName(name: string): void {
    this.peerName = name.trim() || this.peerName;
    this.sendPresence();
  }

  public getConnectedPeers(): PeerPresence[] {
    const peers = Array.from(this.knownPeers.values());
    return [this.getPeerProfile(), ...peers];
  }

  public onStateChange(listener: SyncEventListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  public onPeersChange(listener: PeerEventListener): () => void {
    this.peerListeners.add(listener);
    // Trigger immediately
    listener(this.getConnectedPeers());
    return () => this.peerListeners.delete(listener);
  }

  /**
   * Broadcast state changes to all peers in the room (LWW semantics)
   */
  public broadcastState(state: Omit<SharedInfographicState, 'timestamp' | 'senderId' | 'version'>): void {
    if (!this.isConnected) return;

    this.localVersion++;
    const fullState: SharedInfographicState = {
      ...state,
      timestamp: Date.now(),
      senderId: this.peerId,
      version: this.localVersion
    };

    this.lastAppliedTimestamp = fullState.timestamp;
    this.postMessage({
      type: 'STATE_UPDATE',
      state: fullState
    });
  }

  private postMessage(msg: any): void {
    try {
      if (this.channel) {
        this.channel.postMessage(msg);
      }
    } catch {}
  }

  private handleMessage(event: MessageEvent): void {
    const msg = event.data;
    if (!msg || typeof msg !== 'object') return;

    switch (msg.type) {
      case 'PRESENCE':
        if (msg.peer && msg.peer.id !== this.peerId) {
          this.knownPeers.set(msg.peer.id, {
            ...msg.peer,
            lastActive: Date.now()
          });
          this.notifyPeers();
        }
        break;

      case 'PEER_LEAVE':
        if (msg.peerId && this.knownPeers.has(msg.peerId)) {
          this.knownPeers.delete(msg.peerId);
          this.notifyPeers();
        }
        break;

      case 'STATE_UPDATE':
        if (msg.state && msg.state.senderId !== this.peerId) {
          // LWW check: only apply if newer than last applied timestamp
          if (msg.state.timestamp > this.lastAppliedTimestamp) {
            this.lastAppliedTimestamp = msg.state.timestamp;
            this.localVersion = Math.max(this.localVersion, msg.state.version);
            this.notifyState(msg.state);
          }
        }
        break;
    }
  }

  private sendPresence(): void {
    this.postMessage({
      type: 'PRESENCE',
      peer: this.getPeerProfile()
    });
  }

  private pruneStalePeers(): void {
    const now = Date.now();
    let changed = false;
    for (const [id, peer] of this.knownPeers.entries()) {
      if (now - peer.lastActive > 9000) { // 9 seconds without heartbeat
        this.knownPeers.delete(id);
        changed = true;
      }
    }
    if (changed) this.notifyPeers();
  }

  private notifyPeers(): void {
    const peers = this.getConnectedPeers();
    this.peerListeners.forEach((fn) => {
      try { fn(peers); } catch {}
    });
  }

  private notifyState(state: SharedInfographicState): void {
    this.stateListeners.forEach((fn) => {
      try { fn(state); } catch {}
    });
  }

  public getShareableRoomUrl(): string {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('room', this.roomId);
    return url.toString();
  }
}
