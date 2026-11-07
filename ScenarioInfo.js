const ScenarioData = {
    "Scenario 1": {
        maxTurns: 10,
        initiativeFormation: 2,
        designatedFormation: {},
        eq: false,
        eqAdvantage: "",
        thirdEndOps: false,
        night: false,
        Red: "Soviet",
        Blue: "US Army",
        formations: {
            1:{
                id: 1,
                name: "US 1/11th ACR",
                hqName: "Charlie Co HQ",
                morale: 7,
                commandRange: [5,4],
                nation: "US Army",
                cards: 1,
                type: "Formation",
                opsDeck: true,
                turnAvailable: 0,
            },
            2:{
                id: 2,
                name: "Soviet 1/15th GTR",
                hqName: "1st Battalion HQ",
                morale: 6,
                commandRange: [4,3],
                nation: "Soviet",
                cards: 1,
                type: "Formation",
                opsDeck: true,
                turnAvailable: 0,
                reinforcementInfo: "", //just to note will use this to output the text in scenario book
            }

        }
    },
    "Scenario 2": {
        maxTurns: 11,
        initiativeFormation: 1,
        designatedFormation: {
            formationID: 1,
            turns: [2,3],
        },
        eq: false,
        eqAdvantage: "",
        thirdEndOps: false,
        night: false,
        Red: "Soviet",
        Blue: "US Army",
        formations: {
            1: {
                id: 1,
                name: "Soviet 2/247th GMR",
                hqName: "2nd Battalion HQ",
                morale: 6,
                commandRange: [4,3],
                nation: "Soviet",
                cards: 1,
                type: "Formation",
                opsDeck: true,
                turnAvailable: 0,
            },
            2: {
                //one artillery piece per formation
                id: 2,
                name: "Soviet 247th GMR Regimental Artillery",
                morale: 6,
                commandRange: [4,3],
                nation: "Soviet",
                cards: 0,
                type: "Offboard Artillery",
                opsDeck: false,
                artTypes: ["HE","Smoke"],
                turnAvailable: 0,
            },
            3: {
                id: 3,
                name: "US 1/11th ACR",
                hqName: "Bravo Co HQ",
                morale: 7,
                commandRange: [5,4],
                nation: "US Army",
                cards: 1,
                type: "Formation",
                opsDeck: true,
                turnAvailable: 0,
            },
            //temp
            4: {
                id: 4,
                name: "CAS US A-10 Warthog",
                hqName: "",
                morale: 0,
                commandRange: [0,0],
                nation: "US Army",
                cards: 1,
                type: "CAS",
                opsDeck: true,
                turnAvailable: 0,
            }



        }
    }







    
}