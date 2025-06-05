import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useTrip, Activity } from "../context/TripContext";
import { generateDayPlanOptions } from "../services/mockAIService";
import { formatDate } from "../utils/dateUtils";
import { ActivityCard } from "./ActivityCard";
import { Skeleton } from "./ui/skeleton";
import { RefreshCw, ArrowLeft, ArrowRight, Check, Calendar, AlertTriangle, UsersIcon } from "lucide-react";
import { toast } from "sonner@2.0.3";

export const DayPlanning: React.FC = () => {
  const { 
    userProfile, 
    tripDetails, 
    setTripDetails, 
    currentPlanningDay, 
    setCurrentPlanningDay,
    acceptDayPlan,
    setCurrentStep,
    isProfileComplete,
    isTripDetailsComplete
  } = useTrip();
  
  const [dayOptions, setDayOptions] = useState<Activity[][]>([]);
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Check if we have the requirements to plan
  useEffect(() => {
    if (!isTripDetailsComplete || !isProfileComplete) {
      console.warn("Incomplete trip details or profile, redirecting...");
      if (!isTripDetailsComplete) {
        setCurrentStep(0); // Go to trip details step (now step 0)
      } else if (!isProfileComplete) {
        setCurrentStep(1); // Go to profile step (now step 1)
      }
    }
  }, [isTripDetailsComplete, isProfileComplete, setCurrentStep]);
  
  // Generate options when the component mounts or when the current day changes
  useEffect(() => {
    // Safety check for required data
    if (!userProfile?.interests?.length || 
        !tripDetails?.destination || 
        !tripDetails.dayPlans || 
        tripDetails.dayPlans.length === 0 ||
        !tripDetails.dayPlans[currentPlanningDay] ||
        !tripDetails.travelers?.length) {
      console.error("Missing user profile, day plan data, or traveler information", {
        hasProfile: !!userProfile,
        hasInterests: userProfile?.interests?.length > 0,
        destination: tripDetails?.destination,
        dayPlansLength: tripDetails?.dayPlans?.length,
        currentDay: currentPlanningDay,
        travelersCount: tripDetails?.travelers?.length
      });
      setHasError(true);
      setIsLoading(false);
      return;
    }

    generateSuggestions();
  }, [currentPlanningDay, userProfile, tripDetails.destination, tripDetails.travelers]);

  const generateSuggestions = () => {
    setIsLoading(true);
    setHasError(false);
    
    // Make sure we have valid data before generating suggestions
    if (!userProfile?.interests?.length || 
        !tripDetails?.destination || 
        !tripDetails.dayPlans || 
        tripDetails.dayPlans.length === 0 ||
        !tripDetails.dayPlans[currentPlanningDay] ||
        !tripDetails.travelers?.length) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    // Simulate AI generation with a delay
    const timer = setTimeout(() => {
      try {
        const options = generateDayPlanOptions(
          tripDetails.dayPlans[currentPlanningDay].date,
          userProfile,
          tripDetails.destination,
          tripDetails.travelers
        );

        if (!options || options.length === 0 || options.some(option => !option || option.length === 0)) {
          throw new Error("Failed to generate valid options");
        }

        setDayOptions(options);
        setIsLoading(false);
        setHasError(false);
      } catch (error) {
        console.error("Error generating suggestions:", error);
        setHasError(true);
        setIsLoading(false);
        toast.error("Failed to generate suggestions. Please try again.");
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  };

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
  };

  const handleAcceptDayPlan = () => {
    if (dayOptions.length === 0 || !dayOptions[selectedOption]) {
      toast.error("No valid plan selected. Please try regenerating the options.");
      return;
    }

    // Update the day plan in the trip details
    const updatedDayPlans = [...tripDetails.dayPlans];
    updatedDayPlans[currentPlanningDay] = {
      ...updatedDayPlans[currentPlanningDay],
      activities: dayOptions[selectedOption],
      isAccepted: true
    };
    
    setTripDetails({ ...tripDetails, dayPlans: updatedDayPlans });
    toast.success("Day plan accepted!");
    
    // If this is the last day, go to the calendar view
    if (currentPlanningDay === tripDetails.dayPlans.length - 1) {
      setCurrentStep(3); // Move to calendar view
    } else {
      // Otherwise, move to the next day
      setCurrentPlanningDay(currentPlanningDay + 1);
      setSelectedOption(0);
    }
  };

  const regenerateOptions = () => {
    setIsRegenerating(true);
    
    // Simulate AI regeneration with a delay
    setTimeout(() => {
      try {
        if (!userProfile?.interests?.length || !tripDetails?.destination || !tripDetails?.travelers?.length) {
          throw new Error("Missing user profile, destination, or traveler information");
        }
        
        const options = generateDayPlanOptions(
          tripDetails.dayPlans[currentPlanningDay].date,
          userProfile,
          tripDetails.destination,
          tripDetails.travelers
        );
        
        if (!options || options.length === 0) {
          throw new Error("Failed to generate options");
        }
        
        setDayOptions(options);
        setIsRegenerating(false);
      } catch (error) {
        console.error("Error regenerating options:", error);
        toast.error("Failed to regenerate options. Please try again.");
        setIsRegenerating(false);
      }
    }, 1500);
  };

  // Helper function to get traveler summary
  const getTravelerSummary = () => {
    if (!tripDetails.travelers || tripDetails.travelers.length === 0) return "";
    
    const adults = tripDetails.travelers.filter(t => t.age >= 18).length;
    const children = tripDetails.travelers.filter(t => t.age < 18).length;
    
    if (adults > 0 && children > 0) {
      return `${adults} adult${adults > 1 ? 's' : ''}, ${children} child${children > 1 ? 'ren' : ''}`;
    } else if (adults > 0) {
      return `${adults} adult${adults > 1 ? 's' : ''}`;
    } else {
      return `${children} child${children > 1 ? 'ren' : ''}`;
    }
  };

  // If we don't have a valid day to show, render an error state
  if (!tripDetails.dayPlans || tripDetails.dayPlans.length === 0 || !tripDetails.dayPlans[currentPlanningDay]) {
    return (
      <Card className="w-full max-w-md lg:max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl lg:text-2xl">Missing Trip Information</CardTitle>
          <CardDescription className="text-sm lg:text-base">
            Please complete your trip details and profile before planning your days.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <p className="text-sm lg:text-base">We need more information to help plan your trip.</p>
        </CardContent>
        <CardFooter className="flex gap-2 p-4 lg:p-6">
          <Button 
            onClick={() => setCurrentStep(0)} 
            variant="outline" 
            className="flex-1 lg:h-11"
          >
            Trip Details
          </Button>
          <Button 
            onClick={() => setCurrentStep(1)}
            className="flex-1 lg:h-11"
          >
            Your Profile
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const currentDay = tripDetails.dayPlans[currentPlanningDay];
  const dayNumber = currentPlanningDay + 1;
  const formattedDate = formatDate(currentDay.date);
  const progress = `${currentPlanningDay + 1}/${tripDetails.dayPlans.length}`;
  const allDaysPlanned = tripDetails.dayPlans.every(day => day.isAccepted);
  const showViewCalendar = tripDetails.dayPlans.some(day => day.isAccepted);

  return (
    <div className="w-full max-w-md lg:max-w-4xl mx-auto flex flex-col gap-4 lg:gap-6 p-4 lg:p-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg lg:text-xl">Day {dayNumber}: {tripDetails.destination}</CardTitle>
              <CardDescription className="text-sm lg:text-base">{formattedDate} • {progress}</CardDescription>
              {tripDetails.travelers && tripDetails.travelers.length > 0 && (
                <div className="flex items-center gap-1 mt-2 text-sm lg:text-base text-muted-foreground">
                  <UsersIcon className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span>{getTravelerSummary()}</span>
                </div>
              )}
            </div>
            {showViewCalendar && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-1 lg:gap-2 shrink-0"
              >
                <Calendar className="h-4 w-4" />
                <span>View Calendar</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm lg:text-base text-muted-foreground">
              {isLoading ? 'Generating suggestions...' : 'AI-generated suggestions for your group'}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={regenerateOptions}
              disabled={isLoading || isRegenerating}
              className="h-8 px-2 lg:h-9 lg:px-3"
            >
              <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span className="sr-only lg:not-sr-only lg:ml-2">Regenerate</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasError && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
          <CardContent className="pt-6 p-4 lg:p-6">
            <div className="flex items-start gap-2 lg:gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-base lg:text-lg">Error generating suggestions</h3>
                <p className="text-sm lg:text-base text-muted-foreground mt-1">
                  We couldn't generate suggestions for this day. Please ensure you have completed your trip details and profile including traveler information.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateSuggestions} 
                  className="mt-3 lg:mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs 
        defaultValue="0" 
        value={selectedOption.toString()} 
        onValueChange={(v) => handleSelectOption(parseInt(v))}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-4 lg:mb-6 h-10 lg:h-11">
          <TabsTrigger value="0" className="text-sm lg:text-base">Option 1</TabsTrigger>
          <TabsTrigger value="1" className="text-sm lg:text-base">Option 2</TabsTrigger>
          <TabsTrigger value="2" className="text-sm lg:text-base">Option 3</TabsTrigger>
        </TabsList>
        
        {isLoading ? (
          <div className="space-y-4 lg:space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2 lg:pb-3">
                  <Skeleton className="h-6 lg:h-7 w-3/4" />
                  <Skeleton className="h-4 lg:h-5 w-1/3 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 lg:h-5 w-full" />
                  <Skeleton className="h-4 lg:h-5 w-5/6 mt-2" />
                  <Skeleton className="h-4 lg:h-5 w-2/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          dayOptions.map((dayOption, index) => (
            <TabsContent key={index} value={index.toString()} className="space-y-4 lg:space-y-6 mt-0">
              {dayOption && dayOption.length > 0 ? (
                <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
                  {dayOption.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 lg:p-8 text-center">
                    <p className="text-muted-foreground text-sm lg:text-base">No activities for this option.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))
        )}
      </Tabs>

      <div className="flex gap-2 lg:gap-4 sticky bottom-4 bg-background/95 backdrop-blur-sm rounded-lg p-2 lg:p-3 border border-border/50">
        <Button 
          variant="outline" 
          onClick={() => setCurrentPlanningDay(Math.max(0, currentPlanningDay - 1))}
          disabled={currentPlanningDay === 0 || isLoading}
          className="flex-1 lg:h-11"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
        
        <Button 
          onClick={handleAcceptDayPlan}
          disabled={isLoading || dayOptions.length === 0 || !dayOptions[selectedOption] || dayOptions[selectedOption].length === 0}
          className="flex-1 lg:h-11 lg:text-base"
        >
          <Check className="h-4 w-4 mr-2" /> Accept Plan
        </Button>
        
        {currentPlanningDay < tripDetails.dayPlans.length - 1 && (
          <Button 
            variant="outline" 
            onClick={() => setCurrentPlanningDay(currentPlanningDay + 1)}
            disabled={isLoading}
            className="flex-1 lg:h-11"
          >
            Next <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};