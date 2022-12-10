import { TypeKind } from 'graphql'
import { ArgType, IntrospectionQuery } from './getIntrospection'

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
    `,
  }))
}

const genQueryHooks = (data: IntrospectionQuery) => {
  const fields = data.__schema.types.find(item => item.name === 'Query')?.fields || []
  return fields.map(item => ({
    label: getHookName(item.name),
    value: `
    import useQuery from './useQuery'
    import { ${getConstantName(item.name)} } from '@core/graphql/queries'

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
      return useQuery<{ ${item.name}: ${getHookType(item.type)} }>(${getConstantName(item.name)}${
      item.args.length ? `, { variables: variables }` : ''
    })
    }

    export default ${getHookName(item.name)}
    `,
  }))
}

const genMutationHooks = (data: IntrospectionQuery) => {
  const fields = data.__schema.types.find(item => item.name === 'Mutation')?.fields || []
  return fields.map(item => ({
    label: getHookName(item.name),
    value: `
    import useMutation from './useMutation'
    import { ${getConstantName(item.name)} } from '@core/graphql/mutations'

    const ${getHookName(item.name)} = () => {
      return useMutation<{ ${item.name}: ${getHookType(item.type)} }${
      item.args.length
        ? `, {${item.args.map(
            arg => `
            ${arg.name}${getNullType(arg.type)}: ${getHookType(arg.type)}`,
          )}
        }`
        : ''
    }>(${getConstantName(item.name)})
    }

    export default ${getHookName(item.name)}
    `,
  }))
}

export { genCodes, genQueryHooks, genMutationHooks }
