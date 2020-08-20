import React, { useState } from "react"
import { gql, useQuery } from "@apollo/client"
import { Row, Card, defaultTheme, colorTheme } from "./layout"
import { GameBoard, Person, Game, Starship } from "./types"

import { generateRandomInts } from "./utils"
import { useGameURL } from "./useGameURL"

import { gameState, lastError, addGame, addGameScore } from "./cache"
import { useHistory } from "react-router-dom"
import { PageContent, Controls } from "./layout"

import { playerType, totalPlayers } from "./cache"
import { ThemeProvider } from "styled-components"



export const HistoryButton = () => {
    const { slug } = useGameURL()
    const history = useHistory()
    const isHistory = slug === "history"
    const onClick = () => {
        if (isHistory) {
            history.push("/")
        } else {
            history.push("/history")
        }
    }

    return (
        <button onClick={onClick} data-testid="history">{(isHistory && "Last") || "History"}</button>
    )
}

export const PLAY = gql`
  query Game {
    totalPlayers @client
    mode @client
    playersType @client

    allPeople {
      people {
        id
      }
    }
    allStarships {
        starships {
            id
        }
    }
  }
`

export const PlayButton = () => {

    const { data, error } = useQuery<GameBoard>(PLAY)

    if (data && data.mode === "loading") {
        gameState("playing")
    }

    if (error) {
        lastError(error)
    }

    const play = () => {
        if (!data) return

        const { totalPlayers, playersType } = data

        const ids = playersType === "people" ? data["allPeople"]["people"] : data["allStarships"]["starships"]

        const random = generateRandomInts(totalPlayers, ids.length - 1).map(v => ids[v].id)
        addGame(playersType, random)
    }

    return (
        <button data-testid="play" onClick={play}>Play</button>
    )
}

export const PERSON = gql`
  query Person ($id: ID!){
    person(id: $id) {
        name
        score:height
    }
  }
`

export interface GamePlayer {
    gameId: string
    id: string
    winner: boolean
}

export const PersonCard: React.FC<GamePlayer> = React.memo(({ id, gameId, winner }) => {
    const { data, loading, error } = useQuery<{ person: Person }>(PERSON, { variables: { id: id } })

    if (error) {
        console.error(error)
        return <Card>ERROR: {error.message}</Card>
    }
    if (loading || !data) return null

    const { name, score } = data.person
    addGameScore({ score, id: gameId, playerId: id })
    return (
        <Card selected={winner} data-testid={id}>
            <h4>{name}</h4>
            <div>height: {score}</div>
        </Card>
    )
})

export const STARSHIP = gql`
  query Starship ($id: ID!){
    starship(id: $id) {
        name
        score:hyperdriveRating
    }
  }
`

export const StarshipCard: React.FC<GamePlayer> = React.memo(({ id, gameId, winner }) => {
    const { data, loading, error } = useQuery<{ starship: Starship }>(STARSHIP, { variables: { id: id } })

    if (error) {
        console.error(error)
        return <Card>ERROR: {error.message}</Card>
    }
    if (loading || !data) return null

    const { name, score } = data.starship
    addGameScore({ score, id: gameId, playerId: id })
    return (
        <Card selected={winner} data-testid={id}>
            <h4>{name}</h4>
            <div>hyperdrive: {score}</div>
        </Card>
    )
})

export const GameListItem: React.FC<Game> = ({ mode, playerIds, id: gameId, winner }) => {
    const Player = mode === "people" ? PersonCard : StarshipCard

    return (
        <Row data-testid={gameId}>
            {playerIds.map(id => <Player key={id} id={id} gameId={gameId} winner={winner === id} />)}
        </Row>
    )
}

export const GAME_BOARD = gql`
  query GamePanel {
    mode @client
    lastError @client
    games @client
  }
`

export const GamePanel = ({ListItem=GameListItem}) => {
    const { slug } = useGameURL()
    const { data } = useQuery<GameBoard>(GAME_BOARD)

    if (!data) return null

    const { mode, lastError, games } = data

    if (lastError) return <p>ERROR: {lastError.message}</p>
    if (mode === "loading") {
        return <div>loading...</div>
    }

    if (slug === "history") {
        return (
            <>
                {games.map((g, i) => <ListItem key={i} {...g} />)}
            </>
        )
    }

    const lastGame = games[0]

    if (!lastGame) return null

    return <ListItem {...lastGame} />
}

export const GamePage = () => {
    const [theme, setTheme] = useState<string>("white")
    return (
        <ThemeProvider theme={(theme === "color" && colorTheme) || defaultTheme}>
            <PageContent>
                <Controls>
                    <PlayButton />
                    <HistoryButton />
                    <div>
                        <div>people/spaceships</div>
                        <select onChange={e => playerType(e.target.value as any)}>
                            <option value="people">people</option>
                            <option value="spaceship">spaceships</option>
                        </select>
                    </div>
                    <div>
                        <div>players number</div>
                        <select onChange={e => totalPlayers(parseInt(e.target.value))}>
                            <option>2</option>
                            <option>3</option>
                        </select>
                    </div>
                    <div>
                        <div>theme</div>
                        <select onChange={e => setTheme(e.target.value)}>
                            <option>wite</option>
                            <option>color</option>
                        </select>
                    </div>
                </Controls>
                <GamePanel />
            </PageContent>
        </ThemeProvider>
    )
}
