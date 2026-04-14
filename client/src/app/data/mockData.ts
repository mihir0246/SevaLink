// Mock data for SevaLink platform

export const statsData = {
  totalNeeds: 847,
  urgentTasks: 23,
  activeVolunteers: 312,
  completedTasks: 1249
};

export const needsByArea = [
  { area: 'North District', count: 145 },
  { area: 'South District', count: 198 },
  { area: 'East District', count: 167 },
  { area: 'West District', count: 156 },
  { area: 'Central', count: 181 }
];

export const needsByCategory = [
  { name: 'Food', value: 312, fill: '#F97316' },
  { name: 'Medical', value: 198, fill: '#14B8A6' },
  { name: 'Shelter', value: 145, fill: '#1E3A8A' },
  { name: 'Education', value: 124, fill: '#8B5CF6' },
  { name: 'Other', value: 68, fill: '#6B7280' }
];

export const trendsData = [
  { month: 'Jan', needs: 65, fulfilled: 52 },
  { month: 'Feb', needs: 72, fulfilled: 61 },
  { month: 'Mar', needs: 81, fulfilled: 69 },
  { month: 'Apr', needs: 95, fulfilled: 78 },
  { month: 'May', needs: 89, fulfilled: 82 },
  { month: 'Jun', needs: 103, fulfilled: 94 }
];

export const recentActivity = [
  { id: 1, type: 'volunteer_assigned', message: 'Sarah Johnson assigned to food distribution in North District', time: '5 min ago', urgency: 'high' },
  { id: 2, type: 'need_created', message: 'New medical supply request in East District', time: '12 min ago', urgency: 'medium' },
  { id: 3, type: 'task_completed', message: 'Shelter setup completed in Central area', time: '1 hour ago', urgency: 'low' },
  { id: 4, type: 'volunteer_joined', message: 'Michael Chen joined as a volunteer', time: '2 hours ago', urgency: 'low' },
  { id: 5, type: 'need_urgent', message: 'Urgent: Medical assistance needed in South District', time: '3 hours ago', urgency: 'high' }
];

export const mapNeeds = [
  { id: 1, lat: 40.7589, lng: -73.9851, title: 'Food Distribution', type: 'Food', urgency: 'high', location: 'North District', volunteers: 3, distance: '2.3 km' },
  { id: 2, lat: 40.7489, lng: -73.9681, title: 'Medical Supplies', type: 'Medical', urgency: 'critical', location: 'East District', volunteers: 2, distance: '1.8 km' },
  { id: 3, lat: 40.7689, lng: -73.9881, title: 'Shelter Setup', type: 'Shelter', urgency: 'medium', location: 'Central', volunteers: 5, distance: '3.1 km' },
  { id: 4, lat: 40.7389, lng: -73.9951, title: 'Education Materials', type: 'Education', urgency: 'low', location: 'South District', volunteers: 1, distance: '4.5 km' },
  { id: 5, lat: 40.7789, lng: -73.9651, title: 'Food Bank', type: 'Food', urgency: 'high', location: 'West District', volunteers: 4, distance: '2.9 km' }
];

export const tasks = {
  pending: [
    { id: 1, title: 'Distribute food packages', location: 'North District', urgency: 'high', skills: ['Logistics', 'Driving'], category: 'Food' },
    { id: 2, title: 'Medical supply delivery', location: 'East District', urgency: 'critical', skills: ['Medical', 'Transport'], category: 'Medical' },
    { id: 3, title: 'Education kit assembly', location: 'South District', urgency: 'low', skills: ['Organization'], category: 'Education' }
  ],
  assigned: [
    { id: 4, title: 'Shelter inspection', location: 'Central', urgency: 'medium', skills: ['Construction', 'Safety'], category: 'Shelter', assignedTo: 'Sarah Johnson' },
    { id: 5, title: 'Food inventory check', location: 'West District', urgency: 'low', skills: ['Inventory'], category: 'Food', assignedTo: 'Michael Chen' }
  ],
  inProgress: [
    { id: 6, title: 'Medical camp setup', location: 'North District', urgency: 'high', skills: ['Medical', 'Organization'], category: 'Medical', assignedTo: 'Emma Davis' },
    { id: 7, title: 'Community kitchen prep', location: 'East District', urgency: 'medium', skills: ['Cooking', 'Hygiene'], category: 'Food', assignedTo: 'James Wilson' }
  ],
  completed: [
    { id: 8, title: 'Blanket distribution', location: 'South District', urgency: 'medium', skills: ['Logistics'], category: 'Shelter', completedBy: 'Sarah Johnson', completedAt: '2 hours ago' },
    { id: 9, title: 'Health checkup drive', location: 'Central', urgency: 'high', skills: ['Medical'], category: 'Medical', completedBy: 'Dr. Kumar', completedAt: '5 hours ago' }
  ]
};

export const volunteers = [
  { id: 1, name: 'Sarah Johnson', skills: ['Logistics', 'Driving', 'Organization'], rating: 4.8, distance: '2.1 km', matchScore: 95, avatar: 'SJ', totalTasks: 47, availableHours: 15 },
  { id: 2, name: 'Michael Chen', skills: ['Medical', 'First Aid', 'Transport'], rating: 4.9, distance: '1.5 km', matchScore: 92, avatar: 'MC', totalTasks: 38, availableHours: 20 },
  { id: 3, name: 'Emma Davis', skills: ['Cooking', 'Hygiene', 'Teaching'], rating: 4.7, distance: '3.2 km', matchScore: 88, avatar: 'ED', totalTasks: 52, availableHours: 10 },
  { id: 4, name: 'James Wilson', skills: ['Construction', 'Safety', 'Carpentry'], rating: 4.9, distance: '2.8 km', matchScore: 85, avatar: 'JW', totalTasks: 61, availableHours: 12 },
  { id: 5, name: 'Lisa Anderson', skills: ['Medical', 'Counseling', 'Teaching'], rating: 4.6, distance: '4.1 km', matchScore: 82, avatar: 'LA', totalTasks: 29, availableHours: 18 }
];

export const volunteerProfile = {
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  avatar: 'SJ',
  rating: 4.8,
  impactScore: 1247,
  totalTasks: 47,
  hoursContributed: 156,
  skills: ['Logistics', 'Driving', 'Organization', 'Communication'],
  badges: [
    { name: 'Top Contributor', icon: '🏆', earned: '2026-03-15' },
    { name: 'Quick Responder', icon: '⚡', earned: '2026-02-20' },
    { name: 'Community Hero', icon: '💪', earned: '2026-01-10' },
    { name: 'Dedicated Volunteer', icon: '🎯', earned: '2025-12-05' }
  ],
  assignedTasks: [
    { id: 1, title: 'Food distribution - North District', dueDate: '2026-04-12', status: 'in-progress', urgency: 'high' },
    { id: 2, title: 'Shelter inspection - Central', dueDate: '2026-04-14', status: 'assigned', urgency: 'medium' }
  ],
  availability: [
    { day: 'Monday', slots: ['9AM-12PM', '2PM-5PM'] },
    { day: 'Wednesday', slots: ['10AM-1PM'] },
    { day: 'Friday', slots: ['3PM-7PM'] },
    { day: 'Saturday', slots: ['9AM-5PM'] }
  ]
};

export const users = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', role: 'Volunteer', status: 'Active', joined: '2025-11-15', tasksCompleted: 47 },
  { id: 2, name: 'Michael Chen', email: 'mchen@ngo.org', role: 'NGO Admin', status: 'Active', joined: '2025-08-22', tasksCompleted: 38 },
  { id: 3, name: 'Emma Davis', email: 'emma.d@email.com', role: 'Volunteer', status: 'Active', joined: '2025-10-03', tasksCompleted: 52 },
  { id: 4, name: 'James Wilson', email: 'jwilson@email.com', role: 'Volunteer', status: 'Inactive', joined: '2025-09-17', tasksCompleted: 61 },
  { id: 5, name: 'Lisa Anderson', email: 'lisa.a@ngo.org', role: 'Coordinator', status: 'Active', joined: '2026-01-12', tasksCompleted: 29 }
];

export const resourceInventory = [
  { id: 1, item: 'Food Packages', quantity: 450, unit: 'boxes', category: 'Food', status: 'In Stock', lastUpdated: '2026-04-10' },
  { id: 2, item: 'Medical Kits', quantity: 87, unit: 'kits', category: 'Medical', status: 'Low Stock', lastUpdated: '2026-04-11' },
  { id: 3, item: 'Blankets', quantity: 312, unit: 'pieces', category: 'Shelter', status: 'In Stock', lastUpdated: '2026-04-09' },
  { id: 4, item: 'Water Bottles', quantity: 1200, unit: 'bottles', category: 'Food', status: 'In Stock', lastUpdated: '2026-04-11' },
  { id: 5, item: 'First Aid Supplies', quantity: 45, unit: 'kits', category: 'Medical', status: 'Critical', lastUpdated: '2026-04-10' }
];

export const chatSuggestions = [
  "Where is the highest need?",
  "Show urgent food requests",
  "Find volunteers near North District",
  "What tasks are pending?",
  "Show medical supply status"
];
