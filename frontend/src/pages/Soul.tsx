import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import DiaryList from '../components/soul/DiaryList'
import EmotionChart from '../components/soul/EmotionChart'
import VideoGallery from '../components/soul/VideoGallery'

interface DiaryEntry { date: string; text: string; emotion: string; count: number }
interface EmotionPoint { date: string; score: number; count: number }

export default function Soul() {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([])
  const [emotions, setEmotions] = useState<EmotionPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    Promise.all([
      apiFetch('/api/v1/diary').then(r => r.json()),
      apiFetch('/api/v1/emotion').then(r => r.json()),
    ]).then(([diary, emotion]) => {
      if (diary.status === 'success') setDiaries(diary.data)
      if (emotion.status === 'success') setEmotions(emotion.data)
    }).catch(() => setFetchError(true)).finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-bg-base px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-display font-semibold text-text-muted uppercase tracking-widest mb-2">
            数字人格空间
          </p>
          <h1 className="text-3xl font-display font-bold text-text-primary">
            Lizo 的内心世界
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="text-4xl animate-breathe">🦎</span>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted">
            <span className="text-4xl mb-4">😴</span>
            <p className="font-body text-sm">Lizo 好像睡着了，稍后再来看看？</p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <section>
              <h2 className="text-sm font-display font-semibold text-text-secondary mb-4">情绪曲线</h2>
              <EmotionChart data={emotions} />
            </section>

            <section>
              <h2 className="text-sm font-display font-semibold text-text-secondary mb-4">Lizo 日记</h2>
              <DiaryList entries={diaries} />
            </section>

            <section>
              <h2 className="text-sm font-display font-semibold text-text-secondary mb-4">视频画廊</h2>
              <VideoGallery />
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
