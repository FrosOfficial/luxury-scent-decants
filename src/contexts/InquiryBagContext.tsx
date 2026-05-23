import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

export interface BagItem {
  product: {
    id: string;
    name: string;
    brand: string;
    image_url: string;
    scent_profile?: string;
  };
  volumePricing: {
    id: string;
    size: string;
    price: number;
  };
  quantity: number;
}

interface CustomerDetails {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  province: string;
  facebook_profile: string;
  additional_notes?: string;
}

interface InquiryResponse {
  message: string;
  reference_code: string;
  messenger_message: string;
  messenger_url: string;
  inquiry: any;
}

interface InquiryBagContextType {
  items: BagItem[];
  addToBag: (product: BagItem['product'], volumePricing: BagItem['volumePricing'], quantity?: number) => void;
  removeFromBag: (productId: string, volumePricingId: string) => void;
  updateQuantity: (productId: string, volumePricingId: string, quantity: number) => void;
  clearBag: () => void;
  totalItemsCount: number;
  totalEstimatedPrice: number;
  submitInquiry: (details: CustomerDetails) => Promise<InquiryResponse>;
}

const InquiryBagContext = createContext<InquiryBagContextType | undefined>(undefined);

export const InquiryBagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<BagItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedBag = localStorage.getItem('lsd_inquiry_bag');
    if (savedBag) {
      try {
        setItems(JSON.parse(savedBag));
      } catch (error) {
        console.error('Failed to parse saved inquiry bag:', error);
      }
    }
  }, []);

  // Save to localStorage when items change
  const saveItems = (newItems: BagItem[]) => {
    setItems(newItems);
    localStorage.setItem('lsd_inquiry_bag', JSON.stringify(newItems));
  };

  const addToBag = (product: BagItem['product'], volumePricing: BagItem['volumePricing'], quantity = 1) => {
    const newItems = [...items];
    const existingIndex = newItems.findIndex(
      (item) => item.product.id === product.id && item.volumePricing.id === volumePricing.id
    );

    if (existingIndex > -1) {
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems.push({ product, volumePricing, quantity });
    }

    saveItems(newItems);
  };

  const removeFromBag = (productId: string, volumePricingId: string) => {
    const newItems = items.filter(
      (item) => !(item.product.id === productId && item.volumePricing.id === volumePricingId)
    );
    saveItems(newItems);
  };

  const updateQuantity = (productId: string, volumePricingId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromBag(productId, volumePricingId);
      return;
    }

    const newItems = items.map((item) => {
      if (item.product.id === productId && item.volumePricing.id === volumePricingId) {
        return { ...item, quantity };
      }
      return item;
    });

    saveItems(newItems);
  };

  const clearBag = () => {
    saveItems([]);
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalEstimatedPrice = items.reduce((sum, item) => sum + (item.volumePricing.price * item.quantity), 0);

  const submitInquiry = async (details: CustomerDetails): Promise<InquiryResponse> => {
    // Format the items matching Laravel validator rules
    const formattedItems = items.map((item) => ({
      product_id: item.product.id,
      volume_pricing_id: item.volumePricing.id,
      quantity: item.quantity,
    }));

    const payload = {
      ...details,
      items: formattedItems,
    };

    const response = await api.post('/inquiries', payload);
    
    // Clear the bag upon successful submission
    clearBag();

    return response.data;
  };

  const value: InquiryBagContextType = {
    items,
    addToBag,
    removeFromBag,
    updateQuantity,
    clearBag,
    totalItemsCount,
    totalEstimatedPrice,
    submitInquiry,
  };

  return <InquiryBagContext.Provider value={value}>{children}</InquiryBagContext.Provider>;
};

export const useInquiryBag = () => {
  const context = useContext(InquiryBagContext);
  if (context === undefined) {
    throw new Error('useInquiryBag must be used within an InquiryBagProvider');
  }
  return context;
};
