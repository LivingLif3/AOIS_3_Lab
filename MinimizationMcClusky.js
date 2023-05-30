export class MinimizationMcClusky {
    calculateMinTerms(SDNF_SKNF) {
        let copyOfSDNF_SKNF = this.copySDNF_SKNF(SDNF_SKNF)

        let singleParts = []
        while (this.countVars(copyOfSDNF_SKNF[0]) > 1) {
            let parts = []
            for (let i = 0; i < copyOfSDNF_SKNF.length; i++) {
                this.check(i, parts, copyOfSDNF_SKNF, singleParts)
            }
            copyOfSDNF_SKNF = parts
            if (parts.length === 0) {
                break;
            }
        }
        let result = []
        for (let i = 0; i < copyOfSDNF_SKNF.length; i++) {
            if (!this.isEqual(result, copyOfSDNF_SKNF[i])) {
                result.push(copyOfSDNF_SKNF[i])
            }
        }
        for (let i = 0; i < singleParts.length; i++) {
            result.push(singleParts[i])
        }
        return result
    }

    countVars(term) {
        let sch = 0
        for (let variable of term) {
            if (variable !== "-") {
                sch++
            }
        }
        return sch
    }

    copySDNF_SKNF(SDNF_SKNF) {
        let copy = []
        for (let i = 0; i < SDNF_SKNF.length; i++) {
            copy.push([...SDNF_SKNF[i]])
        }
        return copy
    }

    isEqual(result, partOfSDNF) {
        let check
        if (result.length === 0) {
            return false
        }
        for (let i = 0; i < result.length; i++) {
            check = true
            for (let j = 0; j < result[i].length; j++) {
                if (result[i][j] !== partOfSDNF[j]) {
                    check = false
                }
            }
            if (check) {
                return true
            }
        }
        return false
    }

    check(index, result, reduceParts, singleParts) {
        let hasNeighbours = false
        for (let i = 0; i < reduceParts.length; i++) {
            if (this.comparing(reduceParts[index], reduceParts[i]) && index !== i) {
                let reducedCombination = []
                for (let variable of reduceParts[index]) {
                    if (reduceParts[i].includes(variable)) {
                        reducedCombination.push(variable)
                    } else {
                        reducedCombination.push('-')
                    }
                }
                if (this.countVars(reducedCombination) === this.countVars(reduceParts[index]) - 1) {
                    if (!this.isEqual(result, reducedCombination)) {
                        result.push(reducedCombination)
                    }
                    hasNeighbours = true
                }
            }
        }
        if (!hasNeighbours && !this.isEqual(singleParts, reduceParts[index])) {
            singleParts.push(reduceParts[index])
        }
    }

    comparing(firstTerm, secondTerm) {
        let count = 0
        for (let i = 0; i < firstTerm.length; i++) {
            if (firstTerm[i] === secondTerm[i]) {
            } else if (!firstTerm[i].includes(secondTerm[i]) && !secondTerm[i].includes(firstTerm[i])) {
                return false
            } else {
                count++
                if (count > 1) {
                    return false
                }
            }
        }
        return true
    }

    buildQuineTable(SDNF_SKNF) {
        let table = []
        let reducedTerms = this.calculateMinTerms(SDNF_SKNF)
        let fullTerms = this.copySDNF_SKNF(SDNF_SKNF)
        for (let i = 0; i < reducedTerms.length; i++) {
            let tableRow = []
            for (let j = 0; j < fullTerms.length; j++) {
                tableRow.push(this.isContain(reducedTerms[i], fullTerms[j]))
            }
            table.push(tableRow)
        }
        return table
    }

    isContain(reducedTerms, fullTerms) {
        for (let i = 0; i < fullTerms.length; i++) {
            if (reducedTerms[i] !== fullTerms[i] && reducedTerms[i] !== '-') {
                return false
            }
        }
        return true
    }


    getTerms(SDNF_SKNF) {
        let coreTerms = []
        let table = this.buildQuineTable(SDNF_SKNF)
        let reducedTerms = this.calculateMinTerms(SDNF_SKNF)
        for (let i = 0; i < table[0].length; i++) {
            let countOfTruth = 0, truthIndex = 0
            for (let j = 0; j < table.length; j++) {
                if (table[j][i]) {
                    countOfTruth++
                    truthIndex = j
                }
            }
            if (countOfTruth === 1 && !this.isEqual(coreTerms, reducedTerms[truthIndex])) {
                coreTerms.push([reducedTerms[truthIndex]])
            }
        }
        return this.minimizeCoreTerms(coreTerms)
    }

    getStringSDNF(SDNF_SKNF) {
        let terms = this.getTerms(SDNF_SKNF)
        let strTerms = []
        // for(let i = 0; i < terms.length; i++) {
        //     let strTerm = "("
        //
        // }
    }

    minimizeCoreTerms(coreTerms) {
        let minimizedCoreTerms = []
        for (let term of coreTerms) {
            if (!this.checkArrayIncludeArray(minimizedCoreTerms, term)) {
                minimizedCoreTerms.push(term)
            }
        }
        return minimizedCoreTerms
    }

    checkArrayIncludeArray(chosenArray, checkedArray) {
        for (let i = 0; i < chosenArray.length; i++) {
            if (this.compareArrays(chosenArray[i], checkedArray)) {
                return true
            }
        }
        return false
    }

    compareArrays(arr1, arr2) {
        let count = 0
        for (let i = 0; i < arr2.length; i++) {
            if (arr1[i] === arr2[i]) {
                count++
            }
        }
        let ans = count === arr2.length
        return ans
    }

    formStringAns(SDNF) {
        let terms = this.getTerms(SDNF)
        let strAns = ""
        for (let i = 0; i < terms.length; i++) {
            let str = ""
            for (let j = 0; j < terms[i].length; j++) {
                str = terms[i][j].filter(el => el !== '-')
                str = str.join('*')
            }
            strAns += str
            if (i !== terms.length - 1) {
                strAns += " + "
            }
        }
        return strAns
    }

    formStringAnsSKNF(SKNF) {
        let terms = this.getTerms(SKNF)
        let strAns = ""
        for (let i = 0; i < terms.length; i++) {
            let str = "("
            let tmpStr = ""
            for (let j = 0; j < terms[i].length; j++) {
                tmpStr = terms[i][j].filter(el => el !== '-')
                tmpStr = tmpStr.join('+')
            }
            str += tmpStr
            str += ")"
            strAns += str
            if (i !== terms.length - 1) {
                strAns += " * "
            }
        }
        return strAns
    }

    printSDNF_SKNF(SDNF_SKNF) {
        let strTerms = this.getStringSDNF(SDNF_SKNF)
    }
}
