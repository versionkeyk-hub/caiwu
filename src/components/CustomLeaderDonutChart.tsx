import React, { useState } from 'react';

export interface DonutDataItem {
  name: string;
  value: number;
  color: string;
  count?: number;
  percentage: string;
}

interface CustomLeaderDonutChartProps {
  data: DonutDataItem[];
  totalAmount: number;
  width?: number;
  height?: number;
}

export const CustomLeaderDonutChart: React.FC<CustomLeaderDonutChartProps> = ({
  data,
  totalAmount,
  width = 540,
  height = 280
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0 || totalAmount <= 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
        <span>暂无分类支出数据</span>
      </div>
    );
  }

  // Calculate angles
  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = 80;
  const innerRadius = 52;
  const leaderRadius = 92;

  let currentAngle = -Math.PI / 2; // Start from top 12 o'clock

  const slices = data.map((item, idx) => {
    const sliceAngle = (item.value / totalAmount) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    const midAngle = startAngle + sliceAngle / 2;
    currentAngle = endAngle;

    // SVG arc coordinates
    const x1 = cx + outerRadius * Math.cos(startAngle);
    const y1 = cy + outerRadius * Math.sin(startAngle);
    const x2 = cx + outerRadius * Math.cos(endAngle);
    const y2 = cy + outerRadius * Math.sin(endAngle);

    const ix1 = cx + innerRadius * Math.cos(endAngle);
    const iy1 = cy + innerRadius * Math.sin(endAngle);
    const ix2 = cx + innerRadius * Math.cos(startAngle);
    const iy2 = cy + innerRadius * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z'
    ].join(' ');

    const percentNum = parseFloat(item.percentage);

    return {
      ...item,
      index: idx,
      pathData,
      midAngle,
      percentNum
    };
  });

  // Leader line coordinates & collision avoidance
  const rawLeaderItems: Array<{
    slice: typeof slices[0];
    isRight: boolean;
    idealY: number;
    lx1: number;
    ly1: number;
    lx2: number;
    showLeader: boolean;
  }> = slices.map((slice) => {
    const isRight = Math.cos(slice.midAngle) >= 0;
    const lx1 = cx + leaderRadius * Math.cos(slice.midAngle);
    const ly1 = cy + leaderRadius * Math.sin(slice.midAngle);
    const lx2 = cx + (leaderRadius + 14) * Math.cos(slice.midAngle);
    
    // Show leader only for meaningful slices (top items or >= 3%)
    const showLeader = slice.percentNum >= 3.0 || (slice.index < 5 && slice.percentNum >= 1.5);

    return {
      slice,
      isRight,
      idealY: ly1,
      lx1,
      ly1,
      lx2,
      showLeader
    };
  });

  // Separate and relax right and left sides to prevent any overlapping text
  const relaxSide = (items: typeof rawLeaderItems, isRightSide: boolean) => {
    const filtered = items.filter(it => it.isRight === isRightSide && it.showLeader);
    filtered.sort((a, b) => a.idealY - b.idealY);

    const minGap = 22; // minimum vertical spacing between label rows
    const minY = 26;
    const maxY = height - 26;

    // Forward pass
    let currentY = minY;
    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i].idealY < currentY) {
        filtered[i].idealY = currentY;
      }
      currentY = filtered[i].idealY + minGap;
    }

    // Backward pass if exceeded maxY
    if (filtered.length > 0 && filtered[filtered.length - 1].idealY > maxY) {
      filtered[filtered.length - 1].idealY = maxY;
      for (let i = filtered.length - 2; i >= 0; i--) {
        if (filtered[i].idealY > filtered[i + 1].idealY - minGap) {
          filtered[i].idealY = filtered[i + 1].idealY - minGap;
        }
      }
    }

    return filtered;
  };

  const rightLeaders = relaxSide(rawLeaderItems, true);
  const leftLeaders = relaxSide(rawLeaderItems, false);
  const relaxedLeaders = [...rightLeaders, ...leftLeaders];

  return (
    <div className="w-full flex flex-col items-center justify-center relative select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[540px] h-auto"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Center Donut Hole Text */}
        <g className="pointer-events-none">
          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            className="fill-slate-400 text-[11px] font-sans font-medium"
          >
            {hoveredIndex !== null ? data[hoveredIndex]?.name : '支出构成'}
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            className="fill-white text-sm font-bold font-mono tracking-tight"
          >
            {hoveredIndex !== null
              ? `¥${data[hoveredIndex]?.value.toFixed(2)}`
              : `¥${totalAmount.toFixed(0)}`}
          </text>
          {hoveredIndex !== null && (
            <text
              x={cx}
              y={cy + 25}
              textAnchor="middle"
              className="fill-emerald-400 text-[10px] font-mono font-semibold"
            >
              占比 {data[hoveredIndex]?.percentage}%
            </text>
          )}
        </g>

        {/* Donut Slices */}
        <g>
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.index;
            return (
              <path
                key={slice.index}
                d={slice.pathData}
                fill={slice.color}
                opacity={hoveredIndex === null || isHovered ? 1 : 0.45}
                stroke="#0f172a"
                strokeWidth={2}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setHoveredIndex(hoveredIndex === slice.index ? null : slice.index)}
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  transform: isHovered ? 'scale(1.04)' : 'scale(1)'
                }}
              />
            );
          })}
        </g>

        {/* Leader Lines and Callout Text (微信记账本同款防重叠折线标注) */}
        <g className="pointer-events-none">
          {relaxedLeaders.map((item) => {
            const isHovered = hoveredIndex === item.slice.index;
            const textAnchor = item.isRight ? 'start' : 'end';
            const lx3 = item.isRight ? item.lx2 + 20 : item.lx2 - 20;
            const textX = item.isRight ? lx3 + 4 : lx3 - 4;
            const targetY = item.idealY;

            return (
              <g key={`leader-${item.slice.index}`} className="transition-opacity duration-200">
                {/* Leader line polyline connecting anchor point to elbow to horizontal text line */}
                <polyline
                  points={`${item.lx1},${item.ly1} ${item.lx2},${targetY} ${lx3},${targetY}`}
                  fill="none"
                  stroke={item.slice.color}
                  strokeWidth={isHovered ? 2 : 1.2}
                  opacity={isHovered || hoveredIndex === null ? 0.9 : 0.3}
                />
                {/* Anchor dot on circle */}
                <circle
                  cx={item.lx1}
                  cy={item.ly1}
                  r={2.5}
                  fill={item.slice.color}
                />
                {/* Text Label */}
                <text
                  x={textX}
                  y={targetY + 3.5}
                  textAnchor={textAnchor}
                  className="font-sans text-[11px] font-medium transition-all"
                  fill={isHovered ? '#34d399' : '#e2e8f0'}
                >
                  <tspan className="font-semibold">{item.slice.name.slice(0, 4)}</tspan>{' '}
                  <tspan className="fill-slate-400 font-mono text-[10px]">
                    {item.slice.percentage}%
                  </tspan>
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
