// mixin that contains debugging logic. 
// for semplicity reasons, the wheel re sets to original positions before spinning
const debugMixin = {
  data() {
    return {
      isDebug: false, // start off in random mode
      setSpinTime: 200, // to set the time of a spin 
      debug: {
        reel1: {
          id: 1,
          symbol: null,
          position: null,
        },
        reel2: {
          id: 2,
          symbol: null,
          position: null,
        },
        reel3: {
          id: 3,
          symbol: null,
          position: null,
        },
      }
    }
  },
  methods: {
    setBalanceToZero() {
      // option to set balance to zere to test out alerts
      this.balance = 0
    },
    resetReels() {
      let pictures = document.getElementsByClassName('pic')
      this.winLine = {
        top: false,
        bottom: false,
        center: false
      }
      this.wonBalande = null

      for (let i = 0; i < pictures.length; i++) {
        // check if image contains a class that shows it's position on a reel
        // reset it to default position
        if (pictures[i].classList.contains("one")) {
          pictures[i].style.top = "-25%"
        } else if (pictures[i].classList.contains("two")) {
          pictures[i].style.top = "25%"
        } else if (pictures[i].classList.contains("three")) {
          pictures[i].style.top = "75%"
        } else if (pictures[i].classList.contains("four")) {
          pictures[i].style.top = "125%"
        } else if (pictures[i].classList.contains("five")) {
          pictures[i].style.top = "175%"
        }

      }

    },
    fixedSpin() {
      this.resetReels(); // before starting debugging spin, make sure all reels are in default position
      const d = this.debug // copy to new variable for redability
      const s = this.setSpinTime 

      for (let reel in d) {
        // for each reel setting in debug
        // check what is selected and spin the wheel accordingly to fall onto that position
        // the number passed can be anything, as long as the remain after dividing by 10 reflects the 
        // correct position a.k.a correct minimal number of shift steps to get to that position

        if (d[reel].symbol === BAR && d[reel].position === CENTER) {
          this.spin(d[reel].id, s);

        } else if (
          d[reel].symbol === BAR && d[reel].position === BOTTOM ||
          d[reel].symbol === BAR3 && d[reel].position === TOP) {

          this.spin(d[reel].id, s+1);

        } else if (d[reel].symbol === BAR3 && d[reel].position === CENTER) {
          this.spin(d[reel].id, s+2);

        } else if (
          d[reel].symbol === CHERRY && d[reel].position === TOP ||
          d[reel].symbol === BAR3 && d[reel].position === BOTTOM) {

          this.spin(d[reel].id, s+3);

        } else if (d[reel].symbol === CHERRY && d[reel].position === CENTER) {
          this.spin(d[reel].id, s+4);

        } else if (
          d[reel].symbol === CHERRY && d[reel].position === BOTTOM ||
          d[reel].symbol === SEVEN && d[reel].position === TOP) {

          this.spin(d[reel].id, s+5);

        } else if (d[reel].symbol === SEVEN && d[reel].position === CENTER) {
          this.spin(d[reel].id, s+6);

        } else if (
          d[reel].symbol === SEVEN && d[reel].position === BOTTOM ||
          d[reel].symbol === BAR2 && d[reel].position === TOP) {

          this.spin(d[reel].id, s+7);

        } else if (d[reel].symbol === BAR2 && d[reel].position === CENTER) {

          this.spin(d[reel].id, s+8);

        } else if (
          d[reel].symbol === BAR2 && d[reel].position === BOTTOM ||
          d[reel].symbol === BAR && d[reel].position === TOP) {

          this.spin(d[reel].id, s+9);

        }

      }
    }
  }
}