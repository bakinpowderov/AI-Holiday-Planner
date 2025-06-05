import React, { createContext, useContext, useState, useEffect } from "react";

export type ActivityType = 
  | "hotel" | "b&b" | "hostel" | "culture" | "concert" | "archeology" 
  | "hiking" | "cycling" | "car" | "motorbike" | "swimming" | "water sports" 
  | "sea cruise" | "workshop" | "dining" | "partying" | "pubs" | "gallery" | "networking";

export interface UserProfile {
  interests: ActivityType[];
  energyLevel: "low" | "medium" | "high";
  preferredStartTime: string;
  preferredEndTime: string;
  budget: "budget" | "moderate" | "luxury";
  enableNotifications: boolean;
}

export interface Activity {
  id: string;
  type: ActivityType;
  name: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  isRelaxation?: boolean;
  bookingUrl?: string;
  cost: number;
  currency: string;
  alternatives?: Alternative[];
}

export interface Alternative {
  id: string;
  name: string;
  description: string;
  cost: number;
  savingsPercentage: number;
}

export interface DayPlan {
  date: Date;
  activities: Activity[];
  isAccepted: boolean;
}

export interface Traveler {
  id: string;
  age: number;
  name?: string;
}

export interface TripDetails {
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  travelers: Traveler[];
  dayPlans: DayPlan[];
  totalBudget: number;
  currency: string;
}

interface TripContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  tripDetails: TripDetails;
  setTripDetails: (details: TripDetails) => void;
  currentPlanningDay: number;
  setCurrentPlanningDay: (day: number) => void;
  acceptDayPlan: (index: number) => void;
  resetPlanning: () => void;
  isProfileComplete: boolean;
  isTripDetailsComplete: boolean;
  showWeekView: boolean;
  setShowWeekView: (show: boolean) => void;
  notificationPermission: string;
  requestNotificationPermission: () => Promise<void>;
  pendingNotifications: Notification[];
  dismissNotification: (id: string) => void;
  getRecommendedAlternatives: (activityId: string) => void;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  activityId?: string;
  read: boolean;
}

const defaultTripDetails: TripDetails = {
  destination: "",
  startDate: null,
  endDate: null,
  travelers: [],
  dayPlans: [],
  totalBudget: 0,
  currency: "USD"
};

const defaultUserProfile: UserProfile = {
  interests: [],
  energyLevel: "medium",
  preferredStartTime: "09:00",
  preferredEndTime: "21:00",
  budget: "moderate",
  enableNotifications: true
};

export const TripContext = createContext<TripContextType>({
  currentStep: -1, // Start with welcome screen
  setCurrentStep: () => {},
  userProfile: defaultUserProfile,
  setUserProfile: () => {},
  tripDetails: defaultTripDetails,
  setTripDetails: () => {},
  currentPlanningDay: 0,
  setCurrentPlanningDay: () => {},
  acceptDayPlan: () => {},
  resetPlanning: () => {},
  isProfileComplete: false,
  isTripDetailsComplete: false,
  showWeekView: false,
  setShowWeekView: () => {},
  notificationPermission: "default",
  requestNotificationPermission: async () => {},
  pendingNotifications: [],
  dismissNotification: () => {},
  getRecommendedAlternatives: () => {}
});

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(-1); // Start with welcome screen (-1)
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const [tripDetails, setTripDetails] = useState<TripDetails>(defaultTripDetails);
  const [currentPlanningDay, setCurrentPlanningDay] = useState(0);
  const [showWeekView, setShowWeekView] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [pendingNotifications, setPendingNotifications] = useState<Notification[]>([]);

  // Updated validation logic for new step order
  const isTripDetailsComplete = !!tripDetails.destination && !!tripDetails.startDate && !!tripDetails.endDate && tripDetails.travelers.length > 0;
  const isProfileComplete = userProfile.interests.length > 0;

  // Check notification permission on load
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Set up notification checking
  useEffect(() => {
    if (!userProfile?.enableNotifications) return;
    
    const checkUpcomingActivities = () => {
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
      
      tripDetails.dayPlans.forEach(day => {
        day.activities.forEach(activity => {
          const activityDate = new Date(day.date);
          const [hours, minutes] = activity.startTime.split(':').map(n => parseInt(n));
          activityDate.setHours(hours, minutes);
          
          // If activity starts in 25-35 minutes and we haven't already notified
          const timeDiff = activityDate.getTime() - now.getTime();
          const isUpcoming = timeDiff > 25 * 60 * 1000 && timeDiff < 35 * 60 * 1000;
          
          const alreadyNotified = pendingNotifications.some(
            notif => notif.activityId === activity.id
          );
          
          if (isUpcoming && !alreadyNotified) {
            const newNotification: Notification = {
              id: `${activity.id}-${Date.now()}`,
              title: "Upcoming Activity",
              message: `${activity.name} starts in 30 minutes at ${activity.startTime}`,
              time: now,
              activityId: activity.id,
              read: false
            };
            
            // Add to pending notifications
            setPendingNotifications(prev => [...prev, newNotification]);
            
            // Show browser notification if permitted
            if (notificationPermission === "granted") {
              new Notification(newNotification.title, {
                body: newNotification.message
              });
            }
          }
        });
      });
    };
    
    // Check every minute
    const intervalId = setInterval(checkUpcomingActivities, 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [tripDetails, pendingNotifications, notificationPermission, userProfile?.enableNotifications]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  // Dismiss a notification
  const dismissNotification = (id: string) => {
    setPendingNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Generate empty day plans when start and end dates are set
  useEffect(() => {
    if (tripDetails.startDate && tripDetails.endDate) {
      const start = new Date(tripDetails.startDate);
      const end = new Date(tripDetails.endDate);
      const dayDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      if (dayDiff > 0 && tripDetails.dayPlans.length === 0) {
        const newDayPlans: DayPlan[] = [];
        for (let i = 0; i < dayDiff; i++) {
          const date = new Date(start);
          date.setDate(date.getDate() + i);
          newDayPlans.push({
            date,
            activities: [],
            isAccepted: false
          });
        }
        setTripDetails({ ...tripDetails, dayPlans: newDayPlans });
      }
    }
  }, [tripDetails.startDate, tripDetails.endDate]);

  // Updated validation for new step order
  useEffect(() => {
    // If we're trying to go to the day planning step but don't have the required data
    if (currentStep === 2 && (!isTripDetailsComplete || !isProfileComplete || tripDetails.dayPlans.length === 0)) {
      console.error("Cannot proceed to day planning without complete trip details and profile");
      // Redirect to the appropriate step
      if (!isTripDetailsComplete) {
        setCurrentStep(0); // Go to trip details step (now step 0)
      } else if (!isProfileComplete) {
        setCurrentStep(1); // Go to profile step (now step 1)
      }
    }
  }, [currentStep, isTripDetailsComplete, isProfileComplete, tripDetails.dayPlans]);

  const acceptDayPlan = (index: number) => {
    const updatedDayPlans = [...tripDetails.dayPlans];
    if (updatedDayPlans[index]) {
      updatedDayPlans[index].isAccepted = true;
      setTripDetails({ ...tripDetails, dayPlans: updatedDayPlans });
      
      // If there are more days to plan, move to the next day
      if (index < tripDetails.dayPlans.length - 1) {
        setCurrentPlanningDay(index + 1);
      }
    }
  };

  const resetPlanning = () => {
    setUserProfile(defaultUserProfile);
    setTripDetails(defaultTripDetails);
    setCurrentStep(-1); // Return to welcome screen
    setCurrentPlanningDay(0);
    setPendingNotifications([]);
  };
  
  // Function to get recommended alternatives for an activity
  const getRecommendedAlternatives = (activityId: string) => {
    // This would normally call the AI service, but for now we'll implement it
    // in the mockAIService file and update the tripDetails state with the results
    
    // For demonstration, implementation details will be in the component that uses this
  };

  const value = {
    currentStep,
    setCurrentStep,
    userProfile,
    setUserProfile,
    tripDetails,
    setTripDetails,
    currentPlanningDay,
    setCurrentPlanningDay,
    acceptDayPlan,
    resetPlanning,
    isProfileComplete,
    isTripDetailsComplete,
    showWeekView,
    setShowWeekView,
    notificationPermission,
    requestNotificationPermission,
    pendingNotifications,
    dismissNotification,
    getRecommendedAlternatives
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTrip = () => useContext(TripContext);