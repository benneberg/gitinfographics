import { describe, it, expect } from 'vitest';
import { RealTimeSyncEngine } from '../sync';

describe('RealTimeSyncEngine', () => {
  it('initializes with a valid peer profile and pastel avatar', () => {
    const engine = new RealTimeSyncEngine('test-room-1');
    const profile = engine.getPeerProfile();

    expect(profile.id).toMatch(/^peer-/);
    expect(profile.name).toContain('Contributor');
    expect(profile.color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(engine.getRoomId()).toBe('test-room-1');
  });

  it('allows changing peer display name', () => {
    const engine = new RealTimeSyncEngine('test-room-2');
    engine.setPeerName('Alice Engineer');
    expect(engine.getPeerProfile().name).toBe('Alice Engineer');
  });

  it('generates shareable room URL', () => {
    const engine = new RealTimeSyncEngine('collab-alpha');
    const url = engine.getShareableRoomUrl();
    expect(url).toBeDefined();
  });
});
