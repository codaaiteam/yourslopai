/** @type {import('next-sitemap').IConfig} */
const languages = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de'];
const baseUrl = 'https://www.youraislopboresmegame.com';

const gamePages = [
  '/games/ai-or-human',
  '/games/ai-roast',
  '/games/story-chain',
];

const staticPages = [
  '/privacy',
  '/terms',
];

module.exports = {
  siteUrl: baseUrl,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/404', '/api/*'],
  additionalPaths: async (config) => {
    const paths = [];
    const lastmod = new Date().toISOString();

    // Language homepages
    languages.forEach(lang => {
      paths.push({ loc: `/${lang}`, priority: 1.0, changefreq: 'daily', lastmod });
    });

    // Game pages (root + each language)
    gamePages.forEach(page => {
      paths.push({ loc: page, priority: 0.9, changefreq: 'daily', lastmod });
      languages.forEach(lang => {
        paths.push({ loc: `/${lang}${page}`, priority: 0.9, changefreq: 'daily', lastmod });
      });
    });

    // Static pages (privacy, terms)
    staticPages.forEach(page => {
      paths.push({ loc: page, priority: 0.4, changefreq: 'monthly', lastmod });
    });

    return paths;
  },
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  }
};
