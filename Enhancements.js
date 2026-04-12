/* * RIDH FINANCE - ENHANCEMENTS
 * * This script extends your existing logic to add:
 * 1. Account Flags (Disabled, Exclude Networth, Business Separation)
 * 2. Analytics multi-category filter
 * 3. Networth blank page fix
 */

// --- 1. Account Calculation Logic Updates ---
function calculateAdvancedNetWorth(accounts) {
    let netWorth = 0;
    let assets = 0;
    let liabilities = 0;
    
    accounts.forEach(acc => {
        // Check flags (default to false if they don't exist yet)
        const isDisabled = acc.isDisabled || false;
        const excludeNetworth = acc.excludeNetworth || false;
        
        if (!isDisabled && !excludeNetworth) {
            netWorth += acc.balance;
            if (acc.balance >= 0) {
                assets += acc.balance;
            } else {
                liabilities += Math.abs(acc.balance);
            }
        }
    });
    
    return { netWorth, assets, liabilities };
}

function calculateAdvancedIncomeExpense(transactions, accounts) {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
        const account = accounts.find(a => a.id === transaction.accountId);
        
        // Skip transactions that belong to a business account
        if (account && account.isBusiness) return;

        if (transaction.type === 'income') totalIncome += transaction.amount;
        if (transaction.type === 'expense') totalExpense += transaction.amount;
    });
    
    return { totalIncome, totalExpense };
}

// --- 2. Analytics Multi-Filter Logic ---
function filterTransactionsByMultipleCategories(allTransactions, selectedCategoriesArray) {
    return allTransactions.filter(t => {
        if (!selectedCategoriesArray || selectedCategoriesArray.length === 0) return true;
        return selectedCategoriesArray.includes(t.category);
    });
}

// --- 3. Networth Tab Fix ---
function renderNetworthTab(accounts) {
    const networthDiv = document.getElementById('analytics-networth-tab');
    if (!networthDiv) {
        console.error("Missing '<div id=\"analytics-networth-tab\"></div>' in your HTML");
        return;
    }
    
    const { netWorth, assets, liabilities } = calculateAdvancedNetWorth(accounts);
    
    networthDiv.innerHTML = `
        <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-top: 15px;">
            <h3 style="margin-bottom: 15px;">Net Worth Overview</h3>
            <p style="font-size: 1.2em;"><strong>Total Net Worth:</strong> $${netWorth.toFixed(2)}</p>
            <div style="display: flex; justify-content: space-between; margin-top: 10px; color: #555;">
                <span style="color: green;">Assets: $${assets.toFixed(2)}</span>
                <span style="color: red;">Liabilities: $${liabilities.toFixed(2)}</span>
            </div>
        </div>
    `;
}
