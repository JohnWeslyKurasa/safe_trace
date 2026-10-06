/**
 * SafeTrace Database Seed Script
 * Creates demo data for all models including cases, sightings, evidence,
 * clusters, pattern alerts, match leads, and user accounts
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const MissingCase = require('./src/models/MissingCase');
const Evidence = require('./src/models/Evidence');
const Sighting = require('./src/models/Sighting');
const CaseCluster = require('./src/models/CaseCluster');
const PatternAlert = require('./src/models/PatternAlert');
const MatchLead = require('./src/models/MatchLead');
const ConsentRecord = require('./src/models/ConsentRecord');
const AuditLog = require('./src/models/AuditLog');
const SecureMessage = require('./src/models/SecureMessage');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), MissingCase.deleteMany({}), Evidence.deleteMany({}),
      Sighting.deleteMany({}), CaseCluster.deleteMany({}), PatternAlert.deleteMany({}),
      MatchLead.deleteMany({}), ConsentRecord.deleteMany({}), AuditLog.deleteMany({}),
      SecureMessage.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // ============ USERS ============
    const passwordHash = await bcrypt.hash('password123', 12);

    const users = await User.insertMany([
      {
        name: 'Sarah Johnson',
        mobileNumber: '+1234567890',
        email: 'sarah@example.com',
        passwordHash,
        role: 'family',
        verificationStatus: 'verified',
        consentGiven: true
      },
      {
        name: 'Detective Maria Chen',
        mobileNumber: '+1234567891',
        email: 'maria@example.com',
        passwordHash,
        role: 'investigator',
        verificationStatus: 'verified',
        consentGiven: true
      },
      {
        name: 'Admin User',
        mobileNumber: '+1234567892',
        email: 'admin@safetrace.com',
        passwordHash,
        role: 'admin',
        verificationStatus: 'verified',
        consentGiven: true
      },
      {
        name: 'John Public',
        mobileNumber: '+1234567893',
        email: 'john@example.com',
        passwordHash,
        role: 'public',
        verificationStatus: 'verified',
        consentGiven: true
      },
      {
        name: 'Hope Foundation',
        mobileNumber: '+1234567894',
        email: 'org@hopefoundation.com',
        passwordHash,
        role: 'organization',
        verificationStatus: 'verified',
        consentGiven: true
      }
    ]);
    console.log(`Created ${users.length} users`);

    const [familyUser, investigatorUser, adminUser, publicUser, orgUser] = users;

    // ============ CASES ============
    const cases = await MissingCase.insertMany([
      {
        caseId: 'MP-1001',
        createdBy: familyUser._id,
        name: 'Aanya Sharma',
        ageWhenMissing: 15,
        estimatedCurrentAge: 16,
        dateMissing: new Date('2025-08-15'),
        lastKnownLocation: {
          address: 'Central Railway Station',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          coordinates: { lat: 18.9398, lng: 72.8355 }
        },
        physicalDescription: {
          height: '5\'2"',
          weight: '48 kg',
          hairColor: 'Black',
          eyeColor: 'Brown',
          distinguishingFeatures: 'Small birthmark on left wrist',
          additionalDetails: 'Slim build, usually wears hair in a ponytail'
        },
        clothing: 'Blue denim jacket, white t-shirt, dark jeans',
        circumstances: 'Last seen leaving school, did not return home. Was supposed to take the train from Churchgate to Borivali. Phone last active near Mumbai Central station.',
        priority: 'critical',
        status: 'active',
        riskLevel: 'CRITICAL',
        riskFactors: ['Minor', 'Recently missing', 'Last seen near transit area'],
        photos: [{ url: '/placeholder-photo.jpg', fileName: 'aanya_recent.jpg', visibility: 'authorized' }],
        visibilitySettings: { publicVisible: true, photoVisible: true, locationVisible: false, contactVisible: false },
        consentSettings: { publicSearch: true, mediaSharing: false, reunificationConsent: true, secureCommunication: true },
        contactInfo: { primaryContact: 'Priya Sharma', phone: '+91-XXXXXXXXXX', email: 'family@example.com', relationship: 'Mother' },
        timeline: [
          { date: new Date('2025-08-15T15:30:00'), event: 'Left school at 3:30 PM', source: 'School records' },
          { date: new Date('2025-08-15T16:00:00'), event: 'Seen at Churchgate station by classmate', source: 'Witness statement' },
          { date: new Date('2025-08-15T16:45:00'), event: 'Phone last active near Mumbai Central', source: 'Phone records' },
          { date: new Date('2025-08-15T19:00:00'), event: 'Reported missing by family', source: 'Police report' }
        ],
        tags: ['minor', 'transit', 'mumbai', 'school']
      },
      {
        caseId: 'MP-1002',
        createdBy: familyUser._id,
        name: 'Ravi Kumar',
        ageWhenMissing: 28,
        estimatedCurrentAge: 29,
        dateMissing: new Date('2025-06-20'),
        lastKnownLocation: {
          address: 'Sector 18 Market',
          city: 'Noida',
          state: 'Uttar Pradesh',
          country: 'India',
          coordinates: { lat: 28.5706, lng: 77.3262 }
        },
        physicalDescription: {
          height: '5\'10"',
          weight: '72 kg',
          hairColor: 'Black',
          eyeColor: 'Brown',
          distinguishingFeatures: 'Scar on right forearm from childhood accident',
          additionalDetails: 'Average build, wears glasses occasionally'
        },
        clothing: 'Grey polo shirt, beige trousers, brown leather shoes',
        circumstances: 'Left for work in the morning but never reached office. Colleagues reported his absence. Car found parked at Sector 18 market area.',
        priority: 'high',
        status: 'under_investigation',
        riskLevel: 'HIGH',
        riskFactors: ['Unexplained disappearance', 'Vehicle abandoned'],
        visibilitySettings: { publicVisible: true, photoVisible: true, locationVisible: true, contactVisible: false },
        consentSettings: { publicSearch: true, mediaSharing: true, reunificationConsent: true, secureCommunication: true },
        timeline: [
          { date: new Date('2025-06-20T08:00:00'), event: 'Left home for work', source: 'Family statement' },
          { date: new Date('2025-06-20T12:00:00'), event: 'Reported absent from office', source: 'Employer' },
          { date: new Date('2025-06-20T18:00:00'), event: 'Car found at Sector 18 parking', source: 'Police report' }
        ],
        tags: ['adult', 'noida', 'vehicle-found']
      },
      {
        caseId: 'MP-1003',
        createdBy: orgUser._id,
        name: 'Priya Patel',
        ageWhenMissing: 12,
        estimatedCurrentAge: 14,
        dateMissing: new Date('2024-03-10'),
        lastKnownLocation: {
          address: 'Near Sabarmati Riverfront',
          city: 'Ahmedabad',
          state: 'Gujarat',
          country: 'India',
          coordinates: { lat: 23.0225, lng: 72.5714 }
        },
        physicalDescription: {
          height: '4\'8"',
          weight: '35 kg',
          hairColor: 'Black',
          eyeColor: 'Dark Brown',
          distinguishingFeatures: 'Small mole on right cheek',
          additionalDetails: 'Petite build, curly hair'
        },
        clothing: 'School uniform - white shirt, blue skirt',
        circumstances: 'Did not return from school. Was last seen near the riverfront area. A similar case was reported in the same area two months prior.',
        priority: 'high',
        status: 'active',
        riskLevel: 'HIGH',
        riskFactors: ['Minor', 'Similar pattern in area', 'Near water body'],
        visibilitySettings: { publicVisible: true, photoVisible: true, locationVisible: false, contactVisible: false },
        consentSettings: { publicSearch: true, mediaSharing: false, reunificationConsent: true, secureCommunication: true },
        tags: ['minor', 'school', 'ahmedabad', 'pattern']
      },
      {
        caseId: 'MP-1004',
        createdBy: familyUser._id,
        name: 'Arjun Mehra',
        ageWhenMissing: 16,
        estimatedCurrentAge: 17,
        dateMissing: new Date('2025-07-01'),
        lastKnownLocation: {
          address: 'Railway Station Platform 3',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          coordinates: { lat: 19.0176, lng: 72.8562 }
        },
        physicalDescription: {
          height: '5\'6"',
          weight: '55 kg',
          hairColor: 'Dark Brown',
          eyeColor: 'Brown',
          distinguishingFeatures: 'Wears a silver chain',
          additionalDetails: 'Athletic build, medium complexion'
        },
        clothing: 'Blue t-shirt, dark shorts, white sneakers',
        circumstances: 'Was traveling alone by train for the first time. Did not arrive at destination. Last seen on platform 3.',
        priority: 'high',
        status: 'active',
        riskLevel: 'HIGH',
        riskFactors: ['Minor', 'Transit area', 'Traveling alone'],
        visibilitySettings: { publicVisible: true, photoVisible: true, locationVisible: false, contactVisible: false },
        consentSettings: { publicSearch: true, mediaSharing: false, reunificationConsent: true, secureCommunication: true },
        tags: ['minor', 'transit', 'mumbai', 'train']
      },
      {
        caseId: 'MP-1005',
        createdBy: investigatorUser._id,
        name: 'Meera Reddy',
        ageWhenMissing: 45,
        estimatedCurrentAge: 45,
        dateMissing: new Date('2025-09-20'),
        lastKnownLocation: {
          address: 'Jubilee Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
          coordinates: { lat: 17.4326, lng: 78.4071 }
        },
        physicalDescription: {
          height: '5\'4"',
          weight: '62 kg',
          hairColor: 'Black with grey',
          eyeColor: 'Brown',
          distinguishingFeatures: 'Wears reading glasses, gold earrings',
          additionalDetails: 'Medium build'
        },
        clothing: 'Green saree, gold bangles',
        circumstances: 'Left home for morning walk and did not return. Phone found at home.',
        priority: 'normal',
        status: 'active',
        riskLevel: 'NORMAL',
        visibilitySettings: { publicVisible: true, photoVisible: true, locationVisible: true, contactVisible: false },
        consentSettings: { publicSearch: true, mediaSharing: true, reunificationConsent: false, secureCommunication: true },
        tags: ['adult', 'hyderabad', 'morning-routine']
      },
      {
        caseId: 'MP-1006',
        createdBy: familyUser._id,
        name: 'Resolved Case - Demo',
        ageWhenMissing: 22,
        estimatedCurrentAge: 22,
        dateMissing: new Date('2025-05-01'),
        lastKnownLocation: { city: 'Delhi', state: 'Delhi', country: 'India' },
        physicalDescription: { height: '5\'8"', hairColor: 'Black', eyeColor: 'Brown' },
        clothing: 'Casual wear',
        circumstances: 'Reported missing, later found safe. Case resolved with consent-based reunification.',
        priority: 'normal',
        status: 'resolved',
        riskLevel: 'NORMAL',
        visibilitySettings: { publicVisible: false, photoVisible: false, locationVisible: false, contactVisible: false },
        consentSettings: { publicSearch: false, mediaSharing: false, reunificationConsent: true, secureCommunication: true },
        tags: ['resolved', 'adult']
      }
    ]);
    console.log(`Created ${cases.length} cases`);

    // ============ EVIDENCE ============
    const evidence = await Evidence.insertMany([
      {
        evidenceId: 'EV-001',
        caseId: 'MP-1001',
        uploadedBy: familyUser._id,
        fileName: 'aanya_school_photo.jpg',
        originalName: 'aanya_school_photo.jpg',
        fileType: 'image',
        mimeType: 'image/jpeg',
        fileSize: 2048000,
        fileHash: 'abc123hash001',
        processingStatus: 'completed',
        reviewStatus: 'approved',
        confidence: 0.85,
        extractedFacts: [
          { fact: 'Young person in school uniform', category: 'clothing', confidence: 0.92, sourceReference: { source: 'aanya_school_photo.jpg', section: 'visual_analysis' } },
          { fact: 'Indoor setting, appears to be a school environment', category: 'location', confidence: 0.88, sourceReference: { source: 'aanya_school_photo.jpg', section: 'scene_analysis' } }
        ],
        aiAnalysis: { status: 'ASSISTIVE_ANALYSIS', identityConfirmed: false, sceneDescription: 'School photograph showing a young person in uniform' }
      },
      {
        evidenceId: 'EV-002',
        caseId: 'MP-1001',
        uploadedBy: investigatorUser._id,
        fileName: 'witness_statement.pdf',
        originalName: 'witness_statement_churchgate.pdf',
        fileType: 'document',
        mimeType: 'application/pdf',
        fileSize: 512000,
        fileHash: 'abc123hash002',
        processingStatus: 'completed',
        reviewStatus: 'reviewed',
        confidence: 0.78,
        extractedText: 'Witness Statement: I saw a teenage girl wearing a blue denim jacket at Churchgate station around 4 PM on August 15. She was looking at the departure board and seemed uncertain about which train to take. She was carrying a blue school bag.',
        extractedFacts: [
          { fact: 'Teenage girl at Churchgate station around 4 PM', category: 'person', confidence: 0.85, sourceReference: { source: 'witness_statement.pdf', page: 1, section: 'paragraph_1' } },
          { fact: 'Wearing blue denim jacket', category: 'clothing', confidence: 0.90, sourceReference: { source: 'witness_statement.pdf', page: 1, section: 'paragraph_1' } },
          { fact: 'Carrying blue school bag', category: 'object', confidence: 0.88, sourceReference: { source: 'witness_statement.pdf', page: 1, section: 'paragraph_1' } },
          { fact: 'Looking at departure board, seemed uncertain', category: 'description', confidence: 0.75, sourceReference: { source: 'witness_statement.pdf', page: 1, section: 'paragraph_1' } }
        ]
      },
      {
        evidenceId: 'EV-003',
        caseId: 'MP-1001',
        uploadedBy: publicUser._id,
        fileName: 'witness_audio_railway.mp3',
        originalName: 'witness_audio_railway.mp3',
        fileType: 'audio',
        mimeType: 'audio/mpeg',
        fileSize: 3072000,
        fileHash: 'abc123hash003',
        processingStatus: 'completed',
        reviewStatus: 'reviewed',
        confidence: 0.72,
        transcript: 'I saw someone near the railway station around 8 PM. They were wearing a blue shirt and looked like a teenager. They seemed to be looking around as if they were lost or searching for someone. I noticed they had a school bag with them. They walked toward platform 5 and I lost sight of them after that.',
        extractedFacts: [
          { fact: 'Person seen near railway station around 8 PM', category: 'time', confidence: 0.85, sourceReference: { source: 'witness_audio_railway.mp3', timestamp: '00:05-00:12' } },
          { fact: 'Wearing blue shirt, looked like teenager', category: 'clothing', confidence: 0.80, sourceReference: { source: 'witness_audio_railway.mp3', timestamp: '00:12-00:18' } },
          { fact: 'Appeared lost, carrying school bag', category: 'description', confidence: 0.75, sourceReference: { source: 'witness_audio_railway.mp3', timestamp: '00:18-00:28' } },
          { fact: 'Walked toward platform 5', category: 'location', confidence: 0.82, sourceReference: { source: 'witness_audio_railway.mp3', timestamp: '00:28-00:35' } }
        ],
        sourceReferences: [
          { evidenceId: 'EV-003', source: 'witness_audio_railway.mp3', timestamp: '00:05-00:35', description: 'Complete witness audio account' }
        ]
      },
      {
        evidenceId: 'EV-004',
        caseId: 'MP-1001',
        uploadedBy: investigatorUser._id,
        fileName: 'cctv_station_entrance.mp4',
        originalName: 'cctv_station_entrance.mp4',
        fileType: 'video',
        mimeType: 'video/mp4',
        fileSize: 15728640,
        fileHash: 'abc123hash004',
        processingStatus: 'completed',
        reviewStatus: 'unreviewed',
        confidence: 0.68,
        extractedFacts: [
          { fact: 'Person in blue clothing entering station', category: 'person', confidence: 0.72, sourceReference: { source: 'cctv_station_entrance.mp4', timestamp: '00:14-00:19' } },
          { fact: 'Station entrance area, evening lighting', category: 'location', confidence: 0.85, sourceReference: { source: 'cctv_station_entrance.mp4', timestamp: '00:00-00:05' } },
          { fact: 'Person carrying a bag, walking toward platforms', category: 'description', confidence: 0.65, sourceReference: { source: 'cctv_station_entrance.mp4', timestamp: '00:19-00:25' } }
        ],
        metadata: {
          duration: 45,
          keyframes: [
            { timestamp: '00:03', description: 'Wide shot of station entrance, evening' },
            { timestamp: '00:14', description: 'Person in blue clothing walking through frame' },
            { timestamp: '00:19', description: 'Person carrying a bag near ticket counter' },
            { timestamp: '00:25', description: 'Person walking toward platform area' },
            { timestamp: '00:31', description: 'Person exits frame toward platform 5' }
          ]
        },
        sourceReferences: [
          { evidenceId: 'EV-004', source: 'cctv_station_entrance.mp4', timestamp: '00:14-00:19', description: 'Relevant information found at 00:14–00:19 in cctv_station_entrance.mp4' }
        ]
      },
      {
        evidenceId: 'EV-005',
        caseId: 'MP-1004',
        uploadedBy: familyUser._id,
        fileName: 'arjun_recent_photo.jpg',
        originalName: 'arjun_recent_photo.jpg',
        fileType: 'image',
        mimeType: 'image/jpeg',
        fileSize: 1843200,
        fileHash: 'abc123hash005',
        processingStatus: 'completed',
        reviewStatus: 'approved',
        confidence: 0.88,
        extractedFacts: [
          { fact: 'Young male person, athletic build', category: 'person', confidence: 0.90 },
          { fact: 'Blue t-shirt visible', category: 'clothing', confidence: 0.92 },
          { fact: 'Silver chain necklace', category: 'object', confidence: 0.85 }
        ]
      },
      {
        evidenceId: 'EV-006',
        caseId: 'MP-1002',
        uploadedBy: investigatorUser._id,
        fileName: 'parking_report.txt',
        originalName: 'parking_lot_incident_report.txt',
        fileType: 'text',
        mimeType: 'text/plain',
        fileSize: 4096,
        fileHash: 'abc123hash006',
        processingStatus: 'completed',
        reviewStatus: 'reviewed',
        confidence: 0.82,
        extractedText: 'Vehicle Registration: DL-XX-XXXX. Found at Sector 18 parking lot on June 20, 2025. Vehicle was locked. No signs of struggle or damage. Personal items (wallet, water bottle) found inside. Phone not in vehicle.',
        extractedFacts: [
          { fact: 'Vehicle found locked, no damage', category: 'object', confidence: 0.95 },
          { fact: 'Personal items inside vehicle', category: 'object', confidence: 0.90 },
          { fact: 'Phone not found in vehicle', category: 'other', confidence: 0.88 }
        ]
      }
    ]);
    console.log(`Created ${evidence.length} evidence items`);

    // ============ SIGHTINGS ============
    const sightings = await Sighting.insertMany([
      {
        sightingId: 'SG-001',
        submittedBy: publicUser._id,
        location: { address: 'Near Dadar Station', city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: { lat: 19.0186, lng: 72.8426 } },
        date: new Date('2025-08-16'),
        approximateTime: '8:30 PM',
        description: 'Saw a teenage girl who appeared lost near Dadar station. She was wearing a blue jacket and carrying a school bag. She was asking people about trains to Borivali.',
        clothing: 'Blue jacket, appeared to be a denim material, dark colored pants',
        approximateAge: 15,
        witnessNotes: 'She seemed tired and was sitting on a bench for a while before getting up and walking toward the western line platforms.',
        relatedCaseIds: ['MP-1001'],
        reviewStatus: 'under_review',
        consentConfirmed: true,
        aiAnalysis: {
          potentialMatches: [{
            caseId: 'MP-1001',
            relevanceScore: 0.78,
            supportingFactors: ['Similar age range (15)', 'Blue jacket matches description', 'Railway station location', 'School bag mentioned in both reports'],
            contradictingFactors: ['Time discrepancy (sighting next day)', 'Different station (Dadar vs Mumbai Central)'],
            sourceReferences: [{ source: 'sighting_analysis', description: 'AI-assisted comparison with case MP-1001' }]
          }],
          confidence: 'MODERATE',
          missingInformation: ['Photo from sighting', 'Direction of travel after platforms'],
          nextAction: 'Potential lead — human verification required'
        }
      },
      {
        sightingId: 'SG-002',
        submittedBy: orgUser._id,
        location: { address: 'Bus Stand', city: 'Pune', state: 'Maharashtra', country: 'India', coordinates: { lat: 18.5204, lng: 73.8567 } },
        date: new Date('2025-08-20'),
        approximateTime: '2:00 PM',
        description: 'A young person matching the description in recent missing person reports was seen at the bus stand. Appeared to be traveling alone.',
        clothing: 'Light blue shirt, jeans',
        approximateAge: 16,
        relatedCaseIds: ['MP-1001', 'MP-1004'],
        reviewStatus: 'pending',
        consentConfirmed: true
      },
      {
        sightingId: 'SG-003',
        submittedBy: publicUser._id,
        location: { address: 'Market Area', city: 'Noida', state: 'Uttar Pradesh', country: 'India', coordinates: { lat: 28.5706, lng: 77.3262 } },
        date: new Date('2025-06-25'),
        approximateTime: '11:00 AM',
        description: 'Person matching description of missing adult male seen near market area. Was wearing glasses and appeared disoriented.',
        clothing: 'Grey shirt, dark trousers',
        approximateAge: 28,
        relatedCaseIds: ['MP-1002'],
        reviewStatus: 'verified',
        consentConfirmed: true
      },
      {
        sightingId: 'SG-004',
        submittedBy: publicUser._id,
        location: { address: 'Near River Bridge', city: 'Ahmedabad', state: 'Gujarat', country: 'India', coordinates: { lat: 23.0300, lng: 72.5800 } },
        date: new Date('2025-09-05'),
        approximateTime: '4:30 PM',
        description: 'Young girl in school uniform seen near the river bridge area, walking alone. Appeared to be around 12-13 years old.',
        clothing: 'White shirt, blue skirt (school uniform)',
        approximateAge: 13,
        relatedCaseIds: ['MP-1003'],
        reviewStatus: 'pending',
        consentConfirmed: true
      }
    ]);
    console.log(`Created ${sightings.length} sightings`);

    // ============ CASE CLUSTERS ============
    const clusters = await CaseCluster.insertMany([
      {
        clusterId: 'CL-001',
        title: 'Mumbai Railway Station Cases',
        caseIds: ['MP-1001', 'MP-1004'],
        evidenceIds: ['EV-001', 'EV-003', 'EV-004', 'EV-005'],
        sightingIds: ['SG-001', 'SG-002'],
        relationshipType: 'GEOGRAPHIC_PATTERN',
        similarityScore: 0.82,
        sharedAttributes: [
          { attribute: 'location', value: 'Mumbai Railway Stations', matchCount: 2 },
          { attribute: 'age_range', value: '15-16 years', matchCount: 2 },
          { attribute: 'clothing_color', value: 'Blue clothing', matchCount: 2 },
          { attribute: 'transit_related', value: 'Railway station', matchCount: 2 }
        ],
        explanation: 'Two cases share similar geographic characteristics (Mumbai railway stations), similar age ranges (15-16), similar clothing descriptions (blue), and both were last seen at or near railway stations. This pattern may indicate a connection worth investigating.',
        supportingEvidence: ['Both cases near railway stations', 'Similar age group', 'Blue clothing in both descriptions', 'Similar time period'],
        contradictingEvidence: ['Different specific stations', 'Some physical description differences'],
        reviewStatus: 'pending'
      },
      {
        clusterId: 'CL-002',
        title: 'Possible Duplicate - Pune Bus Stand Sighting',
        caseIds: ['MP-1001'],
        sightingIds: ['SG-002'],
        relationshipType: 'POSSIBLE_DUPLICATE',
        similarityScore: 0.65,
        sharedAttributes: [
          { attribute: 'age_range', value: '15-16', matchCount: 1 },
          { attribute: 'clothing', value: 'Blue clothing', matchCount: 1 }
        ],
        explanation: 'Sighting SG-002 may relate to case MP-1001 or MP-1004. Similar age range and clothing color. However, the location (Pune) is different from both cases\' last known locations (Mumbai). Further investigation needed.',
        supportingEvidence: ['Similar age', 'Similar clothing color'],
        contradictingEvidence: ['Different city', 'Limited description available'],
        reviewStatus: 'pending'
      },
      {
        clusterId: 'CL-003',
        title: 'Ahmedabad Riverfront Area Pattern',
        caseIds: ['MP-1003'],
        sightingIds: ['SG-004'],
        relationshipType: 'TEMPORAL_PATTERN',
        similarityScore: 0.71,
        sharedAttributes: [
          { attribute: 'location', value: 'Ahmedabad riverfront area', matchCount: 1 },
          { attribute: 'clothing', value: 'School uniform', matchCount: 1 },
          { attribute: 'age_range', value: '12-13 years', matchCount: 1 }
        ],
        explanation: 'Case and sighting both relate to the Ahmedabad riverfront area. The case mentions similar incidents in the same area. The sighting describes a young person in school uniform, matching the case description.',
        reviewStatus: 'under_review'
      }
    ]);
    console.log(`Created ${clusters.length} case clusters`);

    // ============ PATTERN ALERTS ============
    const alerts = await PatternAlert.insertMany([
      {
        alertId: 'PA-001',
        type: 'geographic_cluster',
        title: 'Multiple Missing Persons Near Mumbai Railway Stations',
        relatedCaseIds: ['MP-1001', 'MP-1004'],
        relatedSightingIds: ['SG-001', 'SG-002'],
        relatedEvidenceIds: ['EV-003', 'EV-004'],
        locationSummary: 'Mumbai, Maharashtra - Multiple railway stations (Churchgate, Mumbai Central, Dadar)',
        timeSummary: 'July-August 2025 (2 cases within 6 weeks)',
        explanation: 'Two minors missing from Mumbai railway station areas within a 6-week period. Both aged 15-16, both described wearing blue clothing, both last seen near railway platforms. This geographic and temporal cluster may warrant coordinated investigation.',
        confidence: 0.75,
        severity: 'high',
        reviewStatus: 'pending'
      },
      {
        alertId: 'PA-002',
        type: 'temporal_pattern',
        title: 'School-Age Children Missing After School Hours',
        relatedCaseIds: ['MP-1001', 'MP-1003', 'MP-1004'],
        locationSummary: 'Multiple cities - Mumbai, Ahmedabad',
        timeSummary: 'Pattern of disappearances after school hours (3-5 PM)',
        explanation: 'Three cases involving school-age children who went missing after school hours. While in different cities, the timing pattern (after school dismissal) and age range (12-16) may indicate a broader pattern worth monitoring.',
        confidence: 0.55,
        severity: 'medium',
        reviewStatus: 'pending'
      },
      {
        alertId: 'PA-003',
        type: 'similar_descriptions',
        title: 'Similar Clothing Descriptions Across Sightings',
        relatedCaseIds: ['MP-1001', 'MP-1004'],
        relatedSightingIds: ['SG-001', 'SG-002'],
        explanation: 'Multiple sightings describe persons wearing blue clothing near transit areas. While this may be coincidental, the consistency of descriptions across independent sightings suggests these reports may relate to the same person or situation.',
        confidence: 0.62,
        severity: 'medium',
        reviewStatus: 'pending'
      }
    ]);
    console.log(`Created ${alerts.length} pattern alerts`);

    // ============ MATCH LEADS ============
    const leads = await MatchLead.insertMany([
      {
        leadId: 'LD-001',
        caseId: 'MP-1001',
        sightingId: 'SG-001',
        supportingFactors: [
          'Similar age (15 years)',
          'Blue jacket matches case description',
          'Railway station location matches case area',
          'School bag mentioned in both reports',
          'Asking about trains to Borivali (case destination)'
        ],
        contradictingFactors: [
          'Sighting is one day after disappearance',
          'Different specific station (Dadar vs Mumbai Central)',
          'Time of sighting (8:30 PM) differs from last known activity'
        ],
        sourceEvidence: [
          { evidenceId: 'EV-003', source: 'witness_audio_railway.mp3', timestamp: '00:12-00:18', description: 'Audio describes blue clothing at station' },
          { evidenceId: 'EV-004', source: 'cctv_station_entrance.mp4', timestamp: '00:14-00:19', description: 'CCTV shows person in blue at station' }
        ],
        confidence: 'MODERATE',
        confidenceScore: 0.78,
        status: 'POTENTIAL_LEAD',
        identityConfirmed: false,
        missingInformation: ['Clear photo from sighting location', 'Platform camera footage from Dadar', 'Witness follow-up'],
        nextAction: 'Potential lead — human verification required. Recommend reviewing Dadar station CCTV footage for the reported time.'
      },
      {
        leadId: 'LD-002',
        caseId: 'MP-1002',
        sightingId: 'SG-003',
        supportingFactors: [
          'Same location area (Noida market)',
          'Similar physical description (glasses)',
          'Approximate age match (28)',
          'Grey shirt matches clothing description'
        ],
        contradictingFactors: [
          '5-day gap between disappearance and sighting',
          'Description mentions disorientation'
        ],
        confidence: 'MODERATE',
        confidenceScore: 0.72,
        status: 'UNDER_REVIEW',
        identityConfirmed: false,
        humanReview: {
          reviewedBy: investigatorUser._id,
          reviewedAt: new Date('2025-09-15'),
          action: 'under_review',
          notes: 'Reviewing additional market area CCTV footage. Requesting follow-up with witness for more details.',
          previousStatus: 'POTENTIAL_LEAD',
          newStatus: 'UNDER_REVIEW'
        },
        missingInformation: ['CCTV footage from market area', 'Witness contact for follow-up'],
        nextAction: 'Under review by investigator. Awaiting additional CCTV footage.'
      },
      {
        leadId: 'LD-003',
        caseId: 'MP-1003',
        sightingId: 'SG-004',
        supportingFactors: [
          'Similar location (Ahmedabad riverfront area)',
          'School uniform matches description',
          'Age range matches (12-13)'
        ],
        contradictingFactors: [
          'Extended time since disappearance (6 months)',
          'Limited physical description in sighting'
        ],
        confidence: 'LOW',
        confidenceScore: 0.55,
        status: 'NEEDS_MORE_INFO',
        identityConfirmed: false,
        missingInformation: ['Updated photo', 'More detailed physical description', 'Direction of travel'],
        nextAction: 'Additional information needed. Request more detailed witness statement.'
      },
      {
        leadId: 'LD-004',
        caseId: 'MP-1001',
        sightingId: 'SG-002',
        supportingFactors: ['Age range match', 'Blue clothing'],
        contradictingFactors: ['Different city (Pune)', 'Limited details', 'Time gap'],
        confidence: 'LOW',
        confidenceScore: 0.42,
        status: 'REJECTED',
        identityConfirmed: false,
        humanReview: {
          reviewedBy: investigatorUser._id,
          reviewedAt: new Date('2025-09-10'),
          action: 'reject',
          notes: 'Insufficient evidence to establish connection. Description too generic. Pune location does not align with known movements.',
          previousStatus: 'POTENTIAL_LEAD',
          newStatus: 'REJECTED'
        },
        nextAction: 'Lead rejected after review. Generic description insufficient for connection.'
      }
    ]);
    console.log(`Created ${leads.length} match leads`);

    // ============ CONSENT RECORDS ============
    const consents = await ConsentRecord.insertMany([
      { userId: familyUser._id, caseId: 'MP-1001', consentType: 'public_visibility', granted: true },
      { userId: familyUser._id, caseId: 'MP-1001', consentType: 'photo_sharing', granted: true },
      { userId: familyUser._id, caseId: 'MP-1001', consentType: 'secure_communication', granted: true },
      { userId: familyUser._id, caseId: 'MP-1001', consentType: 'reunification', granted: true },
      { userId: familyUser._id, caseId: 'MP-1001', consentType: 'location_sharing', granted: false },
      { userId: familyUser._id, caseId: 'MP-1006', consentType: 'public_visibility', granted: false, revokedAt: new Date() }
    ]);
    console.log(`Created ${consents.length} consent records`);

    // ============ AUDIT LOGS ============
    const auditLogs = await AuditLog.insertMany([
      { userId: familyUser._id, userName: 'Sarah Johnson', action: 'CASE_CREATED', caseId: 'MP-1001', targetType: 'case', description: 'Case created: Aanya Sharma' },
      { userId: investigatorUser._id, userName: 'Detective Maria Chen', action: 'EVIDENCE_UPLOADED', caseId: 'MP-1001', evidenceId: 'EV-002', targetType: 'evidence', description: 'Witness statement uploaded' },
      { userId: investigatorUser._id, userName: 'Detective Maria Chen', action: 'AI_EVIDENCE_ANALYSIS', caseId: 'MP-1001', evidenceId: 'EV-003', targetType: 'evidence', description: 'AI analysis run on audio evidence' },
      { userId: publicUser._id, userName: 'John Public', action: 'SIGHTING_SUBMITTED', targetType: 'sighting', description: 'Sighting submitted near Dadar Station' },
      { userId: investigatorUser._id, userName: 'Detective Maria Chen', action: 'LEAD_REVIEWED', caseId: 'MP-1001', targetType: 'lead', description: 'Lead LD-004 rejected: insufficient evidence' },
      { userId: investigatorUser._id, userName: 'Detective Maria Chen', action: 'CASE_VIEWED', caseId: 'MP-1001', targetType: 'case', description: 'Case viewed for review' },
      { userId: adminUser._id, userName: 'Admin User', action: 'USER_STATUS_UPDATED', targetType: 'user', description: 'User role updated' },
      { userId: familyUser._id, userName: 'Sarah Johnson', action: 'CONSENT_CREATED', caseId: 'MP-1001', targetType: 'consent', description: 'Consent for public visibility: granted' }
    ]);
    console.log(`Created ${auditLogs.length} audit logs`);

    // ============ SECURE MESSAGES ============
    const messages = await SecureMessage.insertMany([
      {
        senderId: investigatorUser._id,
        receiverId: familyUser._id,
        caseId: 'MP-1001',
        message: 'We have received a potential sighting report near Dadar station. Our team is reviewing the CCTV footage from that area. We will update you once the review is complete. Please do not share this information publicly.',
        messageType: 'text'
      },
      {
        senderId: familyUser._id,
        receiverId: investigatorUser._id,
        caseId: 'MP-1001',
        message: 'Thank you for the update. We are hoping for the best. Is there anything else we can provide to help with the investigation?',
        messageType: 'text'
      },
      {
        senderId: investigatorUser._id,
        receiverId: familyUser._id,
        caseId: 'MP-1001',
        message: 'If you have any recent photographs or know of any friends she might contact, please share that information through the secure channel. Also, any social media accounts she may use would be helpful.',
        messageType: 'text'
      }
    ]);
    console.log(`Created ${messages.length} secure messages`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('   Family Member: sarah@example.com / password123');
    console.log('   Investigator:  maria@example.com / password123');
    console.log('   Admin:         admin@safetrace.com / password123');
    console.log('   Public User:   john@example.com / password123');
    console.log('   Organization:  org@hopefoundation.com / password123');
    console.log('\n   All accounts use password: password123');
    console.log('   Mock OTP code: 123456\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
