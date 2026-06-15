export interface Report {
    id: number
    time: string
    title: string
    summary: string
    description: string
    stats: {
        totalCheckIns: string
        activeHazards: string
        urgentFlags: string
        silentZones: string
    }
    criticalSignals: string[]
    affectedAreas: string[]
    tacticalInsights: string
}

export let REPORTS: Report[] = [
    {
        id: 1,
        time: 'Jun 7, 04:15 PM',
        title: 'Comms Loss at Outpost Delta',
        summary: 'All communication lines are back online, providing updates to local authorities.',
        description:
            'Over the past hour, flood conditions have intensified significantly in the Lower Basin and Sector 3 coastal communities. Resident check-ins have declined by 18%, while urgent medical and hazard flags have increased. The sudden silence from Outpost Delta is highly concerning and indicates a potential power or communication grid failure combined with the rising water levels.',
        stats: {
            totalCheckIns: '1,847',
            activeHazards: '23',
            urgentFlags: '6',
            silentZones: '2',
        },
        criticalSignals: ['Flood levels rising rapidly — Zone 3', 'Triage overload — Hub 4', 'Automated polling failed — Outpost Delta'],
        affectedAreas: ['Lower Basin (Critical Flooding)', 'Outpost Delta (Total Comms Silence)', 'North Hills (Wildfire Proximity)'],
        tacticalInsights:
            'The sudden silence from Outpost Delta perfectly correlates with the flood surge path. This indicates a high probability of network disruption or evacuation delays rather than isolated device failures. Immediate physical verification recommended.',
    },
    {
        id: 2,
        time: 'Jun 7, 05:15 PM',
        title: 'Early Warning Issued',
        summary: 'Initial assessments indicate a significant reduction in flood levels.',
        description:
            'Meteorological models suggest a massive storm front approaching the northern valleys. Preventative measures have been initiated to inform the local populations. Water levels in the main reservoir are currently stable but expected to rise within the next 6 hours. Evacuation routes have been pre-cleared for rapid deployment.',
        stats: {
            totalCheckIns: '2,105',
            activeHazards: '5',
            urgentFlags: '1',
            silentZones: '0',
        },
        criticalSignals: ['Storm front detected — Northern Valleys', 'Evacuation routes cleared', 'Reservoir levels stable'],
        affectedAreas: ['Northern Valleys (Storm Warning)', 'Reservoir Region (Monitoring)'],
        tacticalInsights:
            'Proactive communication has kept the population informed. Continuous monitoring of the storm front is required to ensure timely escalations if the trajectory changes. Suggest pre-positioning rescue assets near the reservoir.',
    },
    {
        id: 3,
        time: 'Jun 7, 06:15 PM',
        title: 'Flooding Escalation Detected',
        summary: 'Teams begin recovery operations and support for affected residents.',
        description:
            'The storm has made landfall earlier than anticipated, causing rapid water accumulation in urban drainage systems. Several key intersections in Sector 2 are now impassable. Emergency responders are prioritizing high-density residential buildings. Power outages reported in multiple grid sections.',
        stats: {
            totalCheckIns: '1,422',
            activeHazards: '45',
            urgentFlags: '12',
            silentZones: '4',
        },
        criticalSignals: [
            'Urban drainage overflow — Sector 2',
            'Power outages — Grid sections A, B, and F',
            'Rescue operations initiated — High-density areas',
        ],
        affectedAreas: ['Sector 2 (Urban Flooding)', 'Grid Sections A, B, F (Power Outage)'],
        tacticalInsights:
            'Urban drainage failure is accelerating the hazard level. Immediate dispatch of amphibious rescue units to Sector 2 is recommended. Power grid instability may lead to communication dropouts in the coming hours; switch to backup frequencies.',
    },
    {
        id: 4,
        time: 'Jun 7, 07:15 PM',
        title: 'Recovery Resources Deployed',
        summary: 'Full report generated detailing the affected areas and next steps.',
        description:
            'Water levels have peaked and are beginning to recede in the main affected zones. Damage assessment drones have been deployed to survey infrastructure integrity. Mobile communication towers are being erected in the silent zones to restore connectivity. Temporary shelters are now operating at 80% capacity.',
        stats: {
            totalCheckIns: '2,890',
            activeHazards: '15',
            urgentFlags: '3',
            silentZones: '1',
        },
        criticalSignals: ['Water levels receding — Main zones', 'Drone survey initiated — Infrastructure', 'Shelters at 80% capacity'],
        affectedAreas: ['Main Zones (Water Receding)', 'Silent Zones (Comms Restoration Ongoing)'],
        tacticalInsights:
            'The immediate crisis is stabilizing. Focus should shift from rescue to recovery and infrastructure repair. Monitor shelter capacities closely; if they exceed 95%, activate secondary overflow facilities.',
    },
    {
        id: 5,
        time: 'Jun 8, 08:30 AM',
        title: 'Wildfire Risk Elevated',
        summary: 'Dry conditions and high winds have increased the risk of wildfires in the eastern forests.',
        description:
            'Following a prolonged dry spell, humidity levels have dropped significantly. High-velocity wind patterns are developing in the eastern regions. Several small brush fires have been reported and contained, but the risk of a larger conflagration is high. Fire restrictions have been implemented.',
        stats: {
            totalCheckIns: '3,500',
            activeHazards: '8',
            urgentFlags: '2',
            silentZones: '0',
        },
        criticalSignals: ['High winds detected — Eastern Forests', 'Low humidity — 15%', 'Brush fires contained — Sector 5'],
        affectedAreas: ['Eastern Forests (High Fire Risk)', 'Sector 5 (Contained Fires)'],
        tacticalInsights:
            'The combination of high winds and low humidity creates a volatile environment. Airborne fire-retardant assets should be placed on standby. Public awareness campaigns regarding fire safety must be escalated immediately.',
    },
    {
        id: 6,
        time: 'Jun 8, 10:45 AM',
        title: 'Supply Chain Disruption',
        summary: 'A major arterial road has been blocked by a landslide, delaying relief supplies.',
        description:
            'Heavy rains from the previous week have destabilized the terrain along Highway 101. A significant landslide has blocked all lanes, cutting off the primary supply route to the western relief camps. Engineering teams are on-site, but clearing operations are expected to take at least 48 hours. Alternative routes are being mapped.',
        stats: {
            totalCheckIns: '3,210',
            activeHazards: '12',
            urgentFlags: '5',
            silentZones: '0',
        },
        criticalSignals: ['Landslide — Highway 101', 'Supply route blocked — Western Camps', 'Clearing operations — ETA 48 hours'],
        affectedAreas: ['Highway 101 (Blocked)', 'Western Relief Camps (Supply Delay)'],
        tacticalInsights:
            'Rerouting supplies via secondary roads will add approximately 4 hours to delivery times. Suggest deploying airdrops for critical medical supplies to the western camps while the road is being cleared.',
    },
    {
        id: 7,
        time: 'Jun 8, 02:00 PM',
        title: 'Medical Facility Overload Warning',
        summary: 'Central Hospital is reporting a surge in patients requiring urgent care.',
        description:
            'The influx of patients from the recent flooding and localized incidents has pushed Central Hospital near its maximum capacity. Triage times have increased, and critical care beds are scarce. Coordination with regional clinics is underway to transfer non-critical patients and free up resources.',
        stats: {
            totalCheckIns: '4,100',
            activeHazards: '6',
            urgentFlags: '18',
            silentZones: '0',
        },
        criticalSignals: ['Hospital capacity at 95% — Central Hospital', 'Triage times increasing', 'Patient transfer initiated'],
        affectedAreas: ['Central Hospital (Overload)', 'Regional Clinics (Receiving Patients)'],
        tacticalInsights:
            'To prevent total facility failure, immediate diversion of incoming ambulances to secondary hospitals is required. Activate emergency medical tents in the hospital parking lot for initial triage and minor treatments.',
    },
    {
        id: 8,
        time: 'Jun 8, 04:30 PM',
        title: 'Cyber Infrastructure Alert',
        summary: 'Unusual activity detected on the municipal communication network.',
        description:
            'Automated security systems have flagged anomalous traffic patterns attempting to access the main communication grid. While no breach has occurred, the volume of traffic suggests a potential distributed denial-of-service (DDoS) attack. Cybersecurity protocols have been heightened, and non-essential external connections have been throttled.',
        stats: {
            totalCheckIns: '3,800',
            activeHazards: '2',
            urgentFlags: '1',
            silentZones: '0',
        },
        criticalSignals: ['Anomalous traffic — Communication Grid', 'Potential DDoS attack', 'Security protocols heightened'],
        affectedAreas: ['Municipal Network (Under Threat)'],
        tacticalInsights:
            'The timing of this cyber activity during an ongoing recovery operation is suspicious. Ensure all critical infrastructure control systems are air-gapped or running on isolated, secure networks immediately.',
    },
    {
        id: 9,
        time: 'Jun 9, 09:15 AM',
        title: 'Structural Integrity Compromised',
        summary: 'The main bridge over the Black River is showing signs of structural failure.',
        description:
            'Post-flood assessments have revealed severe scouring around the foundational pillars of the Black River Bridge. Load sensors indicate stress levels exceeding safety margins by 15%. All heavy traffic has been immediately diverted, and engineering teams are conducting a full structural diagnostic.',
        stats: {
            totalCheckIns: '4,500',
            activeHazards: '3',
            urgentFlags: '4',
            silentZones: '0',
        },
        criticalSignals: ['Structural failure signs — Black River Bridge', 'Stress levels +15% over margin', 'Heavy traffic diverted'],
        affectedAreas: ['Black River Bridge (Closed to Heavy Vehicles)', 'Route 66 (Traffic Rerouted)'],
        tacticalInsights:
            'Immediate full closure of the bridge may be necessary if stress levels continue to rise. Expedite the deployment of a temporary pontoon bridge downriver to maintain logistical flow.',
    },
    {
        id: 10,
        time: 'Jun 9, 11:30 AM',
        title: 'Secondary Outbreak Detected',
        summary: 'A localized outbreak of waterborne illness has been reported in the southern camps.',
        description:
            'Medical teams at the Southern Relief Camp have reported a sudden spike in gastrointestinal symptoms among evacuees. Preliminary tests point to a localized contamination of the backup water supply. Quarantine protocols have been enacted for the affected sector.',
        stats: {
            totalCheckIns: '4,820',
            activeHazards: '4',
            urgentFlags: '12',
            silentZones: '0',
        },
        criticalSignals: ['Spike in gastrointestinal symptoms — Southern Camp', 'Water supply contamination suspected', 'Quarantine enacted'],
        affectedAreas: ['Southern Relief Camp (Quarantine Sector B)'],
        tacticalInsights:
            'Deploy mobile water purification units immediately to the Southern Camp. Isolate the current water reservoir and distribute bottled water stockpiles. Enhance sanitation protocols across all relief sites.',
    },
]

export async function fetchReports(): Promise<Report[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [...REPORTS]
}

export function getReportById(id: number): Report | undefined {
    return REPORTS.find((r) => r.id === id)
}

export function createReport(data: Omit<Report, 'id'>): Report {
    const newReport = { id: Date.now(), ...data }
    REPORTS = [newReport, ...REPORTS]
    return newReport
}

export function updateReport(id: number, data: Partial<Report>): Report | undefined {
    const index = REPORTS.findIndex((r) => r.id === id)
    if (index !== -1) {
        REPORTS[index] = { ...REPORTS[index], ...data }
        return REPORTS[index]
    }
    return undefined
}

export function deleteReport(id: number): boolean {
    const initialLength = REPORTS.length
    REPORTS = REPORTS.filter((r) => r.id !== id)
    return REPORTS.length !== initialLength
}
