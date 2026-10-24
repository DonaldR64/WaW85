const WaW85 = (() => {
    const version = '2026.10.23';
    if (!state.WaW85) {state.WaW85 = {}};

    const pageInfo = {};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ","BA","BB","BC","BD","BE","BF","BG","BH","BI"];

    let Units = {};
    let HexMap = {}; 
    let activeUnitID;
    let UnitIDList = []; //used in create formation
    let Scenario = {};
    let EventInfo = "";

    let HexSize, HexInfo, DIRECTIONS;

    //math constants
    const M = {
        f0: Math.sqrt(3),
        f1: Math.sqrt(3)/2,
        f2: 0,
        f3: 3/2,
        b0: Math.sqrt(3)/3,
        b1: -1/3,
        b2: 0,
        b3: 2/3,
    }

    let SurnameList = {
        Germany: ["Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Schulz","Hoffmann","Bauer","Richter","Klein","Wolf","Schroder","Neumann","Schwarz","Braun","Hofmann","Werner","Krause","Konig","Lang","Vogel","Frank","Beck"],
        Soviet: ["Ivanov","Smirnov","Petrov","Sidorov","Popov","Vassiliev","Sokolov","Novikov","Volkov","Alekseev","Lebedev","Pavlov","Kozlov","Orlov","Makarov","Nikitin","Zaitsev","Golubev","Tarasov","Ilyin","Gusev","Titov","Kuzmin","Kiselyov","Belov"],
        "US Army": ["Smith","Johnson","Williams","Brown","Jones","Wright","Miller","Davis","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Thompson","White","Harris","Clark","Lewis","Robinson","Walker","Young","Allen","Garcia","Martinez"],
        UK: ["Smith","Jones","Williams","Taylor","Davies","Brown","Wilson","Evans","Thomas","Johnson","Roberts","Walker","Wright","Robinson","Thompson","White","Hughes","Edwards","Green","Lewis","Wood","Harris","Martin","Jackson","Clarke"],
    }

    let FirstNameList = {
        Germany: ["Hans","Peter","Klaus","Wolfgang","Jürgen","Dieter","Manfred","Uwe","Günter","Horst","Bernd","Karl","Werner","Heinz","Rolf","Rainer","Gerhard","Helmut","Michael","Gerd"],
        Soviet: ["Aleksandr","Mikhail","Artem","Maksim", "Ivan","Dmitrt","Daniil","Matvey","Timofey","Aleksey","Sergey","Andrey","Roman","Mark","Vladimir","Nik","Kirill","Ilya","Egor","Nikolai"],
        "US Army": ["Jim","Bob","John","Bill","Dick","David","Chuck","Tom","Mike","Ron","Larry","Don","Joe","Gary","George","Ken","Paul","Ed","Jerry","Dennis"],
        UK: ["James","Robert","John","William","Richard","David","Charles","Thomas","Michael","Ronald","Donald","George","Edward","Arthur","Kenneth","Brian","Peter","Alan","Dennis","Raymond"],


    }


    const DefineHexInfo = () => {
        HexSize = (70 * pageInfo.scale)/M.f0;
        if (pageInfo.type === "hex") {
            HexInfo = {
                size: HexSize,
                pixelStart: {
                    x: 35 * pageInfo.scale,
                    y: HexSize,
                },
                width: 70  * pageInfo.scale,
                height: pageInfo.scale*HexSize,
                xSpacing: 70 * pageInfo.scale,
                ySpacing: 3/2 * HexSize,
                directions: {
                    "Northeast": new Cube(1,-1,0),
                    "East": new Cube(1,0,-1),
                    "Southeast": new Cube(0,1,-1),
                    "Southwest": new Cube(-1,1,0),
                    "West": new Cube(-1,0,1),
                    "Northwest": new Cube(0,-1,1),
                },
                halfToggleX: 35 * pageInfo.scale,
                halfToggleY: 0,
            }
            DIRECTIONS = ["Northeast","East","Southeast","Southwest","West","Northwest"];
        } else if (pageInfo.type === "hexr") {
            //Hex H or Flat Topped
            HexInfo = {
                size: HexSize,
                pixelStart: {
                    x: HexSize,
                    y: 35 * pageInfo.scale,
                },
                width: pageInfo.scale*HexSize,
                height: 70  * pageInfo.scale,
                xSpacing: 3/2 * HexSize,
                ySpacing: 70 * pageInfo.scale,
                directions: {
                    "North": new Cube(0, -1, 1),
                    "Northeast": new Cube(1, -1, 0),
                    "Southeast": new Cube(1,0,-1),
                    "South": new Cube(0,1,-1),
                    "Southwest": new Cube(-1,1,0),
                    "Northwest": new Cube(-1,0,1),
                },
                halfToggleX: 0,
                halfToggleY: 35 * pageInfo.scale,
            }
            DIRECTIONS = ["North","Northeast","Southeast","South","Southwest","Northwest"];
        }
    }



    const SM = {
        oom: "status_MissileOut::7901720",
        low: "status_MissileLow::7901721", 
        reload: "status_MissileReload::7901719",

        landed: "status_letters_and_numbers0262::5982382",
        noe: "status_letters_and_numbers0264::5982384",
        hovering: "status_letters_and_numbers0258::5982378",
        flying: "status_letters_and_numbers0256::5982376",

        EW: "status_ew::7901717",
        EWReducing: "status_ew2::7901718", 

        passenger: "status_letters_and_numbers0266::5982386",
    }; 


    const TurnMarkers = ["","https://s3.amazonaws.com/files.d20.io/images/361055772/zDURNn_0bbTWmOVrwJc6YQ/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055766/UZPeb6ZiiUImrZoAS58gvQ/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055764/yXwGQcriDAP8FpzxvjqzTg/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055768/7GFjIsnNuIBLrW_p65bjNQ/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055770/2WlTnUslDk0hpwr8zpZIOg/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055771/P9DmGozXmdPuv4SWq6uDvw/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055765/V5oPsriRTHJQ7w3hHRBA3A/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055767/EOXU3ujXJz-NleWX33rcgA/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055769/925-C7XAEcQCOUVN1m1uvQ/thumb.png?1695998303"];


    const MoveMarkers = ["https://files.d20.io/images/344441274/R0eEVMFzhYmwv6rigIA7GA/thumb.png?1685718541","https://s3.amazonaws.com/files.d20.io/images/435360245/m3tKJi3Pqb_40g75O6ouSg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360246/pXI3HBrGMZ05ldDfH-zYCQ/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360229/JKMY922qxhf0E3z1l10jQg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360228/YDGEQNR_qVFprdHJSjYNPg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360232/1TysQcieJ5zbgYvXV4pqiA/thumb.png?1743563857","https://s3.amazonaws.com/files.d20.io/images/435360240/KfCmoF5WyWTStCWOTPrkJg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360230/zjvzMFGWotZUORDeIVXrEw/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360226/-TXBFvMfahwOIjXEuS0mTQ/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360237/gEr7oP4z0ByUKTXpvSHYQQ/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360241/2HAnTYlC0uVR6mqyMoaACA/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360244/CDOLr8RkQ-pPhwjaOHTbEA/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360243/023KSjjB8QHtrMNbuO3ENQ/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360242/xx2msq4HjqRN5dUaPl0vfA/thumb.png?1743563857","https://s3.amazonaws.com/files.d20.io/images/435360236/L-iuGURhzreq2t2mKOj3Qg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360247/v2Y15K10F2qZK268wPzYyw/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360239/SXny1fVCh5PeYxLGtnoPTA/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360233/EdB3z27csNyykkc2lWTefw/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360227/JpFvEVLKlKV6n6JsE8zrVg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360234/5b2XrhzPgfgjdoI5y97LnQ/thumb.png?174356385","https://s3.amazonaws.com/files.d20.io/images/435360238/_sWU7YtYJsWT1NZC-wb80Q/thumb.png?1743563857","https://s3.amazonaws.com/files.d20.io/images/435360231/n7HVTuMwWch59Aofq1v96w/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360235/yVtSNUPJOkxq0n2_FknMcA/thumb.png?1743563856"];

    let weaponSounds = {
        "Small Arms and Light Weapons": "Small Arms",
        "LAW": "Handheld AT",
        "Grenade Launcher": "Vehicle Missile",
        "Infantry ATGM": "Vehicle Missile",       
        "Infantry SAM": "ATG", 
        "Vehicle MG": "Vehicle MG",
        "Gun": "Gun",
        "Autocannon": "Autocannon",
        "Vehicle ATGM": "Vehicle Missile", 
        "Vehicle SAM": "ATG",  

    }

    let outputCard = {title: "",subtitle: "",nation: "",body: [],buttons: [],};

    const RedFor = ["Soviet",];
    const BlueFor = ["US Army","US Marine Corps","British","West Germany","Canada"];

    const RedForFlag = ["Warpact::5862802"];
    const BlueForFlag = ["NATO::5862803"];

    const squadMarkers = ["Red-01::2006626","Red-02::2006628","Red-03::2006629","Red-04::2006631","Red-05::2006633"];

    const Nations = {
        "Soviet": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/324272729/H0Ea79FLkZIn-3riEhuOrA/thumb.png?1674441877",
            "backgroundColour": "#FF0000",
            "titlefont": "Anton",
            "fontColour": "#000000",
            "borderColour": "#FFFF00",
            "borderStyle": "5px groove",
            "dice": "Soviet",
            "targetID": "-P4Kcu3eDO9uQFam_cNn",   
            "targetImg": "https://files.d20.io/images/319032004/qf3aHgIiFnJ0aYoPOFR-TA/thumb.png?1671325647",
        },
        "West German": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/329415788/ypEgv2eFi-BKX3YK6q_uOQ/thumb.png?1677173028",
            "backgroundColour": "#000000",
            "titlefont": "Bokor",
            "fontColour": "#FFFFFF",
            "borderColour": "#000000",
            "borderStyle": "5px double",
            "dice": "West-German",
        },
        "British": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/330506939/YtTgDTM3q7p8m0fJ4-E13A/thumb.png?1677713592",
            "backgroundColour": "#0E2A7A",
            "titlefont": "Merriweather",
            "fontColour": "#FFFFFF",
            "borderColour": "#BC2D2F",
            "borderStyle": "5px groove",
            "dice": "British",
            
        },
        "US Army": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/327595663/Nwyhbv22KB4_xvwYEbL3PQ/thumb.png?1676165491",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#006400",
            "borderColour": "#006400",
            "borderStyle": "5px double",
            "dice": "US-Army",
            "targetID": "-P4Kd3IXhoaTgaSKNXCs",
            "targetImg": "https://files.d20.io/images/327891469/QfaYQvRbVs7tA_3jGFwQ9Q/thumb.png?1676321007",
        },

        "Neutral": {
            "image": "",
            "backgroundColour": "#FFFFFF",
            "dice": "UK",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00FF00",
            "borderStyle": "5px ridge",
        },

    };


    const TerrainInfo = {
        "Cultivated": {
            terrain: "Cultivated",
            movementCosts: {
                "Troops": 1, "Vehicles": 2, "Helo NOE": 1, "Helo Flying": 1
            },
            defenseBonus: {"Troops": 1, "Vehicles": 0},
            los: "Obscures",
            height: 0,
            unitHeight: {
                "Ground": 0,
                "Helo Landed": 0,
                "Helo NOE": 0,
                "Helo Hover": 1,
                "Helo Flying": 2,
                "CAS": 2,    
            },
            assaultMod: false,
        },
        "Rough": {
            terrain: "Rough",
            movementCosts: {
                "Troops": 2, "Vehicles": 3, "Helo NOE": 1, "Helo Flying": 1
            },
            defenseBonus: {"Troops": 1, "Vehicles": 1},
            los: "Obscures",
            height: 0,
            unitHeight: {
                "Ground": 0,
                "Helo Landed": false,
                "Helo NOE": 0,
                "Helo Hover": 1,
                "Helo Flying": 2,
                "CAS": 2,    
            },
            assaultMod: false,
        },
        "City": {
            terrain: "City",
            movementCosts: {
                "Troops": 1, "Vehicles": 2, "Helo NOE": 100, "Helo Flying": 1
            },
            defenseBonus: {"Troops": 2, "Vehicles": 1},
            los: "Blocks",
            height: 1,
            unitHeight: {
                "Ground": 0,
                "Helo Landed": false,
                "Helo NOE": 1,
                "Helo Hover": 2,
                "Helo Flying": 3,
                "CAS": 3,    
            },
            assaultMod: true,
        },
        "Woods": {
            terrain: "Woods",
            movementCosts: {
                "Troops": 1, "Vehicles": 2, "Helo NOE": 100, "Helo Flying": 1
            },
            defenseBonus: {"Troops": 1, "Vehicles": 1},
            los: "Blocks",
            height: 1,
            unitHeight: {
                "Ground": 0,
                "Helo Landed": false,
                "Helo NOE": 1,
                "Helo Hover": 2,
                "Helo Flying": 3,
                "CAS": 3,    
            },
            assaultMod: false,
        },
        "Hill - Clear": {
            terrain: "Hill - Clear",
            //note need to check in program re uphill for cost and defense 
            movementCosts: {
                "Troops": 1, "Vehicles": 1, "Helo NOE": 1, "Helo Flying": 1,
            },
            defenseBonus: {"Troops": 0, "Vehicles": 0},
            los: "Blocks",
            height: 2,
            unitHeight: {
                "Ground": 2,
                "Helo Landed": 2,
                "Helo NOE": 2,
                "Helo Hover": 3,
                "Helo Flying": 4,
                "CAS": 4,    
            },
            assaultMod: false,
        },

        "Hill - City": {
            terrain: "Hill - City",
            //note need to check in program re uphill for defense 
            movementCosts: {
                "Troops": 1, "Vehicles": 2, "Helo NOE": 100, "Helo Flying": 1,
            },
            defenseBonus: {"Troops": 2, "Vehicles": 1},
            los: "Blocks",
            height: 2,
            unitHeight: {
                "Ground": 3,
                "Helo Landed": false,
                "Helo NOE": 3,
                "Helo Hover": 4,
                "Helo Flying": 5,
                "CAS": 5,    
            },
            assaultMod: true,
        },
        "Hill - Woods": {
            terrain: "Hill - Woods",
            //note need to check in program re uphill for defense 
            movementCosts: {
                "Troops": 1, "Vehicles": 2, "Helo NOE": 100, "Helo Flying": 1,
            },
            defenseBonus: {"Troops": 1, "Vehicles": 1},
            los: "Blocks",
            height: 3,
            unitHeight: {
                "Ground": 2,
                "Helo Landed": false,
                "Helo NOE": 3,
                "Helo Hover": 4,
                "Helo Flying": 5,
                "CAS": 5,    
            },
            assaultMod: false,
        },
        "Water": {
            terrain: "Water",
            //note need to check in program re amphbious
            movementCosts: {
                "Troops": 100, "Vehicles": 100, "Helo NOE": 1, "Helo Flying": 1,
            },
            defenseBonus: {"Troops": 0, "Vehicles": -1},
            los: "Normal",
            height: -1,
            unitHeight: {
                "Ground": -1,
                "Helo Landed": false,
                "Helo NOE": 1,
                "Helo Hover": 0,
                "Helo Flying": 1,
                "CAS": 1,    
            },
            assaultMod: false,
        },









    }











    //line line collision where line1 is pt1 and 2, line2 is pt 3 and 4
    const lineLine = (pt1,pt2,pt3,pt4) => {
        //calculate the direction of the lines
        uA = ( ((pt4.x-pt3.x)*(pt1.y-pt3.y)) - ((pt4.y-pt3.y)*(pt1.x-pt3.x)) ) / ( ((pt4.y-pt3.y)*(pt2.x-pt1.x)) - ((pt4.x-pt3.x)*(pt2.y-pt1.y)) );
        uB = ( ((pt2.x-pt1.x)*(pt1.y-pt3.y)) - ((pt2.y-pt1.y)*(pt1.x-pt3.x)) ) / ( ((pt4.y-pt3.y)*(pt2.x-pt1.x)) - ((pt4.x-pt3.x)*(pt2.y-pt1.y)) );
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            intersection = {
                x: (pt1.x + (uA * (pt2.x-pt1.x))),
                y: (pt1.y + (uA * (pt2.y-pt1.y)))
            }
            return intersection;
        }
        return;
    }
   
 
  







    //Classes
    class Point {
        constructor(x,y) {
            this.x = x;
            this.y = y;
        };
        toOffset() {
            let cube = this.toCube();
            let offset = cube.toOffset();
            return offset;
        };
        toCube() {
            let x = this.x - HexInfo.pixelStart.x;
            let y = this.y - HexInfo.pixelStart.y;
            let q,r;
            if (pageInfo.type === "hex") {
                q = (M.b0 * x + M.b1 * y) / HexInfo.size;
                r = (M.b3 * y) / HexInfo.size;
            } else if (pageInfo.type === "hexr") {
                q = (M.b3 * x) / HexInfo.size;
                r = (M.b1 * x + M.b0 * y) / HexInfo.size;
            }
            let cube = new Cube(q,r,-q-r).round();
            return cube;
        };
        distance(b) {
            return Math.sqrt(((this.x - b.x) * (this.x - b.x)) + ((this.y - b.y) * (this.y - b.y)));
        }
        label() {
            return this.toCube().label();
        }
    }

    class Offset {
        constructor(col,row) {
            this.col = col;
            this.row = row;
        }
        label() {
            let label = rowLabels[this.row] + (this.col + 1).toString();
            return label;
        }
        toCube() {
            let q,r;
            if (pageInfo.type === "hex") {
                q = this.col - (this.row - (this.row&1))/2;
                r = this.row;
            } else if (pageInfo.type === "hexr") {
                q = this.col;
                r = this.row - (this.col - (this.col&1))/2;
            }
            let cube = new Cube(q,r,-q-r);
            cube = cube.round(); 
            return cube;
        }
        toPoint() {
            let cube = this.toCube();
            let point = cube.toPoint();
            return point;
        }
    };

    class Cube {
        constructor(q,r,s) {
            this.q = q;
            this.r =r;
            this.s = s;
        }

        add(b) {
            return new Cube(this.q + b.q, this.r + b.r, this.s + b.s);
        }
        angle(b) {
            //angle between 2 hexes
            let origin = this.toPoint();
            let destination = b.toPoint();

            let x = Math.round(origin.x - destination.x);
            let y = Math.round(origin.y - destination.y);
            let phi = Math.atan2(y,x);
            phi = phi * (180/Math.PI);
            phi = Math.round(phi);
            phi -= 90;
            phi = Angle(phi);
            return phi;
        }        
        subtract(b) {
            return new Cube(this.q - b.q, this.r - b.r, this.s - b.s);
        }
        static direction(direction) {
            return HexInfo.directions[direction];
        }
        neighbour(direction) {
            //returns a hex (with q,r,s) for neighbour, specify direction eg. hex.neighbour("NE")
            return this.add(HexInfo.directions[direction]);
        }
        neighbours() {
            //all 6 neighbours
            let results = [];
            for (let i=0;i<DIRECTIONS.length;i++) {
                results.push(this.neighbour(DIRECTIONS[i]));
            }
            return results;
        }

        len() {
            return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
        }
        distance(b) {
            return this.subtract(b).len();
        }
        lerp(b, t) {
            return new Cube(this.q * (1.0 - t) + b.q * t, this.r * (1.0 - t) + b.r * t, this.s * (1.0 - t) + b.s * t);
        }
        linedraw(b) {
            //returns array of hexes between this hex and hex 'b' excl. hex 'b'
            var N = this.distance(b);
            var a_nudge = new Cube(this.q + 1e-06, this.r + 1e-06, this.s - 2e-06);
            var b_nudge = new Cube(b.q + 1e-06, b.r + 1e-06, b.s - 2e-06);
            var results = [];
            var step = 1.0 / Math.max(N, 1);
            for (var i = 1; i < N; i++) {
                results.push(a_nudge.lerp(b_nudge, step * i).round());
            }
            return results;
        }

        linedraw2(b) {
            //returns array of hexes between this hex and hex 'b' incl. hex 'b', nudging other way from above 
            var N = this.distance(b);
            var a_nudge = new Cube(this.q - 1e-06, this.r - 1e-06, this.s + 2e-06);
            var b_nudge = new Cube(b.q - 1e-06, b.r - 1e-06, b.s + 2e-06);
            var results = [];
            var step = 1.0 / Math.max(N, 1);
            for (var i = 1; i < N; i++) {
                results.push(a_nudge.lerp(b_nudge, step * i).round());
            }
            return results;
        }
        label() {
            let offset = this.toOffset();
            let label = offset.label();
            return label;
        }
        radius(rad) {
            //returns array of hexes in radius rad
            //Not only is x + y + z = 0, but the absolute values of x, y and z are equal to twice the radius of the ring
            let results = [];
            let h;
            for (let i = 0;i <= rad; i++) {
                for (let j=-i;j<=i;j++) {
                    for (let k=-i;k<=i;k++) {
                        for (let l=-i;l<=i;l++) {
                            if((Math.abs(j) + Math.abs(k) + Math.abs(l) === i*2) && (j + k + l === 0)) {
                                h = new Cube(j,k,l);
                                results.push(this.add(h));
                            }
                        }
                    }
                }
            }
            return results;
        }

        ring(radius) {
            let results = [];
            let b = new Cube(-1 * radius,0,1 * radius);  //start at west 
            let cube = this.add(b);
            for (let i=0;i<6;i++) {
                //for each direction
                for (let j=0;j<radius;j++) {
                    results.push(cube);
                    cube = cube.neighbour(DIRECTIONS[i]);
                }
            }
            return results;
        }

        round() {
            var qi = Math.round(this.q);
            var ri = Math.round(this.r);
            var si = Math.round(this.s);
            var q_diff = Math.abs(qi - this.q);
            var r_diff = Math.abs(ri - this.r);
            var s_diff = Math.abs(si - this.s);
            if (q_diff > r_diff && q_diff > s_diff) {
                qi = -ri - si;
            }
            else if (r_diff > s_diff) {
                ri = -qi - si;
            }
            else {
                si = -qi - ri;
            }
            return new Cube(qi, ri, si);
        }
        toPoint() {
            let x,y;
            if (pageInfo.type === "hex") {
                x = (M.f0 * this.q + M.f1 * this.r) * HexInfo.size;
                y = 3/2 * this.r * HexInfo.size;
            } else if (pageInfo.type === "hexr") {
                x = 3/2 * this.q * HexInfo.size;
                y = (M.f1 * this.q + M.f0 * this.r) * HexInfo.size;
            }
            x += HexInfo.pixelStart.x;
            y += HexInfo.pixelStart.y;
            let point = new Point(x,y);
            return point;
        }
        toOffset() {
            let col,row;
            if (pageInfo.type === "hex") {
                col = this.q + (this.r - (this.r&1))/2;
                row = this.r;
            } else if (pageInfo.type === "hexr") {
                col = this.q;
                row = this.r + (this.q - (this.q&1))/2;
            }
            let offset = new Offset(col,row);
            return offset;
        }
        whatDirection(b) {
            let delta = new Cube(b.q - this.q,b.r - this.r, b.s - this.s);
            let dir = "Unknown";
            let keys = Object.keys(HexInfo.directions);
            for (let i=0;i<6;i++) {
                let d = HexInfo.directions[keys[i]];
                if (d.q === delta.q && d.r === delta.r && d.s === delta.s) {
                    dir = keys[i];
                }
            }
            return dir
        }

     
    };

    class Hex {
        constructor(point) {
            this.centre = point;
            let offset = point.toOffset();
            this.offset = offset;
            this.tokenIDs = [];
            this.cube = offset.toCube();
            this.label = offset.label();
            let edges = {};
            for (let i=0;i<6;i++) {
                edges[DIRECTIONS[i]] = "Open";
            }
            this.edges = edges;
            this.terrain = "Clear";
            this.improved = []; //improved positions
            this.minefield = [];
            this.minefieldType = ""; //placed or random
            this.wrecks = []; //changed in firing
            this.rubble = [];
            this.fire = [];
            this.height = 0; //height of terrain itself
            this.unitHeight = {
                "Ground": 0,
                "Helo Landed": 0,
                "Helo NOE": 0,
                "Helo Hover": 1,
                "Helo Flying": 2,
                "CAS": 2,    
            }
            this.offboard = true;
            this.los = "Normal";
            this.smoke = [];
            this.smokeType = ""; //full or half
            this.movementCosts = {"Troops": 1, "Vehicles": 1, "Helo NOE": 1, "Helo Flying": 1};
            this.defenseBonus = {"Troops": 0, "Vehicles": 0},
            this.road = false;
            this.assaultMod = false;

//a function will be needed for player to place imp. positions and minefields, while random imefields are from firing


            HexMap[this.label] = this;
        }


        Distance(b) {
            let dist = this.cube.distance(b.cube);
            return dist;
        }



    }






    class Unit {
        constructor(id) {
            let token = findObjs({_type:"graphic", id: id})[0];
            if (!token) {return};
            let charID = token.get("represents");
            let char = getObj("character", charID); 
            if (!char) {return};
            let location = new Point(token.get("left"),token.get("top"));
            let hexLabel = location.label();
            let attributes = AttributeArray(char.id);  

            let nation = attributes.nation;
            let player = (RedFor.includes(nation)) ? 0:1;

            let type = attributes.type;
            let group;
            if (type === "Infantry" || type === "Towed" || type === "Vehicle" || type === "HQ" || type === "Leader") {
                group = "Ground";
            }
            if (type === "Aircraft" || type === "Helicopter") {
                group = "Air"
            }
            
            let armourType = attributes.armourtype;
            let armour;
            let save = attributes.save;
            if (armourType === "Soft") {
                armour = 0;
                save = 7;
            } else if (armourType === "Light") {
                armour = 1;
                save = parseInt(save);
            } else if (armourType === "Heavy") {
                armour = parseInt(attributes.armour);
                save = parseInt(save);
            }


            //for reduced units, FP or to hit may have brackets - sort these out into [0] and [1] using the Stats function
            let assaultFP = Stats(attributes.assaultfp);
            let assaultToHit = Stats(attributes.assaulttohit);
            let stabilizedWeapons = false;
            let artWeapon = "";
            let apWeapon = false; //a flag for assault if unit has a valid AP weapon

            let weapons = [];
            for (let i=1;i<4;i++) {
                let equip = attributes["weapon" + i + "equipped"] || "Off";
                let wname = attributes["weapon" + i + "name"];
                if (equip === "Off" || wname === "" || wname === undefined) {continue};
                let wtype = attributes["weapon" + i + "type"] || "AP";
                let wrange = attributes["weapon" + i + "range"];
                let wminrange = 0;
                if (wrange && wrange.includes("-")) {
                    wrange = wrange.split('-');
                    wminrange = parseInt(wrange[0]);
                    wrange = parseInt(wrange[1]);
                } else {
                    wrange = parseInt(wrange);
                }


                let wfp = Stats(attributes["weapon" + i + "fp"]);
                let wtoHit = Stats(attributes["weapon" + i + "tohit"]);
                let wnotes = attributes["weapon" + i + "notes"] || " ";

                let weapon = {
                    pos: (i-1),
                    name: wname,
                    type: wtype,
                    minRange: wminrange,
                    range: wrange,
                    fp: wfp, //array
                    toHit: wtoHit, //array
                    notes: wnotes,
                }
                if (wnotes.includes("Indirect")) {
                    artWeapon = weapon;
                }
                if (wnotes.includes("Stabilized")) {
                    stabilizedWeapons = true;
                } 
                if (wtype === "AP" && wminRange > 0) {
                    apWeapon = true;
                }


                weapons.push(weapon);
            }
            let special = attributes.special;
//things to special

            let movement = attributes.movement;
            let movementType = attributes.movementType;
            //Ground, Amphiphious etc
            if (movementType !== "Helo" && movementType !== "Flying" && movementType !== "Towed") {
                movement = parseInt(movement);
            }

            this.name = token.get("name");
            this.id = id;
            this.charName = attributes.displayname;
            this.charID = charID;
            this.token = token;
            this.type = type;
            this.group = group;
            this.player = player;
            this.nation = nation;

            this.hexLabel = hexLabel; //current location
            this.lastHexInfo = {}; //last hex moved into during movement, blank at start of turn and when fired at

            this.armourType = armourType;
            this.armour = armour;
            this.save = save;
            
            this.assaultFP = assaultFP || 0;
            this.assaultToHit = assaultToHit || 7;
            this.assaultDamage = 0;
            this.assaultCB = 0;

            this.artWeapon = artWeapon;
            this.stabilizedWeapons = stabilizedWeapons;
            this.apWeapon = apWeapon;

            this.attachedID = "";//id of unit THIS unit is attached to - HQ, leader etc

            this.weapons = weapons;

            this.movement = movement;
            this.movementType = movementType;
            this.action = "";

            this.special = special || " ";

            if (this.type === "HQ" || this.type === "Leader") {
                let command = special.split(",").find(e => e.includes("Command"));
                command = command.replace("Command: ","");
                command = command.split("(").map(e => e.replace(/[^\d]/g,""));
                this.command = command;
            }
            if (this.type === "Leader") {
                let leaderMorale = special.split(",").find(e => e.includes("Morale"));
                leaderMorale = leaderMorale.replace("Morale: ","");
                leaderMorale = leaderMorale.split("(").map(e => e.replace(/[^\d]/g,""));
                this.leaderMorale = leaderMorale;
            }

            let formationID = "";
            if (state.WaW85.unitInfo[id]) {
                formationID = state.WaW85.unitInfo[id];
            }
            this.formationID = formationID;


            this.unloaded = false; //a flag
            this.passUnloaded = false; //flag

            let transportID = Object.keys(state.WaW85.passengerID).find(key => state.WaW85.passengerID[key] === id);
            if (transportID) {
                let transTok = getObj('graphic',transportID)
                let transLabel = new Point(transTok.get("left"),transTok.get("top")).toCube().label();
                this.hexLabel = transLabel;
            }

            Units[id] = this;
            HexMap[hexLabel].tokenIDs.push(id);





        }
           
        ApplyDamage(damage,damageType) {
            if (this.type === "Aircraft") {
                if (damage >= 2) {
                    this.Eliminate();
                } else {
                    let roll = randomInteger(6);
                    if (roll < 4) {
                        outputCard.body.push(this.name + " Circles Back");
                    } else {
                        outputCard.body.push(this.name + " Calls off its Run and returns to Base due to the Damage");
                        //remove card and counter, not eliminated for VP
                    }
                    


                }
            } else {
                damageloop1:
                for (let i=0;i<damage;i++) {
                    let undisrupted = this.Status();
                    if (undisrupted === true) {
                        this.Disrupt();
                    } else {
                        if (this.health === "Eliminated") {
                            if (damageType === "Assault") {
                                break damageloop1; //no carryover
                            }
                            let remaining = damage - i;
                            //check for carryover
    //exclude  air / helos / hq and leaders
                            let hex = HexMap[this.hexLabel];
                            if (hex.tokenIDs.length > 1) {
                                for (let k=0;k<hex.tokenIDs.length;k++) {
                                    let id2 = hex.tokenIDs[k];
                                    if (id2 === this.id) {continue};
                                    let unit2 = Units[id2];
                                    if ((damageType === "AP" && (unit2.type === "Infantry" || unit2.type === "Towed")) || (damageType === "HE" && unit2.armourType === "Heavy")) {
                                        break damageloop1;//no carryover
                                    }
                                    unit2.ApplyDamage(remaining);
                                    break damageloop1;
                                }
                            }
                        } else if (this.health === "Reduced" || this.steps === 1) {
                            this.Eliminate();
                        } else {
                            this.Reduce();
                        }
                    }
                }

            }
        }

        Eliminate() {
            this.token.set("status_dead");
//move to map, will clear later from map, units and formations
            this.health = "Eliminated"
            outputCard.body.push(this.name + " is Eliminated");
//if passengers, roll d6 -> 1-3 passengers reduced and disrupted, roll also for leaders/hq, 4-6 passengers eliminated + possibly leaders/hq
//if flying or hovering helicopter, passengers eliminated + HQ and leaders
//if landed or NOE helo see rules
            //if aircraft, remove its card
            //if vehicle, place a wreck if not one already there and not all water hex



            
            
        }
        Disrupted() {
            //returns true if disrupted
            let disrupted = (this.token.get("tint_color") === "transparent") ? false:true;
            return disrupted;
        }
        SetDisrupt(stat) {
            let tint = stat === true ? "#ff0000":"transparent";
            this.token.set("tint_color",tint);
        }
        Reduced(){
            //returns true if reduced or 1 step
            let currentSide = this.token.get("currentSide");
            let reduced = false;
            if (currentSide === 1) {
                reduced = true;
            } 
            return reduced;
        }
        SetReduced(stat) {
            let steps = this.token.get("sides").split("|").length;
            let newSide = (stat === true && steps === 2) ? 1:0; 
            this.token.set("currentSide",newSide);
        }
        Active() {
            let active = (this.token.get("aura1_color") === "#00ff00") ? true:false;
            return active;
        }
        SetActive() {
            if (this.type !== "HQ" && this.type !== "Leader" && this.type !== "Support") {
                this.token.set("aura1_color","#00ff00");
            }
        }
        Ready() {
            let ready = (this.token.get("aura1_color") === "#00ff00" || this.token.get("aura1_color") === "#ff00ff") ? true:false;
            if (this.type === "Leader" || this.type === "HQ" || this.type === "Support") {
                let parentID = Object.keys(state.WaW85.attachedIDs).find(key => state.WaW85.attachedIDs[key].includes(this.id));
                if (parentID) {
                    let parent = Units[parentID];
                    if (parent) {
                        ready = parent.Ready();
                    }
                }
            }
            return ready;
        }
        SetReady(ready) {
            let aura = (ready === true) ? "#ff00ff":"#000000";
            if (this.type === "Leader" || this.type === "HQ" || this.type === "Support") {
                aura = "transparent";
            }
            this.token.set({
                aura1_color: aura,
                aura1_radius: 20,
                bar3_value: "",
                bar3_max: 0,
            })
        }



        OOC() {
            let ooc = (this.token.get("aura1_color") === "#ffff00") ? true:false;
            return ooc;
        }
        SetOOC() {
            this.token.set({
                aura1_color: "#ffff00",
                aura1_radius: 20,
                bar3_value: "",
                bar3_max: 0,
            })
        }


        Distance(b) {
            return HexMap[this.hexLabel].Distance(HexMap[b.hexLabel]);
        }

        Height() {
            let height;
            let hex = HexMap[this.hexLabel];
            if (this.type === "Aircraft") {
                height = hex.unitHeight["CAS"];
            } else if (this.type === "Helicopter") {
                let heloStatus = this.HeloStatus();
                height = hex.unitHeight[heloStatus];
            } else {
                height = hex.unitHeight["Ground"];
            }
            return height;
        }

        HeloStatus() {
            let modes = ["landed","hovering","flying"];
            let status = "NOE";
            _.each(modes,mode => {
                if (this.token.get(SM[mode])) {
                    status = mode;
                }
            })
            status = status.charAt(0).toUpperCase() + status.slice(1);
            return status
        }

        SetHeloStatus(newMode) {
            newMode = newMode.toLowerCase();
            let modes = ["landed","noe","hovering","flying"];
            _.each(modes,mode => {
                if (mode === newMode) {
                    this.token.set(SM[mode],true);
                } else {
                    this.token.set(SM[mode],false);
                }
            })
        }




        MoveType() {
            let mt = "None";
            if (this.type === "Infantry") {
                mt = "Troops";
            }
            if (this.type === "Vehicle") {
                mt = "Vehicles";
            }
            if (this.type === "Helicopter") {
                mt = this.HeloStatus();
            }
            if (this.type === "Support" || this.type === "Leader") {
                mt = "Troops";
            }
            return mt
        }

        Stackable() {
            let st = false;
            if (this.type === "Leader" || this.type === "HQ" || this.type === "Support") {
                st = true;
            }
            if (this.type === "Helicopter") {
                let hs = this.HeloStatus();
                if (hs === "Flying" || hs === "Hovering") {
                    st = true;
                }
            }
            return st;
        }

        Leader() {
            let stats = {
                command: 0, //command bonus
                morale: 0, //alt morale due to leader
            }
            let attachedIDs = state.WaW85.attachedIDs[this.id] || [];
            for (let i=0;i<attachedIDs.length;i++) {
                let unit2 = Units[attachedIDs[i]];
                if (unit2.type === "Leader" || unit2.type === "HQ") {
                    stats.command = Math.max(stats.command,unit2.command);
                }
                if (unit2.type === "Leader") {
                    stats.morale = unit2.morale;
                }
            }            
            return stats;
        }

        MoveAttached() {
            let attachedIDs = state.WaW85.attachedIDs[this.id] || [];
            for (let i=0;i<attachedIDs.length;i++) {
                let unit2 = Units[attachedIDs[i]];
                let dx = this.token.get("width")/2;
                let dy = this.token.get('height')/2;
                if (unit2.type === "HQ") {
                    //top L
                    dx = -dx;
                    dy = -dy;
                } else if (unit2.type === "Leader") {
                    //bottom L
                    dx = -dx;
                } else {
                    //default is top R
                    dy = -dy;
                }
                let x = this.token.get("left") + dx;
                let y = this.token.get("top") + dy;
                unit2.token.set({
                    left: x,
                    top: y,
                })
                ChangeTokenIDs(unit2.id,unit2.hexLabel,this.hexLabel);
                unit2.hexLabel = this.hexLabel;
            }
        }






    }


    const DefineMap = () => {
        let path = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map", stroke: "#93c47d"})[0];
        let vertices = translatePoly(path);
        _.each(HexMap,hex => {
             if (hex.centre.x >= vertices[0].x && hex.centre.x <= vertices[1].x && hex.centre.y >= vertices[0].y && hex.centre.y <= vertices[1].y) {hex.offboard = false};
        })
    }


    const edgeCrossed = (unit) => {
        let hex = HexMap[unit.hexLabel];
        let prevHex = HexMap[unit.lastHexLabel];
        let direction = prevHex.cube(hex.cube);
        let edge = lastHex.edges[direction];
        return edge;
    }





    const Stats = (str) => {
        let array = [];
        if (str && str.length > 0) {
            for (let i=0;i<str.length;i++) {
                let a = parseInt(str[i]);
                if (isNaN(a)) {continue};
                array.push(a);
            }
            if (array.length === 1) {array.push(array[0])};
        }
        return array;
    }



    const FlipGraphic = (angle,tok,team) => {
        let rot;
        let flip = false;
        angle = Angle(angle);
        if (angle > 180 && angle <= 360) {
            flip = true;
        }
        tok.set({
            rotation: angle,
            fliph: flip,
        });
    }

    const simpleObj = (o) => {
        let p = JSON.parse(JSON.stringify(o));
        return p;
    };

    const getCleanImgSrc = (imgsrc) => {
        let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    };

    const tokenImage = (img) => {
        //modifies imgsrc to fit api's requirement for token
        img = getCleanImgSrc(img);
        img = img.replace("%3A", ":");
        img = img.replace("%3F", "?");
        img = img.replace("med", "thumb");
        return img;
    };

    const stringGen = () => {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 6; i++) {
            text += possible.charAt(randomInteger(possible.length - 1));
        }
        return text;
    };

    const findCommonElements = (arr1,arr2) => {
        //iterates through array 1 and sees if array 2 has any of its elements
        //returns true if the arrays share an element
        return arr1.some(item => arr2.includes(item));
    };


    const DeepCopy = (variable) => {
        variable = JSON.parse(JSON.stringify(variable))
        return variable;
    };

    const PlaySound = (name) => {
        let sound = findObjs({type: "jukeboxtrack", title: name})[0];
        if (sound) {
            sound.set({playing: true,softstop:false});
        }
    };


    //Retrieve Values from character Sheet Attributes
    const Attribute = (character,attributename) => {
        //Retrieve Values from character Sheet Attributes
        let attributeobj = findObjs({type:'attribute',characterid: character.id, name: attributename})[0]
        let attributevalue = "";
        if (attributeobj) {
            attributevalue = attributeobj.get('current');
        }
        return attributevalue;
    };

    const AttributeArray = (characterID) => {
        let aa = {}
        let attributes = findObjs({_type:'attribute',_characterid: characterID});
        for (let j=0;j<attributes.length;j++) {
            let name = attributes[j].get("name")
            let current = attributes[j].get("current")   
            if (!current || current === "") {current = " "} 
            aa[name] = current;
            let max = attributes[j].get("max")   
            if (!max || max === "") {max = " "} 
            aa[name + "_max"] = max;
        }
        return aa;
    };

    const AttributeSet = (characterID,attributename,newvalue,max) => {
        if (!max) {max = false};
        let attributeobj = findObjs({type:'attribute',characterid: characterID, name: attributename})[0]
        if (attributeobj) {
            if (max === true) {
                attributeobj.set("max",newvalue)
            } else {
                attributeobj.set("current",newvalue)
            }
        } else {
            if (max === true) {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    max: newvalue,
                    characterid: characterID,
                });            
            } else {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    characterid: characterID,
                });            
            }
        }
    };

    const DeleteAttribute = (characterID,attributeName) => {
        let attributeObj = findObjs({type:'attribute',characterid: characterID, name: attributeName})[0]
        if (attributeObj) {
            attributeObj.remove();
        }
    }




    const ButtonInfo = (phrase,action,inline) => {
        //inline - has to be true in any buttons to have them in same line -  starting one to ending one
        if (!inline) {inline = false};
        let info = {
            phrase: phrase,
            action: action,
            inline: inline,
        }
        outputCard.buttons.push(info);
    };

    const SetupCard = (title,subtitle,nation) => {
        outputCard.title = title;
        outputCard.subtitle = subtitle;
        outputCard.nation = nation;
        outputCard.body = [];
        outputCard.buttons = [];
        outputCard.inline = [];
    };

    const DisplayDice = (roll,tablename,size) => {
        roll = roll.toString();
        let table = findObjs({type:'rollabletable', name: tablename})[0];
        if (!table) {
            table = findObjs({type:'rollabletable', name: "Neutral"})[0];
        }
        let obj = findObjs({type:'tableitem', _rollabletableid: table.id, name: roll })[0];        
        let avatar = obj.get('avatar');
        let out = "<img width = "+ size + " height = " + size + " src=" + avatar + "></img>";
        return out;
    };

    const Angle = (theta) => {
        while (theta < 0) {
            theta += 360;
        }
        while (theta >= 360) {
            theta -= 360;
        }
        return theta
    }   





    const RotatePoint = (cX,cY,angle, p) => {
        //cx, cy = coordinates of the centre of rotation
        //angle = clockwise rotation angle
        //p = point object
        let s = Math.sin(angle);
        let c = Math.cos(angle);
        // translate point back to origin:
        p.x -= cX;
        p.y -= cY;
        // rotate point
        let newX = p.x * c - p.y * s;
        let newY = p.x * s + p.y * c;
        // translate point back:
        p.x = Math.round(newX + cX);
        p.y = Math.round(newY + cY);
        return p;
    }


    const PrintCard = (id) => {
        let output = "";
        if (id) {
            let playerObj = findObjs({type: 'player',id: id})[0];
            let who = playerObj.get("displayname");
            output += `/w "${who}"`;
        } else {
            output += "/desc ";
        }

        if (!outputCard.nation || !Nations[outputCard.nation]) {
            outputCard.nation = "Neutral";
        }

        //start of card
        output += `<div style="display: table; border: ` + Nations[outputCard.nation].borderStyle + " " + Nations[outputCard.nation].borderColour + `; `;
        output += `background-color: #EEEEEE; width: 100%; text-align: center; `;
        output += `border-radius: 1px; border-collapse: separate; box-shadow: 5px 3px 3px 0px #aaa;;`;
        output += `"><div style="display: table-header-group; `;
        output += `background-color: ` + Nations[outputCard.nation].backgroundColour + `; `;
        output += `background-image: url(` + Nations[outputCard.nation].image + `), url(` + Nations[outputCard.nation].image + `); `;
        output += `background-position: left,right; background-repeat: no-repeat, no-repeat; background-size: contain, contain; align: center,center; `;
        output += `border-bottom: 2px solid #444444; "><div style="display: table-row;"><div style="display: table-cell; padding: 2px 2px; text-align: center;"><span style="`;
        output += `font-family: ` + Nations[outputCard.nation].titlefont + `; `;
        output += `font-style: normal; `;

        let titlefontsize = "1.4em";
        if (outputCard.title.length > 12) {
            titlefontsize = "1em";
        }

        output += `font-size: ` + titlefontsize + `; `;
        output += `line-height: 1.2em; font-weight: strong; `;
        output += `color: ` + Nations[outputCard.nation].fontColour + `; `;
        output += `text-shadow: none; `;
        output += `">`+ outputCard.title + `</span><br /><span style="`;
        output += `font-family: Arial; font-variant: normal; font-size: 13px; font-style: normal; font-weight: bold; `;
        output += `color: ` +  Nations[outputCard.nation].fontColour + `; `;
        output += `">` + outputCard.subtitle + `</span></div></div></div>`;

        //body of card
        output += `<div style="display: table-row-group; ">`;

        let inline = 0;

        for (let i=0;i<outputCard.body.length;i++) {
            let out = "";
            let line = outputCard.body[i];
            if (!line || line === "") {continue};
            if (line.includes("[INLINE")) {
                let end = line.indexOf("]");
                let substring = line.substring(0,end+1);
                let num = substring.replace(/[^\d]/g,"");
                if (!num) {num = 1};
                line = line.replace(substring,"");
                out += `<div style="display: table-row; background: #FFFFFF;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: center; display:block;'>`;
                out += line + " ";

                for (let q=0;q<num;q++) {
                    let info = outputCard.inline[inline];
                    out += `<a style ="background-color: ` + Nations[outputCard.nation].backgroundColour + `; padding: 5px;`
                    out += `color: ` + Nations[outputCard.nation].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
                    out += `border-color: ` + Nations[outputCard.nation].borderColour + `; font-family: Tahoma; font-size: x-small; `;
                    out += `"href = "` + info.action + `">` + info.phrase + `</a>`;
                    inline++;                    
                }
                out += `</div></span></div></div>`;
            } else {
                line = line.replace(/\[hr(.*?)\]/gi, '<hr style="width:95%; align:center; margin:0px 0px 5px 5px; border-top:2px solid $1;">');
                line = line.replace(/\[\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})\](.*?)\[\/[\#]\]/g, "<span style='color: #$1;'>$2</span>"); // [#xxx] or [#xxxx]...[/#] for color codes. xxx is a 3-digit hex code
                line = line.replace(/\[[Uu]\](.*?)\[\/[Uu]\]/g, "<u>$1</u>"); // [U]...[/u] for underline
                line = line.replace(/\[[Bb]\](.*?)\[\/[Bb]\]/g, "<b>$1</b>"); // [B]...[/B] for bolding
                line = line.replace(/\[[Ii]\](.*?)\[\/[Ii]\]/g, "<i>$1</i>"); // [I]...[/I] for italics
                let lineBack,fontcolour;
                if (line.includes("[F]")) {
                    let ind1 = line.indexOf("[F]") + 3;
                    let ind2 = line.indexOf("[/f]");
                    let fac = line.substring(ind1,ind2);
                    if (Nations[fac]) {
                        lineBack = Nations[fac].backgroundColour;
                        fontcolour = Nations[fac].fontColour;
                    }
                    line = line.replace("[F]" + fac + "[/f]","");

                } else {
                    lineBack = (i % 2 === 0) ? "#D3D3D3": "#EEEEEE";
                    fontcolour = "#000000";
                }
                out += `<div style="display: table-row; background: ` + lineBack + `;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color:` + fontcolour + `; `;
                out += `"> <div style='text-align: center; display:block;'>`;
                out += line + `</div></span></div></div>`;                
            }
            output += out;
        }

        //buttons
        if (outputCard.buttons.length > 0) {
            for (let i=0;i<outputCard.buttons.length;i++) {
                let info = outputCard.buttons[i];
                let inline = info.inline;
                if (i>0 && inline === false) {
                    output += '<hr style="width:95%; align:center; margin:0px 0px 5px 5px; border-top:2px solid $1;">';
                }
                let out = "";
                let borderColour = Nations[outputCard.nation].borderColour;
                
                if (inline === false || i===0) {
                    out += `<div style="display: table-row; background: #FFFFFF;; ">`;
                    out += `<div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                    out += `"><span style="line-height: normal; color: #000000; `;
                    out += `"> <div style='text-align: center; display:block;'>`;
                }
                if (inline === true) {
                    out += '<span>     </span>';
                }
                out += `<a style ="background-color: ` + Nations[outputCard.nation].backgroundColour + `; padding: 5px;`
                out += `color: ` + Nations[outputCard.nation].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
                out += `border-color: ` + borderColour + `; font-family: Tahoma; font-size: x-small; `;
                out += `"href = "` + info.action + `">` + info.phrase + `</a>`
                
                if (inline === false || i === (outputCard.buttons.length - 1)) {
                    out += `</div></span></div></div>`;
                }
                output += out;
            }

        }

        output += `</div></div><br />`;
        sendChat("",output);
        outputCard = {title: "",subtitle: "",nation: "",body: [],buttons: [],};
    }

    //related to building hex map
    const LoadPage = () => {
        //build Page Info and flesh out Hex Info
        pageInfo.page = getObj('page', Campaign().get("playerpageid"));
        pageInfo.name = pageInfo.page.get("name");
        pageInfo.scale = pageInfo.page.get("snapping_increment");
        pageInfo.width = pageInfo.page.get("width") * 70;
        pageInfo.height = pageInfo.page.get("height") * 70;
        pageInfo.type = pageInfo.page.get("grid_type");

    }

    const BuildMap = () => {
        let startTime = Date.now();
        HexMap = {};

        let startX = HexInfo.pixelStart.x;
        let startY = HexInfo.pixelStart.y;
        let halfToggleX = HexInfo.halfToggleX;
        let halfToggleY = HexInfo.halfToggleY;
        if (pageInfo.type === "hex") {
            for (let j = startY; j <= pageInfo.height;j+=HexInfo.ySpacing){
                for (let i = startX;i<= pageInfo.width;i+=HexInfo.xSpacing) {
                    let point = new Point(i,j);     
                    let hex = new Hex(point);
                }
                startX += halfToggleX;
                halfToggleX = -halfToggleX;
            }
        } else if (pageInfo.type === "hexr") {
            for (let i=startX;i<=pageInfo.width;i+=HexInfo.xSpacing) {
                for (let j=startY;j<=pageInfo.height;j+=HexInfo.ySpacing) {
                    let point = new Point(i,j);     
                    let hex = new Hex(point);
                }
                startY += halfToggleY;
                halfToggleY = -halfToggleY;
            }
        }


        AddTerrain();    
        AddTokens();        
        DefineMap();
        if (state.WaW85.scenario !== "") {
            Scenario = ScenarioData[state.WaW85.scenario]
        }
        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
    };

    const AddTerrain = () => {
        //add terrain using tokens
        let tokens = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        _.each(tokens,token => {
            let name = token.get("name");
            if (name === "Smoke" || name === "Dispersed Smoke") {
                let centre = new Point(token.get("left"),token.get('top'));
                let centreLabel = centre.toCube().label();
                let hex = HexMap[centreLabel];
                if (name === "Smoke") {
                    hex.smoke = true;
                } else {
                    hex.smoke = "Dispersed";
                }
                hex.smokeID = token.id;
            }
            let terrain = TerrainInfo[name];
            if (terrain) {
                let centre = new Point(token.get("left"),token.get('top'));
                let centreLabel = centre.toCube().label();
                let hex = HexMap[centreLabel];
                let keys = Object.keys(terrain);
                _.each(keys,key => {
                    hex[key] = terrain[key];
                })        
            }
        })
        AddRivers();
        AddRoads();
    }


    const AddRivers = () => {
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",});

        _.each(paths,path => {
            let types = {"#0000ff": "River","#000000": "Bridge"};
            let type = types[path.get("stroke").toLowerCase()];
            if (type) {
                let vertices = translatePoly(path);
                //work through pairs of vertices
                for (let i=0;i<(vertices.length -1);i++) {
                    let pt1 = vertices[i];
                    let pt2 = vertices[i+1];
                    let midPt = new Point((pt1.x + pt2.x)/2,(pt1.y + pt2.y)/2);
                    //find nearest hex to midPt
                    let hexLabel = midPt.label();
                    //now run through that hexes neighbours and see what intersects with original line to identify the 2 neighbouring hexes
                    let hex1 = HexMap[hexLabel];
                    if (!hex1) {continue}
                    let pt3 = hex1.centre;
                    let neighbourCubes = hex1.cube.neighbours();
                    for (let j=0;j<neighbourCubes.length;j++) {
                        let k = j+3;
                        if (k> 5) {k-=6};
                        let hex2 = HexMap[neighbourCubes[j].label()];
                        if (!hex2) {continue}
                        let pt4 = hex2.centre;
                        let intersect = lineLine(pt1,pt2,pt3,pt4);
                        if (intersect) {
                            if (hex1.edges[DIRECTIONS[j]] !== "Bridge") {
                                hex1.edges[DIRECTIONS[j]] = type;
                            }
                            if (hex2.edges[DIRECTIONS[k]] !== "Bridge") {
                                hex2.edges[DIRECTIONS[k]] = type;
                            }
                        }
                    }
                }
            }
        })
    }
    
    const AddRoads = () => {
        let roads = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",}).filter(el => {
            return el.get("stroke").toLowerCase() === "#ffffff";
        });
        _.each(roads,road => {
            let vertices = translatePoly(road);
            for (let i=0;i<(vertices.length-1);i++) {
                let cube1 = vertices[i].toCube();
                let cube2 = vertices[i+1].toCube();
                let interCubes = cube1.linedraw(cube2);
                interCubes.push(cube1);
                interCubes.push(cube2);
                _.each(interCubes, cube => {
                    let label = cube.label();
                    if (label && HexMap[label]) {
                        HexMap[label].road = true;
                    }
                })
            }
        })
    }



     
    const AddTokens = () => {
        //add tokens on token layer to arrays
        Units = {};
        //create an array of all tokens
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        });
   
        let s = 0;
        tokens.forEach((token) => {
            let character = getObj("character", token.get("represents"));
            let unitInfo = state.WaW85.unitInfo[token.id];
            if (character && unitInfo) {
                let unit = new Unit(token.get("id"));
                s++;
            }
        });


        log(s + " Units added to Array");
    }





    const translatePoly = (poly) => {
        //translate points in a pathv2 polygon to map points
        let vertices = [];
        let points = JSON.parse(poly.get("points"));
        let centre = new Point(poly.get("x"), poly.get("y"));
        //covert path points from relative coords to actual map coords
        //define 'bounding box;
        let minX = Infinity,minY = Infinity, maxX = 0, maxY = 0;
        _.each(points,pt => {
            minX = Math.min(pt[0],minX);
            minY = Math.min(pt[1],minY);
            maxX = Math.max(pt[0],maxX);
            maxY = Math.max(pt[1],maxY);
        })
        //translate each point back based on centre of box
        let halfW = (maxX - minX)/2 + minX;
        let halfH = (maxY - minY)/2 + minY
        let zeroX = centre.x - halfW;
        let zeroY = centre.y - halfH;
        _.each(points,pt => {
            let x = Math.round(pt[0] + zeroX);
            let y = Math.round(pt[1] + zeroY);
            vertices.push(new Point(x,y));
        })
        return vertices;
    }



    const pointInPolygon = (point,vertices) => {
        //evaluate if point is in the polygon
        collision = false
        len = vertices.length - 1
        for (let c=0;c<len;c++) {
            vc = vertices[c];
            vn = vertices[c+1]
            if (((vc.y >= point.y && vn.y < point.y) || (vc.y < point.y && vn.y >= point.y)) && (point.x < (vn.x-vc.x)*(point.y-vc.y)/(vn.y-vc.y)+vc.x)) {
                collision = !collision
            }
        }
        return collision
    }


    const XHEX = (point) => {
        //makes a small group of points for checking around centre
        let points = [point];
        points.push(new Point(point.x - 20,point.y - 20));
        points.push(new Point(point.x + 20,point.y - 20));
        points.push(new Point(point.x + 20,point.y + 20));
        points.push(new Point(point.x - 20,point.y + 20));
        return points;
    }



    //game functions
    const ClearState = (msg) => {
        //clear arrays
        HexMap = {}; 
        Units = {};
        
        RemoveMoveMarkers();
        //clear token info
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        })
       

        tokens.forEach((token) => {
            if (token.get("name").includes("Objective") === true) {return};
    

            token.set({
                name: "",
                tint_color: "transparent",
                aura1_color: "transparent",
                aura1_radius: 0,
                showplayers_aura1: true,
                showname: true,
                disableSnapping: true,
                disableTokenMenu: true,
                gmnotes: "",
                statusmarkers: "",
                tooltip: "",
                rotation: 0,
            });                
        });
    
        state.WaW85 = {
            turn: 0,
            phase: "Initiative",
            cards: [],
            played: [],
            missed: [],
            endOps: 0,
            eventCard: false,
            scenario: "",
            squall: false,
            season: "Summer",
            flags: [],
            weatherLevel: 0,
            moveMarkers: [],
            activeFormationID: "",
            activeUnitID: "",
            formationInfo: {}, //ref by formation ID, list of tokenIDs in formation
            unitInfo: {}, //ref by token ID, is the formationID of that token
            passengerID: {}, //ref by tokenID for the transport is the ID of the passenger
            attachedIDs: {}, //ref by tokenID of the main unit, is the IDs in an array of leaders, HQs attached to it
        }
    





        //CleanMap("All");
        BuildMap();

        sendChat("","Cleared State/Arrays");



    }


    const CleanMap = (type) => {
        let mapTokenArray = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        //remove dead
        _.each(mapTokenArray,token => {
            let id = token.get("id");
            if (token.get("status_dead") === true) {
                let unit = Formations[id];
                let hex = HexMap[unit.hexLabel];
                if (unit) {delete Formations[id]};
                token.remove();
                ArrangeTokens(hex);
            }
        });
        if (type) {
            if (type === "All") {
                list = []; //names of tokens to remove
            } else {
                list = [type];
            }
            _.each(mapTokenArray,token => {
                let id = token.get("id");
                if (list.includes(token.get("name"))) {
                    token.remove();
                }
            });
        }






    }





    const RollD6 = (msg) => {
        let Tag = msg.content.split(";");
        PlaySound("Dice");
        let roll = randomInteger(6);
        if (Tag.length === 1) {
            let playerID = msg.playerid;
            let nation = "Neutral";
            if (msg.selected) {
                let id = msg.selected[0]._id;
                if (id) {
                    let tok = findObjs({_type:"graphic", id: id})[0];
                    let character = getObj("character", tok.get("represents")); 
                    nation = Attribute(character,"nation");
                    if (!state.BoB.players[playerID] || state.BoB.players[playerID] === undefined) {
                        state.BoB.players[playerID] = nation;
                    }
                }
            } else if (!state.BoB.players[playerID] || state.BoB.players[playerID] === undefined) {
                sendChat("","Click on one of your Units then select Roll again");
                return;
            } else {
                nation = state.BoB.players[playerID];
            }
            let res = "/direct " + DisplayDice(roll,Nations[nation].dice,40);
            sendChat("player|" + playerID,res);
        } else {
            let type = Tag[1];
            //type being used for times where fed back by another function
        }
    }


    const Naming = (unit) => {
        let name,init,surname;
        let platoons = ["Vehicle","Infantry","Towed","Aircraft","Helicopter"];
        if (unit.nation) {
            init = FirstNameList[unit.nation][randomInteger(FirstNameList[unit.nation].length - 1)].charAt(0).toUpperCase() + ". ";
            surname = SurnameList[unit.nation][randomInteger(SurnameList[unit.nation].length - 1)];
        }

        if (platoons.includes(unit.type)) {
            if (unit.special.includes("Offboard")) {
                name = unit.charName;
            } else if (unit.type === "Vehicle" && unit.special.includes("Transport")) {
                name = "Sgt. " + init + surname;
            } else {
                name = "Lt. " + init + surname;
            }
        }
        if (unit.type === "HQ") {
            if (RedFor.includes(unit.nation)) {
                name = "Polkóvnik " + init + surname;
            } else {
                name = "Captain " + init + surname;
            }
        }
        if (unit.type === "Leader" || unit.type === "Artillery Token" || unit.type === "Support") {
            name = unit.charName;
        }

        unit.name = name;
        if (name) {
            unit.name = name;
            unit.token.set({
                name: name,
            })
        }
        if (unit.type === "Leader" || unit.type === "HQ" || unit.type === "Artillery Token" || unit.type === "Support") {
            toFront(unit.token);
        }
    }







    const CheckLOS = (msg) => {
        let Tag = msg.content.split(";");
        let unit1 = Units[Tag[1]];
        let unit2 = Units[Tag[2]];
        if (!unit1 || !unit2) {
            sendChat("","Invalid Units")
            return;
        }
        let losResult = LOS(unit1,unit2);

        SetupCard("LOS","",unit1.nation);
        let d = losResult.distance * 150;
        d = (d > 1000) ? d/1000 + "km": d + "m";
        outputCard.body.push("Range: " + losResult.distance + " hexes [" + d + "]");
        if (losResult.los === true) {
            outputCard.body.push("There is LOS to the Target");
            if (losResult.obscured === true) {
                outputCard.body.push("LOS Is Obscured");
            }
        } else {
            outputCard.body.push("No LOS To Target");
            outputCard.body.push("Blocked: " + losResult.losBlocked);
        }


        PrintCard();



    }


    const LOS = (shooter,target) => {
        let shooterHex = HexMap[shooter.hexLabel];
        let targetHex = HexMap[target.hexLabel];
        let distance = shooter.Distance(target);
        let shooterHeight = shooter.Height();
        let targetHeight = target.Height();

        let maxLOS = 70;
        if (state.WaW85.weatherLevel === 3 && Scenario.night === true) {
            maxLOS = 7;
        }
        if (state.WaW85.weatherLevel === 4) {
            maxLOS = 3;
        }

        if (distance > maxLOS) {
            let result = {
                distance: distance,
                los: false,
                losBlocked: "Maximum LOS Is " + maxLOS,
                obscured: false,
            }
            return result;
        }

        let interCubes = [shooterHex.cube.linedraw(targetHex.cube),shooterHex.cube.linedraw2(targetHex.cube)];
        let interLabels = [interCubes[0].map((e)=> e.label()), interCubes[1].map((e)=> e.label())];
        let len = interLabels[0].length;

log("S Height: " + shooterHeight)
log("T Height: " + targetHeight)

log(interLabels)
        let finalBlockAt;
        let finalLOS = true;
        let finalObscured = 0;
        let edgeBlock = 0;

        for (let i=0;i<len;i++) {
            let los = true;
            let obscured = 0;
            let blocked = 0;
            let blockLabel;

            for (let side=0;side<2;side++) {
                let label = interLabels[side][i];
                let interHex = HexMap[label];
log(side + " - " + label + ": " + interHex.terrain)
log("H:" + interHex.height)
log("LOS: " + interHex.los)
                //terrain
                if (interHex.smoke.length > 0 || interHex.fire.length > 0) {
log("Smoke")
                    //1 smoke or fire hex, even if hexside, blocks LOS
                    blocked = 2;
                    blockLabel = label;
                    continue;
                }
                if (shooterHeight === targetHeight) {
                    if ((interHex.los === "Blocks" || interHex.rubble.length > 0) && interHex.height > shooterHeight) {
log("Blocking Terrain")
                        blocked++;
                        blockLabel = label;
                        continue;
                    } else if (interHex.los === "Obscures" || interHex.wrecks.length > 0) {
                        obscured++;
                        blockLabel = label;
                    }
                } else {
                    //terrain height than both = LOS Blocked
                    if (interHex.height > shooterHeight && interHex.height > targetHeight) {
log("Intervening Higher Terrain")
                        blocked++;
                        blockLabel = label;
                        continue;
                    }
                    //terrain higher than one and equal to other = LOS Blocked
                    if ((interHex.height > shooterHeight && interHex.height === targetHeight) || (interHex.height > targetHeight && interHex.height === shooterHeight)) {
log("Higher than one, equal to other")
                        blocked++;
                        blockLabel = label;
                        continue;
                    }
                    //Blind Spots for 1 height difference
                    if (shooterHeight - interHex.height === 1 && interHex.height > targetHeight) {
                        if (len < 2*i) {
log("Blind Spot")
                            blocked++;
                            blockLabel = label;
                            continue;
                        }
                    }
                    if (targetHeight - interHex.height === 1 && interHex.height > shooterHeight) {
                        if (len > 2*i) {
log("Blind Spot")

                            blocked++;
                            blockLabel = label;
                            continue;
                        }
                    }
                    //Blind spot for 2 height+ differrence is one hex
                    if ((shooterHeight - interHex.height > 1 && i === (len-1) && interHex.height > targetHeight) ||  (targetHeight - interHex.height > 1 && i === 0 && interHex.height > shooterHeight) ) {
log("Blind Spot 2+")
                        blocked++;
                        blockLabel = label;
                        continue;
                    }

                }
            }

            //if only 1 of hexes is obscured, then obscured will be 1 and ignore, if both are obscured, then los is obscured
            if (obscured === 2) {
                finalObscured++;
                if (finalObscured > 1) {
log("2 Obscuring Hexes")
                    finalBlockAt = blockLabel;
                    finalLOS = false;
                    break;
                }
            }

            //if only 1 of hexes is blocked, then add to edgeBlock
            //if 2 edges blocked, or 2 of hexes blocked then no LOS
            if (blocked === 1) {
                edgeBlock++;
                if (edgeBlock > 1) {
log("2 Blocking Edges")
                    finalBlockAt = blockLabel;
                    finalLOS = false;
                    break;
                } 
            } else if (blocked === 2) {
log("both hexes block")
                finalBlockAt = blockLabel;
                finalLOS = false;
                break;
            }
        } 

        let obscured = (finalObscured > 0) ? true:false;

        let result = {
            distance: distance,
            los: finalLOS,
            losBlocked: finalBlockAt,
            obscured: obscured,
        }

        return result;
    }

    const HexData = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let tok = findObjs({_type:"graphic", id: id})[0];
        let point = new Point(tok.get("left"),tok.get("top"));
        let cube = point.toCube();
        let label = cube.label();
        let hex = HexMap[label];
//log(hex)
        SetupCard(label,"","Neutral");
        if (hex.offboard === true) {
            outputCard.body.push("Offboard");
        } else {
            outputCard.body.push("Terrain: " + hex.terrain);
            if (hex.road) {
                outputCard.body.push("Road Present");
            }
            for (let i=0;i<6;i++) {
                let edge = hex.edges[DIRECTIONS[i]];
                if (edge !== "Open") {
                    outputCard.body.push(DIRECTIONS[i] + " Side: " + edge);
                }
            }
        }
        PrintCard();
    }


    const SizeTokens = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        _.each(msg.selected,selected => {
            let token = findObjs({_type:"graphic", id: selected._id})[0];
            token.set({
                width: HexInfo.width,
                height: HexInfo.height * 2,
            });
        })
    }

    const CreateFormation2 = (msg) => {
        let formNum = msg.content.split(";")[1];
        let leaderIDs = [];
        let formation = DeepCopy(Scenario.formations[formNum]);
        let artilleryID;
        let hqID = "";

        _.each(UnitIDList,unitID => {
            let unit = Units[unitID];
            unit.formationID = formNum;
            state.WaW85.unitInfo[unitID] = formNum;
            if (unit.type === "Leader") {
                leaderIDs.push(unitID);
            }
            if (unit.type === "HQ") {
                hqID = unitID;
            }
            if (formation.type === "Offboard Artillery" && unit.type !== "Artillery Token") {
                artilleryID = unit.id;
            }
        })


        if (formation.type === "Offboard Artillery") {
            if (!artilleryID) {
                sendChat("","Error with Artillery ID")
            }
            _.each(UnitIDList,unitID => {
                let unit = Units[unitID];

                if (unit.type === "Artillery Token") {
                    let abilArray = findObjs({_type: "ability", _characterid: unit.charID});
                    //clear old abilities
                    for(let a=0;a<abilArray.length;a++) {
                        abilArray[a].remove();
                    } 
                    AddAbility("Check","!ArtCheck;Offboard;" + unit.id + ";" + artilleryID);
                    if (unit.name.includes("HE")) {
                        AddAbility("FFE","!FFE;-;" + unit.id + ";" + artilleryID + ";HE;Offboard",unit.charID);
                    }
                    if (unit.name.includes("Smoke")) {
                        AddAbility("FFE","!FFE;SpotterID;" + unit.id + ";" + artilleryID + ";Smoke;Offboard",unit.charID);
                    }

    //others


                }
            })
        }



        formation.unitIDs = UnitIDList;
        formation.leaderIDs = leaderIDs;
        formation.hqID = hqID;

        state.WaW85.formationInfo[formNum] = formation;

        sendChat("",formation.name + " Entered");
    }



    const CreateFormation = (msg) => {
        if (!msg.selected) {return};
        if (state.WaW85.scenario === "") {
            sendChat("","Pick Scenario");
            return;
        }
        UnitIDList= [];
        _.each(msg.selected,selected => {
            let id = selected._id;
            let unit = new Unit(id);
            Naming(unit);
            AddAbilities(unit);
            UnitIDList.push(id);
            if (unit.type !== "Artillery Token") {
                unit.SetReady(true);
                unit.SetDisrupt(false);
                unit.SetReduced(false);
            }
        })
        SetupCard("Formation Creation","","Neutral");
        outputCard.body.push("Pick their Formation");
        _.each(Scenario.formations,formation => {
            ButtonInfo(formation.name,"!CreateFormation2;" + formation.id);
        })
        PrintCard();
    }




    const PickScenario = (msg) => {
        let Tag = msg.content.split(";");
        state.WaW85.scenario = "Scenario " + Tag[1];
        Scenario = ScenarioData[state.WaW85.scenario];
        state.WaW85.eventCard = Tag[2] === "Yes" ? true:false;
        let line = (Tag[2] === "Yes") ? "":"No ";
        line += "Event Card Added";
        sendChat("",state.WaW85.scenario + " Selected");
        sendChat("",line)
    }

    const ArtCheck = (msg) => {
        let Tag = msg.content.split(";");
        let target = Units[Tag[2]];
        let artUnit = Units[Tag[3]];
        let onboard = Tag[1] === "Onboard" ? true:false;
        SetupCard(artUnit.name,"LOS Check",artUnit.nation);
        let results = SpotterCheck(target,artUnit,onboard);
        if (results.spotter !== false) {
            outputCard.body.push(results.spotter.name + " is Spotting");
            outputCard.body.push("Artillery has Range to Target");
            if (results.spotCheck === true) {
                outputCard.body.push("A Spot Check will be Required");
            }
        }
        PrintCard();
    }

    const SpotterCheck = (target,artUnit,onboard) => {
        let spotter;
        let spotCheck = true;
        let errorMsg = [];
        if (onboard === true) {
            let distance = artUnit.Distance(target);
            if (distance < artUnit.artWeapon.minRange) {
                errorMsg.push("Target is under Artillery's Minimum Range");
            }
            if (distance > (artUnit.artWeapon.range * 2)) {
                errorMsg.push("Target is over Artillery's Maximum Range");
            }
        }

        if (errorMsg.length === 0) {
            let keys = Object.keys(Units);
            for (let i=0;i<keys.length;i++) {
                let unit = Units[keys[i]];
                if (unit.Ready() === false || unit.OOC() || unit.Disrupted()) {continue};
                if (unit.nation === artUnit.nation) {
                    if (unit.type === "HQ" || unit.special.includes("Recon")) {
                        let spotterLOS = LOS(unit,target);
                        if (spotterLOS.los === true) {
                            spotter = unit;
                            spotCheck = false;
                            break;
                        }
                    }
///may need to modify once have national tables
                    if ((unit.type === "Infantry" || unit.type === "Vehicle") && onboard === true && unit.formationID === artUnit.formationID) {
                        let spotterLOS = LOS(unit,target);
                        if (spotterLOS.los === true) {
                            spotter = unit;
                        }
                    }
                }
            }
            if (!spotter) {
                errorMsg.push("No Unit able to Spot");
            } 
        }

        if (errorMsg.length > 0) {
            _.each(errorMsg,msg => {
                outputCard.body.push("[#ff0000]" + msg + "[/#]");
            })
            return {spotter: false};
        }


        return {spotter: spotter, spotCheck: spotCheck};
    }









    const DirectFire = (msg) => {
        let Tag = msg.content.split(";");
return
        let shooterID = Tag[1];
        let targetID = Tag[2];
        let weaponNumber = Tag[3];
        let options = Tag[4];
    
        let shooter = Units[shooterID];
        let shooterHex = HexMap[shooter.hexLabel];
        let target = Units[targetID];

//check if is leader or HQ and if is transfer to appr unit




        let targetHex = HexMap[target.hexLabel];
        let weapon = DeepCopy(shooter.weapons[weaponNumber]);
        let losResult = LOS(shooter,target);
        let damageType = weapon.type;   
        if (target.armourType === "Heavy" && weapon.notes.includes("HROF")) {
            damageType = "AP";
        }

        //validity checks
        let errorMsg = [];
        if (shooter.token.get(SM.fired) === true) {
            errorMsg.push("Unit has already Fired");
        }
        if (shooter.token.get("aura1_color") === "#000000" && shooter.id !== activeUnitID) {
            errorMsg.push("Unit is Ops Complete");
        }
        if (shooter.Status() === false) {
            errorMsg.push("Unit is Disrupted and cannot Fire");
        }
        if (shooter.token.get(SM.oom) === true && (weapon.notes.includes("ATGM") || weapon.notes.includes("SAM"))) {
            errorMsg.push("Unit is Out of Missiles");
        }
        if (losResult.los === false) {
            errorMsg.push("No LOS to Target");
            errorMsg.push(los.losReasons);
        }
        if (losResult.distance > (weapon.range * 2)) {
            errorMsg.push("Out of Range of Weapon");
        }
        if (weapon.notes.includes("Minimum") && losResult.distance < 3) {
            errorMsg.push("Weapon has a Minimum Range of 3");
        }
        if (weapon.notes.includes("Direct Fire Capable") && losResult.distance > 6) {
            errorMsg.push("Max Range Firing Direct is 6");
    ///? 
        }
        if (shooterHex.terrain === "Water" && shooter.type !== "Helicopter" && shooter.type !== "Aircraft") {
            errorMsg.push("Cannot Fire from Water Hex");
        }
        if (shooter.token.get(SM.oom) === true && (weapon.notes.includes("ATGM") || weapon.notes.includes("SAM"))) {
            errorMsg.push("Out of Missiles");
        }
        let mpMax = 1, mpUsed = 0, underHalf = true;
        if (shooter.type !== "Aircraft") {
            mpMax = parseInt(shooter.token.get("bar1_max"));
            mpUsed = mpMax - parseInt(shooter.token.get("bar1_value"));
            underHalf = (mpUsed <= Math.floor(mpMax/2)) ? true:false;
        }
        if (shooter.type === "Helicopter" && shooter.type !== "Aircraft" && mpUsed > 12) {
            errorMsg.push("Helicopter Moved Too Far to Fire");
        }
        if (shooter.type !== "Helicopter" && shooter.type !== "Aircraft" && weapon.notes.includes("Stabilized") === false && underHalf === false) {
            errorMsg.push("Moved too far to fire");
        }

        if (damageType === "AP" && (target.type === "Infantry" || target.type === "Towed")) {
            errorMsg.push("AP Ineffective vs this Target");
        }
        if (damageType === "HE" && target.armourType === "Heavy") {
            errorMsg.push("HE Ineffective vs this Target");
        }
        if (weapon.notes.includes("SAM")) {
            if (target.type !== "Aircraft" && target.type !== "Helicopter") {
                errorMsg.push("SAMs cannot target this Unit");
            }
            if (target.type === "Helicopter") {
                if (target.token.get(SM.landed) === true) {
                    errorMsg.push("SAMs cannot target landed Helicopters");
                }
                if (target.toke.get(SM.noe) === true) {
                    errorMsg.push("SAMs cannot target Helicopters in NOE");
                }
            }
        }
        if ((target.type === "Helicopter" && target.token.get(SM.landed) === false) || target.type === "Aircraft") {
            if (weapon.notes.includes("AA") === false && weapon.notes.includes("SAM") === false) {
                if (weapon.notes.includes("ATGM")) {
                    errorMsg.push("ATGM's cannnot target this Unit");
                } else {
                    if (losResult.distance > weapon.range || losResult.distance > 10) {
                        errorMsg.push("Out of Range for AA Fire with this weapon");
                    }
                }
            }
        }



        SetupCard(shooter.name,"Direct Fire",shooter.nation);
    
        if (errorMsg.length > 0) {
            _.each(errorMsg,msg => {
                outputCard.body.push(msg);
            });
            PrintCard();
            return;
        }
    
        let firepower = (shooter.health === "Full") ? weapon.fp[0]:weapon.fp[1];
        let toHit = (shooter.health === "Full") ? weapon.toHit[0]:weapon.toHit[1];
        let defDice = target.armour;
        let save = target.save;
        
        let shooterTips = "";
        let armourTips = "";
        let terrainTips = "";
        //check modifiers
        let fpMod = 0;
        let toHitMod = 0;
        let defBonusDice = 0;
        let aaflag = false;
        //10.6.1 AA Fire
        if (((target.type === "Helicopter" && target.token.get(SM.landed) === false) || target.type === "Aircraft") && weapon.notes.includes("AA") === false && weapon.notes.includes("SAM") === false) {
            shooterTips += "<br>AA Fire with non-AA Weapon -2 FP"
            fpMpd -= 2;
            toHit = 6;
            aaflag = true;
        }
        //10.6.2 HQ or Leader Bonus
        //10.6.3 - minimum range for ATGM already done above
        //10.6.4 Point Blank Range
        if (losResult.distance <= Math.floor(weapon.range/2) && shooter.type !== "Aircraft" && aaflag === false) {
            shooterTips += "<br>Point Blank Range +1";
            toHitMod--;
        }
        //10.6.5 Long Range
        if (losResult.distance > weapon.range && shooter.type !== "Aircraft" && aaflag === false) {
            shooterTips += "<br>Long Range -1";
            toHitMod++;
        }
        //10.6.6 firing into adjacent smoke hex 10.6.6
        if (targetHex.smoke === true) {
            shooterTips += "<br>Smoke in Target Hex +1";
            toHitMod++;
        }
        //10.6.7 firing out of a smoke filled hex into an adjacent hex
        if (shooterHex.smoke === true) {
            shooterTips += "<br>Smoke in Shooter's Hex +1";
            toHitMod++;
        }
        //10.6.8 Terrain
        let terBonus = 0;
        if (target.type === "Infantry") {
            terBonus = targetHex.defenseBonus.Troops
        } 
        if (target.type === "Vehicle") {
            terBonus = targetHex.defenseBonus.Vehicles
        }
        if (losResult.delta < 0 && aaflag === false) {
            terBonus += 1;
        }
        if (terBonus !== 0) {
            let sign = (terBonus > 0) ? "+":"-";
            terrainTips += "<br>Terrain Bonus: " + sign + terBonus + " Dice";
            defBonusDice += terBonus;
        }
        //10.6.9 Composite or Reactive Armour vs ATGM
        if (weapon.notes.includes("ATGM") && (target.special.includes("Composite") || target.special.includes("Reactive"))) {
            save--;
            armourTips += "<br>Composite/Reactive Armour +1 to Armour";
        }
        //10.6.10 Volley Fire - use options for this
        //10.6.11 Target is a Landed Helicopter
        //10.6.12 ATGM at a target in blocking terrain
        if (weapon.notes.includes("ATGM") && targetHex.los === "Blocks") {
            terrainTips += "<br>ATGM vs Blocking Terrain +1 Dice";
            defBonusDice++;
        }
        //10.6.13 Concealment
        if (CheckConcealment(target) === true) {
            terrainTips += "<br>Concealment +1 Dice";
            defBonusDice++;
        }

        //smoke for thermal imagers - anyone else will have no LOS
        if (losResult.smokeHexes > 0) {
            shooterTips += "<br>Smoke in Intervening Hexes -" + losResult.smokeHexes;
            toHitMod -= losResult.smokeHexes;
        }
        //Weather

        //Night


        //10.6.14 Max Defensive Bonus
        if (target.armourType === "Heavy" || target.armourType === "Light") {
            if (defBonusDice > 2) {
                defBonusDice = 2;
                terrainTips += "<br>Max of 2 Dice";
            }
        }
        //10.6.15 Max To Hit of 6
        toHit = Math.min(6,toHit + toHitMod);

        //11.0 Move and Fire Effects
        if (shooter.type !== "Helicopter" && mpUsed > 0) {
            if (weapon.notes.includes("Stabilized")) {
                if (shooter.player === 0) {
                    if (underHalf === true) {
                        fpMod--;
                        shooterTips += "<br>Movement -1 Dice";
                    } else {
                        fpMod -= 2;
                        shooterTips += "<br>Movement -2 Dice";
                    }
                } else if (shooter.player === 1 && underHalf === false) {
                    //if Nato and under half MP, then no effect
                    fpMod--;
                    shooterTips += "<br>Movement -1 Dice";
                }
            } else {
                //over half MP has been screened out above
                fpMod -= 2;
                shooterTips += "<br>Movement -2 Dice";
            }
        }
        //10.6.16 Min FP  of 1
        firepower = Math.max(1,firepower + fpMod);
        //10.6.17 All Water Hex - done above in error msg
    
        //attacker - firepower, toHit
        let hits = 0,armourSaves = 0;terrainSaves = 0;
        let attackRolls = [],armourRolls = [],terRolls = [];
        for (let i=0;i<firepower;i++) {
            let roll = randomInteger(6);
            if (roll >= toHit) {
                hits++;
            }
            attackRolls.push(roll);
        }
        let tip = "Rolls: " + attackRolls.toString() + " vs. " + toHit + "+" + shooterTips;
        tip = '[🎲](#" class="showtip" title="' + tip + ')';

        outputCard.body.push(tip + " Firing " + weapon.name + ": " + hits + " Hits");

        if (hits > 0) {
            //Defender - armour then terrain saves
            if (defDice > 0) {
                for (let i=0;i<defDice;i++) {
                    let roll = randomInteger(6);
                    if (roll >= save) {
                        armourSaves++;
                    }
                    armourRolls.push(roll);
                }
                tip = "Rolls: " + armourRolls + " vs. " + save + "+" + armourTips;
                tip = '[🎲](#" class="showtip" title="' + tip + ')';
                outputCard.body.push(tip + " Armour: " + armourSaves + " Saves");
            }
            if (defBonusDice > 0) {
                for (let i=0;i<defBonusDice;i++) {
                    let roll = randomInteger(6);
                    if (roll >= 5) {
                        terrainSaves++;
                    }
                    terRolls.push(roll);
                }
                tip = "Rolls: " + terRolls + " vs. 5+" + terrainTips;
                tip = '[🎲](#" class="showtip" title="' + tip + ')';
                outputCard.body.push(tip + " Terrain: " + terrainSaves + " Saves");
            }


            let damage = Math.max(0,hits-armourSaves-terrainSaves);
            if (targetHex.improved === true && target.type !== "Aircraft" && target.type === "Helicopter") {
                outputCard.body.push("Improved Positions reduce Damage");
                damage--;
            }
            outputCard.body.push("Total: " + damage + " Damage");

            target.ApplyDamage(damage,damageType);

        }        

        //missile ammo check
        if (weapon.notes.includes("ATGM") || weapon.notes.includes("SAM")) {
            outputCard.body.push("[hr]")
            if (shooter.token.get(SM.low) === true) {
                outputCard.body.push("The unit is now out of Missiles");
                shooter.token.set(SM.oom,true);
                shooter.token.set(SM.low,false);
            } else {
                let roll1 = randomInteger(6);
                let roll2 = randomInteger(6);
                let total = roll1 + roll2;
                let tip = "Roll: " + roll1 + " + " + roll2 + " = " + total;
                tip = '[🎲](#" class="showtip" title="' + tip + ')';
                if (roll > shooter.morale) {
                    outputCard.body.push(tip + " The Unit must Reload");
                    shooter.token.set(SM.reload,true);
                }
            }
        }


        PrintCard();
        //mark shooter OPS Complete
        shooter.token.set("aura1_color","#000000");
    
    }
        
    //in movement - when move units into other hex then is an assault
    //cant move a unit with no AP into a hex with a unit with AP - so flag that in movehex
    //cant move a unit without an assault value or where assault = 0 into a hex (unless is HQ/Leader/Support) - in move hex
    //could be a defender with no AP being attacked, its damage vs Heavy Armour will just 'bounce'

    const Assault = (msg) => {
        if (!msg.selected) {return}
        let id = msg.selected[0]._id;
        let initial = Units[id];
        if (!initial) {return};
        let attackingPlayer = initial.player;
        let defendingPlayer = (attackingPlayer === 0) ? 1:0;
        let involved = [[],[]];
        let hex = HexMap[initial.hexLabel];
        let noInfantry = [true,true];
        let undisruptedDefenders = false;
        let crossRiver = false;

        for (let i=0;i<hex.tokenIDs.length;i++) {
            let a = Units[hex.tokenIDs[i]];
            a.token.set("aura1_color","#000000");
            a.assaultDamage = 0;
            a.assaultCB = 0;
            if (a.type === "Infantry") {
                noInfantry[a.player] === false;
            }
////needs rework due to change to group meaning            
            if (a.group === "Support") {
                //skip all support type, but get HQ bonus
                if (a.type === "HQ") {
                    Units[a.attachedID].assaultCB = a.commandBonus;
                }
                continue;
            };
            if (a.token.get("tint_color") !== "#ff0000" && a.player === defendingPlayer) {
                undisruptedDefenders = true;
            }
            involved[a.player].push(a);
            if (a.player === attackingPlayer) {
                let edge = edgeCrossed(unit);
                if (edge === "Bridge" || edge === "River") {
                    crossRiver = true;                  
                }
            }
            if (a.player === defendingPlayer && a.token.get("tint_color") !== "#ff0000") {
                undisruptedDefenders = true;
            }
        }
    

        SetupCard("Assault","",initial.nation);
        let output = [[],[]];
        let totalDamage = [0,0];

        for (let p=0;p<2;p++) {
            let q = (p===0) ? 1:0;
            for (let u=0;u<involved[p].length;u++) {
                let unit = involved[p][u];
                let tips = "";
                let fp = unit.assaultFP[0] || 0;
                if (fp === 0) {continue};
                let toHit = unit.assaultToHit[0];
                if (unit.health === "Reduced") {
                    fp = unit.assaultFP[1];
                    toHit = unit.assaultToHit[1];
                }
                
                let mods = 0;
                let apFlag = false;
                for (let w=0;w<unit.weapons.length;w++) {
                    if (unit.weapons[w].type === "AP") {apFlag = true};
                    if (unit.weapons[w].notes.includes("ATGM") && unit.token.get(SM.oom) === true) {
                        apFlag = false;
                    }
                    if (unit.weapons[w].notes.includes("HROF")) {apFlag === true};
                }

                //13.1.1
                if (unit.assaultCB > 0) {
                    tips += "<br>HQ Command Bonus +" + unit.assaultCB;
                    mods -= unit.assaultCB;
                }
                //13.1.2
                if (unit.type === "Infantry" && noInfantry[q] === true) {
                    mods--;
                    tips += "<br>Infantry vs Unsupported Vehicle +1 to Hit";
                    if (hex.terrain.includes("City")) {
                        fp++;
                        tips += "<br>Infantry vs Unsupported Vehicle in City +1 Dice";
                    }
                }
                //13.1.3
                if (undisruptedDefenders === true && crossRiver === true) {
                    if (unit.player === attackingPlayer) {
                        fp--;
                        tips += "<br>Cross River/Bridge Assault -1 FP";
                        mods++;
                        tips += "<br>Cross River/Bridge Assault -1 to Hit";   
                    }
                    if (unit.player === defendingPlayer) {
                        mods--;
                        tips += "<br>Cross River/Bridge Assault +1 to Hit";   
                    }
                }

                //13.1.4
                if (state.WaW85.daytime === false && unit.token.get("tint_color") !== "#ff0000") {
                    mods--;
                    tips += "<br>Night Assault +1 to Hit";
                }
                toHit = Math.min(6,toHit + mods);
                if (unit.token.get("tint_color") === "#ff0000") {
                    toHit = 6;
                    tips = "<br>Disrupted To Hit = 6";
                }
                let rolls = [];
                let damage = 0;
                for (let i=0;i<fp;i++) {
                    let roll = randomInteger(6);
                    rolls.push(roll);
                    if (roll >= toHit) {
                        damage++;
                    }
                }
                let appliedDamage = 0;
                dper = Math.floor(damage/involved[q].length);
                _.each(involved[q],uni => {
                    if (apFlag === true || uni.armourType !== "Heavy") {
                        uni.assaultDamage = dper;
                        totalDamage[p] += dper;
                        appliedDamage += dper;
                    } else {
                        tips += "<br>" + uni.name + " unaffected by HE";
                    }
                })
                rem = damage - (dper * involved[q].length);
                if (rem === 1) {
                    //will only occur if odd # of hits and even # of units taking hits
                    let u = randomInteger(2);
                    if (apFlag === true || involved[q][u].armourType !== "Heavy") {
                        involved[q][u].assaultDamage++;
                        totalDamage[p]++;
                        appliedDamage++;
                    }
                }

                tips = "Rolls: " + rolls.toString() + " vs. " + toHit + "+" + tips;
                tips = '[🎲](#" class="showtip" title="' + tips + ')';
                let line = tips + " " + unit.name + " causes " + appliedDamage + " Damage";
                output[unit.player].push(line);
            }
        }

        //display attacks
        outputCard.body.push("[U]Attacks[/u]");
        for (let i=0;i<output[attackingPlayer].length;i++) {
            outputCard.body.push(output[attackingPlayer][i]);
        }
        for (let i=0;i<output[defendingPlayer].length;i++) {
            outputCard.body.push(output[defendingPlayer][i]);
        }
        //apply damage results and display while doing so
        outputCard.body.push("[hr]");
        outputCard.body.push("[U]Damage[/u]");
        let attackersLeft = 0;
        let advancingVehicles = [];
        let defendersLeft = 0;
        for (let i=0;i<involved[attackingPlayer].length;i++) {
            let damage = involved[attackingPlayer][i].assaultDamage;
            if (damage > 0) {
                involved[attackingPlayer][i].ApplyDamage(damage,"Assault");
            };
            if (involved[attackingPlayer][i].health !== "Eliminated") {
                attackersLeft++;
                if (involved[attackingPlayer][i].type === "Vehicle" && involved[attackingPlayer][i].token.get("tint_color") !== "#ff0000") {
                    advancingVehicles.push(involved[attackingPlayer][i].name);
                }
            }
        }
        for (let i=0;i<involved[defendingPlayer].length;i++) {
            let damage = involved[defendingPlayer][i].assaultDamage;
            if (hex.improved === true) {
                outputCard.body.push("Improved Positions Protects " +involved[defendingPlayer][i].name);
                damage--;
            }
            if (damage > 0) {
                involved[defendingPlayer][i].ApplyDamage(damage,"Assault");
            };
            if (involved[defendingPlayer][i].health !== "Eliminated") {
                defendersLeft++;
            }
        }
        //final results
        outputCard.body.push("[hr]");
        outputCard.body.push("[U]Results[/u]");
        let defendersLost = false;
        if (defendersLeft === 0 && attackersLeft === 0) {
            outputCard.body.push("No Survivors, Draw");
        }
        if (attackersLeft > 0 && defendersLeft > 0 && totalDamage[attackingPlayer] <= totalDamage[defendingPlayer]) {
            outputCard.body.push("Surviving Attackers must retreat to their previous Hex");
        }
        if (defendersLeft > 0 && totalDamage[attackingPlayer] > totalDamage[defendingPlayer]) {
            outputCard.body.push("Surviving Defenders must retreat 1 Hex (13.2.2)");
            defendersLost = true;
        }
        if (defendersLeft === 0 && attackersLeft > 0) {
            outputCard.body.push("The Attackers Take the Hex!");
            defendersLost = true;
        }
        if (attackersLeft === 0 && defendersLeft > 0) {
            outputCard.body.push("The Defenders Hold the Hex!");
        }
        if (defendersLost === true && advancingVehicles.length > 0) {
            _.each(advancingVehicles,name => {
                outputCard.body.push(name + " may advance into an adjacent Hex, subject to Rule 13.1.5");
            })
        }
        PrintCard();
    }



    
    
    const CheckConcealment = (unit) => {
        if (unit.type === "Helicopter" || unit.type === "Aircraft") {
            return false;
        }
        //10.5.13
        let hex = HexMap[unit.hexLabel];
        if (unit.token.get(SM.moved) === true) {
            return false;
        }
        if (unit.token.get("aura1_color") === "#000000") {
            return false;
        }
        if (unit.type === "Vehicle" && hex.defenseBonus.Vehicles === 0) {
            return false;
        }
        if (unit.type === "Infantry" && hex.defenseBonus.Troops === 0) {
            return false
        }

        if (hex.defense) {
            return false;
        }
        let keys = Object.keys(Units);
        for (let i=0;i<keys.length;i++) {
            let unit2 = Units[keys[i]];
            let hex2 = HexMap[unit2.hexLabel];
            if (unit2.player !== unit.player) {
                let dist = hex.cube.distance(hex2.cube);
                if (dist === 1) {
                    return false;
                }
                if (dist < 6 && unit2.special.includes("Recon")) {
                    return false;
                }
            }
        }
        return true;
    }
    

    const UnitInfo = (msg) => {
        let id = msg.selected[0]._id;
        let unit = Units[id];
        if (!unit) {
            sendChat("","Not in Unit Array");
            return;
        }
        let level = parseInt(unit.token.get("currentSide"));
        SetupCard(unit.name,unit.hexLabel,unit.nation);
        if (unit.Disrupted()) {
            outputCard.body.push("Unit is Disrupted");
        }
        if (unit.Reduced()) {
            outputCard.body.push("Unit is Reduced");
        }
        if (unit.Ready()) {
            outputCard.body.push("Unit is Ready");
        } else {
            outputCard.body.push("Unit is Not Ready")
        }
        if (unit.type === "Helicopter") {
            let status = unit.HeloStatus();
            if (status === "NOE") {status = "Flying NOE"};
            outputCard.body.push("Helicopter is " + status);
        }
        if (state.WaW85.passengerID[unit.id]) {
            outputCard.body.push("Carrying Passenger - " + Units[state.WaW85.passengerID[unit.id]].name);
        }
        if (unit.type === "HQ" || unit.type === "Leader" || unit.type === "Support") {
            let parentID = Object.keys(state.WaW85.attachedIDs).find(key => state.WaW85.attachedIDs[key].includes(id));
            if (parentID) {
                parent = Units[parentID];
                outputCard.body.push("Attached to " + parent.name);
            } else {
                outputCard.body.push("Not Attached");
            }
        }
        if (state.WaW85.attachedIDs[id]) {
            _.each(state.WaW85.attachedIDs[id],id2 => {
                let unit2 = Units[id2];
                if (unit2) {
                    outputCard.body.push(unit2.name + " is Attached");
                }
            })
        }




        let hex = HexMap[unit.hexLabel];
        if (hex.offboard === true) {
            outputCard.body.push("Offboard");
        } else {
            outputCard.body.push("Terrain: " + hex.terrain);
            if (hex.road === true) {
                outputCard.body.push("Road Present");
            }
        }
        outputCard.body.push("[hr]")
        let formation = state.WaW85.formationInfo[unit.formationID];
        if (formation) {
            outputCard.body.push("Formation: " + formation.name);
            outputCard.body.push("Formation Morale/Training: " + formation.morale);
        }
        if (unit.type === "Leader") {
            outputCard.body.push("Leader Morale: " + unit.leaderMorale[level]);
        } else if (unit.type === "HQ") {
            outputCard.body.push("Command Bonus: " + unit.command[level]);
            outputCard.body.push("Command Range: " + formation.commandRange[level]);
        }
        PrintCard();
    }



    const FFE = (msg) => {
        //!FFE;spotterID;targetID;artilleryID;type;Offboard - last can be false for onboard
        //for offboard tokens, spotterID  will be a placeholder
        let Tag = msg.content.split(";");
        let target = Units[Tag[1]];
        let artUnit = Units[Tag[2]]
        let type = Tag[3]; //HE, Smoke etc
        let onboard = Tag[4] === "Onboard" ? true:false;
        let weapon = artUnit.artWeapon;
        SetupCard(artUnit.name,"FFE",artUnit.nation);

        let results = SpotterCheck(target,artUnit,onboard);
        let spotter = results.spotter;
        if (spotter === false) {
            PrintCard();
            return;
        }
        outputCard.body.push(spotter.name + " is Spotting");
        //spot check
        if (results.spotCheck === true) {
            let bonus = spotter.Leader().command;
            let morale = state.WaW85.formationInfo[spotter.formationID].morale;
            let moraleRoll = randomInteger(6) + randomInteger(6) - bonus;
            let tip = "Roll: " + moraleRoll + " vs. " + morale;
            if (bonus !== 0) {
                tip += "<br>Leader/HQ Bonus: " + bonus;
            }



            if (moraleRoll <= morale) {
                result = "Passed";
            } else {
                result = "Failed";
            }
            tip = '[' + result + '](#" class="showtip" title="' + tip + ')';
            outputCard.body.push("Spotter Check: " + tip);
            if (moraleRoll > morale) {
                artUnit.SetReady(false);
                outputCard.body.push(artUnit.name + " is marked OPS Complete");
                PrintCard();
                return;
            } 
        }

        //scatter
        let scatterRoll1 = randomInteger(6);
        let scatterRoll2 = randomInteger(6);

        let fubarRoll = randomInteger(2);
        if (scatterRoll1 < 6) {
            outputCard.body.push("FFE is On Target");
        } else {
            if (scatterRoll2 === 6) {
                if (artillery.special.includes("Offboard")) {
                    outputCard.body.push("The Offboard Artillery was retasked by Division HQ and is no longer available");
                    artillery.token.remove();
                    delete Units[artillery.id];
                    PrintCard();
                    return;
                } else {
                    if (fubarRoll === 1) {
                        outputCard.body.push("The Fire is so Offtarget it is cancelled");
                    } else {
                        outputCard.body.push("Communications issues causes the Mission to be cancelled");
                    }
                    artillery.SetReady(false);
                    outputCard.body.push(artillery.name + " is marked OPS Complete");
                }
                PrintCard();
                return;
            } else {
                let newHex = Scatter(target);
                if (scatterRoll2 > 4 && newHex) {
                    newHex = Scatter(target);
                }
                if (newHex) {
                    outputCard.body.push("FFE Scatters");
                } else {
                    outputCard.body.push("The Fire Scatters Off Map");
                    PrintCard();
                    return;
                }
            }
        } 
        outputCard.body.push("[hr]");

        //Resolve FFE
outputCard.body.push("FFE Effects")


    //Sound, FX
        if (artUnit.special.includes("Offboard") === false) {
            artUnit.SetReady(false);
        }
        target.token.remove();
        delete Units[target.id];

        PrintCard();
    }

    const Scatter = (target) => {
        let directionRoll = randomInteger(6) - 1;
        let direction = DIRECTIONS[directionRoll];
        let startHex = HexMap[target.hexLabel];
        let index = startHex.tokenIDs.indexOf(target.id);
        if (index > -1) {
            startHex.tokenIDs.splice(target.id);
        }

        let neighbourCube = HexMap[target.hexLabel].cube.neighbour(direction);
        let newLabel = neighbourCube.label();
        let newHex = HexMap[newLabel];
        if (newHex) {
            target.token.set({
                left: newHex.centre.x,
                top: newHex.centre.y,
            })
            target.hexLabel = newLabel;
            newHex.tokenIDs.push(target.id);
        } else {
            target.token.remove();
            delete Units[target];
        }
        return newHex;
    }


    const SummonToken = (cID,hexLabel,size = 70) => {
        size = size * pageInfo.scale;
        let centre = HexMap[hexLabel].centre;
        let character = getObj("character", cID);
        character.get('defaulttoken',function(defaulttoken){
            const dt = JSON.parse(defaulttoken);
            let img = dt.imgsrc;
            img = tokenImage(img);
            if(dt && img){
                dt.tint_color = "transparent";
                dt.aura1_color = "transparent";
                dt.aura1_radius = 0;
                dt.showplayers_aura1 = false;
                dt.showname =  false;
                dt.disableSnapping = true;
                dt.disableTokenMenu =true;
                dt.imgsrc=img;
                dt.left=centre.x;
                dt.top=centre.y;
                dt.pageid = pageInfo.page.get('id');
                dt.layer = "objects";
                dt.width = size;
                dt.height = size;
                let newToken = createObj("graphic", dt);
                let newUnit = new Unit(newToken.get("id"));
                return newUnit;
            } else {
                sendChat('','/w gm Cannot create token for <b>'+character.get('name')+'</b>');
            }
        });
    }





















    const CreateOpsDeck = (phase = "Start") => {
        let formations = Scenario.formations;
        let cards = [];
        _.each(formations,formation => {
            if (formation.opsDeck === true) {
                for (let i=0;i<formation.cards;i++) {
                    cards.push(formation);
                }
                if (phase === "End" && state.WaW85.played.includes(formation.name) === false) {
                    state.WaW85.missed.push(formation.name);
                    outputCard.body.push(formation.name + " is Guaranteed to Activate");
                }
            }
        })
        cards.push({name: "End Operations"});
        if (state.WaW85.missed.length === 0) {
            cards.push({name: "End Operations"});
            if (Scenario.thirdEndOps === true) {
                cards.push({name: "End Operations"});
            }
        }
        state.WaW85.played = [];
        if (state.WaW85.eventCard === true) {
            cards.push({name: "Battlefield Event/Friction"});
        }
        if (Scenario.designatedFormation && Scenario.designatedFormation.turns.includes(state.WaW85.turn)) {
            cards.push({name: "Designated Formation"});
        }


        //others based on scenario

        state.WaW85.cards = cards;
    }

    const NextPhase = () => {
        SetupCard(state.WaW85.phase + " Phase","Turn " + state.WaW85.turn,"Neutral");
        if (state.WaW85.turn > Scenario.maxTurns) {
            outputCard.body.push("Game Over");
        } else {
            if (state.WaW85.turn === 0) {
                InitiativePhase();
            } else {
                LastFormation();
                if (state.WaW85.phase === "Operations") {
                    OperationsPhase();
                } else {
                    EndPhase();
                }
            }
        }
        PrintCard();
    }

    const InitiativePhase = () => {
        CreateOpsDeck();
        if (Scenario.initiativeFormation > 0) {
            let formation = Scenario.formations[Scenario.initiativeFormation];
            outputCard.body.push("[U]Initiative Phase[/u]");
            outputCard.body.push("[B]" + formation.name + " has Initiative[/b]");
            outputCard.nation = formation.nation;
            outputCard.body.push("The HQ may be Placed with a Unit");
            outputCard.body.push("Transfer any Leaders or Inf Support Weapons");
            outputCard.body.push("Activate Formation from the HQ when Done")
            state.WaW85.phase = "Operations";
            state.WaW85.turn = 1;
        } else {
            state.WaW85.phase = "Operations";
            state.WaW85.turn = 1;
        }
    }





    const OperationsPhase = () => {
        //draw card randomly
        let index = randomInteger(state.WaW85.cards.length) - 1;
        let card = state.WaW85.cards.splice(index,1)[0];
        if (!card) {
            //2nd missed ops/missing unit issue
            card = {name: "End Operations"};
        }
        if (card.name === "End Operations") {
            state.WaW85.endOps++;
        } else {
            if (!state.WaW85.played.includes(card.name)) {
                state.WaW85.played.push(card.name);
            }
        }
        outputCard.body.push("[B]" + card.name + " Card[/b]");
        outputCard.body.push("[hr]");
        if (state.WaW85.endOps > 1) {
            EndOpsEvent();
        } else if (card.name !== "End Operations") {
            if (card.name === "Battlefield Event/Friction") {
                BattleFieldEvent();
            } else if (card.type && card.type === "Formation") {
                FormationEvent(card);
            } else if (card.name === "Designated Formation") {
                card = Scenario.formations[Scenario.designatedFormation.formationID];
                outputCard.body.push(card.name);
                if (!state.WaW85.played.includes(card.name)) {
                    state.WaW85.played.push(card.name);
                }                
                FormationEvent(card);
            }
        }
    }

    const BattleFieldEvent = () => {
        let roll = randomInteger(6) + randomInteger(6);
        let side = (randomInteger(6) < 4) ? Scenario["Blue"]:Scenario["Red"];

        if (roll < 4) {
            outputCard.body.push("[B]Higher Command HQ[/b]<br> A higher HQ on the " + side + " side has sent staff officers forward to assist on the battlefield. Select a " + side + "HQ. It will be restored to full strength and Unsuppressed. Then move it a unit of its Formation");
            ButtonInfo("Select HQ and Click This","!Mods;&#64;&#123;selected&#124;token_id&#125;;Higher Command HQ");
            outputCard.nation = side;
        }
        if (roll === 4) {
            WeatherChange();
        }
        if (roll === 5) {
            outputCard.body.push("[B]Cautious Approach[/b]<br> Activate one " + side + " formation for a modified Impulse. Units in the Activated Formation may only execute Move or Move & Fire Actions, with only 1/2 their MPs.");
            outputCard.nation = side;
            EventInfo = "Cautious Approach";
        }
        if (roll === 6) {
            outputCard.body.push("[B]Overwatch Set[/b]<br>" + side + " troops have time to re-ammo and re-position themselves. Pick one " + side + " Formation and its units are marked Ready");
            ButtonInfo("Pick a Unit","!Mods;&#64;&#123;selected&#124;token_id&#125;;Make Formation Ready");
            outputCard.nation = side;
        }
        if (roll === 7) {
            BattlefieldFriction();
        }
        if (roll === 8) {
            outputCard.body.push("[B]High Rate of Fire[/b]<br>" + side + " Troops intensify their fire. Activate one " + side + " Formation for a modified Impulse. Units in the Activated Formation may only execute Direct Fire, Indirect Fire or On-Board Artillery Strikes (not Move & Fire)");
            outputCard.nation = side;
            EventInfo = "High Rate of Fire";
        }
        if (roll === 9) {
            outputCard.body.push("[B]High Speed Approach[/b]<br>" + side + " Troops make good time to the Objective. Activate one " + side + " Formation for a modified Impulse. Units in the Activated Formation may only execute Movement or Move & Fire Actions");
            outputCard.nation = side;
            EventInfo = "High Speed Approach";
        }
        if (roll === 10) {
            outputCard.body.push("[B]Forward Reserves[/b]<br>Forward reserves are attempting to deploy to the battlefield. If possible, immediately flip one or 2 platoons of the " + side + " side back to unreduced");
            outputCard.body.push("Alternately return 1 Destroyed Unit to the Map, at Full Status and stacked with or adjacent to a Unit from its Formation (drag unit from Journal to location on Map before clicking button");
            ButtonInfo("Pick Reduced Unit (do 2x)","!Mods;&#64;&#123;selected&#124;token_id&#125;;Toggle Unit Reduction");
            ButtonInfo("OR Add New Unit","!Mods;&#64;&#123;selected&#124;token_id&#125;;Add To Formation");
            outputCard.nation = side;
        }
        if (roll === 11) {
            let squall = state.WaW85.season === "Summer" ? "Rain Squall":"Snow Squall";
            outputCard.body.push("[B]Squall Weather[/b]<br>An intense but localized " + squall + " crosses the Battlefield. For the remainder of this Operations Phase, Long Range Fire has a higher penalty and units may gain a Defensive Bonus");
            state.WaW85.squall = true;
        }
        if (roll === 12) {
            outputCard.body.push("[B]Missile Re-Supply[/b]<br>Logistical Transport has arrived. One " + side + " Formation can resupply its Missiles. Remove all Missile Ammo Out");
            ButtonInfo("Pick Unit","!Mods;&#64;&#123;selected&#124;token_id&#125;;Resupply Formation");
            outputCard.nation = side;
        }

    }

    const BattlefieldFriction = () => {
        let roll = randomInteger(6) + randomInteger(6);
        let roll2 = randomInteger(6);
        let side = (randomInteger(6) < 4) ? Scenario["Blue"]:Scenario["Red"];
        let none = true;

        if (roll === 2) {
            outputCard.body.push("[B]The Order is Published![/b]");
            outputCard.body.push("One of the " + side + " commanders is struggling to get your orders out. When the next " + side + " formation card is drawn, all units in that formation should be marked Ops Complete and no their impulse is done");
            none = false;
            outputCard.nation = side;
        }
        if (roll === 3) {
            outputCard.body.push("[B]They're Everywhere![/b]");
            outputCard.body.push("One of the " + side + " units panics and begins firing in a frenzy. The other player chooses a unit capable of direct fire.");
            if (roll2 === 6) {
                outputCard.body.push("Friendly Fire happens, the other player also chooses the target");
            } 
            outputCard.body.push("The unit will be marked Ops Complete");
            none = false;
            outputCard.nation = side;
        }
        if (roll === 4) {
            outputCard.body.push("[B]No Mercy![/b]");
            outputCard.body.push("Assaults in the next impulse for each player sees hits doubled.");
            state.WaW85.flags.push("No Mercy Red");
            state.WaW85.flags.push("No Mercy Blue");
            none = false;
        }
        if (roll === 5 && roll2 > 3) {
            outputCard.body.push("[B]Friendly Fire![/b]");
            outputCard.body.push("Poor training and lax coordination on the " + side + " combine for deadly results. Offboard Artillery Fire is directed onto Friendly Positions");
            if (roll2 === 6) {
                outputCard.body.push("The Opponent places a FFE Marker and executes a MRLS Strike of Strength 3-3");
            }
            if (roll2 === 4 || roll2 === 5) {
                outputCard.body.push("The Opponent places a FFE Marker and executes a Artillery HE Strike of Strength 3-4");
            }
            none = false;
            outputCard.nation = side;
        }
        if (roll === 6 && roll2 > 4) {
            outputCard.body.push("[B]Bad Navigation[/b]");
            outputCard.body.push("One of your formations is lost. When the next " + side + " formation card is drawn, the formation should be marked Ops Complete")
            none = false;
            outputCard.nation = side;
        }
        if (roll === 8) {
            outputCard.body.push("[B]Survivors Regroup[/b]");
            outputCard.body.push("The " + side + " Force may return a previously destroyed 2 step unit as a Reduced Unit within 2 hexes of any other friendly unit, no matter their formation. They may not be placed within 2 hexes of any enemy unit or in an objective hex controlled by the enemy. Place token, then click button and then reduce the unit.");
            ButtonInfo("Add New Unit","!Mods;&#64;&#123;selected&#124;token_id&#125;;Add To Formation");
            none = false;
            outputCard.nation = side;
        }
        if (roll === 9) {
            outputCard.body.push("[B]Rapid Repairs[/b]");
            outputCard.body.push("The " + side + " Force may immediately restore a reduced unit to full strength or remove a Disrupted Marker on one unit");
            ButtonInfo("Pick Reduced Unit","!Mods;&#64;&#123;selected&#124;token_id&#125;;Toggle Unit Reduction");
            ButtonInfo("OR Remove Disruption","!Mods;&#64;&#123;selected&#124;token_id&#125;;Toggle Unit Disruption");
            none = false;
            outputCard.nation = side;
        }
        if (roll === 10 && roll2 > 3) {
            outputCard.body.push("[B]Working as Intended![/b]");
            outputCard.body.push("The " + side + " Player chooses an enemy unit and reduces that unit");
            none = false;
            ButtonInfo("Pick Unit to Reduce","!Mods;&#64;&#123;selected&#124;token_id&#125;;Toggle Unit Reduction");
            outputCard.nation = side;
        }
        if (roll === 11) {
            outputCard.body.push("[B]Coordination Effort[/b]");
            outputCard.body.push("Each player rolls a D6 and can remove as many Disrupted Markers as they rolled");
            none = false;
            ButtonInfo("Pick Unit","!Mods;&#64;&#123;selected&#124;token_id&#125;;Toggle Unit Disruption");
        }
        if (roll === 12 && roll2 > 3) {
            outputCard.body.push("[B]Wrong Missile Supply[/b]");
            outputCard.body.push("The " + side + " Player chooses an enemy missile-armed unit. That unit has been supplied with the wrong kind of missiles, immediately mark it Missile Ammo Out");
            none = false;
            ButtonInfo("Pick Unit","!Mods;&#64;&#123;selected&#124;token_id&#125;;Toggle Missile Ammo Out");
            outputCard.nation = side;
        }
        if (none === true) {
            outputCard.body.push("No Effect/Changes");
        }
    }

    const WeatherChange = () => {
        let roll = randomInteger(6) + randomInteger(6);
        let lines = [];
        let season = state.WaW85.season;
        let AirGone = false;
        let FireOut = false;
        if ((roll === 2 || roll === 12) && state.WaW85.weatherLevel !== 4) {
            if (season === "Summer") {
                lines.push("Severe Thunderstorms roll in");
                lines.push("The Ground becomes Muddy");
            } else {
                lines.push("A Blizzard hits the Battlefield");
                lines.push("The Ground becomes covered in Deep Snow");
            }
            lines.push("LOS Is reduced, Movement is reduced, Direct and Indirect Fire is reduced");
            lines.push("Units may receive a Defensive Bonus");
            lines.push("Helicopters and Close Air Support leave the Battlefield");
            AirGone = true;
            state.WaW85.weatherLevel = 4;
            state.WaW85.mud = true;
            FireOut = true;
        }
        if ((roll === 3 || roll === 11) && state.WaW85.weatherLevel !== 3) {
            if (season === "Summer") {
                lines.push("Torrential Rain strikes the Battlefield");
                lines.push("The Ground becomes Muddy");
            } else {
                lines.push("Heavy Snow begins to fall");
                lines.push("The Ground becomes covered in Deep Snow");
            }
            lines.push("LOS Is reduced");
            lines.push("Units may receive a Defensive Bonus");
            lines.push("Helicopters and Close Air Support leave the Battlefield");
            AirGone = true;
            state.WaW85.weatherLevel = 3;
            state.WaW85.mud = true;
            FireOut = true;
        }
        if ((roll === 4 || roll === 10) && state.WaW85.weatherLevel !== 2) {
            if (season === "Summer") {
                lines.push("Heavy Rain strikes the Battlefield");
                lines.push("The Ground becomes Muddy");
            } else {
                lines.push("Heavy Snow begins to fall");
                lines.push("The Ground becomes covered in Deep Snow");
            }
            lines.push("Units may receive a Defensive Bonus");
            lines.push("Helicopters and Close Air Support leave the Battlefield");
            AirGone = true;
            state.WaW85.weatherLevel = 2;
            state.WaW85.mud = true;
            FireOut = true;
        }
        if ((roll === 5 || roll === 9) && state.WaW85.weatherLevel !== 1) {
            if (season === "Summer") {
                lines.push("Rain begins to fall");
            } else {
                lines.push("Snow begins to fall");
            }
            lines.push("Long Range Fire will be less accurate");
            state.WaW85.weatherLevel = 1;
        } 
        if ((roll > 5 && roll < 9) && state.WaW85.weatherLevel !== 0) {
            lines.push("The Weather Clears");
            if (state.WaW85.mud === true) {
                if (season === "Summer") {
                    lines.push("The ground remains Muddy");
                } else {
                    lines.push("The ground remains covered in Heavy Snow");
                }
            }
            state.WaW85.weatherLevel = 0;
        }
        if (lines.length === 0) {
            outputCard.body.push("No Effect");
        } else {
            outputCard.body.push("[B]Weather Change[/b]");
            _.each(lines,line => {
                outputCard.body.push(line);
            })
        }

        if (AirGone === true) {
//remove Helos and CAS



        }
        if (FireOut === true) {
            //put out fires


        }



    }


    const EndOpsEvent = () => {
        outputCard.body.push("2nd End Operations Card");
        outputCard.body.push("Turn is Over");
        outputCard.body.push("Click End Phase to Run End Phase");
        ButtonInfo("Start End Phase","!NextPhase");
        state.WaW85.phase = "End";
    }


    const FormationEvent = (card) => {
        outputCard.nation = card.nation;
        outputCard.body.push("Place or move HQ");
        outputCard.body.push("Transfer any Leaders");
        outputCard.body.push("Activate Formation from the HQ when Done")
    }

    const LastFormation = () => {
        if (state.WaW85.activeUnitID) {
            Units[state.WaW85.activeUnitID].SetReady(false);
            state.WaW85.activeUnitID = "";
        }
        if (state.WaW85.activeFormationID) {
            let prevFormation = state.WaW85.formationInfo[state.WaW85.activeFormationID];
             if (prevFormation) {
                _.each(prevFormation.unitIDs,unitID => {
                    let unit = Units[unitID];
                    unit.SetReady(unit.Ready());
                })
            }
        }
        state.WaW85.activeFormationID = "";
        RemoveMoveMarkers();
    }

    const ActivateFormation = (msg) => {
        LastFormation();
        let id = msg.selected[0]._id;
        let hq = Units[id];
        let formation = state.WaW85.formationInfo[hq.formationID];
        state.WaW85.activeFormationID = formation.id;
        let ew = (hq.token.get(SM.EW) || hq.token.get(SM.EWReducing)) ? true:false;

        SetupCard(formation.name,"Activation",formation.nation);
        let parentID = Object.keys(state.WaW85.attachedIDs).find(key => state.WaW85.attachedIDs[key].includes(hq.id));
        if (!parentID) {
            outputCard.body.push("Needs to be Attached to a Unit in Formation");
            PrintCard();
            return;
        }

        ResetFlags(formation);
        InCommand(formation,hq,ew);
        Disruption(formation,hq,ew)
        Reloads(formation,hq);
        outputCard.body.push("[hr]");
        if (ew === true) {
            outputCard.body.push("Artillery cannot be called due to the effects of Electronic Warfare");
        } else {
            outputCard.body.push("Offboard Artillery can be called now, up to 2 Strikes");
        }

        if (EventInfo !== "") {
            outputCard.body.push("[hr]");
            outputCard.body.push("[B]" + EventInfo + "[/b]");
            if (EventInfo === "Cautious Approach") {
                 outputCard.body.push("Units may only execute Move or Move & Fire Actions, with only 1/2 their MPs");
            }
            if (EventInfo === "High Rate of Fire") {
                outputCard.body.push("Units may only execute Direct Fire, Indirect Fire or On-Board Artillery Strikes")
            }
            if (EventInfo === "High Speed Approach") {
                outputCard.body.push("Units may only execute Move or Move and Fire Actions");
            }
        }

        let index = state.WaW85.missed.indexOf(formation.name);
        if (index > -1) {
            state.WaW85.missed.splice(index,1);
            if (state.WaW85.missed.length === 0) {
                outputCard.body.push("[hr]");
                outputCard.body.push("All Guaranteed Formations have Gone");
                outputCard.body.push("End Ops Added back in");
                outputCard.body.push("[hr]");
                state.WaW85.cards.push({name: "End Operations"});
                if (Scenario.thirdEndOps === true) {
                    state.WaW85.cards.push({name: "End Operations"});
                }
            }
        }
        PrintCard();
    }

    const ResetFlags = (formation) => {
        _.each(formation.unitIDs,unitID => {
            let unit = Units[unitID];
            if (unit) {
                unit.unloaded = false;
                unit.passUnloaded = false;

            } 
        })
    }


    const InCommand = (formation,hq,ew) => {
        let hqLevel = parseInt(hq.token.get("currentSide"));
        let morale = parseInt(formation.morale);
        let commandRange = parseInt(formation.commandRange[hqLevel]);
        let hqHex = HexMap[hq.hexLabel];
        //electronic warfare
        if (ew === true) {
            commandRange = 0;
            outputCard.body.push("[B]Electronic Warfare is Active[/b]");
            outputCard.body.push("[hr]");
        }
        let hexes = {};
        let leaderHexLabels = [];
        _.each(formation.leaderIDs,leaderID => {
            let leader = Units[leaderID];
            if (leader) {
                leaderHexLabels.push(leader.hexLabel);
            }
        })
        _.each(formation.unitIDs,unitID => {
            let hexLabel = Units[unitID].hexLabel;
            if (hexes[hexLabel]) {
                hexes[hexLabel].push(unitID);
            } else {
                hexes[hexLabel] = [unitID];
            }
        })
        let hexLabels = Object.keys(hexes);
        _.each(hexLabels,hexLabel => {
            let distance = HexMap[hexLabel].Distance(hqHex);
            let unitIDs = hexes[hexLabel];
            if (distance <= commandRange || leaderHexLabels.includes(hexLabel) || HexMap[hexLabel].offboard === true) {
                _.each(unitIDs,unitID => {
                    let unit2 = Units[unitID];
                    if (unit2.type !== "HQ" || unit2.type !== "Leader" || unit2.type !== "Support") {
                        Units[unitID].SetActive(true);
                    }
                })
            } else {
                let moraleRoll = randomInteger(6) + randomInteger(6);
                let tip = "Morale Roll: " + moraleRoll + " vs. " + morale;
                tip = '[OOC](#" class="showtip" title="' + tip + ')';

                _.each(unitIDs,unitID => {
                    let unit = Units[unitID];
                    if (moraleRoll <= morale) {
                        unit.SetActive(true);
                    } else {
                        let ic = false
                        if (unit.special.includes("Recon")) {
                            ic = true;
                        }
                        if (unit.special.includes("Helicopter")) {
                            ic = true;
                        }
                        if (ic === true) {
                            unit.SetActive(true);
                        } else {
                            unit.SetOOC();
                            outputCard.body.push(unit.name + " is " + tip + " this turn");
                        }
                    }
                })
            }
        })
    }

    const Disruption = (formation,hq,ew) => {
        let hqLevel = parseInt(hq.token.get("currentSide"));
        _.each(formation.unitIDs, unitID => {
            let unit = Units[unitID];
            if (unit.Disrupted()) {
                if (unit.type === "Helicopter" && unit.Active()) {
                    unit.SetDisrupt(false);
                } else {
                    let morale = parseInt(formation.morale);
                    _.each(formation.leaderIDs,leaderID => {
                        let leader = Units[leaderID];
                        let leaderLevel = parseInt(leader.token.get("currentSide"));
                        if (leader && leader.hexLabel === unit.hexLabel) {
                            morale = leader.leaderMorale[leaderLevel];
                        }
                    })
                    let moraleRoll = randomInteger(6) + randomInteger(6);
                    let tip = "";
                    if (hq.hexLabel === unit.hexLabel) {
                        moraleRoll -= hq.command[hqLevel];
                        tip += "<br>HQ Command -" + hq.command[hqLevel] + " to Roll";
                    }
                    if (unit.OOC()) {
                        moraleRoll++
                        tip += "<br>+1 to Roll due to OOC";
                    };
                    if (ew === true) {
                        moraleRoll++
                        tip += "<br>+1 to Roll due to EW"
                    };
                    
                    tip = "Morale Roll: " + moraleRoll + " vs. " + morale + tip;

                    if (moraleRoll <= morale) {
                        tip = '[Rallies](#" class="showtip" title="' + tip + ')';
                        unit.SetDisrupt(false);
                    } else {
                        tip = '[Remains Disrupted](#" class="showtip" title="' + tip + ')';

                        let adjacent = false;
                        let keys = Object.keys(Units);
                        for (let i=0;i<keys.length;i++) {
                            let unit2 = Units[keys[i]];
                            let status = "Ground";
                            if (unit2.type === "Helicopter" && unit2.HeloStatus === "Flying") {
                                status = "Flying";
                            }
                            if (unit2.nation !== unit.nation) {
                                let distance = unit.Distance(unit2);
                                if (distance === 1 && status === "Ground") {
                                    adjacent = true;
                                    break;
                                }
                            }
                        }
                        if (adjacent === true) {
                            outputCard.body.push("It cannot Act due to adjacent Enemy");
                        }
                        unit.SetReady(false);
                    }
                    outputCard.body.push(unit.name + ": " + tip);
                }
            }
        })
    }

    const Reloads = (formation,hq) => {
        let hqLevel = parseInt(hq.token.get("currentSide"));
        _.each(formation.unitIDs, unitID => {
            let unit = Units[unitID];
            if (unit.token.get(SM.reload) && unit.Disrupted() === false) {
                let morale = parseInt(formation.morale);
                _.each(formation.leaderIDs,leaderID => {
                    let leader = Units[leaderID];
                    let leaderLevel = parseInt(leader.token.get("currentSide"));
                    if (leader && leader.hexLabel === unit.hexLabel) {
                        morale = leader.leaderMorale[leaderLevel];
                    }
                })
                let moraleRoll = randomInteger(6) + randomInteger(6);
                let tip = "";
                if (hq.hexLabel === unit.hexLabel) {
                    moraleRoll -= hq.command[hqLevel];
                    tip += "<br>HQ Command -" + hq.command[hqLevel] + " to Roll";
                }
                tip = "Morale Roll: " + moraleRoll + " vs. " + morale + tip;

                let tipWord;
                if (moraleRoll <= morale) {
                    unit.token.set(SM.reload,false);
                    tipWord = "Reloaded"
                } else {
                    //fails, what happens based on unit
                    if (unit.type === "Support") {
                        if (unit.special.includes("Alternative")) {
                            unit.token.set(SM.reload,false);
                            unit.token.set(SM.oom,true);
                            tipWord = "Out";
                        } else {
                            tipWord = "Reloading Still";
                        }
                    }
                    if (unit.type === "Vehicle") {
                        if (unit.special.includes("Transport")) {
                            unit.token.set(SM.reload,false);
                            unit.token.set(SM.oom,true);
                            tipWord = "Out";
                        } else {
                            unit.token.set(SM.reload,false);
                            unit.token.set(SM.low,true);
                            tipWord = "Low";
                        }
                    }
                    if (unit.type === "Helicopter") {
                        unit.token.set(SM.reload,false);
                        unit.token.set(SM.low,true);
                        tipWord = "Low";
                    }
                    tip = '[' + tipWord + '](#" class="showtip" title="' + tip + ')';
                    outputCard.body.push(unit.name + ": Missiles " + tip);
                }
            }
        })
    }





    const Mods = (msg) => {
        //!Mods;@{selected|token_id};?{Mod|Toggle Unit OPS Complete|Toggle Unit Disruption|Toggle Unit Reduction|Toggle Missile Ammo Out|Make Formation OPS Complete|Make Formation Active|Resupply Formation|Add to Formation}
        //a function to modify things like OPS complete, disruption etc
        let Tag = msg.content.split(";");
        let tokenID = Tag[1];
        if (!tokenID) {
            sendChat("","Select a Token");
            return;
        }
        let mod = Tag[2];
        let unit = Units[tokenID];
        if (!unit && tokenID) {
            unit = new Unit(tokenID);
        }
        let formationInfo = state.WaW85.formationInfo[unit.formationID];

        if (mod === "Toggle Unit OPS Complete") {
            let newStatus = unit.Ready() === true ? false:true;
            unit.SetReady(newStatus);
        }
        if (mod === "Toggle Unit Disruption") {
            let newStatus = unit.Disrupted() === true ? false:true;
            unit.SetDisrupt(newStatus);
        }
        if (mod === "Toggle Unit Reduction") {
            let newStatus = unit.Reduced() === true ? false:true;
            unit.SetReduced(newStatus);
        }
        if (mod === "Higher Command HQ") {
            if (unit.type !== "HQ") {
                sendChat("","Not an HQ");
            } else {
                unit.SetDisrupt(false);
                unit.SetReduced(false);
            }
        }

        if (mod === "Toggle Missile Ammo Out") {
            let result = unit.token.get(SM.oom) ? false:true;
            unit.token.set(SM.oom,result);
        }
        
        if (mod === "Make Formation OPS Complete" || mod === "Make Formation Ready") {
            let unitIDs = formationInfo.unitIDs;
            let ready = (mod.includes("Ready")) ? true:false;
            _.each(unitIDs,unitID => {
                let unit2 = Units[unitID];
                unit2.SetReady(ready);
            })
        }
        if (mod === "Add to Formation") {
            SetupCard("Add to Formation","",unit.nation);
            outputCard.body.push("Pick their Formation");
            _.each(Scenario.formations,formation => {
                ButtonInfo(formation.name,"!AddToFormation;" + formation.id + ";" + tokenID);
            })
            PrintCard();
        }
        if (mod === "Resupply Formation") {
            let unitIDs = formationInfo.unitIDs;
            _.each(unitIDs,unitID => {
                unit.token.set(SM.oom,false);
                unit.token.set(SM.low,false);
            })

        }




    }

    const AddToFormation = (msg) => {
        let Tag = msg.content.split(";");
        let formationID = Tag[1];
        let unitID = Tag[2];
        let unit = Units[unitID];
        let name = unit.charName;
        let nations = ["US ","Soviet "];
        _.each(nations,nation => {
            name = name.replace(nation,"");
        })
        unit.token.set("name",name);
        unit.name = name;
        state.WaW85.formationInfo[formationID].unitIDs.push(unitID);
        unit.formationID = formationID;
        state.WaW85.unitInfo[unitID] = formationID;
        sendChat("","Added to " + state.WaW85.formationInfo[formationID].name);
    }





        
    const EndPhase = () => {
        RemoveMoveMarkers();
        //Marker Removal
        _.each(Units,unit => {
            //remove all OPS Complete, out of command
            unit.SetReady(true);
            if (unit.type === "HQ") {
                //Suppressed HQs are unsuppressed
                unit.SetDisrupt(false);
                //remove EW Reducing, test for HQ with EW to see if EW Reducing
                if (unit.token.get(SM.EWReducing)) {
                    unit.token.set(SM.EWReducing,false);
                    outputCard.body.push(v.name + ": EW Removed");
                }
                if (unit.token.get(SM.EW)) {
                    let morale = state.WaW85.formationInfo[hq.formationID];
                    let roll = randomInteger(6) + randomInteger(6);
                    if (roll <= morale) {
                        unit.token.set(SM.EW,false);
                        unit.token.set(SM.EWReducing,true);
                        outputCard.body.push(unit.name + ": EW Reducing");
                    }
                }
            }
        })
        state.WaW85.activeFormationID = "";
        state.WaW85.activeUnitID = "";
        //remove smoke thinning, then all smoke to smoke thinning
        //Fire Markers
        //remove squall marker
        if (state.WaW85.squall === true) {
            state.WaW85.squall === false;
            let squall = state.WaW85.season === "Summer" ? "Rain Squall":"Snow Squall";
            outputCard.body.push("The " + squall + " ends");
        }        
        //remove chemical strike markers


        //Victory Determination
        outputCard.body.push("Check Victory Conditions");
        
        state.WaW85.phase = "Operations";
        state.WaW85.endOps = 0;
        state.WaW85.turn++;
        CreateOpsDeck("End");

    }

    const Activate = (msg) => {
        let Tag = msg.content.split(";");
        let id = msg.selected[0]._id;
        let action = Tag[1];
        let mode = Tag[2]; //helicopter mode or passengerID if Load
        let unit = Units[id];
        let errorMsg = [];
        RemoveMoveMarkers();
        let lastUnit = Units[state.WaW85.activeUnitID];
        if (lastUnit && lastUnit.token && lastUnit.id !== id) {
            lastUnit.SetReady(false);
        } 

        if (unit.Active() === false && state.WaW85.turn > 0 && action !== "Attach") {
            if (unit.OOC()) {
                errorMsg.push("Unit is Out of Command");
            } else {
                errorMsg.push("Unit is not Active");
            }
        }
        if (unit.Disrupted() && action === "Indirect Fire") {
            errorMsg.push("Disrupted Units may not Fire");
        }


        state.WaW85.activeUnitID = unit.id;
        SetupCard(unit.name,action,unit.nation);
        if (errorMsg.length > 0) {
            _.each(errorMsg,msg => {
                outputCard.body.push(msg);
            })
            PrintCard();
            return;
        }

        if (action === "Move") {
            //move, move & fire, fire only or move to assault
            //calculate max MP based on weather, mud
            //display how far can move and still fire based on abilities
            //if transport note re load/unload
            if (unit.Disrupted()) {
                let inLOS = false;
                let keys = Object.keys(Units);
                for (let i=0;i<keys.length;i++) {
                    let unit2 = Units[keys[i]];
                    if (unit2.nation !== unit.nation) {
                        let los = LOS(unit,unit2);
                        if (los.los === true) {
                            inLOS = true;
                            break;
                        }
                    }
                }
                if (inLOS === true) {
                    outputCard.body.push("The Unit may not move closer to an enemy unit in LOS");
                } else {
                    outputCard.body.push("The Unit must stop when entering a hex in LOS of an enemy and cannot end adjacent to an enemy unit");
                }
                outputCard.body.push("Disrupted Units may not Fire");
            }
            unit.passUnloaded = false;
            let mp = unit.movement;
            if (EventInfo === "Cautious Approach") {
                mp = Math.ceil(mp/2);
                outputCard.body.push("Cautious Approach - MP Halved ⬆️")
            }
            if (state.WaW85.weatherLevel === 4) {
                outputCard.body.push("Extreme Weather - MP Halved ⬆️")
                mp = Math.ceil(mp/2);
            }
            if (unit.unloaded === true) {
                outputCard.body.push("Transport Loaded/Unloaded - MP halved ⬇️");
                mp = Math.floor(mp/2);
            }
            if (state.WaW85.mud && unit.movementType.includes("Ground")) {
                mp = Math.max(1,mp - 1);
                outputCard.body.push("Mud -1 MP");
            }
            if (unit.type === "HQ" || unit.type === "Leader" || unit.type === "Support") {
                mp = 100;
            }
            if (unit.type === "Helicopter") {
                let oldMode = unit.HeloStatus();
                if (oldMode !== mode) {
                    outputCard.body.push("Changing Flying Mode can trigger Opp Fire");
                }
                unit.SetHeloStatus(mode);
                if (mode === "Flying") {mp = 1000};
                if (mode === "NOE") {mp = 12};
                if (mode === "Landed" || mode === "Hovering") {
                    mp = 0;
                }
            }
            if (EventInfo === "High Rate of Fire") {
                outputCard.body.push("High Rate of Fire");
                mp = 0;
            }
            unit.token.set("bar3_value",mp);
            unit.token.set("bar3_max",mp);
            if (mp === 1000) {
                outputCard.body.push("The Unit may move anywhere on the Map");
            } else if (mp === 100) {
                outputCard.body.push("The Unit must move with its Parent Unit");
            } else if (mp > 0) {
                outputCard.body.push("The Unit has " + mp + " MP");
            } else if (mp === 0) {
                outputCard.body.push("The Unit is Stationary");
            }

            //firepower/stabilization notes here
            if (unit.type !== "Helicopter" && mp > 1 && unit.weapons.length > 0) {
                let halfMP = Math.floor(mp/2);
                if (unit.stabilizedWeapons) {
                    if (RedFor.includes(unit.nation)) {
                        outputCard.body.push("Using up to " + halfMP + "MP may fire with a -1FP penalty");
                        outputCard.body.push("More than that is a -2FP penalty");

                    } else {
                        outputCard.body.push("Using up to " + halfMP + "MP may fire without penalty");
                        outputCard.body.push("More than that is a -1FP penalty");
                    }
                } else {
                    outputCard.body.push("May move up to " + halfMP + "MP and fire with a -2FP penalty");
                    outputCard.body.push("More than that may not fire");
                }
            }
            if (unit.type === "Helicopter" && mode === "Flying") {
                outputCard.body.push("Moving less than 12 hexes allows fire without penalty");
                outputCard.body.push("More than that may not fire");
            }
        } else if (action === "Indirect Fire") {
            //create a token on top of unit, then move it, can check LOS/Range which will search for spotter - so modify FFE
            unit.token.set("bar3_value",0);
            unit.token.set("bar3_max",0);
            let targetID = CreateMarker(HexMap[unit.hexLabel],"Target",0,Nations[unit.nation].targetImg,Nations[unit.nation].targetID);
            let target = new Unit(targetID);
            AddAbilities(target); //clears the old abilities
            AddAbility("FFE","!FFE;" + target.id + ";" + unit.id + ";?{Type|HE|Smoke};Onboard",target.charID);
            outputCard.body.push("Place Target, FFE to Fire, Check to Check for Spotter/Range");
            AddAbility("Check","!ArtCheck;Onboard;" + target.id + ";" + unit.id,target.charID); 
        } else if (action === "Unload") {
//put in combat lift off
            let errorMsg = [];
            let passenger = Units[state.WaW85.passengerID[unit.id]];
            if (!passenger) {
                errorMsg.push("No Passenger");
            }
            if (unit.type === "Helicopter" && unit.HeloStatus() !== "Landed") {
                errorMsg.push("Can only Unload when Landed");
            }            
            let mpMax = parseInt(unit.token.get("bar3_max"));
            let mp = parseInt(unit.token.get("bar3_value"));
            if (mpMax > 0 && mp > Math.floor(mpMax/2)) {
                errorMsg.push("Transport has moved too far to Load this turn");
            }
            if (unit.unloaded === true) {
                errorMsg.push("Already Loaded or Unloaded this Activation");
            }
            if (errorMsg.length > 0) {
                _.each(errorMsg,msg => {
                    outputCard.body.push(msg);
                })
            } else {
                Unload(passenger,unit);
                outputCard.body.push("Unloading can trigger Opp Fire");
                outputCard.body.push("Then the passenger can move into an adjacent hex or stay put as part of the Unload");
                passenger.passUnloaded = true;
                if (mpMax > 0) {
                    outputCard.body.push("Transport's activation is Done");
                    unit.SetReady(false);
                } else {
                    outputCard.body.push("After Unloading, the Transport can Move");
                }
                unit.unloaded = true;
            }
        } else if (action === "Load") {
//put in combat lift off

            let passengerID = mode; //just a rename
            let passenger = Units[passengerID];
            let errorMsg = [];
            let distance = unit.Distance(passenger);
            if (HexMap[unit.hexLabel].offboard && HexMap[passenger.hexLabel].offboard) {
                distance = 0;
            }
            let passMPMax = parseInt(passenger.token.get("bar3_max"));
            let passMP = parseInt(passenger.token.get("bar3_value"));
            let mpMax = parseInt(unit.token.get("bar3_max"));
            let mp = parseInt(unit.token.get("bar3_value"));
            if (unit.token.get(SM.passenger)) {
                errorMsg.push("Already has a Passenger");
            }
            if (unit.type === "Helicopter" && unit.HeloStatus() !== "Landed") {
                errorMsg.push("Can only Load when Landed");
            }
            if (unit.unloaded === true) {
                errorMsg.push("Already Loaded or Unloaded this Activation");
            }
            if (passMPMax > 0 && (passMPMax - passMP) > 1) {
                errorMsg.push("Passenger has moved too far to be Loaded");
            }
            if (mpMax > 0 && mp > Math.floor(mpMax/2)) {
                errorMsg.push("Transport has moved too far to Load this turn");
            }
            if (mp > 0 && passMP > 0 && passenger.type === "Towed") {
                errorMsg.push("Towed Weapons and Transports have to start in same Hex to Load");
            }
            if (unit.Disrupted()) {
                errorMsg.push("Disrupted Transports may not Load");
            }
            if (distance > 0) {
                errorMsg.push("Must be in same Hex");
            }
            if (errorMsg.length > 0) {
                _.each(errorMsg,msg => {
                    outputCard.body.push(msg);
                })
            } else {
                outputCard.body.push("Loading can trigger Opp Fire");
                Load(passenger,unit);
                if (mpMax > 0) {
                    outputCard.body.push("Transport's activation is Done");
                    unit.SetReady(false);
                } else{
                    outputCard.body.push("After Loading, the Transport can Move");
                }
                unit.unloaded = true;
            }
        } else if (action === "Attach") {
            let unit2 = Units[mode];
            let oldID = Object.keys(state.WaW85.attachedIDs).find(key => state.WaW85.attachedIDs[key].includes(unit.id));

            let errorMsg = [];
            if (unit2.formationID !== unit.formationID) {
                errorMsg.push("Must be in same Formation");
            }
            let distance = unit2.Distance(unit);
            if (HexMap[unit2.hexLabel].offboard || HexMap[unit.hexLabel].offboard) {
                distance = 0;
            }
            if (unit2.Distance(unit) > 0 && (unit2.type === "Support" || unit2.type === "Leader")) {
                errorMsg.push("Can only transfer in same Hex");
            }
            if (unit.special.includes("Infantry") && unit2.type !== "Infantry") {
                errorMsg.push("This is an Infantry Support Weapon");
            }
            if (unit.special.includes("Armour") && unit2.type !== "Vehicle") {
                errorMsg.push("This is an Armour Support Weapon");
            }
            if (unit.special.includes("Armour") && oldID) {
                errorMsg.push("Cannot transfer Armour Support Weapons");
            }
            if (errorMsg.length > 0) {
                _.each(errorMsg,msg => {
                    outputCard.body.push(msg);
                })
            } else {
                outputCard.body.push(unit.name + " is now Attached to " + unit2.name);
                //remove from old parent if any
                if (oldID) {
                    let ids = state.WaW85.attachedIDs[oldID];
                    let index = ids.indexOf(unit.id);
                    ids.splice(index,1);
                    state.WaW85.attachedIDs[oldID] = ids;
                }
                //add to new parent
                let ids = state.WaW85.attachedIDs[unit2.id] || [];
                ids.push(unit.id);
                state.WaW85.attachedIDs[unit2.id] = ids;
                unit2.MoveAttached();
            }
        }
        PrintCard();
    }


    const Unload = (passenger,transport) => {
        passenger.token.set({
            left: transport.token.get("left"),
            top: transport.token.get("top"),
        })
        toFront(passenger.token);
        transport.token.set(SM.passenger,false);
        state.WaW85.passengerID[transport.id] = "";
        ChangeTokenIDs(passenger.id,passenger.hexLabel,transport.hexLabel);
    }

    const Load = (passenger,transport) => {
        let name = (RedFor.includes(transport.nation)) ? "Red Card":"Blue Card"; 
        let card = findObjs({_type:"graphic",layer: "map", name: name})[0];
        if (!card) {
            sendChat("","Cards not Set Up");
        } else {
            passenger.token.set({
                left: card.get("left"),
                top: card.get("top"),
            })
            transport.token.set(SM.passenger,true);
        }
        state.WaW85.passengerID[transport.id] = passenger.id;
    }







    const AddAbility = (abilityName,action,characterID) => {
        createObj("ability", {
            name: abilityName,
            characterid: characterID,
            action: action,
            istokenaction: true,
        })
    }    


    const AddAbilities = (unit) => {
        let abilityName,action;
        let abilArray = findObjs({_type: "ability", _characterid: unit.charID});

        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 
        if (unit.type === "Artillery Token") {
            return;
        }

        if (unit.type === "HQ") {
            AddAbility("Activate Formation","!ActivateFormation",unit.charID);
        }
        if (unit.type === "HQ" || unit.type === "Leader" || unit.type === "Support") {
            AddAbility("Attach","!Activate;Attach;@{target|Attach To|token_id}",unit.charID);
        }
        if (unit.type !== "HQ" && unit.type !== "Leader") {
            mode = "";
            if (unit.type === "Helicopter") {
                mode = ";?{Mode|Flying|NOE|Hovering}";
                if (unit.special.includes("Transport")) {
                    mode += "|Landing";
                }
                mode += "}";
            }
            let action = "!Activate;Move" + mode;
            AddAbility("Move",action,unit.charID);
        }
        if (unit.artWeapon !== "") {
            AddAbility("0: Indirect Fire","!Activate;Indirect Fire;",unit.charID);
        }
        if (unit.special.includes("Transport")) {
            AddAbility("Load","!Activate;Load;@{target|Passenger|token_id}",unit.charID);
        }
        if (unit.special.includes("Transport")) {
            AddAbility("Unload","!Activate;Unload",unit.charID);
        }

        if (unit.weapons.length > 0) {
            let macros = [];
            for (let w=0;w<unit.weapons.length;w++) {
                let weapon = unit.weapons[w];
                if (weapon.notes.includes("Indirect")) {
                    continue;
                }
                abilityName = w + ": " + weapon.name;
                action = "!DirectFire;" + unit.id + ";@{target|token_id};" + w;
                AddAbility(abilityName,action,unit.charID);
            }




        }






    }

    const CreateMarker = (hex,type,cost,img,charID) => {
        let c = hex.centre;
        let width,height,deltaLeft,deltaTop,markerName;
        let layer = "map";
        if (type === "Move") {
            cost = Math.round(cost);
            img = getCleanImgSrc(MoveMarkers[cost]);
            width = 25;
            height = 25;
            deltaLeft = 0;
            deltaTop = 50;
            markerName = "Map Marker";
        }  
        if (type === "Artillery") {
            img = "https://files.d20.io/images/435843856/p3gB7BciMn2bAiWi0Gj0dA/thumb.webm?1743879153";
            width = 140;
            height = 140;
            deltaLeft = 0;
            deltaTop = 0;
            markerName = "Artillery Marker"
        }
        if (type === "Smoke") {
            img = "https://files.d20.io/images/196609276/u8gp3vcjYAunqphuw6tgWw/thumb.png?1611938031";
            width = 140;
            height = 140;
            deltaLeft = 0;
            deltaTop = 0;
            markerName = "Smoke";
        }
        if (type === "Dispersed Smoke") {
            img = "https://files.d20.io/images/196609296/i7Z60RNt9RLwdAuC911UBw/thumb.png?1611938037";
            width = 140;
            height = 140;
            deltaLeft = 0;
            deltaTop = 0;
            markerName = "Dispersed Smoke";
        }
        if (type === "Target") {
            width = 70;
            height = 70;
            deltaLeft = 0;
            deltaTop = 0;
            markerName = "Target";
            layer = "objects";
        }

        img = getCleanImgSrc(img);


        let newToken = createObj("graphic", {
            left: c.x + deltaLeft,
            top: c.y + deltaTop,
            width: width,
            height: height, 
            name: markerName,
            pageid: Campaign().get("playerpageid"),
            imgsrc: img,
            layer: layer,
            represents: charID,
        })

        if (newToken) {
            toFront(newToken);
        } 

        return newToken.id;
    }


    const RemoveMoveMarkers = () => {
        let markers = findObjs({_type:"graphic",layer: "foreground", name: "Move Marker"});
        _.each(markers,marker => {
            marker.remove();
        })
    }

    const CreateMoveMarker = (startHex,endHex,cost) => {
        let c1 = endHex.centre;
        let c2 = startHex.centre;
        let x = Math.round((c1.x + c2.x)/2);
        let y = Math.round((c1.y + c2.y)/2);

        let img = getCleanImgSrc(MoveMarkers[cost]);
        let newToken = createObj("graphic", {
            left: x,
            top: y,
            width: 25,
            height: 25, 
            name: "Move Marker",
            pageid: Campaign().get("playerpageid"),
            imgsrc: getCleanImgSrc(MoveMarkers[cost]),
            layer: "foreground",
        })

        if (newToken) {
            toFront(newToken);
            return newToken.id;
        } 
    }


    const MoveHex = (unit,startHex,endHex) => {
        let distance = startHex.Distance(endHex);
        //set below in activation
        let totalMove = parseInt(unit.token.get("bar3_max"));
        let remainingMove = parseInt(unit.token.get("bar3_value"));
        let usedMove = totalMove - remainingMove;
        let moveType = unit.MoveType();
        let moveTypes = ["Infantry","Towed","Vehicle","Helicopter"];
        let transportID = Object.keys(state.WaW85.passengerID).find(key => state.WaW85.passengerID[key] === unit.id);
        if (transportID) {return};
        if (state.WaW85.turn > 0 && moveTypes.includes(unit.type) && endHex.offboard !== true && unit.passUnloaded === false) {
            if (unit.lastHexInfo && unit.lastHexInfo.label === endHex.label && unit.id === state.WaW85.activeUnitID) {
                //moving back 1 hex, reset remainingMove and remove the last movemarker
                unit.token.set("bar3_value",unit.lastHexInfo.remainingMove);
                let mmToken = getObj("graphic",unit.lastHexInfo.markerID);
                if (mmToken) {mmToken.remove()};
            } else if (distance > 1 || remainingMove === 0 || unit.id !== state.WaW85.activeUnitID) {
log("Not Active, Distance > 1 or Remaining move === 0")
                endHex = DeepCopy(startHex);
            } else {
                let cost = endHex.movementCosts[moveType] || 100;
                let dir = startHex.cube.whatDirection(endHex.cube);
                let edge = startHex.edges[dir];
                if (endHex.terrain.includes("Hill") && startHex.terrain.includes("Hill") === false) {
                    cost++;
                }
                if (startHex.road && endHex.road) {
    log("On the Road")
                    cost = 1;
                }
                //rubble here, should override the road cost of 1 above
                if (endHex.rubble.length > 0) {
                    if (moveType === "Troops") {stepHexCost = 2};
                    if (moveType === "Vehicle" || moveType === "Helo NOE") {stepHexCost = 3};            
                }
                if (endHex.smoke.length > 0) {
                    cost = cost++;
                }
                //Rivers then Water
                if (edge === "River") {
    log("River")
                    if (unit.special.includes("Amphibious")) {
                        cost = totalMove;
                    } else {
                        cost = 100;
                    }
                }
                if (endHex.terrain.includes("Water") && unit.special.includes("Amphibious")) {
    log("Water / Amphibious")
                    cost = totalMove;
                } 
                //fire hexes
                if (endHex.fire.length > 0) {
                    cost = 100;
                }

                //Stacking and Enemy issues
                if (endHex.tokenIDs.length > 0 && unit.Stackable() === false) {
                    let unitCount = 0;
                    _.each(endHex.tokenIDs, tokenID => {
                        if (tokenID !== unit.id) {
                            let unit2 = Units[tokenID]
                            if (unit2.player === unit.player && unit2.Stackable() === false) {
                                unitCount++;
                            }
                            if (unit2.player !== unit.player) {
                                //unit with no AP cant go into assault with armour
                                if (unit.apWeapon === false && unit2.armourType === "Heavy") {
                                    unitCount = 100;
                                }
                                //if has no assault value
                                if (unit.assaultFP === 0) {
                                    unitCount = 100;
                                }
                            }
                        }
                    })



                    if (unitCount >= 2) {
                        cost = 100;
                    }

                    


                }

                if ((cost <= remainingMove) || (usedMove === 0 && state.WaW85.weatherLevel === 4 && cost < 100)) {
                    //2nd condition above is if hasnt moved yet in severe weather, can move 1 hex regardless of cost
                    //place a move marker
                    totalCost = cost + usedMove;

                    let mmID = CreateMoveMarker(startHex,endHex,totalCost);
                    //update remaining movement
                    let newMove = Math.max(0,remainingMove - cost);
                    unit.token.set("bar3_value",newMove);
                    unit.lastHexInfo = {
                        label: startHex.label,
                        remainingMove: remainingMove,
                        markerID: mmID,
                    }
                } else {
                    endHex = DeepCopy(startHex);
                }
            }
        }
        unit.passUnloaded = false;
        unit.hexLabel = endHex.label;
        unit.token.set({
            left: endHex.centre.x,
            top: endHex.centre.y,
        })
        ChangeTokenIDs(unit.id,startHex.label,endHex.label);
        unit.MoveAttached();
    }

    const ChangeTokenIDs = (id,startLabel,endLabel) => {
        let startHex = HexMap[startLabel];
        let endHex = HexMap[endLabel]
        let index = startHex.tokenIDs.indexOf(id);
        if (index > -1) {
            startHex.tokenIDs.splice(index,1);
        }
        if (!endHex.tokenIDs.includes(id)) {
            endHex.tokenIDs.push(id);
        }
    }







    const changeGraphic = (tok,prev) => {
        let unit = Units[tok.id];
        let newLabel = new Point(tok.get("left"),tok.get("top")).toCube().label();
        let prevLabel = new Point(prev.left,prev.top).toCube().label();
        if (unit && newLabel !== prevLabel) {
            let newHex = HexMap[newLabel];
            let prevHex = HexMap[prevLabel];
            log(unit.name + " moving")
            MoveHex(unit,prevHex,newHex);
        }



    }



    const destroyGraphic = (tok,prev) => {
        if (tok.get('subtype') === "token") {
            let id = tok.id;
            let unit = Formations[id];
            if (unit) {
                delete Formations[id];
            }
            let pt = new Point(tok.get("left"),tok.get("top"));
            let cube = pt.toCube();
            let label = cube.label();
            let hex = HexMap[label]
            let index = hex.tokenIDs.indexOf(id);
            if (index > -1) {
                hex.tokenIDs.splice(index,1);
            }
        }
    }






    const handleInput = (msg) => {
        if (msg.type !== "api") {
            return;
        }
        let args = msg.content.split(";");
        log(args);
    
        switch(args[0]) {
            case '!Dump':   
                log(pageInfo);
                log("STATE");
                log(state.WaW85);
                log("Units");
                log(Units);
                break;
            case '!ClearState':
                ClearState(msg);
                break;
            case '!TokenInfo':
                TokenInfo(msg);
                break;
            case '!CheckLOS':
                CheckLOS(msg);
                break;
            case '!HexData':
                HexData(msg);
                break;
            case '!UnitInfo':
                UnitInfo(msg);
                break;
            case '!SizeTokens':
                SizeTokens(msg);
                break;

            case '!CreateFormation':
                CreateFormation(msg);
                break;
            case '!CreateFormation2':
                CreateFormation2(msg);
                break;
            case '!ActivateFormation':
                ActivateFormation(msg);
                break;

            case '!ClearMarkers':
                RemoveMoveMarkers();
                break;
            case '!DirectFire':
                DirectFire(msg);
                break;
            case '!Assault':
                Assault(msg);
                break;
            case '!Activate':
                Activate(msg);
                break;
            case '!Test':

                break;

            case '!NextPhase':
                NextPhase();
                break;
            case '!PickScenario':
                PickScenario(msg);
                break;
            case '!Mods':
                Mods(msg);
                break;
            case '!AddToFormation':
                AddToFormation(msg);
                break;
            case '!FFE':
                FFE(msg);
                break;
            case '!ArtCheck':
                ArtCheck(msg);
                break;

        }
    };



    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:graphic',changeGraphic);
        //on('destroy:graphic',destroyGraphic);
    };
    on('ready', () => {
        log("===> World at War 85 <===");
        log("===> Software Version: " + version + " <===")
        LoadPage();
        DefineHexInfo();
        BuildMap();
        registerEventHandlers();
        sendChat("","API Ready at " + new Date().toLocaleTimeString("en-US", {timeZone: "America/Toronto"}) + " EST");
        log("On Ready Done")
    });
    return {
        // Public interface here
    };






})();



