import api from "./config";

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
      const response = await api(true).post<FareEstimate>(
        "/pricing/estimate",
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error getting fare estimate:", error);
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to get fare estimate";
      throw new Error(message);
    }
  },

  /**
   * Get all pricing configurations
   */
  async getPricingConfigs(): Promise<PricingConfig[]> {
    try {
      const response = await api(false).get<PricingConfig[]>("/pricing/configs");
      return response.data;
    } catch (error) {
      console.error("Error getting pricing configs:", error);
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to get pricing configurations";
      throw new Error(message);
    }
  },

  /**
   * Get pricing configuration for a specific vehicle type
   */
  async getPricingConfig(vehicleType: string): Promise<PricingConfig> {
    try {
      const response = await api(false).get<PricingConfig>(
        `/pricing/configs/${vehicleType}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting pricing config:", error);
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to get pricing configuration";
      throw new Error(message);
    }
  },
};

