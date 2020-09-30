const { pathToFileURL } = require('url');

class InstagramBot{
    constructor(){
        this.firebase = require('./firebase_db');
        this.config = require('./config/puppeteer.json');
    }

    async initPuppeteer(){
        const puppeteer = require('puppeteer');
        this.browser = await puppeteer.launch({
            headless: this.config.settings.headless
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({width: 1500, height:764});
    }

    async visitInstagram(){
        //On va sur la page d'accueil qui propose directement l'identification
        await this.page.goto(this.config.base_url);
        //On rentre les credentials
        //Username
        await this.page.waitForTimeout(2500);
        await this.page.click(this.config.selectors.username_field);
        await this.page.keyboard.type(this.config.username);
        //Password
        await this.page.click(this.config.selectors.password_field);
        await this.page.keyboard.type(this.config.password);
        //On submit le form pour se connecter
        await this.page.click(this.config.selectors.login_button);
        //On clique sur Plus tard pour ne pas enregistrer les credentials
        await this.page.waitForNavigation();
        await this.page.waitForTimeout(2500);
        await this.page.click(this.config.selectors.record_later_button);
        //On clique sur Plus tard pour ne pas recevoir les notifications
        await this.page.waitForNavigation();
        await this.page.waitForTimeout(2500);
        await this.page.click(this.config.selectors.set_notifications_later_button);

    }

    async searchTag(){
        await this.page.waitForTimeout(2000);
        let  instagramUsers = new Map();
        const tagsToSearch = {'a': 'rock', 'b': 'hobbits', 'c' : 'ski'};
        let num_publications = this.config.settings.max_amount_publications;

        //Autre méthode : On fixe l'index de la ligne et de la colonne de la publication de départ, mais qui ne changera pas
            //const rowIndex = 1; 
            //const cellIndex = 1;
             //replace("ROWINDEX", rowIndex).replace("CELLINDEX", cellIndex);

        for(const [key, value] of Object.entries(tagsToSearch)){
            let searchUrl = `https://www.instagram.com/explore/tags/${value}/`;
            await this.page.goto(searchUrl);
            await this.page.waitForTimeout(3000);
            //On clique sur la 1ère publication
            await this.page.click(this.config.selectors.first_publication_link);
            await this.page.waitForTimeout(2500);

            for(let i = 1; i < num_publications; i++){             
                let colorLikeButton = await this.page.evaluate((x) => {
                    return document.querySelector(x).getAttribute('fill');
                }, this.config.selectors.like_button_svg);
                let followStatus = await this.page.evaluate((x) => {
                    return document.querySelector(x).innerHTML;
                }, this.config.selectors.follow_button_status);
                
                //On like si on n'a pas déjà liké
                if(colorLikeButton != "#ed4956"){
                    await this.page.waitForTimeout(1500);
                    await this.page.click(this.config.selectors.like_button);
                    //On follow que si on n'est pas abonné
                    if(followStatus != "Abonné(e)"){
                        await this.page.waitForTimeout(1500);
                        await this.page.click(this.config.selectors.follow_button);
                        let username = await this.page.evaluate((x) => {
                            return document.querySelector(x).innerHTML;
                        }, this.config.selectors.username);

                        instagramUsers['name'] = username; 
                        console.log('Résulat ', username);
                        this.firebase.writeUserData(instagramUsers);
                    }
                }
                
                //On va à la publication suivante
                await this.page.waitForTimeout(1500);
                await this.page.click(this.config.selectors.right_pagination_button);
                await this.page.waitForTimeout(2500);
    
            }
            //Une fois les 9 publications traitées, on revient sur la page
            await this.page.click('body');
            console.log('Tableau ', instagramUsers);                       
        }    
    }

    async closeBrowser(){
        browser.close();
    }
}

module.exports = InstagramBot;