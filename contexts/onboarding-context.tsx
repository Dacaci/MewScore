import { createContext, useContext, useState, ReactNode } from 'react';

export type Gender = 'homme' | 'femme' | null;

interface OnboardingData {
  gender: Gender;
  age: number | null;
}

interface OnboardingContextType {
  data: OnboardingData;
  setGender: (gender: Gender) => void;
  setAge: (age: number) => void;
  reset: () => void;
}

const defaultData: OnboardingData = {
  gender: null,
  age: null,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData);

  const setGender = (gender: Gender) => {
    setData(prev => ({ ...prev, gender }));
  };

  const setAge = (age: number) => {
    setData(prev => ({ ...prev, age }));
  };

  const reset = () => {
    setData(defaultData);
  };

  return (
    <OnboardingContext.Provider value={{ data, setGender, setAge, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
