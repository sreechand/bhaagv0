"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ConfirmationModalProps {
  title: string
  message: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmationModal({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative bg-gradient-to-b from-[#0A0A0A] to-[#1C1C2E] rounded-xl max-w-md w-full border border-white/10 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary"></div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={20} />
            <span className="sr-only">Close</span>
          </Button>

          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-exo font-black mb-2">{title}</h2>
              <p className="text-gray-400 font-barlow">{message}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1 bg-black/50 border-white/20 hover:bg-white/5 text-white"
              >
                {cancelText}
              </Button>
              <Button onClick={onConfirm} className="flex-1 btn-primary font-barlow">
                {confirmText}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
