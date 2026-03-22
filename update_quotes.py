import json

with open('src/data/aggregated_journeys.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

quotes = {
    'Loyalty Journey': [
        "I've been sitting on 500,000 points for two years. Finding somewhere to actually spend them is getting harder every time I look.",
        "I spend more time planning how to earn points than planning the actual trip.",
        "The reward seat was technically free. The taxes came to $1,301. Free is getting expensive.",
        "I built a spreadsheet to track what the app should already be telling me correctly.",
        "Every time they change the earn rates, I change my strategy. The earn rates change a lot.",
        "The status felt earned. The points just feel like they're waiting for Qantas to change the rules again."
    ],
    'Money Journey': [
        "There's always a better offer out there. The trick is finding it before it closes.",
        "I can spend an hour on the maths and still not be sure it stacks up.",
        "I pressed submit and held my breath. Now I just need the bonus to actually show up.",
        "Keeping track of it all is basically a second job. And it doesn't always pay what it promised.",
        "The strategy changes whenever life does. Lately, life's been changing a lot.",
        "I gave it two years. I'm not sure I ended up ahead, honestly."
    ],
    'Cards Journey': [
        "The moment I realised I could earn status without flying felt like finding a cheat code.",
        "I've mapped the whole year out. If the earn rates hold, this actually works perfectly.",
        "Crossing to a new card felt bigger than it should. Now I need to make it earn its keep.",
        "I track every transaction. Half the time the points don't arrive the way they said they would.",
        "I stopped chasing flights. The card earn path fits my life better now, and that's fine.",
        "When the upgrade came through for the whole family, every dollar of that annual fee felt worth it."
    ]
}

def update_node(node):
    if isinstance(node, dict):
        if 'Journey_Name' in node and node['Journey_Name'] in quotes and 'Jobs' in node:
            jname = node['Journey_Name']
            for i, job in enumerate(node['Jobs']):
                if i < len(quotes[jname]):
                    job['Emotional_Experience'] = quotes[jname][i]
        for v in node.values():
            update_node(v)
    elif isinstance(node, list):
        for item in node:
            update_node(item)

update_node(data)

with open('src/data/aggregated_journeys.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)
