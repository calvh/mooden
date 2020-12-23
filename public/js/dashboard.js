"use strict";

// page loads
// check refresh token
// no token exists -> redirect to login
// token exists -> send request to server to get jwt (and new refresh token) and store in memory

$(async function () {
  // ---------------------------  ACCESS TOKEN  ---------------------------

  const accessTokenClosure = () => {
    let accessToken, accessTokenExpiry;

    const getToken = async () => {
      ({ accessToken, accessTokenExpiry } = await checkRefreshToken());
    };

    return {
      getNew: async () => {
        await getToken();
      },

      // use this function to access the access token from memory
      value: () => accessToken,

      expiry: () => accessTokenExpiry,
    };
  };

  // ---------------------------  REFRESH TOKEN  --------------------------

  const checkRefreshToken = async () => {
    try {
      const opts = {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      };

      const response = await fetch("/auth/refresh-token", opts);

      if (response.status === 200) {
        // login success
        return await response.json();
      } else if (response.status === 302) {
        // auth failed (user not found/invalid token)
        // redirect to login
        window.location.replace(response.url);
      } else {
        // other errors
        throw new Error(response.statusText);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ------------------------------  LOGOUT  ------------------------------

  const logout = async () => {
    // remove in-memory token
    jwt = null;

    try {
      const opts = {
        method: "POST",
        credentials: "include",
      };

      const response = await fetch("/auth/logout", opts);

      // to support logging out from all windows
      window.localStorage.setItem("logout", Date.now());

      if (response.status === 200) {
        // logout success - redirect to dashboard
        window.location.replace(response.url);
      } else {
        // something went wrong with logout
        window.location.replace(response.url);
        throw new Error(response.statusText);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // --------------------------  CHART FUNCTIONS  -------------------------
  function addDataToChart(chart, data) {
    chart.data.datasets[0].data.push(data);
    chart.update();
  }

  // -----------------------------  GET DATA  -----------------------------
  const getData = async () => {
    try {
      const opts = {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${jwt.value()}`,
          "Cache-Control": "no-cache",
        },
      };

      const response = await fetch("/api/data", opts);

      if (response.status === 200) {
        // get success
        return await response.json();
      } else {
        // get failed
        console.log(response.status);
        throw new Error(response.statusText);
      }
    } catch (err) {
      console.log(err);
    }
  };
  // -----------------------------  POST DATA  ----------------------------

  const postData = async (data) => {
    try {
      const opts = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${jwt.value()}`,
        },
        body: JSON.stringify(data),
      };

      const response = await fetch("/api/data", opts);

      if (response.status === 200) {
        // post success
        // re render chart
        return response.body;
      } else {
        // post failed
        console.log(response.status);
        throw new Error(response.statusText);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // -------------------------------  INIT  -------------------------------

  let jwt = accessTokenClosure();
  await jwt.getNew(); // get token

  // ------------------------------  BUTTONS  -----------------------------

  $(document).on("click", "#btn-new-entry", (e) => {
    e.preventDefault();
    $("#form-add-entry").submit();
  });

  $(document).on("submit", "#form-add-entry", async (e) => {
    e.preventDefault();

    function addDataToChart(chart, data) {
      chart.data.datasets[0].data.push(data);
      moodChart.update();
    }

    const entryDate = moment($("#input-date").val(), "YYYY-MM-DD");
    const mood = parseInt($("#input-mood").val());

    // send data to server
    const result = await postData({ entryDate, mood });

    addDataToChart(moodChart, { x: result.entryDate, y: result.mood });
  });

  $(document).on("click", "#btn-get-data", async (e) => {
    e.preventDefault();
    const data = await getData();
    console.log(data);
  });

  $(document).on("click", "#btn-add-sample-data", (e) => {
    e.preventDefault();

    if (
      !$("#input-sample-start-date").val() ||
      !$("#input-sample-end-date").val()
    ) {
      return;
    }

    $("#form-add-sample-data").submit();
  });

  $(document).on("submit", "#form-add-sample-data", (e) => {
    e.preventDefault();

    let startDate = moment($("#input-sample-start-date").val(), "YYYY-MM-DD");
    const endDate = moment($("#input-sample-end-date").val(), "YYYY-MM-DD");

    if (startDate.isSameOrAfter(endDate)) {
      return;
    }

    let i = 0;
    while (i < 30 || !startDate.isSame(endDate)) {
      addDataToChart(moodChart, {
        x: startDate.clone(),
        y: Math.floor(Math.random() * 9 + 1),
      });

      startDate.add(1, "d");
      i++;
    }
  });

  $(document).on("click", "#btn-add-sample-data", (e) => {
    e.preventDefault();
  });

  $(document).on("click", "#btn-clear-data", (e) => {
    e.preventDefault();

    moodChart.data.datasets[0].data = [];
    moodChart.update();
  });

  $(document).on("click", "#btn-refresh-token", async (e) => {
    e.preventDefault();
    const result = await checkRefreshToken();
    console.log(result);
  });

  $(document).on("click", "#btn-logout", (e) => {
    e.preventDefault();
    logout();
  });

  // -------------------------------  CHART  ------------------------------

  document.querySelector("#input-date").valueAsDate = new Date();
  const data = {
    datasets: [
      {
        label: "mood",
        data: [],
        fill: false,
        borderColor: "#3e95cd",
      },
    ],
  };

  const options = {
    scales: {
      xAxes: [
        {
          type: "time",
          time: {
            unit: "day",
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            precision: 0,
            min: 0,
            max: 10,
          },
        },
      ],
    },
    elements: {
      line: {
        tension: 0,
      },
    },
  };

  const moodChart = new Chart($("#moodChart"), {
    type: "line",
    data,
    options,
  });
});
