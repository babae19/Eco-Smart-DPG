import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  MapPin, Layers, Play, Pause, Cloud, CloudRain, 
  CloudLightning, Wind, Droplets, Thermometer, RefreshCw,
  ZoomIn, ZoomOut, Locate, Info, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WeatherRadarMapProps {
  latitude: number;
  longitude: number;
  locationName?: string;
}

// Simulated weather cells for radar visualization
const generateWeatherCells = (centerLat: number, centerLng: number) => {
  const cells = [];
  const now = Date.now();
  
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 0.5 + 0.1;
    const lat = centerLat + Math.cos(angle) * distance;
    const lng = centerLng + Math.sin(angle) * distance;
    
    const types = ['light-rain', 'moderate-rain', 'heavy-rain', 'storm', 'clear'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    cells.push({
      id: i,
      lat,
      lng,
      type,
      intensity: Math.random(),
      size: 20 + Math.random() * 40,
      direction: Math.random() * 360,
      speed: 5 + Math.random() * 20,
      timestamp: now - Math.random() * 3600000
    });
  }
  
  return cells;
};

// Color coding for precipitation intensity
const getIntensityColor = (intensity: number, type: string) => {
  if (type === 'clear') return 'rgba(34, 197, 94, 0.3)';
  if (type === 'storm') return `rgba(239, 68, 68, ${0.4 + intensity * 0.4})`;
  if (type === 'heavy-rain') return `rgba(59, 130, 246, ${0.5 + intensity * 0.4})`;
  if (type === 'moderate-rain') return `rgba(96, 165, 250, ${0.3 + intensity * 0.4})`;
  return `rgba(147, 197, 253, ${0.2 + intensity * 0.3})`;
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'storm': return <CloudLightning className="h-3 w-3" />;
    case 'heavy-rain': return <CloudRain className="h-3 w-3" />;
    case 'moderate-rain': return <Cloud className="h-3 w-3" />;
    case 'light-rain': return <Droplets className="h-3 w-3" />;
    default: return <Cloud className="h-3 w-3" />;
  }
};

const WeatherRadarMap: React.FC<WeatherRadarMapProps> = memo(({ latitude, longitude, locationName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState<'precipitation' | 'temperature' | 'wind'>('precipitation');
  const [zoom, setZoom] = useState(1);
  const [weatherCells, setWeatherCells] = useState(() => generateWeatherCells(latitude, longitude));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  // Animate weather cells
  useEffect(() => {
    if (!isPlaying) return;
    
    const animate = () => {
      setWeatherCells(prev => prev.map(cell => ({
        ...cell,
        lat: cell.lat + Math.cos(cell.direction * Math.PI / 180) * 0.001 * cell.speed / 100,
        lng: cell.lng + Math.sin(cell.direction * Math.PI / 180) * 0.001 * cell.speed / 100,
        intensity: Math.max(0, Math.min(1, cell.intensity + (Math.random() - 0.5) * 0.05))
      })));
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Draw radar visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw radar grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Concentric circles
    for (let r = 50; r <= 150; r += 50) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r * zoom, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Cross lines
    ctx.beginPath();
    ctx.moveTo(centerX - 160 * zoom, centerY);
    ctx.lineTo(centerX + 160 * zoom, centerY);
    ctx.moveTo(centerX, centerY - 160 * zoom);
    ctx.lineTo(centerX, centerY + 160 * zoom);
    ctx.stroke();
    
    // Draw weather cells
    weatherCells.forEach(cell => {
      const relLat = (cell.lat - latitude) * 200 * zoom;
      const relLng = (cell.lng - longitude) * 200 * zoom;
      
      const x = centerX + relLng;
      const y = centerY - relLat;
      
      // Check bounds
      if (x < 0 || x > width || y < 0 || y > height) return;
      
      const color = getIntensityColor(cell.intensity, cell.type);
      const size = cell.size * zoom;
      
      // Draw cell
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw center location marker
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Radar sweep animation
    if (isPlaying) {
      const sweepAngle = (Date.now() / 20) % 360;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(sweepAngle * Math.PI / 180);
      
      const sweepGradient = ctx.createLinearGradient(0, 0, 150 * zoom, 0);
      sweepGradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
      sweepGradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
      
      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 150 * zoom, -0.1, 0.1);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }
  }, [weatherCells, zoom, isPlaying, latitude, longitude]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setWeatherCells(generateWeatherCells(latitude, longitude));
      setIsRefreshing(false);
    }, 1000);
  }, [latitude, longitude]);

  const timeLabels = ['-3h', '-2h', '-1h', 'Now', '+1h', '+2h', '+3h'];

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b border-border/30 bg-background/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center">
                <Radio className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Weather Radar</h3>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {locationName || 'Your Location'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] border-slate-600 bg-slate-800/50",
                  isPlaying ? "text-success" : "text-slate-400"
                )}
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full mr-1.5",
                  isPlaying ? "bg-success animate-pulse" : "bg-slate-500"
                )} />
                {isPlaying ? 'Live' : 'Paused'}
              </Badge>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </Button>
            </div>
          </div>
        </div>

        {/* Layer Selection */}
        <div className="px-4 py-2 border-b border-border/30 bg-slate-800/30">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[10px] text-slate-400 mr-2">Layer:</span>
            {(['precipitation', 'temperature', 'wind'] as const).map((layer) => (
              <Button
                key={layer}
                size="sm"
                variant={selectedLayer === layer ? 'default' : 'ghost'}
                className={cn(
                  "h-6 px-2 text-[10px] capitalize",
                  selectedLayer !== layer && "text-slate-400 hover:text-white hover:bg-slate-700"
                )}
                onClick={() => setSelectedLayer(layer)}
              >
                {layer === 'precipitation' && <CloudRain className="h-3 w-3 mr-1" />}
                {layer === 'temperature' && <Thermometer className="h-3 w-3 mr-1" />}
                {layer === 'wind' && <Wind className="h-3 w-3 mr-1" />}
                {layer}
              </Button>
            ))}
          </div>
        </div>

        {/* Radar Canvas */}
        <div className="relative aspect-square max-h-[300px] bg-gradient-to-br from-slate-900 to-slate-800">
          <canvas 
            ref={canvasRef}
            width={300}
            height={300}
            className="w-full h-full"
          />
          
          {/* Compass indicators */}
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-500">N</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-500">S</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-500">W</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-500">E</span>
          </div>

          {/* Zoom Controls */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Button
              size="icon"
              variant="secondary"
              className="h-7 w-7 bg-slate-800/80 hover:bg-slate-700 border border-slate-600"
              onClick={() => setZoom(z => Math.min(2, z + 0.25))}
            >
              <ZoomIn className="h-3.5 w-3.5 text-white" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-7 w-7 bg-slate-800/80 hover:bg-slate-700 border border-slate-600"
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            >
              <ZoomOut className="h-3.5 w-3.5 text-white" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-7 w-7 bg-slate-800/80 hover:bg-slate-700 border border-slate-600"
              onClick={() => setZoom(1)}
            >
              <Locate className="h-3.5 w-3.5 text-white" />
            </Button>
          </div>

          {/* Intensity Legend */}
          <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-sm rounded-lg p-2 border border-slate-700">
            <div className="text-[9px] text-slate-400 mb-1.5">Intensity</div>
            <div className="flex gap-1">
              <div className="w-4 h-2 rounded-sm bg-blue-300/40" />
              <div className="w-4 h-2 rounded-sm bg-blue-400/60" />
              <div className="w-4 h-2 rounded-sm bg-blue-500/80" />
              <div className="w-4 h-2 rounded-sm bg-red-500/80" />
            </div>
            <div className="flex justify-between text-[8px] text-slate-500 mt-0.5">
              <span>Light</span>
              <span>Heavy</span>
            </div>
          </div>
        </div>

        {/* Timeline Controls */}
        <div className="p-4 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-slate-700"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex-1">
              <Slider
                value={[timeOffset]}
                onValueChange={([v]) => setTimeOffset(v)}
                min={0}
                max={6}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                {timeLabels.map((label, i) => (
                  <span 
                    key={i} 
                    className={cn(
                      "text-[9px]",
                      i === timeOffset ? "text-primary font-medium" : "text-slate-500"
                    )}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Weather Summary */}
        <div className="p-3 border-t border-border/30 bg-background/5">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-3">
              {weatherCells.filter(c => c.type === 'storm').length > 0 && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-destructive"
                >
                  <CloudLightning className="h-3.5 w-3.5" />
                  <span>{weatherCells.filter(c => c.type === 'storm').length} Storm cells</span>
                </motion.div>
              )}
              {weatherCells.filter(c => c.type.includes('rain')).length > 0 && (
                <div className="flex items-center gap-1 text-blue-400">
                  <CloudRain className="h-3.5 w-3.5" />
                  <span>{weatherCells.filter(c => c.type.includes('rain')).length} Rain cells</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Info className="h-3 w-3" />
              <span>50km radius</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

WeatherRadarMap.displayName = 'WeatherRadarMap';

export default WeatherRadarMap;
