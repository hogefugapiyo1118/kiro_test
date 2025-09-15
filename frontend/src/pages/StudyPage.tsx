import type React from 'react'
import { StudySession } from '../components/study'

const StudyPage: React.FC = () => {
  return (
    <div className="w-full">
      {/* Header section */}
      <div className="mb-6 xl:mb-8">
        <h1 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-2">学習セッション</h1>
        <p className="text-gray-600 hidden xl:block">
          フラッシュカード形式で効率的に単語を学習しましょう
        </p>
      </div>

      {/* Study session with centered layout for large screens */}
      <div className="xl:flex xl:justify-center">
        <div className="xl:max-w-4xl xl:w-full">
          <StudySession sessionLimit={10} />
        </div>
      </div>
    </div>
  )
}

export default StudyPage