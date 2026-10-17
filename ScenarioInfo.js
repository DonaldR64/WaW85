const ScenarioData = {
    "Scenario 1": {


    },
    "Scenario 2": {
        maxTurns: 11,
        initiativeFormation: 1,
        designatedFormation: {
            formationID: 1,
            turns: [2,3],
        },
        thirdEndOps: false,
        night: false,
        Red: "Soviet",
        Blue: "US Army",
        formations: {
            1: {
                id: 1,
                name: "Soviet 2/247th GMR",
                morale: 6,
                commandRange: [4,3],
                nation: "Soviet",
                cards: 1,
                type: "Formation",
                core: true,
            },
            2: {
                id: 2,
                name: "Soviet 247th GMR Regimental Artillery",
                morale: 6,
                commandRange: [4,3],
                nation: "Soviet",
                cards: 0,
                type: "Formation",
                core: false,
                artilleryMissions: {
                    he: {missions: 2, dice: 3, toHit: 4},
                    smoke: {missions: 2},
                },
            },
            3: {
                id: 3,
                name: "US 1/11th ACR",
                morale: 7,
                commandRange: [5,4],
                nation: "US Army",
                cards: 1,
                type: "Formation",
                core: true,
            },




        }
    }







    
}