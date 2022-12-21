/* global Vue */ // for eslint
/* global Mastodon */ // for eslint

var app = Vue.createApp({
    el: '#app',
    data() {
        return {
            server: "",
            mastodon: undefined,
            relationships: {},
            ids: [],
            next_following_url: null,
            following_count: undefined,
            waiting: false,
            toots: undefined,
            current_account: undefined,
            user_id: undefined,
        }
    },
    async mounted() {
        this.mastodon = await Mastodon.initialize({
            app_name: 'manage-boosts',
            app_url: 'https://turn-off-boosts.jvns.ca',
            scopes: 'read follow',
        });
        if (!this.mastodon.loggedIn()) {
            return;
        }

        this.user_id = await this.get_user_id();
        this.following_count = await this.get_following_count();

        this.next_following_url = `/api/v1/accounts/${this.user_id}/following?limit=40`;
        window.addEventListener('scroll', this.handleScroll);
        // set toots = undefiend on escape press
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.toots = undefined;
            }
        });
        this.getAllRelationships();
    },


    methods: {
        logout() {
            this.mastodon.logout();
        },

        async get_user_id() {
            const response = await this.mastodon.get('/api/v1/accounts/verify_credentials');
            if (!response.ok) {
                alert('error getting user id');
            }
            const data = await response.json();
            return data.id;
        },

        async getAllRelationships() {
            while (this.next_following_url !== undefined) {
                try {
                    await this.getRelationships();
                } catch (e) {
                    console.log(e)
                }
                await this.sleep(1000);
            }
        },

        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        async getRelationships() {
            const response = await this.mastodon.get(this.next_following_url)
            if (!response.ok) {
                throw new Error('error getting relationships');
            }

            const following = await response.json();
            const following_by_id = {};
            const ids = [];
            for (const account of following) {
                ids.push(account.id);
                following_by_id[account.id] = account;
            }
            const relationships_response = await this.mastodon.get(`/api/v1/accounts/relationships?id[]=${ids.join('&id[]=')}`);
            if (!relationships_response.ok) {
                throw new Error('error getting IDs');
            }
            const relationships = await (relationships_response).json();
            for (const relationship of relationships) {
                const account = following_by_id[relationship.id];
                this.relationships[relationship.id] = {
                    id: relationship.id,
                    avatar: account.avatar,
                    username: account.username,
                    display_name: account.display_name,
                    acct: account.acct,
                    showing_reblogs: relationship.showing_reblogs,
                }
                this.ids.push(relationship.id);
            }

            try {
                this.next_following_url = response.headers.get('Link').split(',').find(link => link.includes('rel="next"')).split(';')[0].slice(1, -1);
            } catch (e) {
                this.next_following_url = undefined;
            }
        },

        random_placeholder() {
            const servers = [ "kolektiva.social", "social.coop", "fediscience.org", "mstdn.party", "toot.community", "types.pl", "macaw.social", "social.tchncs.de", "c.im", "recurse.social", "noc.social", "masto.ai", "toot.cat", "mstdn.ca", "phpc.social", "treehouse.systems", "mastodon.me.uk", "social.linux.pizza", "vis.social", "toot.cafe",
"mamot.fr", "mastodon.nz", "aus.social", "mastodon.xyz", "indieweb.social", "sfba.social", "data-folks.masto.host", "mastodon.ie", "sigmoid.social", "ioc.exchange", "mathstodon.xyz", "mastodon.world", "octodon.social", "piaille.fr", "mastodon.sdf.org",
"tech.lgbt", "mastodon.lol", "mastodon.gamedev.place", "techhub.social", "mastodon.cloud", "ruby.social", "chaos.social", "mstdn.social", "mas.to",
"mastodon.online", "fosstodon.org", "infosec.exchange", "hachyderm.io", "mastodon.social"]
            return servers[Math.floor(Math.random() * servers.length)];
        },

        async showBoosts(id) {
            const relationship = this.relationships[id];
            relationship.showing_reblogs = true;
            const response = await (await this.mastodon.post(`/api/v1/accounts/${id}/follow`, {
                reblogs: true,
            })).json();
            if (response.error) {
                alert(response.error);
            }
        },

        async hideBoosts(id) {
            const relationship = this.relationships[id];
            relationship.showing_reblogs = false;
            const response = await this.mastodon.post(`/api/v1/accounts/${id}/follow`, {
                reblogs: false,
            });
            if (response.json().error) {
                alert(response.error);
            }
        },

        async previewToots(id) {
            this.current_account = id;
            const toots = await (await this.mastodon.get(`/api/v1/accounts/${id}/statuses?limit=20`)).json();
            console.log(toots);
            // filter out everything but boosts
            this.toots = [];
            for (const toot of toots) {
                if (toot.reblog) {
                    this.toots.push(toot.reblog);
                }
            }
        },

        async get_following_count() {
            // get number of people user is following
            // GET https://mastodon.social/api/v1/accounts/219022
            const response = await this.mastodon.get(`/api/v1/accounts/${this.user_id}`);
            const data = await response.json();
            return data.following_count;
        },

        login: async function() {
            const server = this.server;
            if (server == "") {
                alert("Please enter a server address");
                return;
            }

            await this.mastodon.login("https://" + server);
        },
    }
})


app.mount('#app')
