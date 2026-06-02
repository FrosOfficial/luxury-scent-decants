import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const InquiryBagContext = createContext(undefined);

export const InquiryBagProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const { localUser, loading } = useAuth();

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
  const saveItems = (newItems) => {
    setItems(newItems);
    localStorage.setItem('lsd_inquiry_bag', JSON.stringify(newItems));
  };

  const addToBag = (product, volumePricing, quantity = 1) => {
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

  const removeFromBag = (productId, volumePricingId) => {
    const newItems = items.filter(
      (item) => !(item.product.id === productId && item.volumePricing.id === volumePricingId)
    );
    saveItems(newItems);
  };

  const updateQuantity = (productId, volumePricingId, quantity) => {
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

  const submitInquiry = async (details) => {
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

  const value = {
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
