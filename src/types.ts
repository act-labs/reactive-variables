import { ApolloError } from "@apollo/client"

export interface GameBoard {
    mode: GameState
    lastError?: ApolloError
    playersType: PlayerType
    totalPlayers: number
    allPeople: {
        people: Person[]
    }
    allStarships: {
        starships: Starship[]
    }
    games: Game[]
}

export interface Game {
    id: string
    mode: PlayerType
    winner: string | undefined
    playerIds: string[]
    scores: Record<string, number>
}

export interface Player {
    id: string
    name: string
    score: number
}

export interface Person extends Player{
}

export interface Starship extends Player{
}

export type PlayerType = "people" | "starships"

export type GameState = "loading" | "playing"