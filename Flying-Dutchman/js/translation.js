// Function to toggle between languages
balance= 1000;
function toggleLanguage(selectedLanguage) {
    const languageText = {
        'English': {
            'All': 'All',
            'Beers': 'Beers',
            'Wines': 'Wines',
            'Cocktails': 'Cocktails',
            'SpecialDrinks': 'Special Drinks',
            'Logout': 'Logout',
            'Shopping Cart': 'Shopping Cart',
            'Order': 'Order',
            'Pay': 'Pay',
            'Your Balance': 'Your Balance'+' '+ balance,
            'Orders' : 'Ordes',
            'Unpaid Orders' : 'Unpaid Orders',
            'Manage Stock' : 'Manage Stock'
        },
        'Swedish': {
            'All': 'Allt',
            'Beers': 'Öl',
            'Wines': 'Viner',
            'Cocktails': 'Drinkar',
            'SpecialDrinks': 'Specialdrycker',
            'Logout': 'Logga ut',
            'Shopping Cart': 'Varukorg',
            'Order': 'Beställ',
            'Pay': 'Betala',
            'Your Balance': 'Din balans'+ ' '+ balance,
            'Orders': 'Beställningar',
            'Unpaid Orders': 'Obetalda beställningar',
            'Manage Stock': 'Hantera lager'
        }
    };

    // Helper function to safely update element text content
    function updateElementTextContent(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    // Update text content based on the selected language
    updateElementTextContent('AllTab', languageText[selectedLanguage]['All']);
    updateElementTextContent('BeersTab', languageText[selectedLanguage]['Beers']);
    updateElementTextContent('WinesTab', languageText[selectedLanguage]['Wines']);
    updateElementTextContent('CocktailsTab', languageText[selectedLanguage]['Cocktails']);
    updateElementTextContent('SpecialDrinks', languageText[selectedLanguage]['SpecialDrinks']);
    updateElementTextContent('Logout', languageText[selectedLanguage]['Logout']);
    document.querySelector('#shoppingcart-section').getElementsByTagName('h2')[0].textContent = languageText[selectedLanguage]['Shopping Cart'];
    updateElementTextContent('orderButton', languageText[selectedLanguage]['Order']);
    updateElementTextContent('payButton', languageText[selectedLanguage]['Pay']);
    updateElementTextContent('balance-display-section', languageText[selectedLanguage]['Your Balance']);
    updateElementTextContent('ordersTab', languageText[selectedLanguage]['Orders']);
    updateElementTextContent('stockTab', languageText[selectedLanguage]['Manage Stock']);
    updateElementTextContent('unpaidOrdersTab', languageText[selectedLanguage]['Unpaid Orders']);
}

document.addEventListener("DOMContentLoaded", function() {
    // Event listener for language dropdown change
    const languageDropdown = document.getElementById('languageDropdown');
    languageDropdown.addEventListener('change', function() {
        const selectedLanguage = languageDropdown.value;
        toggleLanguage(selectedLanguage);
    });

    // Initial setup
    toggleLanguage('English'); // Assuming English is the default language
});

