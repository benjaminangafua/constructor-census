export default {
    querySelector(element) {
        return document.querySelector(element)
    },
    male() {
        this.querySelector("#maleData")
    },
    female() {
        this.querySelector("#femaleData")

    }

}