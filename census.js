class TotalHeadCount {
  constructor(data) {
    this.data = data;
  }
  QueryDom = (element) => document.querySelector(element);
  NumberFormat = (num) => new Intl.NumberFormat().format(num);
  async FetchData() {
    return await fetch(this.data)
      .then((resp) => resp.json())
      .then((data) => data.population);
  }
  async compute() {
    const fetch = await this.FetchData();
    const male = fetch.reduce((acc, cur) => acc + cur.male, 0);
    const female = fetch.reduce((acc, cur) => acc + cur.female, 0);
    return { male, female, total_male_female: male + female };
  }
  MaleFemaleDoughnutChart(male, female) {
    new Chart(document.getElementById("doughnut-chart"), {
      type: "doughnut",
      data: {
        labels: ["MALE", "FEMALE"],
        datasets: [
          {
            label: "Gender",
            data: [male, female],
            backgroundColor: ["#B1D2C2", "#F0F2EF"],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            borderRadius: 6,
            labels: {
              usePointStyle: true,
              color: "#B1D2C2",
            },
          },
        },
        aspectRatio: 1.5,
      },
    });
  }
  async displayTotalStats() {
    const { male, female, total_male_female } = await this.compute();
    this.MaleFemaleDoughnutChart(male, female);
    this.QueryDom("#maleData").innerHTML = this.NumberFormat(male);
    this.QueryDom("#femaleData").innerHTML = this.NumberFormat(female);
    this.QueryDom("#POPULATION").innerHTML =
      this.NumberFormat(total_male_female);
  }
  async setupFunction() {
    this.displayTotalStats();
  }
}

class GeneralInheritance extends TotalHeadCount {
  constructor(data) {
    super(data);
  }
  async GetCountiesWithoutDuplicate() {
    const FetchData = await this.FetchData();
    const eachCounty = FetchData.reduce((acc, value) => {
      if (acc.indexOf(value.county) === -1) {
        acc.push(value.county);
      }
      return acc;
    }, []);

    return eachCounty;
  }

  async PopulationPerCounty() {
    const FetchData = await this.FetchData();

    const population_per_county = FetchData.reduce(
      (a, c) => ((a[c.county] = (a[c.county] || 0) + c.male + c.female), a),
      {}
    );
    return population_per_county;
  }
}

class PopulationByCounty extends GeneralInheritance {
  constructor(data) {
    super(data);
  }
  async DisplayCountyBarChart() {
    new Chart(document.getElementById("county-chart"), {
      type: "bar",
      data: {
        labels: await this.GetCountiesWithoutDuplicate(),
        datasets: [
          {
            label: "Population Per County",
            backgroundColor: "#519872",
            data: await this.PopulationPerCounty(),
            borderRadius: 5,
            width: 1,
            barThickness: 15,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: true,
          },
        },
        maintainAspectRatio: false,
      },
    });
  }
  async displayCounties() {
    const Vals = await this.FetchData();
    console.log(Vals);
  }
}

class CountiesDropdown extends GeneralInheritance {
  constructor(data) {
    super(data);
    this.Option = this.QueryDom("#county-districts-selection");
  }
  async LoadDropdownOfCounties() {
    const County = await this.GetCountiesWithoutDuplicate();

    const LoadedCounties = County.forEach((county) => {
      this.Option.insertAdjacentHTML(
        "beforeend",
        `<option value="${county}">${county}</option>`
      );
    });

    return LoadedCounties;
  }

  SelectCounty(callback) {
    this.QueryDom("#county-districts-selection").onchange = async (event) => {
      const FetchData = await this.FetchData();

      const districts_name = [];
      const district_male = [];
      const district_female = [];

      FetchData.forEach((ele) => {
        if (ele.county === event.target.value) {
          districts_name.push(ele.district);
          district_male.push(ele.male);
          district_female.push(ele.female);
        }
      });
      callback([districts_name, district_male, district_female]);
    };
  }
}

class PopulationByDistrict extends CountiesDropdown {
  constructor(data) {
    super(data);
  }
  async DisplayDistricts() {
    const ctx = document.getElementById("district").getContext("2d");

    // Load dropdown options first
    await this.LoadDropdownOfCounties();
    const dropdown = this.QueryDom("#county-districts-selection");

    if (!dropdown.options.length) {
      alert("No counties available.");
      return;
    }

    const defaultCounty = [...dropdown.options].find(
      (opt) => !opt.disabled && opt.value.trim() !== ""
    )?.value;

    if (!defaultCounty) {
      alert("No valid county available.");
      return;
    }

    dropdown.value = defaultCounty; // Set as selected

    // Fetch data and filter for selected county
    const FetchData = await this.FetchData();
    const CountiesDetail = FetchData.reduce(
      (result, ele) => {
        if (ele.county === defaultCounty) {
          result[0].push(ele.district);
          result[1].push(ele.male);
          result[2].push(ele.female);
        }
        return result;
      },
      [[], [], []]
    );

    // If no valid data, show alert
    if (!CountiesDetail[0].length) {
      alert("No valid data for the selected county.");
      return;
    }

    // Function to update the chart
    const updateChart = (data) => {
      if (window.chart) window.chart.destroy();
      window.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: data[0],
          datasets: [
            {
              label: "Male",
              backgroundColor: "#D3D3D3",
              data: data[1],
              borderRadius: 5,
              width: 1,
              barThickness: 15,
            },
            {
              label: "Female",
              backgroundColor: "#519872",
              data: data[2],
              borderRadius: 5,
              width: 1,
              barThickness: 15,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    };

    // Show default chart
    updateChart(CountiesDetail);

    // Handle dropdown change
    dropdown.onchange = async (event) => {
      const selectedCounty = event.target.value;
      const newDetail = FetchData.reduce(
        (res, ele) => {
          if (ele.county === selectedCounty) {
            res[0].push(ele.district);
            res[1].push(ele.male);
            res[2].push(ele.female);
          }
          return res;
        },
        [[], [], []]
      );
      updateChart(newDetail);
    };
  }
}

new TotalHeadCount("./census.json").setupFunction().then();
new PopulationByCounty("./census.json").DisplayCountyBarChart().then();

new CountiesDropdown("./census.json").SelectCounty();

new CountiesDropdown("./census.json").LoadDropdownOfCounties().then();
new PopulationByDistrict("./census.json").DisplayDistricts().then();
