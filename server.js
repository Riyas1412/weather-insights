require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/welcome.html');
});

app.get('/city', (req, res) => {
  res.sendFile(__dirname + '/public/city.html');
});

app.get('/weather', async (req, res) => {
  const { city, lat, lon } = req.query;

  if (!city && (!lat || !lon)) {
    return res.redirect('/city'); // Redirect back to the city selection page if no city or coordinates
  }

  try {
    let weatherData;

    if (lat && lon) {
      const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`);
      weatherData = response.data;
    } else if (city) {
      const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`);
      weatherData = response.data;
    }

    // Instead of returning JSON, redirect to weather.html and pass data to the front-end
    res.redirect(`/weather.html?city=${weatherData.name}&lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}`);
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.status(500).send('Failed to fetch weather data');
  }
});

app.get('/api/weather/forecast', async (req, res) => {
  const city = req.query.city || 'London';
  try {
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
