import FadeIn from '@/components/ui/FadeIn';

export default function Stats() {
  const stats = [
    { label: 'Restaurants Onboarded', value: '500+' },
    { label: 'Menus Scanned Daily', value: '1.2M' },
    { label: 'Average Sales Increase', value: '22%' },
    { label: 'Printing Costs Saved', value: '$2M+' },
  ];

  return (
    <section className="py-20 relative bg-brand-elevated overflow-hidden border-b border-brand-border">
      {/* Decorative Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-elevated via-primary/5 to-brand-elevated pointer-events-none" />

      <div className="max-w-screen-xl mx-auto px-6 relative z-10">
        <FadeIn delay={0.2} direction="up" className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Trusted by top restaurants worldwide
          </h3>
          <p className="text-gray-400 mt-3 text-lg">
            Join the digital dining revolution today.
          </p>
        </FadeIn>

        {/* Numbers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-brand-border/50">
          {stats.map((stat, index) => (
            <FadeIn
              key={index}
              delay={0.3 + index * 0.1}
              direction="up"
              className={`flex flex-col items-center justify-center py-6 px-4
                ${index % 2 === 0 ? 'border-none md:border-l' : ''} 
                ${index === 0 ? 'md:border-none' : ''}`}
            >
              <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-300 mb-2">
                {stat.value}
              </span>
              <span className="text-sm md:text-base font-semibold text-gray-400 uppercase tracking-wider">
                {stat.label}
              </span>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
