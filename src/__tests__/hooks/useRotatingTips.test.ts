import { renderHook, act } from '@testing-library/react';
import { useRotatingTips } from '../../hooks/useRotatingTips';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useRotatingTips', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with the first tip', () => {
    const tips = [
      { id: '1', title: 'Tip 1', description: 'Desc 1', category: 'General', impact: 'High' },
      { id: '2', title: 'Tip 2', description: 'Desc 2', category: 'General', impact: 'Medium' }
    ] as any[];

    const { result } = renderHook(() => useRotatingTips(tips, 1000));

    expect(result.current.currentTip).toEqual(tips[0]);
    expect(result.current.tipIndex).toBe(0);
  });

  it('should rotate tips after the specified interval', () => {
    const tips = [
      { id: '1', title: 'Tip 1', description: 'Desc 1', category: 'General', impact: 'High' },
      { id: '2', title: 'Tip 2', description: 'Desc 2', category: 'General', impact: 'Medium' }
    ] as any[];

    const { result } = renderHook(() => useRotatingTips(tips, 1000));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.currentTip).toEqual(tips[1]);
    expect(result.current.tipIndex).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.currentTip).toEqual(tips[0]);
    expect(result.current.tipIndex).toBe(0);
  });

  it('should handle empty tips array safely', () => {
    const { result } = renderHook(() => useRotatingTips([]));

    expect(result.current.currentTip).toBeNull();
    expect(result.current.tipIndex).toBe(0);
  });
});
