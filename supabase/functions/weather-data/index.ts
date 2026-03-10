
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from '../_shared/auth.ts';

interface WeatherRequest {
  latitude: number;
  longitude: number;
}

interface WeatherRisk {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendations: string[];
}

interface WeatherRiskAnalysis {
  risks: WeatherRisk[];
  riskLevel: 'high' | 'medium' | 'low';
  summary: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication to prevent API quota abuse
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    const { latitude, longitude } = await req.json() as WeatherRequest;
    
    // Validate input
    if (typeof latitude !== 'number' || typeof longitude !== 'number' ||
        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Weather data request received for coordinates: ${latitude}, ${longitude}`);
    
    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');

    if (!OPENWEATHER_API_KEY) {
      console.log("OpenWeather API key not configured, returning mock data");
      return new Response(
        JSON.stringify(generateMockWeatherData(latitude, longitude)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      const currentWeatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      
      if (!currentWeatherResponse.ok) {
        throw new Error(`Current weather API error: ${currentWeatherResponse.status}`);
      }
      
      const currentWeather = await currentWeatherResponse.json();
      
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }
      
      const forecastData = await forecastResponse.json();
      
      let uvIndex = null;
      try {
        const uvResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`
        );
        if (uvResponse.ok) {
          const uvData = await uvResponse.json();
          uvIndex = uvData.value;
        }
      } catch (uvError) {
        console.log("UV Index fetch error:", (uvError as Error).message);
      }
      
      const processedData = processWeatherData(currentWeather, forecastData, uvIndex);
      
      return new Response(JSON.stringify(processedData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      
    } catch (apiError) {
      console.error("OpenWeather API error:", (apiError as Error).message);
      return new Response(
        JSON.stringify(generateMockWeatherData(latitude, longitude)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error('Weather API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});

function processWeatherData(currentWeather: any, forecastData: any, uvIndex: number | null) {
  const risks: WeatherRisk[] = [];
  let riskLevel: 'high' | 'medium' | 'low' = 'low';
  
  const temp = currentWeather.main.temp;
  const humidity = currentWeather.main.humidity;
  const conditions = currentWeather.weather[0].main.toLowerCase();
  
  if (temp >= 35) {
    risks.push({
      type: 'extreme_heat', severity: 'high', description: 'Extreme heat warning',
      recommendations: ['Stay indoors during peak hours', 'Drink water frequently', 'Wear light clothing', 'Avoid strenuous outdoor activities']
    });
    riskLevel = 'high';
  } else if (temp >= 30) {
    risks.push({
      type: 'heat', severity: 'medium', description: 'High temperature advisory',
      recommendations: ['Stay hydrated', 'Limit outdoor activities during midday', 'Wear sun protection']
    });
    if (riskLevel === 'low') riskLevel = 'medium';
  }
  
  if (conditions.includes('rain') || conditions.includes('storm')) {
    const severity = conditions.includes('storm') ? 'high' : 'medium';
    risks.push({
      type: conditions.includes('storm') ? 'storm' : 'rain',
      severity,
      description: conditions.includes('storm') ? 'Thunderstorm warning' : 'Heavy rain alert',
      recommendations: ['Avoid outdoor activities', 'Stay away from tall trees', 'Monitor weather updates', 'Prepare for power outages']
    });
    if (severity === 'high') riskLevel = 'high';
    else if (riskLevel === 'low') riskLevel = 'medium';
  }
  
  if (uvIndex !== null && uvIndex >= 8) {
    risks.push({
      type: 'uv', severity: uvIndex >= 11 ? 'high' : 'medium',
      description: `Very high UV index (${uvIndex})`,
      recommendations: ['Use SPF 30+ sunscreen', 'Wear protective clothing', 'Seek shade during peak hours', 'Reapply sunscreen every 2 hours']
    });
    if (uvIndex >= 11 && riskLevel !== 'high') riskLevel = 'high';
    else if (riskLevel === 'low') riskLevel = 'medium';
  }
  
  if (humidity >= 80 && temp >= 28) {
    risks.push({
      type: 'humidity', severity: 'medium', description: 'High humidity with elevated temperature',
      recommendations: ['Stay in air-conditioned areas', 'Take frequent breaks outdoors', 'Watch for heat exhaustion signs']
    });
    if (riskLevel === 'low') riskLevel = 'medium';
  }
  
  const riskAnalysis: WeatherRiskAnalysis = {
    risks,
    riskLevel,
    summary: risks.length > 0 
      ? `${risks.length} weather risk${risks.length > 1 ? 's' : ''} detected.`
      : 'No significant weather risks detected.'
  };

  return {
    current: {
      temperature: currentWeather.main.temp,
      feelsLike: currentWeather.main.feels_like,
      humidity: currentWeather.main.humidity,
      pressure: currentWeather.main.pressure,
      windSpeed: currentWeather.wind.speed,
      windDirection: currentWeather.wind.deg,
      conditions: currentWeather.weather[0].main,
      description: currentWeather.weather[0].description,
      precipitation: 0,
      uvIndex: uvIndex
    },
    forecast: forecastData.list.slice(0, 5).map((item: any) => ({
      dt: item.dt,
      temp: item.main.temp,
      feels_like: item.main.feels_like,
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      conditions: item.weather[0].main,
      description: item.weather[0].description,
      wind_speed: item.wind.speed,
      wind_deg: item.wind.deg,
      pop: item.pop || 0
    })),
    location: {
      name: currentWeather.name,
      country: currentWeather.sys.country,
    },
    riskAnalysis
  };
}

function generateMockWeatherData(latitude: number, longitude: number) {
  const baseTemp = 29 + (Math.random() * 6);
  const humidity = 70 + (Math.random() * 25);
  const isRainySeason = new Date().getMonth() >= 4 && new Date().getMonth() <= 10;
  const precipitation = isRainySeason ? Math.random() * 20 : Math.random() * 5;
  
  const risks: WeatherRisk[] = [];
  let riskLevel: 'high' | 'medium' | 'low' = 'low';
  
  if (baseTemp >= 32) {
    risks.push({
      type: 'heat', severity: 'medium', description: 'High temperature conditions',
      recommendations: ['Stay hydrated', 'Avoid midday sun', 'Wear light clothing']
    });
    riskLevel = 'medium';
  }
  
  if (isRainySeason && precipitation > 10) {
    risks.push({
      type: 'rain', severity: 'medium', description: 'Heavy rainfall expected',
      recommendations: ['Avoid low-lying areas', 'Carry umbrella', 'Monitor flood warnings']
    });
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  return {
    current: {
      temperature: Number(baseTemp.toFixed(1)),
      feelsLike: Number((baseTemp + 2).toFixed(1)),
      humidity: Math.round(humidity),
      pressure: 1010 + Math.round(Math.random() * 10),
      windSpeed: Number((8 + Math.random() * 12).toFixed(1)),
      windDirection: Math.round(Math.random() * 360),
      conditions: isRainySeason ? (precipitation > 15 ? 'Rain' : 'Clouds') : 'Clear',
      description: isRainySeason ? (precipitation > 15 ? 'heavy rain' : 'scattered clouds') : 'clear sky',
      precipitation: Number(precipitation.toFixed(1)),
      uvIndex: Math.round(6 + Math.random() * 4)
    },
    forecast: Array.from({ length: 5 }, (_, i) => ({
      dt: Math.floor(Date.now() / 1000) + (i * 24 * 60 * 60),
      temp: baseTemp - (i * 0.5),
      feels_like: baseTemp + 1 - (i * 0.5),
      humidity: humidity - (i * 2),
      pressure: 1010 + Math.round(Math.random() * 5),
      conditions: i > 2 ? 'Clouds' : 'Clear',
      description: i > 2 ? 'scattered clouds' : 'clear sky',
      wind_speed: 8 + Math.random() * 5,
      wind_deg: Math.round(Math.random() * 360),
      pop: i > 2 ? 0.3 : 0.1
    })),
    location: { name: "Freetown", country: "SL" },
    riskAnalysis: {
      risks,
      riskLevel,
      summary: risks.length > 0 
        ? `${risks.length} weather risk${risks.length > 1 ? 's' : ''} identified.`
        : 'Weather conditions are within normal parameters.'
    }
  };
}
