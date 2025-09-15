import type React from 'react'
import { StudySession } from '../components/study'

const StudyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <StudySession sessionLimit={10} />
      </div>
    </div>
  )
}

export default StudyPage