import React from 'react';
import { Cloud, CloudDrizzle, CloudLightning, CloudRain, Sun } from 'lucide-react';
import { WeatherData } from '@/types/WeatherTypes';

export const getWeatherIcon = (condition: WeatherData['condition'], size = 24) => {
  switch (condition) {
    case 'sunny':
      return <Sun className="text-amber-500" size={size} />;
    case 'cloudy':
      return <Cloud className="text-gray-500" size={size} />;
    case 'rainy':
      return <CloudRain className="text-blue-500" size={size} />;
    case 'stormy':
      return <CloudLightning className="text-purple-500" size={size} />;
    case 'drizzle':
      return <CloudDrizzle className="text-blue-400" size={size} />;
    default:
      console.log(`Unknown weather condition: ${condition}, defaulting to sunny`);
      return <Sun className="text-amber-500" size={size} />;
  }
};

export const getDisasterImage = (disasterType: string, areaName?: string) => {
  try {
    console.log(`Getting disaster image for type: ${disasterType}, area: ${areaName || 'N/A'}`);
    
    if (areaName && areaName.toLowerCase() === 'kroo bay') {
      return "/lovable-uploads/f83ed439-b806-4d1b-9500-78460e710a72.png";
    }
    
    if (areaName && areaName.toLowerCase() === 'kissy') {
      return "/lovable-uploads/7ca8255e-caaf-4c75-ad8a-843b6e2385b2.png";
    }

    if (areaName && areaName.toLowerCase() === 'leicester peak') {
      return "/lovable-uploads/b08c0650-a540-4196-bb33-5d4458c21e7b.png";
    }

    if (areaName && areaName.toLowerCase() === 'brookfields') {
      return "/lovable-uploads/a97abd44-6a35-4305-ab40-419e1fdb9688.png";
    }

    if (areaName && areaName.toLowerCase() === 'murray town') {
      return "/lovable-uploads/31bb4e0f-baf9-4dff-acc8-9e05bd7c91c6.png";
    }

    if (areaName && areaName.toLowerCase() === 'juba') {
      return "/lovable-uploads/269fb1b4-c6b1-484d-b56c-91edbe6b4985.png";
    }
    
    if (areaName && ['mount aureol', 'regent', 'hill station'].includes(areaName.toLowerCase())) {
      if (areaName.toLowerCase() === 'mount aureol') {
        return "/lovable-uploads/bee7b571-d988-4c6b-a5d6-72e54b59e61e.png";
      }
      return "/lovable-uploads/5b1ce943-bff8-48bc-8522-09e9a220c9eb.png";
    }
    
    if (areaName && areaName.toLowerCase() === 'goderich') {
      return "/lovable-uploads/6fe33f9d-938a-43ac-877e-c1668410ff6c.png";
    }
    
    if (areaName && ['lumley', 'lumley beach', 'aberdeen'].includes(areaName.toLowerCase())) {
      if (areaName.toLowerCase() === 'lumley' || areaName.toLowerCase() === 'lumley beach') {
        return "/lovable-uploads/c27db9a6-91c0-4435-9451-30f17a02e880.png";
      }
      return "/lovable-uploads/6997608d-ad08-44a2-a796-d5fff16ed5fd.png";
    }
    
    if (areaName && areaName.toLowerCase() === 'grafton') {
      return "/lovable-uploads/a9d616df-995a-48c4-8de6-fdc95f78bd3e.png";
    }
    
    if (areaName && areaName.toLowerCase() === 'dunda street') {
      return "/lovable-uploads/8cd94caa-e4bb-4ccd-975c-371e586def53.png";
    }

    if (areaName && areaName.toLowerCase() === 'akram') {
      return "/lovable-uploads/55423d06-6ead-4341-b3e5-39fb812660a4.png";
    }

    if (areaName && areaName.toLowerCase() === 'waterloo') {
      return "/lovable-uploads/982c52ed-835a-4899-9515-b51a4c90cca1.png";
    }
    
    if (areaName && ['kroo bay', 'congo town', 'cline town', 'sackville street', 'eastern police', 'murray town'].includes(areaName.toLowerCase())) {
      return "/lovable-uploads/e732af05-b74a-40a3-b732-ae025a2d7939.png";
    }
    
    if (areaName && areaName.toLowerCase() === 'susan\'s bay') {
      return "/lovable-uploads/e5f62173-2d19-4a4d-bc51-0d90ac5f15c5.png";
    }

    if (areaName && ['tengbeh town', 'grafton'].includes(areaName.toLowerCase())) {
      return "/lovable-uploads/6e1bcbb7-a152-4805-84b8-c202ab8700cd.png";
    }
    
    if (areaName && areaName.toLowerCase() === 'sackville street') {
      return "/lovable-uploads/2090061e-05cd-424d-bf80-178235babe17.png";
    }
    
    if (areaName && areaName.toLowerCase() === 'cline town') {
      return "/lovable-uploads/a7322e38-7222-4fb2-9a7e-158ae4ac4ca7.png";
    }
    
    if (disasterType.toLowerCase().includes('flood')) {
      return "/lovable-uploads/578ce115-b50d-4a0e-94c1-adc5c1342228.png";
    } else if (disasterType.toLowerCase().includes('landslide') || disasterType.toLowerCase().includes('mudslide')) {
      return "/lovable-uploads/bc600c1e-dd1e-4ba0-9ea9-1fb7452f1c64.png";
    } else if (disasterType.toLowerCase().includes('fire')) {
      return "/lovable-uploads/98641ffe-09fe-46c8-be80-952b1a4cae6f.png";
    } else if (disasterType.toLowerCase().includes('coast') || disasterType.toLowerCase().includes('erosion')) {
      return "/lovable-uploads/8dd9be44-618e-452e-985a-eba2bc031b19.png";
    } else if (disasterType.toLowerCase().includes('deforest')) {
      return "/lovable-uploads/b2614dc0-f3cd-4ba3-b4b5-836b2df75f7a.png";
    } else if (disasterType.toLowerCase().includes('disease') || disasterType.toLowerCase().includes('pollution')) {
      return "/lovable-uploads/b13ed75c-2919-4a39-82f5-fdd448a6d78e.png";
    }
  } catch (error) {
    console.error("Error loading disaster image:", error);
  }
  
  console.log("No specific disaster image found, returning default flood image");
  return "/lovable-uploads/578ce115-b50d-4a0e-94c1-adc5c1342228.png";
};
