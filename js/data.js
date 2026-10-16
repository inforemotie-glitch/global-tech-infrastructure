/* ==========================================================================
   Global Tech Infrastructure: site content and configuration
   Loaded before main.js. Exposes a single frozen object on window.
   ========================================================================== */

(function () {
  'use strict';

  const contact = {
    email: 'info.remotie@gmail.com',
    phone: '+61451087215',
    phoneDisplay: '+61 451 087 215'
  };

  /* Service detail content for the service dialog.
     Order matches the cards in the services grid. */
  const services = [
    {
      slug: 'managed-it-support',
      title: 'Managed IT Support & 24/7 Melbourne Helpdesk',
      tag: 'Support',
      icon: 's-helpdesk',
      intro: 'One phone number and one inbox for every IT question your team has. Calls are answered by engineers in Melbourne who can actually fix the problem, and anything that can’t be solved remotely gets an engineer at your door.',
      included: [
        'Unlimited remote helpdesk support by phone, email and Teams',
        'On-site engineers across the CBD, inner suburbs and Greater Melbourne',
        '24/7 monitoring of servers, network gear and endpoints',
        'Scheduled patching for Windows, macOS and key applications',
        'New starter and leaver setup, including accounts and devices',
        'Monthly reporting on tickets, response times and device health'
      ],
      sla: [
        ['Helpdesk pickup', 'Under 60 seconds'],
        ['Critical response', '15 minutes, 24/7'],
        ['First-contact fix rate', '98.4%']
      ],
      idealFor: 'Businesses of 5 to 250+ staff who want IT handled properly without hiring an in-house team.',
      inquiryType: 'Managed IT quote'
    },
    {
      slug: 'cybersecurity',
      title: 'Managed Cybersecurity & SOC',
      tag: 'Security and recovery',
      icon: 's-shield',
      intro: 'Attackers don’t keep office hours, so neither does our security operations centre. We watch your environment around the clock, stop threats on the device before they spread, and work through the ACSC Essential Eight with you step by step.',
      included: [
        '24/7 security operations centre monitoring and response',
        'Endpoint detection and response on every laptop, desktop and server',
        'Essential Eight gap assessment and a staged maturity roadmap',
        'Multi-factor authentication and conditional access across Microsoft 365',
        'Email filtering, phishing simulations and staff awareness training',
        'An incident response plan, tested with your leadership team'
      ],
      sla: [
        ['Threat triage', 'Under 15 minutes'],
        ['Containment target', 'Under 1 hour'],
        ['Security reporting', 'Monthly, board-ready']
      ],
      idealFor: 'Businesses holding client, financial or health data, or facing cyber insurance questions they can’t answer yet.',
      inquiryType: 'Cybersecurity or Essential Eight review'
    },
    {
      slug: 'disaster-recovery',
      title: 'Disaster Recovery & Business Continuity',
      tag: 'Security and recovery',
      icon: 's-recovery',
      intro: 'Backups only matter if they restore. We keep immutable copies that ransomware can’t encrypt, plan exactly how your critical systems come back, and prove it works with recovery tests every quarter.',
      included: [
        'Immutable, versioned backups stored in two Australian locations',
        'Microsoft 365 and Google Workspace backup, including mail and Teams',
        'Failover for critical servers and line-of-business apps',
        'A ransomware recovery runbook with clear roles and contacts',
        'Quarterly restore tests with a written results report',
        'A business continuity plan built around your real recovery priorities'
      ],
      sla: [
        ['Recovery point target', 'As low as 15 minutes'],
        ['Critical system recovery', 'Under 4 hours'],
        ['Restore testing', 'Every quarter']
      ],
      idealFor: 'Any business that would lose money, clients or compliance standing if its systems were down for a day.',
      inquiryType: 'IT audit or health check'
    },
    {
      slug: 'cloud',
      title: 'Managed Cloud Infrastructure',
      tag: 'Cloud and voice',
      icon: 's-cloud',
      intro: 'We design, migrate and run your environment in Microsoft Azure, AWS or a hybrid of cloud and on-premises. Then we keep watching it, because cloud bills grow quietly when nobody is looking.',
      included: [
        'A cloud readiness assessment and migration plan with rollback steps',
        'Azure and AWS landing zones built to security best practice',
        'Hybrid connectivity between offices, data centres and cloud',
        'Identity and access management with Microsoft Entra ID',
        'Monthly cost reviews and right-sizing recommendations',
        'Australian regions by default, with data sovereignty documented'
      ],
      sla: [
        ['Platform uptime target', '99.99%'],
        ['Cost review', 'Monthly'],
        ['Migration cutover', 'Planned, after hours']
      ],
      idealFor: 'Businesses retiring an ageing server, opening new sites, or paying more for cloud than they expected.',
      inquiryType: 'Cloud migration project'
    },
    {
      slug: 'voice',
      title: 'Unified Voice & Communications (UCaaS)',
      tag: 'Cloud and voice',
      icon: 's-voice',
      intro: 'Your phone system should follow your people, not sit on a desk. We set up cloud calling and Microsoft Teams Phone, port your existing numbers, and build the office network that keeps every call clear.',
      included: [
        'Microsoft Teams Phone and hosted cloud PBX setup',
        'Number porting planned so customers never hear a dropped call',
        'Call queues, auto attendants and after-hours routing',
        'Headsets, desk phones and meeting room equipment',
        'Office cabling, switching and business-grade Wi-Fi fit-outs',
        'NBN and fibre connectivity with 4G or 5G failover'
      ],
      sla: [
        ['Number porting', 'No-downtime cutover'],
        ['Call quality monitoring', '24/7'],
        ['Fit-out projects', 'Fixed-price quotes']
      ],
      idealFor: 'Teams moving offices, going hybrid, or replacing an old on-premises phone system.',
      inquiryType: 'Phones and office network fit-out'
    },
    {
      slug: 'consulting',
      title: 'Workflow Automation & Strategic IT Consulting',
      tag: 'Strategy and procurement',
      icon: 's-automation',
      intro: 'A virtual CIO gives you senior technology advice without a full-time executive salary. We plan your IT around business goals, budget for it properly, and automate the repetitive admin your team shouldn’t be doing by hand.',
      included: [
        'vCIO advisory with quarterly strategy sessions',
        'A three-year technology roadmap and IT budget forecast',
        'Integration between your CRM, finance and operations systems',
        'Practical automation with Power Automate and similar tools',
        'Vendor and contract reviews to cut overlapping spend',
        'Board-ready reporting on risk, spend and project progress'
      ],
      sla: [
        ['Strategy sessions', 'Quarterly'],
        ['Roadmap delivered', 'Within 30 days'],
        ['Automation projects', 'Scoped at a fixed price']
      ],
      idealFor: 'Leadership teams who want technology decisions tied to growth plans, not made in a hurry.',
      inquiryType: 'IT audit or health check'
    },
    {
      slug: 'procurement',
      title: 'Hardware & Software Procurement',
      tag: 'Strategy and procurement',
      icon: 's-procure',
      intro: 'We buy on your behalf from whichever vendor offers the best fit and price, not whoever pays the highest commission. Devices arrive configured, and we track every one through warranty, refresh and secure disposal.',
      included: [
        'Vendor-neutral sourcing for laptops, desktops, servers and network gear',
        'Microsoft 365, Adobe and line-of-business licence management',
        'Zero-touch deployment with Windows Autopilot and Apple Business Manager',
        'An asset register with warranty and refresh dates',
        'Device leasing options and staged refresh planning',
        'Certified data wiping and e-waste recycling at end of life'
      ],
      sla: [
        ['Standard device delivery', '3 to 5 business days'],
        ['Ready to use', 'Straight out of the box'],
        ['Licence audit', 'Twice a year']
      ],
      idealFor: 'Growing teams onboarding new starters often, or businesses with a mixed, ageing fleet.',
      inquiryType: 'Managed IT quote'
    }
  ];

  /* IT support and infrastructure estimator */
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
        hours: '24/7 with a dedicated team',
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
        coverage: { support: 4, security: 2, cloud: 1, strategy: 1 },
        items: [
          'Unlimited helpdesk support from Melbourne engineers',
          '24/7 monitoring of servers, network and endpoints',
          'Scheduled patching for Windows, macOS and key apps',
          'On-site visits across Greater Melbourne',
          'New starter and leaver setup'
        ]
      },
      security: {
        label: 'A cybersecurity overhaul',
        coverage: { support: 2, security: 4, cloud: 1, strategy: 2 },
        items: [
          'Essential Eight gap assessment and maturity roadmap',
          '24/7 SOC monitoring with endpoint detection and response',
          'Multi-factor authentication and conditional access',
          'Email filtering and phishing simulations',
          'An incident response plan, tested with your leaders'
        ]
      },
      cloud: {
        label: 'A cloud migration',
        coverage: { support: 2, security: 2, cloud: 4, strategy: 2 },
        items: [
          'Cloud readiness assessment and migration plan',
          'Azure or AWS landing zone built to best practice',
          'Identity and access with Microsoft Entra ID',
          'Microsoft 365 and cloud workload backup',
          'Monthly cloud cost review'
        ]
      },
      full: {
        label: 'Full managed IT',
        coverage: { support: 4, security: 3, cloud: 3, strategy: 3 },
        items: [
          'Unlimited helpdesk support from Melbourne engineers',
          '24/7 SOC monitoring and endpoint protection',
          'Immutable backups with quarterly restore tests',
          'Managed cloud and Microsoft 365 administration',
          'Procurement and device lifecycle management',
          'vCIO planning and quarterly strategy reviews'
        ]
      }
    },

    extras: {
      multisite: {
        phrase: 'across more than one site',
        item: 'Site-to-site networking with 4G or 5G failover',
        boost: { cloud: 1 }
      },
      hybrid: {
        phrase: 'with hybrid staff',
        item: 'Device management with Intune and Jamf, plus secure remote access',
        boost: { security: 1 }
      },
      regulated: {
        phrase: 'handling sensitive data',
        item: 'Compliance reporting and Notifiable Data Breaches readiness',
        boost: { security: 1, strategy: 1 }
      }
    },

    sizeItems: [
      { min: 75, text: 'A named account manager and dedicated engineering pod' },
      { min: 150, text: 'Scheduled on-site engineer days every week' }
    ]
  };

  /* Rotating events for the hero operations dashboard (illustrative). */
  const opsEvents = [
    ['Suspicious sign-in blocked', 'Docklands'],
    ['Patch cycle complete, 214 devices', 'Richmond'],
    ['Backup restore test passed', 'Southbank'],
    ['Phishing email quarantined', 'Collingwood'],
    ['Help request fixed in 6 min', 'Carlton'],
    ['Firewall rule updated', 'Box Hill'],
    ['New starter laptop deployed', 'Fitzroy'],
    ['Disk space alert cleared', 'Dandenong'],
    ['Malware stopped on endpoint', 'Hawthorn'],
    ['Wi-Fi access point replaced', 'South Yarra'],
    ['Licence reassigned in Microsoft 365', 'St Kilda'],
    ['Server restarted after hours', 'Footscray']
  ];

  /* On-site coverage zones for the dispatch map. */
  const zones = {
    cbd: {
      time: 'On-site within 1 hour',
      areas: 'Melbourne CBD, Southbank, Docklands, East Melbourne and West Melbourne.',
      note: 'Our engineers are based here, so most CBD visits happen on foot or by tram.'
    },
    inner: {
      time: 'On-site within 2 hours',
      areas: 'Richmond, Collingwood, Fitzroy, Carlton, Brunswick, South Yarra, St Kilda and Footscray.',
      note: 'Same-day visits are standard, and priority incidents move to the front of the queue.'
    },
    greater: {
      time: 'On-site within 4 hours',
      areas: 'Box Hill, Ringwood, Dandenong, Frankston, Werribee, Craigieburn, Sunbury and the suburbs in between.',
      note: 'Critical incidents are worked on remotely straight away while an engineer travels to you.'
    }
  };

  /* Helpdesk hours in Melbourne local time (24h clock). Day 0 is Sunday. */
  const deskHours = {
    weekday: { open: 7, close: 19 },
    saturday: { open: 9, close: 13 }
  };

  window.GTI_DATA = Object.freeze({
    contact: contact,
    services: services,
    estimator: estimator,
    opsEvents: opsEvents,
    zones: zones,
    deskHours: deskHours
  });
})();
