import React, { useState, useEffect } from "react";
import { useTrip, Activity, DayPlan } from "../context/TripContext";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { formatDate } from "../utils/dateUtils";
import { Tooltip } from "./ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { CalendarIcon, ClockIcon, MapPinIcon, ArrowLeftIcon, ArrowRightIcon, DollarSignIcon } from "lucide-react";

export const WeekCalendarView: React.FC = () => {
  const { tripDetails } = useTrip();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date | null>(null);
  const [days, setDays] = useState<Date[]>([]);
  const hourLabels = Array.from({ length: 16 }, (_, i) => (i + 6).toString().padStart(2, '0') + ':00');
  
  // Initialize the current week to the trip start date
  useEffect(() => {
    if (tripDetails.startDate) {
      setCurrentWeekStart(new Date(tripDetails.startDate));
    }
  }, [tripDetails.startDate]);
  
  // Update days of the week when currentWeekStart changes
  useEffect(() => {
    if (currentWeekStart) {
      const weekDays: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(currentWeekStart);
        day.setDate(day.getDate() + i);
        weekDays.push(day);
      }
      setDays(weekDays);
    }
  }, [currentWeekStart]);
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    if (currentWeekStart) {
      const newStart = new Date(currentWeekStart);
      newStart.setDate(newStart.getDate() - 7);
      setCurrentWeekStart(newStart);
    }
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    if (currentWeekStart) {
      const newStart = new Date(currentWeekStart);
      newStart.setDate(newStart.getDate() + 7);
      setCurrentWeekStart(newStart);
    }
  };
  
  // Find activities for a specific day
  const getActivitiesForDay = (date: Date): Activity[] => {
    const dayPlan = tripDetails.dayPlans.find(plan => {
      const planDate = new Date(plan.date);
      return planDate.getDate() === date.getDate() && 
             planDate.getMonth() === date.getMonth() && 
             planDate.getFullYear() === date.getFullYear();
    });
    
    return dayPlan?.activities || [];
  };
  
  // Get position and height for an activity in the grid
  const getActivityStyle = (activity: Activity): React.CSSProperties => {
    // Convert time to position
    const [startHour, startMinute] = activity.startTime.split(':').map(n => parseInt(n));
    const [endHour, endMinute] = activity.endTime.split(':').map(n => parseInt(n));
    
    // Calculate top position (hours since 6am)
    const topPosition = (startHour - 6) * 60 + startMinute;
    
    // Calculate height (duration in minutes)
    const duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    
    // Return styles (1 hour = 60px height)
    return {
      position: 'absolute',
      top: `${topPosition}px`,
      height: `${duration}px`,
      width: '90%',
      left: '5%',
      overflow: 'hidden',
      borderRadius: '4px',
      padding: '4px',
      fontSize: '12px',
      zIndex: 10
    };
  };
  
  // Get background color for an activity based on type
  const getActivityColor = (activity: Activity): string => {
    const colorMap: Record<string, string> = {
      "hotel": "bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700",
      "b&b": "bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700",
      "hostel": "bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700",
      "culture": "bg-purple-100 border-purple-300 dark:bg-purple-900 dark:border-purple-700",
      "concert": "bg-pink-100 border-pink-300 dark:bg-pink-900 dark:border-pink-700",
      "archeology": "bg-amber-100 border-amber-300 dark:bg-amber-900 dark:border-amber-700",
      "hiking": "bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700",
      "cycling": "bg-lime-100 border-lime-300 dark:bg-lime-900 dark:border-lime-700",
      "car": "bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700",
      "motorbike": "bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700",
      "swimming": "bg-cyan-100 border-cyan-300 dark:bg-cyan-900 dark:border-cyan-700",
      "water sports": "bg-cyan-100 border-cyan-300 dark:bg-cyan-900 dark:border-cyan-700",
      "sea cruise": "bg-sky-100 border-sky-300 dark:bg-sky-900 dark:border-sky-700",
      "workshop": "bg-orange-100 border-orange-300 dark:bg-orange-900 dark:border-orange-700",
      "dining": "bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700",
      "partying": "bg-violet-100 border-violet-300 dark:bg-violet-900 dark:border-violet-700",
      "pubs": "bg-amber-100 border-amber-300 dark:bg-amber-900 dark:border-amber-700",
      "gallery": "bg-indigo-100 border-indigo-300 dark:bg-indigo-900 dark:border-indigo-700",
      "networking": "bg-emerald-100 border-emerald-300 dark:bg-emerald-900 dark:border-emerald-700"
    };
    
    return activity.isRelaxation 
      ? "bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600 border border-dashed" 
      : colorMap[activity.type] || "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-700";
  };
  
  if (!currentWeekStart || days.length === 0) {
    return <div>Loading calendar...</div>;
  }
  
  return (
    <div className="w-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">
          Week of {formatDate(currentWeekStart, 'medium')}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            Next <ArrowRightIcon className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      <div className="bg-card rounded-lg overflow-hidden border">
        {/* Header with day names */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-2 text-center font-medium border-r"></div>
          {days.map((day, index) => (
            <div 
              key={index} 
              className={`p-2 text-center font-medium border-r ${
                day.getDay() === 0 || day.getDay() === 6 ? 'bg-muted/50' : ''
              }`}
            >
              <div>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}</div>
              <div className="text-sm text-muted-foreground">{day.getDate()}</div>
            </div>
          ))}
        </div>
        
        {/* Calendar grid with time slots */}
        <div className="relative grid grid-cols-8">
          {/* Time labels */}
          <div className="border-r">
            {hourLabels.map((hour, index) => (
              <div 
                key={index} 
                className="text-xs text-right pr-2 h-[60px] border-b"
                style={{ paddingTop: '2px' }}
              >
                {hour}
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {days.map((day, dayIndex) => (
            <div 
              key={dayIndex} 
              className={`border-r relative ${
                day.getDay() === 0 || day.getDay() === 6 ? 'bg-muted/30' : ''
              }`}
            >
              {/* Hour grid lines */}
              {hourLabels.map((_, hourIndex) => (
                <div 
                  key={hourIndex} 
                  className="h-[60px] border-b"
                />
              ))}
              
              {/* Activities for this day */}
              {getActivitiesForDay(day).map((activity, actIndex) => (
                <TooltipProvider key={actIndex}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={`${getActivityColor(activity)} cursor-pointer shadow-sm`}
                        style={getActivityStyle(activity)}
                      >
                        <div className="font-medium truncate text-xs">
                          {activity.name}
                        </div>
                        <div className="text-xs truncate">
                          {activity.startTime} - {activity.endTime}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[300px] p-0">
                      <Card>
                        <CardContent className="p-3">
                          <div className="font-medium mb-1">{activity.name}</div>
                          <div className="text-sm text-muted-foreground mb-2">{activity.description}</div>
                          <div className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" /> 
                              {activity.startTime} - {activity.endTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPinIcon className="h-3 w-3" /> 
                              {activity.location}
                            </div>
                            {activity.cost > 0 && (
                              <div className="flex items-center gap-1">
                                <DollarSignIcon className="h-3 w-3" /> 
                                {activity.cost} {activity.currency}
                              </div>
                            )}
                          </div>
                          <div className="mt-2">
                            <Badge 
                              variant={activity.isRelaxation ? "outline" : "secondary"}
                              className="text-xs"
                            >
                              {activity.type}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};