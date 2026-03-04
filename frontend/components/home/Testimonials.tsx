import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import FadeIn from '@/components/ui/FadeIn';

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      quote: "Switching to QR menus saved us thousands on printing costs. Whenever we changed our seasonal menu, it used to be a nightmare. Now, it's a click of a button.",
      name: "Sarah Jenkins",
      title: "Owner, The Rustic Spoon",
      rating: 5,
    },
    {
      id: 2,
      quote: "The interface is incredibly intuitive. Our average order value actually increased by 15% because customers can see beautiful photos of every single dish.",
      name: "Marcus Chen",
      title: "Manager, Golden Dragon",
      rating: 5,
    },
    {
      id: 3,
      quote: "Setup took 10 minutes. Within a day, all our tables had their custom QR codes. The fact that it updates instantly right on their phones is magic.",
      name: "Elena Rodriguez",
      title: "Founder, Café Sol",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-brand-base border-b border-brand-border">
      <div className="max-w-screen-xl mx-auto px-6">
        
        {/* Header */}
        <FadeIn delay={0.1} direction="up" className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">Testimonials</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Loved by independent restaurants
          </h3>
          <p className="text-gray-400 text-lg">
            Don't just take our word for it. See what real owners are saying about the platform.
          </p>
        </FadeIn>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <FadeIn
              key={testimonial.id}
              delay={0.2 + (index * 0.15)}
              direction="up"
              className="bg-brand-surface p-8 rounded-2xl border border-brand-border shadow-lg relative flex flex-col h-full"
            >
              {/* Quote Icon Background */}
              <div className="absolute top-6 right-6 text-brand-elevated/40">
                <FaQuoteLeft size={48} />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-6 text-yellow-400 relative z-10">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} size={16} />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-200 text-lg leading-relaxed mb-8 flex-grow relative z-10">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h5 className="font-bold text-white text-base">{testimonial.name}</h5>
                  <p className="text-sm font-medium text-primary">{testimonial.title}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}
