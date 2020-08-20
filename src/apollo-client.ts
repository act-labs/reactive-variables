import { ApolloClient } from '@apollo/client'

import { createCache } from './cache';

const createClient = () => {
  const cache = createCache()

  const client = new ApolloClient({
    cache,
    uri: process.env.REACT_APP_GRAPHQL_URI
  })

  return client
}
export default createClient
