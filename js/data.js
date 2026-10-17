/* ==========================================================================
   Global Tech Infrastructure: site content and configuration
   Loaded before main.js. Exposes a single frozen object on window.
   ========================================================================== */

(function () {
  'use strict';

  const contact = {
    email: 'info.remotie@gmail.com',
    phone: '+61438650449',
    phoneDisplay: '+61 438 650 449',
    timeZone: 'Australia/Perth'
  };

  /* Builds a cropped, compressed Unsplash URL for a photo id. */
  function photo(id, width, height) {
    return 'https://images.unsplash.com/photo-' + id +
      '?auto=format&fit=crop&w=' + width + '&h=' + height + '&q=70';
  }

  /* Service detail content for the service dialog.
     Order matches the cards in the services grid.
     inquiryType must match an option in the #f-service dropdown. */
  const services = [
    {
      slug: 'managed-it-support',
      title: 'Managed IT Support & 24/7 Perth Helpdesk',
      tag: 'Support',
      icon: 's-helpdesk',
      image: { id: '1531482615713-2afd69097998', alt: 'Two colleagues working through an IT issue on a laptop' },
      intro: 'One number for every IT question. A Perth engineer answers and fixes it, remotely or on-site.',
      included: [
        'Unlimited helpdesk by phone, email and Teams',
        'On-site engineers across metro Perth',
        '24/7 monitoring of servers and devices',
        'Scheduled patching for Windows and macOS',
        'New starter and leaver setup'
      ],
      sla: [
        ['Helpdesk pickup', 'Under 60 sec'],
        ['Critical response', '15 min, 24/7'],
        ['First-contact fix rate', '98.4%']
      ],
      idealFor: 'Teams of 5 to 250+ who want IT handled without hiring in-house.',
      inquiryType: 'Managed IT support and helpdesk'
    },
    {
      slug: 'cybersecurity',
      title: 'Managed Cybersecurity & Threat Protection',
      tag: 'Security',
      icon: 's-shield',
      image: { id: '1504639725590-34d0984388bd', alt: 'Security monitoring screens showing live system data' },
      intro: 'Our security operations centre watches your systems around the clock and stops threats on the device.',
      included: [
        '24/7 SOC monitoring and response',
        'Endpoint detection on every device',
        'Essential Eight gap review and roadmap',
        'MFA and conditional access for Microsoft 365',
        'Phishing tests and staff training'
      ],
      sla: [
        ['Threat triage', 'Under 15 min'],
        ['Containment target', 'Under 1 hour'],
        ['Security reporting', 'Monthly']
      ],
      idealFor: 'Businesses holding client, financial or health data, or facing cyber insurance questions.',
      inquiryType: 'Cybersecurity and threat protection'
    },
    {
      slug: 'network-engineering',
      title: 'Network Engineering',
      tag: 'Network',
      icon: 's-network',
      image: { id: '1520869562399-e772f042f422', alt: 'Fibre and copper cables connected to a rack-mounted network switch' },
      intro: 'We design, build and run fast, stable networks, from one Perth office to multi-site operations across WA.',
      included: [
        'Enterprise Wi-Fi 7 and 6E design with site surveys',
        'SD-WAN linking Perth and regional WA sites',
        'Cisco, Meraki and Fortinet switching, routing and firewalls',
        'Structured cabling, labelled and certified',
        'Low-latency tuning with 24/7 network monitoring'
      ],
      sla: [
        ['Network uptime target', '99.99%'],
        ['Site survey', 'Within 5 days'],
        ['Critical fault response', '15 min, 24/7']
      ],
      idealFor: 'Multi-site WA businesses, new office fit-outs and teams stuck with slow or patchy Wi-Fi.',
      inquiryType: 'Network engineering'
    },
    {
      slug: 'cloud',
      title: 'Managed Cloud Infrastructure',
      tag: 'Cloud',
      icon: 's-cloud',
      image: { id: '1460925895917-afdab827c52f', alt: 'A laptop showing a cloud monitoring dashboard' },
      intro: 'We design, migrate and run Azure, AWS or hybrid environments, then keep the monthly bill in check.',
      included: [
        'Cloud readiness review and migration plan',
        'Azure and AWS landing zones built securely',
        'Hybrid links between offices and cloud',
        'Identity and access with Microsoft Entra ID',
        'Monthly cost reviews and right-sizing'
      ],
      sla: [
        ['Platform uptime target', '99.99%'],
        ['Cost review', 'Monthly'],
        ['Migration cutover', 'After hours']
      ],
      idealFor: 'Businesses retiring an old server, opening new sites or paying too much for cloud.',
      inquiryType: 'Managed cloud infrastructure'
    },
    {
      slug: 'disaster-recovery',
      title: 'Disaster Recovery & Business Continuity',
      tag: 'Recovery',
      icon: 's-recovery',
      image: { id: '1586772002130-b0f3daa6288b', alt: 'Rows of server racks in a data centre aisle' },
      intro: 'Backups only matter if they restore. We keep copies ransomware can’t touch and prove they work.',
      included: [
        'Immutable backups in two Australian locations',
        'Microsoft 365 and Google Workspace backup',
        'Failover for critical servers and apps',
        'A ransomware recovery runbook',
        'Quarterly restore tests with a written report'
      ],
      sla: [
        ['Recovery point', 'As low as 15 min'],
        ['Critical recovery', 'Under 4 hours'],
        ['Restore testing', 'Every quarter']
      ],
      idealFor: 'Any business that would lose money or clients after a day offline.',
      inquiryType: 'Disaster recovery and continuity'
    },
    {
      slug: 'voice',
      title: 'Unified Voice & Communications',
      tag: 'Voice',
      icon: 's-voice',
      image: { id: '1587560699334-bea93391dcef', alt: 'A business desk phone in a modern office' },
      intro: 'Cloud calling and Microsoft Teams Phone that follow your people, wherever they work.',
      included: [
        'Teams Phone and hosted cloud PBX',
        'Number porting with no dropped calls',
        'Call queues and after-hours routing',
        'Headsets, desk phones and meeting rooms',
        'NBN and fibre with 4G or 5G failover'
      ],
      sla: [
        ['Number porting', 'No-downtime cutover'],
        ['Call quality monitoring', '24/7'],
        ['Fit-out projects', 'Fixed price']
      ],
      idealFor: 'Teams moving offices, going hybrid or replacing an old phone system.',
      inquiryType: 'Unified voice and communications'
    },
    {
      slug: 'consulting',
      title: 'Workflow Automation & IT Strategy',
      tag: 'Strategy',
      icon: 's-automation',
      image: { id: '1552664730-d307ca884978', alt: 'A team mapping out an IT plan on a whiteboard' },
      intro: 'Senior IT advice without an executive salary, plus practical automation for repetitive admin.',
      included: [
        'vCIO advice with quarterly strategy sessions',
        'A three-year roadmap and IT budget',
        'CRM, finance and operations integration',
        'Automation with Power Automate and similar tools',
        'Vendor reviews to cut overlapping spend'
      ],
      sla: [
        ['Strategy sessions', 'Quarterly'],
        ['Roadmap delivered', 'Within 30 days'],
        ['Automation projects', 'Fixed price']
      ],
      idealFor: 'Leadership teams who want IT decisions tied to growth plans.',
      inquiryType: 'Workflow automation and IT strategy'
    },
    {
      slug: 'procurement',
      title: 'Hardware & Software Procurement',
      tag: 'Procurement',
      icon: 's-procure',
      image: { id: '1580894894513-541e068a3e2b', alt: 'A modern desk setup with a laptop and two monitors' },
      intro: 'We buy from the vendor with the best fit and price. Devices arrive configured and ready.',
      included: [
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
      idealFor: 'Growing teams onboarding often, or businesses with an ageing, mixed fleet.',
      inquiryType: 'Hardware and software procurement'
    }
  ];

  /* Service plan builder */
  const estimator = {
    tiers: [
      {
        name: 'Essentials',
        p1: '30 minutes, 24/7',
        hours: '7am to 7pm weekdays',
        onsite: 'Next business day',
        uptime: '99.9%',
        reviews: 'Twice a year'
      },
      {
        name: 'Business',
        p1: '15 minutes, 24/7',
        hours: '7am to 7pm weekdays',
        onsite: 'Same business day',
        uptime: '99.95%',
        reviews: 'Quarterly'
      },
      {
        name: 'Business Plus',
        p1: '15 minutes, 24/7',
        hours: '24/7 for every user',
        onsite: 'Within 4 hours, metro',
        uptime: '99.98%',
        reviews: 'Quarterly, with a vCIO'
      },
      {
        name: 'Enterprise',
        p1: '10 minutes, 24/7',
        hours: '24/7, dedicated team',
        onsite: 'Within 2 hours, metro',
        uptime: '99.99%',
        reviews: 'Monthly, with a vCIO'
      }
    ],

    /* Team size thresholds that move the base tier up. */
    sizeBreaks: [20, 75, 150],

    onboarding: [
      { max: 19, text: '1 to 2 weeks' },
      { max: 49, text: '2 to 4 weeks' },
      { max: 99, text: '4 to 6 weeks' },
      { max: 245, text: '6 to 8 weeks' },
      { max: Infinity, text: '8 to 10 weeks' }
    ],

    levels: ['Not included', 'Light', 'Core', 'Strong', 'Full'],

    priorities: {
      support: {
        label: '24/7 support',
        coverage: { support: 4, security: 2, network: 2, cloud: 1, strategy: 1 },
        items: [
          'Unlimited helpdesk from Perth engineers',
          '24/7 monitoring of servers, network and devices',
          'Scheduled patching for Windows and macOS',
          'On-site visits across metro Perth'
        ]
      },
      security: {
        label: 'A cybersecurity overhaul',
        coverage: { support: 2, security: 4, network: 2, cloud: 1, strategy: 2 },
        items: [
          'Essential Eight gap review and roadmap',
          '24/7 SOC monitoring with endpoint response',
          'MFA and conditional access',
          'Phishing tests and staff training'
        ]
      },
      network: {
        label: 'A network upgrade',
        coverage: { support: 2, security: 2, network: 4, cloud: 2, strategy: 2 },
        items: [
          'Site survey and Wi-Fi 7 or 6E design',
          'SD-WAN linking every office and site',
          'Cisco, Meraki or Fortinet switching and firewalls',
          'Structured cabling, labelled and certified'
        ]
      },
      cloud: {
        label: 'A cloud migration',
        coverage: { support: 2, security: 2, network: 2, cloud: 4, strategy: 2 },
        items: [
          'Cloud readiness review and migration plan',
          'Azure or AWS landing zone built securely',
          'Identity and access with Microsoft Entra ID',
          'Monthly cloud cost review'
        ]
      },
      full: {
        label: 'Full managed IT',
        coverage: { support: 4, security: 3, network: 3, cloud: 3, strategy: 3 },
        items: [
          'Unlimited helpdesk from Perth engineers',
          '24/7 SOC monitoring and endpoint protection',
          'Immutable backups, tested every quarter',
          'Managed network, cloud and Microsoft 365'
        ]
      }
    },

    extras: {
      multisite: {
        label: 'More than one office',
        phrase: 'across more than one office',
        item: 'SD-WAN between offices with 4G or 5G failover',
        boost: { network: 1 }
      },
      regional: {
        label: 'Regional WA sites',
        phrase: 'with regional WA sites',
        item: 'Remote site links with satellite or 5G failover',
        boost: { network: 1, support: 1 }
      },
      hybrid: {
        label: 'Hybrid or remote staff',
        phrase: 'with hybrid staff',
        item: 'Device management and secure remote access',
        boost: { security: 1 }
      },
      regulated: {
        label: 'Sensitive client data',
        phrase: 'handling sensitive data',
        item: 'Compliance reporting and data breach readiness',
        boost: { security: 1, strategy: 1 }
      }
    },

    sizeItems: [
      { min: 75, text: 'A named account manager and dedicated engineers' },
      { min: 150, text: 'Scheduled on-site engineer days every week' }
    ]
  };

  /* On-site coverage zones for the dispatch map. */
  const zones = {
    cbd: {
      time: 'On-site within 1 hour',
      areas: 'Perth CBD, West Perth, Northbridge, East Perth and Elizabeth Quay.',
      note: 'Our engineers are based here, so most visits are a short walk.'
    },
    inner: {
      time: 'On-site within 2 hours',
      areas: 'Subiaco, Osborne Park, Leederville, Victoria Park, South Perth and Nedlands.',
      note: 'Same-day visits are standard. Priority incidents jump the queue.'
    },
    greater: {
      time: 'On-site within 4 hours',
      areas: 'Fremantle, Joondalup, Midland, Cannington, Rockingham and Armadale.',
      note: 'Critical issues are worked on remotely while an engineer travels.'
    },
    regional: {
      time: 'Remote fix in minutes',
      areas: 'Pilbara, Goldfields, Karratha, Port Hedland, Kalgoorlie, Bunbury and Geraldton.',
      note: 'Same 24/7 remote support. Site visits and fly-in work by arrangement.'
    }
  };

  /* Helpdesk hours in Perth local time (AWST, 24h clock). Day 0 is Sunday. */
  const deskHours = {
    weekday: { open: 7, close: 19 },
    saturday: { open: 9, close: 13 }
  };

  window.GTI_DATA = Object.freeze({
    contact: contact,
    photo: photo,
    services: services,
    estimator: estimator,
    zones: zones,
    deskHours: deskHours
  });
})();
