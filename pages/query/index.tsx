import { InputText, InputTextarea } from '@components/Input'
import { Option } from '@core/types'
import { Box, Button, Stack } from '@mui/material'
import downloadZip from '@utils/downloadZip'
import { genCodes, genHooks } from '@utils/generator'
import getIntrospection from '@utils/getIntrospection'
import Head from 'next/head'
import { useState } from 'react'

const style = {
  inputWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto auto',
    gap: '16px',
  },
  textareaWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
}

const Query = () => {
  const [uri, setUri] = useState('')
  const [codeValues, setCodeValues] = useState<Option[]>([])
  const [hookValues, setHookValues] = useState<Option[]>([])

  const handleConfirm = async () => {
    if (!uri) return

    try {
      const { data } = await getIntrospection(uri)
      const codes = genCodes('Query', data)
      const hooks = genHooks('Query', data)

      setCodeValues(codes)
      setHookValues(hooks)
    } catch (error) {
      console.log(error)
    }
  }

  const handleDownloadCodes = () => {
    downloadZip(codeValues)
  }

  const handleDownloadHooks = () => {
    downloadZip(hookValues)
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
          <Button variant="outlined" onClick={handleConfirm}>
            Confirm
          </Button>
          <Button variant="outlined" onClick={handleDownloadCodes}>
            Download Codes
          </Button>
          <Button variant="outlined" onClick={handleDownloadHooks}>
            Download Hooks
          </Button>
        </Box>

        <Box sx={style.textareaWrapper}>
          <Stack gap="16px">
            {codeValues.map((item, index) => (
              <InputTextarea key={index} {...item} />
            ))}
          </Stack>

          <Stack gap="16px">
            {hookValues.map((item, index) => (
              <InputTextarea key={index} {...item} />
            ))}
          </Stack>
        </Box>
      </Stack>
    </>
  )
}

export default Query
