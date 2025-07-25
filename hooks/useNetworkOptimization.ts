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

  // Perform simple speed test using small image requests
  const performSpeedTest = useCallback(async () => {
    if (lastSpeedTest.current > Date.now() - 30000) return; // Don't test too frequently
    
    lastSpeedTest.current = Date.now();
    
    try {
      const testUrl = 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=100';
      const startTime = Date.now();
      
      const response = await fetch(testUrl, {
        method: 'HEAD', // Only get headers, not body
        cache: 'no-cache',
      });
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      // Estimate download speed based on response time
      const estimatedSpeed = latency < 100 ? 10 : latency < 300 ? 5 : latency < 1000 ? 1 : 0.5;
      
      const newMetrics: NetworkMetrics = {
        downloadSpeed: estimatedSpeed,
        latency,
        jitter: Math.random() * 50, // Simplified
        packetLoss: response.ok ? 0 : 10,
        effectiveBandwidth: estimatedSpeed * 1000, // Convert to Kbps
      };
      
      setMetrics(newMetrics);
      metricsHistory.current.push(newMetrics);
      
      // Update network quality based on metrics
      updateNetworkQuality(newMetrics);
      
      // Save metrics periodically
      if (metricsHistory.current.length % 10 === 0) {
        saveMetricsHistory();
      }
      
    } catch (error) {
      console.warn('Speed test failed:', error);
      setNetworkQuality('poor');
    }
  }, []);

  const updateNetworkQuality = (metrics: NetworkMetrics) => {
    const { latency, downloadSpeed, packetLoss } = metrics;
    
    if (latency > 1000 || downloadSpeed < 0.5 || packetLoss > 5) {
      setNetworkQuality('poor');
    } else if (latency > 500 || downloadSpeed < 2) {
      setNetworkQuality('good');
    } else {
      setNetworkQuality('excellent');
    }
  };

  // Track API request performance
  const trackRequest = useCallback((url: string, startTime: number, endTime: number, success: boolean) => {
    const duration = endTime - startTime;
    requestTimes.current.set(url, duration);
    
    // Update metrics based on request performance
    if (duration > 5000 || !success) {
      setNetworkQuality('poor');
      setIsOptimizing(true);
    }
  }, []);

  // Get optimized settings based on network quality
  const getOptimizedSettings = useCallback(() => {
    if (!config.enabled) {
      return {
        imageQuality: 'high' as const,
        maxConcurrentRequests: 5,
        timeoutDuration: 10000,
        retryAttempts: 3,
        useCompression: false,
        preloadImages: true,
        animationDuration: 300,
      };
    }

    switch (networkQuality) {
      case 'poor':
        return {
          imageQuality: 'low' as const,
          maxConcurrentRequests: 1,
          timeoutDuration: 15000,
          retryAttempts: 1,
          useCompression: true,
          preloadImages: false,
          animationDuration: config.reduceAnimations ? 100 : 300,
        };
      
      case 'good':
        return {
          imageQuality: 'medium' as const,
          maxConcurrentRequests: 2,
          timeoutDuration: 12000,
          retryAttempts: 2,
          useCompression: config.compressImages,
          preloadImages: false,
          animationDuration: config.reduceAnimations ? 200 : 300,
        };
      
      case 'excellent':
      default:
        return {
          imageQuality: 'high' as const,
          maxConcurrentRequests: 5,
          timeoutDuration: 10000,
          retryAttempts: 3,
          useCompression: false,
          preloadImages: true,
          animationDuration: 300,
        };
    }
  }, [networkQuality, config]);

  const shouldUseDataSaver = useCallback(() => {
    return config.useDataSaverMode || (config.enabled && networkQuality === 'poor');
  }, [config, networkQuality]);

  const shouldPrioritizeText = useCallback(() => {
    return config.enabled && config.prioritizeText && networkQuality !== 'excellent';
  }, [config, networkQuality]);

  const getImageOptimizationParams = useCallback((originalUrl: string) => {
    if (!config.enabled) return originalUrl;
    
    const settings = getOptimizedSettings();
    
    // Only optimize Unsplash images
    if (!originalUrl.includes('unsplash.com')) return originalUrl;
    
    const qualityMap = {
      low: { w: 400, q: 60 },
      medium: { w: 800, q: 75 },
      high: { w: 1200, q: 90 },
    };
    
    const params = qualityMap[settings.imageQuality];
    const separator = originalUrl.includes('?') ? '&' : '?';
    
    return `${originalUrl}${separator}w=${params.w}&q=${params.q}&fm=jpg`;
  }, [config, getOptimizedSettings]);

  const updateConfig = useCallback(async (updates: Partial<NetworkOptimizationConfig>) => {
    const newConfig = { ...config, ...updates };
    await saveConfiguration(newConfig);
  }, [config]);

  const getNetworkInfo = useCallback(() => {
    return {
      quality: networkQuality,
      connectionType,
      metrics,
      isOptimizing,
      isSlowConnection: networkQuality === 'poor',
      averageLatency: metricsHistory.current.length > 0 
        ? metricsHistory.current.reduce((sum, m) => sum + m.latency, 0) / metricsHistory.current.length
        : 0,
    };
  }, [networkQuality, connectionType, metrics, isOptimizing]);

  // Force speed test
  const runSpeedTest = useCallback(async () => {
    lastSpeedTest.current = 0; // Reset to force new test
    await performSpeedTest();
  }, [performSpeedTest]);

  return {
    // Configuration
    config,
    updateConfig,

    // Network information
    networkQuality,
    connectionType,
    metrics,
    getNetworkInfo,

    // Optimization settings
    getOptimizedSettings,
    shouldUseDataSaver,
    shouldPrioritizeText,
    getImageOptimizationParams,

    // Actions
    runSpeedTest,
    trackRequest,

    // State
    isOptimizing,
    isSlowConnection: networkQuality === 'poor',
  };
};

export default useNetworkOptimization;