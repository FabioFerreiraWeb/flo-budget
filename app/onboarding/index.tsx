import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '../../context/AppContext';
import { Category, MonthConfig } from '../../types';
import { Step1 } from './step1';
import { Step2 } from './step2';
import { Step3 } from './step3';

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function OnboardingScreen() {
  const { setMonthConfig } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');

  const handleFinish = (categories: Category[]) => {
    const config: MonthConfig = {
      monthKey: getCurrentMonthKey(),
      income: parseFloat(income),
      savingsGoal: parseFloat(savingsGoal),
      categories,
    };
    setMonthConfig(config);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)');
  };

  return (
    <View style={{ flex: 1 }}>
      {step === 1 && (
        <Step1 currentStep={1} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <Step2
          currentStep={2}
          income={income}
          setIncome={setIncome}
          savingsGoal={savingsGoal}
          setSavingsGoal={setSavingsGoal}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3
          currentStep={3}
          income={parseFloat(income) || 0}
          savingsGoal={parseFloat(savingsGoal) || 0}
          onBack={() => setStep(2)}
          onFinish={handleFinish}
        />
      )}
    </View>
  );
}
