import { useState } from "react";

interface UseMultiStepFormOptions<T> {
  totalSteps: number;
  initialValues: T;
}

/**
 * Custom hook to manage state, data accumulation, and navigation for multi-step forms.
 * Used for the owner registration multi-step wizard.
 */
export function useMultiStepForm<T>({
  totalSteps,
  initialValues,
}: UseMultiStepFormOptions<T>) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<T>(initialValues);

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const updateFormData = (fields: Partial<T>) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }));
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData(initialValues);
  };

  return {
    currentStep,
    totalSteps,
    formData,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
    nextStep,
    prevStep,
    goToStep,
    updateFormData,
    resetForm,
  };
}

export default useMultiStepForm;
