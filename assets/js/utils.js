// ============================================
// SURYA DIET - UTILITY FUNCTIONS
// ============================================

// ============================================
// TDEE & MACRO CALCULATIONS
// ============================================

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @param {string} activityLevel - Activity multiplier
 * @returns {object} BMR and TDEE
 */
function calculateTDEE(weight, height, age, gender, activityLevel) {
    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    const activityMultipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very-active': 1.9
    };

    const tdee = bmr * activityMultipliers[activityLevel];

    return {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee)
    };
}

/**
 * Calculate macros based on goal
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {number} weight - Weight in kg
 * @param {string} goal - 'cutting', 'bulking', or 'maintenance'
 * @returns {object} Calories and macros
 */
function calculateMacros(tdee, weight, goal) {
    let calories, protein, carbs, fats;

    switch (goal) {
        case 'cutting':
            calories = Math.round(tdee * 0.8); // 20% deficit
            protein = Math.round(weight * 2.5); // 2.5g/kg
            fats = Math.round(weight * 0.9); // 0.9g/kg
            carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4);
            break;

        case 'bulking':
            calories = Math.round(tdee * 1.15); // 15% surplus
            protein = Math.round(weight * 2); // 2g/kg
            fats = Math.round(weight * 1); // 1g/kg
            carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4);
            break;

        case 'maintenance':
        default:
            calories = tdee;
            protein = Math.round(weight * 2); // 2g/kg
            fats = Math.round(weight * 1); // 1g/kg
            carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4);
    }

    // Fiber calculation (14g per 1000kcal)
    const fiber = Math.round((calories / 1000) * 14);

    return {
        calories,
        protein,
        carbs,
        fats,
        fiber
    };
}

// ============================================
// BODY COMPOSITION CALCULATIONS
// ============================================

/**
 * Calculate body fat percentage using Navy Method
 * @param {string} gender - 'male' or 'female'
 * @param {number} height - Height in cm
 * @param {number} neck - Neck circumference in cm
 * @param {number} waist - Waist circumference in cm
 * @param {number} hip - Hip circumference in cm (for females)
 * @returns {number} Body fat percentage
 */
function calculateBodyFat(gender, height, neck, waist, hip = 0) {
    let bodyFat;

    if (gender === 'male') {
        bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
        bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    }

    return Math.round(bodyFat * 10) / 10;
}

/**
 * Calculate lean body mass
 * @param {number} weight - Total weight in kg
 * @param {number} bodyFatPercentage - Body fat percentage
 * @returns {object} Lean mass and fat mass
 */
function calculateLeanMass(weight, bodyFatPercentage) {
    const fatMass = weight * (bodyFatPercentage / 100);
    const leanMass = weight - fatMass;

    return {
        leanMass: Math.round(leanMass * 10) / 10,
        fatMass: Math.round(fatMass * 10) / 10
    };
}

// ============================================
// STRENGTH CALCULATIONS
// ============================================

/**
 * Calculate one-rep max using Epley formula
 * @param {number} weight - Weight lifted
 * @param {number} reps - Number of reps
 * @returns {number} Estimated 1RM
 */
function calculateOneRepMax(weight, reps) {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
}

/**
 * Calculate training weights based on 1RM percentage
 * @param {number} oneRM - One rep max
 * @param {number} percentage - Percentage of 1RM (e.g., 80)
 * @returns {number} Training weight
 */
function calculateTrainingWeight(oneRM, percentage) {
    return Math.round(oneRM * (percentage / 100));
}

// ============================================
// MEAL PLANNING
// ============================================

/**
 * Distribute macros across meals
 * @param {object} dailyMacros - Total daily macros
 * @param {number} numMeals - Number of meals per day
 * @returns {array} Macros per meal
 */
function distributeMacros(dailyMacros, numMeals) {
    const perMeal = {
        calories: Math.round(dailyMacros.calories / numMeals),
        protein: Math.round(dailyMacros.protein / numMeals),
        carbs: Math.round(dailyMacros.carbs / numMeals),
        fats: Math.round(dailyMacros.fats / numMeals)
    };

    return Array(numMeals).fill(perMeal);
}

// ============================================
// PROGRESS TRACKING
// ============================================

/**
 * Calculate weight loss/gain rate
 * @param {number} startWeight - Starting weight in kg
 * @param {number} currentWeight - Current weight in kg
 * @param {number} weeks - Number of weeks
 * @returns {object} Total change and rate per week
 */
function calculateWeightChange(startWeight, currentWeight, weeks) {
    const totalChange = currentWeight - startWeight;
    const weeklyRate = totalChange / weeks;
    const percentageChange = (totalChange / startWeight) * 100;

    return {
        totalChange: Math.round(totalChange * 10) / 10,
        weeklyRate: Math.round(weeklyRate * 100) / 100,
        percentageChange: Math.round(percentageChange * 10) / 10
    };
}

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        return false;
    }
}

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @returns {any} Stored data or null
 */
function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        return null;
    }
}

/**
 * Clear specific key from localStorage
 * @param {string} key - Storage key
 */
function clearStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error('Error clearing localStorage:', e);
        return false;
    }
}

// ============================================
// FORM VALIDATION
// ============================================

/**
 * Validate number input
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} Is valid
 */
function validateNumber(value, min, max) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
}

/**
 * Show error message
 * @param {string} elementId - Element ID to show error
 * @param {string} message - Error message
 */
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.style.color = '#FF4500';
        element.style.marginTop = '8px';
        element.style.fontWeight = '600';
    }
}

/**
 * Clear error message
 * @param {string} elementId - Element ID to clear error
 */
function clearError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

// ============================================
// CHART HELPERS (for progress tracking)
// ============================================

/**
 * Create simple line chart data
 * @param {array} labels - X-axis labels
 * @param {array} data - Y-axis data points
 * @returns {object} Chart configuration
 */
function createChartData(labels, data) {
    return {
        labels: labels,
        datasets: [{
            data: data,
            borderColor: '#FFD700',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            borderWidth: 3,
            tension: 0.4
        }]
    };
}

// ============================================
// DATE HELPERS
// ============================================

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {string} Formatted date
 */
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Get days between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Number of days
 */
function daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
}

// ============================================
// MOBILE MENU TOGGLE
// ============================================

function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
        });
    }
}

// Initialize on DOM load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
}

// ============================================
// EXPORT FOR USE IN OTHER FILES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateTDEE,
        calculateMacros,
        calculateBodyFat,
        calculateLeanMass,
        calculateOneRepMax,
        calculateTrainingWeight,
        distributeMacros,
        calculateWeightChange,
        saveToStorage,
        loadFromStorage,
        clearStorage,
        validateNumber,
        showError,
        clearError,
        createChartData,
        formatDate,
        daysBetween
    };
}
