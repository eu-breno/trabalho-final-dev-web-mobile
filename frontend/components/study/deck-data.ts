import {
  Atom,
  BookOpen,
  Code2,
  Dna,
  Languages,
  Landmark,
  type LucideIcon,
} from "lucide-react"

export type StudyDeck = {
  title: string
  subject: string
  description: string
  cards: number
  due: number
  progress: number
  icon: LucideIcon
  color: string
  iconColor: string
}

export const studyDecks: StudyDeck[] = [
  {
    title: "Biologia celular",
    subject: "Biologia",
    description: "Organelas, membrana e metabolismo celular.",
    cards: 42,
    due: 12,
    progress: 68,
    icon: Dna,
    color: "bg-muted",
    iconColor: "text-foreground",
  },
  {
    title: "Inglês para viagens",
    subject: "Idiomas",
    description: "Vocabulário e frases para o dia a dia.",
    cards: 36,
    due: 8,
    progress: 42,
    icon: Languages,
    color: "bg-muted",
    iconColor: "text-foreground",
  },
  {
    title: "Revolução Francesa",
    subject: "História",
    description: "Eventos, personagens e ideias do período.",
    cards: 28,
    due: 0,
    progress: 84,
    icon: Landmark,
    color: "bg-muted",
    iconColor: "text-foreground",
  },
  {
    title: "Fundamentos de programação",
    subject: "Tecnologia",
    description: "Lógica, estruturas e conceitos essenciais.",
    cards: 54,
    due: 16,
    progress: 31,
    icon: Code2,
    color: "bg-muted",
    iconColor: "text-foreground",
  },
  {
    title: "Física: mecânica",
    subject: "Física",
    description: "Movimento, forças e leis de Newton.",
    cards: 31,
    due: 5,
    progress: 57,
    icon: Atom,
    color: "bg-muted",
    iconColor: "text-foreground",
  },
  {
    title: "Literatura brasileira",
    subject: "Literatura",
    description: "Autores, obras e escolas literárias.",
    cards: 24,
    due: 3,
    progress: 73,
    icon: BookOpen,
    color: "bg-muted",
    iconColor: "text-foreground",
  },
]
