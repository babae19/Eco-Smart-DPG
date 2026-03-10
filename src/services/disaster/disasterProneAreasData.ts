import { DisasterProneArea } from '@/types/DisasterProneAreaTypes';

// Disaster-prone areas in and around Freetown, Sierra Leone
export const disasterProneAreas: DisasterProneArea[] = [
  {
    id: 1,
    name: 'Kroo Bay',
    coordinates: {
      latitude: 8.4818,
      longitude: -13.2318
    },
    risks: ['flooding', 'storm surge', 'sewage overflow'],
    weatherRisks: ['heavy rainfall', 'storm surge', 'high tides'],
    description: 'Low-lying coastal slum area highly vulnerable to flooding and storm surge',
    vulnerabilityLevel: 'high',
    safetyTips: [
      'Move to higher ground during heavy rainfall',
      'Keep emergency supplies ready',
      'Monitor weather alerts closely'
    ],
    historicalEvents: [
      { type: 'flooding', year: 2023, severity: 'high' },
      { type: 'storm surge', year: 2022, severity: 'medium' }
    ]
  },
  {
    id: 2,
    name: "Susan's Bay",
    coordinates: {
      latitude: 8.4892,
      longitude: -13.2089
    },
    risks: ['flooding', 'fire outbreak', 'poor drainage'],
    weatherRisks: ['heavy rainfall', 'high humidity'],
    description: 'Dense informal settlement prone to fires and flooding',
    vulnerabilityLevel: 'high',
    safetyTips: [
      'Clear drainage channels regularly',
      'Maintain fire safety equipment',
      'Create evacuation plans'
    ],
    historicalEvents: [
      { type: 'fire outbreak', year: 2023, severity: 'high' },
      { type: 'flooding', year: 2022, severity: 'medium' }
    ]
  },
  {
    id: 3,
    name: 'Portee Rokupa',
    coordinates: {
      latitude: 8.4756,
      longitude: -13.2456
    },
    risks: ['flooding', 'landslide', 'erosion'],
    weatherRisks: ['heavy rainfall', 'prolonged wet season'],
    description: 'Hillside community vulnerable to landslides and erosion',
    vulnerabilityLevel: 'high',
    safetyTips: [
      'Avoid steep slopes during heavy rain',
      'Monitor ground stability',
      'Have evacuation routes planned'
    ],
    historicalEvents: [
      { type: 'landslide', year: 2022, severity: 'high' },
      { type: 'erosion', year: 2023, severity: 'medium' }
    ]
  },
  {
    id: 4,
    name: 'Regent',
    coordinates: {
      latitude: 8.4234,
      longitude: -13.1876
    },
    risks: ['landslide', 'mudslide', 'deforestation'],
    weatherRisks: ['heavy rainfall', 'soil saturation'],
    description: 'Mountainous area with history of deadly landslides',
    vulnerabilityLevel: 'high',
    safetyTips: [
      'Evacuate immediately during heavy rainfall warnings',
      'Stay away from steep slopes',
      'Monitor local emergency communications'
    ],
    historicalEvents: [
      { type: 'landslide', year: 2017, severity: 'high' },
      { type: 'mudslide', year: 2021, severity: 'medium' }
    ]
  },
  {
    id: 5,
    name: 'Waterloo',
    coordinates: {
      latitude: 8.3389,
      longitude: -13.0708
    },
    risks: ['flooding', 'poor drainage'],
    weatherRisks: ['heavy rainfall', 'flash floods'],
    description: 'Growing town with inadequate drainage infrastructure',
    vulnerabilityLevel: 'medium',
    safetyTips: [
      'Avoid low-lying areas during rainfall',
      'Keep drainage channels clear',
      'Have emergency supplies ready'
    ],
    historicalEvents: [
      { type: 'flooding', year: 2023, severity: 'medium' },
      { type: 'flooding', year: 2021, severity: 'medium' }
    ]
  },
  {
    id: 6,
    name: 'Wellington',
    coordinates: {
      latitude: 8.4512,
      longitude: -13.1423
    },
    risks: ['flooding', 'industrial hazards'],
    weatherRisks: ['heavy rainfall', 'storm water runoff'],
    description: 'Industrial area with flood risk during heavy rains',
    vulnerabilityLevel: 'medium',
    safetyTips: [
      'Monitor industrial safety alerts',
      'Avoid flood-prone industrial zones',
      'Have emergency contacts ready'
    ],
    historicalEvents: [
      { type: 'flooding', year: 2022, severity: 'medium' },
      { type: 'industrial hazards', year: 2023, severity: 'low' }
    ]
  },
  {
    id: 7,
    name: 'Freetown Peninsula Mountains',
    coordinates: {
      latitude: 8.4123,
      longitude: -13.1654
    },
    risks: ['landslide', 'deforestation', 'soil erosion'],
    weatherRisks: ['heavy rainfall', 'soil saturation', 'high winds'],
    description: 'Steep mountainous terrain vulnerable to landslides',
    vulnerabilityLevel: 'high',
    safetyTips: [
      'Avoid mountainous areas during heavy rain',
      'Monitor weather warnings',
      'Have multiple evacuation routes'
    ],
    historicalEvents: [
      { type: 'landslide', year: 2020, severity: 'high' },
      { type: 'soil erosion', year: 2023, severity: 'medium' }
    ]
  },
  {
    id: 8,
    name: 'Kissy Dockyard',
    coordinates: {
      latitude: 8.4634,
      longitude: -13.2123
    },
    risks: ['flooding', 'storm surge', 'industrial pollution'],
    weatherRisks: ['storm surge', 'heavy rainfall', 'high tides'],
    description: 'Coastal industrial area prone to flooding',
    vulnerabilityLevel: 'medium',
    safetyTips: [
      'Monitor tide levels',
      'Avoid contaminated flood waters',
      'Follow industrial safety protocols'
    ],
    historicalEvents: [
      { type: 'storm surge', year: 2022, severity: 'medium' },
      { type: 'flooding', year: 2023, severity: 'medium' }
    ]
  },
  {
    id: 9,
    name: 'Tengbe Town',
    coordinates: {
      latitude: 8.4567,
      longitude: -13.2234
    },
    risks: ['flooding', 'fire outbreak', 'overcrowding'],
    weatherRisks: ['heavy rainfall', 'poor ventilation'],
    description: 'Dense informal settlement with poor infrastructure',
    vulnerabilityLevel: 'high',
    safetyTips: [
      'Maintain clear evacuation paths',
      'Keep fire safety equipment',
      'Monitor community alerts'
    ],
    historicalEvents: [
      { type: 'fire outbreak', year: 2023, severity: 'high' },
      { type: 'flooding', year: 2022, severity: 'medium' }
    ]
  },
  {
    id: 10,
    name: 'Cockle Bay',
    coordinates: {
      latitude: 8.4712,
      longitude: -13.2445
    },
    risks: ['flooding', 'coastal erosion'],
    weatherRisks: ['storm surge', 'sea level rise', 'high tides'],
    description: 'Coastal area vulnerable to sea level rise and erosion',
    vulnerabilityLevel: 'medium',
    safetyTips: [
      'Monitor sea level warnings',
      'Protect against coastal erosion',
      'Have evacuation plans ready'
    ],
    historicalEvents: [
      { type: 'coastal erosion', year: 2023, severity: 'medium' },
      { type: 'flooding', year: 2022, severity: 'low' }
    ]
  }
];
