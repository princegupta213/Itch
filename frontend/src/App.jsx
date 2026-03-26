import { useEffect, useState } from "react"
import "./App.css"

function App() {
  const [problems, setProblems] = useState([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("general")
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState("checking")

  // If VITE_API_URL is not set, call the backend on the same origin (works for single-container deploys).
  const rawApiUrl = import.meta.env.VITE_API_URL || ""
  const API_URL = rawApiUrl.replace(/\/$/, "")

  useEffect(() => {
    checkAPI()
    loadProblems()
    const interval = setInterval(loadProblems, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAPI = async () => {
    try {
      await fetch(`${API_URL}/health`)
      setApiStatus("connected")
    } catch {
      setApiStatus("disconnected")
    }
  }

  const loadProblems = async () => {
    try {
      const res = await fetch(`${API_URL}/api/itches/`)
      const data = await res.json()
      setProblems(data.items || [])
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !description) return
    setLoading(true)
    try {
      const url = `${API_URL}/api/itches/`
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category }),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Request failed with status ${res.status}`)
      }
      const itch = await res.json()
      setProblems([itch, ...problems])
      setTitle("")
      setDescription("")
    } catch (error) {
      alert("Error: " + (error?.message || String(error)))
    }
    setLoading(false)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎯 Fix My Itch AI</h1>
        <p>AI-powered solutions for everyday problems</p>
        <div className={`status ${apiStatus}`}>{apiStatus === "connected" ? "🟢 Connected" : "🔴 Disconnected"}</div>
      </header>
      <main className="main">
        <section className="submit-section">
          <h2>Submit Your Problem</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Problem title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Describe your problem..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="4"
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="general">General</option>
              <option value="transportation">Transportation</option>
              <option value="health">Health</option>
              <option value="finance">Finance</option>
              <option value="education">Education</option>
            </select>
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Problem"}
            </button>
          </form>
        </section>
        <section className="problems-section">
          <h2>Recent Problems ({problems.length})</h2>
          {problems.length === 0 ? (
            <p className="empty">Be the first!</p>
          ) : (
            <div className="problems-grid">
              {problems.map((p) => (
                <div key={p.id} className="problem-card">
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="card-footer">
                    <span className={`category ${p.category}`}>{p.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <footer>
        <p>🚀 Fix My Itch AI</p>
      </footer>
    </div>
  )
}

export default App
