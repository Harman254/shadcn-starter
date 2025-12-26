"use client"

import { motion } from "framer-motion"
import { Pacifico } from "next/font/google"
import { CldImage } from 'next-cloudinary'
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { useAuthModal } from "@/components/AuthModalProvider"

 const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-black/[0.15] dark:border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.05),transparent_70%)] dark:after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]",
          )}
        />
      </motion.div>
    </motion.div>
  )
}

const  HeroGeometric = ({
  badge = "Mealwise Nutrition",
  title1 = "Eat Better. Spend Smarter. Plan Faster",
  title2 = "with Mealwise",
  imageSrc = "https://res.cloudinary.com/dcidanigq/image/upload/v1742111996/samples/food/spices.jpg",
}: {
  badge?: string
  title1?: string
  title2?: string
  imageSrc?: string
}) => {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const { open } = useAuthModal()

  const handleGetStarted = () => {
    if (session?.user) {
      // User is signed in, navigate to chat
      router.push('/chat')
    } else {
      // User is signed out, open sign-up modal
      open('sign-up')
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-[#030303]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/[0.15]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between max-w-6xl mx-auto gap-8 md:gap-20">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <motion.div
              custom={0}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] mb-8 md:mb-12"
            >
              <span className="text-sm text-black/60 dark:text-white/60 tracking-wide">{badge}</span>
            </motion.div>

            <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-black to-black/80 dark:from-white dark:to-white/80">{title1}</span>
                <br />
                <span
                  className={cn(
                    "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-black/90 to-rose-500 dark:from-indigo-300 dark:via-white/90 dark:to-rose-300 ",
                    pacifico.className,
                  )}
                >
                  {title2}
                </span>
              </h1>
            </motion.div>

            <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
              <p className="text-base sm:text-lg md:text-xl text-black/60 dark:text-white/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
                we are changing the way you find your meals to make you eat healthy meals with AI
              </p>
            </motion.div>
            <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
              <Button 
                onClick={handleGetStarted} 
                size="lg" 
                disabled={isPending}
                className="bg-gradient-to-r from-rose-500 to-indigo-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Loading...' : 'Generate a Meal Plan'}
              </Button>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 60, rotate: 6 }}
            animate={{ opacity: 1, y: 0, rotate: 6 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.23, 0.86, 0.39, 0.96] }}
            className="w-full md:w-1/2 flex justify-center items-center mb-12 md:mb-0 relative"
            style={{ zIndex: 20 }}
            aria-hidden="true"
          >
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] md:w-[110%] md:h-[110%] rounded-3xl bg-gradient-to-br from-rose-400/30 via-indigo-400/20 to-amber-300/20 blur-3xl opacity-80" />
            <div className="p-[3px] rounded-3xl bg-gradient-to-r from-indigo-400 via-rose-400 to-amber-300">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-3xl overflow-hidden"
              >
                <CldImage
                  src={imageSrc}
                  alt="Mealwise hero food spices"
                  width={700}
                  height={520}
                  className="rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 object-cover max-h-[480px] w-full md:w-[600px] lg:w-[700px] scale-105 md:scale-110 rotate-6 bg-white/80 dark:bg-[#18181b]/80"
                  draggable={false}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#030303] via-transparent to-transparent pointer-events-none" />
    </div>
  )
}


 export default  HeroGeometric
