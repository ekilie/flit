"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowRight, ChevronRight, Menu, X, Car, Clock, Shield, Zap } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { GridMotion } from "./ui/grid-motion"

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ")
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
)
CardHeader.displayName = "CardHeader"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
)
CardContent.displayName = "CardContent"

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const defaultItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

function AnimatedGroup({
  children,
  className,
  variants,
}: {
  children: React.ReactNode
  className?: string
  variants?: {
    container?: Variants
    item?: Variants
  }
}) {
  const containerVariants = variants?.container || defaultContainerVariants
  const itemVariants = variants?.item || defaultItemVariants

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className={cn(className)}>
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
}

const menuItems = [
  { name: "Ride", href: "#ride" },
  { name: "Drive", href: "#drive" },
  { name: "Safety", href: "#safety" },
  { name: "About", href: "#about" },
]

const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header>
      <nav data-state={menuState && "active"} className="fixed z-20 w-full px-2 group">
        <div
          className={cn(
            "mx-auto mt-1 max-w-4xl px-4 transition-all duration-300 lg:px-8",
            isScrolled && "bg-background/50 max-w-3xl rounded-2xl border backdrop-blur-lg lg:px-4",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-0">
            <div className="flex w-full justify-between lg:w-auto">
              <a href="/" aria-label="home" className="flex items-center space-x-2">
                <Logo />
              </a>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="text-muted-foreground hover:text-accent-foreground block duration-150"
                    >
                      <span>{item.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button variant="outline" size="sm" className={cn(isScrolled && "lg:hidden")}>
                  <span>Sign In</span>
                </Button>
                <Button
                  size="sm"
                  className={cn(
                    isScrolled
                      ? "lg:inline-flex bg-[oklch(0.532_0.157_131.589)] hover:bg-[oklch(0.532_0.157_131.589)]/90 text-black"
                      : "hidden bg-[oklch(0.532_0.157_131.589)] hover:bg-[oklch(0.532_0.157_131.589)]/90 text-black",
                  )}
                >
                  <span>Get Started</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="bg-[oklch(0.532_0.157_131.589)] rounded-lg p-2">
        <Car className="h-6 w-6 text-black" />
      </div>
      <span className="text-xl font-bold">FLIT</span>
    </div>
  )
}

const CardDecorator = ({ children }: { children: React.ReactNode }) => (
  <div
    aria-hidden
    className="relative mx-auto size-36 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
  >
    <div className="absolute inset-0 [--border:black] dark:[--border:white] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
    <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-t border-l border-[oklch(0.532_0.157_131.589)]">
      {children}
    </div>
  </div>
)

export default function FlitLanding() {
  // const gridItems = [
  //   "/images/vackground-com-aguc-v-d1ii.jpeg",
  //   "/images/barbara-zandoval-w0li3akd14a.jpeg",
  //   "/images/nahrizul-kadri-oasf0qmrwla.jpeg",
  //   "/images/cash-macanaya-x9cemmq4yjm.jpeg",
  //   "/images/luke-jones-ac6ugoesuse.jpeg",
  //   "/images/zhenyu-luo-ke0jmtbvxxm.jpeg",
  //   "/images/vackground-com-7iq4vehlngu.jpeg",
  //   "/images/google-deepmind-tikhth3qrsq.jpeg",
  //   "/images/immo-wegmann-vi1hxpw6hyw.jpeg",
  //   "/images/luke-jones-tbvf46kmwbw.jpeg",
  //   "/images/vackground-com-aguc-v-d1ii.jpeg",
  //   "/images/barbara-zandoval-w0li3akd14a.jpeg",
  //   "/images/nahrizul-kadri-oasf0qmrwla.jpeg",
  //   "/images/cash-macanaya-x9cemmq4yjm.jpeg",
  //   "/images/luke-jones-ac6ugoesuse.jpeg",
  //   "/images/zhenyu-luo-ke0jmtbvxxm.jpeg",
  //   "/images/vackground-com-7iq4vehlngu.jpeg",
  //   "/images/google-deepmind-tikhth3qrsq.jpeg",
  //   "/images/immo-wegmann-vi1hxpw6hyw.jpeg",
  //   "/images/luke-jones-tbvf46kmwbw.jpeg",
  //   "/images/vackground-com-aguc-v-d1ii.jpeg",
  //   "/images/barbara-zandoval-w0li3akd14a.jpeg",
  //   "/images/nahrizul-kadri-oasf0qmrwla.jpeg",
  //   "/images/cash-macanaya-x9cemmq4yjm.jpeg",
  //   "/images/luke-jones-ac6ugoesuse.jpeg",
  //   "/images/zhenyu-luo-ke0jmtbvxxm.jpeg",
  // ]

  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block"
        >
          <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(46,100%,56%,.08)_0,hsla(46,100%,56%,.02)_50%,hsla(46,100%,56%,0)_80%)]" />
          <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(46,100%,56%,.06)_0,hsla(46,100%,56%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
        </div>

        <section>
          <div className="relative pt-24 md:pt-36">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"
            />
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  <a
                    href="#ride"
                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                  >
                    <span className="text-foreground text-sm">Premium Special Hire Vehicles At Your Service</span>
                    <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                    <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </a>

                  <h1 className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                    Your Ride,{" "}
                    <span className="inline-block text-[oklch(0.532_0.157_131.589)] text-6xl md:text-7xl xl:text-[5.25rem] font-semibold">
                      On Demand
                    </span>
                  </h1>
                  <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
                    Experience the future of transportation with FLIT. Safe, reliable, and comfortable rides at your
                    fingertips. Book your special hire vehicle in seconds.
                  </p>
                </AnimatedGroup>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-12 flex flex-col items-center justify-center gap-4"
                >
                  <p className="text-sm text-muted-foreground">Download the app</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-xl px-6 h-14 min-w-[200px] flex items-center gap-3 bg-transparent"
                    >
                      <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                      <div className="flex flex-col items-start text-left">
                        <span className="text-xs">Download on the</span>
                        <span className="text-sm font-semibold">App Store</span>
                      </div>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-xl px-6 h-14 min-w-[200px] flex items-center gap-3 bg-transparent"
                    >
                      <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                      </svg>
                      <div className="flex flex-col items-start text-left">
                        <span className="text-xs">GET IT ON</span>
                        <span className="text-sm font-semibold">Google Play</span>
                      </div>
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 my-8">
                    <div className="bg-[oklch(0.532_0.157_131.589)]/10 rounded-[14px] border border-[oklch(0.532_0.157_131.589)]/30 p-0.5">
                      <Button
                        size="lg"
                        className="rounded-xl px-6 text-base bg-[oklch(0.532_0.157_131.589)] hover:bg-[oklch(0.532_0.157_131.589)]/90 text-black font-semibold"
                      >
                        <span className="text-nowrap">Get Early Access</span>
                      </Button>
                    </div>
                    <Button size="lg" variant="ghost" className="h-11 rounded-xl px-6 hover:text-[oklch(0.532_0.157_131.589)]">
                      <span className="text-nowrap">Become a Driver</span>
                    </Button>
                  </div>
                </AnimatedGroup>
              </div>
            </div>

            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                {/* <div
                  aria-hidden
                  className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                />
                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[oklch(0.532_0.157_131.589)]/30 p-4 shadow-lg shadow-[oklch(0.532_0.157_131.589)]/15 ring-1">
                  <div className="bg-gradient-to-br from-[oklch(0.532_0.157_131.589)]/10 to-[oklch(0.532_0.157_131.589)]/5 dark:from-[oklch(0.532_0.157_131.589)]/20 dark:to-[oklch(0.532_0.157_131.589)]/10 aspect-15/8 relative rounded-2xl border border-[oklch(0.532_0.157_131.589)]/30 overflow-hidden">
                    <GridMotion items={gridItems} gradientColor="rgba(245, 199, 36, 0.1)" className="h-full w-full" />
                  </div>
                </div> */}
              </div>

            </AnimatedGroup>
          </div>
        </section>

        <section className="bg-muted/50 py-16 md:py-32 dark:bg-transparent">
          <div className="@container mx-auto max-w-5xl px-6">
            <div className="text-center">
              <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
                Why Choose <span className="text-[oklch(0.532_0.157_131.589)]">FLIT</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Experience premium transportation with our special hire vehicle platform. Safe, reliable, and built for
                your comfort.
              </p>
            </div>
            <Card className="lg:max-w-full lg:grid-cols-3 lg:divide-x lg:divide-y-0 mx-auto mt-8 grid max-w-sm divide-y overflow-hidden shadow-zinc-950/5 border-[oklch(0.532_0.157_131.589)]/30 *:text-center md:mt-16">
              <div className="group shadow-zinc-950/5">
                <CardHeader className="pb-3">
                  <CardDecorator>
                    <Clock className="size-6 text-[oklch(0.532_0.157_131.589)]" aria-hidden />
                  </CardDecorator>

                  <h3 className="mt-6 font-medium">Always Available</h3>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    24/7 service with drivers ready to pick you up anytime, anywhere. Your ride is just a tap away.
                  </p>
                </CardContent>
              </div>

              <div className="group shadow-zinc-950/5">
                <CardHeader className="pb-3">
                  <CardDecorator>
                    <Shield className="size-6 text-[oklch(0.532_0.157_131.589)]" aria-hidden />
                  </CardDecorator>

                  <h3 className="mt-6 font-medium">Safe & Secure</h3>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    All drivers are thoroughly vetted and vehicles are regularly inspected for your peace of mind.
                  </p>
                </CardContent>
              </div>

              <div className="group shadow-zinc-950/5">
                <CardHeader className="pb-3">
                  <CardDecorator>
                    <Zap className="size-6 text-[oklch(0.532_0.157_131.589)]" aria-hidden />
                  </CardDecorator>

                  <h3 className="mt-6 font-medium">Fast & Easy</h3>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Book in seconds with our intuitive app. Track your driver in real-time and pay seamlessly.
                  </p>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t border-[oklch(0.532_0.157_131.589)]/30">
        <div className="mx-auto max-w-7xl py-16 px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <Logo />
              <p className="text-sm text-muted-foreground max-w-xs">
                FLIT is your trusted special hire vehicle platform. Safe, reliable transportation whenever you need it.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 01-1.153-1.772A4.902 4.902 0 015.45 2.525c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Ride */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Ride</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                    Book a Ride
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                    Ride Options
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                    Airport Transfers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                    Business Travel
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Drive */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Drive</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                    Become a Driver
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                    Driver Requirements
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                    Earnings
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                    Driver Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                    Safety
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-12 pt-8 border-t border-[oklch(0.532_0.157_131.589)]/30">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-muted-foreground">© 2025 FLIT. All rights reserved.</div>
              <div className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-2 text-sm">
                <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-muted-foreground hover:text-[oklch(0.532_0.157_131.589)] transition-colors">
                  Accessibility
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
