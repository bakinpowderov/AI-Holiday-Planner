import React, { useState, useEffect } from "react";
import { useTrip, Notification } from "../context/TripContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Bell, BellOff, XCircle, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { formatDistanceToNow } from "../utils/dateUtils";

export const NotificationsComponent: React.FC = () => {
  const { 
    userProfile, 
    setUserProfile, 
    notificationPermission, 
    requestNotificationPermission,
    pendingNotifications,
    dismissNotification
  } = useTrip();
  
  const handleEnableNotifications = async (enabled: boolean) => {
    if (enabled && notificationPermission !== "granted") {
      await requestNotificationPermission();
    }
    
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        enableNotifications: enabled
      });
    }
  };
  
  // Group notifications by read status
  const unreadNotifications = pendingNotifications.filter(n => !n.read);
  const readNotifications = pendingNotifications.filter(n => n.read);
  
  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Get alerts for upcoming activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Activity Reminders</div>
              <div className="text-sm text-muted-foreground">
                Receive notifications 30 minutes before activities
              </div>
            </div>
            <Switch 
              checked={userProfile?.enableNotifications ?? false}
              onCheckedChange={handleEnableNotifications}
            />
          </div>
          
          {userProfile?.enableNotifications && notificationPermission !== "granted" && (
            <div className="mt-4 p-3 bg-muted rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Notification permission required</p>
                <p className="text-muted-foreground">
                  Please allow notifications in your browser to receive activity reminders.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => requestNotificationPermission()}
                >
                  Enable Notifications
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {userProfile?.enableNotifications && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Notification Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {unreadNotifications.length === 0 && readNotifications.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <BellOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-sm">
                  You'll receive alerts for upcoming activities here
                </p>
              </div>
            ) : (
              <>
                {unreadNotifications.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm">New</h3>
                    {unreadNotifications.map((notification) => (
                      <NotificationItem 
                        key={notification.id} 
                        notification={notification}
                        onDismiss={dismissNotification}
                      />
                    ))}
                  </div>
                )}
                
                {readNotifications.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Earlier
                    </h3>
                    {readNotifications.slice(0, 5).map((notification) => (
                      <NotificationItem 
                        key={notification.id} 
                        notification={notification}
                        onDismiss={dismissNotification}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onDismiss 
}) => {
  return (
    <div className={`p-3 border rounded-lg ${notification.read ? 'opacity-75' : 'border-primary/50 bg-primary/5'}`}>
      <div className="flex justify-between items-start">
        <div className="font-medium">{notification.title}</div>
        {!notification.read && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={() => onDismiss(notification.id)}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-sm my-1">{notification.message}</p>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        {formatDistanceToNow(notification.time)}
      </div>
    </div>
  );
};