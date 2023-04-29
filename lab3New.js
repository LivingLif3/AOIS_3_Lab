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

const buildTable = (n) => {
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

const showTable = (table, answers, variables) => {
    console.log(variables.join(' '), ' result')
    for (let i = 0; i < table.length; i++) {
        console.log('', table[i].join(' '), '    ' + answers[i])
    }
}

const buildSKNF = (table, answers, variables) => {
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

const buildSDNF = (table, answers, variables) => {
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
    console.log(answer)
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

const symmetricalDofference =(arr1, arr2) => {
    let difference = arr1.filter(x => !arr2.includes(x)).concat(arr2.filter(x => !arr1.includes(x)));
    return [...difference]
}

const checkImplicantsSDNF = (SDNF, copyOfSDNF, sknf = false) => {
    let substitutions = []

    let reducedImplicants = minimizationMcClaskySecTerm(SDNF)

    if(reducedImplicants.length !== 0) {
        SDNF = reducedImplicants
    }
    console.log(SDNF, "SDNF")

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
    for(let i = 0; i < SDNF.length; i++) {
        if(answer[i]) {
            buildImplicants.push(SDNF[i])
            continue
        }
        indexes.push(i)
    }
    for(let i = 0; i < buildImplicants.length; i++) {
        for(let variable of buildImplicants[i]) {
            if(variable[0] === '!') {
                variables.add(variable.substring(1))
            } else {
                variables.add(variable.substring(0))
            }
        }
    }
    //let reducedImplicants = reduceImplicants(buildImplicants)
    if(variables.size !== 3) {
        console.log(variables, 'VARIABLES')
        console.log(indexes, "DSA&!@@!2")
        if(indexes.length !== 0) {
            buildImplicants.push(copyOfSDNF[indexes[getRandomInt(indexes.length)]])
        }
    } else {
        if(reducedImplicants.length !== 0) {
            buildImplicants = reducedImplicants
        }
    }
    if(SDNF.length === 1 && copyOfSDNF.length > SDNF.length) {
        buildImplicants.push(copyOfSDNF[1])
    }
    showRaschMethodRes(buildImplicants, SDNF, sknf)
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
    for(let i = 0; i < implicants.length; i++) {
        for(let j = i + 1; j < implicants.length; j++) {
            let symDiff = symmetricalDofference(implicants[i], implicants[j])
            if(symDiff.length == 2) {
                reducedImplicants.push(symDiff)
            }
        }
    }
    for(let i = 0; i < reducedImplicants.length; i++) {
        if(reducedImplicants[i][0].includes(reducedImplicants[i][1]) || reducedImplicants[i][1].includes(reducedImplicants[i][0])) {
            reducedImplicants.splice(i, 1)
            i--
        }
    }
    for(let i = 0; i < reducedImplicants.length; i++) {
        let count = 0
        for(let j = 0; j < answer.length; j++) {
            if(compareArrays(reducedImplicants[i], answer[j])) {
                break
            } else {
                count++
            }
        }
        if(count === answer.length) {
            answer.push(reducedImplicants[i])
        }
    }
    return answer

}

const showRaschMethodRes = (buildImplicants, implicants, sknf = false) => {
    console.log(buildImplicants, "SFAFKA)W")
    let str = ""
    if(!sknf) {
        if(buildImplicants.length) {
            for(let i = 0; i < buildImplicants.length; i++) {
                for(let j = 0; j < buildImplicants[i].length; j++) {
                    str += buildImplicants[i][j]
                    if(j !== buildImplicants[i].length - 1) {
                        str += "*"
                    }
                }
                if(i !== buildImplicants.length - 1) {
                    str += " + "
                }
            }
        } else {
            for(let i = 0; i < implicants.length; i++) {
                for(let j = 0; j < implicants[i].length; j++) {
                    str += implicants[i][j]
                    if(j !== implicants[i].length - 1) {
                        str += "*"
                    }
                }
                if(i !== implicants.length - 1) {
                    str += " + "
                }
            }
        }
    } else {
        if(buildImplicants.length) {
            for(let i = 0; i < buildImplicants.length; i++) {
                str += '('
                for(let j = 0; j < buildImplicants[i].length; j++) {
                    str += buildImplicants[i][j]
                    if(j !== buildImplicants[i].length - 1) {
                        str += "+"
                    }
                }
                str += ')'
                if(i !== buildImplicants.length - 1) {
                    str += " * "
                }
            }
        } else {
            for(let i = 0; i < implicants.length; i++) {
                str += '('
                for(let j = 0; j < implicants[i].length; j++) {
                    str += implicants[i][j]
                    if(j !== implicants[i].length - 1) {
                        str += "+"
                    }
                }
                str += ')'
                if(i !== implicants.length - 1) {
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
    console.log(implicants, substitutions, "implicants || substitutions")
    for (let i = 0; i < implicants.length; i++) {
        let row = []
        for(let j = 0; j < implicants.length; j++) {
            if( i == j) continue
            let implicant = []
            for (let k = 0; k < implicants[j].length; k++) {
                let keys = Object.keys(substitutions[i])
                for (let l = 0; l < keys.length; l++) {
                    if(k !== l) continue
                    if(implicants[j][k][0] === '!') {
                        if(keys.indexOf(implicants[j][k].substring(1)) !== -1) { //implicants[j][k].substring(1) === keys[k]
                            implicant.push(Number(!substitutions[i][`${implicants[j][k].substring(1)}`]))
                        } else {
                            implicant.push(implicants[j][k])
                        }
                    } else {
                        if(keys.indexOf(implicants[j][k]) !== -1) {
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
    for(let row of ans) {
        for(let i = 0; i < row.length; i++) {
            if(row[i].indexOf(0) !== -1) {
                row.splice(i, 1)
                i = -1
            }
        }
    }
    let rowResults = []
    for(let i = 0; i < ans.length; i++) {
        let obj = formKeysObject(ans[i])
        for(let j = 0; j < ans[i].length; j++) {
            for(let el of ans[i][j]) {
                if(isString(el)) {
                    if(el[0] === '!') {
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
    for(let i = 0; i < rowResults.length; i++) {
        let keys = Object.keys(rowResults[i])
        let sch = 0
        for(let j = 0; j < keys.length; j++) {
            sch += rowResults[i][`${keys[j]}`]
        }
        if(sch === 0) {
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
    for(let i = 0; i < arr.length; i++) {
        for(let j = 0; j < arr[i].length; j++) {
            if(isString(arr[i][j])) {
                if(arr[i][j][0] === '!') {
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
    for(let i = 0; i < SDNF_SKNF.length; i++) {
        let row = []
        for(let j = 0; j < intersection.length; j++) {
            row.push(false)
        }
        table.push(row)
    }
    // Build table
    for(let i = 0; i < SDNF_SKNF.length; i++) {
        for(let j = 0; j < intersection.length; j++) {
            if(differenceArrays(SDNF_SKNF[i], intersection[j]).length === 1) {
                table[i][j] = true
            }
        }
    }
    return [...table]
}

const formObject = (SDNF_SKNF) => {
    let object = {}
    for(let row of SDNF_SKNF) {
        object[`${row}`] = []
    }
    return {...object}
}

const fillObject = (object, SDNF_SKNF, intersection) => {
    let obj = {...object}
    for(let i = 0; i < SDNF_SKNF.length; i++) {
        for(let j = 0; j < intersection.length; j++) {
            if(differenceArrays(SDNF_SKNF[i], intersection[j]).length === 1) {
                obj[`${SDNF_SKNF[i]}`].push(intersection[j])
            }
        }
    }
    return {...obj}
}

const fillObjectMinTerms = (object, SDNF_SKNF, intersection) => {
    let obj = {...object}
    for(let i = 0; i < SDNF_SKNF.length; i++) {
        for(let j = 0; j < intersection.length; j++) {
            if(differenceArrays(SDNF_SKNF[i], intersection[j]).length === 2) {
                obj[`${SDNF_SKNF[i]}`].push(intersection[j])
            }
        }
    }
    return {...obj}
}

const buildObject = (SDNF_SKNF, intersection, minTerm = false) => {
    const object = formObject(SDNF_SKNF)
    let filledObject
    if(minTerm) {
        filledObject = fillObjectMinTerms(object, SDNF_SKNF, intersection)
    } else {
        filledObject = fillObject(object, SDNF_SKNF, intersection)
    }
    return {...filledObject}
}

const minimizeByRaschMethod = (SDNF, SKNF) => {
    let intersectionOfSDNF = intersectionSDNF(SDNF)
    let copyOfSDNF = [...intersectionOfSDNF]
    if(intersectionOfSDNF.length === 1) {
        for(let i = 0; i < SDNF.length; i++) {
            if(differenceArrays(SDNF[i], intersectionOfSDNF[0]).length === SDNF[i].length) {
                copyOfSDNF.push(SDNF[i])
            }
        }
    }
    checkImplicantsSDNF(intersectionOfSDNF, copyOfSDNF)

    let intersectionOfSKNF = intersectionSDNF(SKNF)
    let copyOfSKNF = [...intersectionOfSKNF]
    if(intersectionOfSKNF.length === 1) {
        for(let i = 0; i < SKNF.length; i++) {
            if(differenceArrays(SKNF[i], intersectionOfSKNF[0]).length === SKNF[i].length) {
                copyOfSKNF.push(SKNF[i])
            }
        }
    }
    checkImplicantsSDNF(intersectionOfSKNF, copyOfSKNF, true)
}

const minimizeByMcClasky = (SDNF, SKNF) => {
    console.log('implicants')

    let intersectionOfSDNF = intersectionSDNF(SDNF)
    console.log(intersectionOfSDNF, 'MCCLASY')
    let minTermsSDNF = minimizationMcClaskySecTerm(intersectionOfSDNF)

    let objectSDNF = buildObject(SDNF, intersectionOfSDNF);

    if(minTermsSDNF.length !== 0) {
        intersectionOfSDNF = minTermsSDNF
        objectSDNF = buildObject(SDNF, intersectionOfSDNF, true)
    }

    let intersectionOfSKNF = intersectionSDNF(SKNF)
    let minTermsSKNF = minimizationMcClaskySecTerm(intersectionOfSKNF)

    let objectSKNF = buildObject(SKNF, intersectionOfSKNF)

    if(minTermsSKNF.length !== 0) {
        intersectionOfSKNF = minTermsSKNF
        objectSKNF = buildObject(SKNF, intersectionOfSKNF, true)
    }

    let tableSDNF = buildTwoDemensionTable(SDNF, intersectionOfSDNF)
    let tableSKNF = buildTwoDemensionTable(SKNF, intersectionOfSKNF)

    console.log(objectSDNF, 'object SDNF')
    console.log(objectSKNF, 'object SKNF')

    let chosenImplicantsSDNF = buildTNFByMcClasky(objectSDNF)
    console.log(chosenImplicantsSDNF, 'chosenImplicantsSDNF')
    let chosenImplicantsSKNF = buildTNFByMcClasky(objectSKNF)
    showRaschMethodRes(chosenImplicantsSDNF, intersectionOfSDNF)
    showRaschMethodRes(chosenImplicantsSKNF, intersectionOfSKNF, true)
}

const buildTNFByMcClasky = (object) => {
    let keys = Object.keys(object)
    let chosenImplicants = []
    for(let i = 0; i < keys.length; i++) {
        if(object[keys[i]].length === 1) {
            let sch = 0
            for(let j = 0; j < chosenImplicants.length; j++) {
                if(compareArrays(chosenImplicants[j], object[keys[i]][0])) {
                    continue
                } else {
                    sch++
                }
            }
            if(sch === chosenImplicants.length) {
                chosenImplicants.push(object[keys[i]][0])
            }
        }
    }
    for(let i = 0; i < keys.length; i++) {
        let sch = 0
        for(let j = 0; j < chosenImplicants.length; j++) {
            if(checkArrayIncludeArray(object[keys[i]], chosenImplicants[j])) {
                break
            } else {
                sch++
            }
        }
        if(sch === chosenImplicants.length && object[keys[i]].length > 0) {
            chosenImplicants.push(object[keys[i]][0])
        } else if(sch === chosenImplicants.length && object[keys[i]].length === 0) {
            chosenImplicants.push(keys[i].split(','))
        }
    }
    return chosenImplicants
}

const minimizationMcClaskySecTerm = (intersection) => {
    let newTerms = []
    for(let i = 0; i < intersection.length; i++) {
        for(let j = i + 1; j < intersection.length; j++) {
            if(intersection[i][0] === intersection[j][0]) {
                if(intersection[i][1][0] === '!') {
                    if(intersection[i][1].includes(intersection[j][1])) {
                        console.log(intersection[i], 'inside i')
                        console.log(intersection[j], 'inside j')
                        newTerms.push(...intersectionSDNF([intersection[i], intersection[j]]))
                    }
                } else {
                    if(intersection[j][1].includes(intersection[i][1])) {
                        newTerms.push(...intersectionSDNF([intersection[i], intersection[j]]))
                    }
                }
            } else if(intersection[i][1] === intersection[j][1]) {
                if(intersection[i][0][0] === '!') {
                    if(intersection[i][0].includes(intersection[j][0])) {
                        newTerms.push(...intersectionSDNF([intersection[i], intersection[j]]))
                    }
                } else {
                    if(intersection[j][0].includes(intersection[i][0])) {
                        newTerms.push(...intersectionSDNF([intersection[i], intersection[j]]))
                    }
                }
            }
        }
    }
    let answer = []
    for(let i = 0; i < newTerms.length; i++) {
        if(!checkArrayIncludeArray(answer, newTerms[i])) {
            answer.push(newTerms[i])
        }
    }
    return answer
}

const checkArrayIncludeArray = (chosenArray, checkedArray) => {
    for(let i = 0; i < chosenArray.length; i++) {
        if(compareArrays(chosenArray[i], checkedArray)) {
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
    for(let i = 0; i < KMap.length; i++) {
        for(let j = 0; j < KMap[i].length; j++) {
            KMap[i][j] = answers[KMap[i][j]]
        }
    }
    return KMap
}

function findGroups(map) {
    let groups = [];
    let rows = map.length;
    let cols = map[0].length;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (map[i][j] === 1) {
                let group = { ones: [], zeros: [] };
                group.ones.push([i, j]);
                let stack = [[i, j]];
                while (stack.length > 0) {
                    let [x, y] = stack.pop();
                    if (map[x][y] === 1) {
                        group.ones.push([x, y]);
                        map[x][y] = -1;
                        if (x > 0 && map[x - 1][y] === 1) stack.push([x - 1, y]);
                        if (y > 0 && map[x][y - 1] === 1) stack.push([x, y - 1]);
                        if (x < rows - 1 && map[x + 1][y] === 1) stack.push([x + 1, y]);
                        if (y < cols - 1 && map[x][y + 1] === 1) stack.push([x, y + 1]);
                    } else if (map[x][y] === 0) {
                        group.zeros.push([x, y]);
                        map[x][y] = -1;
                    }
                }
                groups.push(group);
            } else if (map[i][j] === 0) {
                let group = { ones: [], zeros: [] };
                group.zeros.push([i, j]);
                let stack = [[i, j]];
                while (stack.length > 0) {
                    let [x, y] = stack.pop();
                    if (map[x][y] === 0) {
                        group.zeros.push([x, y]);
                        map[x][y] = -1;
                        if (x > 0 && map[x - 1][y] === 0) stack.push([x - 1, y]);
                        if (y > 0 && map[x][y - 1] === 0) stack.push([x, y - 1]);
                        if (x < rows - 1 && map[x + 1][y] === 0) stack.push([x + 1, y]);
                        if (y < cols - 1 && map[x][y + 1] === 0) stack.push([x, y + 1]);
                    } else if (map[x][y] === 1) {
                        group.ones.push([x, y]);
                        map[x][y] = -1;
                    }
                }
                groups.push(group);
            }
        }
    }
    return groups;
}

const karnaughMap = (answers) => {
    let KMap = [[], []]
    KMap[0].push(0)
    KMap[0].push(1)
    KMap[0].push(3)
    KMap[0].push(2)
    KMap[1].push(4)
    KMap[1].push(5)
    KMap[1].push(7)
    KMap[1].push(6)
    console.log(KMap)
    let map = formKMap(answers, KMap)
    console.log(map)
    console.log(selectPowerOfTwoGroups(map))
    let groups = findGroups(map)

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
    return (n & (n - 1)) === 0;
}

const

const main = () => {
    let {table, answers, variables} = calculateFormula('!x1*!x2*x3+!x1*x2*!x3+!x1*x2*x3+x1*x2*!x3'); //((x1+(x2*x3))->(!x1~(!x2))) ((x1+(x2*x3))~((x1+x2)*x3)) !x1*!x2*x3+!x1*x2*!x3+!x1*x2*x3+x1*x2*!x3
    showTable(table, answers, variables)
    let SDNF = buildSDNF(table, answers, variables)
    console.log('----------------------------------------------')
    let SKNF = buildSKNF(table, answers, variables)
    console.log('----------------------------------------------')
    buildNumForm(table, answers)
    console.log('----------------------------------------------')
    buildInt(answers)

    console.log(SDNF, 'SDNF')
    console.log(SKNF, 'SKNF')

    minimizeByRaschMethod(SDNF, SKNF)
    minimizeByMcClasky(SDNF, SKNF)
    karnaughMap(answers)
}

main()
