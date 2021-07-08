console.log("hi");
const CENSUS_2008 = {
    population: [],
    total_population: 0,
    total_male: 0,
    total_female: [],
    fetchData() {
        fetch("./c-census.json")
            .then(resp => resp.json())
            .then(data => {

                console.log(data.population);
                // this.population = data.population
                data.population.reduce((acc, cur) => console.log(acc + cur.male), 0)


            })
    },
    setupfunction() {
        this.fetchData();
    }

};
CENSUS_2008.setupfunction();