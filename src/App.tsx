import React from "react"
import { ApolloProvider } from '@apollo/client'
import createClient from "./apollo-client"

import { HashRouter } from 'react-router-dom'
import { GamePage } from "./game-board"



export default function App() {
  const client = createClient()
  return (
    <ApolloProvider client={client}>
      <HashRouter>
        <GamePage />
      </HashRouter>
    </ApolloProvider>
  )
}
