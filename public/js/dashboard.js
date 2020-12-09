"use strict";

$(function () {
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

  function addData(chart, data) {
    chart.data.datasets[0].data.push(data);
    moodChart.update();
  }

  $(document).on("click", "#btn-new-entry", function (e) {
    e.preventDefault();
    $("#form-add-entry").submit();
  });

  $(document).on("submit", "#form-add-entry", function (e) {
    e.preventDefault();

    const entryDate = moment($("#input-date").val(), "YYYY-MM-DD");
    const mood = parseInt($("#input-mood").val());
    addData(moodChart, { x: entryDate, y: mood });
  });

  $(document).on("click", "#btn-add-sample-data", function (e) {
    e.preventDefault();

    if (
      !$("#input-sample-start-date").val() ||
      !$("#input-sample-end-date").val()
    ) {
      return;
    }

    $("#form-add-sample-data").submit();
  });

  $(document).on("submit", "#form-add-sample-data", function (e) {
    e.preventDefault();

    let startDate = moment($("#input-sample-start-date").val(), "YYYY-MM-DD");
    const endDate = moment($("#input-sample-end-date").val(), "YYYY-MM-DD");

    if (startDate.isSameOrAfter(endDate)) {
      return;
    }

    while (!startDate.isSame(endDate)) {
      addData(moodChart, {
        x: startDate.clone(),
        y: Math.floor(Math.random() * 9 + 1),
      });

      startDate.add(1, "d");
    }
  });

  $(document).on("click", "#btn-add-sample-data", function (e) {
    e.preventDefault();
  });

  $(document).on("click", "#btn-clear-data", function (e) {
    e.preventDefault();

    moodChart.data.datasets[0].data = [];
    moodChart.update();
  });
});
