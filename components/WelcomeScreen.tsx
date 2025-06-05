import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useTrip } from "../context/TripContext";
import { Plane, MapPin, Calendar, Sparkles } from "lucide-react";

export const WelcomeScreen: React.FC = () => {
  const { setCurrentStep } = useTrip();

  const handleGetStarted = () => {
    setCurrentStep(0);
  };

  return (
    <div className="w-full max-w-md lg:max-w-4xl mx-auto space-y-6 lg:space-y-8 p-4 lg:p-8">
      {/* Main Welcome Card */}
      <Card className="text-center border-0 bg-transparent shadow-none">
        <CardHeader className="pb-4 lg:pb-6">
          <div className="mx-auto mb-4 lg:mb-6 p-3 lg:p-4 bg-primary/10 rounded-full w-fit">
            <Plane className="h-8 w-8 lg:h-12 lg:w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl lg:text-5xl xl:text-6xl mb-2 lg:mb-4 text-foreground">
            AI Holiday Planner
          </CardTitle>
          <CardDescription className="text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Turn your dream destination into a perfectly planned adventure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 lg:space-y-8">
          {/* Features - responsive grid */}
          <div className="grid gap-4 lg:gap-6 md:grid-cols-1 lg:grid-cols-3 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 lg:gap-4 p-4 lg:p-6 bg-background/50 backdrop-blur-sm rounded-lg border border-border/30 lg:flex-col lg:text-center min-h-[120px] lg:min-h-[160px]">
              <div className="p-2 lg:p-3 bg-primary/10 rounded-full lg:mx-auto flex-shrink-0">
                <Sparkles className="h-4 w-4 lg:h-6 lg:w-6 text-primary" />
              </div>
              <div className="text-left lg:text-center flex-1 flex flex-col justify-center">
                <h4 className="font-medium text-foreground text-base lg:text-lg">AI-Powered Suggestions</h4>
                <p className="text-sm lg:text-base text-muted-foreground mt-1 lg:mt-2">Personalized activities based on your interests and group</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 lg:gap-4 p-4 lg:p-6 bg-background/50 backdrop-blur-sm rounded-lg border border-border/30 lg:flex-col lg:text-center min-h-[120px] lg:min-h-[160px]">
              <div className="p-2 lg:p-3 bg-primary/10 rounded-full lg:mx-auto flex-shrink-0">
                <Calendar className="h-4 w-4 lg:h-6 lg:w-6 text-primary" />
              </div>
              <div className="text-left lg:text-center flex-1 flex flex-col justify-center">
                <h4 className="font-medium text-foreground text-base lg:text-lg">Smart Scheduling</h4>
                <p className="text-sm lg:text-base text-muted-foreground mt-1 lg:mt-2">Optimized daily plans with perfect timing and rest periods</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 lg:gap-4 p-4 lg:p-6 bg-background/50 backdrop-blur-sm rounded-lg border border-border/30 lg:flex-col lg:text-center min-h-[120px] lg:min-h-[160px]">
              <div className="p-2 lg:p-3 bg-primary/10 rounded-full lg:mx-auto flex-shrink-0">
                <MapPin className="h-4 w-4 lg:h-6 lg:w-6 text-primary" />
              </div>
              <div className="text-left lg:text-center flex-1 flex flex-col justify-center">
                <h4 className="font-medium text-foreground text-base lg:text-lg">Budget Optimization</h4>
                <p className="text-sm lg:text-base text-muted-foreground mt-1 lg:mt-2">Smart alternatives to save money without compromising experience</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="pt-4 lg:pt-8 max-w-md mx-auto">
            <Button 
              onClick={handleGetStarted} 
              size="lg" 
              className="w-full lg:text-lg lg:py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              Start Planning Your Trip
            </Button>
            <p className="text-xs lg:text-sm text-muted-foreground mt-3 lg:mt-4">
              Takes less than 5 minutes to set up
            </p>
          </div>

          {/* Additional info for desktop */}
          <div className="hidden lg:block pt-6 border-t border-border/20">
            <div className="grid grid-cols-3 gap-8 text-center max-w-2xl mx-auto">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">3</div>
                <div className="text-sm text-muted-foreground">Simple Steps</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">AI</div>
                <div className="text-sm text-muted-foreground">Powered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};