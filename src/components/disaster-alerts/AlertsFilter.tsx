
import React, { useState } from 'react';
import { Alert } from '@/types/AlertTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Filter, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AlertCard from '../AlertCard';

interface AlertsFilterProps {
  filter: string;
  setFilter: (filter: string) => void;
  filteredAlerts: Alert[];
}

const AlertsFilter: React.FC<AlertsFilterProps> = ({ 
  filter, 
  setFilter, 
  filteredAlerts 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Count alerts by type
  const alertCounts = {
    all: filteredAlerts.length,
    high: filteredAlerts.filter(alert => alert.severity === 'high').length,
    medium: filteredAlerts.filter(alert => alert.severity === 'medium').length,
    low: filteredAlerts.filter(alert => alert.severity === 'low').length,
    flood: filteredAlerts.filter(alert => alert.title.toLowerCase().includes('flood') || 
                                          alert.description.toLowerCase().includes('flood') ||
                                          alert.type === 'flood').length,
    heat: filteredAlerts.filter(alert => alert.title.toLowerCase().includes('heat') || 
                                         alert.description.toLowerCase().includes('heat') ||
                                         alert.type === 'heat').length,
    air: filteredAlerts.filter(alert => alert.title.toLowerCase().includes('air') || 
                                        alert.description.toLowerCase().includes('air quality') ||
                                        alert.type === 'air').length,
    fire: filteredAlerts.filter(alert => alert.title.toLowerCase().includes('fire') || 
                                         alert.description.toLowerCase().includes('fire') ||
                                         alert.type === 'fire').length,
    drought: filteredAlerts.filter(alert => alert.title.toLowerCase().includes('drought') || 
                                            alert.description.toLowerCase().includes('drought') ||
                                            alert.type === 'drought').length
  };
  
  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="bg-card border border-border rounded-xl p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">Filter Alerts</span>
            <Badge variant="secondary" className="ml-2">
              {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Badge>
          </div>
          <ChevronDown 
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} 
          />
        </button>
        
        {isExpanded && (
          <div className="mt-4 animate-fade-in">
            <Tabs defaultValue="severity" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-9 bg-muted/50">
                <TabsTrigger value="severity" className="text-xs">Severity</TabsTrigger>
                <TabsTrigger value="type" className="text-xs">Type</TabsTrigger>
              </TabsList>
              
              <TabsContent value="severity" className="mt-3">
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={filter === "all" ? "default" : "outline"}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setFilter("all")}
                  >
                    All ({alertCounts.all})
                  </Badge>
                  <Badge 
                    variant={filter === "high" ? "default" : "outline"}
                    className={`cursor-pointer hover:scale-105 transition-transform ${filter === "high" ? "bg-destructive text-destructive-foreground" : "border-destructive text-destructive"}`}
                    onClick={() => setFilter("high")}
                  >
                    High ({alertCounts.high})
                  </Badge>
                  <Badge 
                    variant={filter === "medium" ? "default" : "outline"}
                    className={`cursor-pointer hover:scale-105 transition-transform ${filter === "medium" ? "bg-warning text-warning-foreground" : "border-warning text-warning"}`}
                    onClick={() => setFilter("medium")}
                  >
                    Medium ({alertCounts.medium})
                  </Badge>
                  <Badge 
                    variant={filter === "low" ? "default" : "outline"}
                    className={`cursor-pointer hover:scale-105 transition-transform ${filter === "low" ? "bg-info text-info-foreground" : "border-info text-info"}`}
                    onClick={() => setFilter("low")}
                  >
                    Low ({alertCounts.low})
                  </Badge>
                </div>
              </TabsContent>
              
              <TabsContent value="type" className="mt-3">
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={filter === "all" ? "default" : "outline"}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setFilter("all")}
                  >
                    All ({alertCounts.all})
                  </Badge>
                  <Badge 
                    variant={filter === "flood" ? "default" : "outline"}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setFilter("flood")}
                  >
                    🌊 Flood ({alertCounts.flood})
                  </Badge>
                  <Badge 
                    variant={filter === "heat" ? "default" : "outline"}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setFilter("heat")}
                  >
                    🌡️ Heat ({alertCounts.heat})
                  </Badge>
                  <Badge 
                    variant={filter === "air" ? "default" : "outline"}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setFilter("air")}
                  >
                    💨 Air ({alertCounts.air})
                  </Badge>
                  <Badge 
                    variant={filter === "fire" ? "default" : "outline"}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setFilter("fire")}
                  >
                    🔥 Fire ({alertCounts.fire})
                  </Badge>
                  <Badge 
                    variant={filter === "drought" ? "default" : "outline"}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setFilter("drought")}
                  >
                    ☀️ Drought ({alertCounts.drought})
                  </Badge>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      
      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <AlertCard 
              key={alert.id}
              id={alert.id}
              title={alert.title}
              description={alert.description}
              severity={alert.severity}
              date={alert.date}
              location={alert.location}
              isPersonalized={alert.isPersonalized}
            />
          ))
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium mb-1">No alerts found</p>
            <p className="text-sm text-muted-foreground mb-4">
              No alerts match your current filter
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setFilter("all")}
            >
              Show all alerts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsFilter;
