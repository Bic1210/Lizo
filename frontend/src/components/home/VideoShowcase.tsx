export default function VideoShowcase() {
  return (
    <section className="bg-lizo-cream px-6 py-20">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-display font-semibold text-text-muted uppercase tracking-widest mb-3">
          看看 Lizo
        </p>
        <h2 className="text-2xl font-display font-bold text-text-primary mb-10">
          它的样子
        </h2>

        {/* Video placeholder — 即梦视频导入后替换 src */}
        <div className="bg-bg-surface border border-lizo-cream rounded-xl overflow-hidden aspect-video flex items-center justify-center">
          <div className="text-center px-8">
            <span className="text-5xl block mb-4 animate-breathe">🦎</span>
            <p className="text-text-secondary font-body text-sm mb-1">正在化妆中…</p>
            <p className="text-text-muted font-body text-xs italic">（Lizo 第一次上镜，有点紧张）</p>
          </div>
        </div>
      </div>
    </section>
  )
}
