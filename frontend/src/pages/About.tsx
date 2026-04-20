const HARDWARE_SPECS = [
  { label: '主控', value: '树莓派 4B' },
  { label: '感知', value: '触摸传感器 · 接近检测' },
  { label: '表情', value: 'LCD 屏幕（实时情绪显示）' },
  { label: '语音', value: '麦克风输入 · 扬声器输出' },
  { label: '通信', value: 'Arduino + UART 串口' },
]

export default function About() {
  return (
    <main className="min-h-screen bg-bg-base px-6 py-16">
      <div className="max-w-2xl mx-auto">

        <div className="mb-16">
          <p className="text-xs font-display font-semibold text-text-muted uppercase tracking-widest mb-2">
            关于 Lizo
          </p>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-6">
            软件是灵魂，硬件是容器
          </h1>
          <p className="font-body text-text-secondary leading-relaxed">
            Lizo 是一只住在软件里的小蜥蜴。Web 版让任何人随时陪它说说话，硬件版让它有了真实的身体——能听见你、感受你、在你桌上陪着你。
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-sm font-display font-semibold text-text-secondary mb-5">硬件规格</h2>
          <ul className="flex flex-col gap-3">
            {HARDWARE_SPECS.map(s => (
              <li key={s.label} className="flex items-center justify-between py-3 border-b border-lizo-cream last:border-0">
                <span className="text-sm font-body text-text-muted">{s.label}</span>
                <span className="text-sm font-body text-text-primary">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-display font-semibold text-text-secondary mb-4">关于这个项目</h2>
          <p className="font-body text-sm text-text-secondary leading-relaxed">
            Lizo 是一个探索 AI 陪伴边界的实验项目，结合软件与硬件，试图回答一个问题：当 AI 有了真实的身体，陪伴感会不会不一样？
          </p>
        </div>

      </div>
    </main>
  )
}
