// src/types/pet.ts
export type PetMood = 'happy' | 'neutral' | 'sad'

export interface PetReaction {
  text: string
  sub: string
}

export interface FinancialAdvice {
  mood: PetMood
  title: string
  message: string
  badgeColor: string
}