interface FormProgressProps {
  currentStep: number;
}

export function FormProgress({ currentStep }: FormProgressProps) {
  const steps = [
    { number: 1, label: 'Project' },
    { number: 2, label: 'Property' },
    { number: 3, label: 'Development' },
    { number: 4, label: 'Planning' },
    { number: 5, label: 'Environmental' },
    { number: 6, label: 'Preview' },
  ];

  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full mb-6">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
        {steps.map(step => (
          <div key={step.number} className="flex flex-col items-center">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs
                  ${
                    step.number < currentStep
                      ? 'bg-green-500 text-white'
                      : step.number === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-muted-foreground/20 text-muted-foreground'
                  }`}
            >
              {step.number < currentStep ? '✓' : step.number}
            </div>
            <span
              className={`mt-1 ${step.number === currentStep ? 'text-primary font-medium' : ''}`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
