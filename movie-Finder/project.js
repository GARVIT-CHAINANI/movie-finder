const moviesContainer = document.querySelector(".movies--container");
const movieDetailContainer = document.querySelector(".movie-detail");

function renderMovieSearch(data) {
  const html = `
  <article class="movie" data-id=${data.imdbID}>
    <img class="movie__img" src="${data.Poster}" />
       <div class="movie__data">
             <h3 class="movie__name">${data.Title}</h3>
             <h4 class="movie__region">${data.Type}</h4>
             <p class="movie__row">${data.Year}</p>
       </div>
  </article>`;

  moviesContainer.insertAdjacentHTML("beforeend", html);
}
function renderError(msg) {
  moviesContainer.style.whiteSpace = "pre-line";
  moviesContainer.insertAdjacentText("beforeend", `${msg} 💥💥💥`);
}

function showMovieDetail(data) {
  document.querySelector(".movie-detail__img").src = data.Poster;
  document.querySelector(".movie-detail__title").textContent = data.Title;
  document.querySelector(".movie-detail__description").textContent = data.Plot;

  document.querySelector(".detail-year").textContent = data.Year;
  document.querySelector(".detail-actors").textContent = data.Actors;
  document.querySelector(".detail-rating").textContent = data.imdbRating;
  document.querySelector(".detail-language").textContent = data.Language;
  document.querySelector(".detail-genre").textContent = data.Genre;
  document.querySelector(".detail-director").textContent = data.Director;

  movieDetailContainer.classList.remove("hidden");
}

async function moreData(id) {
  showSpinner();
  document.querySelector(".overlay").classList.remove("hidden");

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=16f1b40b&i=${id}&plot=full`
    );

    const moreDataMovie = await response.json();
    console.log(moreDataMovie);
    showMovieDetail(moreDataMovie);
  } catch (error) {
    console.error(error);
  } finally {
    document.querySelector(".overlay").classList.add("hidden");
    hideSpinner();
  }
}

function closeMovieDetail(e) {
  document.querySelector(".movie-detail").classList.add("hidden");
}

async function MoviesBySearch(search) {
  showSpinner();
  document.querySelector(".overlay").classList.remove("hidden");

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=16f1b40b&s=${search}`
    );

    if (!response.ok) {
      throw new Error("💥💥💥");
    }

    const searchResults = await response.json();
    console.log(searchResults);

    const moviesArr = await searchResults.Search;
    moviesArr.forEach((movie) => {
      renderMovieSearch(movie);
    });
  } catch (error) {
    renderError("SOMETHING WENT WRONG!!!");
  } finally {
    moviesContainer.style.opacity = 1;
    document.querySelector(".bg__img").style.display = "none";
    document.querySelector(".overlay").classList.add("hidden");
    const intro = document.querySelector(".intro");
    if (intro) intro.style.display = "none";
    document.querySelector(".landing").style.marginLeft = "14%";
    hideSpinner();
  }
}

function showSpinner() {
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  spinner.id = "spinner";
  document.body.appendChild(spinner);
  // spinner.style.position = "absolute";
}

function hideSpinner() {
  const spinner = document.getElementById("spinner");
  if (spinner) spinner.remove();
}

document.querySelector("button").addEventListener("click", function () {
  const searchValue = document.querySelector("#search__field").value;
  if (!searchValue) return;
  moviesContainer.innerHTML = "";
  MoviesBySearch(searchValue);
});

document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();

  const searchValue = document.querySelector("#search__field").value;
  if (!searchValue) return;
  moviesContainer.innerHTML = "";
  MoviesBySearch(searchValue);
});

moviesContainer.addEventListener("click", function (e) {
  const movieEl = e.target.closest(".movie");

  if (!movieEl) return;

  moreData(movieEl.dataset.id);
});

function eventsToCloseDetails() {
  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Escape" &&
      !movieDetailContainer.classList.contains("hidden")
    ) {
      closeMovieDetail();
    }
  });

  movieDetailContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("movie-detail")) {
      closeMovieDetail();
    }
  });

  const closeBtn = document.querySelector(".movie-detail__close");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeMovieDetail);
  }
}

eventsToCloseDetails();

async function fetchMovieForSidebar(title) {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=16f1b40b&s=${encodeURIComponent(title)}`
    );

    const data = await response.json();
    console.log("Fetched:", title, data);

    if (data.Search && data.Search.length > 0) {
      const movie = data.Search[0];
      renderPopularMovie(movie);
      return movie;
    }
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function loadPopularMovies() {
  const popularTitles = [
    "Final Destination Bloodlines",
    "Predator: Killer of Killers",
    "Bhool Chuk Maaf",
    "Clown in a Cornfield",
    "Sikandar",
    "Kesari Chapter 2",
    "Wick Is Pain",
    "Until Dawn",
    "Ground Zero",
    "The Monkey",
    "Detective Sherdil",
    "Gajaana",
    "Snow White",
    "In the Lost Lands",
    "KPop Demon Hunters",
    "Interstellar",
    "Avengers: Endgame",
    "The Dark Knight",
    "Titanic",
  ];

  // Fire all fetches in parallel
  const fetchPromises = popularTitles.map((title) =>
    fetchMovieForSidebar(title)
  );

  const allMovies = await Promise.all(fetchPromises);

  console.log("All fetched movies:", allMovies.filter(Boolean));
}

loadPopularMovies();

function renderPopularMovie(movie) {
  const container = document.querySelector(".popular-movies-container");
  if (!container) {
    console.error("Missing .popular-movies-container in HTML");
    return;
  }

  const html = `
    <div class="popular-movie" data-id="${movie.imdbID}">
      <img src="${movie.Poster}" alt="${movie.Title}"/>
      <span>${movie.Title}</span>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", html);
}

// handle clicks
document
  .querySelector(".popular-movies-container")
  .addEventListener("click", function (e) {
    const movieEl = e.target.closest(".popular-movie");
    if (!movieEl) return;

    const id = movieEl.dataset.id;
    if (!id) return;
    console.log(id);

    moreData(id);
  });

// load them on page load
loadPopularMovies();
