# OpenWeatherMap API Key Required

The weather functionality requires an OpenWeatherMap API key to fetch real weather data.

## How to get an API key:
1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it as a secret in your Supabase project

## Current Status:
- Weather service falls back to mock data when API key is missing
- All other app functionality works correctly
- The app is fully functional but uses simulated weather data

## To fix:
Add your OpenWeatherMap API key as the environment variable `OPENWEATHERMAP_API_KEY` in your edge function secrets.