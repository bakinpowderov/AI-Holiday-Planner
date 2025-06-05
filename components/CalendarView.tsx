import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { useTrip, Activity } from "../context/TripContext";
import { formatDate } from "../utils/dateUtils";
import { ActivityCard } from "./ActivityCard";
import { WeekCalendarView } from "./WeekCalendarView";
import { BudgetView } from "./BudgetView";
import { NotificationsComponent } from "./NotificationsComponent";
import { CalendarIcon, ArrowLeftIcon, CheckCircleIcon, BookmarkIcon, MapPinIcon, Calendar, CalendarDaysIcon, PiggyBankIcon, BellIcon, LayoutDashboardIcon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const CalendarView: React.FC = () => {
  const { tripDetails, setCurrentStep, resetPlanning, showWeekView, setShowWeekView } = useTrip();
  const { theme, toggleTheme } = useTheme();
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'week' | 'budget' | 'notifications'>('dashboard');

  // Check if all days have been planned
  const allDaysPlanned = tripDetails.dayPlans.every(day => day.isAccepted);
  const anyDayPlanned = tripDetails.dayPlans.some(day => day.isAccepted);
  
  const handleNewTrip = () => {
    resetPlanning();
  };

  // Use useEffect to avoid state updates during render
  React.useEffect(() => {
    if (!anyDayPlanned) {
      setCurrentStep(2);
    }
  }, [anyDayPlanned, setCurrentStep]);
  
  if (!anyDayPlanned) {
    return null;
  }

  // Group activities by day
  const bookingsByDay = tripDetails.dayPlans.map((day, dayIndex) => {
    return {
      date: day.date,
      bookings: day.activities.filter(activity => activity.bookingUrl)
    };
  }).filter(day => day.bookings.length > 0);

  // Calculate total activities
  const totalActivities = tripDetails.dayPlans.reduce(
    (count, day) => count + day.activities.length, 
    0
  );

  // Group activities by type
  const activityTypeCount: Record<string, number> = {};
  tripDetails.dayPlans.forEach(day => {
    day.activities.forEach(activity => {
      if (!activity.isRelaxation) {
        activityTypeCount[activity.type] = (activityTypeCount[activity.type] || 0) + 1;
      }
    });
  });

  // Get top activity types
  const topActivityTypes = Object.entries(activityTypeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">{tripDetails.destination} Trip</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2"/>
              <path d="M12 20v2"/>
              <path d="m4.93 4.93 1.41 1.41"/>
              <path d="m17.66 17.66 1.41 1.41"/>
              <path d="M2 12h2"/>
              <path d="M20 12h2"/>
              <path d="m6.34 17.66-1.41 1.41"/>
              <path d="m19.07 4.93-1.41 1.41"/>
            </svg>
          )}
        </Button>
      </div>

      <Tabs 
        defaultValue="dashboard" 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as 'dashboard' | 'week' | 'budget' | 'notifications')}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-1">
            <LayoutDashboardIcon className="h-4 w-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="week" className="flex items-center gap-1">
            <CalendarDaysIcon className="h-4 w-4" /> Week View
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-1">
            <PiggyBankIcon className="h-4 w-4" /> Budget
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <BellIcon className="h-4 w-4" /> Alerts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Trip Overview</CardTitle>
                    <CardDescription>
                      {formatDate(tripDetails.startDate!)} - {formatDate(tripDetails.endDate!)}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>
                    <ArrowLeftIcon className="h-4 w-4 mr-1" /> Edit Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex flex-col items-center justify-center p-3 border rounded-lg">
                    <div className="text-2xl mb-1">{tripDetails.dayPlans.length}</div>
                    <div className="text-xs text-muted-foreground text-center">Days</div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border rounded-lg">
                    <div className="text-2xl mb-1">{totalActivities}</div>
                    <div className="text-xs text-muted-foreground text-center">Activities</div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border rounded-lg">
                    <div className="text-2xl mb-1">
                      {bookingsByDay.reduce((sum, day) => sum + day.bookings.length, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground text-center">Bookings</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm font-medium">Top Activities</div>
                  <div className="flex flex-wrap gap-2">
                    {topActivityTypes.map(([type, count]) => (
                      <Badge key={type} variant="secondary" className="flex items-center gap-1">
                        {type} <span className="text-xs">({count})</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Daily Plans</CardTitle>
                  <CardDescription>Review your approved daily itineraries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4 max-h-[160px] overflow-y-auto">
                    {tripDetails.dayPlans.map((day, index) => (
                      <Button
                        key={index}
                        variant={selectedDay === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDay(index)}
                        className="flex flex-col items-center"
                        disabled={!day.isAccepted}
                      >
                        <span>Day {index + 1}</span>
                        <span className="text-xs">{formatDate(day.date, 'short')}</span>
                      </Button>
                    ))}
                  </div>

                  {tripDetails.dayPlans[selectedDay] && tripDetails.dayPlans[selectedDay].isAccepted ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <h3>Day {selectedDay + 1}: {formatDate(tripDetails.dayPlans[selectedDay].date)}</h3>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <CheckCircleIcon className="h-3 w-3" /> Confirmed
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {tripDetails.dayPlans[selectedDay].activities.map((activity) => (
                          <div key={activity.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">{activity.name}</div>
                              <Badge variant={activity.isRelaxation ? "outline" : "secondary"}>
                                {activity.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm">
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" /> 
                                {activity.startTime} - {activity.endTime}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPinIcon className="h-3 w-3" /> 
                                {activity.location}
                              </div>
                            </div>
                            {activity.cost > 0 && (
                              <div className="mt-1 text-sm font-medium">
                                {activity.cost} {activity.currency}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 border rounded-lg">
                      <p className="text-muted-foreground">
                        This day hasn't been planned yet.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4" 
                        onClick={() => setCurrentStep(2)}
                      >
                        Continue Planning
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
              <CardDescription>Here's what you need to book for your trip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookingsByDay.length > 0 ? (
                bookingsByDay.map((day, dayIndex) => (
                  <div key={dayIndex} className="space-y-3">
                    <div className="font-medium flex items-center gap-1 text-sm">
                      <CalendarIcon className="h-4 w-4" /> 
                      {formatDate(day.date)}
                    </div>
                    
                    {day.bookings.map((activity, activityIndex) => (
                      <div key={activityIndex} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{activity.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPinIcon className="h-3 w-3" /> {activity.location}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Book Now
                        </Button>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No bookings required for this trip.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleNewTrip} className="w-full">
                Plan a New Trip
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="week" className="mt-4">
          <WeekCalendarView />
        </TabsContent>
        
        <TabsContent value="budget" className="mt-4">
          <BudgetView />
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-4">
          <NotificationsComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);