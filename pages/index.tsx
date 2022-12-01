import { InputText, InputTextarea } from '@components/Input'
import { Box, Button, Stack } from '@mui/material'
import getIntrospection, { ArgType, IntrospectionQuery } from '@utils/getIntrospection'
import { TypeKind } from 'graphql'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'

interface Option {
  label: string
  value: string
}

const style = {
  inputWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '8px',
  },
  textareaWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
}

const scalarType: { [key: string]: string } = {
  ID: 'string',
  UUID: 'string',
  String: 'string',
  Boolean: 'boolean',
  Int: 'number',
  Float: 'number',
  DateOnly: 'Date',
  DateTime: 'Date',
  FieldInput: 'any',
}

const getDefaultValue = (value: string) => {
  return value ? ` = ${value}` : ``
}

const getConstantName = (name: string) => {
  let constantName = ''

  for (let i = 0; i < name.length; i++) {
    const char = name[i]
    const isSearch = char.search(/[A-Z]/) !== -1
    constantName += (isSearch ? '_' : '') + char
  }

  return constantName.toUpperCase()
}

const getHookName = (name: string) => {
  let hookName = ''

  for (let i = 0; i < name.length; i++) {
    const char = i === 0 ? name[i].toUpperCase() : name[i]
    hookName += char
  }

  return `use${hookName}`
}

const getHookType = (type: ArgType): string => {
  const isList = type.kind === TypeKind.LIST
  const typeName = type.name ? type.name : getHookType(type.ofType)
  const hookType = scalarType[typeName] ? scalarType[typeName] : typeName

  return isList ? `${hookType}[]` : hookType
}

const getNullType = (type: ArgType): string => {
  const isNonNull = type.kind === TypeKind.NON_NULL
  const nullType = type.name ? '?' : getNullType(type.ofType)

  return isNonNull ? '' : nullType
}

const getType = (type: ArgType): string => {
  const isList = type.kind === TypeKind.LIST
  const nonNull = type.kind === TypeKind.NON_NULL ? '!' : ''
  const typeName = type.name ? type.name : getType(type.ofType)

  return isList ? `[${typeName + nonNull}]` : typeName + nonNull
}

const genCodes = (type: 'Query' | 'Mutation', data: IntrospectionQuery) => {
  const fields = data.__schema.types.find(item => item.name === type)?.fields || []
  return fields.map(item => ({
    label: item.name,
    value: `
    import { gql } from '@apollo/client'

    export const ${getConstantName(item.name)} = gql\`
    ${type.toLowerCase()} ${item.name} ${
      item.args.length
        ? `(${item.args.map(
            arg => `
            $${arg.name}: ${getType(arg.type)}${getDefaultValue(arg.defaultValue)}`,
          )}
          ) {
            ${item.name} ${
            item.args.length
              ? `(${item.args.map(
                  arg => `
                  ${arg.name}: $${arg.name}`,
                )}
                )`
              : ''
          } { __typename }
          }`
        : `{
            ${item.name} { __typename }
          }`
    }
    \`

    import use${type} from './use${type}'

    ${
      item.args.length
        ? `interface Variables {${item.args.map(
            arg => `
            ${arg.name}${getNullType(arg.type)}: ${getHookType(arg.type)}`,
          )}}`
        : ''
    }

    const ${getHookName(item.name)} = (${
      item.args.length
        ? `variables${
            item.args.filter(arg => getNullType(arg.type) === '?').length ? '?' : ''
          }: Variables`
        : ''
    }) => {
      return use${type}<{ ${item.name}: ${getHookType(item.type)} }>(${getConstantName(
      item.name,
    )}, {
        variables: variables
      })
    }
    `,
  }))
}

const Home: NextPage = () => {
  const [uri, setUri] = useState('')
  const [queryValues, setQueryValues] = useState<Option[]>([])
  const [mutationValues, setMutationValues] = useState<Option[]>([])

  const handleConfirm = async () => {
    if (!uri) return

    try {
      const { data } = await getIntrospection(uri)
      const queryCodes = genCodes('Query', data)
      const mutationCodes = genCodes('Mutation', data)

      setQueryValues(queryCodes)
      setMutationValues(mutationCodes)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Stack gap="16px">
        <Box sx={style.inputWrapper}>
          <InputText label="Endpoint" value={uri} onChange={event => setUri(event.target.value)} />
          <Button variant="contained" onClick={handleConfirm}>
            Confirm
          </Button>
        </Box>

        <Box sx={style.textareaWrapper}>
          <Stack gap="16px">
            {queryValues.map((item, index) => (
              <InputTextarea key={index} {...item} />
            ))}
          </Stack>

          <Stack gap="16px">
            {mutationValues.map((item, index) => (
              <InputTextarea key={index} {...item} />
            ))}
          </Stack>
        </Box>
      </Stack>
    </>
  )
}

export default Home
