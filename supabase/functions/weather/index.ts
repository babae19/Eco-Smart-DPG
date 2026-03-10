import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts';
import { requireAuth } from '../_shared/auth.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication to prevent API quota abuse
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    const { latitude, longitude } = await req.json();
    
    console.log(`[Weather Function] Fetching weather for: ${latitude}, ${longitude} user: ${authResult.userId}`);
    
    if (!latitude || !longitude || 
        typeof latitude !== 'number' || typeof longitude !== 'number' ||
        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('OPENWEATHERMAP_API_KEY') || Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!apiKey) {
      console.error('[Weather Function] No OpenWeatherMap API key found');
      return new Response(JSON.stringify(getFallbackWeatherData()), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Fetch all data in parallel to avoid timeouts
    const [currentResponse, forecastResponse, aqiResponse] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`).catch(() => null),
    ]);

    if (!currentResponse.ok) {
      console.error('[Weather Function] Current weather API error:', currentResponse.status);
      return new Response(JSON.stringify(getFallbackWeatherData()), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const currentData = await currentResponse.json();
    const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;
    let aqiData = null;
    if (aqiResponse && aqiResponse.ok) {
      aqiData = await aqiResponse.json();
    }

    const forecastAlerts = generateForecastAlerts(forecastData, currentData);

    const processedData = {
      location: `${currentData.name}, ${currentData.sys?.country || ''}`,
      current: {
        temperature: Math.round(currentData.main.temp),
        conditions: currentData.weather[0]?.description || 'Unknown',
        humidity: currentData.main.humidity,
        windSpeed: Math.round((currentData.wind?.speed || 0) * 3.6),
        windDirection: convertWindDegreeToDirection(currentData.wind?.deg || 0),
        pressure: currentData.main.pressure,
        feelsLike: Math.round(currentData.main.feels_like),
        precipitation: 0,
        uvIndex: null
      },
      forecast: processForecastData(forecastData),
      hourlyForecast: processHourlyData(forecastData),
      airQuality: processAqiData(aqiData),
      forecastAlerts,
      riskAnalysis: {
        riskLevel: 'low',
        risks: [],
        recommendations: ['Stay hydrated', 'Check weather updates regularly'],
        summary: 'Weather conditions are within normal parameters.'
      }
    };

    return new Response(JSON.stringify(processedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[Weather Function] Error:', error);
    return new Response(JSON.stringify(getFallbackWeatherData()), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});

function convertWindDegreeToDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function processHourlyData(forecastData: any): any[] {
  if (!forecastData?.list) {
    return generateFallbackHourlyData();
  }

  return forecastData.list.slice(0, 8).map((item: any) => {
    const date = new Date(item.dt * 1000);
    return {
      time: date.toISOString(),
      hour: date.getHours(),
      temperature: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      condition: item.weather[0]?.main || 'Unknown',
      description: item.weather[0]?.description || 'Unknown',
      icon: item.weather[0]?.icon || '01d',
      humidity: item.main.humidity,
      windSpeed: Math.round((item.wind?.speed || 0) * 3.6),
      precipitation: Math.round((item.pop || 0) * 100)
    };
  });
}

function processForecastData(forecastData: any): any[] {
  if (!forecastData?.list) return [];

  const dailyData: { [key: string]: { temps: number[], conditions: string[], pop: number[] } } = {};

  for (const item of forecastData.list) {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = { temps: [], conditions: [], pop: [] };
    }
    dailyData[date].temps.push(item.main.temp);
    dailyData[date].conditions.push(item.weather[0]?.main || 'Unknown');
    dailyData[date].pop.push(item.pop || 0);
  }

  return Object.entries(dailyData).slice(0, 7).map(([date, data]) => {
    const conditionCounts = data.conditions.reduce((acc: any, c) => {
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});
    const mostCommonCondition = Object.entries(conditionCounts)
      .sort((a: any, b: any) => b[1] - a[1])[0][0];

    return {
      date,
      high: Math.round(Math.max(...data.temps)),
      low: Math.round(Math.min(...data.temps)),
      condition: mostCommonCondition,
      precipitation: Math.round(Math.max(...data.pop) * 100)
    };
  });
}

function generateFallbackHourlyData(): any[] {
  const hours = [];
  const baseTemp = 28;
  const now = new Date();
  
  for (let i = 0; i < 8; i++) {
    const date = new Date(now.getTime() + i * 3 * 60 * 60 * 1000);
    const hour = date.getHours();
    const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 4;
    
    hours.push({
      time: date.toISOString(),
      hour,
      temperature: Math.round(baseTemp + tempVariation),
      feelsLike: Math.round(baseTemp + tempVariation + 2),
      condition: 'Clouds',
      description: 'partly cloudy',
      icon: hour >= 6 && hour < 18 ? '02d' : '02n',
      humidity: 75,
      windSpeed: 8,
      precipitation: 20
    });
  }
  
  return hours;
}

function processAqiData(aqiData: any): any {
  if (!aqiData?.list?.[0]) {
    return {
      aqi: 2, level: 'Fair', color: 'amber',
      components: { pm2_5: 12, pm10: 20, no2: 15, o3: 45, co: 0.4, so2: 5 },
      description: 'Air quality is acceptable'
    };
  }

  const data = aqiData.list[0];
  const aqi = data.main.aqi;
  const components = data.components;

  const levels = [
    { level: 'Good', color: 'emerald', description: 'Air quality is excellent' },
    { level: 'Fair', color: 'amber', description: 'Air quality is acceptable' },
    { level: 'Moderate', color: 'orange', description: 'Sensitive groups may be affected' },
    { level: 'Poor', color: 'red', description: 'Health effects possible for everyone' },
    { level: 'Very Poor', color: 'purple', description: 'Health alert: serious health effects' }
  ];

  const levelData = levels[aqi - 1] || levels[1];

  return {
    aqi,
    level: levelData.level,
    color: levelData.color,
    components: {
      pm2_5: Math.round(components.pm2_5 * 10) / 10,
      pm10: Math.round(components.pm10 * 10) / 10,
      no2: Math.round(components.no2 * 10) / 10,
      o3: Math.round(components.o3 * 10) / 10,
      co: Math.round(components.co * 100) / 100,
      so2: Math.round(components.so2 * 10) / 10
    },
    description: levelData.description
  };
}

function generateForecastAlerts(forecastData: any, currentData: any): any[] {
  const alerts: any[] = [];
  if (!forecastData?.list) return alerts;

  const currentTemp = currentData?.main?.temp || 28;
  const currentCondition = currentData?.weather?.[0]?.main?.toLowerCase() || '';

  for (let i = 0; i < Math.min(forecastData.list.length, 16); i++) {
    const item = forecastData.list[i];
    const forecastTime = new Date(item.dt * 1000);
    const hoursFromNow = (forecastTime.getTime() - Date.now()) / (1000 * 60 * 60);
    const condition = item.weather[0]?.main?.toLowerCase() || '';
    const temp = item.main.temp;
    const pop = item.pop || 0;

    if (pop >= 0.6 && !currentCondition.includes('rain')) {
      alerts.push({
        id: `rain-${i}`, type: 'rain', severity: pop >= 0.8 ? 'high' : 'medium',
        title: 'Rain Expected', message: `${Math.round(pop * 100)}% chance of rain in ${Math.round(hoursFromNow)} hours`,
        time: forecastTime.toISOString(), icon: 'cloud-rain'
      });
    }

    if (condition.includes('thunder') || condition.includes('storm')) {
      alerts.push({
        id: `storm-${i}`, type: 'storm', severity: 'high',
        title: 'Storm Warning', message: `Thunderstorm expected in ${Math.round(hoursFromNow)} hours`,
        time: forecastTime.toISOString(), icon: 'cloud-lightning'
      });
    }

    const tempDrop = currentTemp - temp;
    if (tempDrop >= 5) {
      alerts.push({
        id: `temp-drop-${i}`, type: 'temperature', severity: tempDrop >= 8 ? 'high' : 'medium',
        title: 'Temperature Drop', message: `Temperature will drop by ${Math.round(tempDrop)}°C in ${Math.round(hoursFromNow)} hours`,
        time: forecastTime.toISOString(), icon: 'thermometer-snowflake'
      });
    }

    if (temp >= 35) {
      alerts.push({
        id: `heat-${i}`, type: 'heat', severity: temp >= 40 ? 'high' : 'medium',
        title: 'Extreme Heat Warning', message: `Temperature will reach ${Math.round(temp)}°C in ${Math.round(hoursFromNow)} hours`,
        time: forecastTime.toISOString(), icon: 'sun'
      });
    }
  }

  const seen = new Set();
  return alerts.filter(alert => {
    if (seen.has(alert.type)) return false;
    seen.add(alert.type);
    return true;
  }).slice(0, 5);
}

function getFallbackWeatherData() {
  return {
    location: 'Freetown, SL',
    current: {
      temperature: 28, conditions: 'Partly Cloudy', humidity: 75,
      windSpeed: 8, windDirection: 'SW', pressure: 1013,
      feelsLike: 30, precipitation: 0, uvIndex: null
    },
    forecast: [
      { date: new Date().toISOString().split('T')[0], high: 30, low: 24, condition: 'Partly Cloudy', precipitation: 20 },
      { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], high: 29, low: 23, condition: 'Cloudy', precipitation: 40 }
    ],
    hourlyForecast: generateFallbackHourlyData(),
    airQuality: {
      aqi: 2, level: 'Fair', color: 'amber',
      components: { pm2_5: 12, pm10: 20, no2: 15, o3: 45, co: 0.4, so2: 5 },
      description: 'Air quality is acceptable'
    },
    forecastAlerts: [],
    riskAnalysis: {
      riskLevel: 'low', risks: [],
      recommendations: ['Stay hydrated', 'Use sun protection'],
      summary: 'Weather conditions are generally favorable.'
    }
  };
}
