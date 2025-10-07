// script.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginModal = document.getElementById('loginModal');
    const recipeModal = document.getElementById('recipeModal');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const favoritesBtn = document.getElementById('favoritesBtn');
    const themeToggle = document.getElementById('themeToggle');
    const closeBtns = document.querySelectorAll('.close');
    const loginForm = document.getElementById('loginForm');
    const searchBtn = document.getElementById('searchBtn');
    const foodContainer = document.getElementById('foodContainer');
    const registerLink = document.getElementById('registerLink');
    const searchInput = document.getElementById('searchInput');
    const recipeTitle = document.getElementById('recipeTitle');
    const recipeImage = document.getElementById('recipeImage');
    const recipeCategory = document.getElementById('recipeCategory');
    const recipeIngredients = document.getElementById('recipeIngredients');
    const recipeInstructions = document.getElementById('recipeInstructions');
    const recipeVideo = document.getElementById('recipeVideo');
    const favoriteBtn = document.getElementById('favoriteBtn');
    const logo = document.getElementById('logo');

    // User and Favorites System
    let users = JSON.parse(localStorage.getItem('users')) || {};
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let currentUser = null;
    let currentMealId = null;

    // Login Modal Controls
    loginBtn.onclick = () => {
        loginModal.style.display = 'block';
        setTimeout(() => loginModal.classList.add('show'), 10);
    };
    closeBtns.forEach(btn => btn.onclick = () => {
        loginModal.classList.remove('show');
        recipeModal.classList.remove('show');
        setTimeout(() => {
            loginModal.style.display = 'none';
            recipeModal.style.display = 'none';
        }, 300);
    });
    window.onclick = (event) => {
        if (event.target === loginModal) {
            loginModal.classList.remove('show');
            setTimeout(() => loginModal.style.display = 'none', 300);
        }
        if (event.target === recipeModal) {
            recipeModal.classList.remove('show');
            setTimeout(() => recipeModal.style.display = 'none', 300);
        }
    };

    // Login System
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (users[username] && users[username].password === password) {
            currentUser = username;
            loginModal.classList.remove('show');
            setTimeout(() => {
                loginModal.style.display = 'none';
                loginBtn.style.display = 'none';
                logoutBtn.style.display = 'block';
                favoritesBtn.style.display = 'block';
            }, 300);
            alert('Login successful!');
        } else {
            alert('Invalid credentials');
        }
    };

    // Registration
    registerLink.onclick = () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username && password && !users[username]) {
            users[username] = { password };
            localStorage.setItem('users', JSON.stringify(users));
            alert('Registration successful! Please login.');
        } else {
            alert('Username already exists or fields are empty');
        }
    };

    // Logout
    logoutBtn.onclick = () => {
        currentUser = null;
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        favoritesBtn.style.display = 'none';
    };

    // Theme Toggle
    themeToggle.onclick = () => {
        document.body.classList.toggle('dark-theme');
        themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    };
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    }

    // Logo Click to Home
    logo.onclick = () => {
        searchInput.value = '';
        fetchFood('chicken'); // Reset to initial state
    };

    // TheMealDB API Search
    async function fetchFood(query = 'chicken', isFavorites = false) {
        try {
            if (isFavorites) {
                displayFood(favorites);
                return;
            }
            const encodedQuery = encodeURIComponent(query);
            let url;
            const categories = [
                'beef', 'chicken', 'dessert', 'lamb', 'miscellaneous', 'pasta', 'pork', 
                'seafood', 'side', 'starter', 'vegan', 'vegetarian', 'breakfast', 'goat'
            ];
            const isCategory = categories.some(cat => cat.toLowerCase() === query.toLowerCase());

            if (isCategory) {
                url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodedQuery}`;
            } else {
                url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodedQuery}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            if (!data.meals || data.meals.length === 0) {
                foodContainer.innerHTML = '<p>No food items found</p>';
                return;
            }

            const mappedItems = data.meals.map(meal => {
                const category = isCategory ? query : (meal.strCategory || 'Unknown');
                return {
                    id: meal.idMeal,
                    food: {
                        label: meal.strMeal,
                        category: category,
                        image: meal.strMealThumb || 'https://via.placeholder.com/150'
                    }
                };
            });
            displayFood(mappedItems);
        } catch (error) {
            console.error('Error fetching food:', error);
            foodContainer.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    }

    async function fetchRecipeDetails(mealId) {
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            const meal = data.meals[0];

            recipeTitle.textContent = meal.strMeal;
            recipeImage.src = meal.strMealThumb;
            recipeImage.alt = meal.strMeal;
            recipeCategory.textContent = meal.strCategory;
            recipeInstructions.textContent = meal.strInstructions || 'No instructions available';

            recipeIngredients.innerHTML = '';
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim()) {
                    const li = document.createElement('li');
                    li.textContent = `${measure} ${ingredient}`;
                    recipeIngredients.appendChild(li);
                }
            }

            if (meal.strYoutube) {
                recipeVideo.href = meal.strYoutube;
                recipeVideo.style.display = 'block';
            } else {
                recipeVideo.style.display = 'none';
            }

            currentMealId = mealId;
            favoriteBtn.textContent = favorites.some(fav => fav.id === mealId) ? 'Remove from Favorites' : 'Add to Favorites';
            recipeModal.style.display = 'block';
            setTimeout(() => recipeModal.classList.add('show'), 10);
        } catch (error) {
            console.error('Error fetching recipe:', error);
            recipeModal.style.display = 'none';
        }
    }

    function displayFood(items) {
        foodContainer.innerHTML = '';
        items.forEach(item => {
            const food = item.food;
            const foodCard = document.createElement('div');
            foodCard.className = 'food-card';
            foodCard.innerHTML = `
                <img src="${food.image}" alt="${food.label}">
                <h3>${food.label}</h3>
                <p>Category: ${food.category}</p>
            `;
            foodCard.addEventListener('click', () => fetchRecipeDetails(item.id));
            foodContainer.appendChild(foodCard);
        });
    }

    // Search functionality
    searchBtn.onclick = () => {
        const query = searchInput.value.trim();
        if (query) fetchFood(query);
        else alert('Please enter a meal name or category');
    };

    // Favorites functionality
    favoriteBtn.onclick = () => {
        if (!currentUser) {
            alert('Please log in to save favorites!');
            return;
        }
        const isFavorited = favorites.some(fav => fav.id === currentMealId);
        if (isFavorited) {
            favorites = favorites.filter(fav => fav.id !== currentMealId);
            favoriteBtn.textContent = 'Add to Favorites';
        } else {
            const meal = {
                id: currentMealId,
                food: {
                    label: recipeTitle.textContent,
                    category: recipeCategory.textContent,
                    image: recipeImage.src
                }
            };
            favorites.push(meal);
            favoriteBtn.textContent = 'Remove from Favorites';
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
    };

    favoritesBtn.onclick = () => fetchFood(null, true);

    // Initial load
    fetchFood();
});