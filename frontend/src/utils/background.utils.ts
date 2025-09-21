/**
 * Background utilities for managing dynamic background images across pages
 * Auto-detects available images and provides random selection
 */

import { getBackgroundUrl } from './helpers';

/**
 * Global state for available background images
 */
let availableBackgroundImages: number[] = [];
let isInitialized = false;

/**
 * Initialize available background images by testing sequential loading
 */
export const initializeBackgroundImages = async (): Promise<number[]> => {
  if (isInitialized) {
    return availableBackgroundImages;
  }

  const images: number[] = [];
  let testIndex = 1;
  const maxTest = 50; // Test up to 50 images

  // Test loading images sequentially
  while (testIndex <= maxTest) {
    try {
      const currentIndex = testIndex; // Capture current value to avoid closure issues
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = getBackgroundUrl(currentIndex);
        img.onload = () => resolve();
        img.onerror = () => reject();

        // Timeout after 2 seconds
        setTimeout(() => reject(), 2000);
      });

      images.push(testIndex);
      testIndex++;
    } catch (error) {
      // Stop when we can't load an image
      break;
    }
  }

  availableBackgroundImages = images;
  isInitialized = true;

  console.log(`Found ${images.length} background images:`, images);
  return images;
};

/**
 * Get random background index from available images
 */
export const getRandomBackgroundIndex = (): number => {
  if (availableBackgroundImages.length === 0) {
    return 1; // Fallback
  }

  const randomIndex = Math.floor(Math.random() * availableBackgroundImages.length);
  return availableBackgroundImages[randomIndex];
};

/**
 * Get all available background images
 */
export const getAvailableBackgroundImages = (): number[] => {
  return availableBackgroundImages;
};

/**
 * Check if background images are initialized
 */
export const isBackgroundImagesInitialized = (): boolean => {
  return isInitialized;
};

/**
 * Get background interval for a specific page (can be customized per page)
 */
export const getBackgroundInterval = (page: 'cosplay' | 'festival' | 'home' | 'default' = 'default'): number => {
  switch (page) {
    case 'cosplay':
      return 45000; // 45 seconds for cosplay page
    case 'festival':
      return 5000;  // 5 seconds for festival page
    case 'home':
      return 30000; // 30 seconds for home page
    default:
      return 5000; // 5 seconds default
  }
};

/**
 * Create background rotation interval with random selection
 */
export const createBackgroundInterval = (
  page: 'cosplay' | 'festival' | 'home' | 'default',
  setCurrentBg: (value: number) => void
): (() => void) => {
  const interval = getBackgroundInterval(page);

  const intervalId = setInterval(() => {
    const randomBg = getRandomBackgroundIndex();
    setCurrentBg(randomBg);
  }, interval);

  return () => clearInterval(intervalId);
};