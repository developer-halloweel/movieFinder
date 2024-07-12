const apiKey = 'ca032cab'; 
const youtubeApiKey = 'AIzaSyA3nl8ap_uv1ob6UihhmI22tN-xb3V96E0'; 
const watchmodeApiKey = 'UuvcHrtV3hOgxNwA3zPZw1g1ekj1d5N0oFqpVM7i';


document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            searchMovie();
        }
    });

    searchButton.addEventListener('click', () => {
        searchMovie();
        hideSuggestions(); 
    });
});

async function searchMovie() {
    const title = document.getElementById('searchInput').value;
    const response = await fetch(`https://www.omdbapi.com/?t=${title}&apikey=${apiKey}`);
    const data = await response.json();

    if (data.Response === 'True') {
        displayMovieDetails(data);
        await searchTrailer(data.Title);
        fetchStreamingOptions(data.imdbID);
        document.getElementById('searchInput').value = '';
    } else {
        document.getElementById('movieDetails').innerHTML = `<p>Movie not found!</p>`;
        document.getElementById('trailer').innerHTML = '';
    }
}

function displayMovieDetails(movie) {
    document.getElementById('movieDetails').innerHTML = `
        <div class="movie-info">
            <img src="${movie.Poster}" alt="${movie.Title}">
            <h2>${movie.Title}</h2>
            <p><strong>Year:</strong> ${movie.Year}</p>
            <p><strong>Genre:</strong> ${movie.Genre}</p>
            <p><strong>Director:</strong> ${movie.Director}</p>
            <p><strong>Plot:</strong> ${movie.Plot}</p>
            <div id="streamingAvailability"></div>
        </div>
    `;
}

async function fetchStreamingOptions(imdbID) {
    const response = await fetch(`https://api.watchmode.com/v1/title/${imdbID}/sources/?apiKey=${watchmodeApiKey}`);
    const data = await response.json();

    if (data && data.length > 0) {
        displayStreamingOptions(data);
    } else {
        document.getElementById('streamingAvailability').innerHTML = '<p>No streaming options found.</p>';
    }
}

function displayStreamingOptions(sources) {
    const streamingDiv = document.getElementById('streamingAvailability');
    streamingDiv.innerHTML = '<h3>Streaming Options:</h3>';

    sources.slice(0, 5).forEach(source => {
        const sourceElement = document.createElement('div');
        sourceElement.innerHTML = `<a href="${source.web_url}" target="_blank">${source.name}</a>`;
        streamingDiv.appendChild(sourceElement);
    });
}



async function suggestMovies() {
    const query = document.getElementById('searchInput').value;
    if (query.length < 3) {
        document.getElementById('suggestions').innerHTML = '';
        return;
    }

    const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`);
    const data = await response.json();

    if (data.Response === 'True') {
        displaySuggestions(data.Search);
    } else {
        document.getElementById('suggestions').innerHTML = '<p>No suggestions found.</p>';
    }
}

function displaySuggestions(movies) {
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = '';
    movies.forEach(movie => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = movie.Title;
        suggestionItem.onclick = () => {
            document.getElementById('searchInput').value = movie.Title;
            searchMovie();
            hideSuggestions();
        };
        suggestions.appendChild(suggestionItem);
    });
}

async function searchTrailer(title) {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${title} trailer&type=video&key=${youtubeApiKey}`);
        const data = await response.json();
        console.log('YouTube API response:', data);  // Log the response for debugging

        if (data.items && data.items.length > 0) {
            const videoId = data.items[0].id.videoId;
            displayTrailer(videoId);
        } else {
            document.getElementById('trailer').innerHTML = '<p>Trailer not found.</p>';
        }
    } catch (error) {
        console.error('Error fetching YouTube trailer:', error);
        document.getElementById('trailer').innerHTML = '<p>Error fetching trailer.</p>';
    }
}

function displayTrailer(videoId) {
    document.getElementById('trailer').innerHTML = `
        <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    `;
}

function hideSuggestions() {
    document.getElementById('suggestions').innerHTML = '';
}

