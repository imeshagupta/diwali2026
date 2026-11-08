const highlights = [
  { title: 'Diya Lighting', emoji: '🪔', text: 'Light up the night with rows of glowing diyas.' },
  { title: 'Rangoli', emoji: '🎨', text: 'Colorful patterns to welcome prosperity home.' },
  { title: 'Sweets', emoji: '🍬', text: 'Share mithai and joy with family and friends.' },
  { title: 'Fireworks', emoji: '🎆', text: 'Celebrate with a sky full of sparkle.' },
]

function App() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-diya-50 via-white to-diya-100 text-slate-800">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-xl font-bold text-diya-600">🪔 Diwali 2026</span>
        <a
          href="#highlights"
          className="rounded-full bg-diya-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-diya-600"
        >
          Explore
        </a>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="flex flex-col items-center gap-4 py-20 text-center">
          <span className="rounded-full bg-diya-100 px-4 py-1 text-sm font-medium text-diya-900">
            Festival of Lights
          </span>
          <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-diya-900 sm:text-6xl">
            Happy Diwali 2026
          </h1>
          <p className="max-w-xl text-lg text-slate-600">
            A celebration of light, prosperity, and togetherness. May your home
            shine brighter than ever this year.
          </p>
          <button
            type="button"
            className="mt-2 rounded-full bg-diya-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-diya-900"
          >
            Celebrate with us
          </button>
        </section>

        <section
          id="highlights"
          className="grid gap-5 pb-20 sm:grid-cols-2 lg:grid-cols-4"
        >
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-diya-100 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-3xl">{item.emoji}</span>
              <h2 className="mt-3 text-lg font-semibold text-diya-900">
                {item.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{item.text}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-diya-100 py-6 text-center text-sm text-slate-500">
        Made with React &amp; Tailwind CSS
      </footer>
    </div>
  )
}

export default App
