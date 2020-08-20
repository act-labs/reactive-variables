import { InMemoryCache, makeVar, ApolloError } from "@apollo/client"
import { GameState, PlayerType, Game } from "./types"

export const gameState = makeVar<GameState>("loading")
export const lastError = makeVar<ApolloError | null>(null)
export const playerType = makeVar<PlayerType>("people")
export const totalPlayers = makeVar<number>(2)
export const allGames = makeVar<GameInfo[]>([])

export const gameId = (ids: string[]) => ids.join(";")

export class GameInfo implements Game {
    readonly id: string
    readonly mode: PlayerType
    winner: string | undefined = undefined
    readonly playerIds: string[]
    scores: Record<string, number> = {}

    constructor(type: PlayerType, ids: string[]) {
        this.id = gameId(ids)
        this.mode = type
        this.playerIds = ids
    }

    clone() {
        const obj = new GameInfo(this.mode, this.playerIds)
        Object.assign(obj, this)
        return obj
    }

    addScore(id: string, score: number) {
        if (this.winner) {
            return
        }

        this.scores = { ...this.scores, [id]: score || 0 }

        const all = Object.entries(this.scores)

        if (all.length === this.playerIds.length) {
            const [argMax] = all.reduce((max, it) => {
                return max[1] < it[1] ? it : max
            }, all[0])
            this.winner = argMax
        }
    }
}

export const addGame = (type: PlayerType, ids: string[]) => {
    const all = [...allGames()]
    const id = gameId(ids)
    const existing = all.find(g => g.id === id)
    all.unshift(existing || new GameInfo(type, ids))
    allGames(all)
}

export const addGameScore = ({ id, playerId, score }: { id: string; playerId: string; score: number }) => {
    const all = allGames()
    const game = all.find(g => g.id === id)
    if (!game) {
        console.error(`no game found: ${id}`)
        return
    }

    if (!game.winner) {
        const updated = game.clone()
        updated.addScore(playerId, score)
        allGames(all.map(g => (g.id === id && updated) || g))
    }
}

export const createCache = () => {
    const cache = new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    mode: {
                        read() {
                            return gameState()
                        }
                    },
                    lastError: {
                        read() {
                            return lastError()
                        }
                    },
                    totalPlayers: {
                        read() {
                            return totalPlayers()
                        }
                    },
                    playersType: {
                        read() {
                            return playerType()
                        }
                    },
                    games: {
                        read() {
                            return allGames()
                        }
                    }
                }
            }
        }
    })

    return cache
}
