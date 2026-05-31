export const FOOD_LIBRARY = [
  { name: "0% Greek yogurt (M&S)",    per: 100, calories: 62,  protein: 10,  carbs: 4.9, fat: 0,   unit: "g" },
  { name: "Banana",                   per: 100, calories: 89,  protein: 1.1, carbs: 23,  fat: 0.3, unit: "g" },
  { name: "Egg, boiled",              per: 1,   calories: 70,  protein: 6,   carbs: 0,   fat: 5,   unit: "egg" },
  { name: "Blueberries",              per: 100, calories: 57,  protein: 0.7, carbs: 14,  fat: 0.3, unit: "g" },
  { name: "Strawberries",             per: 100, calories: 32,  protein: 0.7, carbs: 7.7, fat: 0.3, unit: "g" },
  { name: "Honey",                    per: 100, calories: 304, protein: 0.3, carbs: 82,  fat: 0,   unit: "g" },
  { name: "M&S protein pasta, dry",   per: 100, calories: 340, protein: 22,  carbs: 62,  fat: 2.5, unit: "g" },
  { name: "Chicken breast, boiled",   per: 100, calories: 165, protein: 31,  carbs: 0,   fat: 3.6, unit: "g" },
  { name: "Lettuce",                  per: 100, calories: 15,  protein: 1.4, carbs: 2.2, fat: 0.2, unit: "g" },
  { name: "Miso dressing",            per: 100, calories: 347, protein: 3.7, carbs: 19,  fat: 28,  unit: "g" },
  { name: "Tesco Finest tomato sauce",per: 100, calories: 128, protein: 2,   carbs: 10,  fat: 8.8, unit: "g" },
  { name: "Taro drum bread",          per: 79,  calories: 215, protein: 5,   carbs: 33,  fat: 8,   unit: "piece" },
  { name: "Matcha mochi lava bun",    per: 120, calories: 300, protein: 7,   carbs: 46,  fat: 10,  unit: "piece" },
  { name: "Salmon, steamed",          per: 100, calories: 185, protein: 22,  carbs: 0,   fat: 10,  unit: "g" },
  { name: "Fat free cottage cheese",  per: 100, calories: 90,  protein: 15,  carbs: 5.4, fat: 0.4, unit: "g" },
  { name: "Peanut butter",            per: 100, calories: 588, protein: 25,  carbs: 20,  fat: 50,  unit: "g" },
  { name: "Walnuts",                  per: 100, calories: 654, protein: 15,  carbs: 14,  fat: 65,  unit: "g" },
  { name: "Almonds",                  per: 100, calories: 579, protein: 21,  carbs: 22,  fat: 50,  unit: "g" },
  { name: "Semi-skimmed milk",        per: 100, calories: 50,  protein: 3.4, carbs: 4.8, fat: 1.8, unit: "ml" },
  { name: "Coconut drink (Plenish)",  per: 100, calories: 32,  protein: 0.2, carbs: 5.3, fat: 1.1, unit: "ml" },
  { name: "King prawns, boiled",      per: 100, calories: 99,  protein: 24,  carbs: 0,   fat: 0.5, unit: "g" },
  { name: "Spinach, raw",             per: 100, calories: 23,  protein: 2.9, carbs: 3.6, fat: 0.4, unit: "g" },
  { name: "Sweet potato, roasted",    per: 100, calories: 90,  protein: 1.6, carbs: 20,  fat: 0.1, unit: "g" },
  { name: "Frozen sweet corn",        per: 100, calories: 86,  protein: 3.2, carbs: 17,  fat: 1.2, unit: "g" },
  { name: "Oats",                     per: 100, calories: 389, protein: 17,  carbs: 66,  fat: 7,   unit: "g" },
  { name: "Chia seeds",               per: 100, calories: 486, protein: 17,  carbs: 42,  fat: 31,  unit: "g" },
  { name: "Matcha granola butter",    per: 100, calories: 500, protein: 8,   carbs: 47,  fat: 30,  unit: "g" },
  { name: "Danish lighter bread",     per: 1,   calories: 55,  protein: 3,   carbs: 10,  fat: 1,   unit: "slice" },
]

export const TARGETS = { calories: 1600, protein: 120, carbs: 165, fat: 52 }

export const calcFromLibrary = (entry, amount) => {
  const qty = parseFloat(amount) || 0
  const ratio = qty / entry.per
  return {
    calories: Math.round(entry.calories * ratio * 10) / 10,
    protein:  Math.round(entry.protein  * ratio * 10) / 10,
    carbs:    Math.round(entry.carbs    * ratio * 10) / 10,
    fat:      Math.round(entry.fat      * ratio * 10) / 10,
  }
}
