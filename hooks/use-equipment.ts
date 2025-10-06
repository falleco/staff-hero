import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import type { Equipment, UserCurrency, UserEquipment } from '@/types/music';
import { EquipmentCategory, EquipmentRarity } from '@/types/music';

const EQUIPMENT_KEY = '@staff_hero_equipment';
const USER_EQUIPMENT_KEY = '@staff_hero_user_equipment';

// Default equipment available
const DEFAULT_EQUIPMENT: Equipment[] = [
  // Mantles
  {
    id: 'novice-cloak',
    name: 'Novice Cloak',
    category: EquipmentCategory.MANTLE,
    rarity: EquipmentRarity.COMMON,
    level: 1,
    bonuses: {
      scoreBonus: 50,
      accuracyBonus: 5,
      streakBonus: 1,
      specialEffect: "Beginner's Luck: +10% chance for bonus points",
    },
    price: 20,
    upgradePrice: 15,
    icon: '🧙‍♂️',
    description:
      'A simple cloak worn by music students. Provides basic protection and confidence.',
    isOwned: true, // Start with basic equipment
    isEquipped: true,
  },
  {
    id: 'maestro-robe',
    name: "Maestro's Robe",
    category: EquipmentCategory.MANTLE,
    rarity: EquipmentRarity.EPIC,
    level: 1,
    bonuses: {
      scoreBonus: 200,
      accuracyBonus: 15,
      streakBonus: 5,
      specialEffect: "Conductor's Aura: Double streak bonuses",
    },
    price: 80,
    upgradePrice: 40,
    icon: '👘',
    description:
      'An elegant robe worn by master conductors. Radiates musical authority and precision.',
    isOwned: false,
    isEquipped: false,
  },

  // Adornments
  {
    id: 'silver-pendant',
    name: 'Silver Music Note Pendant',
    category: EquipmentCategory.ADORNMENTS,
    rarity: EquipmentRarity.RARE,
    level: 1,
    bonuses: {
      scoreBonus: 100,
      accuracyBonus: 8,
      streakBonus: 2,
      specialEffect: 'Perfect Pitch: +5% accuracy on high notes',
    },
    price: 35,
    upgradePrice: 25,
    icon: '🎵',
    description:
      'A beautiful silver pendant shaped like a musical note. Enhances musical intuition.',
    isOwned: false,
    isEquipped: false,
  },
  {
    id: 'golden-metronome',
    name: 'Golden Metronome Charm',
    category: EquipmentCategory.ADORNMENTS,
    rarity: EquipmentRarity.LEGENDARY,
    level: 1,
    bonuses: {
      scoreBonus: 300,
      accuracyBonus: 20,
      streakBonus: 8,
      specialEffect: 'Perfect Timing: Time-based bonuses never expire',
    },
    price: 120,
    upgradePrice: 60,
    icon: '⏱️',
    description:
      'A legendary golden metronome that keeps perfect time. Masters of rhythm covet this charm.',
    isOwned: false,
    isEquipped: false,
  },

  // Instruments (Equipment version - different from luthier instruments)
  {
    id: 'enchanted-bow',
    name: 'Enchanted Violin Bow',
    category: EquipmentCategory.INSTRUMENTS,
    rarity: EquipmentRarity.RARE,
    level: 1,
    bonuses: {
      scoreBonus: 150,
      accuracyBonus: 12,
      streakBonus: 3,
      specialEffect: 'Smooth Strings: Violin notes give extra points',
    },
    price: 45,
    upgradePrice: 30,
    icon: '🏹',
    description:
      'A mystical bow that makes violin strings sing with otherworldly beauty.',
    isOwned: false,
    isEquipped: false,
  },
];

const DEFAULT_USER_EQUIPMENT: UserEquipment = {
  mantle: null, // Will be set to novice-cloak on first load
  adornments: [],
  instruments: null,
};

export interface UseEquipmentReturn {
  /** All available equipment */
  equipment: Equipment[];
  /** Currently equipped items by category */
  userEquipment: UserEquipment;
  /** Equipment filtered by category */
  getEquipmentByCategory: (category: EquipmentCategory) => Equipment[];
  /** Purchase equipment */
  buyEquipment: (
    equipmentId: string,
    currency: UserCurrency,
    updateCurrency: (currency: UserCurrency) => Promise<void>,
  ) => Promise<boolean>;
  /** Upgrade equipment */
  upgradeEquipment: (
    equipmentId: string,
    currency: UserCurrency,
    updateCurrency: (currency: UserCurrency) => Promise<void>,
  ) => Promise<boolean>;
  /** Equip an item */
  equipItem: (equipmentId: string) => Promise<void>;
  /** Unequip an item */
  unequipItem: (equipmentId: string) => Promise<void>;
  /** Get total bonuses from all equipped items */
  getTotalBonuses: () => {
    scoreBonus: number;
    accuracyBonus: number;
    streakBonus: number;
  };
  /** Reset equipment to default */
  resetEquipment: () => Promise<void>;
}

/**
 * Custom hook for managing equipment system
 *
 * Handles equipment purchasing, upgrading, equipping, and bonus calculations.
 * Manages three categories: mantles, adornments, and instruments.
 *
 * @returns Object containing equipment data and management functions
 *
 * @example
 * ```tsx
 * const {
 *   equipment,
 *   userEquipment,
 *   getEquipmentByCategory,
 *   buyEquipment,
 *   equipItem
 * } = useEquipment();
 *
 * // Get mantles
 * const mantles = getEquipmentByCategory(EquipmentCategory.MANTLE);
 *
 * // Buy equipment
 * await buyEquipment('silver-pendant', currency, updateCurrency);
 *
 * // Equip item
 * await equipItem('novice-cloak');
 * ```
 */
export function useEquipment(): UseEquipmentReturn {
  const [equipment, setEquipment] = useState<Equipment[]>(DEFAULT_EQUIPMENT);
  const [userEquipment, setUserEquipment] = useState<UserEquipment>(
    DEFAULT_USER_EQUIPMENT,
  );

  // Load data on mount
  useEffect(() => {
    loadEquipment();
    loadUserEquipment();
  }, []);

  /**
   * Loads equipment from AsyncStorage
   */
  const loadEquipment = async () => {
    try {
      const stored = await AsyncStorage.getItem(EQUIPMENT_KEY);
      if (stored) {
        const parsedEquipment = JSON.parse(stored);
        setEquipment(parsedEquipment);
      } else {
        // First time setup - equip the novice cloak
        const initialEquipment = DEFAULT_EQUIPMENT.map((item) =>
          item.id === 'novice-cloak'
            ? { ...item, isOwned: true, isEquipped: true }
            : item,
        );
        await saveEquipment(initialEquipment);
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
    }
  };

  /**
   * Loads user equipment from AsyncStorage
   */
  const loadUserEquipment = async () => {
    try {
      const stored = await AsyncStorage.getItem(USER_EQUIPMENT_KEY);
      if (stored) {
        const parsedUserEquipment = JSON.parse(stored);
        setUserEquipment(parsedUserEquipment);
      } else {
        // First time setup
        const noviceCloak = DEFAULT_EQUIPMENT.find(
          (item) => item.id === 'novice-cloak',
        );
        if (noviceCloak) {
          const initialUserEquipment = {
            mantle: noviceCloak,
            adornments: [],
            instruments: null,
          };
          await saveUserEquipment(initialUserEquipment);
        }
      }
    } catch (error) {
      console.error('Error loading user equipment:', error);
    }
  };

  /**
   * Saves equipment to AsyncStorage
   */
  const saveEquipment = async (equipmentToSave: Equipment[]) => {
    try {
      await AsyncStorage.setItem(
        EQUIPMENT_KEY,
        JSON.stringify(equipmentToSave),
      );
      setEquipment(equipmentToSave);
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  };

  /**
   * Saves user equipment to AsyncStorage
   */
  const saveUserEquipment = async (userEquipmentToSave: UserEquipment) => {
    try {
      await AsyncStorage.setItem(
        USER_EQUIPMENT_KEY,
        JSON.stringify(userEquipmentToSave),
      );
      setUserEquipment(userEquipmentToSave);
    } catch (error) {
      console.error('Error saving user equipment:', error);
    }
  };

  /**
   * Gets equipment filtered by category
   */
  const getEquipmentByCategory = (category: EquipmentCategory): Equipment[] => {
    return equipment.filter((item) => item.category === category);
  };

  /**
   * Purchases equipment if user has enough currency
   */
  const buyEquipment = async (
    equipmentId: string,
    currency: UserCurrency,
    updateCurrency: (currency: UserCurrency) => Promise<void>,
  ): Promise<boolean> => {
    const item = equipment.find((e) => e.id === equipmentId);
    if (!item || item.isOwned) {
      return false;
    }

    if (currency.goldenNoteShards < item.price) {
      return false;
    }

    // Deduct currency
    const newCurrency = {
      ...currency,
      goldenNoteShards: currency.goldenNoteShards - item.price,
    };
    await updateCurrency(newCurrency);

    // Mark equipment as owned
    const updatedEquipment = equipment.map((e) =>
      e.id === equipmentId ? { ...e, isOwned: true } : e,
    );
    await saveEquipment(updatedEquipment);

    return true;
  };

  /**
   * Upgrades owned equipment
   */
  const upgradeEquipment = async (
    equipmentId: string,
    currency: UserCurrency,
    updateCurrency: (currency: UserCurrency) => Promise<void>,
  ): Promise<boolean> => {
    const item = equipment.find((e) => e.id === equipmentId);
    if (!item || !item.isOwned || item.level >= 10) {
      return false;
    }

    if (currency.goldenNoteShards < item.upgradePrice) {
      return false;
    }

    // Deduct currency
    const newCurrency = {
      ...currency,
      goldenNoteShards: currency.goldenNoteShards - item.upgradePrice,
    };
    await updateCurrency(newCurrency);

    // Upgrade equipment
    const updatedEquipment = equipment.map((e) =>
      e.id === equipmentId
        ? {
            ...e,
            level: e.level + 1,
            bonuses: {
              scoreBonus: e.bonuses.scoreBonus + 25,
              accuracyBonus: e.bonuses.accuracyBonus + 2,
              streakBonus: e.bonuses.streakBonus + 1,
              specialEffect: e.bonuses.specialEffect,
            },
            upgradePrice: Math.floor(e.upgradePrice * 1.5),
          }
        : e,
    );
    await saveEquipment(updatedEquipment);

    return true;
  };

  /**
   * Equips an item (handles category-specific logic)
   */
  const equipItem = async (equipmentId: string) => {
    const item = equipment.find((e) => e.id === equipmentId);
    if (!item || !item.isOwned) {
      return;
    }

    const newUserEquipment = { ...userEquipment };
    let updatedEquipment = [...equipment];

    // Handle category-specific equipping
    switch (item.category) {
      case EquipmentCategory.MANTLE:
        // Unequip current mantle
        if (userEquipment.mantle) {
          updatedEquipment = updatedEquipment.map((e) =>
            e.id === userEquipment.mantle?.id ? { ...e, isEquipped: false } : e,
          );
        }
        newUserEquipment.mantle = item;
        break;

      case EquipmentCategory.INSTRUMENTS:
        // Unequip current instrument
        if (userEquipment.instruments) {
          updatedEquipment = updatedEquipment.map((e) =>
            e.id === userEquipment.instruments?.id
              ? { ...e, isEquipped: false }
              : e,
          );
        }
        newUserEquipment.instruments = item;
        break;

      case EquipmentCategory.ADORNMENTS:
        // Add to adornments (can have multiple)
        if (!userEquipment.adornments.find((a) => a.id === item.id)) {
          newUserEquipment.adornments = [...userEquipment.adornments, item];
        }
        break;
    }

    // Mark item as equipped
    updatedEquipment = updatedEquipment.map((e) =>
      e.id === equipmentId ? { ...e, isEquipped: true } : e,
    );

    await saveEquipment(updatedEquipment);
    await saveUserEquipment(newUserEquipment);
  };

  /**
   * Unequips an item
   */
  const unequipItem = async (equipmentId: string) => {
    const item = equipment.find((e) => e.id === equipmentId);
    if (!item || !item.isEquipped) {
      return;
    }

    const newUserEquipment = { ...userEquipment };

    // Handle category-specific unequipping
    switch (item.category) {
      case EquipmentCategory.MANTLE:
        newUserEquipment.mantle = null;
        break;
      case EquipmentCategory.INSTRUMENTS:
        newUserEquipment.instruments = null;
        break;
      case EquipmentCategory.ADORNMENTS:
        newUserEquipment.adornments = userEquipment.adornments.filter(
          (a) => a.id !== equipmentId,
        );
        break;
    }

    // Mark item as unequipped
    const updatedEquipment = equipment.map((e) =>
      e.id === equipmentId ? { ...e, isEquipped: false } : e,
    );

    await saveEquipment(updatedEquipment);
    await saveUserEquipment(newUserEquipment);
  };

  /**
   * Calculates total bonuses from all equipped items
   */
  const getTotalBonuses = () => {
    const totalBonuses = {
      scoreBonus: 0,
      accuracyBonus: 0,
      streakBonus: 0,
    };

    // Add mantle bonuses
    if (userEquipment.mantle) {
      totalBonuses.scoreBonus += userEquipment.mantle.bonuses.scoreBonus;
      totalBonuses.accuracyBonus += userEquipment.mantle.bonuses.accuracyBonus;
      totalBonuses.streakBonus += userEquipment.mantle.bonuses.streakBonus;
    }

    // Add instrument bonuses
    if (userEquipment.instruments) {
      totalBonuses.scoreBonus += userEquipment.instruments.bonuses.scoreBonus;
      totalBonuses.accuracyBonus +=
        userEquipment.instruments.bonuses.accuracyBonus;
      totalBonuses.streakBonus += userEquipment.instruments.bonuses.streakBonus;
    }

    // Add adornment bonuses
    userEquipment.adornments.forEach((adornment) => {
      totalBonuses.scoreBonus += adornment.bonuses.scoreBonus;
      totalBonuses.accuracyBonus += adornment.bonuses.accuracyBonus;
      totalBonuses.streakBonus += adornment.bonuses.streakBonus;
    });

    return totalBonuses;
  };

  /**
   * Resets equipment to default state
   */
  const resetEquipment = async () => {
    await saveEquipment(DEFAULT_EQUIPMENT);
    await saveUserEquipment(DEFAULT_USER_EQUIPMENT);
  };

  return {
    equipment,
    userEquipment,
    getEquipmentByCategory,
    buyEquipment,
    upgradeEquipment,
    equipItem,
    unequipItem,
    getTotalBonuses,
    resetEquipment,
  };
}
