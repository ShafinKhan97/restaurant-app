import { FaRegStickyNote, FaQrcode, FaUtensils } from 'react-icons/fa';
import FadeIn from '@/components/ui/FadeIn';

export default function Features() {
  const steps = [
    {
      id: 1,
      title: 'Create Your Menu',
      description: 'Add your categories, items, prices, and beautiful photos in minutes using our simple dashboard.',
      icon: <FaRegStickyNote className="w-6 h-6 text-primary" />,
    },
    {
      id: 2,
      title: 'Generate QR Code',
      description: 'Customize your QR code to match your brand and download it instantly for your tables.',
      icon: <FaQrcode className="w-6 h-6 text-primary" />,
    },
    {
      id: 3,
      title: 'Customers Order',
      description: 'Diners scan the code with their smartphone camera and view your rich digital menu right away.',
      icon: <FaUtensils className="w-6 h-6 text-primary" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-brand-surface border-y border-brand-border">
      <div className="max-w-screen-xl mx-auto px-6">
        
        {/* Section Header */}
        <FadeIn delay={0.1} direction="up" className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">How It Works</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            From setup to scanning in 3 easy steps
          </h3>
          <p className="text-gray-400 text-lg">
            No technical skills required. We made the platform incredibly simple so you can focus on what matters most — your food.
          </p>
        </FadeIn>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Decorative Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute top-[44px] left-[16.5%] right-[16.5%] h-[2px] bg-brand-border z-0" />

          {steps.map((step, index) => (
            <FadeIn 
              key={step.id} 
              delay={0.2 + (index * 0.15)} 
              direction="up" 
              className="relative z-10 flex flex-col items-center text-center"
            >
              
              {/* Icon Circle */}
              <div className="w-24 h-24 rounded-full bg-brand-base border-4 border-brand-elevated shadow-lg flex items-center justify-center mb-6 transition-transform duration-300 hover:scale-110 hover:border-primary/50">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {step.icon}
                </div>
              </div>
              
              {/* Number Badge */}
              <div className="absolute top-0 right-1/2 translate-x-12 -translate-y-2 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center border-4 border-brand-surface shadow-md">
                {step.id}
              </div>

              {/* Text Content */}
              <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
              <p className="text-gray-400 leading-relaxed px-4">
                {step.description}
              </p>
            </FadeIn>
          ))}

        </div>
      </div>
    </section>
  );
}
