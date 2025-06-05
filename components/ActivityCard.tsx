import React from "react";
import { Activity } from "../context/TripContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CalendarIcon, ClockIcon, MapPinIcon, LinkIcon, ExternalLinkIcon } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ActivityCardProps {
  activity: Activity;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  // Generate a deterministic image based on activity type and name
  const getActivityImage = (type: string, name: string): string => {
    const seed = `${type}_${name.replace(/\s+/g, '')}`;
    const hash = Array.from(seed).reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const category = getImageCategory(type);
    return `https://source.unsplash.com/featured/300x200/?${category}`;
  };

  const getImageCategory = (type: string): string => {
    switch (type) {
      case "hotel":
      case "b&b":
      case "hostel":
        return "hotel,accommodation";
      case "culture":
        return "museum,culture";
      case "concert":
        return "concert,music";
      case "archeology":
        return "ruins,archaeology";
      case "hiking":
        return "hiking,trail";
      case "cycling":
        return "cycling,bike";
      case "car":
        return "road,drive";
      case "motorbike":
        return "motorcycle,motorbike";
      case "swimming":
        return "swimming,pool";
      case "water sports":
        return "watersports,kayak";
      case "sea cruise":
        return "cruise,boat";
      case "workshop":
        return "workshop,craft";
      case "dining":
        return "restaurant,food";
      case "partying":
        return "party,nightlife";
      case "pubs":
        return "pub,bar";
      case "gallery":
        return "gallery,art";
      case "networking":
        return "networking,meeting";
      default:
        return "travel";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "hotel":
      case "b&b":
      case "hostel":
        return "🏨";
      case "culture":
        return "🏛️";
      case "concert":
        return "🎵";
      case "archeology":
        return "🏺";
      case "hiking":
        return "🥾";
      case "cycling":
        return "🚲";
      case "car":
        return "🚗";
      case "motorbike":
        return "🏍️";
      case "swimming":
        return "🏊";
      case "water sports":
        return "🚣";
      case "sea cruise":
        return "⛵";
      case "workshop":
        return "🛠️";
      case "dining":
        return "🍽️";
      case "partying":
        return "🎉";
      case "pubs":
        return "🍻";
      case "gallery":
        return "🖼️";
      case "networking":
        return "👥";
      default:
        return "📌";
    }
  };

  const imageUrl = activity.isRelaxation ? 
    "https://source.unsplash.com/featured/300x200/?relax,rest" : 
    getActivityImage(activity.type, activity.name);

  return (
    <Card className={activity.isRelaxation ? "border-dashed border-muted" : ""}>
      {!activity.isRelaxation && (
        <div className="relative h-36 w-full overflow-hidden rounded-t-lg">
          <ImageWithFallback
            src={imageUrl}
            alt={activity.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <Badge className="absolute top-3 right-3" variant={activity.isRelaxation ? "outline" : "secondary"}>
            {activity.type}
          </Badge>
        </div>
      )}
      
      <CardHeader className={`pb-2 ${activity.isRelaxation ? 'pt-4' : 'pt-3'}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            {activity.isRelaxation && (
              <>
                <span className="text-xl">{getActivityIcon(activity.type)}</span>
                <CardTitle>{activity.name}</CardTitle>
              </>
            )}
            {!activity.isRelaxation && (
              <CardTitle>{activity.name}</CardTitle>
            )}
          </div>
          {activity.isRelaxation && (
            <Badge variant="outline">
              {activity.type}
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-1 mt-1">
          <ClockIcon className="h-3 w-3" /> {activity.startTime} - {activity.endTime}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm">{activity.description}</p>
        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPinIcon className="h-3 w-3" /> {activity.location}
        </div>
      </CardContent>
      
      {activity.bookingUrl && (
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full gap-1">
            <ExternalLinkIcon className="h-4 w-4" /> View Booking Information
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};