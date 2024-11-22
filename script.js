const inputSectionButtons = document.querySelectorAll(".input-section .currency-tabs button");
const outputSectionButtons = document.querySelectorAll(".output-section .currency-tabs button");
const inputField = document.querySelector(".input-section .amount-input");
const outputField = document.querySelector(".output-section .amount-input");
const inputRate = document.querySelector(".input-section .rate");
const outputRate = document.querySelector(".output-section .rate");

let activeInputCurrency = "RUB";
let activeOutputCurrency = "USD";

async function fetchExchangeRate(base, target) {
    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/fe04662c68541a4def0130fd/latest/${base}`);
        const data = await response.json();
        return data.conversion_rates[target];
    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        return null;
    }
}

async function updateRates() {
    if (activeInputCurrency !== activeOutputCurrency) {
        const inputToOutputRate = await fetchExchangeRate(activeInputCurrency, activeOutputCurrency);
        const outputToInputRate = await fetchExchangeRate(activeOutputCurrency, activeInputCurrency);
        inputRate.textContent = `1 ${activeInputCurrency} = ${inputToOutputRate.toFixed(4)} ${activeOutputCurrency}`;
        outputRate.textContent = `1 ${activeOutputCurrency} = ${outputToInputRate.toFixed(4)} ${activeInputCurrency}`;
    } else {
        inputRate.textContent = `1 ${activeInputCurrency} = 1 ${activeOutputCurrency}`;
        outputRate.textContent = `1 ${activeOutputCurrency} = 1 ${activeInputCurrency}`;
    }
}

async function convertInput() {
    if (activeInputCurrency !== activeOutputCurrency && inputField.value) {
        const rate = await fetchExchangeRate(activeInputCurrency, activeOutputCurrency);
        outputField.value = (parseFloat(inputField.value.replace(',', '.')) * rate).toFixed(4);
    } else {
        outputField.value = inputField.value.replace(',', '.');
    }
}

async function convertOutput() {
    if (activeInputCurrency !== activeOutputCurrency && outputField.value) {
        const rate = await fetchExchangeRate(activeOutputCurrency, activeInputCurrency);
        inputField.value = (parseFloat(outputField.value.replace(',', '.')) * rate).toFixed(4);
    } else {
        inputField.value = outputField.value.replace(',', '.');
    }
}

inputSectionButtons.forEach(button => {
    button.addEventListener("click", async (event) => {
        if (activeInputCurrency !== event.target.textContent) {
            inputSectionButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            activeInputCurrency = button.textContent;
            await updateRates();
            convertInput();
        }
    });
});

outputSectionButtons.forEach(button => {
    button.addEventListener("click", async (event) => {
        if (activeOutputCurrency !== event.target.textContent) {
            outputSectionButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            activeOutputCurrency = button.textContent;
            await updateRates();
            convertOutput();
        }
    });
});

inputField.addEventListener("input", () => {
    inputField.value = inputField.value
        .replace(',', '.')
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*?)\..*/g, '$1'); 
    
    const parts = inputField.value.split('.');
    if (parts[1] && parts[1].length > 4) {
        parts[1] = parts[1].slice(0, 4);
        inputField.value = parts.join('.');
    }
    convertInput();
});

outputField.addEventListener("input", () => {
    outputField.value = outputField.value
        .replace(',', '.')
        .replace(/[^0-9.]/g, '') 
        .replace(/(\..*?)\..*/g, '$1'); 

    const parts = outputField.value.split('.');
    if (parts[1] && parts[1].length > 4) {
        parts[1] = parts[1].slice(0, 4);
        outputField.value = parts.join('.');
    }
    convertOutput();
});

updateRates();

