// Yummy - Abdulrahman Zaki
"use strict";
const mainSection = document.getElementById("mainSection");

// ===== Handle Loading =====
$(document).ready(() => {
  getMealsData("byName", "").then(() => {
    $(".loading-screen").fadeOut(300);
    $("body").removeClass("overflow-hidden");
  });
});

// ===== Handle Close/Open Side NavBar =====
function closeSideNav() {
  let linksBarWidth = $(".sideNav .linksBar").outerWidth();
  //   console.log(linksBarWidth);
  $(".sideNav").animate(
    {
      left: -linksBarWidth,
    },
    500
  );
  $(".sideNav").removeClass("is-open");
  $(".menuBar button.hamburger").removeClass("is-active");
  $(".linksBar li").animate(
    {
      bottom: `-100%`,
    },
    500
  );
}
closeSideNav();

function openSideNav() {
  $(".sideNav").animate(
    {
      left: 0,
    },
    500
  );
  $(".sideNav").addClass("is-open");
  $(".menuBar button.hamburger").addClass("is-active");
  let delay = 0;
  $(".linksBar li").each(function () {
    $(this).animate({ bottom: 0 }, 500 + delay);
    delay += 100;
  });
}

$(".menuBar button.hamburger").click(() => {
  $(".sideNav").hasClass("is-open") ? closeSideNav() : openSideNav();
});

// ===== Handle Search =====
function showSearchInputs() {
  closeSideNav();
  mainSection.innerHTML = "";
  $(".searchInputs").removeClass("d-none");
}

// Define the debounced function using jQuery's $.debounce
const debouncedSearchMeal = $.debounce(700, function (searchType, value) {
  getMealsData(searchType, value);
});
// Attach the event listener to the input
$("#searchByName").on("input", function () {
  debouncedSearchMeal("byName", this.value);
});
$("#searchByLetter").on("input", function () {
  debouncedSearchMeal("byLetter", this.value);
});

// ===== Handle Get Search/Category/Area/Ingredient/Details Meals Data =====
async function getMealsData(type, dataToFetch) {
  try {
    mainSection.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    let url;
    if (type === "byName") {
      url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${dataToFetch}`;
    } else if (type === "byLetter") {
      url = `https://www.themealdb.com/api/json/v1/1/search.php?f=${dataToFetch}`;
    } else if (type === "category") {
      url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${dataToFetch}`;
    } else if (type === "area") {
      url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${dataToFetch}`;
    } else if (type === "ingredient") {
      url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${dataToFetch}`;
    } else if (type === "details") {
      $(".searchInputs").addClass("d-none");
      url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${dataToFetch}`;
    } else {
      console.error("Invalid type specified");
    }
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not OK");
    }
    let mealsData = await response.json();
    if (type === "details") {
      displayMealDetails(mealsData.meals[0]);
    } else {
      mealsData.meals
        ? displayMeals(mealsData.meals.slice(0, 20))
        : displayMeals([]);
    }
    console.log(mealsData);
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  } finally {
    $(".inner-loading-screen").fadeOut(300);
  }
}

function displayMeals(data) {
  if (data) {
    let dataContainer = "";
    for (let i = 0; i < data.length; i++) {
      dataContainer += `
      <div class="col-md-6 col-lg-4 col-xl-3">
      <div class="item position-relative overflow-hidden rounded-2"
      onclick="getMealsData('details', '${data[i].idMeal}')">
          <img
            src=${data[i].strMealThumb}
            class="w-100"
            loading="lazy"
          />
          <div class="meal-layer position-absolute d-flex align-items-center justify-content-center p-2 text-black">
            <h3>${data[i].strMeal}</h3>
          </div>
      </div>
      </div>
    `;
    }
    mainSection.innerHTML = dataContainer;
  }
}

// ===== Handle Get Categories/Area/Ingredients Data =====
async function getData(type) {
  try {
    closeSideNav();
    mainSection.innerHTML = "";
    $(".searchInputs").addClass("d-none");
    $(".inner-loading-screen").fadeIn(300);
    let url;
    if (type === "categories") {
      url = "https://www.themealdb.com/api/json/v1/1/categories.php";
    } else if (type === "area") {
      url = "https://www.themealdb.com/api/json/v1/1/list.php?a=list";
    } else if (type === "ingredients") {
      url = "https://www.themealdb.com/api/json/v1/1/list.php?i=list";
    } else {
      console.error("Invalid type specified");
    }
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not OK");
    }
    let data = await response.json();
    if (type === "categories") {
      displayCategories(data.categories);
    } else if (type === "area") {
      displayArea(data.meals);
    } else if (type === "ingredients") {
      displayIngredients(data.meals.slice(0, 20));
    }
    console.log(data);
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  } finally {
    $(".inner-loading-screen").fadeOut(300);
  }
}

// ===== Handle Categories =====
function displayCategories(data) {
  if (data) {
    let dataContainer = "";
    for (let i = 0; i < data.length; i++) {
      dataContainer += `
      <div class="col-md-6 col-lg-4 col-xl-3">
      <div onclick="getMealsData('category', '${data[i].strCategory}')"
       class="item position-relative overflow-hidden rounded-2">
          <img class="w-100" src="${data[i].strCategoryThumb}" loading="lazy">
          <div class="meal-layer position-absolute text-center p-2 text-black">
              <h3>${data[i].strCategory}</h3>
              <p>${data[i].strCategoryDescription
                .split(" ")
                .slice(0, 20)
                .join(" ")}</p>
          </div>
      </div>
</div>
        `;
    }
    mainSection.innerHTML = dataContainer;
  }
}

// ===== Handle Area =====
function displayArea(data) {
  if (data) {
    let dataContainer = "";
    for (let i = 0; i < data.length; i++) {
      dataContainer += `
      <div class="col-md-6 col-lg-4 col-xl-3">
      <div onclick="getMealsData('area' ,'${data[i].strArea}')" class="rounded-2 text-center" style="cursor: pointer;">
              <i class="fa-solid fa-house-laptop fa-4x"></i>
              <h3>${data[i].strArea}</h3>
      </div>
</div>
            `;
    }
    mainSection.innerHTML = dataContainer;
  }
}

// ===== Handle Ingredients =====
function displayIngredients(data) {
  if (data) {
    let dataContainer = "";
    for (let i = 0; i < data.length; i++) {
      dataContainer += `
          <div class="col-md-6 col-lg-4 col-xl-3">
          <div onclick="getMealsData('ingredient' ,'${
            data[i].strIngredient
          }')" class="rounded-2 text-center" style="cursor: pointer;">
                  <i class="fa-solid fa-drumstick-bite fa-4x"></i>
                  <h3>${data[i].strIngredient}</h3>
                  <p>${data[i].strDescription
                    .split(" ")
                    .slice(0, 20)
                    .join(" ")}</p>
          </div>
  </div>
                `;
    }
    mainSection.innerHTML = dataContainer;
  }
}

// ===== Handle Meal Details =====
function displayMealDetails(meal) {
  if (meal) {
    $(".searchInputs").addClass("d-none");
    // console.log(meal);
    let ingredients = ``;
    for (let i = 1; i <= 20; i++) {
      if (meal[`strIngredient${i}`]) {
        ingredients += `<li class="alert alert-info m-2 p-1">${
          meal[`strMeasure${i}`]
        } ${meal[`strIngredient${i}`]}</li>`;
      }
    }

    let tags;
    let tagsStr = "";
    if (meal.strTags === null) {
      tagsStr = `<li class="alert alert-primary m-2 p-1">No Tags Available!</li>`;
    } else {
      tags = meal.strTags.split(",");
      for (let i = 0; i < tags.length; i++) {
        tagsStr += `
                <li class="alert alert-primary m-2 p-1">${tags[i]}</li>`;
      }
    }

    let dataContainer = `
          <div class="col-lg-6 col-xl-4">
                      <img class="w-100 rounded-3" src="${meal.strMealThumb}"
                      loading="lazy">
                      <h3>${meal.strMeal}</h3>
                  </div>
                  <div class="col-lg-6 col-xl-8">
                      <h3 class="fw-bold">Instructions</h3>
                      <p>${meal.strInstructions}</p>
                      <hr>
                      <h4><span class="fw-bold">Area : </span>${meal.strArea}</h4>
                      <h4><span class="fw-bold">Category : </span>${meal.strCategory}</h4>
                      <hr>
                      <h4>Ingredients :</h4>
                      <ul class="list-unstyled d-flex g-3 flex-wrap">
                          ${ingredients}
                      </ul>
      
                      <h4>Tags :</h4>
                      <ul class="list-unstyled d-flex g-3 flex-wrap">
                          ${tagsStr}
                      </ul>
                      <hr>
                      <a target="_blank" href="${meal.strSource}" class="btn btn-success me-2">Source</a>
                      <a target="_blank" href="${meal.strYoutube}" class="btn btn-danger">Youtube</a>
                  </div>`;

    mainSection.innerHTML = dataContainer;
  }
}

// ===== Handle Contact Us =====
let inputTouched = {
  nameInput: false,
  emailInput: false,
  phoneInput: false,
  ageInput: false,
  passwordInput: false,
  repasswordInput: false,
};
let submitBtn;
const inputIds = Object.keys(inputTouched);
function showContactInputs() {
  closeSideNav();
  let dataContainer = `
  <div
  class="contact d-flex align-content-center justify-content-center vh-100 flex-wrap"
>
  <div class="col-md-6">
    <input
    oninput="validateInputs()"
      type="text"
      class="form-control"
      placeholder="Enter Your Name"
      id="nameInput"
    />
    <div class="alert alert-danger w-100 mt-2 d-none" id="nameInputAlert">
      Special characters and numbers not allowed
    </div>
  </div>
  <div class="col-md-6">
    <input
    oninput="validateInputs()"
      type="email"
      class="form-control"
      placeholder="Enter Your Email"
      id="emailInput"
    />
    <div class="alert alert-danger w-100 mt-2 d-none" id="emailInputAlert">
      Email not valid *exemple@yyy.zzz
    </div>
  </div>
  <div class="col-md-6">
    <input
    oninput="validateInputs()"
      type="tel"
      class="form-control"
      placeholder="Enter Your Phone"
      id="phoneInput"
    />
    <div class="alert alert-danger w-100 mt-2 d-none" id="phoneInputAlert">
      Enter valid Phone Number
    </div>
  </div>
  <div class="col-md-6">
    <input
    oninput="validateInputs()"
      type="number"
      class="form-control"
      placeholder="Enter Your Age"
      id="ageInput"
    />
    <div class="alert alert-danger w-100 mt-2 d-none" id="ageInputAlert">
      Enter valid age
    </div>
  </div>
  <div class="col-md-6">
    <input
    oninput="validateInputs()"
      type="password"
      class="form-control"
      placeholder="Enter Your Password"
      id="passwordInput"
    />
    <div class="alert alert-danger w-100 mt-2 d-none" id="passwordInputAlert">
      Enter valid password *Minimum eight characters, at least one letter and
      one number:*
    </div>
  </div>
  <div class="col-md-6">
    <input
    oninput="validateInputs()"
      type="password"
      class="form-control"
      placeholder="Repassword"
      id="repasswordInput"
    />
    <div class="alert alert-danger w-100 mt-2 d-none" id="repasswordInputAlert">
      Enter valid repassword
    </div>
  </div>
  <div class="col-12 text-center">
    <button class="btn btn-outline-danger" id="submitBtn" disabled>
      Submit
    </button>
  </div>
</div>  
  `;
  mainSection.innerHTML = dataContainer;
  //
  submitBtn = document.getElementById("submitBtn");
  inputIds.forEach((id) => {
    const inputElement = document.getElementById(id);
    inputElement.addEventListener("focus", () => {
      inputTouched[id] = true;
    });
  });
}

function validateInputs() {
  const validationFunctions = {
    nameInput: nameInputValidation,
    emailInput: emailInputValidation,
    phoneInput: phoneInputValidation,
    ageInput: ageInputValidation,
    passwordInput: passwordInputValidation,
    repasswordInput: repasswordInputValidation,
  };
  inputIds.forEach((key) => {
    if (inputTouched[key]) {
      const validationFunction = validationFunctions[key]; // get the validation function by its name
      const alertSelector = `#${key}Alert`; // get the alert selector by its name
      validationFunction()
        ? $(alertSelector).removeClass("d-block").addClass("d-none")
        : $(alertSelector).removeClass("d-none").addClass("d-block");
    }
  });
  const allInputsValid = Object.values(validationFunctions).every(
    (validationFunction) => validationFunction()
  );
  if (allInputsValid) {
    submitBtn.removeAttribute("disabled");
  } else {
    submitBtn.setAttribute("disabled", true);
  }
}

function nameInputValidation() {
  return /^([a-zA-Z]+(\s+)?)+$/.test(
    document.getElementById("nameInput").value
  );
}
function emailInputValidation() {
  return /^[^@]+@[^@]+\.[^@]+$/.test(
    document.getElementById("emailInput").value
  );
}
function phoneInputValidation() {
  return /^(010|011|012|015)\d{8}$/.test(
    document.getElementById("phoneInput").value
  );
}
function ageInputValidation() {
  return /^[1-9][0-9]?$/.test(document.getElementById("ageInput").value);
}
function passwordInputValidation() {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(
    document.getElementById("passwordInput").value
  );
}
function repasswordInputValidation() {
  return (
    document.getElementById("repasswordInput").value ==
    document.getElementById("passwordInput").value
  );
}
