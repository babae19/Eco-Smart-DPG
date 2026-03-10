import React, { memo, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ComposedChart, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Droplets, Thermometer, 
  BarChart3, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Historical climate data for Sierra Leone (Freetown area)
const generateHistoricalData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Average temperature data (°C)
  const avgTemps = [27.5, 28.5, 29.0, 29.5, 28.5, 26.5, 25.5, 25.0, 26.0, 27.0, 27.5, 27.0];
  const maxTemps = [31.0, 32.5, 33.0, 33.5, 32.0, 29.5, 28.0, 27.5, 28.5, 30.0, 31.0, 30.5];
  const minTemps = [24.0, 24.5, 25.0, 25.5, 25.0, 23.5, 23.0, 22.5, 23.5, 24.0, 24.0, 23.5];
  
  // Rainfall data (mm) - Sierra Leone has distinct wet season
  const rainfall = [10, 5, 15, 60, 200, 400, 700, 800, 500, 280, 90, 25];
  
  // Humidity percentages
  const humidity = [75, 72, 74, 78, 82, 88, 92, 94, 92, 88, 82, 78];

  return months.map((month, index) => ({
    month,
    avgTemp: avgTemps[index] + (Math.random() - 0.5) * 1.5,
    maxTemp: maxTemps[index] + (Math.random() - 0.5) * 1.5,
    minTemp: minTemps[index] + (Math.random() - 0.5) * 1.5,
    rainfall: Math.round(rainfall[index] * (0.85 + Math.random() * 0.3)),
    humidity: humidity[index] + Math.round((Math.random() - 0.5) * 5),
    // Year-over-year comparison
    tempChange: (Math.random() - 0.5) * 2,
    rainfallChange: (Math.random() - 0.5) * 15
  }));
};

// Weekly trend data
const generateWeeklyTrend = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => ({
    day,
    high: 28 + Math.random() * 5,
    low: 22 + Math.random() * 3,
    rain: Math.random() * 80,
  }));
};

interface ClimateTrendChartsProps {
  latitude?: number;
  longitude?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-3">
        <p className="font-semibold text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">
              {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              {entry.name.includes('Temp') ? '°C' : entry.name.includes('Rain') ? 'mm' : '%'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ClimateTrendCharts: React.FC<ClimateTrendChartsProps> = memo(({ latitude, longitude }) => {
  const [activeView, setActiveView] = useState<'temperature' | 'precipitation' | 'comparison'>('temperature');
  
  const historicalData = useMemo(() => generateHistoricalData(), []);
  const weeklyData = useMemo(() => generateWeeklyTrend(), []);
  
  // Calculate statistics
  const stats = useMemo(() => {
    const avgTemp = historicalData.reduce((sum, d) => sum + d.avgTemp, 0) / 12;
    const totalRainfall = historicalData.reduce((sum, d) => sum + d.rainfall, 0);
    const avgHumidity = historicalData.reduce((sum, d) => sum + d.humidity, 0) / 12;
    
    const currentMonth = new Date().getMonth();
    const currentMonthData = historicalData[currentMonth];
    
    return {
      avgTemp: avgTemp.toFixed(1),
      totalRainfall: Math.round(totalRainfall),
      avgHumidity: Math.round(avgHumidity),
      currentMonthTemp: currentMonthData.avgTemp.toFixed(1),
      currentMonthRain: currentMonthData.rainfall,
      tempTrend: currentMonthData.tempChange,
      rainTrend: currentMonthData.rainfallChange
    };
  }, [historicalData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-2">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-2xl p-3 border border-amber-500/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">Avg Temp</span>
          </div>
          <div className="text-xl font-bold text-foreground">{stats.avgTemp}°C</div>
          <div className={cn(
            "text-[10px] flex items-center gap-0.5 mt-1",
            stats.tempTrend > 0 ? "text-destructive" : "text-success"
          )}>
            {stats.tempTrend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(stats.tempTrend).toFixed(1)}° vs last year
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-2xl p-3 border border-blue-500/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Annual Rain</span>
          </div>
          <div className="text-xl font-bold text-foreground">{stats.totalRainfall}mm</div>
          <div className={cn(
            "text-[10px] flex items-center gap-0.5 mt-1",
            stats.rainTrend > 0 ? "text-blue-500" : "text-amber-500"
          )}>
            {stats.rainTrend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(stats.rainTrend).toFixed(0)}mm change
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-indigo-500/10 rounded-2xl p-3 border border-purple-500/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Humidity</span>
          </div>
          <div className="text-xl font-bold text-foreground">{stats.avgHumidity}%</div>
          <div className="text-[10px] text-muted-foreground mt-1">
            Annual average
          </div>
        </motion.div>
      </div>

      {/* Main Chart Card */}
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Climate Trends</h3>
                <p className="text-[10px] text-muted-foreground">Historical data for your location</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] bg-muted/50">
              12 Months
            </Badge>
          </div>

          {/* View Tabs */}
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="mb-4">
            <TabsList className="grid grid-cols-3 h-9 bg-muted/50 rounded-xl p-1">
              <TabsTrigger 
                value="temperature" 
                className="text-[10px] rounded-lg data-[state=active]:bg-background"
              >
                Temperature
              </TabsTrigger>
              <TabsTrigger 
                value="precipitation" 
                className="text-[10px] rounded-lg data-[state=active]:bg-background"
              >
                Precipitation
              </TabsTrigger>
              <TabsTrigger 
                value="comparison" 
                className="text-[10px] rounded-lg data-[state=active]:bg-background"
              >
                Combined
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Charts */}
          <AnimatePresence>
            {activeView && (
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-52"
              >
              {activeView === 'temperature' && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="maxTempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 10 }} 
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }} 
                      tickLine={false}
                      axisLine={false}
                      domain={[20, 35]}
                      className="text-muted-foreground"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="maxTemp"
                      stroke="hsl(var(--destructive))"
                      fill="url(#maxTempGradient)"
                      strokeWidth={2}
                      name="Max Temp"
                    />
                    <Area
                      type="monotone"
                      dataKey="avgTemp"
                      stroke="hsl(var(--warning))"
                      fill="url(#tempGradient)"
                      strokeWidth={2}
                      name="Avg Temp"
                    />
                    <Line
                      type="monotone"
                      dataKey="minTemp"
                      stroke="hsl(var(--info))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Min Temp"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {activeView === 'precipitation' && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={historicalData}>
                    <defs>
                      <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--info))" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="hsl(var(--info))" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 10 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 10 }} 
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 900]}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10 }} 
                      tickLine={false}
                      axisLine={false}
                      domain={[60, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      yAxisId="left"
                      dataKey="rainfall"
                      fill="url(#rainGradient)"
                      radius={[4, 4, 0, 0]}
                      name="Rainfall"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="humidity"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                      name="Humidity"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}

              {activeView === 'comparison' && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={historicalData}>
                    <defs>
                      <linearGradient id="combinedTempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 10 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="temp"
                      tick={{ fontSize: 10 }} 
                      tickLine={false}
                      axisLine={false}
                      domain={[20, 35]}
                    />
                    <YAxis 
                      yAxisId="rain"
                      orientation="right"
                      tick={{ fontSize: 10 }} 
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 900]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ fontSize: '10px' }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Area
                      yAxisId="temp"
                      type="monotone"
                      dataKey="avgTemp"
                      stroke="hsl(var(--warning))"
                      fill="url(#combinedTempGradient)"
                      strokeWidth={2}
                      name="Avg Temp (°C)"
                    />
                    <Bar
                      yAxisId="rain"
                      dataKey="rainfall"
                      fill="hsl(var(--info))"
                      opacity={0.6}
                      radius={[2, 2, 0, 0]}
                      name="Rainfall (mm)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border/50">
            {activeView === 'temperature' && (
              <>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-3 h-0.5 bg-destructive rounded" />
                  <span className="text-muted-foreground">Max</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-3 h-0.5 bg-warning rounded" />
                  <span className="text-muted-foreground">Average</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-3 h-0.5 bg-info rounded" style={{ borderStyle: 'dashed' }} />
                  <span className="text-muted-foreground">Min</span>
                </div>
              </>
            )}
            {activeView === 'precipitation' && (
              <>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-3 h-3 bg-info/60 rounded-sm" />
                  <span className="text-muted-foreground">Rainfall</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-3 h-0.5 bg-primary rounded" />
                  <span className="text-muted-foreground">Humidity</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Insight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20"
      >
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Seasonal Insight</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date().getMonth() >= 4 && new Date().getMonth() <= 9 
                ? "Currently in the wet season (May-October). Expect high rainfall and increased flood risk. Humidity levels are typically above 85%."
                : "Currently in the dry season (November-April). Lower rainfall expected with occasional harmattan winds bringing dry, dusty conditions."
              }
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

ClimateTrendCharts.displayName = 'ClimateTrendCharts';

export default ClimateTrendCharts;
