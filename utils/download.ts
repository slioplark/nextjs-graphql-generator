const download = (filename: string, text: string) => {
  const element = document.createElement('a')
  element.style.display = 'none'
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)

  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

export default download
