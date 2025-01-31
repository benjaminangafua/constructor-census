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

class PopulationByCounty extends TotalHeadCount {
  constructor(data) {
    super(data);
  }
  async displayCounties() {
    const Vals = await this.FetchData();
    console.log(Vals);
  }
}
new PopulationByCounty("./census.json").displayCounties().then();
new TotalHeadCount("./census.json").setupFunction().then();

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

  async DisplayCountyBarChart() {
    new Chart(document.getElementById("county-chart"), {
      type: "bar",
      data: {
        labels: await this.GetCountiesWithoutDuplicate(),
        datasets: [
          {
            label: "Population Per County",
            backgroundColor: "#519872",
            data: await this.PopulationPerCounty(), //data for labels (1st label)
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
}

new GeneralInheritance("./census.json").DisplayCountyBarChart().then();
