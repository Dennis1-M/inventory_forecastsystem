import { BarChart, Bar, LineChart, Line, AreaChart, Area, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo } from "react";

const OptimizedChart = ({ data, type = "line", config = {}, height = 300 }) => {
  const {
    xAxisKey = "date",
    title,
    showLegend = true,
    showGrid = true,
    lines = [],
    bars = [],
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
            {lines.length > 0 ? (
              lines.map((line, idx) => (
                <Line
                  key={idx}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.stroke}
                  strokeWidth={2}
                  strokeDasharray={line.strokeDasharray}
                  dot={false}
                  name={line.name}
                />
              ))
            ) : (
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
            )}
          </LineChart>
        )}

        {type === "area" && (
          <AreaChart {...chartProps}>
            {axisProps.grid}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {lines.length > 0 ? (
              lines.map((line, idx) => (
                <Area
                  key={idx}
                  type="monotone"
                  dataKey={line.key}
                  fill={line.stroke}
                  stroke={line.stroke}
                  name={line.name}
                />
              ))
            ) : (
              <Area type="monotone" dataKey="value" fill="#3b82f6" stroke="#3b82f6" />
            )}
          </AreaChart>
        )}

        {type === "bar" && (
          <BarChart {...chartProps}>
            {axisProps.grid}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {axisProps.legend}
            {bars.length > 0 ? (
              bars.map((bar, idx) => (
                <Bar
                  key={idx}
                  dataKey={bar.key}
                  fill={bar.fill}
                  name={bar.name}
                />
              ))
            ) : (
              <Bar dataKey="value" fill="#3b82f6" />
            )}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default OptimizedChart;
