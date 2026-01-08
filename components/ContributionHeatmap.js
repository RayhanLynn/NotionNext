import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 关键：禁用服务端渲染，只在浏览器加载热力图组件
const CalendarHeatmap = dynamic(() => import('react-calendar-heatmap'), {
  ssr: false,
  loading: () => <div>加载热力图中...</div>
});
const ReactTooltip = dynamic(() => import('react-tooltip'), {
  ssr: false
});

// 自定义颜色梯度（保留你原来的）
const COLOR_RANGE = [
  '#eeeeee', // 无数据
  '#fffbda', // 少量
  '#ffe066', // 中量
  '#ffb300', // 多量
  '#ff6b00', // 大量
  '#d9380c', // 极大量
];

const ContributionHeatmap = ({ posts }) => {
  // 新增：标记是否在浏览器环境
  const [isClient, setIsClient] = useState(false);
  const [heatmapData, setHeatmapData] = useState([]);
  const [maxCount, setMaxCount] = useState(1);

  // 只在浏览器端执行数据处理
  useEffect(() => {
    setIsClient(true); // 确认是浏览器环境
    if (!posts.length) return;

    const dateCountMap = {};
    posts.forEach(post => {
      // 优先用 publishDate（NotionNext 标准字段），兼容 createdTime
      const dateStr = post.publishDate 
        ? new Date(post.publishDate).toISOString().split('T')[0]
        : post.createdTime?.split('T')[0];
      if (!dateStr) return;
      dateCountMap[dateStr] = (dateCountMap[dateStr] || 0) + 1;
    });

    const data = Object.entries(dateCountMap).map(([date, count]) => ({ date, count }));
    const counts = Object.values(dateCountMap);
    setMaxCount(counts.length ? Math.max(...counts) : 1);
    setHeatmapData(data);
  }, [posts]);

  const getColorForValue = (value) => {
    if (!value) return COLOR_RANGE[0];
    const ratio = value / maxCount;
    if (ratio < 0.2) return COLOR_RANGE[1];
    if (ratio < 0.4) return COLOR_RANGE[2];
    if (ratio < 0.6) return COLOR_RANGE[3];
    if (ratio < 0.8) return COLOR_RANGE[4];
    return COLOR_RANGE[5];
  };

  // 服务端时不渲染任何内容，避免报错
  if (!isClient) return null;

  return (
    <div className="contribution-heatmap-container py-8 px-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">
        文章发布热力图
      </h2>

      <CalendarHeatmap
        startDate={new Date(new Date().getFullYear() - 1, 0, 1)}
        endDate={new Date()}
        values={heatmapData}
        showMonthLabels={true}
        showWeekdayLabels={true}
        weekdayLabels={['日', '一', '二', '三', '四', '五', '六']}
        monthLabels={['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']}
        classForValue={(value) => `color-${value ? value.count : 0}`}
        tooltipDataAttrs={(value) => ({
          'data-tip': value ? `${value.date}：发布 ${value.count} 篇文章` : '无发布',
        })}
        onClick={(value) => {
          if (value) alert(`${value.date} 发布了 ${value.count} 篇文章`);
        }}
        style={{
          width: '100%',
          '--color-empty': COLOR_RANGE[0],
          '--color-low': COLOR_RANGE[1],
          '--color-medium': COLOR_RANGE[3],
          '--color-high': COLOR_RANGE[5],
        }}
        transformValue={(value) => getColorForValue(value?.count)}
      />

      <div className="flex items-center justify-center mt-6 gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">Less</span>
        {COLOR_RANGE.map((color, index) => (
          <div
            key={index}
            style={{ backgroundColor: color }}
            className="w-6 h-6 rounded-sm border border-gray-200 dark:border-gray-700"
          />
        ))}
        <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">More</span>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
        数据来源：我的 Notion 博客
      </p>

      <ReactTooltip />
    </div>
  );
};

export default ContributionHeatmap;
