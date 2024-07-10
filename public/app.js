Vue.createApp({
  data() {
    return {
      days: [],
      weeks: [],
      currentPage: "Browse",
      user: {
        name: "",
        email: "",
        password: "",
      },
    };
  },
  methods: {
    setPage: function (page) {
      this.currentPage = page;
    },
  },
  created: function () {
    console.log("app loaded");
  },
}).mount("#app");
