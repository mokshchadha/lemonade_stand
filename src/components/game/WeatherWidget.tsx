import { Weather } from '@/lib/game/types';
import { Cloud, CloudLightning, Sun, ThermometerSun } from 'lucide-react';

interface WeatherWidgetProps {
    weather: Weather;
}

export default function WeatherWidget({ weather }: WeatherWidgetProps) {
    return (
        <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200 flex flex-col items-center text-center shadow-sm">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Forecast</h3>

            <div className="mb-4 transform transition-transform hover:scale-110 duration-300">
                {weather.type === 'Sunny' && (
                    <Sun className="w-24 h-24 text-yellow-500 animate-pulse-slow" />
                )}
                {weather.type === 'Cloudy' && !weather.isStormy && (
                    <Cloud className="w-24 h-24 text-gray-400" />
                )}
                {weather.type === 'Cloudy' && weather.isStormy && (
                    <div className="relative">
                        <Cloud className="w-24 h-24 text-gray-600" />
                        <CloudLightning className="w-12 h-12 text-yellow-400 absolute bottom-0 right-0 animate-bounce" />
                    </div>
                )}
                {weather.type === 'HotAndDry' && (
                    <ThermometerSun className="w-24 h-24 text-orange-600" />
                )}
            </div>

            <div className="text-xl font-bold text-gray-800">
                {weather.type === 'HotAndDry' ? 'Hot & Dry' : weather.type}
            </div>

            {weather.isStormy && (
                <div className="text-red-500 font-bold mt-2 animate-pulse">
                    Storm Warning!
                </div>
            )}

            <div className="mt-2 text-sm text-gray-500">
                {weather.temperature}°F
            </div>
        </div>
    );
}
