import React from "react"


import { MockedProvider } from '@apollo/client/testing'
import { render, act, cleanup, fireEvent } from "@testing-library/react"

import * as utils from "./utils"
import * as gameURL from "./useGameURL"
import * as apollo from "@apollo/client"

import { GamePanel, PlayButton, PLAY, GameListItem, PERSON, STARSHIP, HistoryButton } from "./game-board"
import { GameBoard, PlayerType } from "./types"
import { gameState, allGames, addGame, addGameScore } from "./cache"
import reactRouter from "react-router"


afterEach(cleanup)


const mockPeople = () => Array(5).fill(0).map((_, i) => ({ id: "p" + i, name: "person" + i, score: i }))
const mockStarships = () => Array(5).fill(0).map((_, i) => ({ id: "s" + i, name: "starship" + i, score: i }))
const delay = (timeout = 0) => new Promise(resolve => setTimeout(resolve, timeout))


it('open history', () => {
  const useRouteMatchMock = jest.spyOn(reactRouter, 'useRouteMatch').mockImplementation((): any => {
    return null
  })

  const push = jest.fn()

  const useHistoryMock = jest.spyOn(reactRouter, 'useHistory').mockImplementation((): any => {
    return {
      push
    }
  })

  const { getByTestId } = render(
    <HistoryButton />
  )
  const button = getByTestId(/history/i)

  expect(button).toBeInTheDocument()
  fireEvent.click(button)
  expect(push).toHaveBeenCalledWith('/history')

  useHistoryMock.mockRestore()
  useRouteMatchMock.mockRestore()
})

it('open game', () => {
  const useRouteMatchMock = jest.spyOn(reactRouter, 'useRouteMatch').mockImplementation((): any => {
    return { params: { slug: "history" } }
  })

  const push = jest.fn()

  const useHistoryMock = jest.spyOn(reactRouter, 'useHistory').mockImplementation((): any => {
    return {
      push
    }
  })

  const { getByTestId } = render(
    <HistoryButton />
  )
  const button = getByTestId(/history/i)

  expect(button).toBeInTheDocument()
  fireEvent.click(button)
  expect(push).toHaveBeenCalledWith('/')

  useHistoryMock.mockRestore()
  useRouteMatchMock.mockRestore()
})

it.each([
  ["people" as PlayerType, 'p0;p3', ['p0', 'p3']],
  ["starships" as PlayerType, 's0;s3', ['s0', 's3']],
])("play: %s", async (type: PlayerType, id, playerIds) => {
  await act(async () => {
    allGames([])
    const gameBoard: GameBoard = {
      totalPlayers: 2,
      mode: "loading",
      playersType: type,
      allPeople: {
        people: mockPeople()
      },
      allStarships: {
        starships: mockStarships()
      },
      games: []
    }
    const mocks = [
      {
        request: {
          query: PLAY,
        },
        result: {
          data: gameBoard
        }
      }
    ]
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false} >
        <PlayButton />
      </MockedProvider>
    )

    const button = getByTestId("play")
    expect(button).toBeInTheDocument()

    await delay()

    expect(gameState() === "playing").toBeTruthy()
    expect(allGames().length).toBe(0)

    const generateRandomInts = jest.spyOn(utils, 'generateRandomInts').mockImplementation((total: number, max: number): number[] => {
      expect(total).toBe(2)
      expect(max).toBe(4)
      return [0, 3]
    })

    fireEvent.click(button)
    expect(allGames().length).toBe(1)

    expect(allGames()[0]).toEqual({
      id,
      mode: type,
      winner: undefined,
      playerIds,
      scores: {}
    })
    generateRandomInts.mockRestore()
  })
})

it.each([
  ["people" as PlayerType],
  ["starships" as PlayerType],
])("game added: %s", async (type: PlayerType) => {
  allGames([])
  addGame(type, ['p2', 'p3'])
  addGame(type, ['p0', 'p3'])

  expect(allGames()[0]).toEqual({
    id: 'p0;p3',
    mode: type,
    winner: undefined,
    playerIds: ['p0', 'p3'],
    scores: {}
  })

  addGameScore({ id: 'p0;p3', playerId: "p0", score: 1 })
  addGameScore({ id: 'p0;p3', playerId: "p3", score: 4 })

  expect(allGames()[0]).toEqual({
    id: 'p0;p3',
    mode: type,
    winner: 'p3',
    playerIds: ['p0', 'p3'],
    scores: { p0: 1, p3: 4 }
  })
})

it.each([
  ["person", PERSON, "people" as PlayerType],
  ["starship", STARSHIP, "starships" as PlayerType],
])("list: %s", async (type, query, mode: PlayerType) => {
  await act(async () => {
    const mocks = [
      {
        request: {
          query,
          variables: { id: "p0" }
        },
        result: {
          data: {
            [type]: {
              name: "name1",
              score: 122
            }
          }
        }
      },
      {
        request: {
          query,
          variables: { id: "p3" }
        },
        result: {
          data: {
            [type]: {
              name: "name3",
              score: 133
            }
          }
        }
      }
    ]
    const { getByText, getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false} >
        <GameListItem mode={mode} playerIds={["p0", "p3"]} id="p0;p3" winner="p3" scores={{}} />
      </MockedProvider>
    )

    await delay()

    const card2 = getByTestId("p3")
    expect(card2).toBeInTheDocument()
    expect(card2).toHaveStyle(`
      border-width: 1px
    `)

    const card1 = getByTestId("p0")
    expect(card1).toBeInTheDocument()
    expect(card1).toHaveStyle(`
      border-width: 0px
    `)

    expect(getByText(/name1/i)).toBeInTheDocument()
    expect(getByText(/name3/i)).toBeInTheDocument()

    expect(getByText(/122/i)).toBeInTheDocument()
    expect(getByText(/133/i)).toBeInTheDocument()
  })
})


it("game panel: last game", async () => {
  const useGameURLMock = jest.spyOn(gameURL, 'useGameURL').mockImplementation((): any => {
    return {
      slug: null
    }
  })

  const useQueryMock = jest.spyOn(apollo, 'useQuery').mockImplementation((): any => {
    return {
      data: {
        mode: "game",
        games: [{ id: "id1" }, { id: "id2" }]
      }
    }
  })

  const ListItem = jest.fn(()=><div>test-item</div>)
  const { getByText } = render(
      <GamePanel ListItem={ListItem}/>
  )

  expect(ListItem).toBeCalledTimes(1)

  expect(getByText(/test-item/i)).toBeInTheDocument()

  useGameURLMock.mockRestore()
  useQueryMock.mockRestore()
})