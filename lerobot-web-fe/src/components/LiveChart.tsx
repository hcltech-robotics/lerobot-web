import { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, ResponsiveContainer } from 'recharts';

interface DataPoint {
  time: number;
  value: number;
  value2: number;
  value3: number;
  value4: number;
  value5: number;
  value6: number;
}

export function LiveChart() {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        [
          ...prev,
          {
            time: Date.now(),
            value: Math.random() * 100,
            value2: Math.random() * 100,
            value3: Math.random() * 100,
            value4: Math.random() * 100,
            value5: Math.random() * 100,
            value6: Math.random() * 100,
          },
        ].slice(-10),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid stroke="#888" />
        <Line type="monotone" dataKey="value" stroke="#b440bb" dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="value2" stroke="#e3e3e3" dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="value3" stroke="#42cacd" dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="value4" stroke="#41d546" dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="value5" stroke="#dc3942" dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="value6" stroke="#e1e249" dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
