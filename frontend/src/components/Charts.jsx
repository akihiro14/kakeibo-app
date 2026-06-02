import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// カテゴリごとの表示色
const CATEGORY_COLORS = {
  食費: '#FF6384',
  日用品: '#36A2EB',
  外食: '#FFCE56',
  交通費: '#4BC0C0',
  娯楽: '#9966FF',
  その他: '#FF9F40',
};

// カテゴリ別円グラフ・月別棒グラフを表示するコンポーネント
export default function Charts({ entries }) {
  // 全エントリのアイテムをフラット化してカテゴリ別に集計
  const allItems = entries.flatMap((e) =>
    (e.items || []).map((item) => ({ ...item, date: e.date }))
  );

  const categoryTotals = allItems.reduce((acc, item) => {
    const cat = item.category || 'その他';
    acc[cat] = (acc[cat] || 0) + (item.price || 0);
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map(
          (cat) => CATEGORY_COLORS[cat] || '#FF9F40'
        ),
      },
    ],
  };

  // エントリの日付から月（YYYY-MM）を抽出して月別支出を集計
  const monthlyTotals = entries.reduce((acc, entry) => {
    const month = (entry.date || '').slice(0, 7);
    if (month) acc[month] = (acc[month] || 0) + (entry.total || 0);
    return acc;
  }, {});

  const sortedMonths = Object.keys(monthlyTotals).sort();

  const barData = {
    labels: sortedMonths,
    datasets: [
      {
        label: '月別支出 (円)',
        data: sortedMonths.map((m) => monthlyTotals[m]),
        backgroundColor: '#36A2EB',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: '月別支出' },
      legend: { display: false },
    },
    scales: {
      y: {
        ticks: { callback: (value) => `¥${value.toLocaleString()}` },
      },
    },
  };

  return (
    <div className="charts-section">
      <div className="chart-wrapper">
        <h3>カテゴリ別支出</h3>
        <Pie data={pieData} />
      </div>
      <div className="chart-wrapper">
        <h3>月別支出</h3>
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
}
