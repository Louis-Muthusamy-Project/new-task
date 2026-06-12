import React, { createContext, useContext, useState, useEffect } from 'react';
import { agencyClients } from '../data/mock';

const FeatureContext = createContext();

export const FeatureProvider = ({ children }) => {
  // Mock: Assume 'PE' (Prestige Estates) is the active client when logged in as a client
  // And for the agency view, this could be updated when an agency edits a client.
  // We'll manage the features globally so agency edits reflect in the client view.
  const [clientsData, setClientsData] = useState(() => {
    // Load from local storage if exists, otherwise use mock data
    const saved = localStorage.getItem('clientsFeatures');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return agencyClients;
      }
    }
    return agencyClients;
  });

  const defaultPackages = [
    { id: 'Starter', name: 'Starter', description: 'Basic tier for new clients.', price: '₹1.5L/mo', features: ['dashboard', 'support', 'performance', 'tasks'] },
    { id: 'Growth', name: 'Growth', description: 'Accelerated tier for growing brands.', price: '₹3.0L/mo', features: ['dashboard', 'support', 'performance', 'tasks', 'leads', 'store', 'billing'] },
    { id: 'Enterprise', name: 'Enterprise', description: 'Full access for enterprise clients.', price: '₹5.0L/mo', features: ['dashboard', 'support', 'performance', 'tasks', 'leads', 'store', 'billing', 'website'] },
  ];

  const [packages, setPackages] = useState(() => {
    const savedPkgs = localStorage.getItem('agencyPackages');
    if (savedPkgs) {
      try {
        return JSON.parse(savedPkgs);
      } catch (e) {
        return defaultPackages;
      }
    }
    return defaultPackages;
  });

  useEffect(() => {
    localStorage.setItem('clientsFeatures', JSON.stringify(clientsData));
  }, [clientsData]);

  useEffect(() => {
    localStorage.setItem('agencyPackages', JSON.stringify(packages));
  }, [packages]);

  // For client view, default to PE
  const activeClientId = 'PE';
  
  const getActiveClientFeatures = () => {
    const client = clientsData.find(c => c.id === activeClientId);
    return client ? client.features || [] : [];
  };

  const hasFeature = (featureName) => {
    const features = getActiveClientFeatures();
    return features.includes(featureName);
  };

  const updateClientFeatures = (clientId, newFeatures, newPackage) => {
    setClientsData(prev => prev.map(c => 
      c.id === clientId ? { ...c, features: newFeatures, package: newPackage } : c
    ));
  };

  const getClientData = (clientId) => {
    return clientsData.find(c => c.id === clientId);
  };

  const createPackage = (newPackage) => {
    setPackages(prev => [...prev, { ...newPackage, id: newPackage.name }]);
  };

  const updatePackage = (packageId, updatedFields) => {
    setPackages(prev => prev.map(p => p.id === packageId ? { ...p, ...updatedFields } : p));
  };

  const deletePackage = (packageId) => {
    setPackages(prev => prev.filter(p => p.id !== packageId));
  };

  return (
    <FeatureContext.Provider value={{ 
      clientsData, 
      hasFeature, 
      updateClientFeatures,
      getClientData,
      activeClientId,
      packages,
      createPackage,
      updatePackage,
      deletePackage
    }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatures = () => useContext(FeatureContext);
