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
    for (let i = 0; i < answers.length; i++) {
        if (answers[i] === 0) {
            answer += " ("
            for (let j = 0; j < table[i].length; j++) {
                if (table[i][j] === 1) {
                    answer += `!${variables[j]}`
                    if (j !== table[i].length - 1) {
                        answer += " \\/ "
                    }
                } else if (table[i][j] === 0) {
                    answer += variables[j]
                    if (j !== table[i].length - 1) {
                        answer += " \\/ "
                    }
                }
            }
            answer += ") /\\"
        }
    }
    answer = answer.substring(0, answer.length - 2)
    console.log(answer)
}

const buildSDNF = (table, answers, variables) => {
    let answer = ""
    for (let i = 0; i < answers.length; i++) {
        if (answers[i] === 1) {
            answer += " ("
            for (let j = 0; j < table[i].length; j++) {
                if (table[i][j] === 0) {
                    answer += `!${variables[j]}`
                    if (j !== table[i].length - 1) {
                        answer += " /\\ "
                    }
                } else if (table[i][j] === 1) {
                    answer += variables[j]
                    if (j !== table[i].length - 1) {
                        answer += " /\\ "
                    }
                }
            }
            answer += ") \\/"
        }
    }
    answer = answer.substring(0, answer.length - 2)
    console.log(answer)
}

const buildNumForm = (table, answers) => {
    console.log('SKNF - ')
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
    console.log('SDNF - ')
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

const checkIndexArray = (array) => {
    let count = 0
    for (let i of array) {
        if (i) {
            count++
        }
    }
    return count
}

const sortRowsWithOne = (table, answers) => {
    let rows = []
    for (let i = 0; i < answers.length; i++) {
        if (answers[i]) {
            rows.push(table[i])
        }
    }
    let indexesOfRows = []
    for (let i = 0; i < rows.length; i++) {
        indexesOfRows.push(checkIndexArray(rows[i]))
    }
    for (let i = 0; i < indexesOfRows.length; i++) {
        for (let j = i + 1; j < indexesOfRows.length; j++) {
            if (indexesOfRows[i] > indexesOfRows[j]) {
                let tmp = indexesOfRows[i]
                let tmpArr = rows[i]
                indexesOfRows[i] = indexesOfRows[j]
                rows[i] = rows[j]
                indexesOfRows[j] = tmp
                rows[j] = tmpArr
            }
        }
    }
    return rows
}

const joinIntoGroups = (rows) => {
    let groupsCount = checkIndexArray(rows[rows.length - 1])
    if (checkIndexArray(rows[0]) === 0) {
        groupsCount++
    } else if (checkIndexArray(rows[rows.length - 1]) === rows.length) {
        groupsCount++
    }
    let prevGroupEnd = 0
    let groups = []
    for (let i = 0; i < groupsCount; i++) {
        let group = []
        for (let j = prevGroupEnd; j < rows.length; j++) {
            if (j === rows.length - 1) {
                group.push(rows[j])
            } else if (checkIndexArray(rows[j]) !== checkIndexArray(rows[j + 1])) {
                group.push(rows[j])
                prevGroupEnd = j + 1
                break
            } else {
                group.push(rows[j])
            }
        }
        groups.push(group)
    }
    return groups
}

const createToken = (index, length) => {
    let str = ""
    for (let i = 0; i < length; i++) {
        if (i !== index) {
            str += "_"
        } else {
            str += "x"
        }
    }
    return str
}

const buildTokensObject = (groups) => {
    let tokenLength = groups[0][0].length
    let tokens = []
    let obj = {}
    for (let i = 0; i < tokenLength; i++) {
        let token = createToken(i, tokenLength)
        tokens.push(token)
        obj[token] = []
    }
    return {tokens, obj}
}

const compareTwoRows = (row1, row2) => {
    let difference = 0;
    let indexes = []
    for (let i = 0; i < row1.length; i++) {
        if (row1[i] !== row2[i]) {
            indexes.push(i)
            difference++
        }
    }
    if (difference === 1) {
        return {result: true, index: indexes[0]}
    } else {
        return {result: false, index: -1}
    }
}

let buildAnswersBetweenGroups = (groups) => {
    let answersGroup = []
    let answers = []
    for (let i = 0; i < groups.length; i++) {
        if (groups[i + 1]) {
            for (let j = 0; j < groups[i].length; j++) {
                for (let k = 0; k < groups[i + 1].length; k++) {
                    let resComparing = compareTwoRows(groups[i][j], groups[i + 1][k])
                    if (resComparing.result) {
                        let group = []
                        group.push([...groups[i][j]])
                        group.push([...groups[i + 1][k]])
                        answersGroup.push(group)
                        let copyRow = [...groups[i][j]]
                        copyRow[resComparing.index] = 'x'
                        answers.push(copyRow)
                    }
                }
            }
        }
    }
    console.log(answersGroup, 'ansGroup')
    console.log(answers, 'just answers')
    return {answers, answersGroup}
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

const findKernels = (groups, groupAnswers) => {
    console.log(groupAnswers, 'kernels group answers')
    let kernels = []
    for (let i = 0; i < groups.length; i++) {
        for (let j = 0; j < groups[i].length; j++) {
            if (compareRowWithGroupAnswers(groups[i][j], groupAnswers)) {
                kernels.push([...groups[i][j]])
            }
        }
    }
    console.log(kernels, 'kernels')
}

const compareRowWithGroupAnswers = (row, groupAnswers) => {
    let count = 0
    for (let i = 0; i < groupAnswers.length; i++) {
        for (let answer of groupAnswers[i]) {
            if (compareArrays(row, answer)) {
                count++
            }
        }
    }
    let ans = count === 1
    return ans
}

const compareRowWithToken = (token, row) => {
    let ans = row.indexOf('x') === token.indexOf('x')
    return ans
}

const distributeForGroups = ({tokens, obj}, answersBetween) => {
    for (let i = 0; i < tokens.length; i++) {
        for (let j = 0; j < answersBetween.answers.length; j++) {
            if (compareRowWithToken(tokens[i], answersBetween.answers[j])) {
                obj[tokens[i]].push(answersBetween.answers[j])
            }
        }
    }
    console.log(obj, 'objX')
}

const minimizeAnswers = (answers) => {
    console.log(answers, 'testAnswers')
    let minimizedAnswers = []
    for (let i = 0; i < answers.length; i++) {
        for (let j = i + 1; j < answers.length; j++) {
            if (answers[i].indexOf('x') === answers[j].indexOf('x')) {
                let tempArr = []
                for (let k = 0; k < answers[i].length; k++) {
                    if (answers[i][k] === answers[j][k]) {
                        tempArr.push(answers[i][k])
                    } else {
                        tempArr.push('x')
                    }
                }
                minimizedAnswers.push([...tempArr])
            }
        }
    }
    let readyMinimizedAnswers = []
    if (minimizedAnswers.length) {
        readyMinimizedAnswers.push(minimizedAnswers[0])
        for (let i = 0; i < minimizedAnswers.length; i++) {
            let count = 0
            for (let j = 0; j < minimizedAnswers[i].length; j++) {
                if (minimizedAnswers[i][j] === "x") {
                    count++
                }
            }
            if (count === minimizedAnswers[0].length) {
                minimizedAnswers.splice(i, 1)
            }
        }

    }
    for (let i = 1; i < minimizedAnswers.length; i++) {
        let sch = 0
        for (let j = 0; j < readyMinimizedAnswers.length; j++) {
            if (!compareArrays(minimizedAnswers, readyMinimizedAnswers)) {
                sch++
            }
        }
        if (sch === readyMinimizedAnswers.length - 1) {
            readyMinimizedAnswers.push(minimizedAnswers[i])
        }
    }
    console.log(readyMinimizedAnswers, 'readyMinAnswers')
    return readyMinimizedAnswers
}

const buildAnsObject = (table, answers, minimizedAnswers) => {
    let rows = []
    for (let i = 0; i < table.length; i++) {
        if (answers[i] === 1) {
            rows.push([...table[i]])
        }
    }
    let obj = {}
    for (let i = 0; i < rows.length; i++) {
        obj[`${rows[i].join('')}`] = []
    }
    return divisionOnGroups(obj, rows, minimizedAnswers)
}

const divisionOnGroups = (obj, rows, minimizedAnswers) => {
    for (let i = 0; i < rows.length; i++) {
        obj[`${rows[i].join('')}`] = [...checkOnX(minimizedAnswers, rows[i])]
    }
    return {obj, rows}
}

const checkOnX = (minimizedAnswers, row) => {
    let answer = []
    for (let i = 0; i < minimizedAnswers.length; i++) {
        let sch = 0
        for (let j = 0; j < minimizedAnswers[i].length; j++) {
            if (minimizedAnswers[i][j] !== 'x' && row[j] === minimizedAnswers[i][j]) {
                sch++
            }
        }
        if (sch === 1) {
            answer.push([...minimizedAnswers[i]])
        }
    }
    return answer
}

const buildMinFormula = (obj, rows) => {
    console.log(obj, rows, 'dsadsada')
    let ans = []
    for (let row of rows) {
        if (obj[row.join('')].length === 1) {
            let sch = 0
            for (let i = 0; i < ans.length; i++) {
                if (compareArrays(obj[row.join((''))][0], ans[i])) {
                    sch++
                }
            }
            if (!sch) {
                ans.push([...obj[row.join('')][0]])
            }
        }
    }
    console.log(ans, 'build min formula ans')
    return ans
}

const displayMinFormula = (finishAnswer, variables, answers, rows) => {
    let minFormula = ""
    if (finishAnswer.length) {
        for (let i = 0; i < finishAnswer.length; i++) {
            for (let j = 0; j < finishAnswer[i].length; j++) {
                if (finishAnswer[i][j] !== 'x') {
                    if(finishAnswer[i][j] === 0) {
                        minFormula += `!${variables[j]}`
                    } else {
                        minFormula += variables[j]
                    }
                }
            }
            if (i !== finishAnswer.length - 1) {
                minFormula += ' + '
            }
        }
    } else {
        let ansArray = buildAnsObjectWithComparing(answers, finishAnswer, rows)
        for(let i = 0; i < ansArray.length; i++) {
            for(let j = 0; j < ansArray[i].length; j++) {
                if(ansArray[i][j] !== 'x') {
                    if(ansArray[i][j] === 0) {
                        minFormula += `!${variables[j]}`
                    } else {
                        minFormula += variables[j]
                    }
                }
            }
            if (i !== ansArray.length - 1) {
                minFormula += ' + '
            }
        }
    }

    console.log(minFormula, 'here')
}

const buildAnsObjectWithComparing = (answers, finishAnswer, rows) => {
    let ansObj = {}
    for (let row of rows) {
        ansObj[`${row.join('')}`] = []
    }
    for(let i = 0; i < rows.length; i++) {
        for(let j = 0; j < answers.length; j++) {
            if(compareRowWithAnswers(rows[i], answers[j])) {
                ansObj[`${rows[i].join('')}`].push(answers[j])
            }
        }
    }
    console.log(ansObj, 'cola')
    let ansArray = []
    for(let key in ansObj) {
        if(ansObj[`${key}`].length === 1) {
            ansArray.push(ansObj[`${key}`][0])
        }
    }
    for(let key in ansObj) {
        if(ansObj[`${key}`].length > 1) {
            if(!findGeneralPartOfTwoArrays(ansObj[`${key}`], ansArray)) {
                ansArray.push(ansObj[`${key}`][0])
            } else {
                continue;
            }
        }
    }
    return [...ansArray]
}

const findGeneralPartOfTwoArrays = (array1, array2) => {
    for(let arr1 of array1) {
        for(let arr2 of array2) {
            if(findArrayInArray(arr1, arr2)) {
                return true
            }
        }
    }
    return false
}

const findArrayInArray = (findingElement, array) => {
    for(let arr of array) {
        if(compareArrays(findingElement, arr)) {
            return true
        }
    }
    return false
}

const compareRowWithAnswers = (row, answer) => {
    let count = 0
    for (let i = 0; i < answer.length; i++) {
        if (answer[i] === row[i]) {
            count++
        }
    }
    if (count === 2) {
         return true
    } else {
        return false
    }
}

const main = () => {
    let stackVariables = []
    let stackSigns = []
    let variables = []
    let formula = decodeFormula('((x1+(x2*(!x3)))->((x1~(!x2)*x3)))') //'((1*1)*(1->(!1)))'  ((x1+(x2*(!x3)))->((x1~(!x2))))  ((x1+(!x2*x3))->((!x1~x2)))
    stackVariables = buildStacks(stackVariables, stackSigns, formula)
    variables = stackVariables.slice(0)
    let table = buildTable(stackVariables.length)

    let answers = buildAnswers(formula, stackSigns, stackVariables, table)
    showTable(table, answers, variables)
    buildSDNF(table, answers, variables)
    console.log('----------------------------------------------')
    buildSKNF(table, answers, variables)
    console.log('----------------------------------------------')
    buildNumForm(table, answers)
    console.log('----------------------------------------------')
    buildInt(answers)
    let sortRows = sortRowsWithOne(table, answers)
    let groups = joinIntoGroups(sortRows)
    console.log(groups)
    let tokensObj = buildTokensObject(groups)
    let answersBetweenGroups = buildAnswersBetweenGroups(groups)
    distributeForGroups(tokensObj, answersBetweenGroups)
    findKernels(groups, answersBetweenGroups.answersGroup)
    let minimizedAnswers = minimizeAnswers(answersBetweenGroups.answers)
    let answer = buildAnsObject(table, answers, minimizedAnswers)
    let finishAnswer = buildMinFormula(answer.obj, answer.rows)
    displayMinFormula(finishAnswer, variables, answersBetweenGroups.answers, table)
}

main()

/*const TestingFunction = () => {
    /!*let stackSigns = []
    let stackVariables = []
    let formula = decodeFormula('((1+(1*(!0)))->((1~1)*0))')
    stackVariables = buildStacks(stackVariables, stackSigns, formula)
    let ans = calculate(formula, stackVariables, stackSigns)
    console.log(ans)*!/
    let ans = Number(Conjuction("0", 1))
    console.log(ans)
}

TestingFunction()*/

