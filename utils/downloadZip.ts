import { Option } from '@core/types'
import JSZip from 'jszip'

const downloadZip = (list: Option[]) => {
  const zip = new JSZip()

  list.forEach(item => {
    zip.file(`${item.label}.ts`, item.value)
  })

  zip.generateAsync({ type: 'blob' }).then(content => {
    const element = document.createElement('a')
    element.setAttribute('href', window.URL.createObjectURL(content))
    element.setAttribute('download', 'download.zip')

    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  })
}

export default downloadZip
