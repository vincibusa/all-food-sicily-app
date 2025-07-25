import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NetworkQuality = 'excellent' | 'good' | 'poor' | 'offline';
export type ConnectionType = 'wifi' | 'cellular' | 'unknown';

export interface NetworkMetrics {
  downloadSpeed: number; // Mbps
  latency: number; // ms
  jitter: number; // ms
  packetLoss: number; // percentage
  effectiveBandwidth: number; // Kbps
}

export interface NetworkOptimizationConfig {
  enabled: boolean;
  adaptiveQuality: boolean;
  prioritizeText: boolean;
  compressImages: boolean;
  reduceAnimations: boolean;
  limitConcurrentRequests: boolean;
  useDataSaverMode: boolean;
}

const DEFAULT_CONFIG: NetworkOptimizationConfig = {
  enabled: true,
  adaptiveQuality: true,
  prioritizeText: true,
  compressImages: true,
  reduceAnimations: true,
  limitConcurrentRequests: true,
  useDataSaverMode: false,
};

const STORAGE_KEY = 'network_optimization_config';
const METRICS_KEY = 'network_metrics_history';

export const useNetworkOptimization = () => {
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>('good');
  const [connectionType, setConnectionType] = useState<ConnectionType>('unknown');
  const [config, setConfig] = useState<NetworkOptimizationConfig>(DEFAULT_CONFIG);
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    downloadSpeed: 0,
    latency: 0,
    jitter: 0,
    packetLoss: 0,
    effectiveBandwidth: 0,
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const metricsHistory = useRef<NetworkMetrics[]>([]);
  const lastSpeedTest = useRef<number>(0);
  const requestTimes = useRef<Map<string, number>>(new Map());

  // Load saved configuration
  useEffect(() => {
    loadConfiguration();
    loadMetricsHistory();
  }, []);

  // Monitor network quality
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastSpeedTest.current > 60000) { // Test every minute
        performSpeedTest();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const loadConfiguration = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.warn('Failed to load network optimization config:', error);
    }
  };

  const loadMetricsHistory = async () => {
    try {
      const savedMetrics = await AsyncStorage.getItem(METRICS_KEY);
      if (savedMetrics) {
        metricsHistory.current = JSON.parse(savedMetrics);
      }
    } catch (error) {
      console.warn('Failed to load network metrics history:', error);
    }
  };

  const saveConfiguration = async (newConfig: NetworkOptimizationConfig) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.warn('Failed to save network optimization config:', error);
    }
  };

  const saveMetricsHistory = async () => {
    try {
      // Keep only last 100 entries
      const historyToSave = metricsHistory.current.slice(-100);
      await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(historyToSave));
    } catch (error) {
      console.warn('Failed to save network metrics history:', error);
    }
  };

  // Perform simple speed test using small image requests\n  const performSpeedTest = useCallback(async () => {\n    if (lastSpeedTest.current > Date.now() - 30000) return; // Don't test too frequently\n    \n    lastSpeedTest.current = Date.now();\n    \n    try {\n      const testUrl = 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=100';\n      const startTime = Date.now();\n      \n      const response = await fetch(testUrl, {\n        method: 'HEAD', // Only get headers, not body\n        cache: 'no-cache',\n      });\n      \n      const endTime = Date.now();\n      const latency = endTime - startTime;\n      \n      // Estimate download speed based on response time\n      const estimatedSpeed = latency < 100 ? 10 : latency < 300 ? 5 : latency < 1000 ? 1 : 0.5;\n      \n      const newMetrics: NetworkMetrics = {\n        downloadSpeed: estimatedSpeed,\n        latency,\n        jitter: Math.random() * 50, // Simplified\n        packetLoss: response.ok ? 0 : 10,\n        effectiveBandwidth: estimatedSpeed * 1000, // Convert to Kbps\n      };\n      \n      setMetrics(newMetrics);\n      metricsHistory.current.push(newMetrics);\n      \n      // Update network quality based on metrics\n      updateNetworkQuality(newMetrics);\n      \n      // Save metrics periodically\n      if (metricsHistory.current.length % 10 === 0) {\n        saveMetricsHistory();\n      }\n      \n    } catch (error) {\n      console.warn('Speed test failed:', error);\n      setNetworkQuality('poor');\n    }\n  }, []);\n\n  const updateNetworkQuality = (metrics: NetworkMetrics) => {\n    const { latency, downloadSpeed, packetLoss } = metrics;\n    \n    if (latency > 1000 || downloadSpeed < 0.5 || packetLoss > 5) {\n      setNetworkQuality('poor');\n    } else if (latency > 500 || downloadSpeed < 2) {\n      setNetworkQuality('good');\n    } else {\n      setNetworkQuality('excellent');\n    }\n  };\n\n  // Track API request performance\n  const trackRequest = useCallback((url: string, startTime: number, endTime: number, success: boolean) => {\n    const duration = endTime - startTime;\n    requestTimes.current.set(url, duration);\n    \n    // Update metrics based on request performance\n    if (duration > 5000 || !success) {\n      setNetworkQuality('poor');\n      setIsOptimizing(true);\n    }\n  }, []);\n\n  // Get optimized settings based on network quality\n  const getOptimizedSettings = useCallback(() => {\n    if (!config.enabled) {\n      return {\n        imageQuality: 'high' as const,\n        maxConcurrentRequests: 5,\n        timeoutDuration: 10000,\n        retryAttempts: 3,\n        useCompression: false,\n        preloadImages: true,\n        animationDuration: 300,\n      };\n    }\n\n    switch (networkQuality) {\n      case 'poor':\n        return {\n          imageQuality: 'low' as const,\n          maxConcurrentRequests: 1,\n          timeoutDuration: 15000,\n          retryAttempts: 1,\n          useCompression: true,\n          preloadImages: false,\n          animationDuration: config.reduceAnimations ? 100 : 300,\n        };\n      \n      case 'good':\n        return {\n          imageQuality: 'medium' as const,\n          maxConcurrentRequests: 2,\n          timeoutDuration: 12000,\n          retryAttempts: 2,\n          useCompression: config.compressImages,\n          preloadImages: false,\n          animationDuration: config.reduceAnimations ? 200 : 300,\n        };\n      \n      case 'excellent':\n      default:\n        return {\n          imageQuality: 'high' as const,\n          maxConcurrentRequests: 5,\n          timeoutDuration: 10000,\n          retryAttempts: 3,\n          useCompression: false,\n          preloadImages: true,\n          animationDuration: 300,\n        };\n    }\n  }, [networkQuality, config]);\n\n  const shouldUseDataSaver = useCallback(() => {\n    return config.useDataSaverMode || (config.enabled && networkQuality === 'poor');\n  }, [config, networkQuality]);\n\n  const shouldPrioritizeText = useCallback(() => {\n    return config.enabled && config.prioritizeText && networkQuality !== 'excellent';\n  }, [config, networkQuality]);\n\n  const getImageOptimizationParams = useCallback((originalUrl: string) => {\n    if (!config.enabled) return originalUrl;\n    \n    const settings = getOptimizedSettings();\n    \n    // Only optimize Unsplash images\n    if (!originalUrl.includes('unsplash.com')) return originalUrl;\n    \n    const qualityMap = {\n      low: { w: 400, q: 60 },\n      medium: { w: 800, q: 75 },\n      high: { w: 1200, q: 90 },\n    };\n    \n    const params = qualityMap[settings.imageQuality];\n    const separator = originalUrl.includes('?') ? '&' : '?';\n    \n    return `${originalUrl}${separator}w=${params.w}&q=${params.q}&fm=jpg`;\n  }, [config, getOptimizedSettings]);\n\n  const updateConfig = useCallback(async (updates: Partial<NetworkOptimizationConfig>) => {\n    const newConfig = { ...config, ...updates };\n    await saveConfiguration(newConfig);\n  }, [config]);\n\n  const getNetworkInfo = useCallback(() => {\n    return {\n      quality: networkQuality,\n      connectionType,\n      metrics,\n      isOptimizing,\n      isSlowConnection: networkQuality === 'poor',\n      averageLatency: metricsHistory.current.length > 0 \n        ? metricsHistory.current.reduce((sum, m) => sum + m.latency, 0) / metricsHistory.current.length\n        : 0,\n    };\n  }, [networkQuality, connectionType, metrics, isOptimizing]);\n\n  // Force speed test\n  const runSpeedTest = useCallback(async () => {\n    lastSpeedTest.current = 0; // Reset to force new test\n    await performSpeedTest();\n  }, [performSpeedTest]);\n\n  return {\n    // Configuration\n    config,\n    updateConfig,\n\n    // Network information\n    networkQuality,\n    connectionType,\n    metrics,\n    getNetworkInfo,\n\n    // Optimization settings\n    getOptimizedSettings,\n    shouldUseDataSaver,\n    shouldPrioritizeText,\n    getImageOptimizationParams,\n\n    // Actions\n    runSpeedTest,\n    trackRequest,\n\n    // State\n    isOptimizing,\n    isSlowConnection: networkQuality === 'poor',\n  };\n};\n\nexport default useNetworkOptimization;