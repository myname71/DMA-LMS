import { Course, User, SubscriptionPlan } from '../types';

export const DEMO_USERS: { [key: string]: User } = {
  student: {
    id: 'u_student',
    name: 'Alex Rivera (Student)',
    email: 'student@digitalmanufacturing.academy',
    role: 'student',
    joinedAt: '2025-01-10',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    subscriptionPlan: 'pro',
  },
  instructor: {
    id: 'u_instructor',
    name: 'Prof. Dr. Abdur Rahman (Instructor)',
    email: 'instructor@digitalmanufacturing.academy',
    role: 'instructor',
    joinedAt: '2024-05-15',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    isApproved: true,
  },
  admin: {
    id: 'u_admin',
    name: 'Sarah Connor (Admin)',
    email: 'admin@digitalmanufacturing.academy',
    role: 'admin',
    joinedAt: '2024-01-01',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
  },
  super_admin: {
    id: 'u_super_admin',
    name: 'Director James Smith (Super Admin)',
    email: 'superadmin@digitalmanufacturing.academy',
    role: 'super_admin',
    joinedAt: '2023-01-01',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  },
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    billing: 'forever',
    features: [
      'Access to 5 core introductory courses',
      'Downloadable PDF manuals and resource guides',
      'Mobile-friendly lecture materials',
      'Standard community forum access',
      'No certificate of completion',
    ],
  },
  {
    id: 'pro',
    name: 'Advanced',
    price: '৳999',
    billing: 'year',
    features: [
      'Access to all 12+ Industry 4.0 courses',
      'Direct interaction with BCU & AIUB expert team',
      'Advanced hands-on simulator resources',
      'Verified academic certificates of completion',
      'Comprehensive preparation for global manufacturing roles',
      'Dynamic quiz attempts & detailed grading metrics',
    ],
  },
  {
    id: 'enterprise',
    name: 'Professional',
    price: '৳1,999',
    billing: 'year',
    features: [
      'Unlimited employee licenses (up to 15 users)',
      'Custom sub-categories & localized organization trackers',
      'Custom learning path generation with AI helper',
      'Dedicated technical advisor from BCU/AIUB researchers',
      'Direct API integrations with corporate HR portals',
      'On-demand custom workshop webinars',
    ],
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c_1',
    title: 'Introduction to Digital Twins & Smart Infrastructure',
    headline: 'Build a fully synchronized virtual twin of physical industrial assets',
    description: 'A comprehensive starter program structured by BCU investigators. Explores IoT data structures, visual asset geometry in CAD/CAM, and bridging real-time telemetry to Unity-based virtual mockups.',
    category: 'Digital Twin',
    level: 'Beginner',
    duration: '14 Hours',
    instructorId: 'u_instructor',
    instructorName: 'Prof. Dr. Abdur Rahman',
    price: 49,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
    lessons: [
      { id: 'l_1_1', title: 'Introduction to Cyber-Physical Systems (CPS)', duration: '15 mins', type: 'video', contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isRequired: true },
      { id: 'l_1_2', title: 'Digital Twins: Core Blueprint Document', duration: '35 mins', type: 'pdf', contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isRequired: true },
      { id: 'l_1_3', title: 'Setting up sensor arrays with MQTT protocols', duration: '22 mins', type: 'video', contentUrl: 'https://www.w3schools.com/html/movie.mp4', isRequired: true },
      { id: 'l_1_4', title: 'Project Assignment: Simple Twin Definition', duration: '60 mins', type: 'assignment', contentUrl: 'Submit a PDF specifying your chosen dual-system architecture.', isRequired: true },
    ],
    quizzes: [
      {
        id: 'q_1_1',
        title: 'MQTT & Virtual Synchronicity Assessment',
        passingScore: 80,
        questions: [
          { id: 'qq_1_1_1', question: 'What constitutes the core function of a Digital Twin of a pump system?', options: ['To show photos of the pump in different angles', 'Real-time physical asset simulation and parameter modeling via sensor feeds', 'To calculate shipping times', 'To provide offline print instruction leaflets only'], correctAnswer: 1 },
          { id: 'qq_1_1_2', question: 'Which protocol is most widely used for sparse, high-frequency IoT data payloads?', options: ['HTTP POST', 'MQTT / AMQP', 'FTP', 'SMTP'], correctAnswer: 1 },
        ],
      },
    ],
    assignments: [{ id: 'a_1_1', title: 'Building an MQTT Broker Topology Diagram', description: 'Provide an architecture document showing data flow from physical nodes to an Express endpoint and CAD canvas.', dueDate: 'Within 7 days', status: 'pending' }],
    reviews: [{ id: 'rv_1', userId: 'u_student_rev1', userName: 'Marcus Aurelio', rating: 5, comment: 'Amazing course. It describes exactly what we are deploying in our automotive plant.', date: '2025-05-18' }],
    enrollmentCount: 1620,
    ratingAverage: 4.8,
    isPublished: true,
  },
  {
    id: 'c_2',
    title: 'Industrial Robotics, CNC Machining & PLC Programming',
    headline: 'Program complex assembly loops and smart manufacturing schedules',
    description: 'An advanced curriculum focusing on 6-axis arm programming, G-code Generation, ladder logic, Siemens S7-1200 setups, and real-time safety protocols in smart manufacturing layouts.',
    category: 'Industrial Robotics',
    level: 'Advanced',
    duration: '22 Hours',
    instructorId: 'u_instructor',
    instructorName: 'Prof Javaid Butt',
    price: 89,
    image: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=600&h=400&fit=crop',
    lessons: [
      { id: 'l_2_1', title: 'Introduction to Ladder Logic for PLC Modulators', duration: '25 mins', type: 'video', contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isRequired: true },
      { id: 'l_2_2', title: 'Industrial Robotic Arm Safety Zones and Guard Rails', duration: '18 mins', type: 'video', contentUrl: 'https://www.w3schools.com/html/movie.mp4', isRequired: true },
      { id: 'l_2_3', title: 'G-Code Optimization Reference Manual', duration: '45 mins', type: 'pdf', contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isRequired: true },
    ],
    quizzes: [
      {
        id: 'q_2_1',
        title: 'Ladder Logic & CNC G-Code Quiz',
        passingScore: 75,
        questions: [
          { id: 'qq_2_1_1', question: 'What is the function of the G01 command in CNC programming?', options: ['Rapid travel position search', 'Linear intervention feed interpolation', 'Circular rotation interpolation', 'Pause application for coolant induction'], correctAnswer: 1 },
        ],
      },
    ],
    assignments: [],
    reviews: [{ id: 'rv_2', userId: 'u_student_rev2', userName: 'Liam Sterling', rating: 4, comment: 'Very informative and covers PLC parameters extremely well.', date: '2025-06-01' }],
    enrollmentCount: 940,
    ratingAverage: 4.7,
    isPublished: true,
  },
  {
    id: 'c_3',
    title: 'Sustainable Manufacturing & Circular Economy Strategy',
    headline: 'Incorporate eco-friendly paradigms and waste reduction algorithms into manufacturing lines',
    description: 'Examines Carbon-Footprint audits, lifecycle indices, recycling-optimization metrics, and power regulation for Industry 4.0 plants.',
    category: 'Sustainability',
    level: 'Intermediate',
    duration: '10 Hours',
    instructorId: 'u_instructor',
    instructorName: 'Dr. Chowdhury Akram',
    price: 39,
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
    lessons: [
      { id: 'l_3_1', title: 'Defining Circular Life-Cycles in Multi-Material Fabrication', duration: '30 mins', type: 'video', contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isRequired: true },
      { id: 'l_3_2', title: 'LEED Certification Matrix for Factories', duration: '20 mins', type: 'pdf', contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isRequired: false },
    ],
    quizzes: [],
    assignments: [],
    reviews: [],
    enrollmentCount: 420,
    ratingAverage: 4.9,
    isPublished: true,
  },
];

export const GENERAL_FAQS = [
  {
    question: 'Who administers the Digital Manufacturing Academy certifications?',
    answer: 'The certification is co-developed and authenticated by investigators and experts from Birmingham City University (UK) and American International University in Bangladesh (AIUB) under the British Council Going Global Partnerships grant.',
  },
  {
    question: 'How do I earn Course Certificates?',
    answer: 'Once you enroll in an open course, you watch the core curriculum video lessons, read associated PDF reference materials, submit the assignments, and achieve a passing grade on the integrated quizzes. Upon fulfilling these milestones, the system automatically triggers a cryptographic dynamic certificate of completion.',
  },
  {
    question: 'Can I publish a course as an outside Instructor?',
    answer: 'Yes! Certified Industry 4.5 instructors can sign up, access the Course Creation wizard, upload PDFs/videos, structure quizzes, write lessons, publish the draft, and manage student analytical trackers inside their customized Instructor panel.',
  },
  {
    question: 'Is there support for offline setup and downloadable database schemas?',
    answer: 'Yes, we provide the complete production PostgreSQL/MySQL schema, SQL migrations, and local optimization instructions inside the built-in Code Hub on the platform.',
  },
];
