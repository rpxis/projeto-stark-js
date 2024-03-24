const search = document.querySelector('#search')
const containerBodycryptos = document.querySelector('#container-cryptos')
const entry = document.querySelector('#entry')
const output = document.querySelector('#output')
const selectEntry = document.querySelector('#coin-select-entry')
const selectOutput = document.querySelector('#coin-select-output')
const moreCripto = document.querySelector('.text-more')
const coinsList = []
const coinsListCompare = []

const options = {
    headers: {
        'Content-Type': 'application/json',
        'x-access-token': 'coinranking007284287894b53ec7d35dbdab74fb7c8c373a9d29af2611',
    },
}

const optionsCompare = {
    method: 'GET',
    headers: { "Content-type": "application/json charset=UTF-8", "authorization": "Apikey 1fbf58e4ca5f202193fb70f8dcb4fca40bcdd5d7a50b615023a2dbadd4127aae" },
}

moreCripto.addEventListener('click', (e) => {
    e.target.style.display = 'none'
    topCryptos(`?limit=20`)
})
search.addEventListener('keypress', searchCoin)
entry.addEventListener('input', checkInput)
output.addEventListener('input', checkInput)

selectEntry.addEventListener('change', (e) => {
    trocarValuesOptions(e.target, false)
    entry.value ? checkInput(e):''
})
selectOutput.addEventListener('change', (e) => {
    trocarValuesOptions(e.target, false) 
    output.value ? checkInput(e):''
})
    

function trocarValuesOptions(e, check) {
    if (check) {
        selectEntry[0].textContent = selectEntry.value
        selectOutput[0].textContent = selectOutput.value
        return
    }

    const selectedCoinsList = (e.id === "coin-select-output") ? [
        { symbol: 'BRL', name: 'Brazilian Real' },
        { symbol: 'USD', name: 'United States Dollar' },
        { symbol: 'EUR', name: 'Euro' }
        
    ] : coinsList[0]
    const symbolSelecionado = e.value
    const optionsSelect = e.options
   
    
    Array.from(optionsSelect).forEach(option => {
        if (option.value === symbolSelecionado) {
            option.textContent = symbolSelecionado
        } else {
            const coinName = selectedCoinsList.find(coin => coin.symbol === option.value).name
            option.textContent = coinName
        }
    })

}


async function gerarListCryptosDescription() {

    const response = await fetch('https://min-api.cryptocompare.com/data/all/coinlist', optionsCompare)
    const data = await response.json()
    coinsListCompare.push(data.Data)
}

function formatDescription(description, caractere) {
    const newDescription = description.split(caractere)
    return newDescription.length > 1 ? `${newDescription[0]}.` : caractere
}


function gerarCoins(coin) {
    const now = new Date()
    const hour = now.getHours()
    const minute = now.getMinutes()


    let coinChangeTrue = coin.change

    const filteredCoinsChange = coin.change ? '' : coinsList[0].filter(elementCoin => elementCoin.name.toLowerCase().includes(search.value.toLowerCase()))
    filteredCoinsChange ? filteredCoinsChange.forEach(coinElement => { coinElement.name == coin.name ? coinChangeTrue = coinElement.change : '' }) : ''
    const colorCota = coinChangeTrue > 0 ? 'positive' : 'negative'

    let coinDescription = ''
    if (coinsListCompare[0][coin.symbol.toUpperCase()]) {
        coinDescription = coinsListCompare[0][coin.symbol.toUpperCase()]['Description']
        coinDescription = coinDescription ? formatDescription(coinDescription, '.') : 'Descrição não encontrada'
    } else {
        coinDescription = 'Descrição não encontrada'
    }
    let coinHTML = `<div class="crypto-card">
                        <div class="crypto-header">
                            <div class="crypto-logo"><img src="${coin.iconUrl}" alt="Logo ${coin.name}"></div>
                        </div>
                        <div class="crypto-info">
                            <div class="crypto-details">
                            <div class="crypto-name"><span class="text-crypto">${coin.name}</span></div>
                            <div class="crypto-symbol"><span class="text-symbol">${coin.symbol}</span></div>
                            </div>
                            <div class="crypto-change ${coinChangeTrue ? colorCota : ''}"><span>${colorCota == 'positive' ? '+' : ''}${coinChangeTrue ? coinChangeTrue : '--%'}</span></div>
                        </div>
                        <div class="crypto-static">
                            <div class="crypto-price"><span class="text-price">$${Number(coin.price).toFixed(2)}</span></div>

                        </div>
                        <button class="btn-description"">Descrição</button>

                        <div class="container-crypto-description">
                        <div class="btn-back">
                            <span>Voltar</span>
                         </div>

                         <div class="text-description">
                                ${coinDescription}
                         </div>
                        </div> 
                        <div class="time">Ultima atualização: Hoje ás ${hour}:${minute}</div>  
                    </div>      
                `


    return coinHTML
}


function gerarOptions(optionSelect) {
    return `<option value="${optionSelect.symbol}">${optionSelect.name}</option>`
}


async function reqCryptos(coin, url = '?limit=12') {

    const checkCoin = coin ? `https://api.coinranking.com/v2/search-suggestions?query=${coin}` : `https://api.coinranking.com/v2/coins${url}`
    const response = await fetch(checkCoin, options)
    const results = await response.json()
    coin == "" && url == "" ? coinsList.push(results.data.coins) : ''

    return results
}


async function topCryptos(quantity) {
    await gerarListCryptosDescription()
    const listCoins = await reqCryptos("", quantity)
    const criptomoedasTop = listCoins.data.coins.map(gerarCoins).join('')
    containerBodycryptos.innerHTML = criptomoedasTop
}

async function selectValues() {
    const listSelectCoins = await reqCryptos("", "")
    const selectCoins = listSelectCoins.data.coins.map(gerarOptions).join('')
    selectEntry.innerHTML = selectCoins

}


async function searchCoin(e) {
    if (e.key === "Enter") {
        const rCoins = await reqCryptos(search.value)
        if (rCoins.data.coins.length === 0) {
            containerBodycryptos.innerHTML = "Moeda não encontrada!"
            moreCripto.style.display = 'none'
        } else {
            const criptomoedasSearch = rCoins.data.coins.map(gerarCoins).join('')
            containerBodycryptos.innerHTML = criptomoedasSearch
            getButtons()
        }
    }
}



function setInputs(conversion, input) {
    if (input == 1) {
        output.value = conversion[selectOutput.value].toFixed(2)


    }
    else {

        entry.value = conversion[selectEntry.value].toFixed(2)
    }
}


async function reqConversion(coin, number) {
    const response = await fetch(`https://api.coinconvert.net/convert/${coin}?amount=${number}`)
    const data = await response.json()
    if (data.status != "success") {
        alert("Moeda não encontrada!")
        window.location.reload()
    } else {
        return data
    }
}


async function checkInput(e) {
    let qtd = 0
    let input = 0
    let conversion

    if (e.target.id === 'entry' || e.target.id === "coin-select-entry" || e.target.id === "coin-select-output")  {
        qtd = entry.value 
        if (qtd == 0){
            output.value = 0
            return
        }
        const coins = `${selectEntry.value}/${selectOutput.value}`
        const coinsLower = coins.toLowerCase()
        conversion = await reqConversion(coinsLower, qtd)
        input = 1

    } else {
        qtd = output.value
        if (qtd == 0){
            entry.value = 0
            return
        }
        const coins = `${selectOutput.value}/${selectEntry.value}`
        const coinsLower = coins.toLowerCase()
        conversion = await reqConversion(coinsLower, qtd)
        input = 2

    }
    setInputs(conversion, input)
}

function seeDescription(e) {

    const cryptoCard = e.target.closest('.crypto-card')
    const cryptoDescription = cryptoCard.querySelector('.container-crypto-description')
    cryptoDescription.style.display = 'block'


    const allDescriptions = document.querySelectorAll('.container-crypto-description')
    allDescriptions.forEach(description => {
        if (description !== cryptoDescription) {
            description.style.display = 'none'
        }
    })
}

function hideDescription(e) {
    const cryptoCard = e.target.closest('.crypto-card')
    const cryptoDescription = cryptoCard.querySelector('.container-crypto-description')
    cryptoDescription.style.display = 'none'
}



function getButtons() {
    const buttonDesc = document.querySelectorAll('.btn-description')
    buttonDesc.forEach(button => {
        button.addEventListener('click', seeDescription)
    })

    const buttonBack = document.querySelectorAll('.btn-back')
    buttonBack.forEach(button => {
        button.addEventListener('click', hideDescription)
    })
}

async function main() {
    await topCryptos()
    moreCripto.style.display = 'block'
    await selectValues()
    trocarValuesOptions('', true)
    getButtons()
}
main()
