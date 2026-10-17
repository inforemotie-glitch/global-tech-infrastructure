/* ==========================================================================
   Global Tech Infrastructure: site content
   Loaded before main.js. Exposes one frozen object on window.GTI.
   ========================================================================== */

(function () {
  'use strict';

  const contact = {
    email: 'info.remotie@gmail.com',
    phone: '+61438650449',
    phoneDisplay: '+61 438 650 449'
  };

  /* Cropped, compressed Unsplash URL for a photo id. */
  function photo(id, width, height) {
    return 'https://images.unsplash.com/photo-' + id +
      '?auto=format&fit=crop&w=' + width + '&h=' + height + '&q=70';
  }

  /* Service spec drawer content. Order matches the cards in #services.
     `tag` must match a value in the brief form's service tags. */
  const services = [
    {
      code: 'SVC // 01',
      tag: 'Managed IT Support',
      kicker: 'Support layer',
      title: 'Managed IT Support & 24/7 Perth Helpdesk',
      image: { id: '1531482615713-2afd69097998', alt: 'Two colleagues working through an IT issue on a laptop' },
      intro: 'One number for every IT issue. A Perth engineer picks up, owns the ticket and fixes it, remotely or on-site.',
      highlights: [
        'Unlimited helpdesk by phone, email and Teams',
        'On-site engineers across metro Perth',
        '24/7 monitoring of servers, devices and network',
        'Scheduled patching for Windows and macOS',
        'New starter and leaver setup, done same day'
      ],
      sla: [
        ['Helpdesk pickup', '< 45 sec'],
        ['Critical response', '15 min, 24/7'],
        ['First-contact fix', '98.4%']
      ],
      idealFor: 'Teams of 5 to 250+ who want IT handled without hiring in-house.'
    },
    {
      code: 'SVC // 02',
      tag: 'Cybersecurity',
      kicker: 'Security layer',
      title: 'Managed Cybersecurity & SOC',
      image: { id: '1504639725590-34d0984388bd', alt: 'Security monitoring screens showing live system data' },
      intro: 'Our security operations centre watches every endpoint, identity and firewall around the clock, and stops threats on the device.',
      highlights: [
        '24/7 SOC monitoring with human triage',
        'Endpoint detection and response on every device',
        'Essential Eight gap review and roadmap to ML2',
        'MFA and conditional access for Microsoft 365',
        'Phishing simulations and staff training'
      ],
      sla: [
        ['Threat triage', '< 15 min'],
        ['Containment target', '< 1 hour'],
        ['Security reporting', 'Monthly']
      ],
      idealFor: 'Businesses holding client, financial or health data, or facing cyber insurance questions.'
    },
    {
      code: 'SVC // 03',
      tag: 'Network Engineering',
      kicker: 'Network layer',
      title: 'Network Engineering',
      image: { id: '1544197150-b99a580bb7a8', alt: 'Numbered patch panel ports with blue and grey network cables' },
      intro: 'We design, build and run fast, stable networks, from a single Perth office to multi-site operations across regional WA.',
      highlights: [
        'Wi-Fi 7 and 6E design backed by on-site surveys',
        'SD-WAN linking Perth and regional sites with 5G failover',
        'Cisco Meraki and Fortinet switching, routing and firewalls',
        'Structured cabling, labelled and certified',
        'Latency tuning with 24/7 network monitoring'
      ],
      sla: [
        ['Network uptime target', '99.99%'],
        ['Site survey', 'Within 5 days'],
        ['Critical fault response', '15 min, 24/7']
      ],
      idealFor: 'Multi-site WA businesses, new office fit-outs and teams stuck with slow or patchy Wi-Fi.'
    },
    {
      code: 'SVC // 04',
      tag: 'Managed Cloud',
      kicker: 'Cloud layer',
      title: 'Managed Cloud Infrastructure',
      image: { id: '1460925895917-afdab827c52f', alt: 'A laptop showing a cloud monitoring dashboard' },
      intro: 'We design, migrate and run Azure, AWS or hybrid environments in Australian regions, then keep the monthly bill in check.',
      highlights: [
        'Cloud readiness review and migration plan',
        'Azure and AWS landing zones built to a secure baseline',
        'Hybrid links between offices and cloud',
        'Identity and access with Microsoft Entra ID',
        'Monthly cost reviews and right-sizing'
      ],
      sla: [
        ['Platform uptime target', '99.99%'],
        ['Cost review', 'Monthly'],
        ['Migration cutover', 'After hours']
      ],
      idealFor: 'Businesses retiring an old server, opening new sites or paying too much for cloud.'
    },
    {
      code: 'SVC // 05',
      tag: 'Disaster Recovery',
      kicker: 'Continuity layer',
      title: 'Disaster Recovery & Business Continuity',
      image: { id: '1586772002130-b0f3daa6288b', alt: 'Rows of server racks in a data centre aisle' },
      intro: 'Backups only matter if they restore. We keep copies ransomware cannot touch, then prove they work every quarter.',
      highlights: [
        'Immutable backups in two Australian locations',
        'Microsoft 365 and Google Workspace backup',
        'Failover for critical servers and line-of-business apps',
        'A written ransomware recovery runbook',
        'Quarterly restore tests with a plain-English report'
      ],
      sla: [
        ['Recovery point', 'From 15 min'],
        ['Critical recovery', '< 4 hours'],
        ['Restore testing', 'Quarterly']
      ],
      idealFor: 'Any business that would lose money or clients after a day offline.'
    },
    {
      code: 'SVC // 06',
      tag: 'Unified Voice',
      kicker: 'Voice layer',
      title: 'Unified Voice & Communications',
      image: { id: '1587560699334-bea93391dcef', alt: 'A business desk phone in a modern office' },
      intro: 'Teams Phone and cloud PBX that ring wherever your people work, with call quality we monitor around the clock.',
      highlights: [
        'Microsoft Teams Phone and hosted cloud PBX',
        'Number porting with no dropped calls',
        'Call queues, IVR and after-hours routing',
        'Headsets, desk phones and meeting rooms',
        'NBN and fibre with 4G or 5G failover'
      ],
      sla: [
        ['Number porting', 'Zero downtime'],
        ['Call quality monitoring', '24/7'],
        ['Fit-out projects', 'Fixed price']
      ],
      idealFor: 'Teams moving offices, going hybrid or replacing an old phone system.'
    },
    {
      code: 'SVC // 07',
      tag: 'Automation & Strategy',
      kicker: 'Strategy layer',
      title: 'Workflow Automation & IT Strategy',
      image: { id: '1551288049-bebda4e38f71', alt: 'A laptop screen showing analytics charts and workflow metrics' },
      intro: 'Senior IT advice without an executive salary, plus practical automation that takes repetitive admin off your team.',
      highlights: [
        'vCIO advice with quarterly strategy sessions',
        'A three-year roadmap tied to your IT budget',
        'CRM, finance and operations integration',
        'Automation with Power Automate and similar tools',
        'Vendor reviews to cut overlapping spend'
      ],
      sla: [
        ['Strategy sessions', 'Quarterly'],
        ['Roadmap delivered', 'Within 30 days'],
        ['Automation projects', 'Fixed price']
      ],
      idealFor: 'Leadership teams who want IT decisions tied to growth plans.'
    },
    {
      code: 'SVC // 08',
      tag: 'Procurement',
      kicker: 'Hardware layer',
      title: 'Hardware & Software Procurement',
      image: { id: '1606857521015-7f9fcf423740', alt: 'An open-plan office fitted out with matching workstations' },
      intro: 'Vendor-neutral sourcing at the right price. Devices arrive configured, enrolled and ready to work out of the box.',
      highlights: [
        'Vendor-neutral sourcing for laptops, servers and network gear',
        'Microsoft 365 and software licence management',
        'Zero-touch setup with Autopilot and Apple Business Manager',
        'Asset register with warranty and refresh dates',
        'Certified data wiping and e-waste recycling'
      ],
      sla: [
        ['Standard delivery', '3 to 5 days'],
        ['Ready to use', 'Out of the box'],
        ['Licence audit', 'Twice a year']
      ],
      idealFor: 'Growing teams onboarding often, or businesses with an ageing, mixed fleet.'
    }
  ];

  /* Network topology nodes. `service` is an index into services. */
  const nodes = {
    hub: {
      code: 'GTI_HUB // PERTH',
      layer: 'CORE // ORCHESTRATION',
      name: 'Global Tech Infrastructure Hub',
      icon: 'i-globe',
      status: 'ALL LAYERS SYNCED',
      desc: 'The Perth hub ties every managed layer together: one team, one ticket queue and one monthly report covering all six.',
      metrics: [
        ['Managed layers', '6 of 6', 100],
        ['Uptime SLA', '99.99%', 99],
        ['Escalation path', 'Perth engineers', 92]
      ],
      spark: 'EVENTS CORRELATED // 60s',
      service: null
    },
    cloud: {
      code: 'NODE // CLOUD_CORE',
      layer: 'LAYER 01 // CLOUD',
      name: 'Cloud Core',
      icon: 'i-cloud',
      status: 'ONLINE',
      desc: 'Azure and AWS landing zones in Australian regions, patched, backed up and cost-tuned every month.',
      metrics: [
        ['Platform uptime', '99.99%', 99],
        ['Workloads in AU regions', '100%', 100],
        ['Monthly cost drift', '< 3%', 18]
      ],
      spark: 'COMPUTE LOAD // 60s',
      service: 3
    },
    soc: {
      code: 'NODE // CYBER_SOC',
      layer: 'LAYER 02 // SECURITY',
      name: 'Cyber SOC',
      icon: 'i-shield',
      status: 'HUNTING',
      desc: 'Analysts triage alerts from every endpoint, identity and firewall around the clock, then contain threats on the device.',
      metrics: [
        ['Threat triage', '< 15 min', 88],
        ['Endpoint coverage', '100%', 100],
        ['Breaches this year', '0', 4]
      ],
      spark: 'ALERTS TRIAGED // 60s',
      service: 1
    },
    helpdesk: {
      code: 'NODE // PERTH_HELPDESK',
      layer: 'LAYER 03 // SUPPORT',
      name: 'Perth Helpdesk',
      icon: 'i-headset',
      status: 'ENGINEERS READY',
      desc: 'Local engineers who pick up in under 45 seconds and own the ticket until it is fixed.',
      metrics: [
        ['Pickup time', '< 45 sec', 90],
        ['First-contact fix', '98.4%', 98],
        ['Metro on-site', 'Same day', 76]
      ],
      spark: 'TICKETS RESOLVED // 60s',
      service: 0
    },
    sdwan: {
      code: 'NODE // SDWAN_MESH',
      layer: 'LAYER 04 // NETWORK',
      name: 'SD-WAN Mesh',
      icon: 'i-mesh',
      status: 'ALL LINKS UP',
      desc: 'Every office and remote WA site on one fabric, with automatic 5G and satellite failover.',
      metrics: [
        ['Failover switch', '< 1 sec', 95],
        ['Network uptime target', '99.99%', 99],
        ['Link utilisation', '62%', 62]
      ],
      spark: 'THROUGHPUT // 60s',
      service: 2
    },
    backup: {
      code: 'NODE // IMMUTABLE_BACKUP',
      layer: 'LAYER 05 // CONTINUITY',
      name: 'Immutable Backup',
      icon: 'i-database',
      status: 'SNAPSHOT VERIFIED',
      desc: 'Write-once copies in two Australian locations that ransomware cannot encrypt or delete.',
      metrics: [
        ['Recovery point', '15 min', 88],
        ['Critical recovery', '< 4 hrs', 78],
        ['Restore tests', 'Quarterly', 70]
      ],
      spark: 'REPLICATION // 60s',
      service: 4
    },
    endpoint: {
      code: 'NODE // ENDPOINT_FLEET',
      layer: 'LAYER 06 // DEVICES',
      name: 'Endpoint Fleet',
      icon: 'i-laptop',
      status: 'COMPLIANT',
      desc: 'Every laptop, desktop and phone enrolled, encrypted and patched from the first boot.',
      metrics: [
        ['Patch compliance', '98.6%', 98],
        ['Disk encryption', '100%', 100],
        ['Zero-touch enrolled', '100%', 100]
      ],
      spark: 'PATCH JOBS // 60s',
      service: 7
    }
  };

  /* Industry blueprints for the switcher. */
  const industries = {
    mining: {
      code: 'BLUEPRINT // MINING_WA',
      image: { id: '1723509202767-38319b093be9', alt: 'An open-cut mine under a wide blue sky' },
      title: 'Remote sites, one secure grid.',
      pitch: 'Pilbara and Goldfields operations linked to head office with SD-WAN, satellite failover and OT-aware security.',
      stat: ['3 to 30', 'sites on one fabric'],
      stack: [
        ['Compliance', 'Essential Eight ML2 // SOCI Act readiness'],
        ['Security', 'OT segmentation // 24/7 SOC'],
        ['Network', 'SD-WAN with LEO satellite + 5G failover'],
        ['Cloud', 'Azure AU East // site data sync'],
        ['Endpoints', 'Rugged fleet // zero-touch enrolment']
      ],
      chips: ['FIFO onboarding in hours', 'Camp Wi-Fi isolation', 'Fly-in support']
    },
    legal: {
      code: 'BLUEPRINT // LEGAL_FINANCE',
      image: { id: '1505664194779-8beaceb93744', alt: 'Shelves of legal reference books in a law library' },
      title: 'Client data locked down, audit ready.',
      pitch: 'Matter and client data protected with conditional access, DLP and immutable backup, with reports your insurer will accept.',
      stat: ['ML2', 'Essential Eight target'],
      stack: [
        ['Compliance', 'Privacy Act // APRA CPS 234 alignment'],
        ['Security', 'Conditional access // DLP // mail filtering'],
        ['Network', 'Zero-trust remote access'],
        ['Cloud', 'Hardened Microsoft 365 // AU data residency'],
        ['Endpoints', 'Encrypted devices // managed mobile']
      ],
      chips: ['Cyber insurance evidence', 'EOFY capacity planning', 'Secure client portals']
    },
    health: {
      code: 'BLUEPRINT // HEALTH_CLINICS',
      image: { id: '1576091160550-2173dba999ef', alt: 'A stethoscope resting beside a laptop keyboard' },
      title: 'Clinics that stay online between patients.',
      pitch: 'Practice software, imaging and telehealth on resilient networks, with patient data kept in Australia.',
      stat: ['15 min', 'critical response, 24/7'],
      stack: [
        ['Compliance', 'Privacy Act // health record security'],
        ['Security', '24/7 SOC // phishing defence'],
        ['Network', 'Segmented clinical Wi-Fi // telehealth QoS'],
        ['Cloud', 'AU-hosted backup // practice software hosting'],
        ['Endpoints', 'Shared-device kiosk mode // auto-lock']
      ],
      chips: ['Practice software support', 'Telehealth call quality', 'After-hours clinic cover']
    },
    build: {
      code: 'BLUEPRINT // CONSTRUCTION_ENG',
      image: { id: '1504307651254-35680f356dfd', alt: 'Construction workers in hard hats on a concrete building site' },
      title: 'Big models, fast links, mobile crews.',
      pitch: 'Site offices online in days, and large CAD and BIM files that open in seconds at every office.',
      stat: ['48 hrs', 'to bring a site office online'],
      stack: [
        ['Compliance', 'ISO 27001 aligned controls // Essential Eight'],
        ['Security', 'Identity protection for mobile crews'],
        ['Network', 'Rapid site kits // 5G + LEO satellite'],
        ['Cloud', 'CAD and BIM file acceleration'],
        ['Endpoints', 'Workstation-class fleet // rugged tablets']
      ],
      chips: ['Site office in 48 hours', 'Plotters and scanners managed', 'Project-based onboarding']
    },
    smb: {
      code: 'BLUEPRINT // GROWTH_SMB',
      image: { id: '1522071820081-009f0129c71c', alt: 'A small team working together on laptops' },
      title: 'IT that scales as fast as you hire.',
      pitch: 'Zero-touch laptops, Microsoft 365 set up properly and a helpdesk your team actually likes calling.',
      stat: ['Day 1', 'new starters fully set up'],
      stack: [
        ['Compliance', 'Essential Eight ML1 to ML2 roadmap'],
        ['Security', 'MFA everywhere // EDR on every device'],
        ['Network', 'Office Wi-Fi 7 // isolated guest network'],
        ['Cloud', 'Microsoft 365 Business Premium'],
        ['Endpoints', 'Autopilot zero-touch // asset register']
      ],
      chips: ['Ready on day one', 'Flat per-seat pricing', 'Quarterly vCIO reviews']
    }
  };

  /* SLA estimator model. */
  const estimator = {
    tiers: [
      { name: 'Essentials', code: 'ARCH_E1', p1: '30 min', onsite: 'Next business day', uptime: '99.9%' },
      { name: 'Business', code: 'ARCH_B2', p1: '15 min', onsite: 'Same business day', uptime: '99.95%' },
      { name: 'Business Plus', code: 'ARCH_P3', p1: '15 min', onsite: '4 hrs, metro', uptime: '99.98%' },
      { name: 'Enterprise', code: 'ARCH_X4', p1: '10 min', onsite: '2 hrs, metro', uptime: '99.99%' }
    ],
    complexity: [
      { short: 'CLOUD_FIRST', label: 'Single office, cloud first' },
      { short: 'ON_PREM', label: 'Single office with on-site servers' },
      { short: 'HYBRID', label: 'Hybrid cloud across 2 to 3 sites' },
      { short: 'MULTI_SITE', label: 'Multi-site with SD-WAN' },
      { short: 'REGIONAL_OT', label: 'Regional WA sites and OT systems' }
    ],
    onboarding: [
      { max: 19, text: '1 to 2 weeks' },
      { max: 49, text: '2 to 4 weeks' },
      { max: 99, text: '4 to 6 weeks' },
      { max: 245, text: '6 to 8 weeks' },
      { max: Infinity, text: '8 to 10 weeks' }
    ]
  };

  window.GTI = Object.freeze({
    contact: contact,
    photo: photo,
    services: services,
    nodes: nodes,
    industries: industries,
    estimator: estimator
  });
})();
