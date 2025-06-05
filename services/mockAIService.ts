import { Activity, UserProfile, ActivityType, Alternative, Traveler } from "../context/TripContext";

// Helper function to generate a random ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Helper function to generate a random time between start and end
const getRandomTime = (start: string, end: string): string => {
  const [startHour, startMinute] = start.split(':').map(n => parseInt(n));
  const [endHour, endMinute] = end.split(':').map(n => parseInt(n));
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  const randomMinutes = Math.floor(Math.random() * (endMinutes - startMinutes)) + startMinutes;
  const hour = Math.floor(randomMinutes / 60);
  const minute = randomMinutes % 60;
  
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

// Helper function to get random duration for an activity type
const getActivityDuration = (type: ActivityType): number => {
  const durations: Record<ActivityType, [number, number]> = {
    "hotel": [60, 120],
    "b&b": [60, 120],
    "hostel": [60, 120],
    "culture": [90, 180],
    "concert": [120, 240],
    "archeology": [120, 240],
    "hiking": [120, 480],
    "cycling": [120, 360],
    "car": [60, 120],
    "motorbike": [60, 120],
    "swimming": [60, 180],
    "water sports": [120, 240],
    "sea cruise": [180, 480],
    "workshop": [120, 240],
    "dining": [60, 180],
    "partying": [180, 360],
    "pubs": [120, 240],
    "gallery": [60, 120],
    "networking": [60, 180]
  };
  
  const [min, max] = durations[type];
  return Math.floor(Math.random() * (max - min)) + min;
};

// Helper function to get activity cost range based on type and budget
const getActivityCost = (type: ActivityType, budget: string): number => {
  const costRanges: Record<ActivityType, Record<string, [number, number]>> = {
    "hotel": { "budget": [50, 100], "moderate": [120, 250], "luxury": [300, 800] },
    "b&b": { "budget": [40, 80], "moderate": [90, 180], "luxury": [200, 400] },
    "hostel": { "budget": [20, 50], "moderate": [60, 120], "luxury": [130, 250] },
    "culture": { "budget": [5, 20], "moderate": [25, 50], "luxury": [60, 150] },
    "concert": { "budget": [20, 50], "moderate": [60, 150], "luxury": [200, 500] },
    "archeology": { "budget": [10, 30], "moderate": [35, 80], "luxury": [90, 200] },
    "hiking": { "budget": [0, 10], "moderate": [15, 60], "luxury": [70, 200] },
    "cycling": { "budget": [10, 30], "moderate": [40, 100], "luxury": [120, 300] },
    "car": { "budget": [30, 70], "moderate": [80, 150], "luxury": [200, 500] },
    "motorbike": { "budget": [20, 50], "moderate": [60, 120], "luxury": [150, 350] },
    "swimming": { "budget": [0, 15], "moderate": [20, 50], "luxury": [60, 150] },
    "water sports": { "budget": [30, 80], "moderate": [90, 200], "luxury": [250, 600] },
    "sea cruise": { "budget": [50, 150], "moderate": [200, 500], "luxury": [600, 2000] },
    "workshop": { "budget": [20, 60], "moderate": [70, 150], "luxury": [200, 500] },
    "dining": { "budget": [15, 40], "moderate": [50, 120], "luxury": [150, 400] },
    "partying": { "budget": [20, 70], "moderate": [80, 200], "luxury": [250, 600] },
    "pubs": { "budget": [15, 50], "moderate": [60, 120], "luxury": [150, 300] },
    "gallery": { "budget": [5, 20], "moderate": [25, 60], "luxury": [70, 150] },
    "networking": { "budget": [0, 20], "moderate": [30, 80], "luxury": [100, 250] }
  };
  
  // Ensure we have a valid budget value (default to "moderate" if not found)
  const budgetKey = (budget || "moderate").toLowerCase();
  const validBudget = ["budget", "moderate", "luxury"].includes(budgetKey) ? budgetKey : "moderate";
  
  const [min, max] = costRanges[type][validBudget];
  return Math.floor(Math.random() * (max - min)) + min;
};

// Helper function to check if activity is suitable for travelers
const isActivitySuitableForTravelers = (activityType: ActivityType, travelers: Traveler[]): boolean => {
  const ages = travelers.map(t => t.age);
  const hasChildren = ages.some(age => age < 18);
  const hasYoungChildren = ages.some(age => age < 8);
  const hasElderly = ages.some(age => age > 65);
  
  // Activities not suitable for young children
  const notForYoungChildren: ActivityType[] = ["partying", "pubs", "concert"];
  if (hasYoungChildren && notForYoungChildren.includes(activityType)) {
    return Math.random() > 0.8; // Very low chance
  }
  
  // Activities not suitable for children
  const notForChildren: ActivityType[] = ["partying", "pubs"];
  if (hasChildren && notForChildren.includes(activityType)) {
    return Math.random() > 0.6; // Low chance
  }
  
  // Activities that might be challenging for elderly
  const challengingForElderly: ActivityType[] = ["hiking", "cycling", "water sports"];
  if (hasElderly && challengingForElderly.includes(activityType)) {
    return Math.random() > 0.4; // Moderate chance
  }
  
  return true;
};

// Helper function to get family-friendly activity alternatives
const getFamilyFriendlyAlternatives = (originalType: ActivityType, travelers: Traveler[]): ActivityType[] => {
  const hasChildren = travelers.some(t => t.age < 18);
  
  if (!hasChildren) return [originalType];
  
  const familyFriendlyMap: Record<ActivityType, ActivityType[]> = {
    "partying": ["dining", "gallery", "culture"],
    "pubs": ["dining", "culture", "gallery"],
    "concert": ["culture", "gallery", "workshop"],
    "hiking": ["culture", "gallery", "swimming"],
    "water sports": ["swimming", "culture", "gallery"],
    "archeology": ["culture", "gallery", "workshop"],
    "culture": ["culture", "gallery", "workshop"],
    "gallery": ["culture", "gallery", "workshop"],
    "workshop": ["culture", "gallery", "workshop"],
    "dining": ["dining", "culture", "gallery"],
    "swimming": ["swimming", "culture", "gallery"],
    "cycling": ["culture", "gallery", "swimming"],
    "car": ["culture", "gallery", "dining"],
    "motorbike": ["culture", "gallery", "dining"],
    "sea cruise": ["culture", "gallery", "dining"],
    "hotel": ["hotel"],
    "b&b": ["b&b"],
    "hostel": ["hostel"],
    "networking": ["culture", "gallery", "dining"]
  };
  
  return familyFriendlyMap[originalType] || [originalType];
};

// Generate one day's plan options (3 different options)
export const generateDayPlanOptions = (
  date: Date, 
  userProfile: UserProfile, 
  destination: string,
  travelers: Traveler[] = []
): Activity[][] => {
  // Default fallback options in case of errors
  const fallbackOptions: Activity[][] = [
    [createFallbackActivity(destination, "09:00", "12:00", travelers)],
    [createFallbackActivity(destination, "10:00", "13:00", travelers)],
    [createFallbackActivity(destination, "11:00", "14:00", travelers)]
  ];

  // Safety check - if required inputs are missing, return fallback
  if (!userProfile || !userProfile.interests || userProfile.interests.length === 0 || !destination) {
    console.error("Missing required inputs for generating day plan options");
    return fallbackOptions;
  }

  try {
    const options: Activity[][] = [];
    
    // Generate 3 different options
    for (let i = 0; i < 3; i++) {
      const activities: Activity[] = [];
      const availableTimeSlots: [string, string][] = [];
      
      // Start and end time from user preferences, with fallbacks
      const startTime = userProfile.preferredStartTime || "09:00";
      const endTime = userProfile.preferredEndTime || "21:00";
      
      // Create initial time slot
      availableTimeSlots.push([startTime, endTime]);
      
      // Determine how many activities to generate based on energy level
      const energyLevelMap: Record<string, number> = {
        "low": 2,
        "medium": 3,
        "high": 5
      };
      let activityCount = energyLevelMap[userProfile.energyLevel || "medium"];
      
      // Adjust activity count based on travelers (fewer activities with young children)
      if (travelers.some(t => t.age < 8)) {
        activityCount = Math.max(1, activityCount - 1);
      }
      
      // Create a filtered list of interests suitable for the group
      const suitableInterests = userProfile.interests.filter(interest => 
        isActivitySuitableForTravelers(interest, travelers)
      );
      
      // If no suitable interests, use family-friendly alternatives
      let interestsToUse = suitableInterests.length > 0 ? suitableInterests : 
        userProfile.interests.flatMap(interest => getFamilyFriendlyAlternatives(interest, travelers));
      
      // Add activities based on suitable interests
      for (let j = 0; j < activityCount; j++) {
        // Select a random interest
        if (interestsToUse.length === 0) break;
        
        const interestIndex = Math.floor(Math.random() * interestsToUse.length);
        const activityType = interestsToUse[interestIndex];
        
        // Find a suitable time slot
        if (availableTimeSlots.length === 0) break;
        
        const slotIndex = Math.floor(Math.random() * availableTimeSlots.length);
        const [slotStart, slotEnd] = availableTimeSlots[slotIndex];
        
        // Remove the selected slot
        availableTimeSlots.splice(slotIndex, 1);
        
        // Calculate activity duration (shorter for groups with children)
        let durationMinutes = getActivityDuration(activityType);
        if (travelers.some(t => t.age < 12)) {
          durationMinutes = Math.round(durationMinutes * 0.75); // 25% shorter
        }
        
        // Convert slot times to minutes
        const [startHour, startMinute] = slotStart.split(':').map(n => parseInt(n));
        const [endHour, endMinute] = slotEnd.split(':').map(n => parseInt(n));
        
        const slotStartMinutes = startHour * 60 + startMinute;
        const slotEndMinutes = endHour * 60 + endMinute;
        
        // If slot is too small for this activity, continue to next
        if (slotEndMinutes - slotStartMinutes < durationMinutes) {
          // Put the slot back if we can't use it
          availableTimeSlots.push([slotStart, slotEnd]);
          continue;
        }
        
        // Generate random start time within the slot
        const maxStartTime = slotEndMinutes - durationMinutes;
        let activityStartMinutes = Math.floor(Math.random() * (maxStartTime - slotStartMinutes + 1)) + slotStartMinutes;
        
        // Round to nearest 15 minutes
        activityStartMinutes = Math.round(activityStartMinutes / 15) * 15;
        
        // Calculate end time
        const activityEndMinutes = activityStartMinutes + durationMinutes;
        
        // Convert back to string format
        const activityStartHour = Math.floor(activityStartMinutes / 60);
        const activityStartMin = activityStartMinutes % 60;
        const activityEndHour = Math.floor(activityEndMinutes / 60);
        const activityEndMin = activityEndMinutes % 60;
        
        const activityStart = `${activityStartHour.toString().padStart(2, '0')}:${activityStartMin.toString().padStart(2, '0')}`;
        const activityEnd = `${activityEndHour.toString().padStart(2, '0')}:${activityEndMin.toString().padStart(2, '0')}`;
        
        // Create new time slots before and after this activity
        if (slotStartMinutes < activityStartMinutes) {
          const newStartSlot = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
          const newEndSlot = activityStart;
          availableTimeSlots.push([newStartSlot, newEndSlot]);
        }
        
        if (activityEndMinutes < slotEndMinutes) {
          const newStartSlot = activityEnd;
          const newEndSlot = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
          availableTimeSlots.push([newStartSlot, newEndSlot]);
        }
        
        // Calculate cost (multiply by number of travelers, with discounts for children)
        const baseCost = getActivityCost(activityType, userProfile.budget || "moderate");
        const travelerCost = travelers.reduce((total, traveler) => {
          if (traveler.age < 4) return total; // Free for very young children
          if (traveler.age < 12) return total + (baseCost * 0.5); // 50% for children
          if (traveler.age < 18) return total + (baseCost * 0.75); // 25% discount for teens
          if (traveler.age > 65) return total + (baseCost * 0.9); // 10% senior discount
          return total + baseCost;
        }, 0);
        
        // Generate some alternative options with lower costs
        const alternatives: Alternative[] = [];
        
        if (travelerCost > 50) {
          // Create 1-2 alternatives with progressively lower costs
          const altCount = Math.floor(Math.random() * 2) + 1;
          
          for (let k = 0; k < altCount; k++) {
            const savingsPercentage = Math.floor(Math.random() * 30) + 20; // 20-50% savings
            const altCost = Math.round(travelerCost * (1 - savingsPercentage / 100));
            
            alternatives.push({
              id: generateId(),
              name: `Family-friendly ${activityType} option ${k+1}`,
              description: `A more budget-friendly ${activityType} option suitable for your group in ${destination}.`,
              cost: altCost,
              savingsPercentage: savingsPercentage
            });
          }
        }
        
        // Add activity
        activities.push({
          id: generateId(),
          type: activityType,
          name: generateActivityName(activityType, destination, travelers),
          description: generateActivityDescription(activityType, destination, travelers),
          location: generateLocation(destination),
          startTime: activityStart,
          endTime: activityEnd,
          isRelaxation: false,
          bookingUrl: Math.random() > 0.6 ? `https://example.com/book/${generateId()}` : undefined,
          cost: Math.round(travelerCost),
          currency: "USD",
          alternatives: alternatives
        });
      }
      
      // Add relaxation periods between activities if there are time gaps
      if (activities.length > 0) {
        // Sort activities by start time
        activities.sort((a, b) => {
          const aTime = a.startTime.split(':').map(n => parseInt(n));
          const bTime = b.startTime.split(':').map(n => parseInt(n));
          
          return aTime[0] * 60 + aTime[1] - (bTime[0] * 60 + bTime[1]);
        });
        
        // Find gaps between activities
        const relaxationActivities: Activity[] = [];
        let lastEndTime = startTime;
        
        for (const activity of activities) {
          if (activity.startTime > lastEndTime) {
            // There's a gap, add relaxation
            relaxationActivities.push({
              id: generateId(),
              type: "hotel",
              name: travelers.some(t => t.age < 12) ? "Family Rest Time" : "Rest & Relaxation",
              description: travelers.some(t => t.age < 12) ? 
                "Take some time to relax and let the kids recharge." :
                "Take some time to relax and recharge.",
              location: "At your accommodation or nearby",
              startTime: lastEndTime,
              endTime: activity.startTime,
              isRelaxation: true,
              cost: 0,
              currency: "USD"
            });
          }
          
          lastEndTime = activity.endTime;
        }
        
        // Check if there's time after the last activity
        if (lastEndTime < endTime) {
          relaxationActivities.push({
            id: generateId(),
            type: "hotel",
            name: travelers.some(t => t.age < 12) ? "Family Evening Time" : "Evening Relaxation",
            description: travelers.some(t => t.age < 12) ? 
              "Wind down after your day with some family time." :
              "Wind down after your day of activities.",
            location: "At your accommodation or nearby",
            startTime: lastEndTime,
            endTime: endTime,
            isRelaxation: true,
            cost: 0,
            currency: "USD"
          });
        }
        
        // Add relaxation activities to the list
        activities.push(...relaxationActivities);
        
        // Sort again by start time
        activities.sort((a, b) => {
          const aTime = a.startTime.split(':').map(n => parseInt(n));
          const bTime = b.startTime.split(':').map(n => parseInt(n));
          
          return aTime[0] * 60 + aTime[1] - (bTime[0] * 60 + bTime[1]);
        });
      }
      
      // If no activities were generated, create a default one
      if (activities.length === 0) {
        activities.push(createFallbackActivity(destination, startTime, endTime, travelers));
      }
      
      options.push(activities);
    }
    
    // Make sure we always return 3 options
    while (options.length < 3) {
      const index = options.length;
      options.push(fallbackOptions[index]);
    }
    
    return options;
  } catch (error) {
    console.error("Error generating day plan options:", error);
    return fallbackOptions;
  }
};

// Create a fallback activity for when generation fails
function createFallbackActivity(destination: string, startTime: string, endTime: string, travelers: Traveler[] = []): Activity {
  const hasChildren = travelers.some(t => t.age < 18);
  
  return {
    id: generateId(),
    type: "culture",
    name: hasChildren ? `Family-friendly exploration of ${destination}` : `Explore ${destination}`,
    description: hasChildren ? 
      `Take some time to explore the family-friendly highlights of ${destination} at your own pace.` :
      `Take some time to explore the highlights of ${destination} at your own pace.`,
    location: `Downtown ${destination}`,
    startTime,
    endTime,
    isRelaxation: false,
    cost: 0,
    currency: "USD"
  };
}

// Helper functions to generate random names, descriptions, and locations
const generateActivityName = (type: ActivityType, destination: string, travelers: Traveler[] = []): string => {
  const hasChildren = travelers.some(t => t.age < 18);
  const hasYoungChildren = travelers.some(t => t.age < 8);
  
  const namesByType: Record<ActivityType, string[]> = {
    "hotel": ["Relaxation at Hotel", "Hotel Amenities", "Spa & Wellness"],
    "b&b": ["B&B Breakfast", "Cottage Rest", "Homely Stay"],
    "hostel": ["Hostel Social Hour", "Backpackers Meet", "Community Lounge"],
    "culture": hasChildren ? 
      [`Family Visit to ${destination} Museum`, "Interactive Cultural Center", "Kid-friendly Heritage Site"] :
      [`${destination} Museum Visit`, "Cultural Center Tour", "Heritage Site Exploration"],
    "concert": hasChildren ? 
      ["Family Concert", "Children's Musical Show", "Family Entertainment"] :
      ["Live Music Show", "Evening Concert", "Musical Performance"],
    "archeology": hasChildren ?
      ["Family Archaeological Discovery", "Interactive History Tour", "Ancient Sites for Families"] :
      ["Ancient Ruins Tour", "Archaeological Dig", "Historical Site Visit"],
    "hiking": hasChildren ?
      ["Family Nature Walk", "Easy Trail for Families", "Kid-friendly Nature Exploration"] :
      ["Nature Trail Hike", "Mountain Exploration", "Scenic Trail Walk"],
    "cycling": hasChildren ?
      ["Family Bike Ride", "Easy Cycling Path", "Bike Tour for Families"] :
      ["Bike Tour", "Cycling Adventure", "City Bike Exploration"],
    "car": ["Scenic Drive", "Road Trip", "Countryside Drive"],
    "motorbike": ["Motorbike Adventure", "Scooter Tour", "Bike Rental"],
    "swimming": hasYoungChildren ?
      ["Family Pool Time", "Shallow Water Swimming", "Kids Swimming Area"] :
      hasChildren ? ["Family Beach Day", "Family Pool Activity", "Swimming for All Ages"] :
      ["Beach Swim", "Pool Time", "Ocean Dip"],
    "water sports": hasChildren ?
      ["Family Water Activities", "Gentle Water Sports", "Water Fun for Families"] :
      ["Kayaking Adventure", "Paddle Boarding", "Jet Ski Rental"],
    "sea cruise": hasChildren ?
      ["Family Boat Trip", "Family-friendly Cruise", "Scenic Boat Tour for All"] :
      ["Harbor Cruise", "Sunset Boat Tour", "Island Hopping Trip"],
    "workshop": hasChildren ?
      ["Family Craft Workshop", "Kids & Parents Workshop", "Family Art Activity"] :
      ["Local Craft Workshop", "Cooking Class", "Art Workshop"],
    "dining": hasChildren ?
      ["Family Restaurant Experience", "Kid-friendly Dining", "Family Meal Out"] :
      ["Local Cuisine Experience", "Gourmet Dinner", "Food Tasting"],
    "partying": ["Family Entertainment", "Evening Activities", "Local Festivities"],
    "pubs": hasChildren ? 
      ["Family Restaurant", "Casual Family Dining", "Local Eatery"] :
      ["Local Pub Crawl", "Craft Beer Tasting", "Evening at Irish Pub"],
    "gallery": hasChildren ?
      ["Interactive Art Gallery", "Family Art Experience", "Art Gallery for All Ages"] :
      ["Art Gallery Visit", "Photography Exhibition", "Modern Art Tour"],
    "networking": hasChildren ?
      ["Family Community Event", "Local Family Gathering", "Community Activities"] :
      ["Local Meetup", "Travel Community Event", "Social Gathering"]
  };
  
  const options = namesByType[type];
  return options[Math.floor(Math.random() * options.length)];
};

const generateActivityDescription = (type: ActivityType, destination: string, travelers: Traveler[] = []): string => {
  const hasChildren = travelers.some(t => t.age < 18);
  const hasYoungChildren = travelers.some(t => t.age < 8);
  
  const descriptionsByType: Record<ActivityType, string[]> = {
    "hotel": [
      "Enjoy some downtime at your accommodation with all amenities at your disposal.",
      "Take advantage of your hotel's facilities to rest and recharge.",
      "Relax and unwind at your accommodation before your next adventure."
    ],
    "b&b": [
      "Experience the charm and comfort of your B&B with personalized service.",
      "Enjoy the homely atmosphere and local insights from your B&B hosts.",
      "Take time to appreciate the unique character of your bed and breakfast."
    ],
    "hostel": [
      "Connect with fellow travelers in the communal spaces of your hostel.",
      "Join in social activities organized by your hostel.",
      "Use the hostel's facilities and meet new friends from around the world."
    ],
    "culture": hasChildren ? [
      `Explore ${destination}'s rich cultural heritage with interactive exhibits perfect for families.`,
      "Immerse your family in local history and traditions at this family-friendly cultural venue.",
      "Gain insights into the region's cultural significance with hands-on displays kids will love."
    ] : [
      `Explore ${destination}'s rich cultural heritage through exhibits and guided tours.`,
      "Immerse yourself in local history and traditions at this cultural venue.",
      "Gain insights into the region's cultural significance with informative displays."
    ],
    "concert": hasChildren ? [
      "Experience family-friendly live music in a welcoming venue suitable for all ages.",
      "Enjoy an afternoon of musical entertainment designed for families.",
      "Listen to performances that capture the essence of local culture in a family setting."
    ] : [
      "Experience live music in a vibrant venue showcasing local or international talent.",
      "Enjoy an evening of musical entertainment in an atmospheric setting.",
      "Listen to performances that capture the essence of the local music scene."
    ],
    "archeology": hasChildren ? [
      "Step back in time as your family explores ancient ruins with engaging, educational activities.",
      "Discover the historical significance of this site through family-friendly guided tours.",
      "Learn about ancient civilizations through interactive displays and kid-friendly explanations."
    ] : [
      "Step back in time as you explore ancient ruins and archaeological treasures.",
      "Discover the historical significance of this well-preserved archaeological site.",
      "Learn about ancient civilizations through expert guides and informative displays."
    ],
    "hiking": hasChildren ? [
      "Take a gentle family walk through beautiful natural landscapes with easy trails.",
      "Follow well-marked, family-friendly paths through diverse terrain and scenic vistas.",
      "Connect with nature on this easy hiking experience perfect for families."
    ] : [
      "Trek through beautiful natural landscapes with breathtaking views.",
      "Follow well-marked trails through diverse terrain and scenic vistas.",
      "Connect with nature on this rejuvenating hiking experience."
    ],
    "cycling": hasChildren ? [
      "Explore the region on family bikes, covering scenic routes at a comfortable pace.",
      "Pedal through easy routes specially selected for families with children.",
      "Enjoy the freedom of family cycling through safe, picturesque landscapes."
    ] : [
      "Explore the region on two wheels, covering more ground than on foot.",
      "Pedal through scenic routes specially selected for cyclists of all levels.",
      "Enjoy the freedom of cycling through picturesque landscapes and hidden gems."
    ],
    "car": [
      "Take control of your sightseeing with a flexible self-drive experience.",
      "Enjoy the convenience of your own vehicle to explore off-the-beaten-path locations.",
      "Cover more ground with a rental car perfect for day trips and scenic drives."
    ],
    "motorbike": [
      "Feel the thrill of exploring on a motorbike or scooter, perfect for navigating narrow streets.",
      "Enjoy the freedom and flexibility of having your own two-wheeled transport.",
      "Discover hidden corners of the region that are inaccessible to larger vehicles."
    ],
    "swimming": hasChildren ? [
      "Cool off with a refreshing family swim in safe, supervised waters.",
      "Relax at a family-friendly beach or pool with amenities for children.",
      "Enjoy aquatic activities in a safe environment perfect for families."
    ] : [
      "Cool off with a refreshing swim in crystal clear waters.",
      "Relax on the beach or by the pool with time for swimming at your leisure.",
      "Enjoy aquatic activities in a safe and scenic environment."
    ],
    "water sports": hasChildren ? [
      "Try gentle water-based activities suitable for families with supervision provided.",
      "Experience family-friendly water adventures with equipment sized for all ages.",
      "Enjoy safe water activities designed for families and beginners."
    ] : [
      "Get your adrenaline pumping with exciting water-based activities.",
      "Try your hand at popular water sports with equipment and instruction provided.",
      "Experience the thrill of water adventures suitable for all skill levels."
    ],
    "sea cruise": hasChildren ? [
      "Set sail on a family-friendly boat journey with spectacular views and kid-friendly amenities.",
      "Cruise along the coastline with family facilities and activities for children.",
      "Enjoy a different perspective of the landscape from a comfortable, family-oriented boat."
    ] : [
      "Set sail on a memorable boat journey with spectacular views from the water.",
      "Cruise along the coastline or to nearby islands with onboard amenities.",
      "Enjoy a different perspective of the landscape from the comfort of a boat."
    ],
    "workshop": hasChildren ? [
      "Learn new skills together as a family from local experts in a hands-on environment.",
      "Create something unique for the whole family to take home as a trip memento.",
      "Immerse your family in local crafts and traditions through practical, fun experiences."
    ] : [
      "Learn new skills from local experts in a hands-on workshop environment.",
      "Create something unique to take home as a memento of your trip.",
      "Immerse yourself in local crafts and traditions through practical experience."
    ],
    "dining": hasChildren ? [
      "Savor family-friendly local cuisine in a welcoming restaurant with options for all ages.",
      "Indulge in regional specialties at a restaurant that caters to families.",
      "Experience the culinary highlights suitable for the whole family to enjoy."
    ] : [
      "Savor the flavors of local cuisine in a carefully selected restaurant.",
      "Indulge in regional specialties prepared with authentic recipes and fresh ingredients.",
      "Experience the culinary highlights of the destination with each carefully crafted dish."
    ],
    "partying": hasChildren ? [
      "Experience family-friendly local entertainment with music and activities for all ages.",
      "Join in community festivities that welcome families and children.",
      "Enjoy an evening of family entertainment in a lively but appropriate atmosphere."
    ] : [
      "Experience the local nightlife scene with music, dancing, and entertainment.",
      "Join the festivities at popular venues where both locals and tourists gather.",
      "Enjoy an evening of fun and celebration in a vibrant atmosphere."
    ],
    "pubs": hasChildren ? [
      "Visit family restaurants where you can sample local food in a welcoming environment.",
      "Experience local dining culture at establishments that welcome families.",
      "Relax in family-friendly venues that showcase local culinary traditions."
    ] : [
      "Visit traditional pubs where you can sample local beverages and meet residents.",
      "Experience the authentic pub culture with a selection of drinks and casual atmosphere.",
      "Relax in characterful establishments that showcase local brewing traditions."
    ],
    "gallery": hasChildren ? [
      "Appreciate artistic expressions through family-friendly exhibitions and interactive displays.",
      "Explore art in well-designed spaces with activities and programs for children.",
      "Gain cultural insights through creative works with explanations suitable for all ages."
    ] : [
      "Appreciate artistic expressions through curated collections of visual arts.",
      "Explore contemporary or classical art in well-designed exhibition spaces.",
      "Gain cultural insights through the lens of creative works by local and international artists."
    ],
    "networking": hasChildren ? [
      "Connect with local families and other travelers in a family-friendly social setting.",
      "Participate in community events designed for families to meet and interact.",
      "Exchange travel experiences with other families while kids can play together."
    ] : [
      "Connect with like-minded travelers and locals in a social setting.",
      "Participate in organized events designed to facilitate meaningful interactions.",
      "Exchange experiences and tips with others while making new connections."
    ]
  };
  
  const options = descriptionsByType[type];
  return options[Math.floor(Math.random() * options.length)];
};

const generateLocation = (destination: string): string => {
  const locations = [
    `Downtown ${destination}`,
    `${destination} Old Town`,
    `${destination} Marina`,
    `${destination} Cultural District`,
    `North ${destination}`,
    `${destination} Park Area`,
    `${destination} Beach Front`,
    `Central ${destination}`,
    `${destination} Historic Quarter`,
    `${destination} Shopping District`
  ];
  
  return locations[Math.floor(Math.random() * locations.length)];
};

// Generate AI alternatives for budget optimization
export const generateCheaperAlternatives = (activity: Activity): Alternative[] => {
  if (activity.isRelaxation || activity.cost < 30) return [];
  
  const alternatives: Alternative[] = [];
  const baseCount = Math.floor(Math.random() * 2) + 1; // 1-2 alternatives
  
  for (let i = 0; i < baseCount; i++) {
    const savingsPercentage = Math.floor(Math.random() * 30) + 20; // 20-50% savings
    const altCost = Math.round(activity.cost * (1 - savingsPercentage / 100));
    
    alternatives.push({
      id: generateId(),
      name: getAlternativeName(activity.type, i),
      description: getAlternativeDescription(activity.type, savingsPercentage),
      cost: altCost,
      savingsPercentage: savingsPercentage
    });
  }
  
  return alternatives;
};

const getAlternativeName = (type: ActivityType, index: number): string => {
  const alternativesByType: Record<ActivityType, string[]> = {
    "hotel": ["Budget Accommodation", "Shared Room Option", "Off-season Special"],
    "b&b": ["Simple B&B Stay", "Room-only Option", "Weekly Rate Package"],
    "hostel": ["Dormitory Bed", "Shared Facilities Option", "Off-peak Booking"],
    "culture": ["Self-guided Tour", "Group Visit Discount", "Evening Admission Special"],
    "concert": ["Standing Room Ticket", "Preview Night Show", "Last-minute Booking"],
    "archeology": ["Group Tour Option", "Self-guided Exploration", "Off-peak Visit"],
    "hiking": ["Self-guided Trail", "Group Hike Discount", "Local Trail Alternative"],
    "cycling": ["Shared Bike Rental", "Short Route Option", "Group Cycling Discount"],
    "car": ["Economy Car Option", "Shared Ride Service", "Public Transport Alternative"],
    "motorbike": ["Smaller Scooter Rental", "Half-day Rental", "Group Discount"],
    "swimming": ["Public Beach Access", "Community Pool Option", "Off-peak Swimming"],
    "water sports": ["Group Lesson Discount", "Equipment-only Rental", "Shore-based Alternative"],
    "sea cruise": ["Group Tour Discount", "Shorter Route Option", "Public Ferry Alternative"],
    "workshop": ["Group Class Discount", "Digital Workshop Option", "Materials-included Package"],
    "dining": ["Lunch Menu Special", "Local Eatery Alternative", "Early Bird Discount"],
    "partying": ["Early Admission Discount", "Weekday Special", "Local Venue Alternative"],
    "pubs": ["Happy Hour Timing", "Beer Flight Sampler", "Local Tavern Alternative"],
    "gallery": ["Free Exhibition Option", "Guided Group Tour", "Digital Experience"],
    "networking": ["Free Community Event", "Digital Meetup Option", "Local Gathering"]
  };
  
  const options = alternativesByType[type];
  return options[index % options.length];
};

const getAlternativeDescription = (type: ActivityType, savingsPercentage: number): string => {
  const descriptions = [
    `Save ${savingsPercentage}% with this more affordable option that still provides a great experience.`,
    `A budget-friendly alternative that cuts costs by ${savingsPercentage}% while maintaining quality.`,
    `Reduce your spending by ${savingsPercentage}% with this smart alternative that offers similar benefits.`,
    `This economical option saves you ${savingsPercentage}% without compromising the core experience.`,
    `A thrifty choice that offers ${savingsPercentage}% in savings compared to the premium option.`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};