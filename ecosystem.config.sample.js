module.exports = {
  apps: [
    {
      name: "trollbildir",
      script: "./server/app.js",
      watch: true,
      env_production: {
        "PORT": 8081,
        "NODE_ENV": "production",
        "DOMAIN": "http://localhost",
        "SESSION_SECRET": "",
        "TWITTER_ID": "",
        "TWITTER_SECRET": "",
        "TWITTER_MASTER": "",
    	  "MAIL_HOST": "smtp.zoho.eu",
    	  "MAIL_PORT": 465,
    	  "MAIL_USER": "",
    	  "MAIL_PASS": "",
    	  "MAIL_FROM": "",         
        "SPAM_ROUTE": "",
        "SPAM_LIMIT_PER_APP": 900000,
        "SPAM_LIMIT_PER_USER": 900,
        "REDIRECT_URL": "https://twitter.com/isimsizhareket",
        "MONGODB_URI": "mongodb://admin:admin@localhost/trollbildir?authSource=admin",
        "BLOCK_URL": "http://localhost:8080/api/blocks",
        "BLOCK_ROUTE": ""
      }
    }
  ]
}
