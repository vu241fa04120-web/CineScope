import { useEffect, useId, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowDownWideNarrow, ArrowLeft, ArrowRight, Bookmark, Check, ChevronDown, Clapperboard, Clock3, Film, Heart, ListFilter, Search, Star, Trash2, X } from 'lucide-react'
import { genres, movies } from './data/movies.js'
import './App.css'

const readLocal = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function Poster({ movie, className = '' }) {
  const [base, deep, light] = movie.colors
  const gradient = `poster-gradient-${movie.id}-${useId().replaceAll(':', '')}`
  const titleParts = movie.title.split(':')

  return (
    <svg className={`poster-art ${className}`} viewBox="0 0 300 440" role="img" aria-label={`${movie.title} poster`}>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={base} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
        <linearGradient id={`${gradient}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#10110f" stopOpacity="0" />
          <stop offset="0.58" stopColor="#10110f" stopOpacity="0.08" />
          <stop offset="1" stopColor="#10110f" stopOpacity="0.9" />
        </linearGradient>
        <pattern id={`${gradient}-grain`} width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".45" fill="#fff" opacity=".16" />
        </pattern>
      </defs>
      <rect width="300" height="440" fill={`url(#${gradient})`} />
      <circle cx="218" cy="133" r="96" fill={light} opacity=".22" />
      <circle cx="218" cy="133" r="67" fill="none" stroke={light} strokeWidth="1" opacity=".42" />
      <path d="M0 315 110 190l54 68 45-52 91 109v125H0Z" fill={deep} opacity=".62" />
      <path d="m0 357 89-79 54 42 57-58 100 73v105H0Z" fill="#17191b" opacity=".42" />
      <path d="M0 0h300v440H0z" fill={`url(#${gradient}-shade)`} />
      <path d="M0 0h300v440H0z" fill={`url(#${gradient}-grain)`} opacity=".38" />
      <text x="19" y="31" fill="#fff" opacity=".86" fontSize="8" fontFamily="Arial, sans-serif" letterSpacing="2.3">CINESCOPE SELECTS</text>
      <text x="19" y="285" fill={light} fontSize="9" fontFamily="Arial, sans-serif" letterSpacing="2.7">{movie.label}</text>
      <text x="17" y="335" fill="#fff" fontSize={titleParts[0].length > 19 ? 22 : 29} fontWeight="700" fontFamily="Georgia, serif">{titleParts[0].toUpperCase()}</text>
      {titleParts[1] && <text x="19" y="363" fill="#fff" fontSize="19" fontWeight="700" fontFamily="Georgia, serif">{titleParts[1].toUpperCase()}</text>}
      <text x="20" y="405" fill="#fff" opacity=".8" fontSize="10" fontFamily="Arial, sans-serif" letterSpacing="1.6">{movie.year}  ·  {movie.genre.toUpperCase()}</text>
    </svg>
  )
}

function MovieCard({ movie, favorite, saved, onFavorite, onWatchlist, showActions = true }) {
  return (
    <article className="movie-card">
      <div className="poster-wrap">
        <Link className="poster-link" to={`/movie/${movie.id}`} aria-label={`View ${movie.title}`}>
          <Poster movie={movie} />
          <span className="poster-rating"><Star size={12} fill="currentColor" /> {movie.rating.toFixed(1)}</span>
          <span className="poster-view">View film <ArrowRight size={14} /></span>
        </Link>
        {showActions && <div className="poster-actions">
          <button type="button" className={`icon-button ${favorite ? 'is-favorite' : ''}`} onClick={() => onFavorite(movie.id)} aria-label={favorite ? `Remove ${movie.title} from favourites` : `Add ${movie.title} to favourites`} title={favorite ? 'Remove favourite' : 'Add to favourites'}><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /></button>
          <button type="button" className={`icon-button ${saved ? 'is-saved' : ''}`} onClick={() => onWatchlist(movie.id)} aria-label={saved ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`} title={saved ? 'Remove from watchlist' : 'Add to watchlist'}>{saved ? <Check size={16} /> : <Bookmark size={16} />}</button>
        </div>}
      </div>
      <div className="movie-card-info">
        <Link to={`/movie/${movie.id}`} className="movie-card-title">{movie.title}</Link>
        <span>{movie.year}<i />{movie.genre}</span>
      </div>
    </article>
  )
}

function MovieRow({ title, eyebrow, items, onFavorite, onWatchlist, favorites = [], watchlist = [], toggleFavorite, toggleWatchlist, to = '/explore' }) {
  const favoriteAction = onFavorite || toggleFavorite
  const watchlistAction = onWatchlist || toggleWatchlist
  return <section className="movie-row">
    <div className="row-heading">
      <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      <Link to={to} className="text-link">View collection <ArrowRight size={15} /></Link>
    </div>
    <div className="card-row">{items.map((movie) => <MovieCard key={movie.id} movie={movie} favorite={favorites.includes(movie.id)} saved={watchlist.includes(movie.id)} onFavorite={favoriteAction} onWatchlist={watchlistAction} />)}</div>
  </section>
}

function EmptyState({ icon: Icon = Film, title, copy, action, onAction, to = '/explore' }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={23} /></span><h2>{title}</h2><p>{copy}</p>{onAction ? <button className="button button-primary" type="button" onClick={onAction}>{action} <X size={15} /></button> : <Link className="button button-primary" to={to}>Explore films <ArrowRight size={16} /></Link>}</div>
}

function App() {
  const [watchlist, setWatchlist] = useState(() => readLocal('cinescope.watchlist', []))
  const [favorites, setFavorites] = useState(() => readLocal('cinescope.favorites', []))
  const [watched, setWatched] = useState(() => readLocal('cinescope.watched', []))
  const [reviews, setReviews] = useState(() => readLocal('cinescope.reviews', {}))
  const navigate = useNavigate()

  useEffect(() => localStorage.setItem('cinescope.watchlist', JSON.stringify(watchlist)), [watchlist])
  useEffect(() => localStorage.setItem('cinescope.favorites', JSON.stringify(favorites)), [favorites])
  useEffect(() => localStorage.setItem('cinescope.watched', JSON.stringify(watched)), [watched])
  useEffect(() => localStorage.setItem('cinescope.reviews', JSON.stringify(reviews)), [reviews])

  const toggle = (setter) => (id) => setter((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id])
  const toggleWatchlist = toggle(setWatchlist)
  const toggleFavorite = toggle(setFavorites)
  const toggleWatched = toggle(setWatched)
  const shared = { watchlist, favorites, watched, reviews, toggleWatchlist, toggleFavorite, toggleWatched, setReviews }

  return <div className="app-shell">
    <Header watchlistCount={watchlist.length} onSearch={(query) => navigate(`/explore?q=${encodeURIComponent(query)}`)} />
    <main className="main-content"><Routes>
      <Route path="/" element={<HomePage {...shared} />} />
      <Route path="/explore" element={<ExplorePage {...shared} />} />
      <Route path="/movie/:movieId" element={<MovieDetailRoute {...shared} />} />
      <Route path="/watchlist" element={<WatchlistPage {...shared} />} />
      <Route path="/favourites" element={<FavouritesPage {...shared} />} />
      <Route path="/profile" element={<ProfilePage {...shared} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></main>
    <footer className="site-footer"><Link to="/" className="footer-brand"><Clapperboard size={17} /> CINESCOPE</Link><span>Made for the love of the frame.</span><span>Independent film discovery · 2025</span></footer>
  </div>
}

function Header({ watchlistCount, onSearch }) {
  const [query, setQuery] = useState('')
  const submit = (event) => { event.preventDefault(); onSearch(query.trim()) }
  return <header className="site-header">
    <Link to="/" className="brand"><span className="brand-mark"><Clapperboard size={20} /></span><span>CINE<span>SCOPE</span></span></Link>
    <nav className="main-nav" aria-label="Main navigation">
      <NavLink to="/" end>Discover</NavLink><NavLink to="/explore">Explore</NavLink><NavLink to="/watchlist">Watchlist <span className="nav-count">{watchlistCount}</span></NavLink><NavLink to="/favourites">Favourites</NavLink><NavLink to="/profile">My film log</NavLink>
    </nav>
    <form className="header-search" onSubmit={submit}><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a film" aria-label="Search films" /><button type="submit" aria-label="Submit search"><ArrowRight size={16} /></button></form>
  </header>
}

function HomePage(props) {
  const featured = movies.find((movie) => movie.featured)
  return <>
    <section className="hero-section">
      <div className="hero-copy"><p className="eyebrow hero-eyebrow"><span className="live-dot" /> THE CINE SCOPE / SPOTLIGHT</p><p className="hero-kicker">A film by Denis Villeneuve</p><h1>{featured.title}</h1><p className="hero-description">A mythic journey across the sands of Arrakis. This month’s essential big-screen epic, selected by our editors.</p>
        <div className="hero-meta"><span><Star size={15} fill="currentColor" /> {featured.rating} <small>IMDb</small></span><i /> <span>{featured.year}</span><i /> <span>{featured.runtime} min</span><i /> <span>{featured.genre}</span></div>
        <div className="hero-actions"><Link to={`/movie/${featured.id}`} className="button button-primary">Discover film <ArrowRight size={16} /></Link><button type="button" className={`button button-quiet ${props.watchlist.includes(featured.id) ? 'button-active' : ''}`} onClick={() => props.toggleWatchlist(featured.id)}>{props.watchlist.includes(featured.id) ? <Check size={16} /> : <Bookmark size={16} />}{props.watchlist.includes(featured.id) ? 'In watchlist' : 'Add to watchlist'}</button></div>
        <p className="hero-caption">01 <span /> 04 <span className="caption-label">FEATURED THIS WEEK</span></p>
      </div>
      <Link to={`/movie/${featured.id}`} className="hero-art" aria-label={`Discover ${featured.title}`}><Poster movie={featured} /><span className="hero-art-caption">FRAME NO. 014<br /><b>THE DESERT PLANET</b></span></Link>
      <div className="hero-index">CS / 001</div>
    </section>
    <div className="home-intro"><span>YOUR NEXT GREAT FILM</span><p>A considered collection for the curious viewer.</p></div>
    <MovieRow title="Now in the conversation" eyebrow="01 / TRENDING" items={movies.filter((movie) => movie.trending)} {...props} />
    <MovieRow title="Crowd favourites" eyebrow="02 / MOST LOVED" items={movies.filter((movie) => movie.popular)} {...props} />
    <MovieRow title="The highest rated" eyebrow="03 / ALL-TIME GREATS" items={[...movies].sort((a, b) => b.rating - a.rating).slice(0, 8)} {...props} />
    <MovieRow title="Fresh from the edit room" eyebrow="04 / RECENTLY ADDED" items={movies.filter((movie) => movie.recent || movie.year >= 2023).slice(0, 8)} {...props} />
  </>
}

function ExplorePage(props) {
  const [params, setParams] = useSearchParams()
  const search = params.get('q') || ''
  const [genre, setGenre] = useState('All genres')
  const [year, setYear] = useState('All years')
  const [sort, setSort] = useState('Featured order')
  const years = [...new Set(movies.map((movie) => movie.year))].sort((a, b) => b - a)
  const filtered = movies.filter((movie) => movie.title.toLowerCase().includes(search.toLowerCase()) && (genre === 'All genres' || movie.genre === genre) && (year === 'All years' || movie.year === Number(year)))
  if (sort === 'Highest rated') filtered.sort((a, b) => b.rating - a.rating)
  if (sort === 'Newest first') filtered.sort((a, b) => b.year - a.year)
  if (sort === 'Oldest first') filtered.sort((a, b) => a.year - b.year)

  return <section className="catalog-page">
    <div className="page-heading"><div><p className="eyebrow">THE COMPLETE COLLECTION</p><h1>Explore films<span className="heading-period">.</span></h1><p className="page-subtitle">Find the film you didn’t know you were looking for.</p></div><div className="collection-stamp"><Film size={19} /><span>{movies.length}<small>CURATED TITLES</small></span></div></div>
    <div className="filter-bar"><label className="catalog-search"><Search size={17} /><input value={search} onChange={(event) => setParams(event.target.value ? { q: event.target.value } : {})} placeholder="Search by title..." aria-label="Search by title" />{search && <button type="button" onClick={() => setParams({})} aria-label="Clear search"><X size={15} /></button>}</label>
      <label className="filter-select"><ListFilter size={15} /><select value={genre} onChange={(event) => setGenre(event.target.value)} aria-label="Filter by genre"><option>All genres</option>{genres.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
      <label className="filter-select"><select value={year} onChange={(event) => setYear(event.target.value)} aria-label="Filter by year"><option>All years</option>{years.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
      <label className="filter-select sort-select"><ArrowDownWideNarrow size={15} /><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort films"><option>Featured order</option><option>Highest rated</option><option>Newest first</option><option>Oldest first</option></select><ChevronDown size={14} /></label>
    </div>
    <div className="results-line"><span>{filtered.length} FILM{filtered.length === 1 ? '' : 'S'} FOUND</span><span>SELECTED FOR THE CURIOUS</span></div>
    {filtered.length ? <div className="movie-grid">{filtered.map((movie) => <MovieCard key={movie.id} movie={movie} favorite={props.favorites.includes(movie.id)} saved={props.watchlist.includes(movie.id)} onFavorite={props.toggleFavorite} onWatchlist={props.toggleWatchlist} />)}</div> : <EmptyState icon={Search} title="No films found" copy="Try another title or loosen your filters." action="Clear filters" onAction={() => { setParams({}); setGenre('All genres'); setYear('All years'); setSort('Featured order') }} />}
  </section>
}

function MovieDetailRoute(props) {
  const { movieId } = useParams()
  return <MovieDetail key={movieId} {...props} />
}

function MovieDetail({ watchlist, favorites, watched, reviews, toggleWatchlist, toggleFavorite, toggleWatched, setReviews }) {
  const { movieId } = useParams()
  const movie = movies.find((entry) => entry.id === movieId)
  const [rating, setRating] = useState(reviews[movieId]?.rating || 0)
  const [review, setReview] = useState(reviews[movieId]?.review || '')
  const [saved, setSaved] = useState(false)
  if (!movie) return <Navigate to="/explore" replace />
  const personal = reviews[movie.id]
  const submit = (event) => { event.preventDefault(); setReviews((current) => ({ ...current, [movie.id]: { rating, review } })); setSaved(true) }
  return <>
    <div className="detail-topline"><Link to="/explore"><ArrowLeft size={15} /> BACK TO EXPLORE</Link><span>FILM DOSSIER / {String(movies.indexOf(movie) + 1).padStart(3, '0')}</span></div>
    <section className="detail-hero"><div className="detail-poster"><Poster movie={movie} /></div><div className="detail-copy"><p className="eyebrow">{movie.genre.toUpperCase()} / {movie.year}</p><h1>{movie.title}<span className="heading-period">.</span></h1><p className="detail-tagline">“{movie.tagline}”</p><div className="detail-facts"><span><Star size={16} fill="currentColor" /> {movie.rating.toFixed(1)} <small>COMMUNITY</small></span><i /><span><Clock3 size={16} /> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span><i /><span>{movie.year}</span></div><p className="detail-synopsis">{movie.synopsis}</p><dl className="detail-credits"><div><dt>DIRECTOR</dt><dd>{movie.director}</dd></div><div><dt>STARRING</dt><dd>{movie.cast.join(' · ')}</dd></div></dl>
        <div className="detail-actions"><button className={`button ${watchlist.includes(movie.id) ? 'button-active' : 'button-primary'}`} type="button" onClick={() => toggleWatchlist(movie.id)}>{watchlist.includes(movie.id) ? <Check size={16} /> : <Bookmark size={16} />}{watchlist.includes(movie.id) ? 'In your watchlist' : 'Add to watchlist'}</button><button className={`button button-outline ${watched.includes(movie.id) ? 'button-active' : ''}`} type="button" onClick={() => toggleWatched(movie.id)}>{watched.includes(movie.id) ? <Check size={16} /> : <Film size={16} />}{watched.includes(movie.id) ? 'Watched' : 'Mark as watched'}</button><button className={`icon-button detail-favorite ${favorites.includes(movie.id) ? 'is-favorite' : ''}`} type="button" aria-label={favorites.includes(movie.id) ? 'Remove from favourites' : 'Add to favourites'} title={favorites.includes(movie.id) ? 'Remove favourite' : 'Add to favourites'} onClick={() => toggleFavorite(movie.id)}><Heart size={18} fill={favorites.includes(movie.id) ? 'currentColor' : 'none'} /></button></div>
        <div className="cast-strip"><span>FEATURING</span>{movie.cast.map((person, index) => <b key={person}>{person}{index < movie.cast.length - 1 && <i> / </i>}</b>)}</div>
      </div></section>
    <section className="review-section"><div className="review-intro"><p className="eyebrow">YOUR PRIVATE FILM JOURNAL</p><h2>Make it personal<span className="heading-period">.</span></h2><p>Keep a note of what stayed with you.</p>{personal?.rating > 0 && <div className="saved-rating"><span>Your rating</span><b><Star size={14} fill="currentColor" /> {personal.rating}/5</b></div>}</div><form className="review-form" onSubmit={submit}><label className="form-label">YOUR RATING</label><div className="rating-picker" role="group" aria-label="Your rating out of five">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" aria-label={`Rate ${value} out of 5`} aria-pressed={rating === value} onClick={() => setRating(value)}><Star size={22} fill={rating >= value ? 'currentColor' : 'none'} /></button>)}<span>{rating ? `${rating} / 5` : 'Not rated'}</span></div><label className="form-label" htmlFor="review-text">YOUR NOTES</label><textarea id="review-text" value={review} onChange={(event) => setReview(event.target.value)} placeholder="What did you think? This stays on your device." rows="3" /><div className="review-submit"><button type="submit" className="button button-primary">Save to journal <ArrowRight size={15} /></button>{saved && <span className="save-confirmation"><Check size={14} /> Saved to your journal</span>}</div></form></section>
    <MovieRow title="Keep the credits rolling" eyebrow="YOU MIGHT ALSO LIKE" items={movies.filter((entry) => entry.genre === movie.genre && entry.id !== movie.id).slice(0, 5)} favorites={favorites} watchlist={watchlist} onFavorite={toggleFavorite} onWatchlist={toggleWatchlist} />
  </>
}

function WatchlistPage({ watchlist, watched, favorites, toggleWatchlist, toggleFavorite, toggleWatched }) {
  const savedMovies = movies.filter((movie) => watchlist.includes(movie.id))
  const unwatchedMovies = savedMovies.filter((movie) => !watched.includes(movie.id))
  const watchedMovies = savedMovies.filter((movie) => watched.includes(movie.id))
  const [active, setActive] = useState('To watch')
  const shown = active === 'To watch' ? unwatchedMovies : watchedMovies
  return <section className="collection-page"><div className="page-heading"><div><p className="eyebrow">A LIST THAT’S YOURS</p><h1>Watchlist<span className="heading-period">.</span></h1><p className="page-subtitle">A little reminder of what’s worth your time.</p></div><div className="collection-stamp"><Bookmark size={19} /><span>{savedMovies.length}<small>ON YOUR LIST</small></span></div></div>
    <div className="collection-tabs" role="tablist" aria-label="Watchlist status">{['To watch', 'Watched'].map((tab) => <button type="button" role="tab" aria-selected={active === tab} className={active === tab ? 'active' : ''} onClick={() => setActive(tab)} key={tab}>{tab}<span>{tab === 'To watch' ? unwatchedMovies.length : watchedMovies.length}</span></button>)}</div>
    {shown.length ? <div className="movie-grid">{shown.map((movie) => <div className="collection-card" key={movie.id}><MovieCard movie={movie} favorite={favorites.includes(movie.id)} saved={watchlist.includes(movie.id)} onFavorite={toggleFavorite} onWatchlist={toggleWatchlist} /><button className="collection-remove" type="button" onClick={() => toggleWatchlist(movie.id)}><Trash2 size={14} /> Remove</button>{active === 'To watch' && <button className="collection-mark" type="button" onClick={() => toggleWatched(movie.id)}><Check size={14} /> Mark watched</button>}</div>)}</div> : <EmptyState icon={active === 'Watched' ? Check : Bookmark} title={active === 'Watched' ? 'Nothing watched yet' : 'Your list is a blank reel'} copy={active === 'Watched' ? 'Mark a film as watched and it will find a home here.' : 'Save a film for a night when you need a great story.'} />}
  </section>
}

function FavouritesPage({ favorites, watchlist, toggleFavorite, toggleWatchlist }) {
  const films = movies.filter((movie) => favorites.includes(movie.id))
  return <section className="collection-page"><div className="page-heading"><div><p className="eyebrow">THE ONES THAT STAY WITH YOU</p><h1>Favourites<span className="heading-period">.</span></h1><p className="page-subtitle">Your personal shelf of keepers.</p></div><div className="collection-stamp"><Heart size={19} /><span>{films.length}<small>FAVOURITE FILMS</small></span></div></div>
    {films.length ? <div className="movie-grid">{films.map((movie) => <MovieCard key={movie.id} movie={movie} favorite={true} saved={watchlist.includes(movie.id)} onFavorite={toggleFavorite} onWatchlist={toggleWatchlist} />)}</div> : <EmptyState icon={Heart} title="No favourites, yet" copy="When a film feels like yours, keep it close." />}
  </section>
}

function ProfilePage({ watched, watchlist, favorites, reviews }) {
  const rated = Object.entries(reviews).filter(([, entry]) => entry.rating > 0)
  const average = rated.length ? (rated.reduce((total, [, entry]) => total + Number(entry.rating), 0) / rated.length).toFixed(1) : '—'
  const genreCounts = watched.reduce((counts, id) => { const movie = movies.find((entry) => entry.id === id); if (movie) counts[movie.genre] = (counts[movie.genre] || 0) + 1; return counts }, {})
  const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 4)
  const watchedMovies = movies.filter((movie) => watched.includes(movie.id))
  return <section className="profile-page"><div className="page-heading"><div><p className="eyebrow">YOUR PRIVATE SCREENING ROOM</p><h1>My film log<span className="heading-period">.</span></h1><p className="page-subtitle">A little portrait of your life in films.</p></div><div className="profile-monogram">CS<span>MEMBER SINCE 2025</span></div></div>
    <div className="stat-grid"><StatTile label="Films watched" value={watched.length} icon={Check} note="AND COUNTING" /><StatTile label="On your watchlist" value={watchlist.length} icon={Bookmark} note="FOR A RAINY NIGHT" /><StatTile label="Average rating" value={average} icon={Star} note={`${rated.length} PERSONAL ${rated.length === 1 ? 'RATING' : 'RATINGS'}`} /><StatTile label="Favourites" value={favorites.length} icon={Heart} note="ALL-TIME KEEPERS" /></div>
    <section className="taste-section"><div className="taste-heading"><p className="eyebrow">YOUR VIEWING HABITS</p><h2>A taste for stories<span className="heading-period">.</span></h2></div>{topGenres.length ? <div className="genre-stats">{topGenres.map(([genre, amount]) => <div className="genre-stat" key={genre}><span>{genre}</span><div className="genre-track"><span style={{ width: `${Math.max(14, (amount / topGenres[0][1]) * 100)}%` }} /></div><b>{amount}</b></div>)}</div> : <p className="taste-empty">Mark films as watched to see your favourite genres take shape.</p>}</section>
    <section className="recent-log"><div className="row-heading"><div><p className="eyebrow">YOUR LATEST VIEWINGS</p><h2>Recently watched</h2></div><Link to="/watchlist" className="text-link">Open watchlist <ArrowRight size={15} /></Link></div>{watchedMovies.length ? <div className="card-row">{watchedMovies.slice(-8).reverse().map((movie) => <MovieCard key={movie.id} movie={movie} favorite={favorites.includes(movie.id)} saved={watchlist.includes(movie.id)} onFavorite={() => {}} onWatchlist={() => {}} showActions={false} />)}</div> : <div className="profile-empty"><p>Your log starts with the next film you watch.</p><Link to="/explore" className="text-link">Find a film <ArrowRight size={15} /></Link></div>}</section>
  </section>
}

function StatTile({ label, value, icon: Icon, note }) {
  return <div className="stat-tile"><div className="stat-top"><span>{label}</span><Icon size={17} /></div><strong>{value}</strong><small>{note}</small></div>
}

export default App