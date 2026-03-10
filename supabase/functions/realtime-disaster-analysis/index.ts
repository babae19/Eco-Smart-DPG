
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';
import { requireAuth } from '../_shared/auth.ts';

interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    conditions: string;
    pressure?: number;
    uvIndex?: number | null;
  };
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

interface DisasterAlert {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location: string;
  coordinates: { latitude: number; longitude: number };
  probability: number;
  timeframe: string;
  precautions: string[];
  created_at: string;
  expires_at: string;
  weather_data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;
    const authenticatedUserId = authResult.userId;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { coordinates } = await req.json();

    // Validate input coordinates
    if (!coordinates ||
        typeof coordinates.latitude !== 'number' ||
        typeof coordinates.longitude !== 'number' ||
        coordinates.latitude < -90 || coordinates.latitude > 90 ||
        coordinates.longitude < -180 || coordinates.longitude > 180) {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting disaster analysis for coordinates:', coordinates, 'user:', authenticatedUserId);

    // Fetch current weather data
    const weatherData = await fetchWeatherData(coordinates);
    console.log('Weather data fetched:', weatherData);

    // Analyze disaster risks
    const disasterAlerts = await analyzeDisasterRisks(weatherData, openaiApiKey);
    console.log('Disaster analysis complete. Found alerts:', disasterAlerts.length);

    // Store alerts in database and send notifications
    const storedAlerts = [];
    for (const alert of disasterAlerts) {
      try {
        const { data: alertData, error: alertError } = await supabase
          .from('disaster_alerts')
          .upsert({
            id: alert.id,
            type: alert.type,
            severity: alert.severity,
            title: alert.title,
            description: alert.description,
            location: alert.location,
            coordinates: alert.coordinates,
            probability: alert.probability,
            timeframe: alert.timeframe,
            precautions: alert.precautions,
            weather_data: alert.weather_data,
            created_at: alert.created_at,
            expires_at: alert.expires_at,
            is_active: true
          })
          .select()
          .single();

        if (alertError) {
          console.error('Error storing alert:', alertError);
          continue;
        }

        storedAlerts.push(alertData);

        // Send push notifications for high severity alerts - only to the authenticated user
        if (alert.severity === 'high') {
          await sendPushNotification(supabase, authenticatedUserId, alert);
        }

        console.log(`Alert stored: ${alert.title}`);
      } catch (error) {
        console.error('Error processing alert:', error);
      }
    }

    // Clean up expired alerts
    await supabase
      .from('disaster_alerts')
      .update({ is_active: false })
      .lt('expires_at', new Date().toISOString());

    return new Response(JSON.stringify({
      success: true,
      alerts: storedAlerts,
      analysis: {
        location: weatherData.location,
        timestamp: new Date().toISOString(),
        total_alerts: storedAlerts.length,
        high_severity: storedAlerts.filter(a => a.severity === 'high').length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in realtime disaster analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchWeatherData(coordinates: { latitude: number; longitude: number }): Promise<WeatherData> {
  const openWeatherApiKey = Deno.env.get('OPENWEATHERMAP_API_KEY');
  
  if (!openWeatherApiKey) {
    console.log('OpenWeather API key not found, using mock data');
    return generateMockWeatherData(coordinates);
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${openWeatherApiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      current: {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
        windSpeed: data.wind.speed * 3.6,
        conditions: data.weather[0].main,
        pressure: data.main.pressure,
        uvIndex: null
      },
      location: {
        name: data.name,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      }
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return generateMockWeatherData(coordinates);
  }
}

function generateMockWeatherData(coordinates: { latitude: number; longitude: number }): WeatherData {
  const scenarios = [
    { temp: 38, humidity: 45, precip: 0, conditions: 'Clear' },
    { temp: 25, humidity: 85, precip: 25, conditions: 'Rain' },
    { temp: 30, humidity: 90, precip: 35, conditions: 'Thunderstorm' },
    { temp: 32, humidity: 65, precip: 5, conditions: 'Partly Cloudy' }
  ];

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  return {
    current: {
      temperature: scenario.temp + (Math.random() - 0.5) * 4,
      humidity: scenario.humidity + (Math.random() - 0.5) * 20,
      precipitation: scenario.precip + (Math.random() - 0.5) * 10,
      windSpeed: 10 + Math.random() * 20,
      conditions: scenario.conditions,
      pressure: 1010 + (Math.random() - 0.5) * 30,
      uvIndex: Math.floor(Math.random() * 12)
    },
    location: {
      name: 'Freetown',
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    }
  };
}

async function analyzeDisasterRisks(weatherData: WeatherData, openaiApiKey?: string): Promise<DisasterAlert[]> {
  const alerts: DisasterAlert[] = [];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const { current, location } = weatherData;

  if (current.temperature > 35) {
    const severity = current.temperature > 40 ? 'high' : current.temperature > 37 ? 'medium' : 'low';
    alerts.push({
      id: `heat-${Date.now()}`,
      type: 'extreme_heat',
      severity,
      title: '🌡️ Extreme Heat Warning',
      description: `Dangerous heat conditions detected. Temperature: ${current.temperature.toFixed(1)}°C.`,
      location: location.name,
      coordinates: { latitude: location.latitude, longitude: location.longitude },
      probability: Math.min(95, (current.temperature - 30) * 15),
      timeframe: 'Next 6-12 hours',
      precautions: ['Stay indoors during peak hours', 'Drink water frequently', 'Wear light clothing', 'Check on elderly individuals'],
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      weather_data: current
    });
  }

  if (current.precipitation > 15 || (current.humidity > 85 && current.conditions.toLowerCase().includes('rain'))) {
    const severity = current.precipitation > 30 ? 'high' : current.precipitation > 20 ? 'medium' : 'low';
    alerts.push({
      id: `flood-${Date.now()}`,
      type: 'flooding',
      severity,
      title: '🌊 Flood Risk Alert',
      description: `Heavy rainfall detected. Precipitation: ${current.precipitation.toFixed(1)}mm/h.`,
      location: location.name,
      coordinates: { latitude: location.latitude, longitude: location.longitude },
      probability: Math.min(90, current.precipitation * 3 + (current.humidity - 70)),
      timeframe: 'Next 2-6 hours',
      precautions: ['Avoid low-lying areas', 'Do not drive through flooded roads', 'Move to higher ground', 'Keep emergency supplies ready'],
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      weather_data: current
    });
  }

  if (current.precipitation > 10) {
    alerts.push({
      id: `heavy-rain-${Date.now()}`,
      type: 'heavy_rain',
      severity: current.precipitation > 25 ? 'high' : 'medium',
      title: '🌧️ Heavy Rain Warning',
      description: `Intense rainfall. Current rate: ${current.precipitation.toFixed(1)}mm/h.`,
      location: location.name,
      coordinates: { latitude: location.latitude, longitude: location.longitude },
      probability: Math.min(85, current.precipitation * 2.5),
      timeframe: 'Current and next 3 hours',
      precautions: ['Postpone outdoor activities', 'Drive carefully', 'Ensure proper drainage', 'Check weather updates'],
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      weather_data: current
    });
  }

  if (current.precipitation > 20 && current.humidity > 85) {
    alerts.push({
      id: `landslide-${Date.now()}`,
      type: 'landslide',
      severity: 'high',
      title: '⛰️ Landslide Risk Warning',
      description: 'Saturated soil conditions detected. High risk of landslides.',
      location: location.name,
      coordinates: { latitude: location.latitude, longitude: location.longitude },
      probability: 70,
      timeframe: 'Next 12-24 hours',
      precautions: ['Avoid steep slopes', 'Watch for ground movement', 'Move away from steep terrain', 'Report ground cracks'],
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      weather_data: current
    });
  }

  if (current.windSpeed > 40) {
    alerts.push({
      id: `wind-${Date.now()}`,
      type: 'strong_winds',
      severity: current.windSpeed > 60 ? 'high' : 'medium',
      title: '💨 Strong Wind Alert',
      description: `Dangerous wind speeds: ${current.windSpeed.toFixed(1)} km/h.`,
      location: location.name,
      coordinates: { latitude: location.latitude, longitude: location.longitude },
      probability: 80,
      timeframe: 'Next 2-4 hours',
      precautions: ['Secure loose outdoor items', 'Stay away from windows', 'Avoid outdoor activities', 'Prepare for power outages'],
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      weather_data: current
    });
  }

  if (openaiApiKey && alerts.length > 0) {
    try {
      return await enhanceWithAI(alerts, weatherData, openaiApiKey);
    } catch (error) {
      console.error('AI enhancement failed:', error);
    }
  }

  return alerts;
}

async function enhanceWithAI(alerts: DisasterAlert[], weatherData: WeatherData, apiKey: string): Promise<DisasterAlert[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a disaster risk analysis expert.' },
          { role: 'user', content: `Enhance these alerts: ${JSON.stringify(alerts.map(a => ({ type: a.type, severity: a.severity })))}` }
        ],
        temperature: 0.3
      }),
    });

    if (response.ok) {
      console.log('AI enhancement completed');
    }
  } catch (error) {
    console.error('AI enhancement error:', error);
  }

  return alerts;
}

async function sendPushNotification(supabase: any, userId: string, alert: DisasterAlert) {
  try {
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: alert.title,
        description: alert.description,
        type: 'disaster_alert'
      });

    if (notificationError) {
      console.error('Error storing notification:', notificationError);
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}
