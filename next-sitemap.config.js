/** @type {import('next-sitemap').IConfig} */
const languages = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de'];
const baseUrl = 'https://yourslopai.com';

module.exports = {
  siteUrl: baseUrl,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/404'],
  additionalPaths: async (config) => {
    const paths = [];

    languages.forEach(lang => {
      paths.push({
        loc: `/${lang}`,
        priority: 1.0,
        changefreq: 'daily',
        lastmod: new Date().toISOString()
      });
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
