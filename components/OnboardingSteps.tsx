import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useTrip, ActivityType, Traveler } from "../context/TripContext";
import { CalendarIcon, InfoIcon, BellIcon, PlusIcon, MinusIcon, UsersIcon } from "lucide-react";
import { formatDate } from "../utils/dateUtils";
import { cn } from "./ui/utils";
import { toast } from "sonner@2.0.3";

// Trip Details Step Component (Now Step 0)
export const TripDetailsStep: React.FC = () => {
  const { tripDetails, setTripDetails, setCurrentStep, isTripDetailsComplete } = useTrip();
  const [localDetails, setLocalDetails] = useState(tripDetails);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Initialize dateRange with safe default values
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: tripDetails?.startDate || undefined,
    to: tripDetails?.endDate || undefined
  });
  
  // Handle destination change
  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalDetails({ ...localDetails, destination: e.target.value });
  };
  
  // Handle budget change
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const budget = parseInt(e.target.value) || 0;
    setLocalDetails({ ...localDetails, totalBudget: budget });
  };
  
  // Handle currency change
  const handleCurrencyChange = (value: string) => {
    setLocalDetails({ ...localDetails, currency: value });
  };

  // Generate ID for travelers
  const generateTravelerId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  // Handle adding a traveler
  const handleAddTraveler = () => {
    const newTraveler: Traveler = {
      id: generateTravelerId(),
      age: 30
    };
    setLocalDetails({
      ...localDetails,
      travelers: [...localDetails.travelers, newTraveler]
    });
  };

  // Handle removing a traveler
  const handleRemoveTraveler = (id: string) => {
    if (localDetails.travelers.length > 1) {
      setLocalDetails({
        ...localDetails,
        travelers: localDetails.travelers.filter(t => t.id !== id)
      });
    }
  };

  // Handle traveler age change
  const handleTravelerAgeChange = (id: string, age: number) => {
    setLocalDetails({
      ...localDetails,
      travelers: localDetails.travelers.map(t => 
        t.id === id ? { ...t, age: Math.max(1, Math.min(120, age)) } : t
      )
    });
  };

  // Initialize with one traveler if none exist
  useEffect(() => {
    if (localDetails.travelers.length === 0) {
      handleAddTraveler();
    }
  }, []);
  
  // Handle date selection
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setLocalDetails({
        ...localDetails,
        startDate: dateRange.from,
        endDate: dateRange.to
      });
    }
  }, [dateRange]);
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate
    const newErrors: { [key: string]: string } = {};
    
    if (!localDetails.destination) {
      newErrors.destination = "Please enter a destination";
    }
    
    if (!localDetails.startDate || !localDetails.endDate) {
      newErrors.dates = "Please select a date range";
    }

    if (localDetails.travelers.length === 0) {
      newErrors.travelers = "Please add at least one traveler";
    }

    // Validate traveler ages
    const invalidAges = localDetails.travelers.some(t => !t.age || t.age < 1 || t.age > 120);
    if (invalidAges) {
      newErrors.travelers = "Please enter valid ages for all travelers (1-120)";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Save details and move to next step (User Profile)
    setTripDetails(localDetails);
    toast.success("Trip details saved!");
    setCurrentStep(1); // Go to User Profile step
  };
  
  // Safely format the date with a fallback
  const safeFormatDate = (date: Date | undefined) => {
    if (!date) return "";
    try {
      return formatDate(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
  };

  // Calculate traveler demographics for display
  const getTravelerSummary = () => {
    const adults = localDetails.travelers.filter(t => t.age >= 18).length;
    const children = localDetails.travelers.filter(t => t.age < 18).length;
    
    if (adults > 0 && children > 0) {
      return `${adults} adult${adults > 1 ? 's' : ''}, ${children} child${children > 1 ? 'ren' : ''}`;
    } else if (adults > 0) {
      return `${adults} adult${adults > 1 ? 's' : ''}`;
    } else {
      return `${children} child${children > 1 ? 'ren' : ''}`;
    }
  };
  
  return (
    <Card className="w-full max-w-md lg:max-w-2xl mx-auto">
      <CardHeader className="pb-4 lg:pb-6">
        <CardTitle className="text-xl lg:text-2xl">Where are you going?</CardTitle>
        <CardDescription className="text-sm lg:text-base">
          Enter your destination, travel dates, and traveler information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 lg:space-y-8 p-4 lg:p-6">
        {/* Mobile: Single column, Desktop: Optimized layout */}
        <div className="space-y-6 lg:space-y-8">
          {/* Desktop: Two column layout - Destination aligned with Travelers */}
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
            {/* Left Column - Destination and Travel Dates */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="destination" className="text-sm lg:text-base">Destination</Label>
                {errors.destination && (
                  <p className="text-sm text-destructive mt-1">{errors.destination}</p>
                )}
                <Input 
                  id="destination" 
                  placeholder="e.g. Paris, Tokyo, New York" 
                  value={localDetails.destination}
                  onChange={handleDestinationChange}
                  className="mt-1 lg:mt-2 h-10 lg:h-11"
                />
              </div>
              
              <div>
                <Label className="text-sm lg:text-base">Travel Dates</Label>
                {errors.dates && (
                  <p className="text-sm text-destructive mt-1">{errors.dates}</p>
                )}
                <div className="mt-1 lg:mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left h-10 lg:h-11",
                          !dateRange?.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange && dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {safeFormatDate(dateRange.from)} - {safeFormatDate(dateRange.to)}
                            </>
                          ) : (
                            safeFormatDate(dateRange.from)
                          )
                        ) : (
                          <span>Select date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from || new Date()}
                        selected={dateRange || { from: undefined, to: undefined }}
                        onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Right Column - Travelers (top-aligned with Destination) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="flex items-center gap-2 text-sm lg:text-base">
                  <UsersIcon className="h-4 w-4" />
                  Travelers ({localDetails.travelers.length})
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTraveler}
                  className="h-8 w-8 p-0"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              
              {errors.travelers && (
                <p className="text-sm text-destructive mb-2">{errors.travelers}</p>
              )}

              <div className="space-y-3 max-h-64 lg:max-h-96 overflow-y-auto">
                {localDetails.travelers.map((traveler, index) => (
                  <div key={traveler.id} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor={`traveler-${traveler.id}`} className="text-sm">
                        Person {index + 1} Age
                      </Label>
                      <Input
                        id={`traveler-${traveler.id}`}
                        type="number"
                        min="1"
                        max="120"
                        value={traveler.age}
                        onChange={(e) => handleTravelerAgeChange(traveler.id, parseInt(e.target.value) || 1)}
                        className="mt-1 h-10 lg:h-11"
                      />
                    </div>
                    {localDetails.travelers.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveTraveler(traveler.id)}
                        className="h-8 w-8 p-0 mt-6"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {localDetails.travelers.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2 px-3 py-2 bg-muted/30 rounded-lg">
                  Group: {getTravelerSummary()}
                </p>
              )}
            </div>
          </div>

          {/* Currency and Budget - Full width section with matching heights */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency" className="text-sm lg:text-base">Currency</Label>
                <Select
                  value={localDetails.currency}
                  onValueChange={handleCurrencyChange}
                  defaultValue="USD"
                >
                  <SelectTrigger id="currency" className="mt-1 lg:mt-2 h-10 lg:h-11">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="AUD">AUD (A$)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget" className="text-sm lg:text-base">Trip Budget</Label>
                <Input 
                  id="budget" 
                  type="number" 
                  placeholder="Enter amount"
                  value={localDetails.totalBudget || ''}
                  onChange={handleBudgetChange}
                  className="mt-1 lg:mt-2 h-10 lg:h-11"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Instruction box - Full width */}
        <div className="flex items-start space-x-2 p-4 lg:p-6 bg-muted/50 rounded-lg border">
          <InfoIcon className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
          <div className="text-sm lg:text-base text-muted-foreground">
            <p>We'll use traveler ages to suggest age-appropriate activities and ensure your trip is perfect for everyone in your group.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 lg:p-6">
        <Button onClick={handleSubmit} className="w-full lg:h-11 lg:text-base">
          Continue to Preferences
        </Button>
      </CardFooter>
    </Card>
  );
};

// User Profile Step Component (Now Step 1)
export const UserProfileStep: React.FC = () => {
  const { userProfile, setUserProfile, setCurrentStep, isProfileComplete, tripDetails } = useTrip();
  const [localProfile, setLocalProfile] = useState(userProfile);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Check if we have trip details (should come from previous step now)
  useEffect(() => {
    if (!tripDetails?.destination || !tripDetails.travelers?.length) {
      setCurrentStep(0); // Go back to trip details step
    }
  }, [tripDetails, setCurrentStep]);
  
  // Available activity types
  const activityTypes: { value: ActivityType; label: string }[] = [
    { value: "culture", label: "Cultural Activities" },
    { value: "concert", label: "Concerts & Shows" },
    { value: "archeology", label: "Archaeological Sites" },
    { value: "hiking", label: "Hiking" },
    { value: "cycling", label: "Cycling" },
    { value: "swimming", label: "Swimming" },
    { value: "water sports", label: "Water Sports" },
    { value: "sea cruise", label: "Sea Cruises" },
    { value: "workshop", label: "Workshops" },
    { value: "dining", label: "Dining Experiences" },
    { value: "partying", label: "Nightlife" },
    { value: "pubs", label: "Pubs & Bars" },
    { value: "gallery", label: "Art Galleries" },
    { value: "networking", label: "Social Events" }
  ];
  
  // Handle interest selection
  const handleInterestChange = (interest: ActivityType) => {
    setLocalProfile(prev => {
      const newInterests = prev.interests?.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...(prev.interests || []), interest];
      
      return { ...prev, interests: newInterests };
    });
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate
    const newErrors: { [key: string]: string } = {};
    
    if (!localProfile.interests || localProfile.interests.length === 0) {
      newErrors.interests = "Please select at least one interest";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Save profile and move to next step (Day Planning)
    setUserProfile(localProfile);
    toast.success("Profile saved successfully!");
    
    // Wait for day plans to be generated
    setTimeout(() => {
      setCurrentStep(2); // Go to Day Planning step
    }, 100);
  };
  
  return (
    <Card className="w-full max-w-md lg:max-w-2xl mx-auto">
      <CardHeader className="pb-4 lg:pb-6">
        <CardTitle className="text-xl lg:text-2xl">Tell us about yourself</CardTitle>
        <CardDescription className="text-sm lg:text-base">
          Help us customize your trip based on your preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 lg:space-y-8 p-4 lg:p-6">
        {/* Desktop: Two column layout */}
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3 text-base lg:text-lg">What activities are you interested in?</h3>
              {errors.interests && (
                <p className="text-sm text-destructive mb-2">{errors.interests}</p>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {activityTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
                    <Checkbox 
                      id={`interest-${type.value}`} 
                      checked={localProfile.interests?.includes(type.value)}
                      onCheckedChange={() => handleInterestChange(type.value)}
                    />
                    <Label htmlFor={`interest-${type.value}`} className="text-sm cursor-pointer">{type.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3 text-base lg:text-lg">Energy Level</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This determines how packed your daily schedule will be
              </p>
              <Select 
                value={localProfile.energyLevel}
                onValueChange={(value) => setLocalProfile({ ...localProfile, energyLevel: value as "low" | "medium" | "high" })}
              >
                <SelectTrigger className="lg:h-11">
                  <SelectValue placeholder="Select energy level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Relaxed (2-3 activities per day)</SelectItem>
                  <SelectItem value="medium">Balanced (3-4 activities per day)</SelectItem>
                  <SelectItem value="high">Energetic (4-5 activities per day)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 text-base lg:text-lg">Budget Preference</h3>
              <Select 
                value={localProfile.budget}
                onValueChange={(value) => setLocalProfile({ ...localProfile, budget: value as "budget" | "moderate" | "luxury" })}
              >
                <SelectTrigger className="lg:h-11">
                  <SelectValue placeholder="Select budget preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget-friendly (Save where possible)</SelectItem>
                  <SelectItem value="moderate">Moderate (Balance cost and experience)</SelectItem>
                  <SelectItem value="luxury">Luxury (Premium experiences)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 text-base lg:text-lg">Preferred Daily Schedule</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time" className="text-sm">Start Time</Label>
                  <Input 
                    id="start-time" 
                    type="time" 
                    value={localProfile.preferredStartTime} 
                    onChange={(e) => setLocalProfile({ ...localProfile, preferredStartTime: e.target.value })}
                    className="mt-1 lg:h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="end-time" className="text-sm">End Time</Label>
                  <Input 
                    id="end-time" 
                    type="time" 
                    value={localProfile.preferredEndTime} 
                    onChange={(e) => setLocalProfile({ ...localProfile, preferredEndTime: e.target.value })}
                    className="mt-1 lg:h-10"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/30">
                <Checkbox 
                  id="notifications" 
                  checked={localProfile.enableNotifications}
                  onCheckedChange={(checked) => 
                    setLocalProfile({ ...localProfile, enableNotifications: !!checked })
                  }
                />
                <div className="grid gap-1.5">
                  <Label htmlFor="notifications" className="flex items-center gap-1 text-sm cursor-pointer">
                    <BellIcon className="h-4 w-4" /> Enable activity reminders
                  </Label>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    Get notified 30 minutes before each activity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 lg:p-6 gap-4">
        <Button variant="outline" onClick={() => setCurrentStep(0)} className="lg:h-11">
          Back
        </Button>
        <Button onClick={handleSubmit} className="flex-1 lg:h-11 lg:text-base">
          Generate My Trip Plan
        </Button>
      </CardFooter>
    </Card>
  );
};