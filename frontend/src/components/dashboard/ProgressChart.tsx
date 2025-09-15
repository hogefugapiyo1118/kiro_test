import type React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface WeeklyProgressData {
  date: string
  wordsStudied: number
  correctAnswers: number
  accuracy: number
}

interface ProgressChartProps {
  weeklyProgress: WeeklyProgressData[]
  chartType?: 'line' | 'bar'
}

const ProgressChart: React.FC<ProgressChartProps> = ({ 
  weeklyProgress, 
  chartType = 'line' 
}) => {
  // Format dates for display (MM/DD format)
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // Prepare chart data
  const labels = weeklyProgress.map(data => formatDate(data.date))
  
  const chartData = {
    labels,
    datasets: [
      {
        label: '学習単語数',
        data: weeklyProgress.map(data => data.wordsStudied),
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: chartType === 'line',
      },
      {
        label: '正解数',
        data: weeklyProgress.map(data => data.correctAnswers),
        borderColor: 'rgb(34, 197, 94)', // green-500
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.3,
        fill: false,
      }
    ]
  }

  const accuracyData = {
    labels,
    datasets: [
      {
        label: '正解率 (%)',
        data: weeklyProgress.map(data => data.accuracy),
        borderColor: 'rgb(168, 85, 247)', // purple-500
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.3,
        fill: chartType === 'line',
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          }
        }
      },
      title: {
        display: true,
        text: '過去7日間の学習進捗',
        font: {
          size: 14,
          weight: 'bold' as const,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          }
        }
      },
    },
  }

  const accuracyOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
        text: '過去7日間の正解率',
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%'
          }
        }
      },
    },
  }

  const ChartComponent = chartType === 'line' ? Line : Bar

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 学習数グラフ */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="h-64 sm:h-80">
          <ChartComponent data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* 正解率グラフ */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="h-64 sm:h-80">
          <ChartComponent data={accuracyData} options={accuracyOptions} />
        </div>
      </div>

      {/* 学習データサマリー */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">週間サマリー</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {weeklyProgress.reduce((sum, day) => sum + day.wordsStudied, 0)}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">週間学習単語数</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {weeklyProgress.reduce((sum, day) => sum + day.correctAnswers, 0)}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">週間正解数</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {weeklyProgress.length > 0 
                ? Math.round(
                    weeklyProgress.reduce((sum, day) => sum + day.accuracy, 0) / 
                    weeklyProgress.filter(day => day.wordsStudied > 0).length || 0
                  )
                : 0
              }%
            </p>
            <p className="text-xs sm:text-sm text-gray-600">週間平均正解率</p>
          </div>
        </div>
      </div>

      {/* チャートタイプ切り替え（将来の拡張用） */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
        <p className="text-xs sm:text-sm text-gray-600 text-center">
          📊 グラフは過去7日間の学習データを表示しています
        </p>
      </div>
    </div>
  )
}

export default ProgressChart