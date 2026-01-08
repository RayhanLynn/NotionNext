import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import ReactTooltip from 'react-tooltip';

// 自定义颜色梯度（匹配你截图的 Less→More 色系）
const COLOR_RANGE = [
  '#eeeeee', // 无数据
  '#fffbda', // 少量
  '#ffe066', // 中量
  '#ffb300', // 多量
  '#ff6b00', // 大量
  '#d9380c', // 极大量
];

/**
 * 贡献热力图组件
 * @param {Array} posts 所有文章数据（需包含 createdTime/updatedTime）
 */
const ContributionHeatmap = ({ posts }) => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [maxCount, setMaxCount] = useState(1);

  // 处理文章数据，统计每日发布/更新数量
  useEffect(() => {
    if (!posts.length) return;

    // 初始化日期-数量映射
    const dateCountMap = {};

    posts.forEach(post => {
      // 取文章创建时间（也可改用更新时间：post.updatedTime）
      const dateStr = post.createdTime?.split('T')[0]; // 格式：2026-01-08
      if (!dateStr) return;

      // 统计每日数量
      dateCountMap[dateStr] = (dateCountMap[dateStr] || 0) + 1;
    });

    // 转换为热力图需要的格式
    const data = Object.entries(dateCountMap).map(([date, count]) => ({
      date,
      count,
    }));

    // 记录最大数量（用于颜色梯度计算）
    const counts = Object.values(dateCountMap);
    setMaxCount(counts.length ? Math.max(...counts) : 1);
    setHeatmapData(data);
  }, [posts]);

  // 根据数量匹配颜色
  const getColorForValue = (value) => {
    if (!value) return COLOR_RANGE[0];
    const ratio = value / maxCount;
    if (ratio < 0.2) return COLOR_RANGE[1];
    if (ratio < 0.4) return COLOR_RANGE[2];
    if (ratio < 0.6) return COLOR_RANGE[3];
    if (ratio < 0.8) return COLOR_RANGE[4];
    return COLOR_RANGE[5];
  };

  return (
    <div className="contribution-heatmap-container py-8 px-4 max-w-5xl mx-auto">
      {/* 标题 */}
      <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">
        文章发布热力图
      </h2>

      {/* 热力图主体 */}
      <CalendarHeatmap
        startDate={new Date(new Date().getFullYear() - 1, 0, 1)} // 显示近1年
        endDate={new Date()}
        values={heatmapData}
        showMonthLabels={true} // 显示月份（五月/六月/七月...）
        showWeekdayLabels={true} // 显示星期（日/一/二...）
        weekdayLabels={['日', '一', '二', '三', '四', '五', '六']} // 中文星期
        monthLabels={['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']} // 中文月份
        classForValue={(value) => {
          return `color-${value ? value.count : 0}`;
        }}
        tooltipDataAttrs={(value) => {
          return {
            'data-tip': value 
              ? `${value.date}：发布 ${value.count} 篇文章` 
              : '无发布',
          };
        }}
        onClick={(value) => {
          if (value) alert(`${value.date} 发布了 ${value.count} 篇文章`);
        }}
        // 自定义单元格样式
        style={{
          width: '100%',
          '--color-empty': COLOR_RANGE[0],
          '--color-low': COLOR_RANGE[1],
          '--color-medium': COLOR_RANGE[3],
          '--color-high': COLOR_RANGE[5],
        }}
        // 覆盖默认颜色
        transformValue={(value) => getColorForValue(value?.count)}
      />

      {/* 图例（Less → More） */}
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

      {/* 数据来源说明 */}
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
        数据来源：我的 Notion 博客
      </p>

      {/* 悬浮提示框 */}
      <ReactTooltip />
    </div>
  );
};

export default ContributionHeatmap;
