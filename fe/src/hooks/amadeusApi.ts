import axios from "axios";
import dayjs from "dayjs";

const AMADEUS_BASE = "https://test.api.amadeus.com";
const CACHE_DURATION = 100 * 24 * 60 * 60 * 1000; 

interface CacheItem {
  data: any;
  timestamp: number;
}

export class AmadeusService {
  private static cache: Map<string, CacheItem> = new Map();
  private tokenCache: { accessToken: string; expiresAt: number } | null = null;

  private async getAccessToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.accessToken;
    }

    const clientId = "KVkz5dG77tdocvTNgcUnW2RMwkoHW2sZ";
    const clientSecret = "zwADRYOmrdcCGC3k";

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);

    const response = await axios.post(`${AMADEUS_BASE}/v1/security/oauth2/token`, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in * 1000; 

    this.tokenCache = {
      accessToken: token,
      expiresAt: Date.now() + expiresIn - 60_000,
    };

    return token;
  }
  public async getAirports(keyword: string): Promise<any[]> {
    const cacheKey = `airports_${keyword.toLowerCase()}`;
    const cached = AmadeusService.cache.get(cacheKey);
  
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  
    const token = await this.getAccessToken();
  
    const response = await axios.get(`${AMADEUS_BASE}/v1/reference-data/locations`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        subType: "AIRPORT",
        keyword,
        "page[limit]": 10,
      },
    });
  
    const airports = response.data.data.map((item: any) => ({
      code: item.iataCode,
      name: item.name,
      city: item.address?.cityName,
      country: item.address?.countryName,
    }));
  
    AmadeusService.cache.set(cacheKey, { data: airports, timestamp: Date.now() });
  
    return airports;
  }
  


  public async getFlightOffers(origin: string, destination: string, departureDate: string, airlineCodes?: string[]) {
    const token = await this.getAccessToken();

    const response = await axios.get(`${AMADEUS_BASE}/v2/shopping/flight-offers`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        adults: 1,
        ...(airlineCodes?.length ? { includedAirlineCodes: airlineCodes.join(',') } : {}),
      },
    });

    return response.data.data.map((item: any) => {
      const segment = item.itineraries[0].segments[0];
      const traveler = item.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
      const price = item.price;

      const departureTime = dayjs(segment.departure.at).format("HH:mm");
      const arrivalTime = dayjs(segment.arrival.at).format("HH:mm");
      const date = dayjs(segment.departure.at).format("DD/MM/YYYY");

      return {
        id: item.id,
        airline: segment.carrierCode,
        flight_code: `${segment.carrierCode}${segment.number}`,

        route: `${segment.departure.iataCode} → ${segment.arrival.iataCode}`,
        full_route: `Chuyến bay từ ${segment.departure.iataCode} đến ${segment.arrival.iataCode}`,

        from_airport: segment.departure.iataCode,
        to_airport: segment.arrival.iataCode,
        itineraries: item.itineraries,
        time: `${departureTime} - ${arrivalTime}`,
        date: date,
        duration: item.itineraries[0].duration
          .replace("PT", "")
          .replace("H", "h ")
          .replace("M", "m"),

        cabin_class: traveler?.cabin || "ECONOMY",
        checked_bag: traveler?.includedCheckedBags?.weight
          ? `${traveler.includedCheckedBags.weight}${traveler.includedCheckedBags.weightUnit}`
          : "0KG",
        cabin_bag: traveler?.includedCabinBags?.weight
          ? `${traveler.includedCabinBags.weight}${traveler.includedCabinBags.weightUnit}`
          : "7KG",

        aircraft: segment.aircraft?.code || "N/A",
        total_price: `${price.total} ${price.currency}`,
        base_price: `${price.base} ${price.currency}`,
      };
    });
  }
}


export const rawSeatmapData = {
    type: "seatmap",
    flightOfferId: "1",
    segmentId: "1",
    designatorCode: "VN1234",
    cabin: {
      class: "ECONOMY",
      layout: "3-3",
      rows: Array.from({ length: 40 }, (_, i) => {
        const rowNumber = i + 1;
        const isExitRow = [12, 30].includes(rowNumber);
        const isFrontRow = rowNumber <= 5;
        const isBackRow = rowNumber >= 36;
  
        return {
          number: String(rowNumber),
          seats: ["A", "B", "C", "D", "E", "F"].map((seatLetter) => {
            const basePrice = isFrontRow
              ? 5
              : isExitRow
              ? 4
              : isBackRow
              ? 2
              : 3;
            const randomUnavailable = Math.random() < 0.15; // 15% ghế hết chỗ
            const characteristics = [];
  
            if (seatLetter === "A" || seatLetter === "F") characteristics.push("WINDOW");
            if (seatLetter === "B" || seatLetter === "E") characteristics.push("MIDDLE");
            if (seatLetter === "C" || seatLetter === "D") characteristics.push("AISLE");
            if (isExitRow) characteristics.push("EXIT");
            if (isFrontRow) characteristics.push("FRONT");
            if (isBackRow) characteristics.push("REAR");
  
            return {
              number: `${rowNumber}${seatLetter}`,
              characteristics,
              available: !randomUnavailable,
              price: basePrice + (seatLetter === "A" || seatLetter === "F" ? 5 : 0)
            };
          })
        };
      })
    }
  };
  