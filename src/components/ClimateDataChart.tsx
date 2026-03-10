
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ClimateDataChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  color?: string;
  title: string;
  unit?: string;
}

const ClimateDataChart: React.FC<ClimateDataChartProps> = ({ 
  data, 
  color = '#10b981', 
  title,
  unit = ''
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-md font-semibold mb-2 text-gray-700">{title}</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }} 
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              unit={unit}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '0.5rem',
                borderColor: '#e5e7eb',
                fontSize: '0.875rem'
              }}
              formatter={(value: number) => [`${value}${unit}`, title]}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              fill={color} 
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClimateDataChart;
