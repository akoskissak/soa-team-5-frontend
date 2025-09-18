export interface OrderItem {
  id: number;
  tour_id: string;
  tour_name: string;
  price: number;
  cart_id: number;
}

export interface OrderItemCreate {
  tour_id: string;
  tour_name: string;
  price: number;
}

export interface ShoppingCart {
  id: number;
  tourist_id: string;
  total_price: number;
  items: OrderItem[];
}

export interface TourPurchaseToken {
  id: number;
  tour_id: string;
  tourist_id: string;
  token: string;
  tour_name: string;
  price: number;
}