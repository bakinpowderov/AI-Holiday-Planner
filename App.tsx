import React from "react";
import { TripProvider, useTrip } from "./context/TripContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { UserProfileStep, TripDetailsStep } from "./components/OnboardingSteps";
import { DayPlanning } from "./components/DayPlanning";
import { CalendarView } from "./components/CalendarView";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Toaster } from "sonner";

// Main App Content Component
const AppContent: React.FC = () => {
  const { currentStep } = useTrip();
  const { theme } = useTheme();

  // Render the appropriate step based on current step
  const renderStep = () => {
    switch (currentStep) {
      case -1:
        return <WelcomeScreen />;
      case 0:
        return <TripDetailsStep />;
      case 1:
        return <UserProfileStep />;
      case 2:
        return <DayPlanning />;
      case 3:
        return <CalendarView />;
      default:
        return <WelcomeScreen />;
    }
  };

  // Get responsive content width based on current step
  const getContentWidth = () => {
    switch (currentStep) {
      case 3: // Calendar view - wider on desktop
        return "w-full max-w-7xl";
      case 2: // Day planning - medium width on desktop
        return "w-full max-w-4xl";
      default: // Welcome and onboarding - standard width
        return "w-full max-w-md lg:max-w-lg xl:max-w-xl";
    }
  };

  // Get main content alignment - center welcome screen, start others
  const getMainAlignment = () => {
    if (currentStep === -1) {
      return "flex-1 flex items-center justify-center py-2 sm:py-4 lg:py-8";
    }
    return "flex-1 flex items-start justify-center py-2 sm:py-4 lg:py-8";
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Beautiful Mediterranean coastal town with crystal clear waters and white buildings"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30"></div>
        {/* Additional overlay for dark mode */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${theme === 'dark' ? 'bg-black/50' : 'bg-white/20'}`}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen bg-background/80 backdrop-blur-sm text-foreground p-4 sm:p-6 lg:p-8 flex flex-col">
        {currentStep !== -1 && (
          <header className="mb-4 sm:mb-6 lg:mb-8 text-center">
            <div className="bg-background/60 backdrop-blur-md rounded-lg p-4 lg:p-6 mx-auto max-w-md lg:max-w-2xl border border-border/50">
              <h1 className="mb-2 text-xl sm:text-2xl lg:text-3xl">AI Holiday Planner</h1>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Let AI plan your perfect getaway</p>
            </div>
          </header>
        )}
        
        <main className={getMainAlignment()}>
          <div className={getContentWidth()}>
            {/* Content wrapper with enhanced backdrop for better readability */}
            <div className={`${currentStep !== -1 ? 'bg-background/95 backdrop-blur-md rounded-lg border border-border/50 shadow-xl' : ''}`}>
              {renderStep()}
            </div>
          </div>
        </main>
        
        {currentStep !== -1 && (
          <footer className="mt-4 sm:mt-6 lg:mt-8 text-center">
            <div className="bg-background/60 backdrop-blur-md rounded-lg p-3 lg:p-4 mx-auto max-w-md lg:max-w-2xl border border-border/50">
              <p className="text-muted-foreground text-xs sm:text-sm">
                © 2025 AI Holiday Planner. All AI recommendations are simulated.
              </p>
            </div>
          </footer>
        )}
        
        {/* Toast notifications */}
        <Toaster position="bottom-right" />
      </div>
    </div>
  );
};

// App with Provider Wrapper
export default function App() {
  return (
    <ThemeProvider>
      <TripProvider>
        <AppContent />
      </TripProvider>
    </ThemeProvider>
  );
}