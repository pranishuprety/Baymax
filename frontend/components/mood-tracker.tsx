"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Smile, Frown, Meh } from "lucide-react"
import { motion } from "framer-motion"

interface MoodTrackerProps {
  onClose: () => void
}

export function MoodTracker({ onClose }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [notes, setNotes] = useState("")

  const moods = [
    { name: "Very Happy", icon: <Smile className="h-8 w-8" />, color: "bg-green-500" },
    { name: "Happy", icon: <Smile className="h-8 w-8" />, color: "bg-green-400" },
    { name: "Neutral", icon: <Meh className="h-8 w-8" />, color: "bg-blue-400" },
    { name: "Sad", icon: <Frown className="h-8 w-8" />, color: "bg-yellow-400" },
    { name: "Very Sad", icon: <Frown className="h-8 w-8" />, color: "bg-red-500" },
  ]

  const factors = [
    "Sleep",
    "Exercise",
    "Social",
    "Work",
    "Family",
    "Health",
    "Weather",
    "Food",
    "Relaxation",
    "Accomplishment",
  ]

  const [selectedFactors, setSelectedFactors] = useState<string[]>([])

  const toggleFactor = (factor: string) => {
    if (selectedFactors.includes(factor)) {
      setSelectedFactors(selectedFactors.filter((f) => f !== factor))
    } else {
      setSelectedFactors([...selectedFactors, factor])
    }
  }

  const handleSave = () => {
    // In a real app, you would save the mood data here
    console.log({
      mood: selectedMood,
      factors: selectedFactors,
      notes,
      date: new Date(),
    })
    onClose()
  }

  return (
    <Card className="w-[90vw] max-w-2xl bg-gray-900/90 backdrop-blur-lg border border-purple-500/30 shadow-xl">
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
        <CardTitle className="text-2xl text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-purple-400">
          Mood Diary
        </CardTitle>
        <CardDescription className="text-center text-purple-300">How are you feeling today?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Selection */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-purple-200">Select your mood:</h3>
          <div className="flex justify-between">
            {moods.map((mood) => (
              <motion.button
                key={mood.name}
                className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                  selectedMood === mood.name
                    ? `${mood.color} text-white ring-2 ring-white`
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => setSelectedMood(mood.name)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mood.icon}
                <span className="mt-1 text-xs">{mood.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-purple-200">What factors contributed to your mood?</h3>
          <div className="flex flex-wrap gap-2">
            {factors.map((factor) => (
              <motion.button
                key={factor}
                className={`px-3 py-1 text-sm rounded-full transition-all ${
                  selectedFactors.includes(factor)
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => toggleFactor(factor)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {factor}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-purple-200">Additional notes:</h3>
          <Textarea
            placeholder="Write any thoughts or reflections here..."
            className="bg-gray-800 border-gray-700 focus:border-purple-500"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          onClick={handleSave}
        >
          Save Entry
        </Button>
      </CardFooter>
    </Card>
  )
}
