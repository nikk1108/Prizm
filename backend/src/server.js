import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import { configureCloudinary } from './config/cloudinary.js';
import Field from './models/Field.js';
import Roadmap from './models/Roadmap.js';
import RoadmapStep from './models/RoadmapStep.js';

// Setup port mapping
const PORT = process.env.PORT || 5000;

// Connect to Database
await connectDB();

// Configure Cloudinary media loader
configureCloudinary();

// Helper to seed Field categories on startup
const seedDefaultFields = async () => {
  try {
    const categoryTree = [
      {
        name: 'Computer Science',
        description: 'Theoretical study of computation, algorithms, and complexity.',
        subfields: [
          {
            name: 'Software Engineering',
            description: 'Design, development, and scalable testing methodologies.',
            topics: [
              { name: 'System Design', description: 'Orchestrating microservices, proxies, load balancers, and caches.' },
              { name: 'Compiler Design', description: 'Lexical analysis, intermediate representation, and syntax trees.' },
              { name: 'Distributed Systems', description: 'Consensus protocols (Paxos, Raft), state replication, and message queues.' },
              { name: 'Algorithms', description: 'Complex algorithmic studies, optimization, and time complexity.' },
              { name: 'Data Structures', description: 'Stacks, trees, queues, graphs, and memory management layouts.' },
              { name: 'Competitive Programming', description: 'Algorithmic puzzle solving, mathematical optimizations, and efficiency challenges.' }
            ]
          },
          {
            name: 'Artificial Intelligence',
            description: 'Cognitive agents, deep networks, and reasoning models.',
            topics: [
              { name: 'Machine Learning', description: 'Statistical learning models and empirical data analysis.' },
              { name: 'Deep Learning', description: 'Multi-layer neural networks, backpropagation, and optimization.' },
              { name: 'LLMs', description: 'Transformer design, pretraining, fine-tuning, and language models.' },
              { name: 'Generative AI', description: 'Generative models, GANs, and diffusion structures.' },
              { name: 'NLP', description: 'Natural Language Processing and syntactic representation.' },
              { name: 'Computer Vision', description: 'Visual pattern recognition, tracking, and image segmentation.' }
            ]
          },
          {
            name: 'Infrastructure & DevOps',
            description: 'Site reliability, automated provisioning, and virtualization.',
            topics: [
              { name: 'Cloud Computing', description: 'Compute clusters, virtualization, and serverless backends.' },
              { name: 'DevOps', description: 'Continuous integration and infrastructure as code.' },
              { name: 'Site Reliability Engineering', description: 'Service level objectives, latency tracking, and resilience engineering.' }
            ]
          },
          {
            name: 'Security & Low Level Systems',
            description: 'Silicon configurations, operating system kernels, and security.',
            topics: [
              { name: 'Cyber Security', description: 'Network defenses, key architectures, and access control.' },
              { name: 'Ethical Hacking', description: 'Exploitation, penetration testing, and reverse engineering.' },
              { name: 'Operating Systems', description: 'Kernel logic, process schedulers, and memory virtualizers.' },
              { name: 'Computer Networks', description: 'Socket programming, routing layers, and overlay networks.' },
              { name: 'Blockchain', description: 'Smart contracts, consensus mechanisms, and Web3 frameworks.' },
              { name: 'Robotics', description: 'Feedback loops, path planning, and physical sensors.' },
              { name: 'Embedded Systems', description: 'RTOS microcontrollers and custom firmware interfaces.' },
              { name: 'IoT', description: 'Edge nodes, sensor networks, and device metrics.' }
            ]
          },
          {
            name: 'Hardware Design',
            description: 'Integrated circuits, logic grids, and chip board creation.',
            topics: [
              { name: 'VLSI', description: 'Very Large Scale Integration and silicon routing.' },
              { name: 'FPGA', description: 'Programmable logic arrays and hardware descriptions.' },
              { name: 'ASIC', description: 'Application-specific integrated circuit design.' },
              { name: 'PCB Design', description: 'Printed circuit board layout and schematic routing.' },
              { name: 'Electronics', description: 'Semiconductor behaviors, filters, and analog circuits.' }
            ]
          },
          {
            name: 'Web & Mobile Development',
            description: 'Client architectures, native packages, and interactive rendering.',
            topics: [
              { name: 'Web Development', description: 'Full stack browser and server integrations.' },
              { name: 'Frontend', description: 'Browser runtimes, design systems, and render engines.' },
              { name: 'Backend', description: 'API routing, data models, and queue processes.' },
              { name: 'Full Stack', description: 'Unified web stack development.' },
              { name: 'Game Development', description: 'Physics simulators, render passes, and loop managers.' },
              { name: 'Mobile Development', description: 'iOS/Android applications and cross-platform native SDKs.' },
              { name: 'AR/VR', description: '3D rendering, spatial UI, and interactive headsets.' }
            ]
          }
        ]
      },
      {
        name: 'Engineering',
        description: 'Physical system design, structures, mechanics, and renewable cycles.',
        subfields: [
          { name: 'Electrical Engineering', description: 'Grid distribution, power machinery, and control logic.' },
          { name: 'Mechanical Engineering', description: 'Thermodynamics, fluid configurations, and stress analytics.' },
          { name: 'Civil Engineering', description: 'Structural concrete, soil mechanics, and seismic design.' },
          { name: 'Chemical Engineering', description: 'Reaction rates, heat mass transfer, and refinery processes.' },
          { name: 'Aerospace Engineering', description: 'Aerodynamic lift, orbits, and engine mechanics.' },
          { name: 'Renewable Energy', description: 'Solar panels, battery arrays, and wind farms.' }
        ]
      },
      {
        name: 'Sciences',
        description: 'Empirical natural systems, cellular life, and medical sciences.',
        subfields: [
          {
            name: 'Physics & Chemistry',
            description: 'Atomic properties, thermodynamics, and cosmic equations.',
            topics: [
              { name: 'Physics', description: 'Classical and mathematical physics models.' },
              { name: 'Quantum Physics', description: 'Superpositions, wave functions, and subatomic states.' },
              { name: 'Astrophysics', description: 'Stellar lifespans, black holes, and cosmology.' },
              { name: 'Chemistry', description: 'Chemical reactions, kinetics, and syntheses.' },
              { name: 'Biochemistry', description: 'Enzymes, metabolic grids, and cellular reactions.' }
            ]
          },
          {
            name: 'Biology & Biotech',
            description: 'Microscopic agents, gene sequences, and ecosystems.',
            topics: [
              { name: 'Biotechnology', description: 'Gene splicing, bio-reactors, and industrial processes.' },
              { name: 'Bioinformatics', description: 'Aligning genomes, sequencing, and protein folds.' },
              { name: 'Genetics', description: 'Heredity, DNA transcription, and CRISPR edits.' },
              { name: 'Microbiology', description: 'Virology, bacteria counts, and infectious logic.' },
              { name: 'Neuroscience', description: 'Synaptic connections, sensory nets, and cognitive loops.' }
            ]
          },
          {
            name: 'Medical Sciences',
            description: 'Human pathology, clinical procedures, and pharmacological remedies.',
            topics: [
              { name: 'Medicine', description: 'General diagnosis, surgery, and human health.' },
              { name: 'Dentistry', description: 'Oral medicine, tooth engineering, and gums care.' },
              { name: 'Pharmacy', description: 'Drug formulations, pharmacokinetics, and clinical trial models.' },
              { name: 'Psychology', description: 'Behavior analysis, clinical therapies, and cognitive patterns.' }
            ]
          }
        ]
      },
      {
        name: 'Mathematics & Business',
        description: 'Numerical proofs, economic models, and venture prioritizing.',
        subfields: [
          { name: 'Mathematics', description: 'Calculus, linear algebra, number theory, and proofs.' },
          { name: 'Statistics', description: 'Bayesian statistics, regressions, and hypothesis testing.' },
          { name: 'Economics', description: 'Microeconomics, macro flows, and market indicators.' },
          {
            name: 'Finance & Markets',
            description: 'Asset valuations, stock mechanics, and risk portfolios.',
            topics: [
              { name: 'Finance', description: 'Corporate finance and capital valuation models.' },
              { name: 'Quantitative Finance', description: 'Derivative pricings, stochastic equations, and pricing grids.' },
              { name: 'Algorithmic Trading', description: 'High frequency loops, arbitrage, and statistical trades.' }
            ]
          },
          { name: 'Marketing', description: 'Ad campaigns, target conversions, and consumer flows.' },
          { name: 'Product Management', description: 'Product requirements, priorities, and Agile sprints.' },
          { name: 'Entrepreneurship', description: 'Startup launches, seed capital, and growth systems.' }
        ]
      },
      {
        name: 'Creative Design & Humanities',
        description: 'Human histories, artistic interfaces, and spatial architecture.',
        subfields: [
          { name: 'Architecture', description: 'Drafting scales, material loads, and environmental specs.' },
          {
            name: 'Design & Media',
            description: 'Color configurations, pixel grids, and camera framing.',
            topics: [
              { name: 'Graphic Design', description: 'Typography schemes, vector files, and branding layout.' },
              { name: 'UI/UX', description: 'User flows, wireframes, and design components.' },
              { name: 'Animation', description: 'Keyframe curves, 2D/3D rigs, and timeline speeds.' },
              { name: 'Photography', description: 'Exposure levels, lens focal scopes, and light balances.' }
            ]
          },
          { name: 'Law', description: 'Legal histories, contract rules, and tort cases.' },
          { name: 'History', description: 'World historical events, records, and timelines.' },
          { name: 'Geography', description: 'Mapping landforms, coordinates, and GIS data.' },
          { name: 'Education', description: 'Curriculum plans, teaching models, and school logic.' },
          { name: 'Agriculture', description: 'Soil health, crop yields, and watering plans.' },
          { name: 'Environmental Science', description: 'Climate variables, emissions offsets, and conservation.' },
          { name: 'Food Technology', description: 'Nutrient packaging, processing methods, and preservation.' },
          { name: 'Linguistics', description: 'Phonology details, grammar structures, and syntactic trees.' },
          { name: 'Philosophy', description: 'Epistemology studies, ethics, and formal logical systems.' }
        ]
      }
    ];

    const createFieldRecord = async (name, description, parentId = null) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let field = await Field.findOne({ slug });
      if (!field) {
        field = await Field.create({
          name: name.trim(),
          slug,
          description: description || `Study category for ${name}`,
          parentField: parentId
        });
        console.log(`[Seed] Created Field: ${field.hierarchyPath || field.name}`);
      }
      return field;
    };

    for (const root of categoryTree) {
      const rootField = await createFieldRecord(root.name, root.description);
      
      if (root.subfields) {
        for (const sub of root.subfields) {
          const subField = await createFieldRecord(sub.name, sub.description, rootField._id);
          
          if (sub.topics) {
            for (const topic of sub.topics) {
              await createFieldRecord(topic.name, topic.description, subField._id);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(`[Seed Error] Could not pre-populate fields: ${error.message}`);
  }
};

const seedDefaultRoadmaps = async () => {
  try {
    const aiField = await Field.findOne({ slug: 'artificial-intelligence' });
    if (!aiField) return;

    const roadmapSlug = 'artificial-intelligence-curriculum';
    let roadmap = await Roadmap.findOne({ slug: roadmapSlug });
    if (!roadmap) {
      roadmap = await Roadmap.create({
        field: aiField._id,
        title: 'Artificial Intelligence Foundations',
        slug: roadmapSlug,
        description: 'Comprehensive pathway covering machine learning, deep neural networks, and prompt engineering.',
        difficulty: 'beginner'
      });
      console.log(`[Seed] Created Roadmap: ${roadmap.title}`);

      const steps = [
        { title: 'Linear Algebra & Calculus', description: 'Understand vector spaces, eigenvalues, gradients, and chain rule computations.', order: 1 },
        { title: 'Supervised Learning', description: 'Implement linear regression, classification trees, and support vector models.', order: 2 },
        { title: 'Deep Neural Networks', description: 'Train multilayer perceptrons, configure loss dynamics, and use backpropagation.', order: 3 },
        { title: 'Transformers & LLMs', description: 'Explore self-attention mechanisms, decode generative tokens, and orchestrate agent models.', order: 4 }
      ];

      for (const step of steps) {
        await RoadmapStep.create({
          roadmapId: roadmap._id,
          title: step.title,
          description: step.description,
          order: step.order
        });
        console.log(`[Seed] Created Step Node: ${step.title}`);
      }
    }
  } catch (error) {
    console.error(`[Seed Error] Could not pre-populate roadmaps: ${error.message}`);
  }
};

// Seed default tags & pathways
await seedDefaultFields();
await seedDefaultRoadmaps();

// Create HTTP server
const server = http.createServer(app);

// Bind Socket.IO server
initSocket(server);

// Start server listening
server.listen(PORT, () => {
  console.log(`[Server] Prizm Backend listening in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
