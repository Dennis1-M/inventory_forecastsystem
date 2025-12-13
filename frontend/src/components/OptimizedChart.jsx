import { BarChart, Bar, LineChart, Line, AreaChart, Area, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo } from "react";

const OptimizedChart = ({ data, type = "line", config = {} }) => {
  const {
    dataKey = "value",
    xAxisKey = "date",
    title,
    height = 300,
    color = "#3b82f6",
    showLegend = true,
    showGrid = true,
  } = config;

  // Optimize data - limit to 100 points
  const optimizedData = useMemo(() => {
    if (!data || data.length <= 100) return data;
    
    const step = Math.ceil(data.length / 100);
    return data.filter((_, index) => index % step === 0);
  }, [data]);

  const chartProps = {
    data: optimizedData,
    margin: { top: 5, right: 30, left: 0, bottom: 5 },
  };

  const axisProps = {
    xAxis: <XAxis dataKey={xAxisKey} />,
    yAxis: <YAxis />,
    tooltip: <Tooltip />,
    grid: showGrid ? <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /> : null,
    legend: showLegend ? <Legend /> : null,
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {type === "line" && (
          <LineChart {...chartProps}>
            {axisProps.grid}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {axisProps.legend}
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        )}

        {type === "area" && (
          <AreaChart {...chartProps}>
            {axisProps.grid}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            <Area type="monotone" dataKey={dataKey} fill={color} stroke={color} />
          </AreaChart>
        )}

        {type === "bar" && (
          <BarChart {...chartProps}>
            {axisProps.grid}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {axisProps.legend}
            <Bar dataKey={dataKey} fill={color} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default OptimizedChart;
