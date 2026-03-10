
export interface TemperatureAdvice {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendations: string[];
  weatherConditions?: string;
}

/**
 * Get general weather advisory based on current temperature
 * Returns dynamic title and description based on real-time conditions
 */
export function getTemperatureAdvice(temperature: number, conditions?: string): TemperatureAdvice {
  const conditionsLower = conditions?.toLowerCase() || '';
  
  // Determine primary weather condition for title
  const getWeatherTitle = () => {
    if (conditionsLower.includes('rain') || conditionsLower.includes('drizzle')) {
      return 'Rainy Weather Advisory';
    } else if (conditionsLower.includes('thunder') || conditionsLower.includes('storm')) {
      return 'Storm Weather Warning';
    } else if (conditionsLower.includes('cloud')) {
      if (temperature >= 30) return 'Hot & Cloudy Advisory';
      if (temperature < 20) return 'Cool & Cloudy Advisory';
      return 'Cloudy Weather Notice';
    } else if (conditionsLower.includes('clear') || conditionsLower.includes('sun')) {
      if (temperature >= 35) return 'Extreme Heat Warning';
      if (temperature >= 30) return 'Hot Weather Advisory';
      return 'Clear Weather Notice';
    }
    
    // Temperature-based fallback
    if (temperature >= 35) return 'Extreme Heat Warning';
    if (temperature >= 30) return 'Hot Weather Advisory';
    if (temperature >= 26) return 'Warm Weather Notice';
    if (temperature >= 20) return 'Pleasant Weather';
    if (temperature >= 15) return 'Cool Weather Notice';
    if (temperature >= 10) return 'Cold Weather Advisory';
    return 'Severe Cold Warning';
  };

  // Extreme heat (above 35°C)
  if (temperature >= 35) {
    return {
      severity: 'high',
      title: getWeatherTitle(),
      description: `Current temperature is ${temperature.toFixed(1)}°C. Extreme conditions require immediate precautions.`,
      recommendations: []
    };
  } 
  // High temperature (30-34.9°C)
  else if (temperature >= 30) {
    return {
      severity: 'medium',
      title: getWeatherTitle(),
      description: `Current temperature is ${temperature.toFixed(1)}°C. Take appropriate precautions for current conditions.`,
      recommendations: []
    };
  }
  // Warm temperature (26-29.9°C)
  else if (temperature >= 26) {
    return {
      severity: 'low',
      title: getWeatherTitle(),
      description: `Current temperature is ${temperature.toFixed(1)}°C. Conditions are warm and generally comfortable.`,
      recommendations: []
    };
  }
  // Comfortable temperature (20-25.9°C)
  else if (temperature >= 20) {
    return {
      severity: 'low',
      title: getWeatherTitle(),
      description: `Current temperature is ${temperature.toFixed(1)}°C. Conditions are comfortable for most activities.`,
      recommendations: []
    };
  }
  // Cool temperature (15-19.9°C)
  else if (temperature >= 15) {
    return {
      severity: 'low',
      title: getWeatherTitle(),
      description: `Current temperature is ${temperature.toFixed(1)}°C. Cool conditions, especially mornings and evenings.`,
      recommendations: []
    };
  }
  // Cold temperature (10-14.9°C)
  else if (temperature >= 10) {
    return {
      severity: 'medium',
      title: getWeatherTitle(),
      description: `Current temperature is ${temperature.toFixed(1)}°C. Cold conditions require warm clothing.`,
      recommendations: []
    };
  }
  // Very cold temperature (below 10°C)
  else {
    return {
      severity: 'high',
      title: getWeatherTitle(),
      description: `Current temperature is ${temperature.toFixed(1)}°C. Extremely cold conditions present health risks.`,
      recommendations: []
    };
  }
}
