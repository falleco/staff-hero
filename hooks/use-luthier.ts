import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import type { Instrument, UserCurrency } from '@/types/music';
import { InstrumentRarity, InstrumentType } from '@/types/music';

const INSTRUMENTS_KEY = '@staff_hero_instruments';
const USER_INVENTORY_KEY = '@staff_hero_inventory';

// Default instruments available for purchase
const DEFAULT_INSTRUMENTS: Instrument[] = [
  {
    id: 'starter-violin',
    name: 'Student Violin',
    type: InstrumentType.VIOLIN,
    rarity: InstrumentRarity.COMMON,
    level: 1,
    tuning: 100, // Starts perfectly tuned
    bonuses: {
      scoreMultiplier: 1.0,
      accuracyBonus: 0,
      streakBonus: 0,
    },
    price: 0, // Free starter instrument
    upgradePrice: 15,
    tunePrice: 2,
    icon: '🎻',
    description:
      'A basic violin perfect for beginners. Reliable and easy to play.',
    isOwned: true,
    isEquipped: true,
  },
  {
    id: 'acoustic-guitar',
    name: 'Acoustic Guitar',
    type: InstrumentType.GUITAR,
    rarity: InstrumentRarity.COMMON,
    level: 1,
    tuning: 85,
    bonuses: {
      scoreMultiplier: 1.1,
      accuracyBonus: 5,
      streakBonus: 0,
    },
    price: 25,
    upgradePrice: 20,
    tunePrice: 3,
    icon: '🎸',
    description:
      'A versatile acoustic guitar with warm tones and good projection.',
    isOwned: false,
    isEquipped: false,
  },
  {
    id: 'grand-piano',
    name: 'Grand Piano',
    type: InstrumentType.PIANO,
    rarity: InstrumentRarity.RARE,
    level: 1,
    tuning: 90,
    bonuses: {
      scoreMultiplier: 1.2,
      accuracyBonus: 10,
      streakBonus: 2,
    },
    price: 50,
    upgradePrice: 35,
    tunePrice: 5,
    icon: '🎹',
    description:
      'A majestic grand piano with rich harmonics and perfect resonance.',
    isOwned: false,
    isEquipped: false,
  },
  {
    id: 'silver-flute',
    name: 'Silver Flute',
    type: InstrumentType.FLUTE,
    rarity: InstrumentRarity.EPIC,
    level: 1,
    tuning: 95,
    bonuses: {
      scoreMultiplier: 1.3,
      accuracyBonus: 15,
      streakBonus: 3,
    },
    price: 75,
    upgradePrice: 50,
    tunePrice: 8,
    icon: '🪈',
    description:
      'An elegant silver flute with crystal-clear tone and exceptional responsiveness.',
    isOwned: false,
    isEquipped: false,
  },
];

export interface UseLuthierReturn {
  /** Available instruments in the shop */
  instruments: Instrument[];
  /** Currently equipped instrument */
  equippedInstrument: Instrument | null;
  /** User's owned instruments */
  ownedInstruments: Instrument[];
  /** Purchase an instrument */
  buyInstrument: (
    instrumentId: string,
    currency: UserCurrency,
    updateCurrency: (currency: UserCurrency) => Promise<void>,
  ) => Promise<boolean>;
  /** Upgrade an owned instrument */
  upgradeInstrument: (
    instrumentId: string,
    currency: UserCurrency,
    updateCurrency: (currency: UserCurrency) => Promise<void>,
  ) => Promise<boolean>;
  /** Tune an owned instrument */
  tuneInstrument: (
    instrumentId: string,
    currency: UserCurrency,
    updateCurrency: (currency: UserCurrency) => Promise<void>,
  ) => Promise<boolean>;
  /** Equip an owned instrument */
  equipInstrument: (instrumentId: string) => Promise<void>;
  /** Reset instruments to default (for testing) */
  resetInstruments: () => Promise<void>;
}

/**
 * Custom hook for managing luthier services and instruments
 *
 * Handles instrument purchasing, upgrading, tuning, and equipment management.
 * Integrates with the golden note shards currency system.
 *
 * @returns Object containing instruments and luthier service functions
 *
 * @example
 * ```tsx
 * const {
 *   instruments,
 *   equippedInstrument,
 *   buyInstrument,
 *   upgradeInstrument,
 *   tuneInstrument
 * } = useLuthier();
 *
 * // Buy an instrument
 * const success = await buyInstrument('acoustic-guitar', currency, updateCurrency);
 *
 * // Upgrade current instrument
 * await upgradeInstrument('starter-violin', currency, updateCurrency);
 *
 * // Tune instrument
 * await tuneInstrument('starter-violin', currency, updateCurrency);
 * ```
 */
export function useLuthier(): UseLuthierReturn {
  const [instruments, setInstruments] =
    useState<Instrument[]>(DEFAULT_INSTRUMENTS);

  // Load data on mount
  useEffect(() => {
    loadInstruments();
  }, []);

  /**
   * Loads instruments from AsyncStorage
   */
  const loadInstruments = async () => {
    try {
      const stored = await AsyncStorage.getItem(INSTRUMENTS_KEY);
      if (stored) {
        const parsedInstruments = JSON.parse(stored);
        setInstruments(parsedInstruments);
      }
    } catch (error) {
      console.error('Error loading instruments:', error);
    }
  };

  /**
   * Saves instruments to AsyncStorage
   */
  const saveInstruments = async (instrumentsToSave: Instrument[]) => {
    try {
      await AsyncStorage.setItem(
        INSTRUMENTS_KEY,
        JSON.stringify(instrumentsToSave),
      );
      setInstruments(instrumentsToSave);
    } catch (error) {
      console.error('Error saving instruments:', error);
    }
  };

  const equippedInstrument =
    instruments.find((instrument) => instrument.isEquipped) || null;
  const ownedInstruments = instruments.filter(
    (instrument) => instrument.isOwned,
  );

  /**
   * Purchases an instrument if user has enough currency
   * @param instrumentId - ID of the instrument to purchase
   * @param currency - Current user currency
   * @param updateCurrency - Function to update user currency
   * @returns True if purchase was successful
   */
  const buyInstrument = async (
    instrumentId: string,
    currency: UserCurrency,
    updateCurrency: (currency: UserCurrency) => Promise<void>,
  ): Promise<boolean> => {
    const instrument = instruments.find((i) => i.id === instrumentId);
    if (!instrument || instrument.isOwned) {
      return false;
    }

    if (currency.goldenNoteShards < instrument.price) {
      return false; // Not enough currency
    }

    // Deduct currency
    const newCurrency = {
      ...currency,
      goldenNoteShards: currency.goldenNoteShards - instrument.price,
    };
    await updateCurrency(newCurrency);

    // Mark instrument as owned
    const updatedInstruments = instruments.map((i) =>
      i.id === instrumentId ? { ...i, isOwned: true } : i,
    );
    await saveInstruments(updatedInstruments);

    return true;
  };

  /**
   * Upgrades an owned instrument
   * @param instrumentId - ID of the instrument to upgrade
   * @param currency - Current user currency
   * @param updateCurrency - Function to update user currency
   * @returns True if upgrade was successful
   */
  const upgradeInstrument = async (
    instrumentId: string,
    currency: UserCurrency,
    updateCurrency: (currency: UserCurrency) => Promise<void>,
  ): Promise<boolean> => {
    const instrument = instruments.find((i) => i.id === instrumentId);
    if (!instrument || !instrument.isOwned || instrument.level >= 10) {
      return false; // Not owned or max level
    }

    if (currency.goldenNoteShards < instrument.upgradePrice) {
      return false; // Not enough currency
    }

    // Deduct currency
    const newCurrency = {
      ...currency,
      goldenNoteShards: currency.goldenNoteShards - instrument.upgradePrice,
    };
    await updateCurrency(newCurrency);

    // Upgrade instrument
    const updatedInstruments = instruments.map((i) =>
      i.id === instrumentId
        ? {
            ...i,
            level: i.level + 1,
            bonuses: {
              scoreMultiplier: i.bonuses.scoreMultiplier + 0.1,
              accuracyBonus: i.bonuses.accuracyBonus + 2,
              streakBonus: i.bonuses.streakBonus + 1,
            },
            upgradePrice: Math.floor(i.upgradePrice * 1.5), // Increase upgrade cost
          }
        : i,
    );
    await saveInstruments(updatedInstruments);

    return true;
  };

  /**
   * Tunes an owned instrument to improve its condition
   * @param instrumentId - ID of the instrument to tune
   * @param currency - Current user currency
   * @param updateCurrency - Function to update user currency
   * @returns True if tuning was successful
   */
  const tuneInstrument = async (
    instrumentId: string,
    currency: UserCurrency,
    updateCurrency: (currency: UserCurrency) => Promise<void>,
  ): Promise<boolean> => {
    const instrument = instruments.find((i) => i.id === instrumentId);
    if (!instrument || !instrument.isOwned || instrument.tuning >= 100) {
      return false; // Not owned or already perfectly tuned
    }

    if (currency.goldenNoteShards < instrument.tunePrice) {
      return false; // Not enough currency
    }

    // Deduct currency
    const newCurrency = {
      ...currency,
      goldenNoteShards: currency.goldenNoteShards - instrument.tunePrice,
    };
    await updateCurrency(newCurrency);

    // Tune instrument
    const updatedInstruments = instruments.map((i) =>
      i.id === instrumentId
        ? { ...i, tuning: Math.min(100, i.tuning + 15) } // Improve tuning by 15 points
        : i,
    );
    await saveInstruments(updatedInstruments);

    return true;
  };

  /**
   * Equips an owned instrument
   * @param instrumentId - ID of the instrument to equip
   */
  const equipInstrument = async (instrumentId: string) => {
    const instrument = instruments.find((i) => i.id === instrumentId);
    if (!instrument || !instrument.isOwned) {
      return;
    }

    // Unequip all instruments and equip the selected one
    const updatedInstruments = instruments.map((i) => ({
      ...i,
      isEquipped: i.id === instrumentId,
    }));
    await saveInstruments(updatedInstruments);
  };

  /**
   * Resets instruments to default state (for testing)
   */
  const resetInstruments = async () => {
    await saveInstruments(DEFAULT_INSTRUMENTS);
  };

  return {
    instruments,
    equippedInstrument,
    ownedInstruments,
    buyInstrument,
    upgradeInstrument,
    tuneInstrument,
    equipInstrument,
    resetInstruments,
  };
}
