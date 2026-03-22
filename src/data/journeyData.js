export const journeyData = {
    oneCustomer: {
        id: 'one-customer',
        name: 'One Customer View',
        lifecycleSection: {
            title: 'One Customer Lifecycle',
            stages: [
                'Onboarding',
                'Passive',
                'Active',
                'Advocate',
                'Retain'
            ],
            companies: [
                { name: 'Qantas Customer Lifecycle', label: '', color: '#ff0000' },
                { name: 'Qantas Loyalty Customer Lifecycle', label: '', color: '#c3a56e' }
            ]
        },
        journeySection: {
            title: 'Qantas Loyalty Customer Journey',
            stages: [
                'Locate',
                'Prepare',
                'Execute',
                'Monitor',
                'Modify',
                'Conclude'
            ],
            companies: [
                { name: 'Loyalty Journey', label: '', color: '#C3A56E', options: [
                    { value: 'Loyalty Journey', enabled: true },
                    { value: 'Travel Journey', enabled: false }
                ]},
                { name: 'Money Journey', label: '', color: '#C3A56E', options: [
                    { value: 'Money Journey', enabled: true },
                    { value: 'Travel Journey', enabled: false },
                    { value: 'Shop Journey', enabled: false },
                    { value: 'Account Journey', enabled: false }
                ]},
                { name: 'Cards Journey', label: '', color: '#C3A56E', options: [
                    { value: 'Cards Journey', enabled: true },
                    { value: 'Banking Journey', enabled: false },
                    { value: 'Insurance Journey', enabled: false }
                ]}
            ]
        },
        companies: [
            { id: 'qf', name: 'QF', fullName: 'Qantas Airways', color: '#e40000' },
            { id: 'ql', name: 'QL', fullName: 'Qantas Loyalty', color: '#C3A56E' }
        ]
    },

    qantas: {
        id: 'qantas',
        name: 'Qantas View',
        // Fixed width for each sub-stage column (px)
        colWidth: 140,
        colGap: 8,
        lifecycle: {
            title: 'Qantas Customer Lifecycle',
            // Stages with their child sub-stages
            phases: [
                {
                    name: 'First Year',
                    subStages: ['First Flight', 'Engagement']
                },
                {
                    name: 'One to Five Years',
                    subStages: ['Exploration', 'Growth']
                },
                {
                    name: 'Five to Ten Years',
                    subStages: ['Value', 'Advocacy']
                },
                {
                    name: 'Ten Plus Years',
                    subStages: ['Mastery', 'Commitment']
                },
                {
                    name: 'Retain',
                    subStages: ['First Year', 'First Year']
                }
            ],
            gridRows: ['Job', 'Driver', 'Emotional Experience', 'Metrics', 'Channels'],
            gridData: [
                ['Example', 'Example', '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', '', '']
            ]
        },
        journey: {
            title: 'Qantas Customer Journey',
            phases: [
                {
                    name: 'Entice',
                    subStages: ['First Flight', 'Engagement', 'Exploration']
                },
                {
                    name: 'Enter',
                    subStages: ['Growth', 'Value']
                },
                {
                    name: 'Consider',
                    subStages: ['Advocacy', 'Mastery', 'Commitment']
                },
                {
                    name: 'Decide',
                    subStages: ['First Year']
                },
                {
                    name: 'Exit',
                    subStages: ['First Year']
                }
            ],
            gridRows: ['Job', 'Driver', 'Emotional Experience', 'Metrics', 'Channels'],
            gridData: [
                ['Example', 'Example', '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', '', '']
            ]
        }
    }
};
