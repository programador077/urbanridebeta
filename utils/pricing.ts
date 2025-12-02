import { VehicleType } from '../types';

export const BASE_RATES = {
    moto: { base: 400, perKm: 150, perMin: 20 },
    auto: { base: 650, perKm: 250, perMin: 35 },
    flash: { base: 500, perKm: 200, perMin: 30 }, // Economy Auto
};

export const getSurgeMultiplier = (): number => {
    // Simulate demand based on time of day or random fluctuation
    const hour = new Date().getHours();
    const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20); // 7-9am, 5-8pm

    if (isPeakHour) {
        // Random multiplier between 1.2 and 1.6 during peak
        return 1.2 + Math.random() * 0.4;
    }

    // Normal hours: 1.0 to 1.1
    return 1.0 + Math.random() * 0.1;
};

export const calculateFare = (
    distanceKm: number,
    durationMin: number,
    type: VehicleType,
    demandMultiplier?: number
): number => {
    const rates = BASE_RATES[type];
    const multiplier = demandMultiplier || getSurgeMultiplier();
    const rawFare = rates.base + (rates.perKm * distanceKm) + (rates.perMin * durationMin);
    return Math.round(rawFare * multiplier);
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};
