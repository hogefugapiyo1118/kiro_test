import type React from 'react'

const DashboardPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">ダッシュボード</h1>
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-600">
          統計・進捗管理機能は次のタスクで実装予定です
        </p>
      </div>
    </div>
  )
}

export default DashboardPage