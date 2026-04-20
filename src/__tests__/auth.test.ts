
import { describe, it, expect, vi } from 'vitest';
import { authService } from '../services/api';

describe('AuthService Abstraction', () => {
  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should have a login method', () => {
    expect(typeof authService.login).toBe('function');
  });

  it('should have a signup method', () => {
    expect(typeof authService.signup).toBe('function');
  });

  it('should have a deleteAccount method', () => {
    expect(typeof authService.deleteAccount).toBe('function');
  });
});
