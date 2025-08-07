import { useState, useEffect } from 'react';

const AGE_GATE_KEY = 'age_verification_accepted';

export const useAgeGate = () => {
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    // Verifica se o usuário já aceitou o age gate anteriormente
    const accepted = localStorage.getItem(AGE_GATE_KEY);
    setIsAccepted(accepted === 'true');
  }, []);

  const acceptAgeGate = () => {
    localStorage.setItem(AGE_GATE_KEY, 'true');
    setIsAccepted(true);
  };

  const resetAgeGate = () => {
    localStorage.removeItem(AGE_GATE_KEY);
    setIsAccepted(false);
  };

  return {
    isAccepted,
    acceptAgeGate,
    resetAgeGate,
    isLoading: isAccepted === null
  };
};
