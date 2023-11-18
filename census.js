class TotalHeadCount {
    constructor(data) {
        this.data = data;
    }
    async FetchData() {
        return await fetch(this.data).then(resp => resp.json()).then(data => data.population)
    }

    async compute() {
        const fetch = await this.FetchData()
        const male = fetch.reduce((acc, cur) => (acc + cur.male), 0)
        const female = fetch.reduce((acc, cur) => (acc + cur.female), 0)
        return { male, female, total_male_female: (male + female) }
    }
    QueryDom = element => document.querySelector(element)
    NumberFormat = (num) => new Intl.NumberFormat().format(num)

    async displayTotalStats() {
        const { male, female, total_male_female } = await this.compute()
        this.QueryDom("#maleData").innerHTML = this.NumberFormat(male)
        this.QueryDom("#femaleData").innerHTML = this.NumberFormat(female)
        this.QueryDom("#POPULATION").innerHTML = this.NumberFormat(total_male_female)
    }

    async setupFunction() {
        this.displayTotalStats()
    }
}

new TotalHeadCount("./census.json").setupFunction().then()