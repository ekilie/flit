import apiClient from "./apiClient";

export interface FareEstimate {
  estimatedFare: number;
  distance: number;
  duration: number;
  surgeMultiplier: number;
  breakdown: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surgeFare: number;
    bookingFee: number;
    total: number;
  };
  vehicleType: string;
  currency: string;
}

export interface FareEstimateRequest {
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  vehicleType: string;
  timeOfDay?: string;
}

export interface PricingConfig {
  id: number;
  vehicleType: string;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  bookingFee: number;
  cancellationFee: number;
  isActive: boolean;
}

export const pricingApi = {
  /**
   * Get fare estimate for a ride
   */
  async getFareEstimate(request: FareEstimateRequest): Promise<FareEstimate> {
    try {
      const response = await apiClient.post<FareEstimate>(
        "/pricing/estimate",
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error getting fare estimate:", error);
      throw error;
    }
  },

  /**
   * Get all pricing configurations
   */
  async getPricingConfigs(): Promise<PricingConfig[]> {
    try {
      const response = await apiClient.get<PricingConfig[]>("/pricing/configs");
      return response.data;
    } catch (error) {
      console.error("Error getting pricing configs:", error);
      throw error;
    }
  },

  /**
   * Get pricing configuration for a specific vehicle type
   */
  async getPricingConfig(vehicleType: string): Promise<PricingConfig> {
    try {
      const response = await apiClient.get<PricingConfig>(
        `/pricing/configs/${vehicleType}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting pricing config:", error);
      throw error;
    }
  },
};

