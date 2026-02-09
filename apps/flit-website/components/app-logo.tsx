import { cn } from "@/lib/utils"
import Image from "next/image"

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Image
        src="/icon-512.png"
        alt="FLIT"
        width={45}
        height={45}
      />
      {/* <span className="text-xl font-bold">FLIT</span> */}
    </div>
  )
}