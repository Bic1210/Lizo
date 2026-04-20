// 即梦视频导入后，将 src 列表替换此处 VIDEOS 数组
const VIDEOS: string[] = []

export default function VideoGallery() {
  if (VIDEOS.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <span className="text-4xl animate-breathe">🦎</span>
        <p className="font-body text-sm text-text-muted">还没有视频。</p>
        <p className="font-body text-xs text-text-muted/60 italic">（我也不太习惯被拍）</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {VIDEOS.map((src, i) => (
        <div key={i} className="aspect-video rounded-lg overflow-hidden bg-lizo-cream">
          <video src={src} className="w-full h-full object-cover" muted playsInline loop />
        </div>
      ))}
    </div>
  )
}
