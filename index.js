const Bot = require('./Bot');

const run = async () => {
    const bot = new Bot;

    await bot.initPuppeteer().then(()=>console.log('Puppeteer est exécuté!'));
    await bot.visitInstagram().then(()=>console.log('Connexion à Instagram réussie!'));
    await bot.searchTag().then(()=>console.log('Recherche des 9 publications réussie!'));
    //await bot.parseUsername().then(()=>console.log('Username a été parsé!'));
    //await bot.closeBrowser().then(()=>console.log('Navigateur a été fermé!'));
}

run().catch(e=>console.log(e.message));