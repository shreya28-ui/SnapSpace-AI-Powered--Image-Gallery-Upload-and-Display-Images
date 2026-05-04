import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace with actual Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Simple simulation of persistence for scaffold demo
export const STORAGE_KEY = 'snapspace_images';
export const ALBUMS_KEY = 'snapspace_albums';

const DEFAULT_SINGAPORE_IMAGES = [
  {
    id: "sg-1",
    url: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop&q=80",
    title: "Marina Bay Sands",
    caption: "The iconic Marina Bay Sands hotel lit up at night, showcasing its stunning ship-like architecture.",
    tags: ["Singapore", "Marina Bay", "Architecture", "Nightscape", "City"],
    createdAt: Date.now()
  },
  {
    id: "sg-2",
    url: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800&auto=format&fit=crop&q=80",
    title: "Gardens by the Bay",
    caption: "Futuristic Supertree Grove at Gardens by the Bay, a famous nature park in central Singapore.",
    tags: ["Singapore", "Nature", "Supertrees", "Futuristic", "Park"],
    createdAt: Date.now() - 100000
  },
  {
    id: "sg-3",
    url: "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&auto=format&fit=crop&q=80",
    title: "Merlion Park",
    caption: "The mythical Merlion statue spouting water in front of the Singapore skyline.",
    tags: ["Singapore", "Merlion", "Landmark", "Statue", "Waterfront"],
    createdAt: Date.now() - 200000
  },
  {
    id: "sg-4",
    url: "https://images.unsplash.com/photo-1546436836-07a91091f11c?w=800&auto=format&fit=crop&q=80",
    title: "Jewel Changi Airport",
    caption: "The stunning HSBC Rain Vortex, the world's tallest indoor waterfall located in Jewel Changi.",
    tags: ["Singapore", "Changi", "Waterfall", "Indoor", "Architecture"],
    createdAt: Date.now() - 300000
  }
];

export const getStoredImages = (): any[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // If nothing is in local storage, initialize it with Singapore images
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SINGAPORE_IMAGES));
    return DEFAULT_SINGAPORE_IMAGES;
  }
  const parsed = JSON.parse(stored);
  // Also return them if the user deleted everything to help them see images
  if (parsed.length === 0) {
    return DEFAULT_SINGAPORE_IMAGES;
  }
  return parsed;
};

export const saveImagesToStore = (images: any[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
};

export const getStoredAlbums = (): any[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(ALBUMS_KEY);
  return stored ? JSON.parse(stored) : [{ id: 'all', name: 'All Photos' }];
};

export const saveAlbumsToStore = (albums: any[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums));
};
