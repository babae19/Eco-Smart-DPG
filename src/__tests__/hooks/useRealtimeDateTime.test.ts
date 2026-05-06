import { renderHook, act } from '@testing-library/react';
import { useRealtimeDateTime } from '../../hooks/useRealtimeDateTime';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useRealtimeDateTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2023, 0, 1, 10, 0, 0)); // Jan 1, 2023 10:00:00
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should format date and time correctly', () => {
    const { result } = renderHook(() => useRealtimeDateTime());

    expect(result.current.formattedDate).toBe('January 1, 2023');
    expect(result.current.formattedTime).toMatch(/^10:00:00 AM/);
  });

  it('should update time every second', () => {
    const { result } = renderHook(() => useRealtimeDateTime());

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.formattedTime).toMatch(/^10:00:01 AM/);
  });
});
