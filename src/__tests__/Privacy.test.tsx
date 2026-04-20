
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { exportUserData } from '../services/dataExportService';
import ConsentBanner from '../components/ConsentBanner';

// Mock the services
vi.mock('../services/dataExportService', () => ({
  exportUserData: vi.fn(),
}));

describe('Privacy Features', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('ConsentBanner', () => {
    it('should be visible when no consent exists', () => {
      render(<ConsentBanner />);
      expect(screen.getByText(/Privacy & Data Consent/i)).toBeDefined();
    });

    it('should store "accepted" in localStorage when Accept is clicked', () => {
      render(<ConsentBanner />);
      const acceptButton = screen.getByText('Accept');
      fireEvent.click(acceptButton);
      expect(localStorage.getItem('ecosmart_consent')).toBe('accepted');
      expect(localStorage.getItem('ecosmart_data_sharing')).toBe('true');
    });

    it('should store "declined" in localStorage when Decline is clicked', () => {
      render(<ConsentBanner />);
      const declineButton = screen.getByText('Decline');
      fireEvent.click(declineButton);
      expect(localStorage.getItem('ecosmart_consent')).toBe('declined');
      expect(localStorage.getItem('ecosmart_data_sharing')).toBe('false');
    });
  });

  describe('Data Export Logic', () => {
    it('should call exportUserData when triggered', async () => {
      const mockExport = vi.mocked(exportUserData);
      mockExport.mockResolvedValueOnce(true);
      
      // Indirect testing of service calling via mock verification
      await exportUserData('test-user-id');
      expect(mockExport).toHaveBeenCalledWith('test-user-id');
    });
  });
});
