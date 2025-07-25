import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BatterySaverConfig {
  enabled: boolean;
  reducedAnimations: boolean;
  lowerImageQuality: boolean;
  reduceRefreshRate: boolean;
  disableBackgroundRefresh: boolean;
  limitNetworkRequests: boolean;
}

export interface BatterySaverSettings {
  autoEnable: boolean;
  batteryThreshold: number; // Percentage below which to auto-enable
  aggressiveMode: boolean;
}

const DEFAULT_CONFIG: BatterySaverConfig = {
  enabled: false,
  reducedAnimations: true,
  lowerImageQuality: true,
  reduceRefreshRate: true,
  disableBackgroundRefresh: true,
  limitNetworkRequests: true,
};

const DEFAULT_SETTINGS: BatterySaverSettings = {
  autoEnable: true,
  batteryThreshold: 20,
  aggressiveMode: false,
};

const STORAGE_KEY = 'battery_saver_config';
const SETTINGS_KEY = 'battery_saver_settings';

export const useBatterySaver = () => {
  const [config, setConfig] = useState<BatterySaverConfig>(DEFAULT_CONFIG);
  const [settings, setSettings] = useState<BatterySaverSettings>(DEFAULT_SETTINGS);
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isLowPowerMode, setIsLowPowerMode] = useState<boolean>(false);

  // Load saved configuration
  useEffect(() => {
    loadConfiguration();
  }, []);

  // Monitor battery status (simulated for now)
  useEffect(() => {
    // In a real implementation, you would use a library like react-native-device-info
    // to get actual battery information
    const monitorBattery = () => {
      // Simulated battery monitoring
      const mockBatteryLevel = Math.random() * 100;
      setBatteryLevel(mockBatteryLevel);
      
      // Auto-enable battery saver if below threshold
      if (settings.autoEnable && mockBatteryLevel < settings.batteryThreshold && !config.enabled) {
        enableBatterySaver();
      }
    };

    const interval = setInterval(monitorBattery, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [settings, config.enabled]);

  const loadConfiguration = async () => {
    try {
      const [savedConfig, savedSettings] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(SETTINGS_KEY)
      ]);

      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.warn('Failed to load battery saver configuration:', error);
    }
  };

  const saveConfiguration = async (newConfig: BatterySaverConfig) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.warn('Failed to save battery saver configuration:', error);
    }
  };

  const saveSettings = async (newSettings: BatterySaverSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.warn('Failed to save battery saver settings:', error);
    }
  };

  const enableBatterySaver = useCallback(async () => {
    const newConfig = { ...config, enabled: true };
    await saveConfiguration(newConfig);
    console.log('🔋 Battery saver enabled');
  }, [config]);

  const disableBatterySaver = useCallback(async () => {
    const newConfig = { ...config, enabled: false };
    await saveConfiguration(newConfig);
    console.log('🔋 Battery saver disabled');
  }, [config]);

  const toggleBatterySaver = useCallback(async () => {
    if (config.enabled) {
      await disableBatterySaver();
    } else {
      await enableBatterySaver();
    }
  }, [config.enabled, enableBatterySaver, disableBatterySaver]);

  const updateConfig = useCallback(async (updates: Partial<BatterySaverConfig>) => {
    const newConfig = { ...config, ...updates };
    await saveConfiguration(newConfig);
  }, [config]);

  const updateSettings = useCallback(async (updates: Partial<BatterySaverSettings>) => {
    const newSettings = { ...settings, ...updates };
    await saveSettings(newSettings);
  }, [settings]);

  // Get optimized values based on battery saver state
  const getOptimizedValues = useCallback(() => {
    if (!config.enabled) {
      return {
        imageQuality: 'high' as const,
        animationDuration: 300,
        refreshInterval: 30000, // 30 seconds
        maxConcurrentRequests: 5,
        useHaptics: true,
        useBlur: true,
      };
    }

    const aggressive = settings.aggressiveMode;

    return {
      imageQuality: (config.lowerImageQuality ? (aggressive ? 'low' : 'medium') : 'high') as const,
      animationDuration: config.reducedAnimations ? (aggressive ? 0 : 150) : 300,
      refreshInterval: config.reduceRefreshRate ? (aggressive ? 120000 : 60000) : 30000, // 1-2 minutes vs 30 seconds
      maxConcurrentRequests: config.limitNetworkRequests ? (aggressive ? 1 : 2) : 5,
      useHaptics: !config.reducedAnimations,
      useBlur: !config.reducedAnimations,
    };
  }, [config, settings]);

  const shouldSkipBackgroundRefresh = useCallback(() => {
    return config.enabled && config.disableBackgroundRefresh;
  }, [config]);

  const shouldLimitNetworkRequests = useCallback(() => {
    return config.enabled && config.limitNetworkRequests;
  }, [config]);

  const getBatteryStatus = useCallback(() => {
    return {
      level: batteryLevel,
      isCharging,
      isLowPowerMode,
      isLow: batteryLevel < settings.batteryThreshold,
    };
  }, [batteryLevel, isCharging, isLowPowerMode, settings.batteryThreshold]);

  return {
    // Configuration
    config,
    settings,
    updateConfig,
    updateSettings,

    // Actions
    enableBatterySaver,
    disableBatterySaver,
    toggleBatterySaver,

    // Optimized values
    getOptimizedValues,
    shouldSkipBackgroundRefresh,
    shouldLimitNetworkRequests,

    // Battery status
    getBatteryStatus,
    batteryLevel,
    isCharging,
    isLowPowerMode,

    // Computed values
    isEnabled: config.enabled,
    isLowBattery: batteryLevel < settings.batteryThreshold,
  };
};

export default useBatterySaver;