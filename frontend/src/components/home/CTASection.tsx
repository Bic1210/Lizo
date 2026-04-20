import { Link } from 'react-router-dom'
import { focusRing } from '../../lib/styles'

export default function CTASection() {
  return (
    <section className="bg-bg-base px-6 py-24 text-center">
      <div className="max-w-md mx-auto">
        <p className="text-text-muted font-body text-sm mb-6">
          软件版永远免费，硬件版让它更真实
        </p>
        <h2 className="text-3xl font-display font-bold text-text-primary leading-tight mb-10">
          和 Lizo 打个招呼？
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/chat"
            className={`px-8 py-3 bg-lizo-pink text-white font-display font-semibold rounded-xl hover:bg-lizo-pink-deep transition-colors duration-300 ${focusRing}`}
          >
            现在体验
          </Link>
          <Link
            to="/about"
            className={`px-8 py-3 border border-lizo-pink text-lizo-pink font-display font-semibold rounded-xl hover:bg-lizo-cream transition-colors duration-300 ${focusRing}`}
          >
            了解硬件版本 →
          </Link>
        </div>
      </div>
    </section>
  )
}
