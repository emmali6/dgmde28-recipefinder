import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Recipe item component
const RecipeItem = ({ recipe }) => {
  const [category, setCategory] = useState('');
  const [fullRecipeUrl, setFullRecipeUrl] = useState('');

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recipe details');
        }
        const data = await response.json();
        console.log('Recipe details response:', data); // Log the response
        if (data.meals && data.meals.length > 0) {
        setCategory(data.meals[0].strCategory);
        setFullRecipeUrl(data.meals[0].strSource);
        console.log('Full recipe URL:', data.meals[0].strSource); // Log the full recipe URL
      } else {
        console.error('No meal details found in response');
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    }
  };

    fetchRecipeDetails();
  }, [recipe.idMeal]); // Include recipe.idMeal as a dependency

  const handleLinkClick = async (e) => {
    e.preventDefault();
    try {
      console.log('Opening full recipe URL:', fullRecipeUrl); // Log the URL before opening
      window.open(fullRecipeUrl, '_blank');
    } catch (error) {
      console.error('Error opening recipe link:', error);
    }
  };

  return (
    <li className="recipe-item">
      <h3>{recipe.strMeal}</h3>
      <img src={recipe.strMealThumb} alt={recipe.strMeal} className="recipe-image" />
      <p className="recipe-category">Category: {category}</p>
      <a href={fullRecipeUrl} onClick={handleLinkClick} className="recipe-link">See Full Recipe</a>
    </li>
  );
};

// Recipe Finder component
const RecipeFinder = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State to store the search term
  const [dietaryRestrictions, setDietaryRestrictions] = useState([
    { name: 'Vegetarian', checked: false },
    { name: 'Vegan', checked: false },
  ]);
  const [mustIncludeIngredients, setMustIncludeIngredients] = useState('');
  const [cuisineCategories, setCuisineCategories] = useState([
    { name: 'Beef', checked: false },
    { name: 'Breakfast', checked: false },
    { name: 'Chicken', checked: false },
    { name: 'Dessert', checked: false },
    { name: 'Goat', checked: false },
    { name: 'Lamb', checked: false },
    { name: 'Miscellaneous', checked: false },
    { name: 'Pasta', checked: false },
    { name: 'Pork', checked: false },
    { name: 'Seafood', checked: false },
    { name: 'Side', checked: false },
    { name: 'Starter', checked: false },
  ]);

  const [searchReset, setSearchReset] = useState(false); // State to track if search is reset

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      let url = searchTerm
        ? `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`
        : 'https://www.themealdb.com/api/json/v1/1/filter.php?';
  
      const queryParams = [];
  
      // Handle dietary restrictions
    const checkedDietaryRestrictions = dietaryRestrictions.filter(category => category.checked).map(category => category.name.toLowerCase());
    if (checkedDietaryRestrictions.length > 0) {
      queryParams.push(...checkedDietaryRestrictions.map(category => `c=${category}`));
    }

    // Handle cuisine categories
    const checkedCuisineCategories = cuisineCategories.filter(category => category.checked).map(category => category.name.toLowerCase());
    if (checkedCuisineCategories.length > 0) {
      queryParams.push(...checkedCuisineCategories.map(category => `c=${category}`));
    }

    // Handle must include ingredients
    if (mustIncludeIngredients) {
      queryParams.push(`i=${mustIncludeIngredients}`);
    }

    // Add query parameters to the URL
    if (queryParams.length > 0) {
      url += `&${queryParams.join('&')}`;
    }

    console.log("Constructed URL:", url); // Log the constructed URL

    // Fetch recipes
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    setRecipes(data.meals || []);
  } catch (error) {
    console.error('Error fetching recipes:', error);
  } finally {
    setLoading(false);
  }
}, [searchTerm, dietaryRestrictions, cuisineCategories, mustIncludeIngredients]);

  // Define fetchSearchRecipes function for searching recipes
  // eslint-disable-next-line
  const fetchSearchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const searchUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`;
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setRecipes(data.meals || []);
    } catch (error) {
      console.error('Error fetching search recipes:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    // Fetch recipes on component mount
    fetchRecipes();
  }, [fetchRecipes]);

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDietaryChange = (e) => {
    const { value, checked } = e.target;
    setDietaryRestrictions(prevState =>
      prevState.map(option =>
        option.name === value ? { ...option, checked } : { ...option, checked: false }
      )
    );
  };
  
  const handleIngredientsChange = (e) => {
    setMustIncludeIngredients(e.target.value);
  };

  const handleCuisineChange = (e) => {
    const { value } = e.target;
    setCuisineCategories(prevCategories =>
      prevCategories.map(category =>
        category.name === value ? { ...category, checked: true } : { ...category, checked: false }
      )
    );
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    fetchRecipes();
  };

  const handleResetSearch = () => {
    // Clear recipes, dietary restrictions, must include ingredients, and search term
    setRecipes([]);
    setDietaryRestrictions(prevCategories =>
      prevCategories.map(category => ({ ...category, checked: false }))
    );
    setMustIncludeIngredients('');
    setSearchTerm(''); // Clear the search term
    // Uncheck all checked checkboxes for cuisine categories
    setCuisineCategories(prevCategories =>
      prevCategories.map(category => ({ ...category, checked: false }))
    );
    setSearchReset(true); // Set search reset to true
  };
  

  return (
    <div className="recipe-finder">
      <h1 className="title">Recipe Finder</h1>
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          placeholder="Search recipes by name..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
        <div>
          <h3>Dietary Restrictions</h3>
          {/* Render dietary restriction checkboxes */}
          {dietaryRestrictions.map(option => (
            <label key={option.name}>
              <input
                type="checkbox"
                value={option.name}
                onChange={handleDietaryChange}
                checked={option.checked}
              />
              {option.name}
            </label>
          ))}
        </div>
        <div>
          <h3>Cuisine Categories</h3>
          {cuisineCategories.map(category => (
            <label key={category.name}>
              <input
                type="checkbox"
                value={category.name}
                onChange={handleCuisineChange}
                checked={category.checked}
              />
              {category.name}
            </label>
          ))}
        </div>
        <input
          type="text"
          placeholder="Must include ingredients..."
          className="ingredient-input"
          value={mustIncludeIngredients}
          onChange={handleIngredientsChange}
        />
        <button type="submit" className="search-button">Search</button>
        <button type="button" className="reset-button" onClick={handleResetSearch}>Reset Search</button>
      </form>
      <ul className="recipe-grid">
        {/* Conditionally render recipes or a message */}
        {recipes.length > 0 ? (
          recipes.map(recipe => (
            <RecipeItem key={recipe.idMeal} recipe={recipe} />
          ))
        ) : (
          // Render a message only if search is not reset
          !searchReset && <p>No recipes found matching the search criteria.</p>
        )}
      </ul>
      {loading && <p>Loading...</p>}
    </div>
  );
};

// About component
const About = () => {
  return (
    <div className="about">
      <h2 className="title">About Recipe Finder</h2>
      <p className="about-text">
        Welcome to Recipe Finder, your go-to destination for discovering delicious recipes! 
        Our Recipe Finder SPA (Single Page Application) is designed to help you explore a vast collection of recipes 
        from around the world, catering to every taste and dietary preference.
      </p>
      <p className="about-text">
        Whether you're looking for quick and easy weeknight dinners, gourmet delights for special occasions, 
        or healthy options to fit your lifestyle, Recipe Finder has you covered. 
        With just a few clicks, you can search for recipes by name, explore different categories, 
        and even filter by dietary restrictions and must-include ingredients.
      </p>
      <p className="about-text">
        Our mission is to inspire and empower home cooks of all skill levels to get creative in the kitchen 
        and enjoy the satisfaction of preparing delicious meals for themselves and their loved ones. 
        So why wait? Start your culinary adventure with Recipe Finder today!
      </p>
    </div>
  );
};

// Code Requirements component
const CodeRequirements = () => {
  return (
    <div className="code-requirements">
      <h2 className="title">Code Requirements</h2>
      <p className="requirements-info">This page outlines the technical requirements and specifications for the Recipe Finder SPA.</p>
      
      <div className="requirements-section">
        <h3>An Array</h3>
        <h4>dietaryRestrictions Array:</h4>
        <p>This array is used to store objects representing various dietary restrictions such as Vegetarian and Vegan. Each object in the array has two properties: name (the name of the dietary restriction) and checked (a boolean indicating whether the restriction is currently selected or not). It is utilized in the form of checkboxes in the UI, allowing users to select their dietary preferences. When a checkbox is clicked, the corresponding checked property in the array is updated to reflect the user's selection.</p>
        <h4>cuisineCategories Array:</h4>
        <p>Similar to dietaryRestrictions, this array stores objects representing different cuisine categories such as Beef, Chicken, Dessert, etc. It behaves in the same way.</p>
        <h4>recipes Array:</h4>
        <p>This array holds the fetched recipes from the API or the search results. It dynamically populates the recipe items in the UI based on the fetched data. Each element in the array represents a recipe object containing details such as the recipe name, image URL, and meal ID. The array is updated whenever new recipes are fetched from the API or search results are received.</p>
      </div>

      <div className="requirements-section">
        <h3>React JSX Syntax</h3>
        <p>In this SPA, JSX allowed me to write HTML like syntax (eg. div, h1, p) to define elements in the UI. {} are used to embed JS within the JSX. Props are used to pass data between components. useState and useEffect help manage variables like recipes, loading, searchTerm, etc. onChange and onClick are used to deal with user interactions. Mapping arrays allowed me to iterate each item in the recipes array and return a list of recipes based on that data. Router allows for additional 'pages' like this one!</p>
      </div>

      <div className="requirements-section">
        <h3>Form Elements with an Event</h3>
        <p>This SPA features multiple input elements within a form, including text fields for searches, dietary restrictions, and must-include ingredients. The onChange event of the search query is triggered whenever the input value changes and thus updated accordingly. Similarly, other functions like handleDietaryChange are also triggered when the user checks or unchecks any of the checkboxes; same is done with handleCuisineChange and handleIngredientsChange. handleFormSubmit is used to capture the form submission event and trigger the fetchRecipes function to fetch recipes based on user input. handleResetSearch helps users to have a blank slate when they want to search again.</p>
      </div>

      <div className="requirements-section">
        <h3>A React Component</h3>
        <p>The RecipeItem component helps to display the recipe item with a consistent layout and styling across all the recipe cards. RecipeFinder displays the layout for the majority of the page! And other components like About, ContactUs, and CodeRequirements (you are here!) are additional pages that make the site more interactive.</p>
      </div>

      <div className="requirements-section">
        <h3>React Module</h3>
        <p>I've used import React, which allows me to use React functionalities like creating the components mentioned above, managing state, and using hooks. BrowserRouter as Router, Routes, Route, Link were imported from the react-router-dom package to implement routes and links between routes.</p>
      </div>

      <div className="requirements-section">
        <h3>At Least One React Hook</h3>
        <p>I've used useState to add state to components, useEffect to fetch data and updates components when dependencies change, and useCallback to memorize functions in components.</p>
      </div>

      <div className="requirements-section">
        <h3>API</h3>
        <p>The API I used is the Meal Database API (themealdb.com) and it provides a large collection of recipes. I had the code fetch recipe data based on various criteria like search terms, dietary restrictions, cuisine categories, and must include ingredients.</p>
      </div>

      <div className="requirements-section">
        <h3>React Routes</h3>
        <p>As mentioned previously, I've used React Router to manage navigation and render different components. This includes importing react router components, routes, router, and navigating between routes using link.</p>
      </div>

    </div>
  );
};

// Questions component
const Questions = () => {
  return (
    <div className="questions">
      <h2 className="title">Additional Questions</h2>
  
    <div className="questions">
      <h3>What was the most satisfying part of this project</h3>
        <p>The most satisfying part was when I figured out to fetch different parts of the API link (filter vs search) to accommodate for the search input and the recipe filters.</p>
      </div>

      <div className="questions-section">
        <h3>If I had two more weeks, I would ...</h3>
        <p>In my original plan, I wanted to have users add their own recipes if they could not find it on the site. This would require a Notion table or something simliar that I'd need to link so that when users entered new information there would be a place to store it. Even though I wanted to do this, I later saw this as something additional and not a priority over other parts of the code I needed to create. If I had 2 more weeks or any longer, this is something I would look into implementing.</p>
      </div>
      
      <div className="questions">
      <h3>What was the most useful thing we learned in this class?</h3>
        <p>I really enjoyed learning about React Router because it makes navigating through pages so much easier. I love that you are still able to have pages without having the page need to refresh.</p>
      </div>

    </div>
  );
};

// Contact Us component
const ContactUs = () => {
  return (
    <div className="contact-us">
      <h2 className="title">Contact Us</h2>
      <p className="contact-us">You can reach us via email at emmali@hsph.harvard.edu</p>
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link">About</Link>
            </li>
            <li className="nav-item">
              <Link to="/code-requirements" className="nav-link">Code Requirements</Link>
            </li>
            <li className="nav-item">
              <Link to="/questions" className="nav-link">Questions</Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className="nav-link">Contact Us</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" exact element={<RecipeFinder />} />
          <Route path="/about" element={<About />} />
          <Route path="/code-requirements" element={<CodeRequirements />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;