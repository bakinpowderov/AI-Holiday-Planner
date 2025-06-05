import React, { useState, useEffect } from "react";
import { useTrip, Activity, Alternative } from "../context/TripContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { DollarSignIcon, TrendingDownIcon, CheckCircleIcon, PiggyBankIcon, ReceiptIcon, WalletIcon, ArrowDownIcon } from "lucide-react";
import { generateCheaperAlternatives } from "../services/mockAIService";

export const BudgetView: React.FC = () => {
  const { tripDetails, setTripDetails } = useTrip();
  const [activeTab, setActiveTab] = useState<'overview' | 'byDay' | 'byType'>('overview');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<Alternative | null>(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<Activity[]>([]);
  
  // Calculate total cost
  const totalCost = tripDetails.dayPlans.reduce((total, day) => {
    return total + day.activities.reduce((dayTotal, activity) => dayTotal + activity.cost, 0);
  }, 0);
  
  // Calculate costs by category (activity type)
  const costsByType: Record<string, number> = {};
  tripDetails.dayPlans.forEach(day => {
    day.activities.forEach(activity => {
      if (!activity.isRelaxation) {
        costsByType[activity.type] = (costsByType[activity.type] || 0) + activity.cost;
      }
    });
  });
  
  // Sort types by cost (descending)
  const sortedTypes = Object.entries(costsByType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, cost]) => ({ type, cost }));
  
  // Calculate percentage of budget
  const budgetPercentage = tripDetails.totalBudget > 0 
    ? Math.min(100, Math.round((totalCost / tripDetails.totalBudget) * 100)) 
    : 0;
  
  // Find potential savings
  useEffect(() => {
    // Identify the top spending activities
    const allActivities: Activity[] = [];
    
    tripDetails.dayPlans.forEach(day => {
      day.activities.forEach(activity => {
        if (!activity.isRelaxation && activity.cost > 0) {
          allActivities.push(activity);
        }
      });
    });
    
    // Sort by cost (highest first) and take top 5
    const highCostActivities = allActivities
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);
    
    setOptimizationSuggestions(highCostActivities);
  }, [tripDetails]);
  
  // Get all activities from the trip
  const getAllActivities = (): [Activity, number, number][] => {
    const activities: [Activity, number, number][] = [];
    
    tripDetails.dayPlans.forEach((day, dayIndex) => {
      day.activities.forEach((activity, activityIndex) => {
        if (!activity.isRelaxation) {
          activities.push([activity, dayIndex, activityIndex]);
        }
      });
    });
    
    return activities.sort((a, b) => b[0].cost - a[0].cost);
  };
  
  // Get alternatives for an activity
  const getAlternatives = (activity: Activity): void => {
    if (!activity.alternatives || activity.alternatives.length === 0) {
      // Generate alternatives if not already present
      const alternatives = generateCheaperAlternatives(activity);
      
      // Update the activity with alternatives
      const updatedDayPlans = [...tripDetails.dayPlans];
      updatedDayPlans.forEach(day => {
        day.activities.forEach(act => {
          if (act.id === activity.id) {
            act.alternatives = alternatives;
          }
        });
      });
      
      setTripDetails({ ...tripDetails, dayPlans: updatedDayPlans });
    }
    
    setSelectedActivity(activity);
  };
  
  // Replace an activity with its alternative
  const replaceWithAlternative = () => {
    if (!selectedActivity || !selectedAlternative) return;
    
    const updatedDayPlans = [...tripDetails.dayPlans];
    let replaced = false;
    
    updatedDayPlans.forEach(day => {
      day.activities = day.activities.map(activity => {
        if (activity.id === selectedActivity.id) {
          replaced = true;
          return {
            ...activity,
            name: selectedAlternative.name,
            description: selectedAlternative.description,
            cost: selectedAlternative.cost,
            // Keep the original ID, timing, location, etc.
          };
        }
        return activity;
      });
    });
    
    if (replaced) {
      setTripDetails({ ...tripDetails, dayPlans: updatedDayPlans });
      setSelectedActivity(null);
      setSelectedAlternative(null);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return `${amount} ${tripDetails.currency}`;
  };
  
  // Get color based on cost percentage
  const getCostColor = (percentage: number): string => {
    if (percentage > 80) return "text-destructive";
    if (percentage > 60) return "text-amber-500";
    return "text-emerald-500";
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-medium mb-1">Trip Budget</h2>
          <p className="text-muted-foreground">
            Manage your expenses for {tripDetails.destination}
          </p>
        </div>
        
        {/* Budget Input */}
        <Card className="w-full md:w-auto">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <WalletIcon className="h-5 w-5 text-muted-foreground" />
              <div className="font-medium">Budget:</div>
              <div className="flex-1">
                <input 
                  type="number"
                  value={tripDetails.totalBudget}
                  onChange={(e) => setTripDetails({
                    ...tripDetails,
                    totalBudget: parseInt(e.target.value) || 0
                  })}
                  className="w-24 p-1 border rounded bg-background"
                />
              </div>
              <div>{tripDetails.currency}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Cost Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ReceiptIcon className="h-5 w-5 mr-2 text-primary" />
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(totalCost)}
            </div>
            {tripDetails.totalBudget > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budget</span>
                  <span className={getCostColor(budgetPercentage)}>
                    {budgetPercentage}%
                  </span>
                </div>
                <Progress value={budgetPercentage} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Cost Per Day */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
              Cost Per Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(Math.round(totalCost / (tripDetails.dayPlans.length || 1)))}
            </div>
            <div className="text-sm text-muted-foreground">
              Averaged across {tripDetails.dayPlans.length} days
            </div>
          </CardContent>
        </Card>
        
        {/* Potential Savings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <PiggyBankIcon className="h-5 w-5 mr-2 text-primary" />
              Potential Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(Math.round(totalCost * 0.3))}
            </div>
            <div className="text-sm text-muted-foreground">
              Up to 30% with suggested alternatives
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as 'overview' | 'byDay' | 'byType')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="byDay">By Day</TabsTrigger>
          <TabsTrigger value="byType">By Category</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingDownIcon className="h-5 w-5 mr-2" />
                Cost Optimization Suggestions
              </CardTitle>
              <CardDescription>
                Here are some suggestions to reduce your trip cost
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {optimizationSuggestions.length > 0 ? (
                optimizationSuggestions.map((activity) => (
                  <div key={activity.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-muted-foreground">{activity.type}</div>
                      <div className="font-medium text-primary">
                        {formatCurrency(activity.cost)}
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => getAlternatives(activity)}
                        >
                          <ArrowDownIcon className="h-3 w-3" /> Find Cheaper
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cheaper Alternatives</AlertDialogTitle>
                          <AlertDialogDescription>
                            Select a more budget-friendly option for "{selectedActivity?.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        
                        <div className="space-y-3 my-3">
                          {selectedActivity?.alternatives && selectedActivity.alternatives.length > 0 ? (
                            selectedActivity.alternatives.map((alt) => (
                              <div 
                                key={alt.id} 
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedAlternative?.id === alt.id 
                                    ? 'border-primary bg-primary/5' 
                                    : 'hover:border-primary/50'
                                }`}
                                onClick={() => setSelectedAlternative(alt)}
                              >
                                <div className="flex justify-between">
                                  <div className="font-medium">{alt.name}</div>
                                  <Badge variant="outline" className="font-normal">
                                    Save {alt.savingsPercentage}%
                                  </Badge>
                                </div>
                                <div className="text-sm mt-1">{alt.description}</div>
                                <div className="mt-2 font-medium text-primary">
                                  {formatCurrency(alt.cost)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-muted-foreground">
                              Loading alternatives...
                            </div>
                          )}
                        </div>
                        
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setSelectedAlternative(null)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={replaceWithAlternative}
                            disabled={!selectedAlternative}
                          >
                            Apply Change
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No high-cost activities to optimize
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSignIcon className="h-5 w-5 mr-2" />
                Highest Expenses
              </CardTitle>
              <CardDescription>
                Your most expensive activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getAllActivities().slice(0, 5).map(([activity, dayIndex, actIndex]) => (
                  <div key={activity.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Day {dayIndex + 1} • {activity.type}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(activity.cost)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="byDay" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Expenses</CardTitle>
              <CardDescription>
                Breakdown of costs for each day of your trip
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tripDetails.dayPlans.map((day, index) => {
                  const dayTotal = day.activities.reduce((sum, activity) => sum + activity.cost, 0);
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">
                          Day {index + 1}: {formatDate(day.date, 'medium')}
                        </h3>
                        <div className="font-medium">
                          {formatCurrency(dayTotal)}
                        </div>
                      </div>
                      
                      {day.activities.filter(a => !a.isRelaxation).length > 0 ? (
                        <div className="pl-4 space-y-2 border-l">
                          {day.activities.filter(a => !a.isRelaxation).map((activity) => (
                            <div key={activity.id} className="flex justify-between items-center">
                              <div>
                                <div className="text-sm">{activity.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {activity.startTime} - {activity.endTime}
                                </div>
                              </div>
                              <div className="text-sm">
                                {formatCurrency(activity.cost)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pl-4 py-2 text-sm text-muted-foreground border-l">
                          No expenses for this day
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="byType" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>
                See how your spending is distributed across different activity types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedTypes.map(({ type, cost }) => {
                  const percentage = Math.round((cost / totalCost) * 100);
                  
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {percentage}%
                          </span>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(cost)}
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

function formatDate(date: Date, style: 'short' | 'medium' = 'medium'): string {
  if (!date) return '';
  
  if (style === 'short') {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  return new Date(date).toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}