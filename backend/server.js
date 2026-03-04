const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { createClient } = require('@supabase/supabase-js')

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null

app.get('/health', async (req, res) => {
  const ts = new Date().toISOString()
  if (!supabase) {
    return res.json({ api: 'online', database: 'disconnected', timestamp: ts })
  }
  try {
    const { error } = await supabase.from('feedback').select('id').limit(1)
    if (error) {
      return res.json({ api: 'online', database: 'disconnected', timestamp: ts })
    }
    return res.json({ api: 'online', database: 'connected', timestamp: ts })
  } catch {
    return res.json({ api: 'online', database: 'disconnected', timestamp: ts })
  }
})

app.post('/feedback', async (req, res) => {
  const { name, message } = req.body || {}
  if (!name || !message) {
    return res.status(400).json({ success: false })
  }
  if (!supabase) {
    return res.status(500).json({ success: false })
  }
  try {
    const { error } = await supabase.from('feedback').insert([{ name, message }])
    if (error) {
      return res.status(500).json({ success: false })
    }
    return res.json({ success: true })
  } catch {
    return res.status(500).json({ success: false })
  }
})

app.get('/feedback', async (req, res) => {
  if (!supabase) {
    return res.json([])
  }
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('id,name,message,created_at')
      .order('created_at', { ascending: false })
    if (error) {
      return res.json([])
    }
    return res.json(data || [])
  } catch {
    return res.json([])
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {})
