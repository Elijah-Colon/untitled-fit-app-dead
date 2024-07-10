const URL = "http://localhost:8080";

Vue.createApp({
  data() {
    return {
      workouts: [],
      days: [],
      weeks: [],
    };
  },
  methods: {
    getWorkouts: async function () {
      let response = await fetch(`${URL}/workouts`);

      let data = await response.json();
      this.workouts = data;
      console.log(data);
    },

    getDays: async function () {
      let response = await fetch(`${URL}/days`);

      let data = await response.json();
      this.days = data;
      console.log(data);
    },

    getWeeks: async function () {
      let response = await fetch(`${URL}/weeks`);

      let data = await response.json();
      this.weeks = data;
      console.log(data);
    },
  },
  created: function () {
    console.log("app loaded");
    this.getWorkouts();
    this.getDays();
    this.getWeeks();
  },
}).mount("#app");
