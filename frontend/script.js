const API_URL = typeof window !== 'undefined' && window.API_URL ? window.API_URL : 'http://localhost:3000'

async function fetchJSON(url, options) {
  const res = await fetch(url, options)
  const text = await res.text()
  try {
    return { ok: res.ok, data: JSON.parse(text) }
  } catch {
    return { ok: res.ok, data: null }
  }
}

function renderHealth(status) {
  const el = document.getElementById('health')
  el.textContent = `API: ${status.api} | DB: ${status.database} | ${status.timestamp}`
}

function renderFeedback(items) {
  const list = document.getElementById('feedback-list')
  list.innerHTML = ''
  for (const it of items) {
    const li = document.createElement('li')
    const name = document.createElement('div')
    name.className = 'item-name'
    name.textContent = it.name
    const msg = document.createElement('div')
    msg.textContent = it.message
    const time = document.createElement('div')
    time.className = 'item-time'
    time.textContent = new Date(it.created_at).toLocaleString()
    li.appendChild(name)
    li.appendChild(msg)
    li.appendChild(time)
    list.appendChild(li)
  }
}

async function loadHealth() {
  const { ok, data } = await fetchJSON(`${API_URL}/health`)
  if (ok && data) renderHealth(data)
}

async function loadFeedback() {
  const { ok, data } = await fetchJSON(`${API_URL}/feedback`)
  if (ok && data) renderFeedback(data)
}

async function submitFeedback(e) {
  e.preventDefault()
  const name = document.getElementById('name').value.trim()
  const message = document.getElementById('message').value.trim()
  if (!name || !message) return
  const { ok } = await fetchJSON(`${API_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, message })
  })
  if (ok) {
    document.getElementById('feedback-form').reset()
    await loadFeedback()
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadHealth()
  await loadFeedback()
  document.getElementById('feedback-form').addEventListener('submit', submitFeedback)
})
