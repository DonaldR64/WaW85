const WaW85 = (() => {
    const version = '2026.10.7';
    if (!state.WaW85) {state.WaW85 = {}};

    const pageInfo = {};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ","BA","BB","BC","BD","BE","BF","BG","BH","BI"];

    let Units = {};
    let HexMap = {}; 
    let activeUnitID;



    let playerInfo = [];

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

    const playerCodes = {
        "Don": "2520699",
        "DonAlt": "5097409",
        "Ted": "6951960",
        "Vic": "4892",
        "Ian": "4219310",
    }

    const PlayerIDs = () => {
        let players = Object.keys(playerCodes);
        for (let i=0;i<players.length;i++) {
            let roll20ID = playerCodes[players[i]];
            let playerObj = findObjs({_type:'player',_d20userid: roll20ID})[0];
            if (playerObj) {
                let info = {
                    name: players[i],
                    playerID: playerObj.get("id"),
                }
                playerInfo.push(info);
            }
        }
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
        moved: "status_Advantage-or-Up::2006462",
        fired: "status_Shell::5553215",
        oom: "status_interdiction",
        low: "status_yellow", //change to a graphic of missiles ?
        reload: "status_blue",
        landed: "status_green",
        noe: "status_brown",

    }; 


    const TurnMarkers = ["","https://s3.amazonaws.com/files.d20.io/images/361055772/zDURNn_0bbTWmOVrwJc6YQ/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055766/UZPeb6ZiiUImrZoAS58gvQ/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055764/yXwGQcriDAP8FpzxvjqzTg/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055768/7GFjIsnNuIBLrW_p65bjNQ/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055770/2WlTnUslDk0hpwr8zpZIOg/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055771/P9DmGozXmdPuv4SWq6uDvw/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055765/V5oPsriRTHJQ7w3hHRBA3A/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055767/EOXU3ujXJz-NleWX33rcgA/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055769/925-C7XAEcQCOUVN1m1uvQ/thumb.png?1695998303"];


    const UnitMarkers = ["Plus-1d4::2006401","Minus-1d4::2006429","Plus-1d6::2006402","Minus-1d6::2006434","Plus-1d20::2006409","Minus-1d20::2006449","Hot-or-On-Fire-2::2006479","Animal-Form::2006480","Red-Cloak::2006523","A::6001458","B::6001459","C::6001460","D::6001461","E::6001462","F::6001463","G::6001464","H::6001465","I::6001466","J::6001467","L::6001468","M::6001469","O::6001471","P::6001472","Q::6001473","R::6001474","S::6001475"];

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

    const RedFor = ["Soviet","Poland","Syria","Russia"];
    const BlueFor = ["US Army","US Marine Corps","British","West Germany","Canada","Israel","Ukraine"];

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
            
        },

        "Neutral": {
            "image": "",
            "backgroundColour": "#FFFFFF",
            "dice": "UK",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00FF00",
            "borderStyle": "5px ridge",
            "objectiveimage": "https://s3.amazonaws.com/files.d20.io/images/312111244/vPCrjmQ7ep4nvKWu8LOmFQ/thumb.png?1667256328",
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
                "Troops": 1, "Vehicles": 2, "Helo NOE": false, "Helo Flying": 1
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
                "Troops": 1, "Vehicles": 2, "Helo NOE": false, "Helo Flying": 1
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
                "Troops": 1, "Vehicles": 2, "Helo NOE": false, "Helo Flying": 1,
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
                "Troops": 1, "Vehicles": 2, "Helo NOE": false, "Helo Flying": 1,
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
                "Troops": false, "Vehicles": false, "Helo NOE": 1, "Helo Flying": 1,
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
            this.translatedLabel = TranslateLabel(this.offset);
            let edges = {};
            for (let i=0;i<6;i++) {
                edges[DIRECTIONS[i]] = "Open";
            }
            this.edges = edges;
            this.terrain = "Clear";
            this.improved = false; //improved positions
            this.minefield = false; //false, placed or random
            this.wrecks = false; //changed in firing
            this.rubble = false;
            this.fire = false;
            this.height = 0; //height of terrain itself
            this.unitHeight = {
                "Ground": 0,
                "Helo Landed": 0,
                "Helo NOE": 0,
                "Helo Hover": 1,
                "Helo Flying": 2,
                "CAS": 2,    
            }
            this.offboard = (this.translatedLabel === "Offboard") ? true:false;
            this.los = "Normal";
            this.smoke = false;
            this.smokeID = "";
            this.movementCosts = {"Troops": 1, "Vehicles": 1, "Helo NOE": 1, "Helo Flying": 1};
            this.defenseBonus = {"Troops": 0, "Vehicles": 0},
            this.roadIDs = [];
            this.assaultMod = false;

//a function will be needed for player to place imp. positions and minefields, while random imefields are from firing


            HexMap[this.label] = this;
        }


        Distance(b) {
            let dist = this.cube.distance(b.cube);
            return dist;
        }



    }

    class Formation {
        constructor(formationID,name,hqRange,morale) {
            this.id = formationID;
            this.name = name;
            this.hqRange = hqRange;
            this.morale = morale;
            this.unitIDs = [];
            Formations[formationID] = this;
        }
        Add(unitID) {
            if (this.unitIDs.includes(unitID) === false) {
                this.unitIDs.push(unitID);
            }
        }
        Remove(unitID) {
            let index = this.unitIDs.indexOf(unitID);
            if (index > -1) {
                this.unitIDs.splice(index,1);
            }
        }
    }




    class Unit {
        constructor(id) {
            let token = findObjs({_type:"graphic", id: id})[0];
            let charID = token.get("represents");
            let char = getObj("character", charID); 

            let location = new Point(token.get("left"),token.get("top"));
            let hexLabel = location.label();
            let attributes = AttributeArray(char.id);  

            let nation = attributes.nation;
            let player = (RedFor.includes(nation)) ? 0:1;

            let type = attributes.type;
            let group;
            if (type === "Infantry" || type === "Towed" || type === "Vehicle") {
                group = "Ground";
            }
            if (type === "Aircraft" || type === "Helicopter") {
                group = "Air"
            }
            if (type === "HQ" || type === "Leader" || type === "Support") {
                group = "Support"
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
            let artUnit = false;

            let weapons = [];
            for (let i=1;i<4;i++) {
                let equip = attributes["weapon" + i + "equipped"] || "Off";
                let wname = attributes["weapon" + i + "name"];
                if (equip === "Off" || wname === "" || wname === undefined) {continue};
                let wtype = attributes["weapon" + i + "type"] || "AP";
                let wrange = parseInt(attributes["weapon" + i + "range"]);
    
                let wfp = Stats(attributes["weapon" + i + "fp"]);
                let wtoHit = Stats(attributes["weapon" + i + "tohit"]);
                let wnotes = attributes["weapon" + i + "notes"] || " ";
                if (wnotes.includes("Indirect")) {
                    artUnit = true;
                }

                let weapon = {
                    name: wname,
                    type: wtype,
                    range: wrange,
                    fp: wfp, //array
                    toHit: wtoHit, //array
                    notes: wnotes,
                }
                    
                weapons.push(weapon);
            }

log(weapons)
            let special = attributes.special;
//things to special

            let movement = attributes.movement;
            let movementType = attributes.movementType;
            //Ground, Amphiphious etc
            if (movementType !== "Helo" && movementType !== "Flying" && movementType !== "Towed") {
                movement = parseInt(movement);
            }

this.name = char.get("name");

            this.token = token;
            this.type = type;
            this.group = group;
            this.player = player;
            this.nation = nation;

            this.hexLabel = hexLabel; //current location
            this.startHexLabel = hexLabel; //start of turn
            this.latestHexLabel = hexLabel; //last time shot at might update this

            this.armourType = armourType;
            this.armour = armour;
            this.save = save;
            
            this.assaultFP = assaultFP;
            this.assaultToHit = assaultToHit;
            this.assaultDamage = 0;
            this.assaultCB = 0;

            this.artUnit = artUnit;

            this.attachedID = "";//id of unit THIS unit is attached to - HQ, leader etc

            this.weapons = weapons;

            this.move = movement;
            this.movementType = movementType;
            this.action = "";

            this.special = special;

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
        Reduce() {
            this.health = "Reduced";
            //change token image to #2
            outputCard.body.push(this.name + " is Reduced");
//if passengers, roll d6 -> 1-3 nothing, 4-6 passengers reduced + possibly leaders/hq

        }
        Disrupt() {
            this.token.set("tint_color","#ff0000");
            outputCard.body.push(this.name + " is Disrupted");
//disrupt passengers
        }
        Rally() {
            this.token.set("tint_color","transparent");
            //rally any passengers
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
        Status() {
            //returns true if undisrupted
            if (this.token.get("tint_color") === "transparent") {
                return true;
            } else {
                return false;
            }
        }



        Distance(b) {
            return HexMap[this.hexLabel].Distance(HexMap[b.hexLabel]);
        }

        Height() {
            let height;
            let hex = HexMap[this.hexLabel];
            if (this.type === "Aircraft") {
                height = hex.unitHeight["CAS"];
            }
            if (this.group === "Ground") {
                height = hex.unitHeight["Ground"];
            }
            if (this.type === "Helicopter") {
                let heloStatus = this.HeloStatus();
                height = hex.unitHeight[heloStatus];
            }
            return height;
        }

        HeloStatus() {
            let status = "Helo NOE";
            //change this based on ? SM ?

            return status
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


    }


    const TranslateLabel = (offset) => {
        let newLabel;
        if (pageInfo.name === "Map 1") {
            let pt1 = offset.col - 4;
            let pt2 = offset.row;
            if (pt1 < 0 || pt1 > 22 || pt2 < 1 || pt2 > 13) {
                newLabel = "Offboard";
            } else {
                newLabel = rowLabels[pt1] + pt2.toString();
            }
        }
        return newLabel;
    }

    const edgeCrossed= (unit) => {
        let hex = HexMap[unit.hexLabel];
        let prevHex = HexMap[unit.lastHexLabel];
        let direction = prevHex.cube(hex.cube);
        let edge = lastHex.edges[direction];
        return edge;
    }





    const Stats = (str) => {
        let array = [];
        for (let i=0;i<str.length;i++) {
            let a = parseInt(str[i]);
            if (isNaN(a)) {continue};
            array.push(a);
        }
        if (array.length === 1) {array.push(array[0])};
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
            let id = road.get("id");
            let vertices = translatePoly(road);
            for (let i=0;i<(vertices.length-1);i++) {
                let cube1 = vertices[i].toCube();
                let cube2 = vertices[i+1].toCube();
                let interCubes = cube1.linedraw(cube2);
                _.each(interCubes, cube => {
                    if (!HexMap[cube.label()].roadIDs.includes(id)) {
                        HexMap[cube.label()].roadIDs.push(id);
                    }
                })
                if (!HexMap[cube1.label()].roadIDs.includes(id)) {
                    HexMap[cube1.label()].roadIDs.push(id);
                }
                if (!HexMap[cube2.label()].roadIDs.includes(id)) {
                    HexMap[cube2.label()].roadIDs.push(id);
                }
            }
        })
    }



     
    const AddTokens = () => {
        //add tokens on token layer to arrays
        Units = {};
        //create an array of all tokens
        let start = Date.now();
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        });
   
        let s = 0;
        tokens.forEach((token) => {
            let character = getObj("character", token.get("represents"));   
            if (character) {
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
                aura2_color: "transparent",
                aura2_radius: 0,
                showplayers_bar1: true,
                showname: true,
                showplayers_aura1: true,
                bar3_value: 0,
                bar3_max: "",
                bar2_value: 0,
                bar2_max: "",
                bar1_value: 0,
                bar1_max: "",
                gmnotes: "",
                statusmarkers: "",
                tooltip: "",
                rotation: 0,
            });                
        });
    
        state.WaW85 = {
            nations: ["",""],
            playerInfo: ["",""],
            turn: 0,
            phase: "",
            markers: [[],[]],
            weatherLevel: 0,
            squalls: false,
            daytime: true,
            movemarkers: [],
        }
    
        for (let i=0;i<UnitMarkers.length;i++) {
            state.WaW85.markers[0].push(i);
            state.WaW85.markers[1].push(i);
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

    const InLOS = (unit) => {
        //does someone have LOS to this unit
        let los = false;
        let keys = Object.keys(Formations);
        for (let i=0;i<keys.length;i++) {
            let unit2 = Formations[keys[i]];
            if (unit2.player !== unit.player && unit2.offboard === false && unit2.group !== "Aircraft" || unit2.group !== "Artillery") {
                let losResult = LOS(unit2,unit);
                if (losResult.los === true) {
                    los = true;
                    break;
                }
            }
        }
        return los;
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




    const TokenInfo = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        let playerID = msg.playerid;
        let id = msg.selected[0]._id;
        let team = Units[id];
        let hexLabel = team.hexLabel;
        SetupCard(team.name,hexLabel,team.nation);
        let hex = HexMap[hexLabel];
        outputCard.body.push(hex.terrain);
        outputCard.body.push("Elevation: " + hex.elevation)
        PrintCard();
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
        outputCard.body.push("Range: " + losResult.distance);
        if (losResult.los === true) {
            outputCard.body.push("There is LOS to the Target");
            if (losResult.obscured === true) {
                outputCard.body.push("LOS Is Obscured");
            }
        } else {
            outputCard.body.push("No LOS To Target");
            outputCard.body.push("Blocked at " + losResult.losBlocked);
        }


        PrintCard();



    }


    const LOS = (shooter,target) => {
        let shooterHex = HexMap[shooter.hexLabel];
        let targetHex = HexMap[target.hexLabel];
        let distance = shooter.Distance(target);
        let shooterHeight = shooter.Height();
        let targetHeight = target.Height();

        let interCubes = [shooterHex.cube.linedraw(targetHex.cube),shooterHex.cube.linedraw2(targetHex.cube)];
        let interLabels = [interCubes[0].map((e)=> e.label()), interCubes[1].map((e)=> e.label())];
        let len = interLabels[0].length;

log("S: " + shooterHeight)
log("T: " + targetHeight)

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
                if (interHex.smoke !== false || interHex.fire === true) {
log("Smoke")
                    //1 smoke or fire hex, even if hexside, blocks LOS
                    blocked = 2;
                    blockLabel = label;
                    continue;
                }
                if (shooterHeight === targetHeight) {
                    if ((interHex.los === "Blocks" || interHex.rubble === true) && interHex.height > shooterHeight) {
log("Blocking Terrain")
                        blocked++;
                        blockLabel = label;
                        continue;
                    } else if (interHex.los === "Obscures" || interHex.wrecks === true) {
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
        let translatedLabel = hex.translatedLabel || "Undefined";
        SetupCard(label,"","Neutral");
        outputCard.body.push("Translated Label: " + translatedLabel);
        outputCard.body.push("Terrain: " + hex.terrain);
        if (hex.roadIDs.length > 0) {
            outputCard.body.push("Road Present");
        }
        outputCard.body.push("Height of Terrain: " + hex.height);
        outputCard.body.push("LOS: " + hex.los);
        outputCard.body.push("Movement Costs");
        let keys = Object.keys(hex.movementCosts);
        let line = [];
        _.each(keys,key => {
            line.push(key + ": " + hex.movementCosts[key]);
        })
        outputCard.body.push(line.toString());


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

    const AddUnits = (msg) => {
        if (!msg.selected) {return};
        _.each(msg.selected,selected => {
            let id = selected._id;
            let unit = new Unit(id);
            unit.token.set({
                aura1_color: "#00ff00",
                aura1_radius: .5,
                tint_color: "transparent",
                bar1_value: unit.movement,
                bar1_max: unit.movement,
            })


        })
    }


    const DirectFire = (msg) => {
        let Tag = msg.content.split(";");
        let shooterID = Tag[1];
        let targetID = Tag[2];
        let weaponNumber = Tag[3];
        let options = Tag[4];
    
        let shooter = Units[shooterID];
        let shooterHex = HexMap[shooter.hexLabel];
        let target = Units[targetID];

//check if is leader or HQ and if is transfer to appr unit
        if (target.group === "Support") {
            
        }




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
            errorMsg.push("Unit has already activated");
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
    //cant move a unit with no AP into a hex with a unit with AP - so flag that
    //cant move a unit without an assault value or where assault = 0 into a hex (unless is HQ/Leader/Support)
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
    
    const Spot = (spotterUnit) => {
        //make buttons for available artillery
        let available = false;
        let formation = Formations[spotterUnit.formationID];
        _.each(formation.unitIDs,id => {
            let unit = Units[id];
            if (unit.artUnit === true && unit.token.get("aura1_color") !== "#000000" && unit.token.get("tint_color") !== "#FF0000") {
                ButtonInfo(unit.name,"!CreateTarget;" + spotterUnit.id + ";" + unit.id);
                available = true;
            }
        })
        if (available === false) {
            outputCard.body.push("No Available Artillery Units");
        }
        //goes back to Activate
    }


    const CreateTarget = (msg) => {
        //create target icon, with buttons to fire and check los
        let Tag = msg.content.split(";");
        let spotterUnit = Units[Tag[1]];
        let artUnit = Units[Tag[2]];
        let targetTokenID = CreateMarker(HexMap[spotterUnit.hexLabel],"Target");
        //assign to character
        //create abilities - reference the 2 units in the ability to fire
        //in check los need to reference the shooter for range also





    }

    const OnboardIndirect = (msg) => {
        let Tag = msg.content.split(";");
        let spotterUnit = Units[Tag[1]];
        let artUnit = Units[Tag[2]];


        //spotter check if needed



        //mark the artillery unit fired/done, remove the target icon

    }















    const ChangeHex = (team,newHex) => {
        //update tokenIDs and centre token
        let oldHex = HexMap[team.hexLabel];
        let index = oldHex.tokenIDs.indexOf(team.id);
        if (index > -1) {
            oldHex.tokenIDs.splice(index,1);
        }
        if (newHex) {
            team.token.set({
                left: newHex.centre.x,
                top: newHex.centre.y,
            })
            newHex.tokenIDs.push(team.id);
            team.hexLabel = newHex.label;
            team.cube = newHex.cube;
            if (newHex.offboard === true) {
                team.offboard = true;
            }
            if (newHex.offboard === false) {
                team.offboard = false;
            }
        }
    }

    const Activate = (msg) => { 
        let Tag = msg.content.split(";");
        let id = msg.selected[0]._id;
        let action = Tag[1];
        let unit = Units[id];
        let errorMsg = [];
        if (unit.token.get("aura1_color") === "#000000" && unit.action !== "Change Mode" && unit.action !== "Load" && unit.action !== "Unload") {
            errorMsg.push("Unit has already Activated");
        }
//other checks like transport movement here




        SetupCard(unit.name,action,unit.nation);
        if (errorMsg.length > 0) {
            _.each(errorMsg,msg => {
                outputCard.body.push(msg);
            })
            PrintCard();
            return;
        }
        activeUnitID = id;
        if (action === "Move/Fire") {
            if (unit.type !== "Helicopter") {
                outputCard.body.push("Unit has " + movement + " Movement Points");
            }
            ButtonInfo("Show Movement Costs","!MoveInfo;" + unit.id);
        } else if (action === "Spot") {
            Spot(unit);
        } else if (action === "Assault") {
            ButtonInfo("Show Movement Costs","!MoveInfo");
            outputCard.body.push("Unit must be able to move into Enemy's Hex");
        } else if (action === "Change Mode") {
            let newMode = Tag[2];
            HeloMode(unit,newMode);
            outputCard.body.push("The Helicopter changes to " + newMode);
        } else if (action === "Load") {
            //load will be on the infantry or artillery piece


        } else if (action === "Unload") {
            //unload on the transport


        }

        if (action !== "Spot") {
            //Spotting units can activate later, firing unit will have aura changed in indirect fire
            unit.token.set("aura1_color","#000000");
            unit.action = action;
        }
        PrintCard();
    }


    const HeloMode = (unit,note) => {
        if (!note) {
            //is a query as to which mode helo is in


        } else {
            //change mode


        }
    } 

    const MoveInfo = (msg) => {
        let id = msg.content.split(";");
        let unit = Units[id];
        if (unit.type === "Infantry") {
            outputCard.body.push("Roads, Clear, Cultivated, City and Wood Hexes 1 MP");
            outputCard.body.push("Cleared, Rough or Burnt Out Hexes 2 MP");
            outputCard.body.push("Rubble = 2 MP, no Roads");
            outputCard.body.push("Uphill +1 MP");
        } else if (unit.type === "Vehicle") {
            outputCard.body.push("Roads and Clear Hexes 1 MP");
            outputCard.body.push("Cultivated, City and Wood Hexes 2 MP");
            outputCard.body.push("Cleared, Rough or Burnt Out Hexes 3 MP");
            outputCard.body.push("Rubble = 3 MP, no Roads");

            outputCard.body.push("Uphill +1 MP");
            if (unit.movementType === "Amphibious") {
                outputCard.body.push("Water to Water Hex = 1 MP");
                outputCard.body.push("Water to Land or Land to Water = 1/2 total MP");
                outputCard.body.push("(All MP To Cross a River)");
            }
        } else if (unit.type === "Helicopter") {
            let mode = HeloMode(unit);
            if (mode === "Flying") {
                outputCard.body.push("Unlimited MP");
                outputCard.body.push("Cannot fire if moves more than 12 Hexes");
            } else if (mode === "NOE") {
                outputCard.body.push("Unit has 12 MP");
                outputCard.body.push("1 MP per Hex");
            }
        }
        outputCard.body.push("Smoke adds 1 to MP/Hex");

    }



    const AddAbility = (abilityName,action,characterID) => {
        createObj("ability", {
            name: abilityName,
            characterid: characterID,
            action: action,
            istokenaction: true,
        })
    }    


    const AddAbilities = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        let id = msg.selected[0]._id;
        let unit = Formations[id];
        if (!unit) {return};
        let abilityName,action;
        let abilArray = findObjs({_type: "ability", _characterid: team.characterID});

        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 



        sendChat("","Abilities Added")
    }

    const CreateMarker = (hex,type,cost) => {
        let c = hex.centre;
        let img,width,height,deltaLeft,deltaTop,markerName;
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
            img = "";
            width = 60;
            height = 60;
            deltaLeft = 0;
            deltaTop = 0;
            markerName = "Target";
            layer = "objects";
        }




        let newToken = createObj("graphic", {
            left: c.x + deltaLeft,
            top: c.y + deltaTop,
            width: width,
            height: height, 
            name: markerName,
            pageid: Campaign().get("playerpageid"),
            imgsrc: img,
            layer: layer,
        })

        if (newToken) {
            toFront(newToken);
        } 

        return newToken.id;
    }


    const RemoveMoveMarkers = () => {
        let markers = state.WaW85.moveMarkers;
        _.each(markers,marker => {
            let token = getObj("graphic",marker);
            if (token) {token.remove()};
        })
        state.WaW85.moveMarkers = [];
    }

    const CreateMoveMarker = (label,cost,lastLabel) => {
        let hex = HexMap[label];
        let lastHex = HexMap[lastLabel];
        let c1 = hex.centre;
        let c2 = lastHex.centre;
        let x = Math.round((c1.x + c2.x)/2);
        let y = Math.round((c1.y + c2.y)/2);

        let img = getCleanImgSrc(MoveMarkers[cost]);
        let newToken = createObj("graphic", {
            left: x,
            top: y,
            width: 25,
            height: 25, 
            name: "Map Marker",
            pageid: Campaign().get("playerpageid"),
            imgsrc: getCleanImgSrc(MoveMarkers[cost]),
            layer: "map",
        })

        if (newToken) {
            toFront(newToken);
            state.WaW85.moveMarkers.push(newToken.id);
        } 
    }



    const aStar = (unit,goalHex) => {

        RemoveMoveMarkers();

        let startHex = HexMap[unit.startHexLabel];

        let totalDistance = goalHex.Distance(startHex);
        let totalMove = unit.move;
        let remainingMove = parseInt(unit.token.get("bar3_value"));
        let moveType = unit.MoveType();
        if (moveType === "None") {
////????
            sendChat("","No Movement");
            return;
        }
        let nodes = 1;
        let explored = [];
        let frontier = [{
            label: startHex.label,
            cost: 0,
            estimate: totalDistance,
        }]

        while (frontier.length > 0) {
            //sort paths in frontier by cost,lowest cost first
            //choose lowest cost path from the frontier
            //if more than one, choose one with highest cost       
            frontier.sort(function(a,b) {
                return a.estimate - b.estimate || b.cost - a.cost; //2nd part used if estimates are same
            })
            let node = frontier.shift();
            let nodeHex = HexMap[node.label];
            nodes++
            //add this node to explored paths
            explored.push(node);
    //log("Explored")
    //log(explored)
            //if this node reaches goal, end loop
            if (node.label === goalHex.label) {
                break;
            }
    //log("Node: " + node.label);
            //generate possible next steps
            let next = HexMap[node.label].cube.neighbours(); // will be cubes
            //for each possible next step
            for (let i=0;i<next.length;i++) {
                //calculate the cost of the next step 
                //by adding the step's cost to the node's cost
                let stepCube = next[i];
                let stepHexLabel = stepCube.label();
                if (stepHexLabel === undefined) {continue};

    //log("stepHexLabel: " + stepHexLabel);
                let stepHex = HexMap[stepHexLabel];
                if (!stepHex) {continue};
                if (stepHex.offmap === true) {continue};

                let stepHexCost = stepHex.movementCosts[moveType];
                //river, check if crossing, then if river and not amphibious make cost 'false' and if amphibious cost is all remaining movement and totalDistance === 1
                let dir = HexMap[nodeHex].cube.whatDirection(stepCube);
                let edge = nodeHex.edges[dir];
                if (edge === "River") {
                    if (stepHex.label === goalHex.label && unit.special.includes("Amphibious") && stepHexCost !== false) {
                        stepHexCost = remainingMove;
                    } else {
                        stepHexCost = false;
                    }
                }

                if (stepHexCost === false) {continue};

                //road
                if (nodeHex.roadIDs.some(item => stepHex.roadIDs.includes(item))) {
                    stepHexCost = 1; //road connects 2 hexes
                }
                if (stepHex.rubble) {
                    if (moveType === "Troops") {stepHexCost = 2};
                    if (moveType === "Vehicle" || moveType === "Helo NOE") {stepHexCost = 3};
                }

                if (stepHex.terrain.includes("Hill") && nodeHex.terrain.includes("Hill") === false) {
                    stepHexCost++;
                }
                if (stepHex.smoke !== false) {
                    stepHexCost++;
                }


                let cost = stepHexCost + node.cost;
    //log("Cost: " + cost);
                //check if this step has already been explored
                let isExplored = (explored.find(e=> {
                    return e.label === stepHexLabel
                }));
                if (isExplored) {
                    if (cost < isExplored.cost) {
                        let dif = isExplored.cost - cost;
                        isExplored.cost -= dif;
                        isExplored.estimate -= dif;
                    }
                }
                //avoid repeated nodes during the calculation of neighbours
                let isFrontier = (frontier.find(e=> {
                    return e.label === stepHexLabel;
                }));
                if (isFrontier) {
                    if (cost < isFrontier.cost) {
                        let dif = isFrontier.cost - cost;
                        isFrontier.cost -= dif;
                        isFrontier.estimate -= dif;
                    }
                }

                //if this step has not been explored
                if (!isExplored && !isFrontier) {
                    let est = cost + stepHex.Distance(goalHex);
                    //add the step to the frontier, using the cost and distance
                    frontier.push({
                        label: stepHex.label,
                        cost: cost,
                        estimate: est,
                    });
                }
            }
        }
    //log(explored)
        //If there are no paths left to explore or hit target hex
        if (explored.length > 0) {
            array = [];
            results = [];
            explored.sort((a,b) => {
                return b.cost - a.cost;
            })
            let last = explored.shift(); //end hex
            array.push(last);
            let finished = explored.length > 0 ? false:true;

            while (finished === false) {
                let lowestCost = last.cost;
                let current = 0;
                for (let i=0;i<explored.length;i++) {
                    let next = explored[i];
                    if (HexMap[next.label].Distance(HexMap[last.label]) === 1 && next.cost < lowestCost) {
                        lowestCost = next.cost;
                        current = i;
                    }
                }
                last = explored[current];
                explored.splice(current,1);
                array.push(last);
                if (last.label === startHex.label) {
                    finished = true;
                }
            }
            array.reverse();

            //log(array)

            //run through array, stop when reach units movement points (based on move vs sprint etc)
            //place marker showing cost per hex
            //might stop before end
            let prevNodeLabel;
            for (let i=0;i<array.length;i++) {
                let node = array[i];
                if (node.cost > totalMove) {
                    break;
                }
                //place marker showing nodeCost ie. cost for that hex
                if (node.cost > 0) {
                    CreateMoveMarker(node.label,node.cost,prevNodeLabel);
                }
                prevNodeLabel = node.label;
                results.push(node);
            }

            //move unit back to last hex in results
            let lastNode = results[results.length - 1];
            let lastHex = HexMap[lastNode.label];
            unit.token.set({
                left: lastHex.centre.x,
                top: lastHex.centre.y,
            })
            unit.hexLabel = lastHex.label;

        } else {
            sendChat("","No Path");
        }
    }




    const InitializeLocations = () => {
        _.each(Formations,unit => {
            unit.startHexLabel = unit.hexLabel;
            unit.startRotation = Angle(unit.token.get("rotation"));
            let move = {
                hexLabel: unit.hexLabel,
                cost: 0,
                rotation: Angle(unit.token.get("rotation")),
                markerID: "",
            }
            unit.moveArray = [move];
        })
    }


    const changeGraphic = (tok,prev) => {
        let unit = Units[tok.id];
        let newLabel = new Point(tok.get("left"),tok.get("top")).toCube().label();
        let prevLabel = new Point(prev.left,prev.top).toCube().label();
        if (unit && newLabel !== prevLabel) {
            let newHex = HexMap[newLabel];
            log(unit.name + " moving")
//check if can 'fit' in hex, if valid move etc here



            aStar(unit,newHex);
            newLabel = unit.hexLabel;

            let index = HexMap[prevLabel].tokenIDs.indexOf(tok.id);
            if (index > -1) {
                HexMap[prevLabel].tokenIDs.splice(index,1);
                HexMap[newLabel].tokenIDs.push(tok.id);
            }
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
            case '!SizeTokens':
                SizeTokens(msg);
                break;

            case '!AddUnits':
                AddUnits(msg);
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
            case '!MoveInfo':
                MoveInfo(msg);
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



