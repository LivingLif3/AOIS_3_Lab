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

const checkImplicantsSDNF = (SDNF, sknf = false) => {
    let substitutions = []

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
    console.log(substitutions, 'substitutions')
    let answer = reductionImplicants(SDNF, substitutions)
    let buildImplicants = []
    for(let i = 0; i < SDNF.length; i++) {
        if(answer[i]) {
            buildImplicants.push(SDNF[i])
        }
    }
    showRaschMethodRes(buildImplicants, SDNF, sknf)
}

const showRaschMethodRes = (buildImplicants, implicants, sknf = false) => {
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
    console.log(ans, 'dsada')
    for(let row of ans) {
        for(let i = 0; i < row.length; i++) {
            if(row[i].indexOf(0) !== -1) {
                row.splice(i, 1)
                i = -1
            }
        }
    }
    console.log(ans, 'after')
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
    let answer = []
    for(let i = 0; i < rowResults.length; i++) {
        let keys = Object.keys(rowResults[i])
        let sch = 0
        for(let j = 0; j < keys.length; j++) {
            sch += rowResults[i][`${keys[j]}`]
        }
        if(sch !== 0) {
            answer.push(true)
        } else {
            answer.push(false)
        }
    }
    return answer
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

const buildObject = (SDNF_SKNF, intersection) => {
    const object = formObject(SDNF_SKNF)
    const filledObject = fillObject(object, SDNF_SKNF, intersection)
    return {...filledObject}
}

const minimizeByRaschMethod = (SDNF, SKNF) => {
    let intersectionOfSDNF = intersectionSDNF(SDNF)
    checkImplicantsSDNF(intersectionOfSDNF)
    let intersectionOfSKNF = intersectionSDNF(SKNF)
    checkImplicantsSDNF(intersectionOfSKNF, true)
}

const minimizeByMcClasky = (SDNF, SKNF) => {
    let intersectionOfSDNF = intersectionSDNF(SDNF)
    let intersectionOfSKNF = intersectionSDNF(SKNF)

    console.log(intersectionOfSDNF, 'intersectionOfSDNF')

    let tableSDNF = buildTwoDemensionTable(SDNF, intersectionOfSDNF)
    let tableSKNF = buildTwoDemensionTable(SKNF, intersectionOfSKNF)

    console.log(buildObject(SDNF, intersectionOfSDNF))

    let ans = differenceArrays(SDNF[0], intersectionOfSDNF[0])
}

const main = () => {
    let {table, answers, variables} = calculateFormula('((x1+(x2*x3))~((x1+x2)*x3))'); //((x1+(x2*x3))->(!x1~(!x2)))
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
}

main()
