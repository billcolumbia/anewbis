let socket = new WebSocket('ws://localhost:3001')

socket.addEventListener('open', (e) => {
  console.log('Connected to the live reload watcher')
})

socket.addEventListener('message', (e) => {
  let msg = JSON.parse(e.data)
  if (msg.ext === 'css') {
    injectCSSFiles(msg.filename)
  } else {
    location.reload()
  }
})

let injectCSSFiles = (filename) => {
  let cacheBust = '?cachebust='

  let source = filename.match(/([a-zA-Z]|-|_|\d)+\.css/)[0]
  let currentLink = document.querySelector(`link[href*="${source}"]`)

  if (currentLink) {
    let clone = currentLink.cloneNode(false)
    let parent = currentLink.parentNode
    let qsIndex = currentLink.href.indexOf(cacheBust)
    let href =
      qsIndex > -1 ? currentLink.href.substring(0, qsIndex) : currentLink.href
    clone.href = href + cacheBust + Date.now()
    if (parent.lastChild === currentLink) parent.appendChild(clone)
    else parent.insertBefore(clone, currentLink.nextSibling)
    parent.removeChild(currentLink)
  }
}
