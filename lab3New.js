import {MinimizationMcClusky} from "./MinimizationMcClusky.js";

const bin_to_int = (number) => {
    let res = 0
    for (let i = 1; i < number.length; i++) {
        if (number[i] == 1) {
            res += 2 ** (number.length - 1 - i)
        }
    }
    if (number[0] === 1) {
        res *= -1
    }
    return res
}

const bin_to_num = (number) => {
    let ans = 0
    let intPart = []
    let i = 0
    while (number[i] !== '.') {
        intPart.push(number[i])
        i++
    }
    ans = bin_to_int(intPart)
    let degree = -1
    for (let j = number.indexOf('.') + 1; j < number.length; j++) {
        ans += (number[j]) * 2 ** degree;
        degree--;
    }
    return ans;
}

const decodeFormula = (formula) => {
    let arr = formula.split('')
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === '-' && arr[i + 1] === '>') {
            arr[i] = '->'
            arr.splice(i + 1, 1)
        }
        let j = i + 1
        let tmp = ''
        while (!!Number(arr[j])) {
            tmp += arr[j]
            j++
        }

        if (arr[i] !== '(' && arr[i] !== '!' && arr[i] !== '*' && arr[i] !== '+') {
            arr[i] += tmp
            arr.splice(i + 1, tmp.length)
        }
    }
    return arr
}

let getPriority = (operator) => {
    if (operator === '!') {
        return 6
    } else if (operator === '*') {
        return 5
    } else if (operator === '+') {
        return 4
    } else if (operator === '~') {
        return 2
    } else if (operator === '->') {
        return 3
    } else {
        return 1
    }
}

const checkOnSign = (element) => {
    let signs = ['!', '*', '+', '->', '(', ')', '~']
    if (signs.indexOf(element) !== -1) {
        return true
    } else {
        return false
    }
}

const Conjuction = (a, b) => {
    a = Number(a)
    b = Number(b)
    return a && b
}

const Disjuction = (a, b) => {
    a = Number(a)
    b = Number(b)
    return a || b
}

const Invertion = (a) => {
    return Number(!Number(a))
}

const Implication = (a, b) => {
    if (Number(a) && Number(!Number(b))) {
        return false
    } else {
        return true
    }
}

const Equivalence = (a, b) => {
    return a == b
}

const BinaryOperWithoutInversion = (variables, sign) => {
    let a = variables.pop()
    let b = variables.pop()

    if (sign === '*') {
        return Conjuction(a, b)
    } else if (sign === '+') {
        return Disjuction(a, b)
    } else if (sign === '->') {
        return Implication(b, a)
    } else {
        return Equivalence(a, b)
    }
}

const BinaryOperWithInversion = (variables, sign) => {
    if (sign === '!') {
        return Number(Invertion(variables.pop()))
    } else {
        return Number(BinaryOperWithoutInversion(variables, sign))
    }
}

const calculate = (formula, variables, signs) => {
    let stackVariables = []
    let stackSigns = []
    for (let el of formula) {
        if (variables.includes(el)) {
            stackVariables.push(el)
        } else if (el === '(') {
            stackSigns.push(el)
        } else if (el === ')') {
            while (stackSigns[stackSigns.length - 1] !== '(') {
                stackVariables.push(BinaryOperWithInversion(stackVariables, stackSigns.pop()))
            }
            stackSigns.pop()
        } else if (signs.includes(el)) {
            while (stackSigns.length > 0 && getPriority(stackSigns[stackSigns.length - 1]) >= getPriority(el)) {
                stackVariables.push(BinaryOperWithInversion(stackVariables, stackSigns.pop()))
            }
            stackSigns.push(el)
        }
    }
    while (stackSigns.length !== 0) {
        stackVariables.push(BinaryOperWithInversion(stackVariables, stackSigns.pop()))
    }
    return stackVariables.pop()
}

const buildStacks = (stackVariables, stackSigns, decodedFormula) => {
    for (let el of decodedFormula) {
        if (checkOnSign(el)) {
            stackSigns.push(el)
        } else {
            stackVariables.push(el)
        }
    }
    let newSet = new Set(stackVariables) //Создаем множество, для того чтобы каждый элемент встречался ровно 1 раз

    stackVariables = Array.from(newSet)

    return stackVariables
}

function truthTable(n) {
    const rows = 2 ** n;
    const table = [];

    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = n - 1; j >= 0; j--) {
            row.push((i >> j) & 1);
        }
        table.push(row);
    }

    return table;
}

export const buildTable = (n) => {
    const table = truthTable(n);
    return table
}


let buildAnswers = (formula, stackSigns, stackVariables, table) => {
    let answers = []
    for (let row of table) {
        let formulaWithNumbers = replaceVariables(formula, row, stackVariables)
        let ans = calculate(formulaWithNumbers, row.map(el => `${el}`), stackSigns)
        answers.push(ans)
    }
    return answers
}

const replaceVariables = (formula, row, variables) => {
    let ans = formula.slice(0)
    for (let i = 0; i < formula.length; i++) {
        for (let j = 0; j < variables.length; j++) {
            if (ans[i] === variables[j]) {
                ans[i] = `${row[j]}`
            }
        }
    }
    return ans
}

export const showTable = (table, answers, variables) => {
    console.log(variables.join(' '), ' result')
    for (let i = 0; i < table.length; i++) {
        console.log('', table[i].join(' '), '    ' + answers[i])
    }
}

export const buildSKNF = (table, answers, variables) => {
    let answer = ""
    let SKNF = []
    for (let i = 0; i < answers.length; i++) {
        if (answers[i] === 0) {
            let row = []
            answer += " ("
            for (let j = 0; j < table[i].length; j++) {
                if (table[i][j] === 1) {
                    row.push(`!${variables[j]}`)
                    answer += `!${variables[j]}`
                    if (j !== table[i].length - 1) {
                        answer += " \\/ "
                    }
                } else if (table[i][j] === 0) {
                    row.push(variables[j])
                    answer += variables[j]
                    if (j !== table[i].length - 1) {
                        answer += " \\/ "
                    }
                }
            }
            answer += ") /\\"
            SKNF.push(row)
        }
    }
    answer = answer.substring(0, answer.length - 2)
    console.log(answer)
    return [...SKNF]
}

export const buildSDNF = (table, answers, variables) => {
    let answer = ""
    let SDNF = []
    for (let i = 0; i < answers.length; i++) {
        if (answers[i] === 1) {
            let row = []
            answer += " ("
            for (let j = 0; j < table[i].length; j++) {
                if (table[i][j] === 0) {
                    row.push(`!${variables[j]}`)
                    answer += `!${variables[j]}`
                    if (j !== table[i].length - 1) {
                        answer += " /\\ "
                    }
                } else if (table[i][j] === 1) {
                    row.push(variables[j])
                    answer += variables[j]
                    if (j !== table[i].length - 1) {
                        answer += " /\\ "
                    }
                }
            }
            answer += ") \\/"
            SDNF.push(row)
        }
    }
    answer = answer.substring(0, answer.length - 2)
    return [...SDNF]
}

const buildNumForm = (table, answers) => {
    console.log('SKNF:')
    let ans1 = []
    let ans2 = []
    for (let i = 0; i < answers.length; i++) {
        if (!answers[i]) {
            ans1.push(i)
        } else {
            ans2.push(i)
        }
    }
    console.log(ans1.join(', '))
    console.log('------------------------------------------')
    console.log('SDNF:')
    console.log(ans2.join(', '))
}

const buildInt = (answers) => {
    let answersCopy = answers.slice(0)
    answersCopy.unshift(0)
    answersCopy.push('.')
    let ans = bin_to_num(answersCopy)
    console.log(`Index form - ${ans}`)
    return ans
}

const findMinTerms = (SDNF_SKNF) => {
    for(let i = 0; i < SDNF_SKNF.length; i++) {
        for(let j = i + 1; j < SDNF_SKNF.length; j++) {
            if(intersectionArrays(SDNF_SKNF[i], SDNF_SKNF[j])) {

            }
        }
    }
}

const intersectionSDNF = (SDNF) => {
    let intersectionSDNF = []
    for (let i = 0; i < SDNF.length - 1; i++) {
        for (let j = i + 1; j < SDNF.length; j++) {
            let intersection = SDNF[i].filter(x => SDNF[j].includes(x));
            if (intersection.length >= SDNF[0].length - 1) {
                intersectionSDNF.push(intersection)
            }
        }
    }
    return intersectionSDNF
}

const differenceArrays = (arr1, arr2) => {
    let difference = arr1.filter(x => !arr2.includes(x))
    return [...difference]
}

const intersectionArrays = (arr1, arr2) => {
    let diff = 0
    let index = 0
    for(let i = 0; i < arr1.length; i++) {
        if(arr1[i] !== arr2[i]) {
            diff++
            index = i
        }
    }
    if(diff === 1) {
        let newArr = [...arr1]
        newArr[index] = '-'
        return newArr
    }
    return false
}

const symmetricalDofference = (arr1, arr2) => {
    let difference = arr1.filter(x => !arr2.includes(x)).concat(arr2.filter(x => !arr1.includes(x)));
    return [...difference]
}

const checkImplicantsSDNF = (SDNF, copyOfSDNF, TFunc, sknf = false) => {
    let substitutions = []

    let reducedImplicants = minimizationMcClaskySecTerm(SDNF)

    if (reducedImplicants.length !== 0) {
        SDNF = reducedImplicants
    }

    for (let implicant of SDNF) {
        let subctitute = {}
        for (let i = 0; i < implicant.length; i++) {
            if (implicant[i][0] === '!') {
                subctitute[`${implicant[i].substring(1)}`] = 0
            } else {
                subctitute[`${implicant[i]}`] = 1
            }
        }
        substitutions.push(subctitute)
    }
    let answer = reductionImplicants(SDNF, substitutions)
    let buildImplicants = [], indexes = []
    let variables = new Set()
    for (let i = 0; i < SDNF.length; i++) {
        if (answer[i]) {
            buildImplicants.push(SDNF[i])
            continue
        }
        indexes.push(i)
    }
    for (let i = 0; i < buildImplicants.length; i++) {
        for (let variable of buildImplicants[i]) {
            if (variable[0] === '!') {
                variables.add(variable.substring(1))
            } else {
                variables.add(variable.substring(0))
            }
        }
    }
    //let reducedImplicants = reduceImplicants(buildImplicants)
    if (variables.size !== 3) {
        if (indexes.length !== 0) {
            buildImplicants.push(copyOfSDNF[indexes[getRandomInt(indexes.length)]])
        }
    } else {
        if (reducedImplicants.length !== 0) {
            buildImplicants = reducedImplicants
        }
    }
    if (SDNF.length === 1 && copyOfSDNF.length > SDNF.length) {
        buildImplicants.push(copyOfSDNF[1])
    }
    showCarnoMethodRes(TFunc, sknf)
}

const compareArrays = (arr1, arr2) => {
    let count = 0
    for (let i = 0; i < arr2.length; i++) {
        if (arr1[i] === arr2[i]) {
            count++
        }
    }
    let ans = count === arr2.length
    return ans
}

const reduceImplicants = (implicants) => {
    let reducedImplicants = []
    let answer = []
    for (let i = 0; i < implicants.length; i++) {
        for (let j = i + 1; j < implicants.length; j++) {
            let symDiff = symmetricalDofference(implicants[i], implicants[j])
            if (symDiff.length == 2) {
                reducedImplicants.push(symDiff)
            }
        }
    }
    for (let i = 0; i < reducedImplicants.length; i++) {
        if (reducedImplicants[i][0].includes(reducedImplicants[i][1]) || reducedImplicants[i][1].includes(reducedImplicants[i][0])) {
            reducedImplicants.splice(i, 1)
            i--
        }
    }
    for (let i = 0; i < reducedImplicants.length; i++) {
        let count = 0
        for (let j = 0; j < answer.length; j++) {
            if (compareArrays(reducedImplicants[i], answer[j])) {
                break
            } else {
                count++
            }
        }
        if (count === answer.length) {
            answer.push(reducedImplicants[i])
        }
    }
    return answer

}

const showRaschMethodRes = (buildImplicants, implicants, sknf = false) => {
    let str = ""
    if (!sknf) {
        if (buildImplicants.length) {
            for (let i = 0; i < buildImplicants.length; i++) {
                for (let j = 0; j < buildImplicants[i].length; j++) {
                    str += buildImplicants[i][j]
                    if (j !== buildImplicants[i].length - 1) {
                        str += "*"
                    }
                }
                if (i !== buildImplicants.length - 1) {
                    str += " + "
                }
            }
        } else {
            for (let i = 0; i < implicants.length; i++) {
                for (let j = 0; j < implicants[i].length; j++) {
                    str += implicants[i][j]
                    if (j !== implicants[i].length - 1) {
                        str += "*"
                    }
                }
                if (i !== implicants.length - 1) {
                    str += " + "
                }
            }
        }
    } else {
        if (buildImplicants.length) {
            for (let i = 0; i < buildImplicants.length; i++) {
                str += '('
                for (let j = 0; j < buildImplicants[i].length; j++) {
                    str += buildImplicants[i][j]
                    if (j !== buildImplicants[i].length - 1) {
                        str += "+"
                    }
                }
                str += ')'
                if (i !== buildImplicants.length - 1) {
                    str += " * "
                }
            }
        } else {
            for (let i = 0; i < implicants.length; i++) {
                str += '('
                for (let j = 0; j < implicants[i].length; j++) {
                    str += implicants[i][j]
                    if (j !== implicants[i].length - 1) {
                        str += "+"
                    }
                }
                str += ')'
                if (i !== implicants.length - 1) {
                    str += " * "
                }
            }
        }
    }

    console.log(str)
}

function isString(val) {
    return (typeof val === "string" || val instanceof String);
}

const reductionImplicants = (implicants, substitutions) => {
    let ans = []
    for (let i = 0; i < implicants.length; i++) {
        let row = []
        for (let j = 0; j < implicants.length; j++) {
            if (i == j) continue
            let implicant = []
            for (let k = 0; k < implicants[j].length; k++) {
                let keys = Object.keys(substitutions[i])
                for (let l = 0; l < keys.length; l++) {
                    if (k !== l) continue
                    if (implicants[j][k][0] === '!') {
                        if (keys.indexOf(implicants[j][k].substring(1)) !== -1) { //implicants[j][k].substring(1) === keys[k]
                            implicant.push(Number(!substitutions[i][`${implicants[j][k].substring(1)}`]))
                        } else {
                            implicant.push(implicants[j][k])
                        }
                    } else {
                        if (keys.indexOf(implicants[j][k]) !== -1) {
                            implicant.push(substitutions[i][`${implicants[j][k]}`])
                        } else {
                            implicant.push(implicants[j][k])
                        }
                    }
                }
            }
            row.push(implicant)
        }
        ans.push(row)
    }
    for (let row of ans) {
        for (let i = 0; i < row.length; i++) {
            if (row[i].indexOf(0) !== -1) {
                row.splice(i, 1)
                i = -1
            }
        }
    }
    let rowResults = []
    for (let i = 0; i < ans.length; i++) {
        let obj = formKeysObject(ans[i])
        for (let j = 0; j < ans[i].length; j++) {
            for (let el of ans[i][j]) {
                if (isString(el)) {
                    if (el[0] === '!') {
                        obj[`${el.substring(1)}`] -= 1
                    } else {
                        obj[`${el}`] += 1
                    }
                }
            }
        }
        rowResults.push(obj)
    }
    let indexes = []
    let answer = []
    for (let i = 0; i < rowResults.length; i++) {
        let keys = Object.keys(rowResults[i])
        let sch = 0
        for (let j = 0; j < keys.length; j++) {
            sch += rowResults[i][`${keys[j]}`]
        }
        if (sch === 0) {
            answer.push(false)
            indexes.push(i)
        } else {
            answer.push(true)
        }
    }

    return answer
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

const formKeysObject = (arr) => {
    let obj = {}
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (isString(arr[i][j])) {
                if (arr[i][j][0] === '!') {
                    obj[`${arr[i][j].substring(1)}`] = 0
                } else {
                    obj[`${arr[i][j]}`] = 0
                }
            }
        }
    }
    return obj
}


let calculateFormula = (formulaParameter) => {
    let stackVariables = []
    let stackSigns = []
    let variables = []
    let formula = decodeFormula(formulaParameter) //'((1*1)*(1->(!1)))'
    stackVariables = buildStacks(stackVariables, stackSigns, formula)
    variables = stackVariables.slice(0)
    let table = buildTable(stackVariables.length)

    let answers = buildAnswers(formula, stackSigns, stackVariables, table)

    return {table, answers, variables}
}

const buildTwoDemensionTable = (SDNF_SKNF, intersection) => {
    let table = []
    // Fill table
    for (let i = 0; i < SDNF_SKNF.length; i++) {
        let row = []
        for (let j = 0; j < intersection.length; j++) {
            row.push(false)
        }
        table.push(row)
    }
    // Build table
    for (let i = 0; i < SDNF_SKNF.length; i++) {
        for (let j = 0; j < intersection.length; j++) {
            if (differenceArrays(SDNF_SKNF[i], intersection[j]).length === 1) {
                table[i][j] = true
            }
        }
    }
    return [...table]
}

const formObject = (SDNF_SKNF) => {
    let object = {}
    for (let row of SDNF_SKNF) {
        object[`${row}`] = []
    }
    return {...object}
}

const fillObject = (object, SDNF_SKNF, intersection) => {
    let obj = {...object}
    for (let i = 0; i < SDNF_SKNF.length; i++) {
        for (let j = 0; j < intersection.length; j++) {
            if (differenceArrays(SDNF_SKNF[i], intersection[j]).length === 1) {
                obj[`${SDNF_SKNF[i]}`].push(intersection[j])
            }
        }
    }
    return {...obj}
}

const fillObjectMinTerms = (object, SDNF_SKNF, intersection) => {
    let obj = {...object}
    for (let i = 0; i < SDNF_SKNF.length; i++) {
        for (let j = 0; j < intersection.length; j++) {
            if (differenceArrays(SDNF_SKNF[i], intersection[j]).length === 2) {
                obj[`${SDNF_SKNF[i]}`].push(intersection[j])
            }
        }
    }
    return {...obj}
}

const buildObject = (SDNF_SKNF, intersection, minTerm = false) => {
    const object = formObject(SDNF_SKNF)
    let filledObject
    if (minTerm) {
        filledObject = fillObjectMinTerms(object, SDNF_SKNF, intersection)
    } else {
        filledObject = fillObject(object, SDNF_SKNF, intersection)
    }
    return {...filledObject}
}

const minimizeByRaschMethod = (SDNF, SKNF, TDNF, TKNF) => {
    let intersectionOfSDNF = intersectionSDNF(SDNF)
    let copyOfSDNF = [...intersectionOfSDNF]
    if (intersectionOfSDNF.length === 1) {
        for (let i = 0; i < SDNF.length; i++) {
            if (differenceArrays(SDNF[i], intersectionOfSDNF[0]).length === SDNF[i].length) {
                copyOfSDNF.push(SDNF[i])
            }
        }
    }
    checkImplicantsSDNF(intersectionOfSDNF, copyOfSDNF, TDNF)

    let intersectionOfSKNF = intersectionSDNF(SKNF)
    let copyOfSKNF = [...intersectionOfSKNF]
    if (intersectionOfSKNF.length === 1) {
        for (let i = 0; i < SKNF.length; i++) {
            if (differenceArrays(SKNF[i], intersectionOfSKNF[0]).length === SKNF[i].length) {
                copyOfSKNF.push(SKNF[i])
            }
        }
    }
    checkImplicantsSDNF(intersectionOfSKNF, copyOfSKNF, TKNF, true)
}

export const minimizeByMcClasky = (SDNF, SKNF, showSKNF = true) => {
    let intersectionOfSDNF = intersectionSDNF(SDNF)
    let minTermsSDNF = minimizationMcClaskySecTerm(intersectionOfSDNF)

    let objectSDNF = buildObject(SDNF, intersectionOfSDNF);
    if (minTermsSDNF.length !== 0) {
        intersectionOfSDNF = minTermsSDNF
        objectSDNF = buildObject(SDNF, intersectionOfSDNF, true)
    }

    let intersectionOfSKNF = intersectionSDNF(SKNF)
    let minTermsSKNF = minimizationMcClaskySecTerm(intersectionOfSKNF)

    let objectSKNF = buildObject(SKNF, intersectionOfSKNF)

    if (minTermsSKNF.length !== 0) {
        intersectionOfSKNF = minTermsSKNF
        objectSKNF = buildObject(SKNF, intersectionOfSKNF, true)
    }

    let tableSDNF = buildTwoDemensionTable(SDNF, intersectionOfSDNF)
    let tableSKNF = buildTwoDemensionTable(SKNF, intersectionOfSKNF)


    let chosenImplicantsSDNF = buildTNFByMcClasky(objectSDNF)
    let chosenImplicantsSKNF = buildTNFByMcClasky(objectSKNF)
    showRaschMethodRes(chosenImplicantsSDNF, intersectionOfSDNF)
    if(showSKNF) {
        showRaschMethodRes(chosenImplicantsSKNF, intersectionOfSKNF, true)
    }
}

const buildTNFByMcClasky = (object) => {
    let keys = Object.keys(object)
    let chosenImplicants = []
    for (let i = 0; i < keys.length; i++) {
        if (object[keys[i]].length === 1) {
            let sch = 0
            for (let j = 0; j < chosenImplicants.length; j++) {
                if (compareArrays(chosenImplicants[j], object[keys[i]][0])) {
                    continue
                } else {
                    sch++
                }
            }
            if (sch === chosenImplicants.length) {
                chosenImplicants.push(object[keys[i]][0])
            }
        }
    }
    for (let i = 0; i < keys.length; i++) {
        let sch = 0
        for (let j = 0; j < chosenImplicants.length; j++) {
            if (checkArrayIncludeArray(object[keys[i]], chosenImplicants[j])) {
                break
            } else {
                sch++
            }
        }
        if (sch === chosenImplicants.length && object[keys[i]].length > 0) {
            chosenImplicants.push(object[keys[i]][0])
        } else if (sch === chosenImplicants.length && object[keys[i]].length === 0) {

            chosenImplicants.push(keys[i].split(','))
        }
    }
    return chosenImplicants
}

const minimizationMcClaskySecTerm = (intersection) => {
    let newTerms = []
    for (let i = 0; i < intersection.length; i++) {
        for (let j = i + 1; j < intersection.length; j++) {
            if (intersection[i][0] === intersection[j][0]) {
                if (intersection[i][1][0] === '!') {
                    if (intersection[i][1].includes(intersection[j][1])) {
                        newTerms.push(...intersectionSDNF([intersection[i], intersection[j]]))
                    }
                } else {
                    if (intersection[j][1].includes(intersection[i][1])) {
                        newTerms.push(...intersectionSDNF([intersection[i], intersection[j]]))
                    }
                }
            } else if (intersection[i][1] === intersection[j][1]) {
                if (intersection[i][0][0] === '!') {
                    if (intersection[i][0].includes(intersection[j][0])) {
                        newTerms.push(...intersectionSDNF([intersection[i], intersection[j]]))
                    }
                } else {
                    if (intersection[j][0].includes(intersection[i][0])) {
                        newTerms.push(...intersectionSDNF([intersection[i], intersection[j]]))
                    }
                }
            }
        }
    }
    let answer = []
    for (let i = 0; i < newTerms.length; i++) {
        if (!checkArrayIncludeArray(answer, newTerms[i])) {
            answer.push(newTerms[i])
        }
    }
    return answer
}

const checkArrayIncludeArray = (chosenArray, checkedArray) => {
    for (let i = 0; i < chosenArray.length; i++) {
        if (compareArrays(chosenArray[i], checkedArray)) {
            return true
        }
    }
    return false
}

function findGroups(map, numVars, value) {
    // Создаем карту Карно
    let kMap = [];
    for (let i = 0; i < (1 << numVars); i++) {
        let row = [];
        for (let j = 0; j < (1 << numVars); j++) {
            row.push(0);
        }
        kMap.push(row);
    }
    for (let i = 0; i < (1 << numVars); i++) {
        for (let j = 0; j < (1 << numVars); j++) {
            if (map[i][j] === value) {
                kMap[i][j] = 1;
            }
        }
    }

    // Находим группы
    let groups = [];
    for (let size = 1; size <= numVars; size++) {
        for (let i = 0; i < (1 << numVars); i++) {
            for (let j = 0; j < (1 << numVars); j++) {
                if (kMap[i][j] === 1) {
                    let neighbors = getNeighbors(kMap, i, j, size);
                    if (neighbors.length > 0) {
                        neighbors.push([i, j]);
                        groups.push(neighbors);
                        for (let k = 0; k < neighbors.length; k++) {
                            let neighbor = neighbors[k];
                            kMap[neighbor[0]][neighbor[1]] = 0;
                        }
                    }
                }
            }
        }
    }
    return groups;
}

function getNeighbors(kMap, row, col, size) {
    let neighbors = [];
    let numVars = kMap.length;
    if (size === 1) {
        if (kMap[row][col] === 1) {
            neighbors.push([row, col]);
        }
    } else if (size === 2) {
        if (col + 1 < numVars && kMap[row][col] === 1 && kMap[row][col + 1] === 1) {
            neighbors.push([row, col]);
            neighbors.push([row, col + 1]);
        } else if (row + 1 < numVars && kMap[row][col] === 1 && kMap[row + 1][col] === 1) {
            neighbors.push([row, col]);
            neighbors.push([row + 1, col]);
        }
    } else {
        let horizontal = true;
        for (let i = 0; i < size; i++) {
            if (row + i >= numVars || kMap[row + i][col] === 0) {
                horizontal = false;
                break;
            }
        }
        if (horizontal) {
            for (let i = 0; i < size; i++) {
                neighbors.push([row + i, col])
            }
        } else {
            let vertical = true;
            for (let i = 0; i < size; i++) {
                if (col + i >= numVars || kMap[row][col + i] === 0) {
                    vertical = false;
                    break;
                }
            }
            if (vertical) {
                for (let i = 0; i < size; i++) {
                    neighbors.push([row, col + i]);
                }
            }
        }
    }
    return neighbors;
}

const formKMap = (answers, KMap) => {
    for (let i = 0; i < KMap.length; i++) {
        for (let j = 0; j < KMap[i].length; j++) {
            KMap[i][j] = answers[KMap[i][j]]
        }
    }
    return KMap
}

const karnaughMap = (answers, variables, TDNF, TKNF) => {
    let KMap = [[], []]
    KMap[1].push(0)
    KMap[1].push(1)
    KMap[1].push(3)
    KMap[1].push(2)

    KMap[0].push(4)
    KMap[0].push(5)
    KMap[0].push(7)
    KMap[0].push(6)
    let map = formKMap(answers, KMap)
    let groupsSDNF = findGroupsInKMap(map)
    let groupsSKNF = findGroupsInKMap(map, 0)

    let groupsOfVariablesVertical = [1, 0]
    let groupsOfVariablesHorisontal = [[0, 0], [0, 1], [1, 1], [1, 0]]
    let objSDNF = compareVariablesWithGroups(groupsSDNF, groupsOfVariablesVertical, groupsOfVariablesHorisontal, variables, TDNF)
    let objSKNF = compareVariablesWithGroups(groupsSKNF, groupsOfVariablesVertical, groupsOfVariablesHorisontal, variables, TKNF, true)

    let minAnsSDNF = objSDNF.minAns
    let minAnsSKNF = objSKNF.minAns

    showCarnoMethodRes(minAnsSDNF)
    showCarnoMethodRes(minAnsSKNF, true)

    // showRaschMethodRes(minAnsSDNF, implicantsSDNF)
    // showRaschMethodRes(minAnsSKNF, implicantsSKNF, true)
}

let showCarnoMethodRes = (terms, sknf = false) => {
    let term = []
    for(let i = 0; i < terms.length - 1; i++) {
        term = [...terms[i + 1]]
        terms[i + 1] = terms[i]
        terms[i] = term
    }
    let strAns = ""
    if(!sknf) {
        for (let i = 0; i < terms.length; i++) {
            let str = "("
            let tmpStr = ""
            for (let j = 0; j < terms[i].length; j++) {
                tmpStr = terms[i][j].filter(el => el !== '-')
                tmpStr = tmpStr.join('*')
            }
            str += tmpStr
            str += ")"
            strAns += str
            if (i !== terms.length - 1) {
                strAns += " + "
            }
        }
    } else {
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
    }
    console.log(strAns)
}


const findDifferencesBetweenArrays = (arr1, arr2) => {
    let indexes = []
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] === arr2[i]) {
            indexes.push(i)
        }
    }
    return indexes
}

const compareVariablesWithGroups = (groups, groupsOfVariablesVertical, groupsOfVariablesHorisontal, variables, TFunc, sknf = false) => {
    let vertical = [variables[0]] // x1
    let horizontal = [variables[1], variables[2]] // x2 x3
    let variableAns = []

    for (let group of groups) {
        if (group.row.length === 1) {
            let variable = !groupsOfVariablesVertical[group.row[0]] ? '!x1' : 'x1'
            let indexOfDiff = findDifferencesBetweenArrays(groupsOfVariablesHorisontal[group.group[0]], groupsOfVariablesHorisontal[group.group[1]])
            if (indexOfDiff.length === 0) {
                variableAns.push([variable])
                continue
            } else {
                let vars = []
                for (let i = 0; i < indexOfDiff.length; i++) {
                    vars.push(!Number(groupsOfVariablesHorisontal[group.group[0]][indexOfDiff[i]]) ? `!${horizontal[indexOfDiff[i]]}` : `${horizontal[indexOfDiff[i]]}`)
                }
                variableAns.push([variable, ...vars])
            }
        } else if (group.group.length === 1) {
            let firsVar = !Number(groupsOfVariablesHorisontal[group.group[0]][0]) ? `!${horizontal[0]}` : `${horizontal[0]}`
            let secondVar = !Number(groupsOfVariablesHorisontal[group.group[0]][1]) ? `!${horizontal[1]}` : `${horizontal[1]}`

            variableAns.push([firsVar, secondVar])
        } else if (group.group.length > 1 && group.row.length > 1) {
            let indexOfDiff = findDifferencesBetweenArrays(groupsOfVariablesHorisontal[group.group[0]], groupsOfVariablesHorisontal[group.group[1]])
            if (indexOfDiff.length !== 0) {
                let vars = []
                for (let i = 0; i < indexOfDiff.length; i++) {
                    vars.push(!Number(groupsOfVariablesHorisontal[group.group[0]][indexOfDiff[i]]) ? `!${horizontal[indexOfDiff[i]]}` : `${horizontal[indexOfDiff[i]]}`)
                }
                variableAns.push([...vars])
            }
        }
    }
    let ansVariables = new Set()
    sortArrByLengthOfArrs(variableAns)
    let oldVariableAns = [...variableAns]
    if(sknf) {
        for(let i = 0; i < oldVariableAns.length; i++) {
            for(let j = 0; j < oldVariableAns[i].length; j++) {
                if(oldVariableAns[i][j][0] === '!') {
                    oldVariableAns[i][j] = oldVariableAns[i][j].substring(1)
                } else {
                    oldVariableAns[i][j] = `!${oldVariableAns[i][j]}`
                }
            }
        }
        // for(let i = 0; i < minAns.length; i++) {
        //     for(let j = 0; j < minAns[i].length; j++) {
        //         if(minAns[i][j][0] === '!') {
        //             minAns[i][j] = minAns[i][j].substring(1)
        //         } else {
        //             minAns[i][j] = `!${minAns[i][j]}`
        //         }
        //     }
        // }
    }
    let k = 0
    let minAns = []
    while (ansVariables.size !== 3 && k < variableAns.length) {
        let startSize = ansVariables.size
        for (let j = 0; j < variableAns[k].length; j++) {
            if (variableAns[k][j][0] === '!') {
                ansVariables.add(variableAns[k][j].substring(1))
            } else {
                ansVariables.add(variableAns[k][j])
            }
        }
        if (ansVariables.size !== startSize) {
            minAns.push(variableAns[k])
        }
        k++
    }


    return {oldVariableAns, minAns: TFunc}

}

const sortArrByLengthOfArrs = (ansVariables) => {
    for (let i = 0; i < ansVariables.length; i++) {
        for (let j = 0; j < ansVariables.length; j++) {
            if (ansVariables[i].length < ansVariables[j].length) {
                let tmp = ansVariables[i]
                ansVariables[i] = ansVariables[j]
                ansVariables[j] = tmp
            }
        }
    }
}

function selectPowerOfTwoGroups(map) {
    let groups = findGroups(map);
    let result = [];
    for (let i = 0; i < groups.length; i++) {
        let size = groups[i].ones.length + groups[i].zeros.length;
        if (isPowerOfTwo(size)) {
            result.push(groups[i]);
        }
    }
    return result;
}

function isPowerOfTwo(n) {
    if (n === 1) {
        return false
    }
    return (n & (n - 1)) === 0;
}

const findGroupsInKMap = (kMap, compare = 1) => {
    let groups = []
    for (let i = 0; i < kMap.length; i++) {
        for (let j = 0; j < kMap[i].length; j++) {
            if (kMap[i][j] === compare) {
                let k = j + 1
                while (kMap[i][k] === compare) {
                    if (isPowerOfTwo(k - j - 1)) {
                        groups.push({row: [i], group: [j, k], side: false})
                    }
                    k++
                }
            }
            if (kMap[i][j] === compare) {
                let k = i + 1
                if (k > 1) {
                    continue
                }
                while (kMap[k][j] === compare) {
                    if (isPowerOfTwo(k + 1)) {
                        groups.push({row: [i, k], group: [j], side: false})
                    }
                    k++
                    if (k > 1) {
                        break
                    }
                }
            }
        }
    }
    // find squares
    for (let j = 0; j < kMap[0].length; j++) {
        if (kMap[0][j] === compare && kMap[1][j] === compare) {
            let k = j + 1
            while (kMap[0][k] === compare && kMap[1][k] === compare) {
                if (isPowerOfTwo(k - j - 1)) {
                    groups.push({row: [0, 1], group: [j, k], side: false})
                }
                k++
            }
        }
    }
    // find side squares
    if (kMap[0][0] === compare && kMap[0][kMap[0].length - 1] === compare) {
        groups.push({row: [0], group: [0, kMap[0].length - 1], side: true})
    }
    if (kMap[1][0] === compare && kMap[1][kMap[0].length - 1] === compare) {
        groups.push({row: [1], group: [0, kMap[1].length - 1], side: true})
    }
    if (kMap[0][0] === compare && kMap[1][0] === compare && kMap[0][kMap[0].length - 1] === compare && kMap[1][kMap[0].length - 1] === compare) {
        groups.push({row: [0, 1], group: [0, kMap[1].length - 1], side: true})
    }
    return groups
}

const main = () => {
    let {table, answers, variables} = calculateFormula('(x1+x2)*x3'); //((x1+(x2*x3))->(!x1~(!x2))) ((x1+(x2*x3))~((x1+x2)*x3)) !x1*!x2*x3+!x1*x2*!x3+!x1*x2*x3+x1*x2*!x3
    showTable(table, answers, variables)
    let minOBJ = new MinimizationMcClusky()

    let SDNF = buildSDNF(table, answers, variables)
    console.log('----------------------------------------------')
    let SKNF = buildSKNF(table, answers, variables)
    console.log('----------------------------------------------')
    let TDNF = minOBJ.getTerms(SDNF), TKNF = minOBJ.getTerms(SKNF)
    buildNumForm(table, answers)
    console.log('----------------------------------------------')
    buildInt(answers)

    console.log("Расчётный метод")
    minimizeByRaschMethod(SDNF, SKNF, TDNF, TKNF)
    console.log("Квайна маккласки")
    console.log(minOBJ.formStringAns(SDNF))
    console.log(minOBJ.formStringAnsSKNF(SKNF))
    console.log("Карты карно")
    karnaughMap(answers, variables, TDNF, TKNF)
}

main()
