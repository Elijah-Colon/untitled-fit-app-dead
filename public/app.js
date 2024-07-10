Vue.createApp({
    data() {
      return {
        page:"Home"
      };
    },
    methods: {
      setPage: function(page){
        this.page = page
      }
    },
    created: function () {
      console.log("app loaded");
    },
  }).mount("#app");