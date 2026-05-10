import { describe, it, expect } from 'vitest';
import { generatePersonalizedAlerts } from '../predictiveAlertService';

describe('predictiveAlertService', () => {
  it('should generate specific alerts for Freetown hillside area', () => {
    // Latitude > 8.45 and in Freetown bounds
    const alerts = generatePersonalizedAlerts(8.46, -13.2);
    expect(alerts.length).toBeGreaterThan(0);
    
    const hasLandslide = alerts.some(a => a.type === 'landslide');
    expect(hasLandslide).toBe(true);
    
    const hasHeavyRainfall = alerts.some(a => a.title.includes('HEAVY RAINFALL'));
    expect(hasHeavyRainfall).toBe(true);
  });

  it('should generate specific alerts for Freetown coastal area', () => {
    // Latitude < 8.45 and in Freetown bounds
    const alerts = generatePersonalizedAlerts(8.40, -13.2);
    
    const hasCoastal = alerts.some(a => a.title.includes('COASTAL'));
    expect(hasCoastal).toBe(true);
  });

  it('should generate general alerts for outside Freetown', () => {
    // Outside Freetown bounds
    const alerts = generatePersonalizedAlerts(9.0, -12.0);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('general');
    expect(alerts[0].severity).toBe('low');
  });
});
