interface FeatureCardProps {
  icon: string
  title: string
  desc: string
}

function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="bg-bg-surface border border-lizo-cream rounded-lg p-5 flex flex-col gap-3 hover:border-lizo-pink hover:shadow-sm transition-all duration-300">
      <span className="text-3xl">{icon}</span>
      <h3 className="text-base font-display font-semibold text-text-primary">{title}</h3>
      <p className="text-sm font-body text-text-secondary leading-relaxed">{desc}</p>
    </div>
  )
}

const SOFTWARE_FEATURES = [
  { icon: '💬', title: '文字陪伴', desc: '随时打开浏览器，Lizo 就在，不需要下载任何东西' },
  { icon: '📔', title: '数字日记', desc: 'Lizo 会把每天和你的互动写成日记，悄悄记着你' },
  { icon: '🌙', title: '情绪感知', desc: 'UI 会跟着 Lizo 的心情变化，夜里会变成深色温柔模式' },
]

const HARDWARE_FEATURES = [
  { icon: '🎙️', title: '语音对话', desc: '真正的声音，能听你说话，也能开口回应你' },
  { icon: '🤗', title: '触摸感应', desc: '摸摸它，它会有反应。物理存在感是软件给不了的' },
  { icon: '😊', title: 'LCD 表情', desc: '小小的屏幕显示实时情绪，在你桌上陪着你' },
]

export default function FeatureSection() {
  return (
    <section className="bg-bg-base px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <div className="mb-14">
          <p className="text-xs font-display font-semibold text-text-muted uppercase tracking-widest mb-3">
            软件版 · 免费
          </p>
          <h2 className="text-2xl font-display font-bold text-text-primary mb-8">
            打开浏览器就能开始
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SOFTWARE_FEATURES.map(f => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-display font-semibold text-text-muted uppercase tracking-widest mb-3">
            硬件版 · 实体陪伴
          </p>
          <h2 className="text-2xl font-display font-bold text-text-primary mb-8">
            更多感知，更真实的存在
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HARDWARE_FEATURES.map(f => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
