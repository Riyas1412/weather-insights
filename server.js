require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000; // Use environment PORT if available

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

  try {
    let weatherData;

    // Handle location-based search
    if (lat && lon) {
      const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`);
      weatherData = response.data;
    } else if (city) {
      // Handle manual city search
      const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`);
      weatherData = response.data;
    } else {
      // Default response for missing query params
      return res.status(400).send('City or location coordinates must be provided');
    }

    // Serve the weather.html with dynamic weather data
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
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
