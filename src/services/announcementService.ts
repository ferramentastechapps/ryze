// ============================================================
// RYZE — Global Announcement Broadcast Service
// ============================================================

export interface GlobalAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  active: boolean;
  createdAt: string;
}

const ANNOUNCEMENT_KEY = 'ryze_global_announcement';

export function getGlobalAnnouncement(): GlobalAnnouncement | null {
  try {
    const raw = localStorage.getItem(ANNOUNCEMENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.active) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function saveGlobalAnnouncement(announcement: GlobalAnnouncement | null): void {
  if (!announcement) {
    localStorage.removeItem(ANNOUNCEMENT_KEY);
  } else {
    localStorage.setItem(ANNOUNCEMENT_KEY, JSON.stringify(announcement));
  }
}
