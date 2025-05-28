// Sample movies data with duration
const movies = [
  {
    title: "Władca Pierścieni",
    imageUrl: "https://storage.googleapis.com/pod_public/1300/106935.jpg",
    year: "2001",
    rating: "4.9/5",
    genre: "Fantasy, Przygodowy",
    description: "Młody hobbit wyrusza w niebezpieczną misję, aby zniszczyć potężny pierścień i pokonać mrocznego władcę Saurona.",
    dateAdded: "2025-04-26",
    videoUrl: "https://download.samplelib.com/mp4/sample-30s.mp4",
    duration: "2h 58m",
    categories: ["Fantasy", "Przygodowy", "Akcja"]
  },
  {
    title: "Incepcja",
    imageUrl: "https://multikino.pl/-/jssmedia/multikino/images/kultowe-kino/incepcja_2_b1-copy.jpg?mw=450&rev=b66a22b6e34e453cb20e6c03fea927aa",
    year: "2010",
    rating: "4.8/5",
    genre: "Sci-Fi, Akcja",
    description: "Dom Cobb jest mistrzem w sztuce wydobywania wartościowych informacji z umysłów ludzi podczas snu.",
    dateAdded: "2024-03-20",
    videoUrl: "https://download.samplelib.com/mp4/sample-20s.mp4",
    duration: "2h 28m",
    categories: ["Sci-Fi", "Akcja", "Thriller"]
  },
  {
    title: "Pulp Fiction",
    imageUrl: "https://static.posters.cz/image/1300/plakaty/pulp-fiction-cover-i1288.jpg",
    year: "1994",
    rating: "4.9/5",
    genre: "Kryminał, Dramat",
    description: "Przemoc i odkupienie w Los Angeles w kilku nietypowo połączonych ze sobą historiach.",
    dateAdded: "2024-02-15",
    duration: "2h 34m",
    categories: ["Kryminał", "Dramat", "Thriller"]
  },
  {
    title: "Skazani na Shawshank",
    imageUrl: "https://cdn.swiatksiazki.pl/media/catalog/product/3/7/3799906597437.jpg?store=default&image-type=large",
    year: "1994",
    rating: "4.9/5",
    genre: "Dramat",
    description: "Niesłusznie skazany bankier Andy Dufresne rozpoczyna odbywanie wyroku dożywocia w więzieniu Shawshank.",
    dateAdded: "2024-03-18",
    duration: "2h 22m",
    categories: ["Dramat", "Kryminał"]
  },
  {
    title: "Zielona Mila",
    imageUrl: "https://static.profinfo.pl/storage/image/core_products/2024/6/14/580dc12dbd0a9d0f2dd241e50c55d8f8/admin/preview/14025B01622KS_HD.jpg.webp",
    year: "1999",
    rating: "4.8/5",
    genre: "Dramat, Fantasy",
    description: "Strażnik więzienny odkrywa, że skazaniec posiada nadprzyrodzone zdolności uzdrawiania.",
    dateAdded: "2024-03-10",
    duration: "3h 9m",
    categories: ["Dramat", "Fantasy", "Kryminał"]
  }
];

// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
});

// Watchlist functions
async function getWatchlist() {
  try {
    const response = await fetch('watchlist_actions.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        action: 'get'
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.watchlist || [];
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
}

async function addToWatchlist(movieId) {
  const movie = movies[movieId];
  if (!movie) return;

  try {
    const response = await fetch('watchlist_actions.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        action: 'add',
        title: movie.title,
        year: movie.year
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    await updateWatchlistUI();
  } catch (error) {
    console.error('Error adding to watchlist:', error);
  }
}

async function removeFromWatchlist(movieId) {
  const movie = movies[movieId];
  if (!movie) return;

  try {
    const response = await fetch('watchlist_actions.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        action: 'remove',
        title: movie.title,
        year: movie.year
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    await updateWatchlistUI();
  } catch (error) {
    console.error('Error removing from watchlist:', error);
  }
}

async function isInWatchlist(movieId) {
  const watchlist = await getWatchlist();
  const movie = movies[movieId];
  return watchlist.includes(movie.title);
}

async function updateWatchlistUI() {
  const watchlist = await getWatchlist();
  const watchlistContainer = document.getElementById('watchlist');

  if (watchlistContainer) {
    if (!watchlist.length) {
      watchlistContainer.innerHTML = '<div class="empty-watchlist">Twoja lista do obejrzenia jest pusta</div>';
    } else {
      const watchlistMovies = movies.filter(movie => watchlist.includes(movie.title));
      watchlistContainer.innerHTML = watchlistMovies.map((movie, index) => {
        const originalIndex = movies.findIndex(m => m.title === movie.title);
        return createMovieCard(movie, originalIndex);
      }).join('');
    }
  }

  // Update featured movie watchlist button if it exists
  setTimeout(() => {
    updateFeaturedMovieButton();
  }, 10);

  // Update any open movie overlay
  if (currentOverlay) {
    const movieId = parseInt(currentOverlay.querySelector('.movie-details-content').dataset.movieId);
    const watchlistButton = currentOverlay.querySelector('.watchlist-button');
    const inWatchlist = await isInWatchlist(movieId);

    if (watchlistButton) {
      watchlistButton.className = `btn ${inWatchlist ? 'btn-primary' : 'btn-secondary'} watchlist-button`;
      watchlistButton.innerHTML = `
        <i data-lucide="${inWatchlist ? 'check' : 'plus'}"></i>
        <span>${inWatchlist ? 'Usuń z listy' : 'Dodaj do listy'}</span>
      `;
      lucide.createIcons();
    }
  }

  // Re-setup movie overlay for new watchlist cards
  setupMovieOverlay();
}

function createMovieCard(movie, index) {
  return `
    <div class="movie-card" data-movie-id="${index}">
      <div class="movie-poster">
        <img src="${movie.imageUrl}" alt="${movie.title}" loading="lazy">
        <div class="movie-overlay">
          <button class="btn btn-primary watch-button" onclick="showMovieDetails(${index})">
            <i data-lucide="play"></i>
            <span>Oglądaj</span>
          </button>
        </div>
      </div>
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <div class="movie-meta">
          <span class="year">${movie.year}</span>
          <span class="duration">${movie.duration}</span>
          <span class="rating">${movie.rating}</span>
        </div>
        <p class="genre">${movie.genre}</p>
      </div>
    </div>
  `;
}

function showMovieDetails(movieId) {
  const movie = movies[movieId];
  if (!movie) return;

  const overlay = document.createElement('div');
  overlay.className = 'movie-overlay-container';
  
  overlay.innerHTML = `
    <div class="movie-details-content" data-movie-id="${movieId}">
      <button class="close-button" onclick="closeMovieOverlay()">
        <i data-lucide="x"></i>
      </button>
      <div class="movie-details-grid">
        <div class="movie-poster">
          <img src="${movie.imageUrl}" alt="${movie.title}">
        </div>
        <div class="movie-info">
          <h2>${movie.title}</h2>
          <div class="movie-meta">
            <span class="year">${movie.year}</span>
            <span class="duration">${movie.duration}</span>
            <span class="rating">${movie.rating}</span>
          </div>
          <p class="genre">${movie.genre}</p>
          <p class="description">${movie.description}</p>
          <div class="action-buttons">
            <button class="btn btn-primary watch-button" onclick="playMovie('${movie.videoUrl}')">
              <i data-lucide="play"></i>
              <span>Oglądaj</span>
            </button>
            <button class="btn btn-secondary watchlist-button" onclick="toggleWatchlist(${movieId})">
              <i data-lucide="plus"></i>
              <span>Dodaj do listy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  currentOverlay = overlay;
  document.body.style.overflow = 'hidden';
  
  lucide.createIcons();
  updateMovieOverlayWatchlistButton(movieId);
}

function closeMovieOverlay() {
  if (currentOverlay) {
    currentOverlay.remove();
    currentOverlay = null;
    document.body.style.overflow = '';
  }
}

async function toggleWatchlist(movieId) {
  const isCurrentlyInWatchlist = await isInWatchlist(movieId);
  
  if (isCurrentlyInWatchlist) {
    await removeFromWatchlist(movieId);
  } else {
    await addToWatchlist(movieId);
  }
}

async function updateMovieOverlayWatchlistButton(movieId) {
  const inWatchlist = await isInWatchlist(movieId);
  const watchlistButton = currentOverlay.querySelector('.watchlist-button');
  
  if (watchlistButton) {
    watchlistButton.className = `btn ${inWatchlist ? 'btn-primary' : 'btn-secondary'} watchlist-button`;
    watchlistButton.innerHTML = `
      <i data-lucide="${inWatchlist ? 'check' : 'plus'}"></i>
      <span>${inWatchlist ? 'Usuń z listy' : 'Dodaj do listy'}</span>
    `;
    lucide.createIcons();
  }
}

function setupMovieOverlay() {
  const movieCards = document.querySelectorAll('.movie-card');
  movieCards.forEach(card => {
    card.addEventListener('click', () => {
      const movieId = card.dataset.movieId;
      showMovieDetails(movieId);
    });
  });
}

function playMovie(videoUrl) {
  const videoPlayer = document.createElement('div');
  videoPlayer.className = 'video-player-overlay';
  videoPlayer.innerHTML = `
    <div class="video-player-container">
      <button class="close-button" onclick="closeVideoPlayer()">
        <i data-lucide="x"></i>
      </button>
      <video controls autoplay>
        <source src="${videoUrl}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>
  `;
  
  document.body.appendChild(videoPlayer);
  lucide.createIcons();
}

function closeVideoPlayer() {
  const videoPlayer = document.querySelector('.video-player-overlay');
  if (videoPlayer) {
    videoPlayer.remove();
  }
}

async function updateFeaturedMovieButton() {
  const featuredMovieButton = document.querySelector('.featured-movie .watchlist-button');
  if (featuredMovieButton) {
    const movieId = parseInt(featuredMovieButton.dataset.movieId);
    const inWatchlist = await isInWatchlist(movieId);
    
    featuredMovieButton.className = `btn ${inWatchlist ? 'btn-primary' : 'btn-secondary'} watchlist-button`;
    featuredMovieButton.innerHTML = `
      <i data-lucide="${inWatchlist ? 'check' : 'plus'}"></i>
      <span>${inWatchlist ? 'Usuń z listy' : 'Dodaj do listy'}</span>
    `;
    lucide.createIcons();
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  setupMovieOverlay();
  updateWatchlistUI();
});