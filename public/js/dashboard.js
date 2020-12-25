"use strict";

// page loads
// check refresh token
// no token exists -> redirect to login
// token exists -> send request to server to get jwt (and new refresh token) and store in memory

$(async function () {
  // ---------------------------  ACCESS TOKEN  ---------------------------

  const token = () => {
    let accessToken, accessTokenExpiry;

    const updateToken = async () => {
      try {
        ({ accessToken, accessTokenExpiry } = await getRefreshToken());
        return { accessToken, accessTokenExpiry };
      } catch (err) {
        console.log(err);
        throw err;
      }
    };

    return {
      update: async () => {
        return await updateToken();
      },

      // use this function to access the access token from memory
      value: () => accessToken,

      expiry: () => accessTokenExpiry,
    };
  };

  // ---------------------------  REFRESH TOKEN  --------------------------

  const getRefreshToken = async () => {
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
        // refresh token valid
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

      // to support logging out from all tabs
      window.localStorage.setItem("logout", Date.now());

      if (response.status === 200) {
        // logout success - redirect to homepage
        window.location.replace(response.url);
      } else {
        // something went wrong with logout
        // logout success - redirect to homepage anyway
        window.location.replace(response.url);
        throw new Error(response.statusText);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // to support logging out from all tabs
  const syncLogout = (event) => {
    if (event.key === "logout") {
      // logout detected via storage event
      window.location.replace("/login");
    }
  };

  $(document).on("click", "#btn-logout", (e) => {
    e.preventDefault();
    logout();
  });

  // -----------------------------  GET DATA  -----------------------------
  const getData = async () => {
    try {
      const opts = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt.value()}`,
          "Cache-Control": "no-cache",
        },
      };

      const response = await fetch("/api/data", opts);

      if (response.status === 200) {
        // GET success
        return await response.json();
      } else {
        // GET failed
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
          Authorization: `Bearer ${jwt.value()}`,
        },
        body: JSON.stringify(data),
      };

      const response = await fetch("/api/data", opts);

      if (response.status === 200) {
        // POST success
        return await response.json();
      } else {
        // POST failed
        throw new Error(response.statusText);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ----------------------------  DELETE DATA  ---------------------------

  const deleteData = async () => {
    try {
      const opts = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt.value()}`,
        },
      };

      const response = await fetch("/api/data", opts);

      if (response.status === 200) {
        // PUT success
        return await response.json();
      } else {
        // PUT failed
        throw new Error(response.statusText);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // --------------------------  SILENT REFRESH  --------------------------

  const silentRefresh = async () => {
    if (jwt) {
      jwt = null;
      jwt = token();
      await jwt.update();
    } else {
      jwt = token();
      await jwt.update();
    }
  };

  // -------------------------------  INIT  -------------------------------

  let jwt; // store jwt in memory

  await silentRefresh();

  let silentRefreshIntervalID = setInterval(silentRefresh, 60000); // update access token every 1 minute

  // to support logging out from all tabs
  window.addEventListener("storage", syncLogout);

  // --------------------------  CHART FUNCTIONS  -------------------------
  const addDataToChart = (chart, data) => {
    chart.data.datasets[0].data.push(data);
    chart.update();
  };

  const replaceChartData = (chart, data) => {
    chart.data.datasets[0].data = data;
    chart.update();
  };

  const clearChart = (chart) => {
    chart.data.datasets[0].data = [];
    chart.update();
  };

  // ------------------------------  BUTTONS  -----------------------------

  $(document).on("click", "#btn-new-entry", (e) => {
    e.preventDefault();
    $("#form-add-entry").submit();
  });

  $(document).on("submit", "#form-add-entry", async (e) => {
    e.preventDefault();

    const date = new Date($("#input-date").val());
    const mood = parseInt($("#input-mood").val());

    // send data to server
    const result = await postData({ date, mood });

    if (result) {
      addDataToChart(moodChart, { t: result.date, y: result.mood });
    }
  });

  $(document).on("click", "#btn-refresh", async (e) => {
    // get new data and completely replace data in chart
    e.preventDefault();

    const serverData = await getData();

    const data = serverData.map((datapoint) => {
      return { t: datapoint.date, y: datapoint.mood };
    });

    replaceChartData(moodChart, data);
  });

  $(document).on("click", "#btn-delete-data", async (e) => {
    e.preventDefault();

    const deleteConfirmation = confirm(
      "This will delete all your data. Are you sure?"
    );
    if (deleteConfirmation) {
      const result = await deleteData();
      alert(`${result.deletedCount} record(s) deleted.`);
      moodChart.data.datasets[0].data = [];
      moodChart.update();
    }
  });

  $(document).on("click", "#btn-refresh-token", async (e) => {
    e.preventDefault();
    const result = await getRefreshToken();
    console.log(result);
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

  $(document).on("submit", "#form-add-sample-data", async (e) => {
    e.preventDefault();

    let startDate = new Date($("#input-sample-start-date").val());
    const endDate = new Date($("#input-sample-end-date").val());

    if (startDate >= endDate) {
      alert("Start date must be before end date!");
      return;
    }

    let i = 0;
    while (i < 15 || startDate.getTime() === endDate.getTime()) {
      let mood = Math.floor(Math.random() * 9 + 1);
      let date = new Date(startDate);

      await postData({ date, mood });

      addDataToChart(moodChart, {
        t: date,
        y: mood,
      });

      startDate.setTime(startDate.getTime() + 86400000);
      i++;
    }
  });

  // -------------------------------  CHART  ------------------------------

  const serverData = await getData();

  const datapoints = serverData.map((datapoint) => {
    return { t: datapoint.date, y: datapoint.mood };
  });

  const data = {
    datasets: [
      {
        label: "mood",
        data: datapoints,
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
    legend: {
      display: false,
    },
  };

  const moodChart = new Chart($("#moodChart"), {
    type: "line",
    data,
    options,
  });
});
