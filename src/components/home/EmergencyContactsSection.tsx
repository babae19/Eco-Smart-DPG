
import React, { useState } from 'react';
import { Phone, Ambulance, ShieldAlert, Info, Building, Shield, Heart, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useViewportSize } from '@/hooks/useViewportSize';

const EmergencyContactsSection: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const { isMobile, isSmallMobile } = useViewportSize();
  
  const emergencyContacts = [
    {
      name: "Emergency Hotline",
      number: "117",
      description: "National Emergency - 24/7",
      icon: Ambulance,
      category: "critical",
      colorClass: "text-destructive"
    },
    {
      name: "National Disaster Management",
      number: "+23278388946",
      description: "Disaster Response - 24/7",
      icon: ShieldAlert,
      category: "critical",
      colorClass: "text-destructive"
    },
    {
      name: "Sierra Leone Police",
      number: "+23233240500",
      description: "Law Enforcement - 24/7",
      icon: Shield,
      category: "critical",
      colorClass: "text-destructive"
    },
    {
      name: "Freetown City Council",
      number: "+23275891416",
      description: "Municipal Services - 24/7",
      icon: Building,
      category: "important",
      colorClass: "text-info"
    },
    {
      name: "Environmental Protection Agency",
      number: "+23274508695",
      description: "Environmental Issues - 24/7",
      icon: Info,
      category: "important",
      colorClass: "text-primary"
    },
    {
      name: "Sierra Leone Red Cross",
      number: "+23273555555",
      description: "Humanitarian Aid - 24/7",
      icon: Heart,
      category: "important",
      colorClass: "text-success"
    }
  ];
  
  const criticalContacts = emergencyContacts.filter(c => c.category === "critical");
  const importantContacts = emergencyContacts.filter(c => c.category === "important");
  const displayContacts = expanded ? emergencyContacts : criticalContacts;
  
  return (
    <section aria-label="Emergency contacts" className="mb-6 mt-6 px-3 sm:px-0 sm:mb-8 sm:mt-8">
      <Card className="overflow-hidden border-destructive/30 shadow-2xl bg-gradient-to-br from-destructive/5 via-background to-destructive/5 rounded-2xl animate-enter">
        <CardHeader className="border-b border-destructive/20 bg-gradient-to-r from-destructive/10 to-warning/10 pb-4 sm:pb-6 pt-5 sm:pt-6 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse-light"></div>
                <div className={cn(
                  "relative bg-destructive/10 backdrop-blur-sm rounded-full border-2 border-destructive/30",
                  isMobile ? "p-2.5" : "p-3"
                )}>
                  <AlertTriangle 
                    className="text-destructive" 
                    size={isMobile ? 28 : 32} 
                    strokeWidth={2.5} 
                  />
                </div>
              </div>
              <div className="min-w-0">
                <h2 className={cn(
                  "font-bold text-foreground flex items-center gap-2",
                  isMobile ? "text-xl sm:text-2xl" : "text-3xl"
                )}>
                  Emergency Contacts
                </h2>
                <p className={cn(
                  "text-muted-foreground mt-0.5 sm:mt-1",
                  isMobile ? "text-xs sm:text-sm" : "text-sm"
                )}>
                  Quick access to emergency services
                </p>
              </div>
            </div>
            {importantContacts.length > 0 && (
              <Button 
                onClick={() => setExpanded(!expanded)}
                variant="outline"
                size={isMobile ? "default" : "sm"}
                className={cn(
                  "flex items-center gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 shrink-0",
                  isMobile && "w-full sm:w-auto h-11"
                )}
              >
                {expanded ? (
                  <>
                    <ChevronUp size={isMobile ? 20 : 18} />
                    <span className={isMobile ? "text-base" : ""}>Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={isMobile ? 20 : 18} />
                    <span className={isMobile ? "text-base" : ""}>Show All ({emergencyContacts.length})</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {/* Critical Emergency Services */}
          {!expanded && criticalContacts.length > 0 && (
            <div className={cn("mb-4 sm:mb-6", isMobile && "mb-5")}>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse"></div>
                <h3 className={cn(
                  "font-semibold text-destructive uppercase tracking-wider",
                  isMobile ? "text-xs sm:text-sm" : "text-sm"
                )}>
                  Critical Emergency Services
                </h3>
              </div>
            </div>
          )}
          
          <div className={cn(
            "grid gap-4",
            isMobile 
              ? "grid-cols-1" 
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6"
          )}>
            {displayContacts.map((contact, idx) => {
              const IconComponent = contact.icon;
              const isCritical = contact.category === "critical";
              
              return (
                <div 
                  key={idx}
                  className={cn(
                    "group relative overflow-hidden rounded-xl",
                    "bg-card border-2 transition-all duration-300",
                    "hover:shadow-xl",
                    !isMobile && "hover:-translate-y-1",
                    isCritical 
                      ? "border-destructive/30 hover:border-destructive/50 hover:shadow-destructive/10" 
                      : "border-border hover:border-primary/50 hover:shadow-primary/10"
                  )}
                >
                  {/* Background gradient effect */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    isCritical 
                      ? "bg-gradient-to-br from-destructive/5 to-transparent" 
                      : "bg-gradient-to-br from-primary/5 to-transparent"
                  )} />
                  
                  <div className={cn(
                    "relative",
                    isMobile ? "p-5" : "p-5 sm:p-6"
                  )}>
                    {/* Header with Icon and Info */}
                    <div className={cn(
                      "flex items-start mb-4",
                      isMobile ? "gap-3" : "gap-4"
                    )}>
                      <div className={cn(
                        "shrink-0 rounded-xl transition-all duration-300",
                        !isMobile && "group-hover:scale-110",
                        isCritical 
                          ? "bg-destructive/10 group-hover:bg-destructive/15" 
                          : "bg-primary/10 group-hover:bg-primary/15",
                        isMobile ? "p-2.5" : "p-3"
                      )}>
                        <IconComponent 
                          className={cn(contact.colorClass, "drop-shadow-sm")} 
                          size={isMobile ? 26 : 28} 
                          strokeWidth={2.5} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-bold text-foreground leading-tight mb-1",
                          isMobile ? "text-base" : "text-base sm:text-lg"
                        )}>
                          {contact.name}
                        </h3>
                        <p className={cn(
                          "font-mono font-semibold tracking-tight",
                          isMobile ? "text-lg" : "text-lg sm:text-xl",
                          isCritical ? "text-destructive" : "text-primary"
                        )}>
                          {contact.number}
                        </p>
                      </div>
                    </div>
                    
                    {/* Description Badge */}
                    <div className="mb-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full",
                        isMobile ? "text-xs" : "text-xs sm:text-sm"
                      )}>
                        <div className={cn(
                          "rounded-full bg-success animate-pulse",
                          isMobile ? "h-1.5 w-1.5" : "h-2 w-2"
                        )}></div>
                        {contact.description}
                      </span>
                    </div>
                    
                    {/* Call Button */}
                    <Button 
                      asChild
                      size="lg"
                      className={cn(
                        "w-full font-semibold gap-2",
                        "transition-all duration-300 group-hover:gap-3 active:scale-95",
                        isMobile ? "h-14 text-lg" : "h-12 text-base",
                        isCritical 
                          ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20" 
                          : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                      )}
                    >
                      <a 
                        href={`tel:${contact.number}`} 
                        aria-label={`Call ${contact.name} at ${contact.number}`}
                        className="flex items-center justify-center gap-2"
                      >
                        <Phone size={isMobile ? 22 : 20} strokeWidth={2.5} />
                        <span>Call Now</span>
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Important Services Section */}
          {expanded && importantContacts.length > 0 && (
            <>
              <div className={cn(
                "flex items-center gap-2 mb-4",
                isMobile ? "mt-6" : "mt-8"
              )}>
                <div className={cn(
                  "rounded-full bg-primary",
                  isMobile ? "h-1.5 w-1.5" : "h-1 w-1"
                )}></div>
                <h3 className={cn(
                  "font-semibold text-primary uppercase tracking-wider",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  Additional Support Services
                </h3>
              </div>
            </>
          )}
          
          {/* Footer Notice */}
          <div className={cn(
            "p-4 bg-muted/50 rounded-xl border border-border/50",
            isMobile ? "mt-6" : "mt-8"
          )}>
            <p className={cn(
              "text-center text-muted-foreground leading-relaxed",
              isMobile ? "text-xs sm:text-sm" : "text-sm"
            )}>
              <span className="font-semibold text-foreground">Emergency Response:</span> For life-threatening emergencies, call <span className="font-mono font-bold text-destructive">117</span> immediately. All services operate 24/7.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default EmergencyContactsSection;
