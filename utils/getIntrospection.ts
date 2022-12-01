import { ApolloClient, InMemoryCache } from '@apollo/client'
import { INTROSPECTION_QUERY } from '@core/graphql'
import { TypeKind } from 'graphql'

type ArgType = {
  kind: TypeKind
  name: string
  ofType: ArgType
}

type Arg = {
  name: string
  defaultValue: string
  type: ArgType
}

type Field = {
  name: string
  args: Arg[]
  type: ArgType
}

type Type = {
  name: string
  fields: Field[]
}

type IntrospectionQuery = {
  __schema: {
    types: Type[]
  }
}

const getIntrospection = async (uri: string) => {
  const client = new ApolloClient({
    uri: uri,
    cache: new InMemoryCache(),
  })

  return client.query<IntrospectionQuery>({
    query: INTROSPECTION_QUERY,
  })
}

export type { ArgType, Arg, Field, Type, IntrospectionQuery }

export default getIntrospection
