import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Weather {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
}

@Component({
  selector: 'app-weather-dashboard',
  imports: [CommonModule],
  templateUrl: './weather-dashboard.html',
  styleUrl: './weather-dashboard.css',
})
export class WeatherDashboard {
  cities: Weather[] = [
    {
      city: 'Madrid',
      temperature: 22,
      humidity: 65,
      windSpeed: 12,
      condition: 'Soleado',
      icon: '☀️'
    },
    {
      city: 'Barcelona',
      temperature: 25,
      humidity: 70,
      windSpeed: 8,
      condition: 'Parcialmente nublado',
      icon: '⛅'
    },
    {
      city: 'Valencia',
      temperature: 24,
      humidity: 68,
      windSpeed: 10,
      condition: 'Soleado',
      icon: '☀️'
    },
    {
      city: 'Sevilla',
      temperature: 28,
      humidity: 55,
      windSpeed: 5,
      condition: 'Despejado',
      icon: '🌤️'
    },
    {
      city: 'Bilbao',
      temperature: 18,
      humidity: 80,
      windSpeed: 15,
      condition: 'Lluvioso',
      icon: '🌧️'
    },
    {
      city: 'Málaga',
      temperature: 26,
      humidity: 60,
      windSpeed: 7,
      condition: 'Soleado',
      icon: '☀️'
    }
  ];

  refreshWeather() {
    this.cities = this.cities.map(city => ({
      ...city,
      temperature: Math.floor(Math.random() * 20) + 15,
      humidity: Math.floor(Math.random() * 40) + 50,
      windSpeed: Math.floor(Math.random() * 20) + 5
    }));
  }
}
