import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [breeds, setBreeds] = useState<string[]>([])
  const [selectedBreed, setSelectedBreed] = useState('random')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const formatBreedName = (breed: string) =>
    breed
      .split(/[-_\\/]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

  const fetchImage = async (breed = selectedBreed) => {
    setLoading(true)
    setError('')

    const endpoint =
      breed === 'random'
        ? 'https://dog.ceo/api/breeds/image/random'
        : `https://dog.ceo/api/breed/${breed}/images/random`

    try {
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error('Could not fetch dog image')

      const data = (await response.json()) as { status: string; message: string }
      if (data.status !== 'success') throw new Error('Could not fetch dog image')

      setImageUrl(data.message)
    } catch {
      setError('We could not load a dog. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadBreeds = async () => {
      try {
        const response = await fetch('https://dog.ceo/api/breeds/list/all')
        if (!response.ok) throw new Error('Could not fetch breeds')

        const data = (await response.json()) as {
          status: string
          message: Record<string, string[]>
        }

        if (data.status === 'success') {
          const breedNames = Object.entries(data.message).flatMap(
            ([breed, subBreeds]) =>
              subBreeds.length
                ? subBreeds.map((subBreed) => `${breed}/${subBreed}`)
                : [breed],
          )
          setBreeds(breedNames)
        }
      } catch {
        setBreeds(['affenpinscher'])
      }
    }

    loadBreeds()
    fetchImage('random')
  }, [])

  return (
    <main className="dog-app">
      <section className="dog-card" aria-label="Random dog image viewer">
        <header className="dog-header">
          <p className="eyebrow">Dog Finder</p>
          <h1>Meet a new friend</h1>
        </header>

        <label className="breed-picker">
          <span>Choose a breed</span>
          <select
            value={selectedBreed}
            onChange={(event) => setSelectedBreed(event.target.value)}
          >
            <option value="random">Surprise me</option>
            {breeds.map((breed) => (
              <option key={breed} value={breed}>
                {formatBreedName(breed)}
              </option>
            ))}
          </select>
        </label>

        <div className="image-frame" aria-live="polite">
          {loading && <div className="loading">Loading a good dog...</div>}
          {!loading && error && <div className="error">{error}</div>}
          {!loading && !error && imageUrl && (
            <img src={imageUrl} alt="A friendly dog" />
          )}
        </div>

        <button
          type="button"
          className="dog-button"
          onClick={() => fetchImage(selectedBreed)}
          disabled={loading}
        >
          <span aria-hidden="true">🐾</span>
          Find a Dog
        </button>
      </section>
    </main>
  )
}

export default App
