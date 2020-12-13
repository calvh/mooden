"use strict";

$(function () {

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
        // save access token to memory
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

  checkRefreshToken();

  // --------------------  COUNTDOWN TO SILENT REFRESH  -------------------
  
  // todo set logout monitoring function for all

  // todo logout function

  $(document).on("click", "#btn-new-entry", (e) => {
    e.preventDefault();
    $("#form-add-entry").submit();
  });

  $(document).on("submit", "#form-add-entry", (e) => {
    e.preventDefault();

    function addData(chart, data) {
      chart.data.datasets[0].data.push(data);
      moodChart.update();
    }

    const entryDate = moment($("#input-date").val(), "YYYY-MM-DD");
    const mood = parseInt($("#input-mood").val());
    addData(moodChart, { x: entryDate, y: mood });
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

    function addData(chart, data) {
      chart.data.datasets[0].data.push(data);
      moodChart.update();
    }

    let startDate = moment($("#input-sample-start-date").val(), "YYYY-MM-DD");
    const endDate = moment($("#input-sample-end-date").val(), "YYYY-MM-DD");

    if (startDate.isSameOrAfter(endDate)) {
      return;
    }

    let i = 0;
    while (i < 30 || !startDate.isSame(endDate)) {
      addData(moodChart, {
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

  $(document).on("click", "#btn-refresh-token", (e) => {
    e.preventDefault();
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
          // save access token to memory
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

    checkRefreshToken();
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
