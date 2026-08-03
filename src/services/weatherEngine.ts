export type WeatherCondition = 'Sunny' | 'Rainy' | 'Night' | 'Thunderstorm';

export interface WeatherBonus {
  condition: WeatherCondition;
  boostedTypes: string[];
  multiplier: number;
  description: string;
  bgColor: string;
  iconEmoji: string;
}

export const WEATHER_CONFIGS: Record<WeatherCondition, WeatherBonus> = {
  Sunny: {
    condition: 'Sunny',
    boostedTypes: ['Grass', 'Fire'],
    multiplier: 1.5,
    description: '☀️ Clear Skies! Grass & Fire Terpiez encounter rate boosted by +150%',
    bgColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    iconEmoji: '☀️',
  },
  Rainy: {
    condition: 'Rainy',
    boostedTypes: ['Water', 'Electric'],
    multiplier: 3.0,
    description: '🌧️ Downpour Active! Water Terpiez encounter rate boosted by +300%',
    bgColor: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    iconEmoji: '🌧️',
  },
  Night: {
    condition: 'Night',
    boostedTypes: ['Dark', 'Psychic'],
    multiplier: 3.0,
    description: '🌙 Lunar Surge! Dark & Psychic Terpiez encounter rate boosted by +300%',
    bgColor: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
    iconEmoji: '🌙',
  },
  Thunderstorm: {
    condition: 'Thunderstorm',
    boostedTypes: ['Electric', 'Cyber'],
    multiplier: 3.0,
    description: '⚡ Storm Surge! Electric & Cyber Terpiez stats & spawn rates overloaded (+300%)',
    bgColor: 'linear-gradient(135deg, #9333ea 0%, #581c87 100%)',
    iconEmoji: '⚡',
  },
};

/**
 * Calculates modified Attack & Defense stats based on current weather condition
 */
export function calculateWeatherStatBoost(stat: number, terpiezType: string, weather: WeatherCondition): number {
  const config = WEATHER_CONFIGS[weather];
  if (config.boostedTypes.includes(terpiezType)) {
    return Math.round(stat * config.multiplier);
  }
  return stat;
}
