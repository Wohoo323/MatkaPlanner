const ACCESS_KEY = '08XilvZQXk1QhKIBbOu-MvZ_-YDqJSaJi3dOfGaS8o8';

export async function getCityImage(city: string) {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?page=1&query=${city} city travel&client_id=${ACCESS_KEY}`
    );

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }

    return null;
  } catch (error) {
    console.log('IMAGE ERROR:', error);

    return null;
  }
}