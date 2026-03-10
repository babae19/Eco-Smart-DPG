
import React, { useState } from 'react';
import { Search, Filter, Zap, Droplets, Recycle, Leaf } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { environmentalTipsData, EnvironmentalTipItem } from '@/utils/environmentalTipsData';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'energy':
      return <Zap className="h-4 w-4" />;
    case 'water':
      return <Droplets className="h-4 w-4" />;
    case 'waste':
      return <Recycle className="h-4 w-4" />;
    case 'eco-practices':
      return <Leaf className="h-4 w-4" />;
    default:
      return <Leaf className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'energy':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'water':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'waste':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'eco-practices':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    case 'medium':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

const EnvironmentalTips: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const filteredTips = environmentalTipsData
    .filter(tip => 
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tip.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(tip => 
      activeCategory === 'all' || tip.category === activeCategory
    );
  
  const TipCard = ({ tip }: { tip: EnvironmentalTipItem }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-muted rounded-lg">
              {getCategoryIcon(tip.category)}
            </div>
            <CardTitle className="text-lg">{tip.title}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Badge variant="secondary" className={getCategoryColor(tip.category)}>
              {tip.category}
            </Badge>
            <Badge variant="outline" className={getImpactColor(tip.impact)}>
              {tip.impact} impact
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-foreground mb-4 leading-relaxed">
          {tip.description}
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {tip.estimatedSavings && (
            <span className="bg-muted px-2 py-1 rounded">
              💰 {tip.estimatedSavings}
            </span>
          )}
          {tip.timeToImplement && (
            <span className="bg-muted px-2 py-1 rounded">
              ⏱️ {tip.timeToImplement}
            </span>
          )}
          <span className="bg-muted px-2 py-1 rounded">
            📊 {tip.difficulty} difficulty
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header title="Environmental Tips" showBackButton />
      
      <div className="p-4">
        {/* Header Stats */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">Conservation Tips Hub</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Discover practical ways to reduce your environmental impact and save money
          </p>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {environmentalTipsData.length} total tips
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              4 categories
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Savings estimates
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tips by title or description..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full mb-6">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="energy" className="text-xs">Energy</TabsTrigger>
            <TabsTrigger value="water" className="text-xs">Water</TabsTrigger>
            <TabsTrigger value="waste" className="text-xs">Waste</TabsTrigger>
            <TabsTrigger value="eco-practices" className="text-xs">Eco</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredTips.length} tip{filteredTips.length !== 1 ? 's' : ''} found
            {activeCategory !== 'all' && ` in ${activeCategory}`}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear search
            </button>
          )}
        </div>
        
        {/* Tips List */}
        <div className="space-y-4">
          {filteredTips.length > 0 ? (
            filteredTips.map(tip => (
              <TipCard key={tip.id} tip={tip} />
            ))
          ) : (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No tips found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or category filter
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="text-sm text-primary hover:underline"
              >
                Show all tips
              </button>
            </div>
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default EnvironmentalTips;
