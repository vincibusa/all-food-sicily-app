import React, { createContext, useContext, ReactNode } from 'react';
import { useBatterySaver } from '../hooks/useBatterySaver';
import { useNetworkOptimization } from '../hooks/useNetworkOptimization';

interface PerformanceContextType {
  // Battery Saver
  batterySaver: ReturnType<typeof useBatterySaver>;
  
  // Network Optimization
  network: ReturnType<typeof useNetworkOptimization>;
  
  // Combined optimized values
  getOptimizedConfig: () => {
    imageQuality: 'low' | 'medium' | 'high';
    animationDuration: number;
    maxConcurrentRequests: number;
    useHaptics: boolean;
    useBlur: boolean;
    shouldPreloadImages: boolean;
    timeoutDuration: number;
    retryAttempts: number;
  };
  
  // Performance status
  getPerformanceStatus: () => {
    isOptimized: boolean;
    batterySaverActive: boolean;
    networkOptimized: boolean;
    overallPerformanceLevel: 'high' | 'medium' | 'low';
  };
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

interface PerformanceProviderProps {
  children: ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const batterySaver = useBatterySaver();
  const network = useNetworkOptimization();

  const getOptimizedConfig = () => {
    const batteryValues = batterySaver.getOptimizedValues();
    const networkValues = network.getOptimizedSettings();

    // Use the most restrictive settings between battery saver and network optimization
    return {
      imageQuality: (() => {
        const qualities = ['low', 'medium', 'high'];
        const batteryQuality = qualities.indexOf(batteryValues.imageQuality);
        const networkQuality = qualities.indexOf(networkValues.imageQuality);
        return qualities[Math.min(batteryQuality, networkQuality)] as 'low' | 'medium' | 'high';
      })(),
      
      animationDuration: Math.min(batteryValues.animationDuration, networkValues.animationDuration),
      
      maxConcurrentRequests: Math.min(
        batteryValues.maxConcurrentRequests,
        networkValues.maxConcurrentRequests
      ),
      
      useHaptics: batteryValues.useHaptics,
      useBlur: batteryValues.useBlur,
      
      shouldPreloadImages: networkValues.preloadImages && !batterySaver.shouldSkipBackgroundRefresh(),
      
      timeoutDuration: networkValues.timeoutDuration,
      retryAttempts: networkValues.retryAttempts,
    };
  };

  const getPerformanceStatus = () => {
    const batterySaverActive = batterySaver.isEnabled;
    const networkOptimized = network.isSlowConnection;
    const isOptimized = batterySaverActive || networkOptimized;

    let overallPerformanceLevel: 'high' | 'medium' | 'low' = 'high';
    
    if (batterySaverActive && networkOptimized) {
      overallPerformanceLevel = 'low';
    } else if (batterySaverActive || networkOptimized) {
      overallPerformanceLevel = 'medium';
    }

    return {
      isOptimized,
      batterySaverActive,
      networkOptimized,
      overallPerformanceLevel,
    };
  };

  const value: PerformanceContextType = {
    batterySaver,
    network,
    getOptimizedConfig,
    getPerformanceStatus,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = (): PerformanceContextType => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

export default PerformanceContext;