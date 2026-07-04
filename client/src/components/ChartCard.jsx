import React from 'react';
import Card from './Card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const ChartCard = ({
  type = 'line',
  data = [],
  dataKeys = [],
  xAxisKey = 'name',
  colors = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'],
  title,
  subtitle,
  height = 300
}) => {
  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-slate-400 font-bold italic font-sans text-xs">
          No chart data available
        </div>
      );
    }

    const defaultColors = colors;

    switch (type) {
      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {dataKeys.map((key, i) => (
                <linearGradient key={key} id={`color_${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={defaultColors[i % defaultColors.length]} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={defaultColors[i % defaultColors.length]} stopOpacity={0.0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" fontSize={9} fontWeight="bold" />
            <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" />
            <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
            {dataKeys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={defaultColors[i % defaultColors.length]}
                fillOpacity={1}
                fill={`url(#color_${key})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" fontSize={9} fontWeight="bold" />
            <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" />
            <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
            {dataKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={defaultColors[i % defaultColors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'pie':
      case 'donut':
        const isDonut = type === 'donut';
        const activeKey = dataKeys[0] || 'value';
        return (
          <PieChart>
            <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
            <Pie
              data={data}
              dataKey={activeKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="45%"
              innerRadius={isDonut ? 55 : 0}
              outerRadius={75}
              paddingAngle={isDonut ? 3 : 0}
              fill="#8884d8"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={defaultColors[index % defaultColors.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      case 'line':
      default:
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" fontSize={9} fontWeight="bold" />
            <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" />
            <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
            {dataKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={defaultColors[i % defaultColors.length]}
                strokeWidth={2.5}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <Card title={title} subtitle={subtitle} className="border border-slate-200 bg-white hover:border-slate-300 transition-colors p-4">
      <div style={{ width: '100%', height: `${height}px` }} className="mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ChartCard;
