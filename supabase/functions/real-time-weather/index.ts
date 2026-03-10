
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from '../_shared/auth.ts';

interface WeatherRequest {
  latitude: number;
  longitude: number;
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

    console.log(`Fetching weather data for coordinates: ${latitude}, ${longitude}`);
    
    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key is not configured');
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    const [weatherResponse, forecastResponse] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl)
    ]);

    if (!weatherResponse.ok) {
      throw new Error(`OpenWeather API error: ${weatherResponse.statusText}`);
    }

    if (!forecastResponse.ok) {
      throw new Error(`OpenWeather Forecast API error: ${forecastResponse.statusText}`);
    }

    const weatherData = await weatherResponse.json();
    const forecastData = await forecastResponse.json();
    
    const current = {
      temperature: weatherData.main.temp,
      feelsLike: weatherData.main.feels_like,
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      windSpeed: weatherData.wind.speed,
      windDirection: weatherData.wind.deg,
      precipitation: weatherData.rain ? weatherData.rain['1h'] || 0 : 0,
      conditions: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      rainProbability: 0
    };
    
    if (forecastData.list && forecastData.list.length > 0) {
      const next3Hours = forecastData.list.slice(0, 3);
      current.rainProbability = next3Hours.some((item: any) => 
        item.pop > 0.3 || 
        (item.rain && item.rain['3h'] > 0)
      ) ? 70 : 10;
    }
    
    const isRainyPeriod = current.humidity > 75 || current.precipitation > 0;
    const isFloodRisk = current.precipitation > 10 || (current.rainProbability > 60 && current.humidity > 80);
    
    const response = {
      current,
      location: {
        name: weatherData.name,
        country: weatherData.sys.country
      },
      disasterRisk: {
        floodRisk: isFloodRisk ? 'high' : (isRainyPeriod ? 'moderate' : 'low'),
        landslideRisk: (isFloodRisk && current.precipitation > 20) ? 'high' : 
                       (isRainyPeriod ? 'moderate' : 'low'),
        recommendations: [] as string[]
      }
    };
    
    if (isFloodRisk) {
      response.disasterRisk.recommendations.push(
        'Stay away from flood-prone areas',
        'Monitor local weather updates',
        'Have emergency supplies ready',
        'Move to higher ground if necessary'
      );
    }
    
    if (current.precipitation > 20) {
      response.disasterRisk.recommendations.push(
        'Be alert for landslides',
        'Avoid steep terrain during heavy rainfall'
      );
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        current: {
          temperature: 30, humidity: 85, precipitation: 0,
          windSpeed: 10, windDirection: 180, pressure: 1008, conditions: "Clouds"
        },
        location: { name: "Freetown", country: "SL" },
        disasterRisk: {
          floodRisk: "low", landslideRisk: "low",
          recommendations: ["Stay updated with official weather alerts"]
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
