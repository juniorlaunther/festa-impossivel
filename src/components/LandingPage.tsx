import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  PartyPopper, 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin, 
  Info, 
  Layers, 
  Compass, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Palette,
  Check,
  Send,
  Loader2,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { createLead } from '../lib/services';
import { 
  type Lead, 
  EVENT_TYPES, 
  GUEST_COUNTS, 
  BUDGET_OPTIONS, 
  LOCATION_OPTIONS, 
  STYLE_OPTIONS, 
  REFERRAL_OPTIONS 
} from '../types';

interface LandingPageProps {
  onAdminClick: () => void;
}

export default function LandingPage({ onAdminClick }: LandingPageProps) {
  const formRef = useRef<HTMLDivElement>(null);

  // Image Slider states
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhlgis-hnGBcc0f-0z9TiPR97A9O2b0OncxQgYmT6R07JdmxrSppMpjE_FP77ZSArtEJGcOi4EJQodwuXUhEhSzazw-pBZ2MhmvJ2IPO9duRn5_TWf1s_f_JZnMBrVi2xfFZovblXEQETdBDPppHDWOF59HZ8KPVbX-KSvskEJ6b7JuIR_m4fhwsF-2evA/w480-h640/arco%202.PNG",
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhlkdN8rLgBWAYGTnD_9vPaPU0GMHGgSH8xu36ga4qaWdzu3R2mwn_zpLmo4Z411Ccd3CYQTEVX4LgmAqrpRjKOlQ_szONW8SXo5s8YupdyTC9-_a9QJ1oQVk6EIsvBS_kfEosdmP2FNrm1mAnPuS54EBpKjvZjInsdT_HG4m0yP5fpTJxcJqmzfS8wiGQ/w480-h640/fogo.png",
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg3TAvIaXc_nzXtme99R4Sj-FUBFBaaSgTbFpTAM8zgybPBsO-ZXtEoj8Xjek-Y2_CLEtZTmaZP-X3IzuxRJr66oK5je2q2rqNEsJiL0h4Hx-gn9RLbNMeqqyBkDHETWB1aU79lAnnlzeCygUshYWh_Z-IfIv5eWZ9PAiFIUo_hY9bahU7btxcVR7UXHwY/w480-h640/mesa.png",
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgYBFbon3E5PEKuFsxSCShyphenhyphenXaBLJt_UIKovTIPPkNNNl3tcvyr8s0E8yGSLKk-AWYTTFr4XBNVtfrxt22WvmmQ9XorcW5FkN8JdGzHhIz3g1VDYK4I0oeWKpDJ915hgbeh2RwNS8tMos2PSRpipuFkry6HYx2dfwcU_IwOc9s0ftm5fLN7HbtWME33NUxs/w480-h640/bolo.png",
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiN_eLU2akwXSoqFzHz91jaExQlehbXfmKASy4w8Yjx4mt-nUX1uLLJRJnEtIo4kKORBZFLVltE_BYnLR5ECSDRh01sWsMsXXUSq-eKglCV83EOpbCBTtWm-UfzhH-e-TSr9JpfYEjswV-BwkO7cmsC7KLW-OoI_GXCCmcuCwFTSMk74EFbKyWUDylWO-w/w480-h640/cantor.png",
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQulH7CRSsvnPAtSEiX8nqyALtwpYvJ3jDBvp85s-tn4wVy09cdfk3Q2kHV1hmAfAucGIX_aW1G5zVO13IukQWalWHqseRI-I25diAWgJWcWYSq_wJ_nk8HoPxovlZjx2LUwjhXZWWystV1nO8pOvgS4brk-oWE1spQOvcmwUpbro5LVFgkb8DYltXxFY/w480-h640/festa.png"
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Autoplay slider (5 seconds interval)
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [hasLocation, setHasLocation] = useState('');
  const [style, setStyle] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [whatsappConsent, setWhatsappConsent] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Formatting phone number (e.g. (99) 99999-9999)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setPhone(value);
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Nome completo é obrigatório';
    if (!phone.trim() || phone.length < 14) errors.phone = 'Insira um WhatsApp válido com DDD';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'E-mail inválido';
    if (!city.trim()) errors.city = 'Cidade do evento é obrigatória';
    if (!eventDate) errors.eventDate = 'Selecione a data planejada';
    if (!eventType) errors.eventType = 'Selecione o tipo de evento';
    if (!guestCount) errors.guestCount = 'Selecione o número aproximado de convidados';
    if (!budget) errors.budget = 'Selecione a faixa de orçamento desejada';
    if (!description.trim()) errors.description = 'Conte-nos um pouco sobre a festa que deseja realizar';
    if (!hasLocation) errors.hasLocation = 'Informe se já tem o local definido';
    if (!style) errors.style = 'Selecione qual estilo tem mais a sua cara';
    if (!referredBy) errors.referredBy = 'Diga como conheceu o Ju';
    if (!whatsappConsent) errors.whatsappConsent = 'Por favor, autorize o contato pelo WhatsApp';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) {
      const firstError = Object.keys(validationErrors)[0] || 'form';
      const element = document.getElementById(firstError);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await createLead({
        fullName,
        phone,
        email,
        city,
        eventDate,
        eventType,
        guestCount,
        budget,
        description,
        hasLocation,
        style,
        referredBy,
        whatsappConsent,
      });
      setSubmitted(true);
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocorreu um erro ao enviar sua proposta. Verifique os dados ou tente novamente em breve.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-[#1E1B24] font-sans overflow-x-hidden">
      {/* HEADER WITH LOGO ON BRAND PURPLE WITH PRISTINE NEON PROMINENCE */}
      <header className="relative w-full bg-[#0a0013] border-b border-purple-950/40 flex flex-col items-center justify-center py-6 px-4 shadow-2xl z-20 overflow-hidden">
        {/* Subtle top neon ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-12 bg-purple-500/10 blur-xl pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand Presentation Stack */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#eab308] mb-1 flex items-center gap-1.5">
              <span>Um Reality de</span>
              <img 
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiGZY0WLDaU3wa-xnz40IekwaDxJ0vhYLBaTJfE8eZ_d3PLTYbO6LBtXdgtvYrZY6pRum8GQe3vImBtsBARxJOEIRn8vmw6FrRTtH7n_t2IkKwuVrSL95_zcDxv_NDrbL3DVY2rnVhlKg_V1pdepZBwV0Et2V4xz6y4JoL6WvjglDfJk_ICGW-MghJ5FFc/s1600/LOGO%20-%20A%20casa%20do%20Ju%20-%20fundo%20transparente%20branco.png" 
                alt="A casa do Ju" 
                className="h-4.5 object-contain inline-block drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                referrerPolicy="no-referrer"
              />
            </span>
          </div>

          {/* Primary Festa Impossível Logo Promo (Large & Dominant) */}
          <div className="flex justify-center items-center">
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhG8KSZfqZqZCV8JnjwkrJWN0AzL0l5qtPBoajWl46SNGlnIpgjgON-KRyHkeKwXzKhKEIwNU08m17rpGu4mNIBynRjgJtsKeXX0IkYUNaUIAf3pii2h0THYPfEHAXxmoMetpg3Ckq6fiUcHpRyWBg3lt0NSOXznze1TYYNMN8nddO_vOW0aJQe87IxQD8/w640-h346/letreiro.png" 
              alt="Festa Impossível Logo" 
              className="h-26 sm:h-[97px] md:h-[114px] object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.45)] transition-transform hover:scale-[1.02] duration-300"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Upper Quick Casting button */}
          <div className="hidden md:flex items-center">
            <button
              onClick={scrollToForm}
              className="text-xs bg-purple-950/50 hover:bg-purple-900/40 text-purple-200 hover:text-white px-4 py-2 border border-purple-800/40 rounded-xl font-extrabold tracking-wide transition-all uppercase cursor-pointer"
            >
              Inscrição / Casting
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION - 3:4 RATIO SLIDE SHOW IN BACKGROUND */}
      <section className="relative min-h-[60vh] sm:min-h-[75vh] py-10 sm:py-16 px-4 bg-[#0a0013] text-white overflow-hidden border-b border-purple-950/30 z-10 flex flex-col items-center justify-center">
        {/* Absolute 3:4 Backplate Frame in the center of background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
          {/* Sized container maintaining standard 3:4 aspect ratio with strict overflow containment and rounded border clipping */}
          <div className="relative w-full max-w-[280px] sm:max-w-[390px] aspect-[3/4] opacity-65 sm:opacity-80 filter scale-110 sm:scale-120 rounded-[32px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide}
                src={slides[currentSlide]}
                alt="Festa Impossível Background Aspect 3:4"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full h-full object-cover rounded-[32px] absolute inset-0 z-0"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            {/* Ambient gradients with explicit z-index to overlay precisely over the crossfading images at all times */}
            <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_35%,_#0a0013_95%] z-10 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0013] via-[#0a0013]/20 to-[#0a0013] z-10 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0013] via-[#0a0013]/25 to-[#0a0013] z-10 pointer-events-none"></div>
          </div>
        </div>

        {/* Ambient surrounding glows for dramatic neon effect */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-[#eab308]/5 blur-[100px] rounded-full pointer-events-none z-0"></div>

        {/* Hero Copy (Text + CTA only) */}
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-4 sm:gap-6 px-2">
          {/* Sparkles selector tag */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-purple-950/70 border border-purple-800/40 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black tracking-[0.2em] text-[#eab308] uppercase"
          >
            <Sparkles className="w-4 h-4 text-[#eab308]" />
            <span>Seleção / Casting Aberto</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05]"
          >
            Seu evento pode ser a próxima <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eab308] via-purple-300 to-white font-black block mt-2 drop-shadow-[0_0_35px_rgba(234,179,8,0.4)]">
              FESTA IMPOSSÍVEL
            </span>
          </motion.h1>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-2 flex flex-col items-center gap-3"
          >
            <button
              onClick={scrollToForm}
              className="group relative inline-flex items-center justify-center gap-3 bg-[#6d06dc] hover:bg-[#5804b3] text-white font-black text-base sm:text-lg px-8 py-4 sm:px-10 sm:py-5 rounded-2xl shadow-[0_12px_35px_rgba(109,6,220,0.45)] transition-all transform hover:-translate-y-1 duration-200 cursor-pointer border border-purple-500/20"
            >
              <span className="absolute inset-x-0 h-px w-1/2 mx-auto bg-gradient-to-r from-transparent via-[#eab308] to-transparent top-0"></span>
              <PartyPopper className="w-5 h-5 text-[#eab308] animate-bounce" />
              <span>Inscrever Meu Evento no Reality</span>
              <ArrowRight className="w-5 h-5 text-slate-200 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">
              ★ APENAS 1 VAGA POR TEMPORADA
            </p>
          </motion.div>
        </div>

        {/* Carousel indicators placed elegantly at the bottom edges of the hero page */}
        <div className="absolute bottom-6 flex gap-2 z-10 pointer-events-auto">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${idx === currentSlide ? 'w-6 bg-[#eab308]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
              aria-label={`Foto de fundo ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* THE CONCEPT & REALITY DETAIL SECTION */}
      <section className="relative py-12 sm:py-16 px-6 bg-gradient-to-b from-[#0a0013] to-[#120021] text-white border-b border-purple-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_right_bottom,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14 items-center">
            {/* Left Accent Badge/Visual */}
            <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-4">
              <div className="w-16 h-1 bg-[#eab308] rounded-full"></div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#eab308]">
                Os Bastidores Cenográficos
              </span>
              <h2 className="text-3xl font-black leading-none text-white uppercase tracking-tight">
                A Alma do <br className="hidden md:inline" /> Reality Show
              </h2>
              <p className="text-xs text-purple-300/60 font-mono uppercase tracking-widest">
                "Não fazemos apenas festas, materializamos sonhos extraordinários."
              </p>
            </div>

            {/* Right Main Copy Blocks */}
            <div className="md:col-span-8 space-y-6 md:border-l md:border-purple-950/40 md:pl-10 text-neutral-300 text-base md:text-lg leading-relaxed text-justify md:text-left">
              <p className="font-medium text-white/95">
                O <strong className="text-white hover:text-[#eab308] border-b border-[#eab308]/40 transition bg-gradient-to-r from-yellow-300/10 to-yellow-300/0 px-1">Festa Impossível</strong> é um aclamado reality criado e apresentado pelo Ju, onde ele mostra o processo real de transformar festas comuns em experiências visuais extraordinárias mesmo superando prazos apertados, orçamento limitado, desafios cenográficos complexos e muita coisa para resolver de última hora.
              </p>
              <p className="text-purple-100/90 text-sm md:text-base border-t border-purple-950/20 pt-4 leading-relaxed">
                Seu evento não precisa ser comum. Inscreva a sua ideia de celebração para se tornar o tema da próxima temporada do reality e tenha o Ju liderando todo o design, improvisos geniais e transformação estética diante dos holofotes para criar um marco histórico na sua vida!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE EXPLANATION SECTION (Casting audição explicada) - 100% HORIZONTAL HEIGHT */}
      <section className="relative py-10 sm:py-16 px-5 sm:px-12 bg-[#120124] text-white w-full border-b border-purple-950/50">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/20 via-transparent to-purple-950/20 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-yellow-500/5 blur-[120px] pointer-events-none rounded-full"></div>
        
        <div className="max-w-6xl mx-auto relative z-10 w-full">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Left Column Header Info */}
            <div className="w-full lg:w-5/12 space-y-5">
              <div className="inline-flex items-center gap-2 bg-[#eab308] text-slate-950 font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-widest">
                <Compass className="w-3.5 h-3.5 animate-spin-slow text-slate-950" />
                <span>Como Funciona a Audição</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight uppercase">
                Seleção de Projetos <br />
                para a Temporada
              </h2>
              <p className="text-purple-100/80 text-sm sm:text-base leading-relaxed">
                Esta página é uma <strong>porta de entrada exclusiva</strong> onde o Ju analisa seu plano pessoalmente. Ele seleciona celebrações autênticas, com histórias marcantes e desafios cenográficos que deem excelentes episódios!
              </p>
            </div>
 
            {/* Right Column Pillars & Disclaimer */}
            <div className="w-full lg:w-7/12 space-y-8">
              {/* Feature pillars with unique unsynchronized glowing pulses */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Expressão Artística Card */}
                <motion.div 
                  animate={{ 
                    borderColor: ["rgba(168, 85, 247, 0.35)", "rgba(234, 179, 8, 0.7)", "rgba(168, 85, 247, 0.35)"],
                    backgroundColor: ["rgba(24, 8, 48, 0.45)", "rgba(48, 12, 92, 0.75)", "rgba(24, 8, 48, 0.45)"],
                    boxShadow: [
                      "0 0 15px rgba(147, 51, 234, 0.25)",
                      "0 0 38px rgba(147, 51, 234, 0.55)",
                      "0 0 15px rgba(147, 51, 234, 0.25)"
                    ]
                  }}
                  transition={{ 
                    duration: 4.2, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0 
                  }}
                  className="relative flex flex-col gap-3 p-5 rounded-2xl border overflow-hidden"
                >
                  {/* Slow breathing neon-purple interior background wash */}
                  <motion.div
                    animate={{
                      opacity: [0.25, 0.65, 0.25],
                      scale: [1.0, 1.45, 1.0]
                    }}
                    transition={{
                      duration: 4.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0
                    }}
                    className="absolute -right-8 -bottom-8 w-32 h-32 bg-purple-500/60 rounded-full blur-xl pointer-events-none z-0"
                  />
                  
                  <div className="relative z-10 text-[#eab308] bg-white/5 p-2 rounded-xl w-fit border border-white/5">
                    <Palette className="w-5 h-5 text-[#eab308]" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="font-extrabold text-sm text-white">Expressão Artística</h4>
                    <p className="text-xs text-purple-200/80 leading-normal mt-1">Sua personalidade contada através de peças audaciosas e um visual original do zero.</p>
                  </div>
                </motion.div>

                {/* Acompanhamento Real Card */}
                <motion.div 
                  animate={{ 
                    borderColor: ["rgba(168, 85, 247, 0.35)", "rgba(234, 179, 8, 0.7)", "rgba(168, 85, 247, 0.35)"],
                    backgroundColor: ["rgba(24, 8, 48, 0.45)", "rgba(56, 38, 12, 0.65)", "rgba(24, 8, 48, 0.45)"],
                    boxShadow: [
                      "0 0 15px rgba(234, 179, 8, 0.2)",
                      "0 0 38px rgba(234, 179, 8, 0.5)",
                      "0 0 15px rgba(234, 179, 8, 0.2)"
                    ]
                  }}
                  transition={{ 
                    duration: 5.0, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1.4 
                  }}
                  className="relative flex flex-col gap-3 p-5 rounded-2xl border overflow-hidden"
                >
                  {/* Slow breathing bright-gold interior background wash */}
                  <motion.div
                    animate={{
                      opacity: [0.22, 0.62, 0.22],
                      scale: [0.9, 1.35, 0.9]
                    }}
                    transition={{
                      duration: 5.0,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.4
                    }}
                    className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#eab308]/35 rounded-full blur-xl pointer-events-none z-0"
                  />

                  <div className="relative z-10 text-[#eab308] bg-white/5 p-2 rounded-xl w-fit border border-white/5">
                    <Layers className="w-5 h-5 text-[#eab308]" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="font-extrabold text-sm text-white">Acompanhamento Real</h4>
                    <p className="text-xs text-purple-200/80 leading-normal mt-1">Direção de arte integrada, controle orçamentário transparente e soluções engenhosas.</p>
                  </div>
                </motion.div>

                {/* Mágica de TV Card */}
                <motion.div 
                  animate={{ 
                    borderColor: ["rgba(168, 85, 247, 0.35)", "rgba(234, 179, 8, 0.7)", "rgba(168, 85, 247, 0.35)"],
                    backgroundColor: ["rgba(24, 8, 48, 0.45)", "rgba(50, 12, 70, 0.75)", "rgba(24, 8, 48, 0.45)"],
                    boxShadow: [
                      "0 0 15px rgba(219, 39, 119, 0.25)",
                      "0 0 38px rgba(219, 39, 119, 0.55)",
                      "0 0 15px rgba(219, 39, 119, 0.25)"
                    ]
                  }}
                  transition={{ 
                    duration: 4.6, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.7 
                  }}
                  className="relative flex flex-col gap-3 p-5 rounded-2xl border overflow-hidden"
                >
                  {/* Slow breathing fuchsia/pink-magic interior background wash */}
                  <motion.div
                    animate={{
                      opacity: [0.24, 0.64, 0.24],
                      scale: [1.0, 1.45, 1.0]
                    }}
                    transition={{
                      duration: 4.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.7
                    }}
                    className="absolute -right-8 -bottom-8 w-32 h-32 bg-fuchsia-500/45 rounded-full blur-xl pointer-events-none z-0"
                  />

                  <div className="relative z-10 text-[#eab308] bg-white/5 p-2 rounded-xl w-fit border border-white/5">
                    <Sparkles className="w-5 h-5 text-[#eab308]" />
                  </div>
                  <div className="relative z-10 font-sans">
                    <h4 className="font-extrabold text-sm text-white">Mágica de TV</h4>
                    <p className="text-xs text-purple-200/80 leading-normal mt-1">Vivencie os bastidores reais completos, da montagem frenética ao espetáculo final com o Ju.</p>
                  </div>
                </motion.div>
              </div>
 
              {/* Operational triagem info */}
              <div className="p-4 bg-purple-950/40 rounded-xl border border-purple-900/40 text-purple-100/70 text-xs leading-relaxed">
                <p className="font-extrabold text-[#eab308] uppercase tracking-widest text-[10px] mb-1">PROCESSO SELETIVO</p>
                O preenchimento destas informações inicia a triagem cenográfica. Sendo selecionado, entraremos em contato via WhatsApp para apresentar o orçamento comercial do projeto de cenografia e direção estética sob medida para seu evento.
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FORM SECTION / SUCCESS STATE CONTAINER */}
      <section ref={formRef} className="py-8 sm:py-14 px-4 max-w-4xl mx-auto flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form-container"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full bg-white rounded-3xl p-5 sm:p-10 shadow-2xl border border-slate-100"
            >
              <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
                <div className="bg-[#6d06dc] hover:-rotate-12 transition-transform duration-300 w-12 h-12 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-[0_5px_15px_rgba(109,6,220,0.3)]">
                  <Palette className="w-6 h-6 text-[#eab308]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B24]">
                  Ficha de Inscrição & Seleção
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-2">
                  Preencha todos os campos reais da sua celebração. Dedique atenção máxima ao descrever os detalhes e a atmosfera do seu projeto. O Ju vai analisar cada ficha pessoalmente!
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. SEÇÃO DE INFORMAÇÕES PESSOAIS */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#6d06dc] flex items-center gap-2 border-b border-purple-50 pb-2">
                    <span className="w-5 h-5 rounded-full bg-[#6d06dc] text-white flex items-center justify-center text-[10px]">1</span>
                    Seus Contatos Individuais
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nome Completo */}
                    <div id="fullName" className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Nome completo <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Amanda Silva Vasconcelos"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border ${validationErrors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-[#6d06dc] focus:ring-[#6d06dc]/20'} bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-4 transition-all`}
                      />
                      {validationErrors.fullName && <p className="text-red-500 text-[11px] font-medium">{validationErrors.fullName}</p>}
                    </div>

                    {/* Telefone com WhatsApp */}
                    <div id="phone" className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Celular / WhatsApp <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        placeholder="(DDD) 99999-9999"
                        value={phone}
                        onChange={handlePhoneChange}
                        className={`w-full px-4 py-3 rounded-xl border ${validationErrors.phone ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-[#6d06dc] focus:ring-[#6d06dc]/20'} bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-4 transition-all`}
                      />
                      {validationErrors.phone && <p className="text-red-500 text-[11px] font-medium">{validationErrors.phone}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <div id="email" className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">E-mail <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      required
                      placeholder="amanda@exemplo.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${validationErrors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-[#6d06dc] focus:ring-[#6d06dc]/20'} bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-4 transition-all`}
                    />
                    {validationErrors.email && <p className="text-red-500 text-[11px] font-medium">{validationErrors.email}</p>}
                  </div>
                </div>

                {/* 2. DETALHES DO EVENTO */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#6d06dc] flex items-center gap-2 border-b border-purple-50 pb-2">
                    <span className="w-5 h-5 rounded-full bg-[#6d06dc] text-white flex items-center justify-center text-[10px]">2</span>
                    Logística do Evento
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Cidade onde o evento vai acontecer */}
                    <div id="city" className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Cidade e Estado <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: São Paulo - SP"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border ${validationErrors.city ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-[#6d06dc] focus:ring-[#6d06dc]/20'} bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-4 transition-all`}
                      />
                      {validationErrors.city && <p className="text-red-500 text-[11px] font-medium">{validationErrors.city}</p>}
                    </div>

                    {/* Data prevista do evento */}
                    <div id="eventDate" className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Data prevista <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input 
                          type="date" 
                          required
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border ${validationErrors.eventDate ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-[#6d06dc] focus:ring-[#6d06dc]/20'} bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-4 transition-all`}
                        />
                      </div>
                      {validationErrors.eventDate && <p className="text-red-500 text-[11px] font-medium">{validationErrors.eventDate}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Tipo de evento */}
                    <div id="eventType" className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Tipo de evento <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className={`w-full px-3 py-3 rounded-xl border ${validationErrors.eventType ? 'border-red-500' : 'border-slate-200'} bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6d06dc]/20 transition-all`}
                      >
                        <option value="">Selecione...</option>
                        {EVENT_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {validationErrors.eventType && <p className="text-red-500 text-[11px] font-medium">{validationErrors.eventType}</p>}
                    </div>

                    {/* Quantidade aproximada de convidados */}
                    <div id="guestCount" className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Nº de convidados <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        className={`w-full px-3 py-3 rounded-xl border ${validationErrors.guestCount ? 'border-red-500' : 'border-slate-200'} bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6d06dc]/20 transition-all`}
                      >
                        <option value="">Selecione...</option>
                        {GUEST_COUNTS.map((count) => (
                          <option key={count} value={count}>{count}</option>
                        ))}
                      </select>
                      {validationErrors.guestCount && <p className="text-red-500 text-[11px] font-medium">{validationErrors.guestCount}</p>}
                    </div>

                    {/* Orçamento aproximado para decoração */}
                    <div id="budget" className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Verba para Decoração <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className={`w-full px-3 py-3 rounded-xl border ${validationErrors.budget ? 'border-red-500' : 'border-slate-200'} bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6d06dc]/20 transition-all`}
                      >
                        <option value="">Selecione...</option>
                        {BUDGET_OPTIONS.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                      {validationErrors.budget && <p className="text-red-500 text-[11px] font-medium">{validationErrors.budget}</p>}
                    </div>
                  </div>
                </div>

                {/* 3. PROPOSTA ARTÍSTICA E PREFERÊNCIAS */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#6d06dc] flex items-center gap-2 border-b border-purple-50 pb-2">
                    <span className="w-5 h-5 rounded-full bg-[#6d06dc] text-white flex items-center justify-center text-[10px]">3</span>
                    Alineamento Artístico & Sintonia
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Já tem local definido? */}
                    <div id="hasLocation" className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Já tem local definido? <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={hasLocation}
                        onChange={(e) => setHasLocation(e.target.value)}
                        className={`w-full px-3 py-3 rounded-xl border ${validationErrors.hasLocation ? 'border-red-500' : 'border-slate-200'} bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6d06dc]/20 transition-all`}
                      >
                        <option value="">Selecione...</option>
                        {LOCATION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {validationErrors.hasLocation && <p className="text-red-500 text-[11px] font-medium">{validationErrors.hasLocation}</p>}
                    </div>

                    {/* Qual estilo combina mais? */}
                    <div id="style" className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 font-sans">Estilo que prefere <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className={`w-full px-3 py-3 rounded-xl border ${validationErrors.style ? 'border-red-500' : 'border-slate-200'} bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6d06dc]/20 transition-all`}
                      >
                        <option value="">Selecione...</option>
                        {STYLE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {validationErrors.style && <p className="text-red-500 text-[11px] font-medium">{validationErrors.style}</p>}
                    </div>

                    {/* Como conheceu? */}
                    <div id="referredBy" className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Como conheceu o Ju? <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={referredBy}
                        onChange={(e) => setReferredBy(e.target.value)}
                        className={`w-full px-3 py-3 rounded-xl border ${validationErrors.referredBy ? 'border-red-500' : 'border-slate-200'} bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6d06dc]/20 transition-all`}
                      >
                        <option value="">Selecione...</option>
                        {REFERRAL_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {validationErrors.referredBy && <p className="text-red-500 text-[11px] font-medium">{validationErrors.referredBy}</p>}
                    </div>
                  </div>

                  {/* TEXTAREA Campo Aberto */}
                  <div id="description" className="space-y-1.5 pt-2">
                    <label className="block text-xs font-bold text-slate-700 flex justify-between">
                      <span>Conte um pouco sobre o evento que você sonha em fazer <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">Máx. 1000 caracteres</span>
                    </label>
                    <textarea 
                      required
                      placeholder="Ex: Sonho com uma festa conceitual com cenografia futurista mas acolhedor, inspirada em cores quentes e folhagens secas..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={1000}
                      rows={5}
                      className={`w-full px-4 py-3 rounded-xl border ${validationErrors.description ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-[#6d06dc] focus:ring-[#6d06dc]/20'} bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-4 transition-all resize-y`}
                    />
                    {validationErrors.description && <p className="text-red-500 text-[11px] font-medium">{validationErrors.description}</p>}
                  </div>
                </div>

                {/* CONSENT BOX & SUBMIT BUTTON */}
                <div className="space-y-6 pt-4 border-t border-slate-100">
                  <div id="whatsappConsent" className="relative flex items-start gap-3 bg-[#6d06dc]/5 p-4 rounded-xl border border-[#6d06dc]/15">
                    <div className="flex h-5 items-center">
                      <input
                        id="whatsappConsentCheck"
                        type="checkbox"
                        checked={whatsappConsent}
                        onChange={(e) => setWhatsappConsent(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-350 text-[#6d06dc] focus:ring-[#6d06dc]"
                      />
                    </div>
                    <div className="text-xs text-slate-600">
                      <label htmlFor="whatsappConsentCheck" className="font-bold text-slate-800 cursor-pointer select-none">
                        Autorizo o contato pelo WhatsApp para falar sobre minha solicitação. <span className="text-red-500">*</span>
                      </label>
                      <p className="text-slate-500 mt-1">Concordo em receber mensagens de curadoria e conversas sobre a cenografia da minha festa.</p>
                      {validationErrors.whatsappConsent && <p className="text-red-500 font-medium mt-1">{validationErrors.whatsappConsent}</p>}
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#6d06dc] hover:bg-[#5804b3] text-white font-extrabold text-base px-10 py-4.5 rounded-2xl shadow-[0_10px_20px_rgba(109,6,220,0.3)] transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Submetendo para o Casting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 text-[#eab308]" />
                          <span>Enviar Projeto para Seleção</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            // CONFIRMATION BEAUTIFUL VIEW
            <motion.div
              key="success-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full bg-gradient-to-b from-white to-[#FAF9FC] rounded-3xl p-8 sm:p-16 shadow-2xl border border-slate-100 text-center max-w-2xl mx-auto space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#6d06dc]/10 blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#eab308]/10 blur-2xl"></div>

              {/* Success Badge */}
              <div className="w-20 h-20 rounded-full bg-[#6d06dc]/15 text-[#6d06dc] flex items-center justify-center mx-auto shadow-inner relative">
                <CheckCircle2 className="w-10 h-10 text-[#6d06dc]" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#eab308] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#eab308]"></span>
                </span>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Inscrição Submetida!
                </h2>
                <div className="w-12 h-1 bg-[#6d06dc] mx-auto rounded"></div>
                <p className="text-slate-600 text-base leading-relaxed p-2 max-w-lg mx-auto">
                  Sua comemoração foi registrada com sucesso na base de curadoria da temporada <strong>Festa Impossível</strong>. O Ju analisará os detalhes do projeto e a história contada!
                </p>
              </div>

              {/* Decorative Step guide */}
              <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm text-left max-w-md mx-auto space-y-3">
                <p className="text-xs font-bold text-[#6d06dc] tracking-wider uppercase">Próximos Passos do Casting:</p>
                <div className="flex gap-3 text-xs text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-slate-100 font-bold flex items-center justify-center text-slate-800 shrink-0">1</div>
                  <p><strong>Triagem de Sinopse:</strong> Avaliaremos se o perfil estimula novos episódios da série.</p>
                </div>
                <div className="flex gap-3 text-xs text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-slate-100 font-bold flex items-center justify-center text-slate-800 shrink-0">2</div>
                  <p><strong>Conexão WhatsApp:</strong> Em caso positivo, nossa equipe de cenografia agendará reuniões de entrevista e escopo técnico.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFullName('');
                    setPhone('');
                    setEmail('');
                    setCity('');
                    setEventDate('');
                    setEventType('');
                    setGuestCount('');
                    setBudget('');
                    setDescription('');
                    setHasLocation('');
                    setStyle('');
                    setReferredBy('');
                    setWhatsappConsent(false);
                  }}
                  className="px-6 py-3 border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm rounded-xl cursor-pointer"
                >
                  Enviar Outra Proposta
                </button>
                <div className="inline-flex gap-2 justify-center items-center font-mono text-xs text-slate-400">
                  <Lock className="w-3.5 h-3.5" /> Envio seguro de dados
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#120D1A] text-slate-400 py-12 px-6 border-t border-[#1C1626] text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-2">
          <p className="text-[#FAF9FC] text-sm font-bold flex items-center gap-1.5 justify-center">
            <span>A Casa do Ju</span>
            <span className="w-1 h-1 rounded-full bg-[#eab308]"></span>
            <span className="text-[#a47fff] text-xs font-normal">Festa Impossível</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            © {new Date().getFullYear()} Junior Launther Decorações. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
