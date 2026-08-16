import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRequest, mockResponse, mockUser } from '../helpers/mocks';

vi.mock('@queries/announcements', () => ({
  findAllAnnouncements: vi.fn(() => []),
  findLatestAnnouncements: vi.fn(() => []),
  findAnnouncementById: vi.fn(),
  createAnnouncement: vi.fn(),
  updateAnnouncement: vi.fn(),
  deleteAnnouncement: vi.fn(),
}));

vi.mock('@queries/users', () => ({
  isAdmin: vi.fn(() => false),
  hasPermission: vi.fn(() => false),
}));

vi.mock('@services/Logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { announcementsPage, addAnnouncement, editAnnouncement, removeAnnouncement, latestAnnouncementsData } from '../../app/handlers/announcements';
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@queries/announcements';
import { isAdmin } from '@queries/users';

describe('announcements handler', () => {
  beforeEach(() => vi.resetAllMocks());

  it('renders an empty page without manage rights', () => {
    const req = mockRequest({ user: mockUser() });
    const res = mockResponse({ inertia: vi.fn() });

    announcementsPage(req, res);

    expect(res.inertia).toHaveBeenCalledWith('announcements', { canManage: false, announcements: [] });
  });

  it('renders announcements for admins', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    const req = mockRequest({ user: mockUser() });
    const res = mockResponse({ inertia: vi.fn() });

    announcementsPage(req, res);

    expect(res.inertia).toHaveBeenCalledWith('announcements', { canManage: true, announcements: [] });
  });

  it('rejects create for non-admins', () => {
    const req = mockRequest({ body: { title: 'Libur', body: 'Senin libur' }, user: mockUser() });
    const res = mockResponse();

    addAnnouncement(req, res);

    expect(res._status).toBe(403);
    expect(createAnnouncement).not.toHaveBeenCalled();
  });

  it('creates an announcement with the actor as author', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    vi.mocked(createAnnouncement).mockReturnValue({ id: 'ann-1', title: 'Libur', body: 'Senin libur', author_user_id: 'user-1', created_at: 1, updated_at: 1 } as never);
    const req = mockRequest({ body: { title: 'Libur', body: 'Senin libur' }, user: mockUser({ id: 'user-1' }) });
    const res = mockResponse();

    addAnnouncement(req, res);

    expect(createAnnouncement).toHaveBeenCalledWith({ title: 'Libur', body: 'Senin libur', author_user_id: 'user-1' });
    expect(res._status).toBe(201);
  });

  it('updates an announcement', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    vi.mocked(updateAnnouncement).mockReturnValue({ id: 'ann-1', title: 'Libur', body: 'Senin libur', author_user_id: 'user-1', created_at: 1, updated_at: 2 } as never);
    const req = mockRequest({ params: { id: 'ann-1' }, body: { body: 'Selasa libur' }, user: mockUser() });
    const res = mockResponse();

    editAnnouncement(req, res);

    expect(updateAnnouncement).toHaveBeenCalledWith('ann-1', { body: 'Selasa libur' });
    expect(res._status).toBe(200);
  });

  it('deletes an announcement', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    vi.mocked(deleteAnnouncement).mockReturnValue(true);
    const req = mockRequest({ params: { id: 'ann-1' }, user: mockUser() });
    const res = mockResponse();

    removeAnnouncement(req, res);

    expect(deleteAnnouncement).toHaveBeenCalledWith('ann-1');
    expect(res._status).toBe(200);
  });

  it('returns latest announcements for any logged-in user', () => {
    const req = mockRequest({ user: mockUser() });
    const res = mockResponse();

    latestAnnouncementsData(req, res);

    expect(res._status).toBe(200);
    expect(res._body).toMatchObject({ success: true });
  });
});
