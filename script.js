async function fetchDogBreeds() {
    const response = await fetch('https://api.thedogapi.com/v1/breeds', {
        headers: {
            'x-api-key': 'live_aOC2A2OjiqADZ4q2ZoIMFzh4KTzdbWgXRVtZDHAbqx0qSbs26cKsyR5jrJSSSCjj'
        }
    });
    const breeds = await response.json();
    return breeds;
}

function displayBreeds(breeds) {
    const breedList = document.getElementById('breed-list');
    breedList.innerHTML = '';

    breeds.forEach(breed => {
        const breedItem = document.createElement('div');
        breedItem.className = 'breed-item';
        breedItem.innerHTML = `
            <h3>${breed.name}</h3>
            <img src="${breed.image ? breed.image.url : 'placeholder.jpg'}" alt="${breed.name}">
            <p><strong>Peso:</strong> ${breed.weight.metric} kg</p>
            <p><strong>Expectativa de Vida:</strong> ${breed.life_span}</p>
            <button class="favorite-btn" data-breed='${JSON.stringify(breed)}'>Favoritar</button>
        `;
        breedList.appendChild(breedItem);

        // Adiciona evento de clique para exibir detalhes
        breedItem.addEventListener('click', () => showBreedDetails(breed, breedItem));
    });

    // Adiciona evento de favoritos para os botões
    document.querySelectorAll('.favorite-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            const breed = JSON.parse(this.getAttribute('data-breed'));
            addFavorite(breed);
            event.stopPropagation(); // Para evitar que o clique no botão favorite também dispare o clique na raça
        });
    });
}

function showBreedDetails(breed, breedItem) {
    // Verifica se já existem detalhes exibidos e remove
    const existingDetails = breedItem.querySelector('.breed-details');
    if (existingDetails) {
        existingDetails.remove();
        return; // Se já existirem detalhes, remove e sai
    }

    // Cria um novo elemento para os detalhes
    const breedDetails = document.createElement('div');
    breedDetails.className = 'breed-details';
    breedDetails.innerHTML = `
        <p><strong>Descrição:</strong> ${breed.breed_group || 'Descrição não disponível'}</p>
        <p><strong>Personalidade:</strong> ${breed.temperament || 'Informação não disponível'}</p>
    `;

    // Adiciona o novo elemento logo abaixo do item da raça
    breedItem.appendChild(breedDetails);
}

function addFavorite(breed) {
    const favorites = getFavorites();
    
    // Verifica se já está nos favoritos
    if (!favorites.some(fav => fav.id === breed.id)) {
        favorites.push(breed);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Raça adicionada aos favoritos!');
    } else {
        alert('Esta raça já está nos favoritos!');
    }
}

function getFavorites() {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
}

function displayFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = '';
    const favorites = getFavorites();

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p>Nenhuma raça favorita.</p>';
        return;
    }

    favorites.forEach(favorite => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.innerHTML = `
            <h3>${favorite.name}</h3>
            <img src="${favorite.image ? favorite.image.url : 'placeholder.jpg'}" alt="${favorite.name}">
        `;
        favoritesList.appendChild(favoriteItem);
    });
}

function applyFilters(breeds) {
    const sizeFilter = document.getElementById('size-filter').value;
    const lifeExpectancyFilter = document.getElementById('life-expectancy-filter').value;
    const searchFilter = document.getElementById('search-filter').value.toLowerCase();

    let filteredBreeds = breeds;

    // Filtro de tamanho
    if (sizeFilter) {
        filteredBreeds = filteredBreeds.filter(breed => {
            const weight = parseInt(breed.weight.metric.split(' ')[0]);
            if (sizeFilter === 'small') return weight <= 10;
            if (sizeFilter === 'medium') return weight > 10 && weight <= 25;
            if (sizeFilter === 'large') return weight > 25;
        });
    }

    // Filtro de expectativa de vida
    if (lifeExpectancyFilter) {
        filteredBreeds = filteredBreeds.filter(breed => {
            const lifeSpan = parseInt(breed.life_span.split(' ')[0]);
            if (lifeExpectancyFilter === 'short') return lifeSpan <= 10;
            if (lifeExpectancyFilter === 'medium') return lifeSpan > 10 && lifeSpan <= 15;
            if (lifeExpectancyFilter === 'long') return lifeSpan > 15;
        });
    }

    // Filtro de busca por nome da raça
    if (searchFilter) {
        filteredBreeds = filteredBreeds.filter(breed => {
            return breed.name.toLowerCase().includes(searchFilter);
        });
    }

    displayBreeds(filteredBreeds);
}

document.getElementById('apply-filters').addEventListener('click', async () => {
    const breeds = await fetchDogBreeds();
    applyFilters(breeds);
});

// Exibe todas as raças ao carregar a página
window.onload = async () => {
    const breeds = await fetchDogBreeds();
    displayBreeds(breeds);
};

// Mostrar e ocultar favoritos
document.getElementById('show-favorites').addEventListener('click', () => {
    const favoritesList = document.getElementById('favorites-list');
    if (favoritesList.style.display === 'none') {
        favoritesList.style.display = 'block';
        displayFavorites(); // Exibe favoritos ao mostrar
    } else {
        favoritesList.style.display = 'none';
    }
});
