//Still writing this codes for Production


const { SportsClient } = require('./src/sportsClient');
const { VERSION, DEFAULT_CONFIG } = require('./src/types');


class SportsSDK {
  constructor(config = {}) {
    this.config = {
      baseURL: 'https://www.xtrstudios.site',
      timeout: 30000,
      cacheEnabled: true,
      ...config
    };
    
    this.client = new SportsClient(this.config);
    this.version = VERSION;
  }


  async initialize() {
    try {
      const healthCheck = await this.client.healthCheck();
      console.log(`Sports SDK v${VERSION} initialized successfully`);
      return healthCheck;
    } catch (error) {
      console.error('Failed to initialize Sports SDK:', error);
      throw error;
    }
  }


  async getEvents(category = null) {
    return this.client.getEvents(category);
  }


  async getLiveEvents() {
    return this.client.getLiveEvents();
  }


  async getUpcomingEvents() {
    return this.client.getUpcomingEvents();
  }

  async getHighlights(eventId = null) {
    return this.client.getHighlights(eventId);
  }


  async getSportsNews(limit = 20) {
    return this.client.getSportsNews(limit);
  }


  async getTeams(league = null) {
    return this.client.getTeams(league);
  }

  async search(query) {
    return this.client.searchSports(query);
  }
}


function createSportsClient(config = {}) {
  return new SportsSDK(config);
}


module.exports = {
  SportsSDK,
  SportsClient,
  createSportsClient,
  VERSION,
  DEFAULT_CONFIG
};


module.exports.default = createSportsClient;
