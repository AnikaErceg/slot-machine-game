document.addEventListener("DOMContentLoaded", function () {
  const app = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    mixins: [debugMixin],
    data() {
      return {
        reelPos: 0,
        reelHeight: document.querySelectorAll(".reel")[0].offsetHeight,
        spinCounts: [],
        spinTick: 10,
        stillSpinning: false,
        pics: [
          // NOTE: for demo purposes, array is not shuffled. However, in real world example, if 
          // machine is supposed to earn money, position of elements would have been different;
          // either hardcoded in 3 different arrays, or re ordered each time player loads the game
          { id: BAR3, class: "pic one", src: "pics/3xBAR.png" },
          { id: BAR, class: "pic two", src: "pics/BAR.png" },
          { id: BAR2, class: "pic three", src: "pics/2xBAR.png" },
          { id: SEVEN, class: "pic four", src: "pics/7.png" },
          { id: CHERRY, class: "pic five", src: "pics/Cherry.png" }
        ],
        symbols: [BAR, BAR2, BAR3, SEVEN, CHERRY],
        position: [TOP, CENTER, BOTTOM],
        positionMatrix: [
          [null, null, null],
          [null, null, null],
          [null, null, null]
        ],
        showTable: true,
        addBalance: 0,
        lineTop: true,
        lineCenter: true,
        lineBottom: true,
        balance: 100,
        newBalance: null,
        wonBalance: 0,
        triReelWin: [], // for easier check if triple compo win has happened
        winLine: {
          top:"",
          bottom: "",
          center: ""
        }
      }
    },
    computed: {
      isWin() {
        return this.winLine.top || this.winLine.center || this.winLine.bottom
      }
    },
    methods: {
      getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      },
      updateBalance() {
        if(Number.isInteger(+this.newBalance)) {
          if(+this.newBalance >= 1 && +this.newBalance <= 5000) {
            this.balance = +this.balance + +this.newBalance
            this.newBalance = null 
          }
        }
      },
      randomSpin() {
        if (this.balance > 0) {
          this.balance--;

          // a bit of a workaround for spin time requirement
          const spins = [
            this.getRandom(200, 210), 
            this.getRandom(250, 260),
            this.getRandom(300, 310),
          ]
          
          // sort smaller number to be the first to ensure
          // first reel always stops first
          this.spin(1, spins[0]);
          this.spin(2, spins[1]);
          this.spin(3, spins[2]);
        }
      },
      spin(selector, spinsCount) {
        let pics = document.querySelectorAll(`#reel${selector} .pic`);
        this.stillSpinning = true
        this.triReelWin = []
        this.winLine = {
          top: "",
          bottom: "",
          center: ""
        } // reset win line color
        this.wonBalance += null
        // spinning function
        const self = this;
        let currentSpinsCount = 0;

        // using setInterval to emulate the spinning effect. 
        let anim = setInterval(() => {
          if (currentSpinsCount < spinsCount) {
            // moves the reel one position down by setting top position of element
            for (let i of pics) {
              if (i.offsetTop === self.reelHeight * 1.75) {
                i.style.top = -self.reelHeight * .50 + "px";
                i.style.zIndex = "-2";
              } else {
                i.style.zIndex = "1";
                self.reelPos = i.offsetTop + self.reelHeight * .25;
                i.style.top = self.reelPos + "px";
              }

              // set value in matrix. 
              // if element is either on top or bottom, set middle to null
              // if elemet is in middle, set top and bottom to null
              // setting values like this is useful in case we 
              // want to enable user ability to select how many
              // pay-lines they would like to have. 
              // with this, we could even add vertical and diagonal lines
              // or any other odd line paths which seems common in  
              // modern video-reel machines
              if (i.style.top === "0px") { // set top element
                self.positionMatrix[0][selector - 1] = i.id
                self.positionMatrix[1][selector - 1] = null

              } else if (i.style.top === "172px") { // set bottom element

                self.positionMatrix[2][selector - 1] = i.id
                self.positionMatrix[1][selector - 1] = null

              } else if (i.style.top === "86px") { // set middle element

                self.positionMatrix[1][selector - 1] = i.id

                self.positionMatrix[0][selector - 1] = null
                self.positionMatrix[2][selector - 1] = null

              } 
            }
            currentSpinsCount++;
          } else {
            // save finished spins
            self.spinCounts.push(spinsCount)
            clearInterval(anim);
            this.didSpinFinish()
            currentSpinsCount = 0;
          }
        }, this.spinTick);
      },
      didSpinFinish() {
        // do a win check only when all wheels have finished
        if(this.spinCounts[0] && this.spinCounts[1] && this.spinCounts[2]) {
          this.stillSpinning = false
          this.winCheck()
        }
      },
      winCheckHelper(symbol, row, balance) {
        const m = this.positionMatrix
        if(m[row][0] === symbol && m[row][1] === symbol && m[row][2] === symbol) {
          this.wonBalance += balance
          this.balance = +this.balance + balance

          this.triReelWin.push(symbol)
          if(row === 0) this.winLine.top = symbol
          else if(row === 1) this.winLine.center = symbol
          else if(row === 2) this.winLine.bottom = symbol
        }
      },
      winCheck() {
          const m = this.positionMatrix
          this.wonBalance = 0

          // 3 CHERRY symbols on top line 2000
          this.winCheckHelper(CHERRY, 0, 2000)

          // 3 CHERRY symbols on center line 1000
          this.winCheckHelper(CHERRY, 1, 1000)

          // 3 CHERRY symbols on bottom line 4000
          this.winCheckHelper(CHERRY, 2, 4000)

          // 3 7 symbols on any line 150
          this.winCheckHelper(SEVEN, 0, 150)
          this.winCheckHelper(SEVEN, 1, 150)
          this.winCheckHelper(SEVEN, 2, 150)

          // 3 3xBAR symbols on any line 50
          this.winCheckHelper(BAR3, 0, 50)
          this.winCheckHelper(BAR3, 1, 50)
          this.winCheckHelper(BAR3, 2, 50)

          // 3 2xBAR symbols on any line 20
          this.winCheckHelper(BAR2, 0, 20)
          this.winCheckHelper(BAR2, 1, 20)
          this.winCheckHelper(BAR2, 2, 20)

          // 3 BAR symbols on any line 10
          this.winCheckHelper(BAR, 0, 10)
          this.winCheckHelper(BAR, 1, 10)
          this.winCheckHelper(BAR, 2, 10)

          
          // Any combination of CHERRY and 7 on any line 75
          // first check if there was a triple reel win on any of these
          if(this.triReelWin.indexOf(CHERRY) === -1 &&  this.triReelWin.indexOf(SEVEN) === -1) {
            if (m[0].indexOf(CHERRY) !== -1 && m[0].indexOf(SEVEN) !== -1){
              this.wonBalance += 75
              this.balance = +this.balance + 75
              this.winLine.top = "Cherry7"
            }
            if (m[1].indexOf(CHERRY) !== -1 && m[1].indexOf(SEVEN) !== -1){
              this.wonBalance += 75
              this.balance = +this.balance + 75
              this.winLine.center = "Cherry7"
            }
            if (m[2].indexOf(CHERRY) !== -1 && m[2].indexOf(SEVEN) !== -1) {
              this.wonBalance += 75
              this.balance = +this.balance + 75
              this.winLine.bottom = "Cherry7"
            }
          }

          // Combination of any BAR symbols on any line 5
          // any combination in a sense that all 3 have to be included or is min requirement 2?
          console.log(m[2].join("").split(BAR).length > 2)
          if(this.triReelWin.indexOf(BAR) === -1 && 
            this.triReelWin.indexOf(BAR2) === -1 && 
            this.triReelWin.indexOf(BAR3) === -1) {
            if (m[0].join("").split(BAR).length > 3 ||
                m[1].join("").split(BAR).length > 3 ||
                m[2].join("").split(BAR).length > 3) {

              if (m[0].indexOf(BAR) !== -1 &&
                m[0].indexOf(BAR2) !== -1 &&
                m[0].indexOf(BAR3) !== -1
              ){
                this.wonBalance += 5
                this.balance = +this.balance + 5
                this.winLine.top = "anyBar"
              }

              if (m[1].indexOf(BAR) !== -1 &&
                m[1].indexOf(BAR2) !== -1 &&
                m[1].indexOf(BAR3) !== -1
              ){
                this.wonBalance += 5
                this.balance = +this.balance + 5
                this.winLine.center = "anyBar"
              }

              if (m[2].indexOf(BAR) !== -1 &&
                m[2].indexOf(BAR2) !== -1 &&
                m[2].indexOf(BAR3) !== -1
              ){
                this.wonBalance += 5
                this.balance = +this.balance + 5
                this.winLine.bottom = "anyBar"
              }
          }
        }
          
          this.spinCounts = []

      }
    }
  });

});