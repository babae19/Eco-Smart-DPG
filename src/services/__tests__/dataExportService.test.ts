import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportUserData } from '../dataExportService';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn((field: string, value: string) => {
          if (table === 'profiles') {
            return { single: vi.fn(() => Promise.resolve({ data: { id: 'test-user', username: 'TestUser' } })) };
          }
          return Promise.resolve({ data: [{ id: 'item-1', name: `Test ${table}` }] });
        })
      }))
    }))
  }
}));

describe('dataExportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the DOM methods used for triggering the download
    global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = vi.fn();
    
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  it('should successfully gather data and trigger a download', async () => {
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    const result = await exportUserData('test-user');

    expect(result).toBe(true);
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });
});
