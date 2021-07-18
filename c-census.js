console.log("hi");
const CENSUS_2008 = {
    population: [],
    total_population: 0,
    total_male: 0,
    total_female: [],
    fetchData: function() {
        fetch("./c-census.json")
            .then(resp => resp.json())
            .then(data => {
                this.population = data.population
                this.CalculateTotalPopulation(this.population)
            })
    },
    CalculateTotalPopulation: function(population) {
        this.total_population = population.reduce((acc, cur) => (acc + cur.male + cur.female), 0)
        return this.total_population
    },
    CalculateTotalMale: function() {},
    CalculateTotalFemale: function() {},
    SetupFunctions: function() {
        this.fetchData();
        this.CalculateTotalMale();
        console.log(this.CalculateTotalPopulation.value);
    }

};
CENSUS_2008.SetupFunctions();