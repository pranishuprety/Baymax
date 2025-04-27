"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Menu } from "lucide-react"

interface MenuItem {
  icon: React.ReactNode
  label: string
  color: string
}

interface FloatingMenuProps {
  items: MenuItem[]
}

export function FloatingMenu({ items }: FloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50">
      <TooltipProvider>
        <div className="flex flex-col items-center space-y-4">
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg"
            onClick={toggleMenu}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <AnimatePresence>
            {isOpen && (
              <div className="flex flex-col space-y-3">
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className={`h-10 w-10 rounded-full ${item.color} text-white shadow-md hover:shadow-lg transition-all`}
                        >
                          {item.icon}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </TooltipProvider>
    </div>
  )
}
