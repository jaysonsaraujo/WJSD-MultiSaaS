import { DevelopmentPage } from "@/features/layout/development-page";

export default function TestDrivePage(): React.ReactNode {
  return (
    <DevelopmentPage
      title="Test-Drive"
      description="Prepare ambientes de demonstração para apresentar o valor de cada produto."
      icon="test-drive"
    />
  );
}
